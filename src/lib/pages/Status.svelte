<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import type { ServiceStatus } from '$lib/types/docker';
    import { allowedContainers } from '$lib/config/containers';

    export let services: ServiceStatus[];

    let intervalId: number;
    const REFRESH_INTERVAL = 60000; // Match server's update interval
    let lastRefresh = 0;

    const refreshServices = async () => {
        const now = Date.now();
        if (now - lastRefresh < 5000) return; // Prevent refresh spam
        
        const response = await fetch('/api/status');
        services = await response.json();
        lastRefresh = now;
    };

    onMount(() => {
        intervalId = setInterval(refreshServices, REFRESH_INTERVAL);
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

    const HISTORY_LIMIT = 10;

    function getLatestHistory(history: { timestamp: Date; isOnline: boolean }[]) {
        return history
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, HISTORY_LIMIT)
            .reverse();
    }
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
                <div class="mt-3 space-y-2">
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-300">{service.stats.lastMonth.toFixed(2)}%</span>
                    </div>
                    <!-- History bars -->
                    <div class="flex gap-0.5 h-1.5">
                        {#each getLatestHistory(service.stats.history) as check}
                            <div 
                                class="flex-1 rounded-sm transition-colors duration-300"
                                class:bg-green-500={check.isOnline}
                                class:bg-red-500={!check.isOnline}
                            ></div>
                        {/each}
                        {#if service.stats.history.length < HISTORY_LIMIT}
                            {#each Array(HISTORY_LIMIT - service.stats.history.length) as _}
                                <div class="flex-1 rounded-sm bg-gray-800"></div>
                            {/each}
                        {/if}
                    </div>
                </div>
                <p class="mt-3 text-xs text-gray-500">Last checked: {new Date(service.lastChecked).toLocaleString()}</p>
            </div>
        {/each}
    </div>
</div>
