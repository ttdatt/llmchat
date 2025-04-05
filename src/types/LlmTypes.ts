import { Thread } from './Message';

export type GenerateTextParams = {
	question?: string;
	thread?: Thread;
	onFinish?: () => Promise<void> | void;
};

export type GenerateImageParams = {
	prompt: string;
	onFinish?: () => Promise<void> | void;
};

type LlmModelClient = {
	generateText: (params: GenerateTextParams) => Promise<void>;
	generateImage?: (params: GenerateImageParams) => Promise<string | null>;
};

enum LlmType {
	OpenAI = 'openai',
	Claude = 'claude',
	Gemini = 'gemini',
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
		id: 'chatgpt-4o-latest',
		modelId: 'chatgpt-4o-latest',
		name: 'GPT-4o Latest',
		type: LlmType.OpenAI,
	},
	{
		id: 'claude-3-7-sonnet-latest',
		modelId: 'claude-3-7-sonnet-latest',
		name: 'Claude 3.7 Sonnet',
		type: LlmType.Claude,
	},
	{
		id: 'gemini-2.5-pro-exp-03-25',
		modelId: 'gemini-2.5-pro-exp-03-25',
		name: 'Gemini 2.5 Pro Exp 03-25',
		type: LlmType.Gemini,
	},
	{
		id: 'gemini-2.0-flash',
		modelId: 'gemini-2.0-flash',
		name: 'Gemini 2.0 Flash',
		type: LlmType.Gemini,
	},
	{
		id: 'imagen-3.0-generate-002',
		modelId: 'imagen-3.0-generate-002',
		name: 'Imagen 3.0 Generate 002',
		type: LlmType.Gemini,
	},
];

type LlmTokensType = Record<LlmType, string>;

export type { LlmModelClient, LlmTokensType, LlmModel };
export { models, LlmType };
