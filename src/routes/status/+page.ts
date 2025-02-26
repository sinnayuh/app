import type { ServiceStatus } from '$lib/types/docker';
import type { PageLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch('/api/status', {
        headers: {
            'x-api-key': env.PUBLIC_API_KEY || ''
        }
    });
    const services: ServiceStatus[] = await response.json();
    return { services };
};
