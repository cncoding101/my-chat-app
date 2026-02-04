<script lang="ts">
	import { Icon } from '@/components/atoms/icon';
	import { Text } from '@/components/atoms/text';
	import { ChatMessage } from '@/components/molecules/chat-message';
	import type { Message } from '@/schemas/api';

	interface Props {
		messages: Message[];
		isPending?: boolean;
		errorMessage?: string | null;
	}

	let { messages, isPending = false, errorMessage = null }: Props = $props();
</script>

<ul>
	{#each messages as message (message.id)}
		<li class="m-2">
			<ChatMessage message={message.content} role={message.role} />
		</li>
	{/each}

	{#if isPending}
		<li class="m-2">
			<div class="text-muted-foreground flex items-center gap-2">
				<div class="flex gap-1">
					<span class="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"
					></span>
					<span class="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"
					></span>
					<span class="bg-primary h-2 w-2 animate-bounce rounded-full"></span>
				</div>
				<Text variant="label" class="text-muted-foreground font-normal">AI is thinking...</Text>
			</div>
		</li>
	{/if}

	{#if errorMessage}
		<li class="m-2">
			<div class="bg-error/10 text-error flex items-center gap-2 rounded-md border p-3">
				<Icon variant={{ type: 'outlined', icon: 'error' }} class="shrink-0" />
				<Text variant="label" class="font-normal">{errorMessage}</Text>
			</div>
		</li>
	{/if}
</ul>
