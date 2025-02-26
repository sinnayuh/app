<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Check } from 'lucide-svelte';
  
  export let show: boolean = false;
  export let message: string;
  
  let visible = false;
  let shouldRender = false;
  let portalContainer: HTMLElement;
  let toastElement: HTMLDivElement;
  
  $: if (show) {
    shouldRender = true;
    setTimeout(() => {
      visible = true;
    }, 10);
  } else if (!show && visible) {
    visible = false;
    setTimeout(() => {
      shouldRender = false;
    }, 500);
  }
  
  onMount(() => {
    const container = document.getElementById('portal-container');
    if (container && toastElement) {
      portalContainer = container;
      portalContainer.appendChild(toastElement);
    }
  });
  
  onDestroy(() => {
    if (portalContainer && toastElement) {
      portalContainer.removeChild(toastElement);
    }
  });
</script>

<div bind:this={toastElement}>
  {#if shouldRender}
    <div 
      class="fixed bottom-8 right-8 z-[9999] pointer-events-none"
    >
      <div 
        class="transform transition-all duration-500 ease-in-out"
        class:opacity-0={!visible}
        class:opacity-100={visible}
        class:translate-y-4={!visible}
        class:translate-y-0={visible}
      >
        <div class="border border-gray-700/50 rounded-md p-3 flex items-center gap-2 shadow-lg backdrop-blur-sm bg-gray-800/30 pointer-events-auto">
          <Check size={18} class="text-green-500" />
          <span class="text-gray-200 whitespace-nowrap">{message}</span>
        </div>
      </div>
    </div>
  {/if}
</div>
