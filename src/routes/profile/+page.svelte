<script lang="ts">
  import { goto } from '$app/navigation';
  import { asciiArt } from '$lib/AsciiArt';
  import MusicPlayer from '$lib/Player.svelte';
  import Typewriter from '$lib/Typewriter.svelte';
  import Particles from '$lib/Particles.svelte';
  import Lanyard from '$lib/Lanyard.svelte';

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

  <!-- ASCII Art -->
  <pre class="text-center font-mono text-2xl text-gray-500">
    {asciiArt}
  </pre>

  <!-- Typewriter -->
  <div class="mt-0 text-center text-white">
    <Typewriter />
  </div>

  <!-- Social/Info Links -->
  <div class="mt-2 flex flex-col items-center">
    {#each info as item}
      <div class="my-1 flex gap-2">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          class="cursor-pointer text-gray-400 hover:text-white transition-colors duration-200"
        >
          <span class="font-mono">{item.label}</span>
          <span class="font-mono">{item.value}</span>
        </a>
      </div>
    {/each}
  </div>

  <!-- Discord Lanyard Status -->
  <div class="mt-3 w-full max-w-md backdrop-blur-sm">
    <Lanyard />
  </div>

  <!-- Music Player -->
  <div class="mt-3 w-full max-w-md backdrop-blur-sm">
    <MusicPlayer song={mySong} />
  </div>

  <!-- Discord Server Link -->
  <div class="mt-2.5 text-center">
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