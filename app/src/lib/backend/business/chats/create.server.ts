import { error } from '@sveltejs/kit';
import { chatRepository } from '@/backend/repositories';
import type { CreateChatResponseSchema } from '@/schemas/api';

export default async (): Promise<CreateChatResponseSchema> => {
	const chat = await chatRepository.create();

	if (chat == null) {
		error(400, 'Failed to create chat');
	}

	return chat;
};
