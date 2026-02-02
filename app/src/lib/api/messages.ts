import type { ChatIdParamSchema, MessageRequest } from '@/schemas/api';

const API_ENDPOINT = (id: string) => {
	return `/api/chats/${id}/messages`;
};

const create = async ({ id }: ChatIdParamSchema, payload: MessageRequest) => {
	const response = await fetch(API_ENDPOINT(id), {
		method: 'POST',
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		throw new Error('Failed to process the message, please try again.');
	}

	return await response.json();
};

export { create };
