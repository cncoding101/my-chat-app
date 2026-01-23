import type { Role, Message as PrismaMessage } from '@prisma/client';
import z from 'zod';

type MessageResponse = Pick<PrismaMessage, 'id' | 'content'> & {
	role: Role;
};

const messageRequestSchema = z.object({
	content: z.string().min(1)
});

type MessageRequest = z.infer<typeof messageRequestSchema>;

// Zod schemas that match Prisma types (satisfies ensures type safety)
const messageResponseSchema = z.object({
	id: z.string(),
	content: z.string(),
	role: z.custom<Role>()
}) satisfies z.ZodType<MessageResponse>;

type Message = z.infer<typeof messageResponseSchema>;

export { messageResponseSchema, messageRequestSchema };
export type { MessageResponse, Message, MessageRequest };
