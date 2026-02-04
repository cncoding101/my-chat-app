import type { LayoutServerLoad } from './$types';
import * as chatBusiness from '@/backend/business/chats';

export const load: LayoutServerLoad = async ({ cookies, depends }) => {
	depends('app:chats');
	const chats = await chatBusiness.fetch({ type: 'ALL' });
	const sidebarOpen = cookies.get('sidebarOpen') !== 'false';

	return {
		chats,
		sidebarOpen
	};
};
