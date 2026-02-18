import { Injectable } from '@nestjs/common';
import {
  triggerChatChatTriggerPost,
  type ChatTriggerRequest,
} from './clients/worker.client';

interface TriggerChatRequest {
  chatId: string;
  message: string;
  callbackUrl: string;
}

@Injectable()
export class WorkerService {
  async triggerChat(request: TriggerChatRequest): Promise<boolean> {
    const payload: ChatTriggerRequest = {
      chat_id: request.chatId,
      message: request.message,
      callback_url: request.callbackUrl,
      metadata: {},
    };

    try {
      const response = await triggerChatChatTriggerPost(payload);

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
