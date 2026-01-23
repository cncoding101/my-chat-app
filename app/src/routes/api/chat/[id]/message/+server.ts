import { json } from '@sveltejs/kit';
import { message } from '@/backend/business';
import { chatIdParamSchema, messageRequestSchema } from '@/schemas/api';
import type { RouteMetadata } from '@/utils/types';
import type { MetaRequestHandler } from '@/utils/types/routeRequestHandler';

export const _meta = {
	operations: [
		{
			method: 'POST',
			description: 'Create a new message',
			params: chatIdParamSchema,
			body: messageRequestSchema
		}
	]
} as const satisfies RouteMetadata;

export const POST: MetaRequestHandler<typeof _meta, 'POST'> = async ({ params, request }) => {
	const body = await request.json();

	const response = await message.create(params.id, body);

	return json(response, { status: 201 });
};
