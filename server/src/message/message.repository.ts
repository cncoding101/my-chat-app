import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Role } from '../../generated/prisma/enums';

interface CreateMessageParams {
	chatId: string;
	content: string;
	role: Role;
	error?: Date;
}

@Injectable()
export class MessageRepository {
	constructor(private readonly prisma: PrismaService) {}

	async create({ chatId, content, role, error }: CreateMessageParams) {
		try {
			const result = await this.prisma.message.create({
				data: { content, chatId, role, error }
			});

			if (!result) {
				return null;
			}

			const messages = await this._getAllByChatId(chatId);

			if (messages.length === 0) {
				return null;
			}

			return {
				currentMessage: messages[messages.length - 1],
				messages
			};
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	async _getAllByChatId(chatId: string) {
		try {
			return await this.prisma.message.findMany({
				where: { chatId },
				orderBy: { createdAt: 'asc' }
			});
		} catch (error) {
			console.error(error);
			return [];
		}
	}
}
