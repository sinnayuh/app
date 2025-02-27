<script>
	import AnimateTitle from '$lib/utils/AnimateTitle.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
  <style>
    html, body {
      scrollbar-width: none !important;
    }
    ::-webkit-scrollbar {
      display: none !important;
    }
  </style>
</svelte:head>

<AnimateTitle />

<div id="portal-container"></div>
{@render children()}
