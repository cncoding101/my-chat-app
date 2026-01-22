import * as chatBusiness from '$lib/backend/business/chat';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const chats = await chatBusiness.fetch({ type: 'ALL' });
	const sidebarOpen = cookies.get('sidebarOpen') !== 'false';

	return {
		chats,
		sidebarOpen
	};
};
