import { error } from '@sveltejs/kit';
import * as chatBusiness from '$lib/backend/business/chat';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const chat = await chatBusiness.fetch({ type: 'BY_ID', id: params.id });

	if (chat == null) {
		error(404, 'Chat not found');
	}

	return {
		chat
	};
};
