import { tv } from 'tailwind-variants';
import { Text } from '@/components/atoms/Text';
import { MessageResponseRole } from '@/api/generated/server.client';
import { cn } from '@/utils/helpers/cn';

interface ChatMessageProps {
  message: string;
  role: MessageResponseRole;
}

const containerVariants = tv({
  base: 'flex w-full',
  variants: {
    role: {
      [MessageResponseRole.USER]: 'justify-start',
      [MessageResponseRole.ASSISTANT]: 'justify-end',
      [MessageResponseRole.TOOL]: 'justify-end',
    },
  },
});

const messageVariants = tv({
  base: 'p-2 rounded-lg max-w-[80%]',
  variants: {
    role: {
      [MessageResponseRole.USER]: 'bg-primary text-primary-content',
      [MessageResponseRole.ASSISTANT]: 'bg-secondary text-secondary-content',
      [MessageResponseRole.TOOL]: 'bg-accent text-accent-content',
    },
  },
});

export const ChatMessage = ({ message, role }: ChatMessageProps) => {
  return (
    <div className={containerVariants({ role })}>
      <div className={cn(messageVariants({ role }))}>
        <Text variant="paragraph">{message}</Text>
      </div>
    </div>
  );
};
