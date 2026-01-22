<script lang="ts">
	import { cn } from '$lib/utils/helpers/shadcn';
	import Icon, { type Variant } from '@/components/atoms/icon/index.svelte';

	interface Props {
		href: string;
		icon: Variant;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { href, icon, class: className, children }: Props = $props();
</script>

<a {href} class={cn('flex items-center rounded-md px-3 py-2 text-sm font-medium', className)}>
	<span class="truncate">
		{@render children?.()}
	</span>
	<Icon variant={icon} size="1rem" class="text-primary ml-2" />
</a>
