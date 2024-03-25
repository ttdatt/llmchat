import { Thread } from './Message';

export type AppState = {
  currentThreadId?: string;
  threads: Record<string, Thread>;
  isStreaming: boolean;
  init: () => void;
  createNewThread: () => void;
  setCurrentThread: (thread: Thread) => void;
  sendMessage: (message: string) => void;
  deleteThread: (threadId: string) => void;
  streamMessages: (text: string) => void;
  finishStreamingMessages: (save?: boolean) => void;
};
