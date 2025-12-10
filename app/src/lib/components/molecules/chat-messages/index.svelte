<script lang="ts" module>
	export type Message = {
		id: string;
		chatId: string;
		role: 'user' | 'assistant';
		content: string;
	};
</script>

<script lang="ts">
	import { ChatMessage } from '$lib/components/atoms/chat-message';

	interface Props {
		messages: Message[];
	}

	let { messages }: Props = $props();
</script>

<ul>
	{#each messages as message (message.id)}
		<li class="m-2">
			<ChatMessage message={message.content} role={message.role} />
		</li>
	{/each}
</ul>
