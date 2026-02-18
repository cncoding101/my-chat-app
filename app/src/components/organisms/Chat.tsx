import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createMessage } from '@/api/messages';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { useChatEvents } from '@/hooks/useChatEvents';
import type { MessageResponse } from '@/api/generated/server.client';

interface ChatProps {
  initialMessages?: MessageResponse[];
  chatId: string;
}

export const Chat = ({ initialMessages = [], chatId }: ChatProps) => {
  const [messages, setMessages] = useState<MessageResponse[]>(initialMessages);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSSEMessage = useCallback((message: MessageResponse) => {
    setMessages((prev) => [...prev, message]);
    setIsPending(false);
    setErrorMessage(null);
  }, []);

  const handleSSEError = useCallback((error: string) => {
    setIsPending(false);
    setErrorMessage(error);
  }, []);

  useChatEvents(chatId, {
    onMessage: handleSSEMessage,
    onError: handleSSEError,
  });

  const mutation = useMutation({
    mutationFn: (content: string) => createMessage(chatId, { content }),
    onSuccess: (newMessage: MessageResponse) => {
      setMessages((prev) => [...prev, newMessage]);
      setIsPending(true);
      setErrorMessage(null);
    },
    onError: (error) => {
      setIsPending(false);
      throw error;
    },
  });

  return (
    <div className="grid h-full grid-rows-[1fr_auto]">
      <div className="overflow-y-auto">
        <ChatMessages messages={messages} isPending={isPending} errorMessage={errorMessage} />
      </div>
      <div className="flex justify-center">
        <ChatInput sendMessage={(message: string) => mutation.mutate(message)} />
      </div>
    </div>
  );
};
