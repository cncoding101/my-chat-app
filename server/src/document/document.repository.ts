import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateDocumentParams {
  id: string;
  filename: string;
  type: string;
  status: string;
  chunkCount: number;
}

@Injectable()
export class DocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: CreateDocumentParams) {
    return this.prisma.document.create({
      data: params,
    });
  }

  async findAll() {
    return this.prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }

  async remove(id: string) {
    try {
      return await this.prisma.document.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Failed to delete document:', error);
      return null;
    }
  }
}
