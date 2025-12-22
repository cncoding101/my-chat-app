<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tv } from 'tailwind-variants';
	import { cn } from '@/utils/helpers/shadcn';

	type Variant = keyof typeof ELEMENTS;

	const ELEMENTS = {
		heading: 'h1',
		subHeading: 'h2',
		label: 'label',
		paragraph: 'p'
	} as const;

	interface Props {
		variant: Variant;
		children: Snippet;
		class?: string;
	}

	const variants = tv({
		variants: {
			variant: {
				heading: 'text-2xl font-bold',
				subHeading: 'text-xl font-bold',
				label: 'text-sm font-medium',
				paragraph: 'text-base font-normal'
			}
		}
	});

	let { variant, children, class: className }: Props = $props();
</script>

<svelte:element this={ELEMENTS[variant]} class={cn(variants({ variant }), className)}>
	{@render children()}
</svelte:element>
