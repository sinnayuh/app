<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Pause, Play, Volume, Volume1, Volume2, VolumeX, Loader } from 'lucide-svelte';

  interface Song {
      title: string;
      artist: string;
      file: string;
      cover: string;
      spotifyUrl: string;
  }
  
  export let song: Song = {
      title: 'Song Title',
      artist: 'Artist Name',
      file: '/default-song.ogg',
      cover: '/music/default-cover.jpg',
      spotifyUrl: 'https://open.spotify.com/track/default'
  };

  let audio: HTMLAudioElement | null = null;
  let isPlaying: boolean = false;
  let isLoading: boolean = false;
  let isAudioLoaded: boolean = false;
  let volume: number = 0.5;
  let currentTime: number = 0;
  let duration: number = 0;

  let isDragging: boolean = false;

  function formatTime(seconds: number): string {
      if (isNaN(seconds)) return '0:00';
      const min = Math.floor(seconds / 60);
      const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${min}:${sec}`;
  }

  function startDrag(e: MouseEvent): void {
      isDragging = true;
      updateScrubberPosition(e);
      if (typeof window !== 'undefined') {
          window.addEventListener('mousemove', updateScrubberPosition);
          window.addEventListener('mouseup', stopDrag);
      }
  }

  function updateScrubberPosition(e: MouseEvent): void {
      if (!isDragging || !audio) return;

      const scrubber = e.currentTarget as HTMLElement;
      const rect = scrubber.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;

      currentTime = pos * duration;
      audio.currentTime = currentTime;
  }

  function stopDrag(): void {
      isDragging = false;
      if (typeof window !== 'undefined') {
          window.removeEventListener('mousemove', updateScrubberPosition);
          window.removeEventListener('mouseup', stopDrag);
      }
  }

  async function initializeAudio() {
      if (!audio && !isLoading) {
          isLoading = true;
          audio = new Audio();
          
          audio.addEventListener('timeupdate', () => {
              if (!isDragging && audio) {
                  currentTime = audio.currentTime;
              }
          });
          
          audio.addEventListener('loadedmetadata', () => {
              if (audio) {
                  duration = audio.duration;
                  audio.volume = volume;
                  isLoading = false;
                  isAudioLoaded = true;
              }
          });
          
          audio.addEventListener('ended', () => {
              isPlaying = false;
          });

          audio.src = song.file;
          await audio.load();
      }
  }

  async function togglePlay(): Promise<void> {
      if (!audio && !isLoading) {
          await initializeAudio();
      }
      
      if (audio && !isLoading) {
          if (isPlaying) {
              audio.pause();
          } else {
              audio.play();
          }
          isPlaying = !isPlaying;
      }
  }

  function updateVolume(): void {
      if (!audio) return;
      audio.volume = volume;
  }

  function openSpotify(): void {
        if (typeof window !== 'undefined' && song.spotifyUrl) {
            window.open(song.spotifyUrl, '_blank');
        }
    }

  onDestroy(() => {
      if (audio) {
          audio.pause();
          audio.src = '';
          audio = null;
      }
  });
</script>
  
  <div class="border border-gray-800 rounded-md p-4 max-w-md w-full">
    <div class="flex items-center gap-4 mb-3">
      <div 
        class="w-12 h-12 bg-gray-800 flex-shrink-0 overflow-hidden cursor-pointer" 
        on:click={openSpotify}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && openSpotify()}
      >
        <img src={song.cover} alt="Album cover" class="w-full h-full object-cover" />
      </div>
  
      <div class="flex-1">
        <div 
          class="font-bold cursor-pointer hover:underline" 
          on:click={openSpotify}
          role="button"
          tabindex="0"
          on:keydown={(e) => e.key === 'Enter' && openSpotify()}
        >
          {song.title}
        </div>
        <div class="text-gray-400 text-sm">{song.artist}</div>
      </div>
  
      <button 
        class="w-8 h-8 rounded-full border border-gray-600 flex items-center justify-center hover:bg-gray-700"
        on:click={togglePlay}
        disabled={isLoading}
      >
        {#if isLoading}
          <Loader class="animate-spin" size={20} />
        {:else if isPlaying}
          <Pause size={20} />
        {:else}
          <Play size={20} />
        {/if}
      </button>
    </div>
  
    <div 
      class="h-2 w-full bg-gray-700 rounded-full mb-1 cursor-pointer relative {!isAudioLoaded ? 'opacity-50' : ''}"
      on:mousedown={isAudioLoaded ? startDrag : undefined}
      role="slider"
      aria-valuemin="0"
      aria-valuemax={duration}
      aria-valuenow={currentTime}
      tabindex="0"
      on:keydown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          const newTime = e.key === 'ArrowLeft' ? currentTime - 5 : currentTime + 5;
          currentTime = Math.max(0, Math.min(newTime, duration));
          if (audio) audio.currentTime = currentTime;
        }
      }}
    >
      <div 
        class="h-full bg-gray-500 rounded-full" 
        style="width: {duration ? (currentTime / duration) * 100 : 0}%"
      ></div>
    </div>
  
    <div class="flex justify-between text-xs text-gray-400 mb-3">
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
  
    <div class="flex items-center gap-2">
      {#if volume === 0}
        <VolumeX size={16} />
      {:else if volume <= 0.5}
        <Volume size={16} />
      {:else if volume <= 0.75}
        <Volume1 size={16} />
      {:else}
        <Volume2 size={16} />
      {/if}
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        bind:value={volume} 
        on:input={updateVolume}
        class="w-full h-2 bg-gray-700 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
      />
    </div>
  </div>