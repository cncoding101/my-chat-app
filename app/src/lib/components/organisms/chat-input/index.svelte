<script lang="ts">
	import { ChatInputControls } from '../chat-input-controls';
	import { Textarea } from '@/components/molecules/textarea';

	interface Props {
		height?: {
			min: number;
			max: number;
		};
	}

	let { height = { min: 4, max: 8 } }: Props = $props();
</script>

<div class="flex flex-row rounded-sm border p-2">
	<Textarea variant="chat" style={`min-height: ${height.min}rem; max-height: ${height.max}rem;`} />

	<ChatInputControls />
</div>
