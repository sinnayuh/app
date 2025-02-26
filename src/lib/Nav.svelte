<script lang="ts">
	import { goto } from '$app/navigation';

	function navigateTo(path: string) {
		goto(path);
	}
</script>

<div class="mb-0 flex gap-3">
	<button
		class="cursor-pointer rounded-md border border-gray-800 px-4 py-2 backdrop-blur-sm transition-colors duration-200 hover:bg-gray-700"
		on:click={() => navigateTo('/status')}
	>
		<span class="text-gray-400 hover:text-white">status</span>
	</button>
	<button
		class="cursor-pointer rounded-md border border-gray-800 px-4 py-2 backdrop-blur-sm transition-colors duration-200 hover:bg-gray-700"
		on:click={() => navigateTo('/profile')}
	>
		<span class="text-gray-400 hover:text-white">home</span>
	</button>
	<button
		class="cursor-pointer rounded-md border border-gray-800 px-4 py-2 backdrop-blur-sm transition-colors duration-200 hover:bg-gray-700"
		on:click={() => navigateTo('/portfolio')}
	>
		<span class="text-gray-400 hover:text-white">portfolio</span>
	</button>
</div>
