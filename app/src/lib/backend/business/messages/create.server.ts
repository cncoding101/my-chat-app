import { Role } from '@prisma/enums';
import { error } from '@sveltejs/kit';
import { messageRepository } from '@/backend/repositories';
import { workerService } from '@/backend/services';
import config from '@/config/sanitizedConfig.server';
import type { MessageRequest } from '@/schemas/api';

export default async (id: string, { content }: MessageRequest) => {
	const message = await messageRepository.create({ chatId: id, content, role: Role.USER });

	if (!message) {
		error(400, 'Failed to create message');
	}

	const { chatId } = message;
	const response = await workerService.triggerChat({
		chatId,
		message: content,
		callbackUrl: `${config.PUBLIC_APP_URL}/api/chats/${chatId}/messages/${message.id}/callback`
	});

	if (!response) {
		error(400, 'Failed to process the worker request');
	}

	return message;
};
