import { json, type RequestHandler } from '@sveltejs/kit';
import type { ChatCallbackPayload } from '@/api/services/worker';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload: ChatCallbackPayload = await request.json();

		console.log(`Received callback from worker for chat ${payload.chat_id}:`, payload);

		if (payload.error != null) {
			console.error(`Worker reported error for chat ${payload.chat_id}: ${payload.error}`);
			// Update database with error state
			return json({ status: 'error_logged' });
		}

		// TODO: Update your database/state with payload.response
		// await db.message.update({ ... })

		return json({ status: 'success' });
	} catch (err) {
		console.error('Failed to process worker callback:', err);
		return json({ error: 'Invalid payload' }, { status: 400 });
	}
};
