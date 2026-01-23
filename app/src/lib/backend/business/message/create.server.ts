import { error } from '@sveltejs/kit';
import { messageRepository } from '@/backend/repository';
import type { MessageRequest } from '@/schemas/api';

export default async (id: string, { content }: MessageRequest) => {
	const message = await messageRepository.create({ chatId: id, content });

	if (!message) {
		error(400, 'Failed to create message');
	}

	return message;
};
