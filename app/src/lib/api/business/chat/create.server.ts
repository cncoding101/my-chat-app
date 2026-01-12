import { error } from '@sveltejs/kit';
import { create } from '@/api/repository/chat.server';

export default async () => {
	const chat = await create();

	if (chat == null) {
		error(400, 'Failed to create chat');
	}

	return chat;
};
