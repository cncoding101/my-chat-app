import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create() {
    try {
      return await this.prisma.chat.create({ data: {} });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getAll() {
    try {
      return await this.prisma.chat.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getById(id: string) {
    try {
      return await this.prisma.chat.findUnique({
        where: { id },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.chat.delete({ where: { id } });
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
