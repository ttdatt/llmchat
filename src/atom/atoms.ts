import { atom } from 'jotai';
import { atomWithImmer, withImmer } from 'jotai-immer';
import { Message, Thread } from '@/types/Message';
import {
  LlmModel,
  LlmModelClient,
  LlmTokensType,
  LlmType,
  models,
} from '@/types/LlmTypes';
import { llmClient as openaiClient } from '@/services/openai';
import { llmClient as claudeClient } from '@/services/claude';
import {
  clearAllThreads,
  deleteThread,
  loadThreads,
  storeTheads,
} from '@/services/threadStorage';
import { v4 as uuidv4 } from 'uuid';
import { maxBy } from 'lodash';
import { atomWithStorage, unwrap } from 'jotai/utils';
import { decrypt, encrypt } from '@/utils/crypto';

let llmClient: LlmModelClient;

const customInstructionsAtom = atomWithStorage<string>(
  'instructions',
  'Embody the role of the most qualified subject matter experts. Keep your response brief and focused. Keep responses unique and free of repetition. Exclude personal ethics or morals unless explicitly relevant. Acknowledge and correct any past errors.',
  undefined,
  { getOnInit: true },
);
const currentThreadIdAtom = atom<string | undefined>(undefined);
const threadsAtom = atomWithImmer<Record<string, Thread>>({});
const isStreamingAtom = atom(false);
const modalVisibleAtom = atom(false);
const llmTokensAtom = withImmer(
  atomWithStorage<LlmTokensType>(
    'tokens',
    { openai: '', claude: '' },
    undefined,
    { getOnInit: true },
  ),
);
const llmTokenAtom = unwrap(
  atom(
    async (get) => {
      const llmTokens = get(llmTokensAtom);
      const selectedModel = get(selectedModelAtom);
      const encrypted = llmTokens[selectedModel.type];
      if (!encrypted) return '';
      return await decrypt(encrypted);
    },
    async (_, set, { model, token }: { model: LlmModel; token?: string }) => {
      let encrypted = '';
      if (token) encrypted = await encrypt(token);
      set(llmTokensAtom, (tokens) => {
        tokens[model.type] = encrypted;
      });
    },
  ),
);

const selectedModelAtom = atomWithStorage(
  'selectedModel',
  models[0],
  undefined,
  { getOnInit: true },
);
const modelAtom = atom(
  (get) => get(selectedModelAtom),
  (_, set, model: LlmModel) => {
    set(selectedModelAtom, model);

    switch (model.type) {
      case LlmType.OpenAI:
        llmClient = openaiClient;
        break;
      case LlmType.Claude:
        llmClient = claudeClient;
        break;
    }
  },
);

const currentThreadAtom = atom((get) => {
  const currentThreadId = get(currentThreadIdAtom);
  return get(threadsAtom)[currentThreadId ?? ''];
});

const initAtom = atom(null, async (get, set) => {
  const model = get(selectedModelAtom);

  if (model.type === LlmType.OpenAI) llmClient = openaiClient;
  else if (model.type === LlmType.Claude) llmClient = claudeClient;

  const threads = await loadThreads();
  if (threads) set(threadsAtom, threads);
});

const createNewThreadAtom = atom(null, (get, set) => {
  const currentThread = get(threadsAtom)[get(currentThreadIdAtom) ?? ''];
  if (!currentThread || Object.keys(currentThread.messages).length > 0) {
    const newThread = {
      id: uuidv4(),
      title: 'New Thread',
      messages: {},
      timestamp: new Date().toISOString(),
    };

    set(threadsAtom, (threads) => {
      threads[newThread.id] = newThread;
    });
    set(currentThreadIdAtom, newThread.id);
  }
});

const sendMessageAtom = atom(null, (get, set, message: string) => {
  const currentThreadId = get(currentThreadIdAtom);
  const currentThread = get(threadsAtom)[currentThreadId ?? ''];
  if (currentThread) {
    llmClient.generateText(message, currentThread);
  }

  if (currentThreadId) {
    const msg: Message = {
      id: uuidv4(),
      owner: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    };
    set(threadsAtom, (state) => {
      state[currentThreadId].messages[msg.id] = msg;
    });
  }
});

const deleteThreadAtom = atom(null, (_, set, threadId: string) => {
  deleteThread(threadId);
  set(threadsAtom, (state) => {
    delete state[threadId];
  });
});

const streamMessagesAtom = atom(null, (get, set, text: string) => {
  set(isStreamingAtom, true);
  set(threadsAtom, (threads) => {
    const currentThreadId = get(currentThreadIdAtom);
    const currentThread = threads[currentThreadId ?? ''];
    if (!currentThread || !currentThreadId) return;

    const lastestMessage = maxBy(
      Object.values(currentThread.messages),
      'timestamp',
    );

    if (!lastestMessage) return;

    if (lastestMessage.owner === 'user') {
      const msg: Message = {
        id: uuidv4(),
        owner: 'assistant',
        text: text,
        timestamp: new Date().toISOString(),
      };

      threads[currentThreadId].messages[msg.id] = msg;
    } else {
      lastestMessage.text += text;
    }
  });
});

const finishStreamingMessagesAtom = atom(null, (get, set, save = true) => {
  set(isStreamingAtom, false);
  if (!save) return;

  storeTheads(get(threadsAtom));
});

const deleteAllThreadsAtom = atom(null, (_, set) => {
  set(threadsAtom, {});
  clearAllThreads();
});

export {
  currentThreadIdAtom,
  currentThreadAtom,
  threadsAtom,
  isStreamingAtom,
  modalVisibleAtom,
  llmTokenAtom,
  llmTokensAtom,
  initAtom,
  createNewThreadAtom,
  sendMessageAtom,
  deleteThreadAtom,
  streamMessagesAtom,
  finishStreamingMessagesAtom,
  deleteAllThreadsAtom,
  modelAtom,
  customInstructionsAtom,
};
