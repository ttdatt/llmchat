export type ChatMessageType = {
	id: string;
	owner: 'user' | 'assistant';
	text: string;
	timestamp: string;
	image?: string;
};

export type Thread = {
	id: string;
	title: string;
	messages: Record<string, ChatMessageType>;
	timestamp: string;
};
