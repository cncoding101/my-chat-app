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
			const result = await this.prisma.message.create({
				data: { content, chatId, role }
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
			return await this.prisma.message.findMany({ where: { chatId } });
		} catch (error) {
			console.error(error);
			return [];
		}
	}
}
