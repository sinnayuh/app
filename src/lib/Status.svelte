<script lang="ts">
    import type { ServiceStatus } from '$lib/types/docker';

    export let services: ServiceStatus[];

    const allowedContainers = [
        'nginx',
        'portfolio-app-dev',
        'minecraft',
        'discord-bot'
        // Add more container names as needed
    ];

    $: filteredServices = services.filter(service => 
        allowedContainers.includes(service.name)
    );
</script>

<div class="flex w-full max-w-4xl flex-1 flex-col items-center justify-start gap-8 pt-12">
    <h1 class="text-3xl font-bold">Service Status</h1>
    <div class="grid w-full gap-4 md:grid-cols-2">
        {#each filteredServices as service}
            <div class="group relative overflow-hidden rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
                <div class="absolute inset-0 rounded-xl border border-white/10" />
                <div class="relative space-y-4 p-6">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold text-white/90">{service.name}</h2>
                        <div class="flex items-center gap-2">
                            <span class={service.isOnline ? 'text-green-400' : 'text-red-400'}>
                                {service.isOnline ? '● Online' : '● Offline'}
                            </span>
                        </div>
                    </div>
                    <p class="text-sm text-white/60">Uptime: {service.uptime}</p>
                    <p class="text-xs text-white/40">Last checked: {new Date(service.lastChecked).toLocaleString()}</p>
                </div>
            </div>
        {/each}
    </div>
</div>
