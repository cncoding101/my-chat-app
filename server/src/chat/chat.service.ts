import { Injectable, BadRequestException } from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import type { ChatResponse, ChatWithMessages } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async create(): Promise<ChatResponse> {
    const chat = await this.chatRepository.create();
    if (!chat) {
      throw new BadRequestException('Failed to create chat');
    }
    return { id: chat.id, title: chat.title };
  }

  async findAll() {
    return this.chatRepository.getAll();
  }

  async findById(id: string): Promise<ChatWithMessages | null> {
    const chat = await this.chatRepository.getById(id);
    if (!chat) return null;

    return {
      ...chat,
      messages: chat.messages
        .filter((m: { role: string }) => m.role !== 'TOOL')
        .map((m: { id: string; content: string; role: string }) => ({
          id: m.id,
          content: m.content,
          role: m.role,
        })),
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
