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

export { sendMessage };
