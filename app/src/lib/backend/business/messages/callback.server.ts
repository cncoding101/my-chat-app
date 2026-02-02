import { Role } from '@prisma/enums';
import { error } from '@sveltejs/kit';
import type { z } from 'zod';
import { chatEventBus } from '@/backend/event-bus.server';
import { messageRepository } from '@/backend/repositories';
import type { chatCallbackPayloadSchema } from '@/schemas/api';

type ChatCallbackPayload = z.infer<typeof chatCallbackPayloadSchema>;

export default async (chatId: string, payload: ChatCallbackPayload) => {
	if (payload.error != null) {
		console.error(`Worker reported error for chat ${chatId}: ${payload.error}`);
		// Notify the UI about the error via SSE
		chatEventBus.publishError(chatId, payload.error);
		error(400, 'Failed to process message');
	}

	// Save the assistant's response to the database
	const message = await messageRepository.create({
		chatId: chatId,
		content: payload.response,
		role: Role.ASSISTANT
	});

	if (!message) {
		console.error(`Failed to save assistant message for chat ${chatId}`);
		chatEventBus.publishError(chatId, 'Failed to process message, please try again.');
		error(400, 'Failed to save assistant message');
	}

	// Publish to event bus for SSE subscribers
	chatEventBus.publishMessage(chatId, {
		id: message.id,
		content: message.content,
		role: message.role
	});

	return { status: 'success', messageId: message.id };
};
