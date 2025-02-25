<script lang="ts">
    import { goto } from '$app/navigation';
    import Particles from '$lib/Particles.svelte';
    import Portfolio from '$lib/Portfolio.svelte';
  
    function navigateTo(path: string) {
      goto(path);
    }
  </script>
  
  <!-- Background with overlay -->
  <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background: #191919;">
    <img src="/bg.png" alt="plus" class="w-full h-full object-cover" />
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: black; opacity: 0.9; z-index: 1;"></div>
  </div>
  
  <!-- Particles effect -->
  <Particles />
  
  <!-- Main content -->
  <div class="content flex min-h-screen flex-col items-center p-8 text-white relative z-10">
    <!-- Navigation buttons -->
    <div class="flex gap-3 mb-0">
      <button 
        class="px-4 py-2 rounded-md border border-gray-800 hover:bg-gray-700 transition-colors duration-200"
        on:click={() => navigateTo('/status')}
      >
        <span class="text-gray-400 hover:text-white">status</span>
      </button>
      <button 
        class="px-4 py-2 rounded-md border border-gray-800 hover:bg-gray-700 transition-colors duration-200"
        on:click={() => navigateTo('/profile')}
      >
        <span class="text-gray-400 hover:text-white">home</span>
      </button>
      <button 
        class="px-4 py-2 rounded-md border border-gray-800 hover:bg-gray-700 transition-colors duration-200"
        on:click={() => navigateTo('/portfolio')}
      >
        <span class="text-gray-400 hover:text-white">portfolio</span>
      </button>
    </div>

    <Portfolio />
  
    <!-- Footer -->
    <div class="mt-4 text-center">
      <a
        href="https://discord.gg/sina"
        target="_blank"
        rel="noopener noreferrer"
        class="cursor-pointer text-gray-400 hover:text-white transition-colors duration-200"
      >
        .gg/sina
      </a>
    </div>
  </div>