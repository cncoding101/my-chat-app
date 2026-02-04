<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { fly } from 'svelte/transition';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import { create, remove } from '@/api/chats';
	import { ButtonIcon } from '@/components/molecules/button-icon';
	import { LinkIcon } from '@/components/molecules/link-icon';
	import type { Chat, ChatIdParamSchema } from '@/schemas/api/chat';

	interface Props {
		chats: Chat[];
	}

	let { chats }: Props = $props();

	const mutation = createMutation(() => ({
		mutationFn: create,
		onSuccess: async (newChat: Chat) => {
			await invalidate('app:chats');

			goto(`/chats/${newChat.id}`);
		},
		onError: (error) => {
			throw error;
		}
	}));

	const deleteMutation = createMutation(() => ({
		mutationFn: (chatId: ChatIdParamSchema) => remove(chatId),
		onSuccess: async (_, params) => {
			await invalidate('app:chats');

			if (page.url.pathname === `/chats/${params.id}`) {
				goto('/');
			}
		},
		onError: (error) => {
			throw error;
		}
	}));
</script>

<aside class="bg-neutral flex h-full flex-col">
	<div class="p-4">
		<ButtonIcon
			icon={{ variant: { type: 'outlined', icon: 'add' } }}
			isLoading={mutation.isPending}
			button={{
				variant: 'default',
				class: 'w-full',
				onclick: () => mutation.mutate(),
				disabled: mutation.isPending
			}}
		>
			New Chat
		</ButtonIcon>
	</div>

	<nav class="flex flex-1 overflow-y-auto px-2 py-2">
		<div class="w-full space-y-1">
			{#if chats.length === 0}
				<div class="px-2 py-4 text-center text-sm">No chats yet</div>
			{:else}
				{#each chats as chat, i (chat.id)}
					<div
						in:fly={{ x: -20, duration: 200, delay: i * 50 }}
						class:bg-gray-200={page.url.pathname === `/chats/${chat.id}`}
						class="flex justify-between transition-colors hover:bg-gray-200"
					>
						<LinkIcon
							href="/chats/{chat.id}"
							icon={{ type: 'outlined', icon: 'chat' }}
							class="flex-1"
						>
							{chat.title || 'New Chat'}
						</LinkIcon>

						<ButtonIcon
							icon={{
								variant: { type: 'outlined', icon: 'delete' },
								class: 'text-primary',
								size: '1.25rem'
							}}
							button={{
								variant: 'ghost',
								onclick: () => deleteMutation.mutate({ id: chat.id })
							}}
						></ButtonIcon>
					</div>
				{/each}
			{/if}
		</div>
	</nav>
</aside>
