import { Role } from '@prisma/enums';
import { prisma } from '@/db/prisma';

interface CreateMessageParams {
	chatId: string;
	content: string;
	role: Role;
}

const create = async ({ chatId, content, role }: CreateMessageParams) => {
	try {
		const message = await prisma.message.create({
			data: {
				content,
				chatId,
				role
			}
		});

		return message;
	} catch (error) {
		console.error(error);
		return null;
	}
};

export { create };
