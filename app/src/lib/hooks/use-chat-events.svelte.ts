import { browser } from '$app/environment';
import type { Message } from '@/schemas/api';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface ChatEventsState {
	status: ConnectionStatus;
	lastMessage: Message | null;
	error: string | null;
}

interface ChatEventsCallbacks {
	onMessage: (message: Message) => void;
	onError?: (error: string) => void;
}

/**
 * Hook to subscribe to real-time chat message events via SSE.
 *
 * @param chatId - The chat ID to subscribe to
 * @param callbacks - Callbacks for message and error events
 * @returns Object with connection status and control methods
 */
export const useChatEvents = (chatId: string, callbacks: ChatEventsCallbacks) => {
	let eventSource: EventSource | null = null;

	const state = $state<ChatEventsState>({
		status: 'disconnected',
		lastMessage: null,
		error: null
	});

	const connect = () => {
		// Only connect in the browser (EventSource is not available on server)
		if (!browser || eventSource) {
			return;
		}

		state.status = 'connecting';
		state.error = null;

		eventSource = new EventSource(`/api/chats/${chatId}/events`);

		eventSource.onopen = () => {
			state.status = 'connected';
		};

		// Listen for 'message' events (AI responses)
		eventSource.addEventListener('message', (event) => {
			try {
				const message: Message = JSON.parse(event.data);
				state.lastMessage = message;
				callbacks.onMessage(message);
			} catch (err) {
				console.error('Failed to parse SSE message:', err);
			}
		});

		// Listen for 'error' events (worker errors)
		eventSource.addEventListener('error', (event) => {
			// Check if this is a named 'error' event with data, not a connection error
			if (event instanceof MessageEvent && event.data) {
				try {
					const errorData: { message: string } = JSON.parse(event.data);
					state.error = errorData.message;
					callbacks.onError?.(errorData.message);
				} catch (err) {
					console.error('Failed to parse SSE error:', err);
				}
			} else {
				// Connection error - throw so global error handler catches it
				state.status = 'error';
				state.error = 'Connection lost. Reconnecting...';
				throw new Error('SSE connection lost');
			}
		});
	};

	const disconnect = () => {
		if (eventSource) {
			eventSource.close();
			eventSource = null;
			state.status = 'disconnected';
		}
	};

	connect();
	return {
		get status() {
			return state.status;
		},
		get lastMessage() {
			return state.lastMessage;
		},
		get error() {
			return state.error;
		},
		connect,
		disconnect
	};
};
