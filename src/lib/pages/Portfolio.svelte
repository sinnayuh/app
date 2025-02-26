<script lang="ts">
	import {
		Code2,
		Terminal,
		Database,
		Github,
		Box,
		Monitor,
		Cloud,
		Settings,
		Mail,
		MessageCircle
	} from 'lucide-svelte';

	const projects = [
		{
			title: 'Car Bot',
			description:
				'Discord bot utilizing the JDA Framework, providing a variety of features, including moderation, gambling, profiles with leveling, temp voice channels and more.',
			technologies: ['Java', 'JDA', 'MongoDB'],
			link: 'https://discord.gg/sina'
		},
		{
			title: 'Portfolio',
			description:
				'My personal Portfolio, showcasing my skills, projects and contact information. The website you are currently viewing!',
			technologies: ['SvelteKit', 'Tailwind', 'TypeScript'],
			link: 'https://github.com/sinnayuh/app'
		},
		{
			title: 'advSensitvity',
			description:
				"A client-side Fabric mod that enhances Minecraft's mouse sensitivity controls, allowing precise sensitivity adjustments beyond the vanilla GUI limitations.",
			technologies: ['Java', 'Fabric', 'Gradle'],
			link: 'https://modrinth.com/mod/advsensitivity'
		},
		{
			title: 'hypr-screenshot',
			description:
				'My custom screenshot utility for my Hyperland setup with Arch. Utilizing Grimblast, swappy, slurp & hyprshade.',
			technologies: ['Shell'],
			link: 'https://github.com/sinnayuh/hypr-screenshot'
		},
		{
			title: 'Luxeria',
			description:
				'A feature-rich Minecraft plugin that enhances SMP experience with custom home management, spawner control, and dynamic scoreboard statistics. ',
			technologies: ['Java', 'Spigot', 'Gradle'],
			link: 'https://github.com/sinnayuh/Luxeria'
		},
		{
			title: 'MCTier',
			description:
				'A feature-rich Minecraft plugin that uses the mctiers.com API to provide player statistics and leaderboards in-game.',
			technologies: ['Java', 'Spigot', 'Gradle'],
			link: 'https://github.com/sinnayuh/MCTier'
		}
	];

	const skills = {
		development: [
			{ name: 'Java', icon: Code2 },
			{ name: 'Lua', icon: Code2 },
			{ name: 'JavaScript', icon: Code2 },
			{ name: 'GoLang', icon: Code2 },
			{ name: 'Python', icon: Code2 },
			{ name: 'Docker', icon: Box },
			{ name: 'Kubernetes', icon: Box },
			{ name: 'Git', icon: Github },
			{ name: 'Bash', icon: Terminal },
			{ name: 'Neovim', icon: Terminal },
			{ name: 'Gradle', icon: Terminal },
			{ name: 'Maven', icon: Terminal },
			{ name: 'IntelliJ', icon: Code2 },
			{ name: 'VS Code', icon: Code2 },
			{ name: 'MongoDB', icon: Database },
			{ name: 'MySQL', icon: Database },
			{ name: 'Postman', icon: Monitor },
			{ name: 'Cloudflare', icon: Cloud },
			{ name: 'Azure', icon: Cloud }
		]
	};

	const contacts = [
		{
			name: 'Email',
			icon: Mail,
			link: 'mailto:contact@sinister.codes',
			username: 'contact@sinister.codes'
		},
		{
			name: 'GitHub',
			icon: Github,
			link: 'https://github.com/sinnayuh',
			username: '@sinnayuh'
		},
		{
			name: 'Discord',
			icon: MessageCircle,
			link: 'https://discord.com/users/204608845325008906',
			username: '@sinnayuh'
		}
	];
</script>

<div class="mx-auto mt-6 w-full max-w-6xl">
	<div class="space-y-2 md:w-2/3">
		<h1 class="max-w-3xl text-4xl font-bold text-white">
			Developer, Linux Nerd, Docker Activist, Scripter, Gamer & Anime Enjoyer.
		</h1>
		<p class="max-w-xl text-sm leading-relaxed text-gray-400">
			I'm sin, a developer and system administrator based in the United Kingdom. I make sure all of
			Flyte's services stay online and secure, where developers can create producuts to empower
			freelancers and our clients.
		</p>
	</div>
</div>

<div class="mx-auto mt-6 w-full max-w-6xl">
	<div class="mb-8 flex flex-col gap-8 md:flex-row">
		<div class="md:w-2/3">
			<div class="h-full rounded-lg border border-gray-800 p-6 backdrop-blur-sm">
				<h2 class="mb-4 text-2xl font-bold">Skills & Tools</h2>
				<div class="space-y-6">
					<div>
						<h3 class="mb-3 text-sm text-gray-400">
							My Tech-Stack.
						</h3>
						<div class="flex flex-wrap gap-3">
							{#each skills.development as skill}
								<div
									class="flex items-center gap-2 rounded-md border border-gray-800 px-3 py-2 transition-colors hover:border-gray-600"
								>
									<svelte:component this={skill.icon} class="h-4 w-4" />
									<span class="text-xs text-gray-300">{skill.name}</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="md:w-1/3">
			<div class="h-full rounded-lg border border-gray-800 p-4 backdrop-blur-sm">
				<h2 class="mb-2 text-xl font-bold">Contact</h2>
				<p class="mb-3 text-xs text-gray-400">
					Feel free to reach out to me on any of the following platforms.
				</p>
				<div class="flex flex-col gap-2">
					{#each contacts as contact}
						<a
							href={contact.link}
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-center gap-2 rounded-md border border-gray-800 px-3 py-2 transition-colors hover:border-gray-600"
						>
							<svelte:component
								this={contact.icon}
								class="h-4 w-4 text-gray-400 transition-colors group-hover:text-white"
							/>
							<div class="flex flex-col">
								<span
									class="text-xs font-medium text-gray-300 transition-colors group-hover:text-white"
								>
									{contact.name}
								</span>
								<span class="text-[10px] text-gray-500 transition-colors group-hover:text-gray-400">
									{contact.username}
								</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<div class="rounded-lg border border-gray-800 p-6 backdrop-blur-sm">
		<h2 class="mb-4 text-2xl font-bold">Projects</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			{#each projects as project}
				<a
					href={project.link}
					target="_blank"
					rel="noopener noreferrer"
					class="block rounded-md border border-gray-800 p-4 transition-colors hover:border-gray-600"
				>
					<h3 class="mb-1 text-lg font-bold text-white">{project.title}</h3>
					<p class="mb-2 text-sm text-gray-400">{project.description}</p>
					<div class="flex flex-wrap gap-2">
						{#each project.technologies as tech}
							<span class="rounded-md border border-gray-800 px-2 py-1 text-xs text-gray-300">
								{tech}
							</span>
						{/each}
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
