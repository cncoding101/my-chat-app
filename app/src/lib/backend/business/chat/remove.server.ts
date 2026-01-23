import { error } from '@sveltejs/kit';
import { chatRepository } from '@/backend/repository';
import type { ChatIdParamSchema, RemoveChatReponseSchema } from '@/schemas/api';

export default async ({ id }: ChatIdParamSchema): Promise<RemoveChatReponseSchema> => {
	const response = await chatRepository.remove(id);

	if (!response) {
		error(400, 'Failed to remove chat');
	}

	return { success: true };
};
