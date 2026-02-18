import { create } from 'zustand';
import type { MessageResponseRole } from '@/api/generated/server.client';

export interface ChatMessage {
  id: string;
  role: MessageResponseRole;
  content: string;
  createdAt: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...message, id: crypto.randomUUID(), createdAt: new Date() },
      ],
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  clear: () => set({ messages: [], isLoading: false }),
}));
