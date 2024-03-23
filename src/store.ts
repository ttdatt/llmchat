import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AppState } from './types/AppState';
import { v4 as uuidv4 } from 'uuid';
import {
  deleteThread,
  loadThreads,
  storeMessage,
} from './components/services/storage/storage';
import { Message } from './types/Message';
import { askOpenAi, initHttpClient } from './components/services/openai';

export const useAppStore = create<AppState>()(
  immer(set => ({
    threads: [],
    init: async () => {
      console.log(import.meta.env.VITE_OPENAI_KEY);

      initHttpClient();
      const threads = await loadThreads();
      set(state => {
        state.threads = threads;
      });
    },
    createNewThread: () => {
      set(state => {
        if (!state.currentThread || state.currentThread.messages.length > 0) {
          const newThread = {
            id: uuidv4(),
            title: 'New Thread',
            messages: [],
          };

          state.threads.push(newThread);
          state.currentThread = newThread;
        }
      });
    },
    setCurrentThread: thread =>
      set(state => {
        state.currentThread = state.threads.find(x => x.id === thread.id);
      }),
    sendMessage: message =>
      set(state => {
        if (state.currentThread) {
          const currentThreadId = state.currentThread.id;
          const msg: Message = {
            id: uuidv4(),
            owner: 'user',
            text: message,
            timestamp: new Date().toISOString(),
          };
          state.threads.find(x => x.id === currentThreadId)?.messages.push(msg);
          state.currentThread = state.threads.find(
            x => x.id === currentThreadId
          );
          storeMessage(currentThreadId, msg);
          // askOpenAi();
        }
      }),
    deleteThread: threadId =>
      set(state => {
        state.threads = state.threads.filter(x => x.id !== threadId);
        deleteThread(threadId);
      }),
  }))
);
