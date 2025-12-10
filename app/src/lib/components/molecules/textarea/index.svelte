<script lang="ts" module>
	import { tv, type VariantProps } from 'tailwind-variants';
	import { cn, type WithElementRef, type WithoutChildren } from '$lib/utils/helpers/shadcn.js';

	export const textareaVariants = tv({
		base: 'h-full',
		variants: {
			variant: {
				default:
					'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
				chat: 'w-full resize-none overflow-y-auto wrap-break-word border-none p-1 focus:outline-none focus-visible:outline-none field-sizing-content'
			}
		}
	});

	export type TextareaVariant = VariantProps<typeof textareaVariants>['variant'];
	export type Props = WithoutChildren<WithElementRef<HTMLTextareaAttributes>> & {
		variant: TextareaVariant;
	};
</script>

<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		'data-slot': dataSlot = 'textarea',
		variant = 'default',
		...restProps
	}: Props = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(textareaVariants({ variant }), className)}
	bind:value
	{...restProps}
></textarea>
