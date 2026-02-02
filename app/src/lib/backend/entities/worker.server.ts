import type { ChatTriggerRequest } from '@/backend/services/clients/worker.server';

interface ITriggerChatRequest {
	chatId: string;
	message: string;
	callbackUrl: string;
}

const triggerChatRequest = ({
	chatId,
	message,
	callbackUrl
}: ITriggerChatRequest): ChatTriggerRequest => {
	return Object.freeze({
		chat_id: chatId,
		message: message,
		callback_url: callbackUrl,
		provider: 'gemini',
		model: 'gemini-2.5-flash',
		metadata: {}
	});
};

export type { ITriggerChatRequest };
export { triggerChatRequest };
