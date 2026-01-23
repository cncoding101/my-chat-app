import type { Chat as PrismaChat } from '@prisma/client';
import { z } from 'zod';
import { messageResponseSchema, type MessageResponse } from '.';

// to avoid import issues with prisma enums as they are performed at runtime
const ROLES = {
	ASSISTANT: 'ASSISTANT',
	USER: 'USER',
	TOOL: 'TOOL'
} as const;

type Role = (typeof ROLES)[keyof typeof ROLES];
type Chat = PrismaChat;
type ChatWithMessages = Chat & {
	messages: MessageResponse[];
};

type ChatResponse = Pick<Chat, 'id' | 'title'> & {
	messages?: MessageResponse[];
};

const chatResponseSchema = z.object({
	id: z.string(),
	title: z.string().nullable(),
	messages: z.array(messageResponseSchema).optional()
}) satisfies z.ZodType<ChatResponse>;

// Response schema
const createChatResponseSchema = chatResponseSchema;
type CreateChatResponseSchema = z.infer<typeof createChatResponseSchema>;

const chatIdParamSchema = z.object({
	id: z.string()
});
type ChatIdParamSchema = z.infer<typeof chatIdParamSchema>;

const removeChatResponseSchema = z.object({
	success: z.boolean()
});
type RemoveChatReponseSchema = z.infer<typeof removeChatResponseSchema>;

export {
	ROLES,
	chatResponseSchema,
	createChatResponseSchema,
	chatIdParamSchema,
	removeChatResponseSchema
};
export type {
	Role,
	Chat,
	ChatWithMessages,
	ChatResponse,
	CreateChatResponseSchema,
	ChatIdParamSchema,
	RemoveChatReponseSchema
};
