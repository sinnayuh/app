<script lang="ts">
  import { goto } from '$app/navigation';
  import Particles from '$lib/Particles.svelte';

  function handleClick() {
    goto('/profile');
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      handleClick();
    }
  }
</script>

<div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background: #191919;">
  <img src="/bg.png" alt="plus" class="w-full h-full object-cover" />
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: black; opacity: 0.9; z-index: 1;"></div>
</div>

<Particles />

<button
  type="button"
  on:click={handleClick}
  on:keydown={handleKeyDown}
  class="w-full h-screen flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
  style="position: relative; z-index: 2;"
>
  <h1 class="text-gray-400 cursor-pointer hover:text-white">welcome</h1>
</button>