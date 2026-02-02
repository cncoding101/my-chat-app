import { workerEntity } from '../entities';
import type { ITriggerChatRequest } from '@/backend/entities/worker.server';
import * as workerClient from '@/backend/services/clients/worker.server';

const triggerChat = async (payload: ITriggerChatRequest) => {
	try {
		const response = await workerClient.triggerChat(workerEntity.triggerChatRequest(payload));

		if (response.status !== 200) {
			console.error('Service worker failed for triggerChat:', response.status, response.data);
			return null;
		}

		return response;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export { triggerChat };
