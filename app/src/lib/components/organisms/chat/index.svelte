<script lang="ts">
	// import { sendMessage } from '@/api/chat';
	import { createMutation } from '@tanstack/svelte-query';
	import { create } from '@/api/message';
	import { ChatInput } from '@/components/organisms/chat-input';
	import { ChatMessages } from '@/components/organisms/chat-messages';
	import type { Message, MessageRequest } from '@/schemas/api';

	interface Props {
		initialMessages?: Message[];
		chatId: string;
	}

	let { initialMessages = [], chatId }: Props = $props();

	let messages = $state<Message[]>(initialMessages);

	const mutatation = createMutation(() => ({
		mutationFn: (payload: MessageRequest) => create({ id: chatId }, payload),
		onSuccess: (newMessage: Message) => {
			messages.push(newMessage);
		},
		onError: (error) => {
			throw error;
		}
	}));
</script>

<div class="grid h-full grid-rows-[1fr_auto]">
	<div class="overflow-y-auto">
		<ChatMessages {messages} />
	</div>

	<ChatInput sendMessage={(message: string) => mutatation.mutate({ content: message })} />
</div>
