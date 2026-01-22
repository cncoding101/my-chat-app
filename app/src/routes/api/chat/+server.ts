import { json } from '@sveltejs/kit';
import { chat } from '@/backend/business';
import { createChatResponseSchema } from '@/schemas/api/chat';
import type { RouteMetadata } from '@/utils/types';
import type { MetaRequestHandler } from '@/utils/types/routeRequestHandler';

export const _meta = {
	operations: [
		{
			method: 'POST',
			description: 'Create a new chat',
			response: createChatResponseSchema
		}
	]
} as const satisfies RouteMetadata;

export const POST: MetaRequestHandler<typeof _meta, 'POST'> = async () => {
	const response = await chat.create();

	return json(response, { status: 201 });
};
