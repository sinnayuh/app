<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
  
    let Title = 'sinister.codes ';
    let delay = 200;
    let counter = 0;
    let direction = true;
    let interval: any;
  
    onMount(() => {
      interval = setInterval(() => {
        if (counter === Title.length) direction = false;
        if (counter === 0) direction = true;
        counter = direction ? counter + 1 : counter - 1;
        const newTitle = counter === 0 ? '_' : Title.slice(0, counter);
        document.title = newTitle;
      }, delay);
    });
  
    onDestroy(() => {
      clearInterval(interval);
    });
  </script>
