<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { Button } from '@/components/atoms/button';
	import { Icon } from '@/components/atoms/icon';
	import { LoadingSpinner } from '@/components/atoms/loading-spinner';

	interface Props {
		icon: ComponentProps<typeof Icon>;
		button: ComponentProps<typeof Button>;
		children?: Snippet;
		isLoading?: boolean;
	}

	let { icon, button, children, isLoading = false }: Props = $props();
</script>

<Button {...button}>
	{@render children?.()}
	{#if isLoading}
		<LoadingSpinner />
	{:else}
		<Icon {...icon} />
	{/if}
</Button>
