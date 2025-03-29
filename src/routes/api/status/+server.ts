import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { ContainerStatus } from '$lib/types/docker';
import mongoose from 'mongoose';
import { Container } from '$lib/db/uptimeSchema';
import * as http from 'http';
import { env } from '$env/dynamic/private';
import { requireApiKey } from '$lib/server/auth';
import { allowedContainers } from '$lib/config/containers';
import { cache } from '$lib/server/cache';

let isConnected = false;

// Define a constant for the maximum age of data to keep (30 days)
const MAX_DATA_AGE_DAYS = 30;

const connectDB = async () => {
    if (!env.MONGODB_URI) {
        console.error('MONGODB_URI not found');
        return false;
    }

    if (isConnected) return true;

    try {
        await mongoose.connect(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        });
        console.log('MongoDB connected successfully');
        isConnected = true;
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        return false;
    }
};

// Function to delete checks older than MAX_DATA_AGE_DAYS
const deleteOldChecks = async () => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - MAX_DATA_AGE_DAYS);
        
        // Get all containers
        const containers = await Container.find();
        
        // For each container, filter out old checks
        for (const container of containers) {
            const oldChecksCount = container.checks.filter(
                (check: any) => check.timestamp < cutoffDate
            ).length;
            
            if (oldChecksCount > 0) {
                // Use $pull to remove checks older than the cutoff date
                await Container.updateOne(
                    { _id: container._id },
                    {
                        $pull: {
                            checks: {
                                timestamp: { $lt: cutoffDate }
                            }
                        }
                    }
                );
                
                console.log(`Deleted ${oldChecksCount} old checks for container ${container.containerId}`);
            }
        }
    } catch (error) {
        console.error('Error deleting old checks:', error);
    }
};

const calculateUptimeStats = async (containerId: string) => {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const container = await Container.findOne({ containerId });
    if (!container) return null;

    const checks = container.checks;
    const dayChecks = checks.filter(c => c.timestamp >= dayAgo);
    const weekChecks = checks.filter(c => c.timestamp >= weekAgo);
    const monthChecks = checks.filter(c => c.timestamp >= monthAgo);

    const calculatePercentage = (checks: any[]) => {
        if (checks.length === 0) return 0;
        const upChecks = checks.filter(c => c.isOnline).length;
        return (upChecks / checks.length) * 100;
    };

    return {
        uptime: calculatePercentage(checks),
        lastDay: calculatePercentage(dayChecks),
        lastWeek: calculatePercentage(weekChecks),
        lastMonth: calculatePercentage(monthChecks),
        history: checks.map(c => ({
            timestamp: c.timestamp,
            isOnline: c.isOnline
        }))
    };
};

const UPDATE_INTERVAL = 60 * 1000;
const CACHE_KEY = 'container_status';

cache.startInterval(CACHE_KEY, async () => {
    const dbConnected = await connectDB();
    return new Promise((resolve) => {
        const options = {
            socketPath: '/var/run/docker.sock',
            path: '/containers/json?all=true',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', async () => {
                try {
                    const containers: ContainerStatus[] = JSON.parse(data);
                    
                    const containerMap = new Map(
                        containers.map(container => [
                            container.Names[0].replace('/', ''),
                            container
                        ])
                    );

                    const services = await Promise.all(
                        allowedContainers.map(async ({ id }) => {
                            const container = containerMap.get(id);
                            const stats = await calculateUptimeStats(id);
                            
                            return {
                                name: id,
                                isOnline: container?.State === 'running',
                                uptime: container?.Status ?? 'Offline',
                                lastChecked: new Date().toISOString(),
                                stats: stats || {
                                    uptime: 0,
                                    lastDay: 0,
                                    lastWeek: 0,
                                    lastMonth: 0,
                                    history: []
                                }
                            };
                        })
                    );

                    if (dbConnected) {
                        // Update container data
                        await Promise.all(
                            allowedContainers.map(({ id }) => 
                                Container.updateOne(
                                    { containerId: id },
                                    {
                                        $push: {
                                            checks: {
                                                timestamp: new Date(),
                                                isOnline: containerMap.get(id)?.State === 'running'
                                            }
                                        }
                                    },
                                    { upsert: true }
                                )
                            )
                        );
                        
                        // Run cleanup once per day (approximately)
                        // Only clean up on every 1440th request (60 seconds * 24 hours = 1440 minutes)
                        const cleanupInterval = 1440;
                        const shouldCleanup = Math.random() < (1 / cleanupInterval);
                        
                        if (shouldCleanup) {
                            console.log('Running scheduled cleanup of old container checks');
                            await deleteOldChecks();
                        }
                    }

                    resolve(services);
                } catch (parseError) {
                    console.error('Parse error:', parseError);
                    resolve({ error: 'Failed to parse container data' });
                }
            });
        });

        req.on('error', (error) => {
            console.error('Docker socket error:', error);
            resolve({ error: 'Failed to connect to Docker socket' });
        });

        req.end();
    });
}, UPDATE_INTERVAL);

// Expose an endpoint to manually trigger cleanup
export const DELETE: RequestHandler = async (event) => {
    const authResponse = await requireApiKey(event);
    if (authResponse) return authResponse;

    try {
        const dbConnected = await connectDB();
        if (!dbConnected) {
            return json({ error: 'Failed to connect to database' }, { status: 500 });
        }

        await deleteOldChecks();
        return json({ success: true, message: 'Old container checks deleted successfully' });
    } catch (error) {
        console.error('Error during manual cleanup:', error);
        return json({ error: 'Failed to clean up old data' }, { status: 500 });
    }
};

// Add POST endpoint for cleanup (more widely supported than DELETE)
export const POST: RequestHandler = async (event) => {
    const authResponse = await requireApiKey(event);
    if (authResponse) return authResponse;

    try {
        // Check if the request is for cleanup
        const requestData = await event.request.json().catch(() => ({ action: '' }));
        
        if (requestData.action !== 'cleanup') {
            return json({ error: 'Invalid action' }, { status: 400 });
        }
        
        const dbConnected = await connectDB();
        if (!dbConnected) {
            return json({ error: 'Failed to connect to database' }, { status: 500 });
        }

        await deleteOldChecks();
        return json({ success: true, message: 'Old container checks deleted successfully' });
    } catch (error) {
        console.error('Error during manual cleanup:', error);
        return json({ error: 'Failed to clean up old data' }, { status: 500 });
    }
};

export const GET: RequestHandler = async (event) => {
    const authResponse = await requireApiKey(event);
    if (authResponse) return authResponse;

    try {
        // Check if this is a cleanup request via query parameter
        const url = new URL(event.request.url);
        const action = url.searchParams.get('action');
        
        if (action === 'cleanup') {
            const dbConnected = await connectDB();
            if (!dbConnected) {
                return json({ error: 'Failed to connect to database' }, { status: 500 });
            }
            
            await deleteOldChecks();
            return json({ success: true, message: 'Old container checks deleted successfully' });
        }
        
        // Normal GET request processing for status data
        const services = await cache.get(CACHE_KEY, async () => {
            const dbConnected = await connectDB();
            return new Promise((resolve) => {
                const options = {
                    socketPath: '/var/run/docker.sock',
                    path: '/containers/json?all=true',
                    method: 'GET'
                };

                const req = http.request(options, (res) => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', async () => {
                        try {
                            const containers: ContainerStatus[] = JSON.parse(data);
                            
                            const containerMap = new Map(
                                containers.map(container => [
                                    container.Names[0].replace('/', ''),
                                    container
                                ])
                            );

                            const services = await Promise.all(
                                allowedContainers.map(async ({ id }) => {
                                    const container = containerMap.get(id);
                                    const stats = await calculateUptimeStats(id);
                                    
                                    return {
                                        name: id,
                                        isOnline: container?.State === 'running',
                                        uptime: container?.Status ?? 'Offline',
                                        lastChecked: new Date().toISOString(),
                                        stats: stats || {
                                            uptime: 0,
                                            lastDay: 0,
                                            lastWeek: 0,
                                            lastMonth: 0,
                                            history: []
                                        }
                                    };
                                })
                            );

                            if (dbConnected) {
                                await Promise.all(
                                    allowedContainers.map(({ id }) => 
                                        Container.updateOne(
                                            { containerId: id },
                                            {
                                                $push: {
                                                    checks: {
                                                        timestamp: new Date(),
                                                        isOnline: containerMap.get(id)?.State === 'running'
                                                    }
                                                }
                                            },
                                            { upsert: true }
                                        )
                                    )
                                );
                            }

                            resolve(services);
                        } catch (parseError) {
                            console.error('Parse error:', parseError);
                            resolve({ error: 'Failed to parse container data' });
                        }
                    });
                });

                req.on('error', (error) => {
                    console.error('Docker socket error:', error);
                    resolve({ error: 'Failed to connect to Docker socket' });
                });

                req.end();
            });
        });

        return json(services);
    } catch (error) {
        console.error('General error:', error);
        return json({ error: 'Failed to fetch container status' }, { status: 500 });
    }
};
