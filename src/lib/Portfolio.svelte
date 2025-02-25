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
        title: "Car Bot",
        description: "Discord bot utilizing the JDA Framework, providing a variety of features, including moderation, gambling, profiles with leveling, temp voice channels and more.",
        technologies: ["Java", "JDA", "MongoDB"],
        link: "https://discord.gg/sina"
      },
      {
        title: "Portfolio",
        description: "My personal Portfolio, showcasing my skills, projects and contact information. The website you are currently viewing!",
        technologies: ["SvelteKit", "Tailwind", "TypeScript"],
        link: "https://github.com/sinnayuh/app"
      },
      {
        title: "advSensitvity",
        description: "A lightweight client-side Fabric mod that enhances Minecraft's mouse sensitivity controls, allowing for precise sensitivity adjustments beyond the vanilla GUI limitations.",
        technologies: ["Java", "Fabric", "Gradle"],
        link: "https://modrinth.com/mod/advsensitivity"
      },
      {
        title: "hypr-screenshot",
        description: "My custom screenshot utility for my Hyperland setup with Arch. Utilizing Grimblast, swappy, slurp & hyprshade.",
        technologies: ["Shell"],
        link: "https://github.com/sinnayuh/hypr-screenshot"
      }
    ];

    const skills = {
      development: [
        { name: "Java", icon: Code2 },
        { name: "Lua", icon: Code2 },
        { name: "JavaScript", icon: Code2 },
        { name: "GoLang", icon: Code2 },
        { name: "Python", icon: Code2 },
        { name: "Docker", icon: Box },
        { name: "Kubernetes", icon: Box },
        { name: "Git", icon: Github },
        { name: "Bash", icon: Terminal },
        { name: "Neovim", icon: Terminal },
        { name: "Gradle", icon: Terminal },
        { name: "Maven", icon: Terminal },
        { name: "IntelliJ", icon: Code2 },
        { name: "VS Code", icon: Code2 },
        { name: "MongoDB", icon: Database },
        { name: "MySQL", icon: Database },
        { name: "Postman", icon: Monitor },
        { name: "Cloudflare", icon: Cloud },
        { name: "Azure", icon: Cloud }
      ]
    };

    const contacts = [
      {
        name: "Email",
        icon: Mail,
        link: "mailto:contact@sinister.codes",
        username: "contact@sinister.codes"
      },
      {
        name: "GitHub",
        icon: Github,
        link: "https://github.com/sinnayuh",
        username: "@sinnayuh"
      },
      {
        name: "Discord",
        icon: MessageCircle,
        link: "https://discord.com/users/204608845325008906",
        username: "@sinnayuh"
      }
    ];
</script>

<div class="mt-6 w-full max-w-6xl mx-auto">
  <!-- Introduction -->
  <div class="md:w-2/3 space-y-2">
    <h1 class="text-4xl font-bold text-white max-w-3xl">Developer, Linux nerd (i use arch btw), Docker activist, Scripter and gamer.</h1>
    <p class="text-gray-400 text-sm leading-relaxed max-w-xl">
      I'm sin, a developer and system administrator based in the United Kingdom.
      I make sure all of Flyte's services stay online and secure, where developers can create producuts to empower freelancers and our clients.
    </p>
  </div>
</div>

<div class="mt-6 w-full max-w-6xl mx-auto">
  <!-- Top Row: Skills & Contact -->
  <div class="flex flex-col md:flex-row gap-8 mb-8">
    <!-- Skills & Tools -->
    <div class="md:w-2/3">
      <div class="border border-gray-800 p-6 rounded-lg h-full backdrop-blur-sm">
        <h2 class="text-2xl font-bold mb-4">Skills & Tools</h2>
        <div class="space-y-6">
          <div>
            <h3 class="text-gray-400 text-sm mb-3">My Tech-stack, all the tools & languages I am capable of using.</h3>
            <div class="flex flex-wrap gap-3">
              {#each skills.development as skill}
                <div class="flex items-center gap-2 px-3 py-2 border border-gray-800 rounded-md hover:border-gray-600 transition-colors">
                  <svelte:component this={skill.icon} class="w-4 h-4" />
                  <span class="text-xs text-gray-300">{skill.name}</span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact -->
    <div class="md:w-1/3">
      <div class="border border-gray-800 p-4 rounded-lg h-full backdrop-blur-sm">
        <h2 class="text-xl font-bold mb-2">Contact</h2>
        <p class="text-gray-400 text-xs mb-3">
          Feel free to reach out to me on any of the following platforms.
        </p>
        <div class="flex flex-col gap-2">
          {#each contacts as contact}
            <a 
              href={contact.link}
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 px-3 py-2 border border-gray-800 rounded-md hover:border-gray-600 transition-colors group"
            >
              <svelte:component 
                this={contact.icon} 
                class="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" 
              />
              <div class="flex flex-col">
                <span class="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                  {contact.name}
                </span>
                <span class="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  {contact.username}
                </span>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Row: Projects (Full Width) -->
  <div class="border border-gray-800 p-6 rounded-lg backdrop-blur-sm">
    <h2 class="text-2xl font-bold mb-4">Projects</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      {#each projects as project}
        <a 
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          class="block border border-gray-800 rounded-md p-4 hover:border-gray-600 transition-colors"
        >
          <h3 class="text-lg font-bold text-white mb-1">{project.title}</h3>
          <p class="text-gray-400 text-sm mb-2">{project.description}</p>
          <div class="flex flex-wrap gap-2">
            {#each project.technologies as tech}
              <span class="px-2 py-1 border border-gray-800 rounded-md text-xs text-gray-300">
                {tech}
              </span>
            {/each}
          </div>
        </a>
      {/each}
    </div>
  </div>
</div>