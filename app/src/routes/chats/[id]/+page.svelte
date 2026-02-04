<script lang="ts">
	import { Text } from '@/components/atoms/text';
	import { Chat } from '@/components/organisms/chat';

	let { data } = $props();
</script>

{#if data.chat}
	<Chat initialMessages={data.chat.messages} chatId={data.chat.id} />
{:else}
	<Text variant="paragraph">Chat not found</Text>
{/if}
