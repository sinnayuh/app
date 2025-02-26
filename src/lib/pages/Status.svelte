<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { ServiceStatus } from '$lib/types/docker';
    import { allowedContainers } from '$lib/config/containers';

    export let services: ServiceStatus[];

    let intervalId: number;

    const refreshServices = async () => {
        const response = await fetch('/api/status');
        services = await response.json();
    };

    onMount(() => {
        intervalId = setInterval(refreshServices, 60000);
    });

    onDestroy(() => {
        if (intervalId) clearInterval(intervalId);
    });

    $: filteredServices = services.filter(service => 
        allowedContainers.some(container => container.id === service.name)
    ).map(service => ({
        ...service,
        displayName: allowedContainers.find(c => c.id === service.name)?.displayName || service.name
    }));

    const getUptimeColor = (percentage: number) => {
        if (percentage >= 99) return 'bg-green-500';
        if (percentage >= 95) return 'bg-yellow-500';
        return 'bg-red-500';
    };
</script>

<div class="flex w-full max-w-4xl flex-1 flex-col items-center justify-start gap-8 pt-12">
    <h1 class="text-3xl font-bold">Service Status</h1>
    <div class="grid w-full gap-4 md:grid-cols-2">
        {#each filteredServices as service}
            <div class="rounded-lg border border-gray-800 p-6 backdrop-blur-sm">
                <div class="flex items-center justify-between">
                    <h2 class="text-xl font-bold text-white">{service.displayName}</h2>
                    <div class="flex items-center gap-2">
                        <span class={service.isOnline ? 'text-green-400' : 'text-red-400'}>
                            {service.isOnline ? '● Online' : '● Offline'}
                        </span>
                    </div>
                </div>
                <!-- <p class="mt-2 text-sm text-gray-400">Uptime: {service.uptime}</p> -->
                <div class="mt-3 space-y-2">
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-300">{service.stats.lastMonth.toFixed(2)}%</span>
                    </div>
                    <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                        <div
                            class={`h-full transition-all duration-500 ${getUptimeColor(service.stats.lastMonth)}`}
                            style={`width: ${service.stats.lastMonth}%`}
                        ></div>
                    </div>
                </div>
                <p class="mt-3 text-xs text-gray-500">Last checked: {new Date(service.lastChecked).toLocaleString()}</p>
            </div>
        {/each}
    </div>
</div>
