import { json } from '@sveltejs/kit';
import { message } from '@/backend/business';
import { chatAndMessageIdParamSchema, chatCallbackPayloadSchema } from '@/schemas/api';
import type { RouteMetadata } from '@/utils/types';
import type { MetaRequestHandler } from '@/utils/types/routeRequestHandler';

export const _meta = {
	operations: [
		{
			method: 'POST',
			description: 'Callback from worker to save assistant response',
			params: chatAndMessageIdParamSchema,
			body: chatCallbackPayloadSchema
		}
	]
} as const satisfies RouteMetadata;

export const POST: MetaRequestHandler<typeof _meta, 'POST'> = async ({ request, params }) => {
	try {
		const payload = await request.json();

		console.log(
			`Received callback from worker for message ${params.messageId} in chat ${params.id}:`,
			payload
		);

		const response = await message.callback(params.id, params.messageId, payload);

		return json(response);
	} catch (err) {
		console.error('Failed to process worker callback:', err);
		return json({ error: 'Invalid payload' }, { status: 400 });
	}
};
