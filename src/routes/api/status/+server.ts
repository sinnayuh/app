import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { ContainerStatus } from '$lib/types/docker';
import mongoose from 'mongoose';
import { Container } from '$lib/db/uptimeSchema';
import * as http from 'http';
import { env } from '$env/dynamic/private';

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

export const GET: RequestHandler = async () => {
    try {
        const dbConnected = await connectDB();

        return new Promise((resolve, reject) => {
            const options = {
                socketPath: '/var/run/docker.sock',
                path: '/containers/json',
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

                        if (!dbConnected) {
                            resolve(json(containers.map(container => ({
                                name: container.Names[0].replace('/', ''),
                                isOnline: container.State === 'running',
                                uptime: container.Status,
                                lastChecked: new Date().toISOString(),
                                stats: {
                                    uptime: 0,
                                    lastDay: 0,
                                    lastWeek: 0,
                                    lastMonth: 0,
                                    history: []
                                }
                            }))));
                            return;
                        }

                        for (const container of containers) {
                            const containerId = container.Names[0].replace('/', '');
                            await Container.updateOne(
                                { containerId },
                                { 
                                    $push: { 
                                        checks: {
                                            timestamp: new Date(),
                                            isOnline: container.State === 'running'
                                        }
                                    }
                                },
                                { upsert: true }
                            );
                        }

                        const services = await Promise.all(containers.map(async container => {
                            const name = container.Names[0].replace('/', '');
                            const stats = await calculateUptimeStats(name);
                            
                            return {
                                name,
                                isOnline: container.State === 'running',
                                uptime: container.Status,
                                lastChecked: new Date().toISOString(),
                                stats: stats || {
                                    uptime: 0,
                                    lastDay: 0,
                                    lastWeek: 0,
                                    lastMonth: 0,
                                    history: []
                                }
                            };
                        }));

                        resolve(json(services));
                    } catch (parseError) {
                        console.error('Parse error:', parseError);
                        resolve(json({ error: 'Failed to parse container data' }, { status: 500 }));
                    }
                });
            });

            req.on('error', (error) => {
                console.error('Docker socket error:', error);
                resolve(json({ error: 'Failed to connect to Docker socket' }, { status: 500 }));
            });

            req.end();
        });
    } catch (error) {
        console.error('General error:', error);
        return json({ error: 'Failed to fetch container status' }, { status: 500 });
    }
};
