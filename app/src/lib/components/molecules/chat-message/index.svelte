<script lang="ts">
	import { tv } from 'tailwind-variants';
	import { Text } from '@/components/atoms/text';
	import { type Role, RoleEnum } from '@/schemas/api/chat';
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
				[RoleEnum.USER]: 'justify-start',
				[RoleEnum.ASSISTANT]: 'justify-end'
			}
		}
	});

	const messageVariants = tv({
		base: 'p-2 rounded-lg max-w-[80%]',
		variants: {
			role: {
				[RoleEnum.USER]: 'bg-primary text-primary-foreground',
				[RoleEnum.ASSISTANT]: 'bg-accent text-accent-foreground'
			}
		}
	});
</script>

<div class={containerVariants({ role })}>
	<div class={cn(messageVariants({ role }))}>
		<Text variant="paragraph">{message}</Text>
	</div>
</div>
