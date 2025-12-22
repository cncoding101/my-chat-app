import { unreachable } from '$lib/utils/helpers/unreachable';
import { getAll, getById } from '@/api/repository/chat.server';
import type { Chat, ChatWithMessages } from '@/schemas/api/chat';

type FetchOptions =
	| {
			type: 'ALL';
	  }
	| {
			type: 'BY_ID';
			id: string;
	  };

/* eslint-disable prefer-arrow/prefer-arrow-functions */
async function fetch(options: { type: 'ALL' }): Promise<Chat[]>;
async function fetch(options: { type: 'BY_ID'; id: string }): Promise<ChatWithMessages | null>;
async function fetch(options: FetchOptions) {
	switch (options.type) {
		case 'ALL':
			return await getAll();
		case 'BY_ID': {
			const chat = await getById(options.id);

			if (chat == null) {
				return null;
			}

			return {
				...chat,
				messages: chat.messages
					.map((message) => ({
						id: message.id,
						content: message.content,
						role: message.role
					}))
					.filter((message) => message.role !== 'TOOL')
			};
		}
		default:
			return unreachable(options);
	}
}
/* eslint-enable prefer-arrow/prefer-arrow-functions */

export default fetch;
