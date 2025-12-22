<script lang="ts">
	import { Chat } from '@/components/organisms/chat';

	let { data } = $props();
</script>

<Chat initialMessages={data.chat.messages} />
