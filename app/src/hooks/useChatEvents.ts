import { useEffect, useRef, useState, useCallback } from 'react';
import type { MessageResponse } from '@/api/generated/server.client';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface ChatEventsCallbacks {
  onMessage: (message: MessageResponse) => void;
  onError?: (error: string) => void;
}

export const useChatEvents = (chatId: string, callbacks: ChatEventsCallbacks) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setStatus('disconnected');
    }
  }, []);

  const connect = useCallback(() => {
    if (eventSourceRef.current) return;

    setStatus('connecting');
    setError(null);

    const es = new EventSource(`/api/chats/${chatId}/events`);
    eventSourceRef.current = es;

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
  }, [chatId]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { status, error, connect, disconnect };
};
