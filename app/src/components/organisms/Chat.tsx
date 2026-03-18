import { useMutation } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { MessageResponseRole, type MessageResponse } from '@/api/generated/server.client';
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

	const handleSSEMessage = useCallback((message: MessageResponse) => {
		setMessages((prev) => {
			const exists = prev.some((m) => m.id === message.id);
			return exists ? prev : [...prev, message];
		});
		if (message.role === MessageResponseRole.ASSISTANT) {
			setIsPending(false);
		}
	}, []);

	const handleSSEError = useCallback((error: string) => {
		setIsPending(false);
		setMessages((prev) => [
			...prev,
			{
				id: `${Date.now()}`,
				content: error,
				role: MessageResponseRole.ASSISTANT,
				error
			}
		]);
	}, []);

	useChatEvents(chatId, {
		onMessage: handleSSEMessage,
		onError: handleSSEError
	});

	const mutation = useMutation({
		mutationFn: (content: string) => createMessage(chatId, { content }),
		onMutate: (content: string) => {
			setMessages((prev) => [
				...prev,
				{ id: `${Date.now()}`, content, role: MessageResponseRole.USER }
			]);
			setIsPending(true);
		},
		onError: () => {
			setIsPending(false);
		}
	});

	return (
		<div className="mx-auto grid h-full max-w-4xl grid-rows-[1fr_auto]">
			<div className="relative">
				<div className="absolute inset-0 overflow-y-auto py-2">
					<ChatMessages messages={messages} isPending={isPending} />
				</div>
			</div>
			<div className="flex justify-center">
				<ChatInput sendMessage={(message: string) => mutation.mutate(message)} />
			</div>
		</div>
	);
};
