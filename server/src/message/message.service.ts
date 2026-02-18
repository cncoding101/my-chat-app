import { Injectable, BadRequestException } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { ChatEventBus } from '../common/event-bus.service';
import { WorkerService } from '../worker/worker.service';
import type { CreateMessageDto, ChatCallbackDto } from './message.dto';

@Injectable()
export class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatEventBus: ChatEventBus,
    private readonly workerService: WorkerService,
  ) {}

  async create(chatId: string, { content }: CreateMessageDto) {
    const message = await this.messageRepository.create({
      chatId,
      content,
      role: 'USER',
    });

    if (!message) {
      throw new BadRequestException('Failed to create message');
    }

    const appUrl = process.env.APP_URL ?? 'http://localhost:3001';
    const callbackUrl = `${appUrl.replace(/:\d+$/, ':' + (process.env.PORT ?? '3001'))}/api/chats/${chatId}/messages/${message.id}/callback`;

    const success = await this.workerService.triggerChat({
      chatId,
      message: content,
      callbackUrl,
    });

    if (!success) {
      throw new BadRequestException('Failed to process the worker request');
    }

    return { id: message.id, content: message.content, role: message.role };
  }

  async handleCallback(chatId: string, payload: ChatCallbackDto) {
    if (payload.error) {
      console.error(
        `Worker reported error for chat ${chatId}: ${payload.error}`,
      );
      this.chatEventBus.publishError(chatId, payload.error);
      throw new BadRequestException('Failed to process message');
    }

    const message = await this.messageRepository.create({
      chatId,
      content: payload.response,
      role: 'ASSISTANT',
    });

    if (!message) {
      console.error(`Failed to save assistant message for chat ${chatId}`);
      this.chatEventBus.publishError(
        chatId,
        'Failed to process message, please try again.',
      );
      throw new BadRequestException('Failed to save assistant message');
    }

    this.chatEventBus.publishMessage(chatId, {
      id: message.id,
      content: message.content,
      role: message.role,
    });

    return { status: 'success', messageId: message.id };
  }
}
