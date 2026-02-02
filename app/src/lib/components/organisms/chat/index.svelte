<script lang="ts">
	import { createMutation } from '@tanstack/svelte-query';
	import { onDestroy } from 'svelte';
	import { create } from '@/api/messages';
	import { ChatInput } from '@/components/organisms/chat-input';
	import { ChatMessages } from '@/components/organisms/chat-messages';
	import { useChatEvents } from '@/hooks';
	import type { Message, MessageRequest } from '@/schemas/api';

	interface Props {
		initialMessages?: Message[];
		chatId: string;
	}

	let { initialMessages = [], chatId }: Props = $props();

	let messages = $state<Message[]>(initialMessages);
	let isPending = $state(false);
	let errorMessage = $state<string | null>(null);

	// Subscribe to real-time messages via SSE
	const chatEvents = useChatEvents(chatId, {
		onMessage: (message) => {
			// Add the AI response to messages
			messages.push(message);
			isPending = false;
			errorMessage = null;
		},
		onError: (error) => {
			// Handle worker/LLM errors
			isPending = false;
			errorMessage = error;
		}
	});

	// Cleanup SSE connection on component destroy
	onDestroy(() => {
		chatEvents.disconnect();
	});

	const mutation = createMutation(() => ({
		mutationFn: (payload: MessageRequest) => create({ id: chatId }, payload),
		onSuccess: (newMessage: Message) => {
			messages.push(newMessage);
			// Now waiting for AI response via SSE
			isPending = true;
			errorMessage = null;
		},
		onError: (error) => {
			isPending = false;
			throw error;
		}
	}));
</script>

<div class="grid h-full grid-rows-[1fr_auto]">
	<div class="overflow-y-auto">
		<ChatMessages {messages} {isPending} {errorMessage} />
	</div>

	<ChatInput sendMessage={(message: string) => mutation.mutate({ content: message })} />
</div>
