import { Injectable } from '@nestjs/common';
import { triggerChat, type ChatTriggerRequest } from './clients/worker.client';

interface TriggerChatRequest {
	chatId: string;
	messages: {
		role: string;
		content: string;
	}[];
	callbackUrl: string;
}

@Injectable()
export class WorkerService {
	async triggerChat(request: TriggerChatRequest): Promise<boolean> {
		const payload: ChatTriggerRequest = {
			chat_id: request.chatId,
			messages: request.messages,
			callback_url: request.callbackUrl,
			metadata: {}
		};

		try {
			const response = await triggerChat(payload);

			if (response.status !== 200) {
				console.error('Worker triggerChat failed:', response.status, response.data);
				return false;
			}

			return true;
		} catch (err) {
			console.error('Worker triggerChat error:', err);
			return false;
		}
	}
}
