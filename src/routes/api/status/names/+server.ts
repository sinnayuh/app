import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { ContainerStatus } from '$lib/types/docker';
import * as http from 'http';
import { requireApiKey } from '$lib/server/auth';

export const GET: RequestHandler = async (event) => {
    const authResponse = await requireApiKey(event);
    if (authResponse) return authResponse;

    try {
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

                res.on('end', () => {
                    try {
                        const containers: ContainerStatus[] = JSON.parse(data);
                        const names = containers.map(container => 
                            container.Names[0].replace('/', '')
                        ).sort();
                        resolve(json(names));
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
        return json({ error: 'Failed to fetch container names' }, { status: 500 });
    }
};
