import { useMutation } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import type { MessageResponse } from '@/api/generated/server.client';
import { createMessage } from '@/api/messages';
import { useChatEvents } from '@/hooks/useChatEvents';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';

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
		onError: handleSSEError
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
		}
	});

	return (
		<div className="grid h-full grid-rows-[1fr_auto]">
			<div className="relative">
				<div className="absolute inset-0 overflow-y-auto py-2">
					<ChatMessages messages={messages} isPending={isPending} errorMessage={errorMessage} />
				</div>
			</div>
			<div className="flex justify-center">
				<ChatInput sendMessage={(message: string) => mutation.mutate(message)} />
			</div>
		</div>
	);
};
