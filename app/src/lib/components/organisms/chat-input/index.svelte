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

<div class="flex flex-row rounded-sm border p-2">
	<Textarea
		variant="chat"
		bind:value={message}
		style={`min-height: ${height.min}rem; max-height: ${height.max}rem;`}
		onkeydown={handleKeydown}
	/>

	<div class="flex items-center">
		<ChatInputControls onSend={handleSend} />
	</div>
</div>
