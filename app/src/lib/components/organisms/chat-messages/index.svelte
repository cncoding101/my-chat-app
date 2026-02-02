<script lang="ts">
	import { Icon } from '@/components/atoms/icon';
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
				<span class="text-sm">AI is thinking...</span>
			</div>
		</li>
	{/if}

	{#if errorMessage}
		<li class="m-2">
			<div
				class="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border p-3"
			>
				<Icon variant={{ type: 'outlined', icon: 'error' }} size="1.25rem" class="shrink-0" />
				<span class="text-sm">{errorMessage}</span>
			</div>
		</li>
	{/if}
</ul>
