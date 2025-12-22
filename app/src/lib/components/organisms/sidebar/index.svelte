<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '@/components/atoms/button';
	import Icon from '@/components/atoms/icon/index.svelte';
	import { LinkIcon } from '@/components/molecules/link-icon';
	import type { Chat } from '@/schemas/api/chat';

	interface Props {
		chats: Chat[];
	}

	let { chats }: Props = $props();
</script>

<aside class="flex h-full flex-col border-r bg-gray-50">
	<div class="p-4">
		<Button href="/chat/new" variant="default" class="w-full justify-start">
			<Icon variant={{ type: 'outlined', icon: 'add' }} size="1rem" class="mr-2" />
			New Chat
		</Button>
	</div>

	<nav class="flex-1 overflow-y-auto px-2 py-2">
		<div class="space-y-1">
			{#if chats.length === 0}
				<div class="px-2 py-4 text-center text-sm text-gray-500">No chats yet</div>
			{:else}
				{#each chats as chat (chat.id)}
					<LinkIcon
						href="/chat/{chat.id}"
						icon={{ type: 'outlined', icon: 'chat' }}
						isActive={page.url.pathname === `/chat/${chat.id}`}
					>
						{chat.title || 'New Chat'}
					</LinkIcon>
				{/each}
			{/if}
		</div>
	</nav>
</aside>
