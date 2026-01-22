const API_ENDPOINT = '/api/chat';

const create = async () => {
	const response = await fetch(API_ENDPOINT, {
		method: 'POST'
	});

	if (!response.ok) {
		throw new Error('Failed to create chat');
	}

	return await response.json();
};

const remove = async ({ id }: { id: string }) => {
	const response = await fetch(`${API_ENDPOINT}/${id}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error('Failed to remove chat');
	}

	return await response.json();
};

export { create, remove };
