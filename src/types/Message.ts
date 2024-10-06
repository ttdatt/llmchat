import { FileWithPath } from '@mantine/dropzone';

export type CustomFileWithPath = { file: FileWithPath; id: string };

export type ChatMessageType = {
	id: string;
	owner: 'user' | 'assistant';
	text: string;
	timestamp: string;
	image?: string;
};

export type Message = {
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
	files?: CustomFileWithPath[];
};
