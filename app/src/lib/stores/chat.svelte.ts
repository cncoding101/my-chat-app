import type { Role } from '@/schemas/api/chat';

export interface Message {
	id: string;
	role: Role;
	content: string;
	createdAt: Date;
}

class ChatStore {
	messages = $state<Message[]>([]);
	isLoading = $state(false);

	addMessage(message: Omit<Message, 'id' | 'createdAt'>) {
		this.messages.push({
			...message,
			id: crypto.randomUUID(),
			createdAt: new Date()
		});
	}

	setLoading(loading: boolean) {
		this.isLoading = loading;
	}

	clear() {
		this.messages = [];
	}
}

export const chatStore = new ChatStore();
