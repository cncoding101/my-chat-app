const API_ENDPOINT = ({ id }: { id: string }) => {
	return `/api/chat/${id}/message`;
};

const create = async ({ chatId }: { chatId: string }) => {
	const response = await fetch(API_ENDPOINT({ id: chatId }), {
		method: 'POST'
	});

	if (!response.ok) {
		throw new Error('Failed to create message');
	}

	return await response.json();
};

export { create };
