<script lang="ts">
	import { ChatInputControls } from '../chat-input-controls';
	import { Textarea } from '@/components/molecules/textarea';

	interface Props {
		height?: {
			min: number;
			max: number;
		};
		sendMessage: (message: string) => void;
	}

	let { height = { min: 4, max: 8 }, sendMessage }: Props = $props();

	let message = $state('');

	const handleSend = () => {
		if (message.trim()) {
			sendMessage(message);
			message = '';
		}
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			handleSend();
		}
	};
</script>

<div class="border-neutral-content/20 flex w-[80%] flex-row rounded-4xl border">
	<Textarea
		variant="chat"
		bind:value={message}
		style={`min-height: ${height.min}rem; max-height: ${height.max}rem;`}
		class="p-6"
		onkeydown={handleKeydown}
	/>

	<div class="flex items-center">
		<ChatInputControls />
	</div>
</div>
