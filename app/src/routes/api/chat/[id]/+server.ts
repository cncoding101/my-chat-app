import { json } from '@sveltejs/kit';
import { chat } from '@/backend/business';
import { chatIdParamSchema, removeChatResponseSchema } from '@/schemas/api';
import type { RouteMetadata } from '@/utils/types';
import type { MetaRequestHandler } from '@/utils/types/routeRequestHandler';

export const _meta = {
	operations: [
		{
			method: 'DELETE',
			description: 'Delete a existing chat by id',
			params: chatIdParamSchema,
			response: removeChatResponseSchema
		}
	]
} as const satisfies RouteMetadata;

export const DELETE: MetaRequestHandler<typeof _meta, 'DELETE'> = async ({ params }) => {
	const { id } = params;

	const response = await chat.remove({ id });

	return json(response, { status: 200 });
};
