export const ROLES = {
  ASSISTANT: 'ASSISTANT',
  USER: 'USER',
  TOOL: 'TOOL',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface Message {
  id: string;
  content: string;
  role: Role;
}

export interface Chat {
  id: string;
  title: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

export interface MessageRequest {
  content: string;
}
