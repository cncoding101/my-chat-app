import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as chatBusiness from '@/backend/business/chats';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const chat = await chatBusiness.fetch({ type: 'BY_ID', id: params.id });

		if (chat == null) {
			error(404, 'Chat not found');
		}

		return {
			chat
		};
	} catch (error) {
		console.error(error);
		return {
			chat: null
		};
	}
};
