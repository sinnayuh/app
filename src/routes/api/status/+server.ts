import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ContainerStatus } from '$lib/types/docker';

export const GET: RequestHandler = async () => {
    try {
        const response = await fetch('http://unix:/var/run/docker.sock:/containers/json', {
            headers: {
                'Host': 'localhost',
                'Content-Type': 'application/json'
            }
        });

        const containers: ContainerStatus[] = await response.json();
        
        const services = containers.map(container => ({
            name: container.Names[0].replace('/', ''),
            isOnline: container.State === 'running',
            uptime: container.Status,
            lastChecked: new Date().toISOString()
        }));

        return json(services);
    } catch (error) {
        return json({ error: 'Failed to fetch container status' }, { status: 500 });
    }
};
