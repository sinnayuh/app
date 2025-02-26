import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export async function requireApiKey(event: RequestEvent) {
    const apiKey = event.request.headers.get('x-api-key');

    if (!apiKey || apiKey !== env.API_KEY) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    return null;
}
