<script>
	import AnimateTitle from '$lib/AnimateTitle.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<AnimateTitle />

{@render children()}
