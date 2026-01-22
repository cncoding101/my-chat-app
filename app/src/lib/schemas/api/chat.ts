import type {
	Role as PrismaRole,
	Chat as PrismaChat,
	Message as PrismaMessage
} from '@prisma/client';
import { z } from 'zod';

const ROLES = {
	ASSISTANT: 'ASSISTANT',
	USER: 'USER'
} as const;

type Role = Exclude<PrismaRole, 'TOOL'>;
type Chat = PrismaChat;
type ChatWithMessages = Chat & {
	messages: MessageResponse[];
};

// Response types - Pick only required fields from Prisma models
type MessageResponse = Pick<PrismaMessage, 'id' | 'content'> & {
	role: Role;
};

type ChatResponse = Pick<Chat, 'id' | 'title'> & {
	messages?: MessageResponse[];
};

// Zod schemas that match Prisma types (satisfies ensures type safety)
const messageResponseSchema = z.object({
	id: z.string(),
	content: z.string(),
	role: z.custom<Role>()
}) satisfies z.ZodType<MessageResponse>;

type Message = z.infer<typeof messageResponseSchema>;

const chatResponseSchema = z.object({
	id: z.string(),
	title: z.string().nullable(),
	messages: z.array(messageResponseSchema).optional()
}) satisfies z.ZodType<ChatResponse>;

// Response schema
const createChatResponseSchema = chatResponseSchema;
type CreateChatResponseSchema = z.infer<typeof createChatResponseSchema>;

const removeChatIdParamSchema = z.object({
	id: z.string()
});
type RemoveChatIdParamSchema = z.infer<typeof removeChatIdParamSchema>;

export {
	ROLES,
	messageResponseSchema,
	chatResponseSchema,
	createChatResponseSchema,
	removeChatIdParamSchema
};
export type {
	Role,
	Chat,
	ChatWithMessages,
	MessageResponse,
	ChatResponse,
	Message,
	CreateChatResponseSchema,
	RemoveChatIdParamSchema
};
