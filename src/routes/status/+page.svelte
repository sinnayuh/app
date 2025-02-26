<script lang="ts">
    import Particles from '$lib/Particles.svelte';
    import Nav from '$lib/Nav.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background: #191919;">
    <img src="/bg.png" alt="plus" class="h-full w-full object-cover" />
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: black; opacity: 0.9; z-index: 1;"></div>
</div>

<Particles />

<div class="content relative z-10 flex min-h-screen flex-col items-center p-8 text-white">
    <Nav />

    <div class="flex w-full max-w-4xl flex-1 flex-col items-center justify-start gap-8 pt-12">
        <h1 class="text-3xl font-bold">Service Status</h1>
        <div class="grid w-full gap-4 md:grid-cols-2">
            {#each data.services as service}
                <div class="rounded-lg bg-gray-800 p-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold">{service.name}</h2>
                        <div class="flex items-center gap-2">
                            <span class={service.isOnline ? 'text-green-400' : 'text-red-400'}>
                                {service.isOnline ? '● Online' : '● Offline'}
                            </span>
                        </div>
                    </div>
                    <p class="mt-2 text-gray-400">Uptime: {service.uptime}</p>
                    <p class="mt-1 text-sm text-gray-500">Last checked: {new Date(service.lastChecked).toLocaleString()}</p>
                </div>
            {/each}
        </div>
    </div>

    <div class="mt-8 text-center">
        <a
            href="https://discord.gg/sina"
            target="_blank"
            rel="noopener noreferrer"
            class="cursor-pointer text-gray-400 transition-colors duration-200 hover:text-white"
        >
            .gg/sina
        </a>
    </div>
</div>
