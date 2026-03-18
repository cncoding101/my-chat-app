import { Injectable, BadRequestException } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { ChatEventBus } from '../common/event-bus.service';
import { WorkerService } from '../worker/worker.service';
import type { CreateMessageDto, ChatCallbackDto } from './message.dto';
import { Role } from 'generated/prisma/enums';
import { DocumentRepository } from '@/document/document.repository';

@Injectable()
export class MessageService {
	constructor(
		private readonly messageRepository: MessageRepository,
		private readonly chatEventBus: ChatEventBus,
		private readonly workerService: WorkerService,
		private readonly documentRepository: DocumentRepository
	) {}

	async create(chatId: string, { content }: CreateMessageDto) {
		const result = await this.messageRepository.create({
			chatId,
			content,
			role: 'USER'
		});

		if (!result) {
			throw new BadRequestException('Failed to create message');
		}

		const { currentMessage, messages } = result;

		const appUrl = process.env.APP_URL ?? 'http://localhost:3001';
		const callbackUrl = `${appUrl.replace(/:\d+$/, ':' + (process.env.PORT ?? '3001'))}/api/chats/${chatId}/messages/${currentMessage.id}/callback`;

		const documents = await this.documentRepository.findAll();
		const documentNames = documents.map((d) => d.filename);

		const success = await this.workerService.triggerChat({
			chatId,
			messages: messages.map((m) => {
				return {
					role: m.role,
					content: m.content
				};
			}),
			callbackUrl,
			documentNames
		});

		if (!success) {
			const errorContent = 'This message could not be processed';
			await this.messageRepository.create({
				chatId,
				content: errorContent,
				role: Role.ASSISTANT,
				error: new Date()
			});

			this.chatEventBus.publishError(chatId, errorContent);
		}

		return {
			id: currentMessage.id,
			content: currentMessage.content,
			role: currentMessage.role,
			error: currentMessage.error?.toISOString()
		};
	}

	async handleCallback(chatId: string, payload: ChatCallbackDto) {
		if (payload.error) {
			console.error(`Worker reported error for chat ${chatId}: ${payload.error}`);
			this.chatEventBus.publishError(chatId, payload.error);
			throw new BadRequestException('Failed to process message');
		}

		const result = await this.messageRepository.create({
			chatId,
			content: payload.content,
			role: 'ASSISTANT'
		});

		if (!result) {
			console.error(`Failed to save assistant message for chat ${chatId}`);
			this.chatEventBus.publishError(chatId, 'Failed to process message, please try again.');
			throw new BadRequestException('Failed to save assistant message');
		}

		const { currentMessage } = result;

		this.chatEventBus.publishMessage(chatId, {
			id: currentMessage.id,
			content: currentMessage.content,
			role: currentMessage.role,
			error: currentMessage.error?.toISOString()
		});

		return { status: 'success', messageId: currentMessage.id };
	}
}
