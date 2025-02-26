import type { ServiceStatus } from '$lib/types/docker';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
    const response = await fetch('/api/status');
    const services: ServiceStatus[] = await response.json();
    return { services };
};
