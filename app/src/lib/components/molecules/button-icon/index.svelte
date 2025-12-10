<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Button } from '@/components/atoms/button';
	import { Icon } from '@/components/atoms/icon';

	interface Props {
		icon: ComponentProps<typeof Icon>;
		button: ComponentProps<typeof Button>;
	}

	let { icon, button }: Props = $props();
</script>

<Button {...button}>
	<Icon {...icon} />
</Button>
