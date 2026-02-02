import type { Message } from '@/schemas/api';

// Event types for SSE
export type ChatEvent =
	| { type: 'message'; data: Message }
	| { type: 'error'; data: { message: string } };

type ChatEventCallback = (event: ChatEvent) => void;

/**
 * Simple in-memory pub/sub event bus for SSE real-time updates.
 * Each chat ID can have multiple subscribers (browser connections).
 */
class ChatEventBus {
	private subscribers = new Map<string, Set<ChatEventCallback>>();

	/**
	 * Subscribe to events for a specific chat.
	 * @returns Unsubscribe function
	 */
	subscribe(chatId: string, callback: ChatEventCallback): () => void {
		if (!this.subscribers.has(chatId)) {
			this.subscribers.set(chatId, new Set());
		}

		this.subscribers.get(chatId)!.add(callback);

		// Return unsubscribe function
		return () => {
			const callbacks = this.subscribers.get(chatId);
			if (callbacks) {
				callbacks.delete(callback);
				if (callbacks.size === 0) {
					this.subscribers.delete(chatId);
				}
			}
		};
	}

	/**
	 * Publish a message to all subscribers of a chat.
	 */
	publishMessage(chatId: string, message: Message): void {
		this.publish(chatId, { type: 'message', data: message });
	}

	/**
	 * Publish an error to all subscribers of a chat.
	 */
	publishError(chatId: string, errorMessage: string): void {
		this.publish(chatId, { type: 'error', data: { message: errorMessage } });
	}

	private publish(chatId: string, event: ChatEvent): void {
		const callbacks = this.subscribers.get(chatId);
		if (callbacks) {
			for (const callback of callbacks) {
				try {
					callback(event);
				} catch (error) {
					console.error(`Error in chat event callback for ${chatId}:`, error);
				}
			}
		}
	}

	/**
	 * Get the number of subscribers for a chat (useful for debugging).
	 */
	getSubscriberCount(chatId: string): number {
		return this.subscribers.get(chatId)?.size ?? 0;
	}
}

// Singleton instance
export const chatEventBus = new ChatEventBus();
