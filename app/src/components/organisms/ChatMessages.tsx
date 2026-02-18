import { Icon } from '@/components/atoms/Icon';
import { Text } from '@/components/atoms/Text';
import { ChatMessage } from '@/components/molecules/ChatMessage';
import type { MessageResponse } from '@/api/generated/server.client';

interface ChatMessagesProps {
  messages: MessageResponse[];
  isPending?: boolean;
  errorMessage?: string | null;
}

export const ChatMessages = ({
  messages,
  isPending = false,
  errorMessage = null,
}: ChatMessagesProps) => {
  return (
    <ul>
      {messages.map((message) => (
        <li key={message.id} className="m-2">
          <ChatMessage message={message.content} role={message.role} />
        </li>
      ))}

      {isPending && (
        <li className="m-2">
          <div className="text-muted-foreground flex items-center gap-2">
            <div className="flex gap-1">
              <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" />
              <span className="bg-primary h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" />
              <span className="bg-primary h-2 w-2 animate-bounce rounded-full" />
            </div>
            <Text variant="label" className="text-muted-foreground font-normal">
              AI is thinking...
            </Text>
          </div>
        </li>
      )}

      {errorMessage && (
        <li className="m-2">
          <div className="bg-error/10 text-error flex items-center gap-2 rounded-md border p-3">
            <Icon
              variant={{ type: 'outlined', icon: 'error' }}
              className="shrink-0"
            />
            <Text variant="label" className="font-normal">
              {errorMessage}
            </Text>
          </div>
        </li>
      )}
    </ul>
  );
};
