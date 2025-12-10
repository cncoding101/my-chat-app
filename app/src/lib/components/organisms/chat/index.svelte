<script lang="ts">
	import { ChatMessages } from '@/components/molecules/chat-messages';
	import { ChatInput } from '@/components/organisms/chat-input';
</script>

<div class="grid h-full grid-rows-[1fr_auto]">
	<div class="overflow-y-auto">
		<ChatMessages
			messages={[
				{
					id: '1',
					chatId: '1',
					role: 'user',
					content: 'Hello, how are you?'
				},
				{
					id: '2',
					chatId: '1',
					role: 'assistant',
					content: "I'm good, thank you!"
				}
			]}
		/>
	</div>

	<ChatInput />
</div>
