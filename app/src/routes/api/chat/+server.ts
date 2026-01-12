import { json, type RequestHandler } from '@sveltejs/kit';
import { chat } from '@/api/business';
import { createChatResponseSchema } from '@/schemas/api/chat';
import type { RouteMetadata } from '@/utils/types';

export const _meta: RouteMetadata = {
	operations: [
		{
			method: 'POST',
			description: 'Create a new chat',
			response: createChatResponseSchema
		}
	]
};

export const POST: RequestHandler = async () => {
	const response = await chat.create();

	return json(response, { status: 201 });
};
