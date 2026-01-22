import { error } from '@sveltejs/kit';
import { remove } from '@/backend/repository/chat.server';
import type { RemoveChatIdParamSchema } from '@/schemas/api';

export default async ({ id }: RemoveChatIdParamSchema) => {
	const response = await remove(id);

	if (!response) {
		error(400, 'Failed to remove chat');
	}

	return response;
};
