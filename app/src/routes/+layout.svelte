<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import GlobalErrorHandler from '$lib/components/GlobalErrorHandler.svelte';
	import { navbarStore } from '$lib/stores';
	import { preloadIcons } from '@/components/atoms/icon';
	import { LoadingScreen } from '@/components/molecules/loading-screen';
	import { Sidebar } from '@/components/organisms/sidebar';

	let { children, data } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: typeof window !== 'undefined'
			}
		}
	});

	// Initialize the navbar store with server-side data to prevent flashing
	navbarStore.setServerOpen(data.sidebarOpen);

	onMount(() => {
		navbarStore.initialize();
		preloadIcons();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<GlobalErrorHandler>
		{#await data.chats}
			<LoadingScreen />
		{:then chats}
			<div class="grid h-screen grid-cols-12 overflow-hidden">
				<aside class="col-span-2 transition-all duration-300" class:hidden={!navbarStore.isOpen}>
					<Sidebar {chats} />
				</aside>

				<div
					class:md:col-span-10={navbarStore.isOpen}
					class:md:col-span-12={!navbarStore.isOpen}
					class="flex h-full flex-col"
				>
					<header class="sticky top-0 z-50 border-b bg-white shadow-sm">
						<div class="flex items-center justify-between px-4 py-3">
							<button
								onclick={() => navbarStore.toggle()}
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
		{/await}
	</GlobalErrorHandler>
</QueryClientProvider>
