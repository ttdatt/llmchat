import { Thread } from './Message';

export type GenerateTextParams = {
	question?: string;
	thread?: Thread;
	onFinish?: () => Promise<void> | void;
};
type LlmModelClient = {
	generateText: (params: GenerateTextParams) => Promise<void>;
};

enum LlmType {
	OpenAI = 'openai',
	Claude = 'claude',
}

type LlmModel = {
	id: string;
	name: string;
	type: LlmType;
};

const models: LlmModel[] = [
	{
		id: 'o3-mini',
		name: 'o3 mini',
		type: LlmType.OpenAI,
	},
	{
		id: 'o1',
		name: ' o1',
		type: LlmType.OpenAI,
	},
	{
		id: 'o1-mini',
		name: 'o1 mini',
		type: LlmType.OpenAI,
	},
	{
		id: 'gpt-4o',
		name: 'GPT-4o',
		type: LlmType.OpenAI,
	},
	{
		id: 'claude-3-7-sonnet-latest',
		name: 'Claude 3.7 Sonnet',
		type: LlmType.Claude,
	},
];

type LlmTokensType = Record<LlmType, string>;

export type { LlmModelClient, LlmTokensType, LlmModel };
export { models, LlmType };
