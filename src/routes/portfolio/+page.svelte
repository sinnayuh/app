<script lang="ts">
	import Particles from '$lib/utils/Particles.svelte';
	import Portfolio from '$lib/pages/Portfolio.svelte';
	import Nav from '$lib/pages/Nav.svelte';
</script>

<div
	style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; background: #191919;"
>
	<img src="/bg.png" alt="plus" class="h-full w-full object-cover" />
	<div
		style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: black; opacity: 0.9; z-index: 1;"
	></div>
</div>

<Particles />

<div class="content relative z-10 flex min-h-screen flex-col items-center p-8 text-white">
	<Nav />

	<Portfolio />

	<div class="mt-4 text-center">
		<a
			href="https://discord.gg/sina"
			target="_blank"
			rel="noopener noreferrer"
			class="cursor-pointer text-gray-400 transition-colors duration-200 hover:text-white"
		>
			.gg/sina
		</a>
	</div>
</div>
