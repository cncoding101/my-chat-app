<script lang="ts">
	import { cn } from '$lib/utils/helpers/shadcn';
	import Icon, { type Variant } from '@/components/atoms/icon/index.svelte';

	interface Props {
		href: string;
		icon: Variant;
		isActive?: boolean;
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { href, icon, isActive = false, class: className, children }: Props = $props();
</script>

<a
	{href}
	class={cn(
		'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-200',
		isActive && 'bg-gray-200',
		className
	)}
>
	<Icon variant={icon} size="1rem" class="mr-2 text-gray-500" />
	<span class="truncate">
		{@render children?.()}
	</span>
</a>
