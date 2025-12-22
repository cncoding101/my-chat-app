<script lang="ts">
	import { ButtonIcon } from '$lib/components/molecules/button-icon';

	interface Props {
		onSend: () => void;
	}

	let { onSend }: Props = $props();
</script>

<ButtonIcon
	icon={{ variant: { type: 'outlined', icon: 'send' } }}
	button={{ variant: 'ghost', size: 'icon', onclick: onSend }}
/>
