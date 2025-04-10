<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { Activity, Music, Check } from 'lucide-svelte';

  const DISCORD_ID = '204608845325008906';
  const DISCORD_USERNAME = 'sinnayuh';
  
  let data: any = null;
  let error = false;
  let socket: WebSocket;
  let showToast = false;
  let toastVisible = false;
  
  const dispatch = createEventDispatcher();

  function connectWebSocket() {
    socket = new WebSocket('wss://api.lanyard.rest/socket');
    
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({
        op: 2,
        d: {
          subscribe_to_ids: [DISCORD_ID]
        }
      }));
    });
    
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      
      if (message.op === 0) {
        if (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE') {
          if (message.d[DISCORD_ID]) {
            data = message.d[DISCORD_ID];
          } else if (message.d.discord_user && message.d.discord_user.id === DISCORD_ID) {
            data = message.d;
          }
        }
      }
      
      if (message.op === 1) {
        socket.send(JSON.stringify({
          op: 3
        }));
      }
    });
    
    socket.addEventListener('close', () => {
      setTimeout(connectWebSocket, 3000);
    });
    
    socket.addEventListener('error', () => {
      error = true;
    });
  }
  
  onMount(() => {
    connectWebSocket();
  });
  
  onDestroy(() => {
    if (socket) {
      socket.close();
    }
  });
  
  function getStatusText(status: string) {
    switch (status) {
      case 'online': return 'Online';
      case 'idle': return 'Idle';
      case 'dnd': return 'Do Not Disturb';
      default: return 'Offline';
    }
  }
  
  function getActivityType(type: number) {
    switch (type) {
      case 0: return 'Playing';
      case 1: return 'Streaming';
      case 2: return 'Listening to';
      case 3: return 'Watching';
      case 4: return 'Custom';
      case 5: return 'Competing in';
      default: return '';
    }
  }
  
  function copyToClipboard() {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(DISCORD_USERNAME);
      dispatch('toast', { show: true });
      
      setTimeout(() => {
        dispatch('toast', { show: false });
      }, 2000);
    }
  }
</script>

<div class="border border-gray-800 rounded-md p-4 max-w-md w-full min-h-[160px] max-h-[160px] flex flex-col">
{#if error}
  <div class="flex flex-col flex-1 justify-center">
    <div class="text-gray-400 text-center">Failed to load Discord status</div>
  </div>
{:else if !data}
  <div class="flex flex-col flex-1 justify-center">
    <div class="text-gray-400 text-center">Loading Discord status...</div>
  </div>
{:else}
  <div class="flex items-center gap-4 mb-4">
    <div 
      class="w-12 h-12 bg-gray-800 flex-shrink-0 overflow-hidden cursor-pointer rounded-full"
      on:click={copyToClipboard}
      role="button"
      tabindex="0"
      on:keydown={(e) => e.key === 'Enter' && copyToClipboard()}
    >
      <img 
        src={`https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}`} 
        alt="Discord Avatar" 
        class="w-full h-full object-cover"
      >
    </div>

    <div class="flex-1">
      <div 
        class="font-bold cursor-pointer hover:underline" 
        on:click={copyToClipboard}
        role="button"
        tabindex="0"
        on:keydown={(e) => e.key === 'Enter' && copyToClipboard()}
      >
        sin
      </div>
      <div class="text-sm flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full flex-shrink-0 translate-y-[0.5px]
          {data.discord_status === 'online' ? 'bg-green-500' : 
          data.discord_status === 'idle' ? 'bg-yellow-500' : 
          data.discord_status === 'dnd' ? 'bg-red-500' : 
          'bg-gray-500'}"
        ></div>
        <span class="text-gray-400 leading-none">{getStatusText(data.discord_status)}</span>
      </div>
    </div>
  </div>

  {#if data.activities && data.activities.length > 0}
    {#each data.activities.filter((a: any) => a.type !== 4).slice(0, 1) as activity}
      <div class="mb-2">
        {#if activity.type === 2 && activity.assets && activity.name === 'Spotify'}
          <div class="flex items-center gap-3 border-t border-gray-800 pt-4">
            {#if activity.assets.large_image}
              <div class="w-10 h-10 flex-shrink-0">
                <img 
                  src={activity.assets.large_image.startsWith('spotify:') 
                    ? `https://i.scdn.co/image/${activity.assets.large_image.substring(8)}` 
                    : 'https://cdn.discordapp.com/app-assets/383226320970055681/565944799576719366.jpg'} 
                  alt="Album Cover" 
                  class="w-full h-full object-cover"
                >
              </div>
            {:else}
              <div class="w-10 h-10 flex-shrink-0 bg-gray-800 flex items-center justify-center">
                <Music size={20} />
              </div>
            {/if}
            <div class="flex-1 overflow-hidden">
              <div class="font-medium truncate">{activity.details || 'Unknown Song'}</div>
              <div class="text-gray-400 text-sm truncate">by {activity.state || 'Unknown Artist'}</div>
            </div>
          </div>
        {:else}
          <div class="flex items-center gap-3 border-t border-gray-800 pt-4">
            <div class="w-10 h-10 flex-shrink-0 bg-gray-800 flex items-center justify-center overflow-hidden">
              {#if activity.assets?.large_image}
                <img 
                  src={activity.assets.large_image.startsWith('mp:external/') 
                    ? `https://media.discordapp.net/external/${activity.assets.large_image.slice(12)}`
                    : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`}
                  alt="Activity Icon"
                  class="w-full h-full object-cover"
                />
              {:else}
                <Activity size={20} />
              {/if}
            </div>
            <div class="flex-1 overflow-hidden">
              <div class="font-medium truncate">{getActivityType(activity.type)} {activity.name}</div>
              {#if activity.details}
                <div class="text-gray-400 text-sm truncate">{activity.details}</div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  {:else}
    <div class="flex items-center gap-3 border-t border-gray-800 pt-4 mb-2">
      <div class="w-10 h-10 flex-shrink-0 bg-gray-800 flex items-center justify-center">
        <Activity size={20} />
      </div>
      <div class="flex-1 overflow-hidden">
        <div class="font-medium truncate">Doing nothing</div>
        <div class="text-gray-400 text-sm truncate">&nbsp;</div>
      </div>
    </div>
  {/if}
{/if}
</div>