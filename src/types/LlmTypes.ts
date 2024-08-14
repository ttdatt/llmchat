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
    id: 'chatgpt-4o-latest',
    name: 'GPT-4o Latest',
    type: LlmType.OpenAI,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    type: LlmType.OpenAI,
  },
  {
    id: 'claude-3-5-sonnet-20240620',
    name: 'Claude 3.5 Sonnet',
    type: LlmType.Claude,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    type: LlmType.Claude,
  },
];

type LlmTokensType = Record<LlmType, string>;

export type { LlmModelClient, LlmTokensType, LlmModel };
export { models, LlmType };
