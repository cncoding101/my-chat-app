const sendMessage = async (message: string) => {
	const response = await fetch('/api/chat', {
		method: 'POST',
		body: JSON.stringify({ message })
	});

	if (!response.ok) {
		throw new Error('Failed to send message');
	}

	return response.json();
};

const createChat = async () => {
	const response = await fetch('/api/chat', {
		method: 'POST'
	});

	if (!response.ok) {
		throw new Error('Failed to create chat');
	}

	return response.json();
};

export { sendMessage, createChat };
