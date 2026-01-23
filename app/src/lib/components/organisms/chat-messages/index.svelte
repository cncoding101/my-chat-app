<script lang="ts">
	import { ChatMessage } from '@/components/molecules/chat-message';
	import type { Message } from '@/schemas/api';

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
