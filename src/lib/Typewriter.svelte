<script lang="ts">
	import { onMount } from 'svelte';
	import Typewriter from 'typewriter-effect/dist/core';

	let typewriterElement: HTMLDivElement;
	let isInitialized = false;

	const strings: string[] = [
		'i have two rules. rule one: im always right. rule two: if im wrong, refer to rule one',
		'fame is for dweebs. just get rich',
		'our weakness is that we are morons',
		'people die when they are killed',
		'i bet dead people are easier to get along with',
		'if ur going through hell, keep going',
		'aim for the chest and higher',
		"git commit -m 'fixed bugs' --actually created more bugs",
		"my code doesn't have bugs, it just develops random features",
		'crypto portfolio status: buy high, sell cry',
		'DNS issues: the real reason sysadmins drink',
		'404: motivation not found',
		'my code works on my machine... where should i ship my machine?',
		'sudo make me a sandwich',
		"i don't always test my code, but when i do, i do it in production",
		'the best part about regex is now you have two problems',
		'99 bugs in the code, take one down, patch it around, 127 bugs in the code',
		'my backup strategy: close eyes, click save, pray',
		"my favorite HTTP status code is 418: i'm a teapot",
		"what's a sysadmin's favorite time? 00:00, when everyone's offline",
		"to understand recursion, you must first understand recursion",
        "i'm not a complete idiot, some parts are missing",
        "i'm not arguing, i'm just explaining why i'm right",
        "i'm not a control freak, but can i show you the right way to do that?",
        "i'm not a pessimist, i'm an optimist with experience",
        "i'm not a morning person, i'm a coffee person",
        "hello, my name is :(){ :|: & };:",
	];

	function shuffleArray(array: string[]) {
		const newArray = [...array];
		for (let i = newArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
		}
		return newArray;
	}

	onMount(() => {
		if (!typewriterElement) return;

		setTimeout(() => {
			isInitialized = true;

			const typewriter = new Typewriter(typewriterElement, {
				loop: true,
				delay: 50,
				deleteSpeed: 30
			});
			
			const shuffledStrings = shuffleArray(strings);
			
			let sequence = typewriter;
			
			shuffledStrings.forEach((string, index) => {
				if (index > 0) {
					sequence = sequence.deleteAll();
				}
				sequence = sequence
					.typeString(string)
					.pauseFor(2000);
			});
			
			sequence.start();
		}, 500);
	});
</script>

<div class="relative min-h-[24px] whitespace-nowrap">
	<div 
		class="text-center text-gray-400 absolute left-1/2 -translate-x-1/2 transition-opacity duration-500" 
		style:opacity={isInitialized ? 0 : 1}
	>
		loading...
	</div>
	<div 
		bind:this={typewriterElement} 
		class="text-center text-gray-400 absolute left-1/2 -translate-x-1/2 transition-opacity duration-500" 
		style:opacity={isInitialized ? 1 : 0}
	></div>
</div>