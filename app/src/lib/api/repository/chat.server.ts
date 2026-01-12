import { prisma } from '@/db/prisma';

const create = async () => {
	try {
		const chat = await prisma.chat.create({
			data: {}
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
