import { Thread } from './Message';

type LlmModelClient = {
  generateText: (question: string, thread: Thread) => Promise<void>;
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
    id: 'gpt-4o',
    name: 'GPT-4o',
    type: LlmType.OpenAI,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    type: LlmType.OpenAI,
  },
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo Preview',
    type: LlmType.OpenAI,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    type: LlmType.Claude,
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    type: LlmType.Claude,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    type: LlmType.Claude,
  },
];

type LlmTokensType = Record<LlmType, string>;

export type { LlmModelClient, LlmTokensType, LlmModel };
export { models, LlmType };
