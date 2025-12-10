<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { cn } from '@/utils/helpers/shadcn';

	interface Props {
		message: string;
		role: 'user' | 'assistant';
	}

	let { message, role }: Props = $props();

	const containerVariants = tv({
		base: 'flex w-full',
		variants: {
			role: {
				user: 'justify-start',
				assistant: 'justify-end'
			}
		}
	});

	const messageVariants = tv({
		base: 'p-2 rounded-lg max-w-[80%]',
		variants: {
			role: {
				user: 'bg-primary text-primary-foreground',
				assistant: 'bg-accent text-accent-foreground'
			}
		}
	});
</script>

<div class={containerVariants({ role })}>
	<div class={cn(messageVariants({ role }))}>
		{message}
	</div>
</div>
