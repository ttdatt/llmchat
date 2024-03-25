export type Thread = {
	id: string;
	title: string;
	messages: Record<string, Message>;
};

export type Message = {
	id: string;
	owner: 'user' | 'assistant';
	text: string;
	timestamp: string;
};
