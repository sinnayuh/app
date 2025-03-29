import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { ContainerStatus } from '$lib/types/docker';
import { Container } from '$lib/db/uptimeSchema';
import * as http from 'http';
import { env } from '$env/dynamic/private';
import { requireApiKey } from '$lib/server/auth';
import { allowedContainers } from '$lib/config/containers';
import { cache } from '$lib/server/cache';
import { connectDB } from '$lib/server/db';
import { deleteOldContainerChecks, runScheduledCleanupIfNeeded } from '$lib/server/cleanup';

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
                        
                        // Run scheduled cleanup approximately once per day
                        await runScheduledCleanupIfNeeded();
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
        // Check if this is a cleanup request via query parameter
        const url = new URL(event.request.url);
        const action = url.searchParams.get('action');
        
        if (action === 'cleanup') {
            console.log('🧹 CLEANUP VIA STATUS: Redirecting to dedicated cleanup endpoint');
            // Redirect to the dedicated cleanup endpoint with the same authentication
            return Response.redirect(`${url.origin}/api/cleanup?action=run`, 302);
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
