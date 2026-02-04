<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import GlobalErrorHandler from '$lib/components/GlobalErrorHandler.svelte';
	import { navbarStore } from '$lib/stores';
	import { page } from '$app/state';
	import { Button } from '@/components/atoms/button';
	import { Icon, preloadIcons } from '@/components/atoms/icon';
	import { Text } from '@/components/atoms/text';
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
					<header class="sticky top-0 z-50">
						<div class="flex items-center justify-between px-4 py-3">
							<Button
								variant="ghost"
								size="icon"
								onclick={() => navbarStore.toggle()}
								aria-label="Toggle sidebar"
							>
								<Icon variant={{ type: 'outlined', icon: 'menu' }} />
							</Button>
							<Text variant="heading" class="text-xl font-semibold">My Chat App</Text>
							<div class="w-10"></div>
						</div>
					</header>

					<main class="flex-1 overflow-hidden">
						{#key page.url.pathname}
							<div
								in:fade={{ duration: 150, delay: 100 }}
								out:fade={{ duration: 100 }}
								class="h-full p-4 md:p-6 lg:p-8"
							>
								{@render children()}
							</div>
						{/key}
					</main>
				</div>
			</div>
		{/await}
	</GlobalErrorHandler>
</QueryClientProvider>
