import { prisma } from '@/db/prisma';
import type { CreateChatSchema } from '@/schemas/api/chat';

const create = async ({ message }: CreateChatSchema) => {
	try {
		const chat = await prisma.chat.create({
			data: {
				messages: {
					create: {
						content: message,
						role: 'USER'
					}
				}
			}
		});

		return chat;
	} catch (error) {
		console.error(error);
		return null;
	}
};

const getAll = async () => {
	try {
		return await prisma.chat.findMany({
			orderBy: {
				createdAt: 'desc'
			}
		});
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getById = async (id: string) => {
	try {
		return await prisma.chat.findUnique({
			where: { id },
			include: {
				messages: {
					orderBy: {
						createdAt: 'asc'
					}
				}
			}
		});
	} catch (error) {
		console.error(error);
		return null;
	}
};

export { create, getAll, getById };
