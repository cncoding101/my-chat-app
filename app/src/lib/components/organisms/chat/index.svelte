<script lang="ts">
	// import { sendMessage } from '@/api/chat';
	import { ChatInput } from '@/components/organisms/chat-input';
	import { ChatMessages } from '@/components/organisms/chat-messages';
	import type { Message } from '@/schemas/api/chat';

	let { initialMessages = [] }: { initialMessages?: Message[] } = $props();

	let messages = $state<Message[]>(initialMessages);

	const handleSendMessage = async (message: string) => {
		// await sendMessage(message);
	};
</script>

<div class="grid h-full grid-rows-[1fr_auto]">
	<div class="overflow-y-auto">
		<ChatMessages {messages} />
	</div>

	<ChatInput sendMessage={handleSendMessage} />
</div>
