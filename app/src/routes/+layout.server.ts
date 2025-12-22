import * as chatBusiness from '$lib/api/business/chat';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const chats = await chatBusiness.fetch({ type: 'ALL' });

	return {
		chats
	};
};
