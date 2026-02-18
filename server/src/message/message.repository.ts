import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Role } from '../../generated/prisma/enums';

interface CreateMessageParams {
  chatId: string;
  content: string;
  role: Role;
}

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({ chatId, content, role }: CreateMessageParams) {
    try {
      return await this.prisma.message.create({
        data: { content, chatId, role },
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
