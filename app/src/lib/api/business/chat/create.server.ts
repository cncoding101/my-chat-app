import { error } from '@sveltejs/kit';
import { create } from '@/api/repository/chat.server';
import type { CreateChatSchema } from '@/schemas/api/chat';

export default async ({ message }: CreateChatSchema) => {
	const chat = await create({ message });

	if (chat == null) {
		error(400, 'Failed to create chat');
	}

	return chat;
};
