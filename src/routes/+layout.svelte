<script>
	import AnimateTitle from '$lib/utils/AnimateTitle.svelte';
	import '../app.css';
	let { children } = $props();
  
	// Apply no-scrollbar styles on mount
	import { onMount } from 'svelte';
	
	onMount(() => {
		document.documentElement.classList.add('no-scrollbar');
		document.body.classList.add('no-scrollbar');
	});
</script>

<svelte:head>
  <style>
    html, body {
      overflow-x: hidden;
      overflow-y: scroll;
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    
    html::-webkit-scrollbar,
    body::-webkit-scrollbar {
      width: 0 !important;
      display: none !important;
    }
    
    * {
      scrollbar-width: none !important;
    }
    
    *::-webkit-scrollbar {
      display: none !important;
    }
  </style>
</svelte:head>

<div class="no-scrollbar" style="height: 100vh; overflow-y: auto; overflow-x: hidden;">
  <AnimateTitle />
  <div id="portal-container"></div>
  {@render children()}
</div>
