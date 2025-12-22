import { json, type RequestHandler } from '@sveltejs/kit';
import { chat } from '@/api/business';
import { createChatSchema, createChatResponseSchema } from '@/schemas/api/chat';
import type { RouteMetadata } from '@/utils/types';

export const _meta: RouteMetadata = {
	operations: [
		{
			method: 'POST',
			description: 'Create a new chat',
			body: createChatSchema,
			response: createChatResponseSchema
		}
	]
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	const response = await chat.create(body);

	return json(response, { status: 201 });
};
