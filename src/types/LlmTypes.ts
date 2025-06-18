import { ReasoningEffort } from 'openai/resources/shared.mjs';
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
	reasoning?: ReasoningEffort;
};

const models: LlmModel[] = [
	{
		id: 'o4-mini-high',
		modelId: 'o4-mini',
		reasoning: 'high',
		name: 'o4 mini high',
		type: LlmType.OpenAI,
	},
	{
		id: 'o4-mini-medium',
		modelId: 'o4-mini',
		reasoning: 'medium',
		name: 'o4 mini medium',
		type: LlmType.OpenAI,
	},
	{
		id: 'o3',
		modelId: 'o3',
		name: ' o3',
		reasoning: 'high',
		type: LlmType.OpenAI,
	},
	{
		id: 'gpt-4.1',
		modelId: 'gpt-4.1',
		name: 'GPT-4.1',
		type: LlmType.OpenAI,
	},
	{
		id: 'claude-sonnet-4-20250514',
		modelId: 'claude-sonnet-4-20250514',
		name: 'Claude 4 Sonnet',
		type: LlmType.Claude,
	},
	{
		id: 'claude-opus-4-20250514',
		modelId: 'claude-opus-4-20250514',
		name: 'Claude 4 Opus',
		type: LlmType.Claude,
	},
	{
		id: 'gemini-2.5-pro',
		modelId: 'gemini-2.5-pro',
		name: 'Gemini 2.5 Pro',
		type: LlmType.Gemini,
	},
	{
		id: 'models/gemini-2.5-flash',
		modelId: 'models/gemini-2.5-flash',
		name: 'Gemini 2.5 Flash',
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
