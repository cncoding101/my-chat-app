import { useEffect, useRef, useState } from 'react';
import type { MessageResponse } from '@/api/generated/server.client';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface ChatEventsCallbacks {
	onMessage: (message: MessageResponse) => void;
	onError?: (error: string) => void;
}

export const useChatEvents = (chatId: string, callbacks: ChatEventsCallbacks) => {
	const [status, setStatus] = useState<ConnectionStatus>('connecting');
	const [error, setError] = useState<string | null>(null);
	const callbacksRef = useRef(callbacks);

	useEffect(() => {
		callbacksRef.current = callbacks;
	});

	useEffect(() => {
		const es = new EventSource(`/api/chats/${chatId}/events`);

		es.onopen = () => {
			setStatus('connected');
		};

		es.addEventListener('message', (event) => {
			try {
				const message: MessageResponse = JSON.parse(event.data);
				callbacksRef.current.onMessage(message);
			} catch (err) {
				console.error('Failed to parse SSE message:', err);
			}
		});

		es.addEventListener('error', (event) => {
			if (event instanceof MessageEvent && event.data) {
				try {
					const errorData: { message: string } = JSON.parse(event.data);
					setError(errorData.message);
					callbacksRef.current.onError?.(errorData.message);
				} catch (err) {
					console.error('Failed to parse SSE error:', err);
				}
			} else {
				setStatus('error');
				setError('Connection lost. Reconnecting...');
			}
		});

		return () => {
			es.close();
			setStatus('disconnected');
		};
	}, [chatId]);

	return { status, error };
};
