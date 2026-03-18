import { Injectable, BadRequestException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';

@Injectable()
export class ChatService {
	constructor(private readonly chatRepository: ChatRepository) {}

	async create() {
		const chat = await this.chatRepository.create();
		if (!chat) {
			throw new BadRequestException('Failed to create chat');
		}
		return { id: chat.id, title: chat.title };
	}

	async findAll() {
		return this.chatRepository.getAll();
	}

	async findById(id: string) {
		const chat = await this.chatRepository.getById(id);
		if (!chat) return null;

		return {
			...chat,
			messages: chat.messages
				.filter((m: { role: string }) => m.role !== 'TOOL')
				.map((m) => ({
					id: m.id,
					content: m.content,
					role: m.role,
					error: m.error
				}))
		};
	}

	async remove(id: string): Promise<{ success: boolean }> {
		const result = await this.chatRepository.remove(id);
		if (!result) {
			throw new BadRequestException('Failed to remove chat');
		}
		return { success: true };
	}
}
