import { Injectable } from '@nestjs/common';

export interface MessageData {
  id: string;
  content: string;
  role: string;
}

export type ChatEvent =
  | { type: 'message'; data: MessageData }
  | { type: 'error'; data: { message: string } };

type ChatEventCallback = (event: ChatEvent) => void;

@Injectable()
export class ChatEventBus {
  private subscribers = new Map<string, Set<ChatEventCallback>>();

  subscribe(chatId: string, callback: ChatEventCallback): () => void {
    if (!this.subscribers.has(chatId)) {
      this.subscribers.set(chatId, new Set());
    }

    this.subscribers.get(chatId)!.add(callback);

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

  publishMessage(chatId: string, message: MessageData): void {
    this.publish(chatId, { type: 'message', data: message });
  }

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
}
