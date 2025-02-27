<script>
	import AnimateTitle from '$lib/utils/AnimateTitle.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<AnimateTitle />

<div id="portal-container"></div>
{@render children()}
