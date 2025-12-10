<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
	let sidebarOpen = $state(true);

	const toggleSidebar = () => {
		sidebarOpen = !sidebarOpen;
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="grid h-screen grid-cols-12 overflow-hidden">
	<aside
		class="col-span-2 border-r bg-gray-50 transition-all duration-300"
		class:hidden={!sidebarOpen}
	>
		<nav class="p-4">
			<div class="space-y-2">
				<div class="px-2 py-1 text-sm font-medium text-gray-600">Navigation</div>
			</div>
		</nav>
	</aside>

	<div
		class:md:col-span-10={sidebarOpen}
		class:md:col-span-12={!sidebarOpen}
		class="flex h-full flex-col"
	>
		<header class="sticky top-0 z-50 border-b bg-white shadow-sm">
			<div class="flex items-center justify-between px-4 py-3">
				<button
					onclick={toggleSidebar}
					class="rounded-md p-2 transition-colors hover:bg-gray-100"
					aria-label="Toggle sidebar"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>
				<h1 class="text-xl font-semibold">My Chat App</h1>
				<div class="w-10"></div>
			</div>
		</header>

		<main class="flex-1 overflow-hidden">
			<div class="h-full p-4 md:p-6 lg:p-8">
				{@render children()}
			</div>
		</main>
	</div>
</div>
