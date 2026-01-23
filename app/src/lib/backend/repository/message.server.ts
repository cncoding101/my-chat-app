import { Role } from '@prisma/enums';
import { prisma } from '@/db/prisma';

const create = async ({ chatId, content }: { chatId: string; content: string }) => {
	try {
		const message = await prisma.message.create({
			data: {
				content,
				chatId,
				role: Role.USER
			}
		});

		return message;
	} catch (error) {
		console.error(error);
		return null;
	}
};

export { create };
