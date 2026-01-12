<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { Button } from '@/components/atoms/button';
	import { Icon } from '@/components/atoms/icon';

	interface Props {
		icon: ComponentProps<typeof Icon>;
		button: ComponentProps<typeof Button>;
		children?: Snippet;
	}

	let { icon, button, children }: Props = $props();
</script>

<Button {...button}>
	{@render children?.()}
	<Icon {...icon} />
</Button>
