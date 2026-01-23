<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { Text } from '@/components/atoms/text';
	import { type Role, ROLES } from '@/schemas/api/chat';
	import { cn } from '@/utils/helpers/shadcn';

	interface Props {
		message: string;
		role: Role;
	}

	let { message, role }: Props = $props();

	const containerVariants = tv({
		base: 'flex w-full',
		variants: {
			role: {
				[ROLES.USER]: 'justify-start',
				[ROLES.ASSISTANT]: 'justify-end',
				[ROLES.TOOL]: 'justify-end'
			}
		}
	});

	const messageVariants = tv({
		base: 'p-2 rounded-lg max-w-[80%]',
		variants: {
			role: {
				[ROLES.USER]: 'bg-primary text-primary-content',
				[ROLES.ASSISTANT]: 'bg-accent text-accent-content',
				[ROLES.TOOL]: 'bg-accent text-accent-content'
			}
		}
	});
</script>

<div class={containerVariants({ role })}>
	<div class={cn(messageVariants({ role }))}>
		<Text variant="paragraph">{message}</Text>
	</div>
</div>
