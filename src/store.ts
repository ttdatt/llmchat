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
import { askOpenAi } from './components/services/openai';

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    threads: [],
    init: async () => {
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
    sendMessage: message => {
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
          storeMessage(get().currentThread?.id, msg);
        }
      });

      const currentThread = get().currentThread;
      if (currentThread) {
        askOpenAi(message, currentThread);
      }
    },
    deleteThread: threadId =>
      set(state => {
        state.threads = state.threads.filter(x => x.id !== threadId);
        deleteThread(threadId);
      }),
    streamMessages: async text => {
      set(state => {
        const currentThreadId = state.currentThread?.id;
        const currentThread = state.threads.find(x => x.id === currentThreadId);
        if (currentThread) {
          let lastestMessage =
            currentThread?.messages[currentThread.messages.length - 1];

          if (lastestMessage?.owner === 'user') {
            const msg: Message = {
              id: uuidv4(),
              owner: 'assistant',
              text: '',
              timestamp: new Date().toISOString(),
            };
            lastestMessage = msg;
            currentThread.messages.push(lastestMessage);
          }
          lastestMessage.text += text;
          state.currentThread = currentThread;
        }
      });
    },
    finishStreamingMessages: () => {
      const currentThread = get().currentThread;
      if (currentThread) {
        const lastestMessage =
          currentThread?.messages[currentThread.messages.length - 1];

        storeMessage(currentThread.id, lastestMessage);
      }
    },
  }))
);
