<script lang="ts">
	import { Chat } from '@/components/organisms/chat';

	let { data } = $props();
</script>

{#if data.chat}
	<Chat initialMessages={data.chat.messages} chatId={data.chat.id} />
{:else}
	<p>Chat not found</p>
{/if}
