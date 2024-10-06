import { FileWithPath } from '@mantine/dropzone';

export type CustomFileWithPath = { file: FileWithPath; id: string };

export type Thread = {
	id: string;
	title: string;
	messages: Record<string, Message>;
	timestamp: string;
	files?: CustomFileWithPath[];
};

export type Message = {
	id: string;
	owner: 'user' | 'assistant';
	text: string;
	timestamp: string;
};
