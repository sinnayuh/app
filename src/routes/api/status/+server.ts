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

// Function to cleanup data older than 30 days
const cleanupOldData = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
        const results = await Container.updateMany(
            {},
            { $pull: { checks: { timestamp: { $lt: thirtyDaysAgo } } } }
        );
        
        console.log(`Cleaned up data older than 30 days. Modified ${results.modifiedCount} containers.`);
        return true;
    } catch (error) {
        console.error('Failed to clean up old data:', error);
        return false;
    }
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
                        // Save new data
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
                        
                        // Clean up old data
                        await cleanupOldData();
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

export const GET: RequestHandler = async (event) => {
    const authResponse = await requireApiKey(event);
    if (authResponse) return authResponse;

    try {
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
                                // Save new data
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
                                
                                // Clean up old data
                                await cleanupOldData();
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
