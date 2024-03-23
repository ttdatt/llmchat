import { Thread } from './Message';

export type AppState = {
  currentThread?: Thread;
  threads: Thread[];
  init: () => void;
  createNewThread: () => void;
  setCurrentThread: (thread: Thread) => void;
  sendMessage: (message: string) => void;
  deleteThread: (threadId: string) => void;
};
