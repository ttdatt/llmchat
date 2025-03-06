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
	modelId: string;
	name: string;
	type: LlmType;
	reasoning?: 'high' | 'medium' | 'low';
};

const models: LlmModel[] = [
	{
		id: 'o3-mini-high',
		modelId: 'o3-mini',
		reasoning: 'high',
		name: 'o3 mini high',
		type: LlmType.OpenAI,
	},
	{
		id: 'o3-mini-medium',
		modelId: 'o3-mini',
		reasoning: 'medium',
		name: 'o3 mini medium',
		type: LlmType.OpenAI,
	},
	{
		id: 'o3-mini-low',
		modelId: 'o3-mini',
		reasoning: 'low',
		name: 'o3 mini low',
		type: LlmType.OpenAI,
	},
	{
		id: 'o1',
		modelId: 'o1',
		name: ' o1',
		type: LlmType.OpenAI,
	},
	{
		id: 'o1-mini',
		modelId: 'o1-mini',
		name: 'o1 mini',
		type: LlmType.OpenAI,
	},
	{
		id: 'claude-3-7-sonnet-latest',
		modelId: 'claude-3-7-sonnet-latest',
		name: 'Claude 3.7 Sonnet',
		type: LlmType.Claude,
	},
];

type LlmTokensType = Record<LlmType, string>;

export type { LlmModelClient, LlmTokensType, LlmModel };
export { models, LlmType };
