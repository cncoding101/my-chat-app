import type { ChatIdParamSchema } from '@/schemas/api';

const API_ENDPOINT = '/api/chats';

const create = async () => {
	const response = await fetch(API_ENDPOINT, {
		method: 'POST'
	});

	if (!response.ok) {
		throw new Error('Failed to create chat');
	}

	return await response.json();
};

const remove = async ({ id }: ChatIdParamSchema) => {
	const response = await fetch(`${API_ENDPOINT}/${id}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error('Failed to remove chat, please try again.');
	}

	return await response.json();
};

export { create, remove };
