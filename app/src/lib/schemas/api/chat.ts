import type {
	Role as PrismaRole,
	Chat as PrismaChat,
	Message as PrismaMessage
} from '@prisma/client';
import { z } from 'zod';

export const RoleEnum = {
	ASSISTANT: 'ASSISTANT',
	USER: 'USER'
} as const;

export type Role = Exclude<PrismaRole, 'TOOL'>;
export type Chat = PrismaChat;
export type ChatWithMessages = Chat & {
	messages: MessageResponse[];
};

// Response types - Pick only required fields from Prisma models
export type MessageResponse = Pick<PrismaMessage, 'id' | 'content'> & {
	role: Role;
};

export type ChatResponse = Pick<Chat, 'id' | 'title'> & {
	messages?: MessageResponse[];
};

// Zod schemas that match Prisma types (satisfies ensures type safety)
export const messageResponseSchema = z.object({
	id: z.string(),
	content: z.string(),
	role: z.custom<Role>()
}) satisfies z.ZodType<MessageResponse>;

export type Message = z.infer<typeof messageResponseSchema>;

export const chatResponseSchema = z.object({
	id: z.string(),
	title: z.string().nullable(),
	messages: z.array(messageResponseSchema).optional()
}) satisfies z.ZodType<ChatResponse>;

// Request schemas
export const createChatSchema = z.object({
	message: z.string().min(1, 'Message cannot be empty')
});
export type CreateChatSchema = z.infer<typeof createChatSchema>;

// Response schema
export const createChatResponseSchema = chatResponseSchema;
export type CreateChatResponseSchema = z.infer<typeof createChatResponseSchema>;
