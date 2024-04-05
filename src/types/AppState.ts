import { LlmModel, LlmTokensType, LlmType } from './LlmTypes';
import { Thread } from './Message';

export type AppState = {
  currentThreadId?: string;
  threads: Record<string, Thread>;
  isStreaming: boolean;
  modalVisible: boolean;
  llmToken: string;
  llmTokens: LlmTokensType;
  selectedModel: LlmModel;
  init: () => void;
  createNewThread: () => void;
  setCurrentThread: (thread: Thread) => void;
  sendMessage: (message: string) => void;
  deleteThread: (threadId: string) => void;
  deleteAllThreads: () => void;
  streamMessages: (text: string) => void;
  finishStreamingMessages: (save?: boolean) => void;
  toggleModal: () => void;
  setLlmToken: (modelType: LlmType, token: string) => void;
  selectModel: (model: LlmModel) => void;
};
