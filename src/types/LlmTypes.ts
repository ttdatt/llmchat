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
		id: 'chatgpt-4o-latest',
		modelId: 'chatgpt-4o-latest',
		name: 'GPT-4o Latest',
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
		id: 'gemini-2.5-pro-preview-06-05',
		modelId: 'gemini-2.5-pro-preview-06-05',
		name: 'Gemini 2.5 Pro Preview 06-05',
		type: LlmType.Gemini,
	},
	{
		id: 'gemini-2.5-pro-exp-03-25',
		modelId: 'gemini-2.5-pro-exp-03-25',
		name: 'Gemini 2.5 Pro Exp 03-25',
		type: LlmType.Gemini,
	},
	{
		id: 'models/gemini-2.5-flash-preview-05-20',
		modelId: 'models/gemini-2.5-flash-preview-05-20',
		name: 'Gemini 2.5 Flash Preview 05-20',
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
