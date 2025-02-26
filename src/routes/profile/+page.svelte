<script lang="ts">
	import { asciiArt } from '$lib/AsciiArt';
	import MusicPlayer from '$lib/Player.svelte';
	import Typewriter from '$lib/Typewriter.svelte';
	import Particles from '$lib/Particles.svelte';
	import Lanyard from '$lib/Lanyard.svelte';
	import Nav from '$lib/Nav.svelte';

	const info = [
		{ label: 'discord:', value: 'sinnayuh', link: 'https://discord.com/users/204608845325008906' },
		{ label: 'github:', value: 'sinnayuh', link: 'https://github.com/sinnayuh' },
		{ label: 'telegram:', value: '@sinnerful', link: 'https://t.me/sinnerful' },
		{ label: 'timezone:', value: 'gmt (uk)', link: 'https://time.is/GMT' }
	];

	const mySong = {
		title: 'Haunted',
		artist: 'Laura Les',
		file: '/music/haunted.ogg',
		cover: '/music/haunted.jpg',
		spotifyUrl: 'https://open.spotify.com/track/1toNKayLMeCcVlsLGXJl7n'
	};
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

	<pre class="text-center font-mono text-2xl text-gray-500">
    {asciiArt}
  </pre>

	<div class="mt-0 text-center text-white">
		<Typewriter />
	</div>

	<div class="mt-2 flex flex-col items-center">
		{#each info as item}
			<div class="my-1 flex gap-2">
				<a
					href={item.link}
					target="_blank"
					rel="noopener noreferrer"
					class="cursor-pointer text-gray-400 transition-colors duration-200 hover:text-white"
				>
					<span class="font-mono">{item.label}</span>
					<span class="font-mono">{item.value}</span>
				</a>
			</div>
		{/each}
	</div>

	<div class="mt-3 w-full max-w-md backdrop-blur-sm">
		<Lanyard />
	</div>

	<div class="mt-3 w-full max-w-md backdrop-blur-sm">
		<MusicPlayer song={mySong} />
	</div>

	<div class="mt-2.5 text-center">
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
