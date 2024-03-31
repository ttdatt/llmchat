import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { AppState } from './types/AppState';
import { v4 as uuidv4 } from 'uuid';
import {
	clearAll,
	deleteThread,
	getToken,
	loadThreads,
	saveToken,
	storeMessage,
} from './components/services/storage/storage';
import { Message } from './types/Message';
import { askOpenAi, init as initOpenAI } from './components/services/openai';
import maxby from 'lodash/maxBy';
import { decrypt, encrypt } from './utils/crypto';

export const useAppStore = create<AppState>()(
	immer((set, get) => ({
		threads: {},
		isStreaming: false,
		modalVisible: false,
		llmToken: '',
		init: async () => {
			try {
				const encryptedToken = await getToken();
				const token = await decrypt(encryptedToken);
				initOpenAI(token);
				set(() => ({ llmToken: token }));
			} catch (error) {
				console.error(error);
			}
			const threads = await loadThreads();
			set((state) => {
				state.threads = threads;
			});
		},
		createNewThread: () => {
			return set((state) => {
				const currentThread = state.threads[state.currentThreadId ?? ''];
				if (!currentThread || Object.keys(currentThread.messages).length > 0) {
					const newThread = {
						id: uuidv4(),
						title: 'New Thread',
						messages: {},
					};

					state.threads[newThread.id] = newThread;
					state.currentThreadId = newThread.id;
				}
			});
		},
		setCurrentThread: (thread) =>
			set((state) => {
				state.currentThreadId = thread.id;
			}),
		sendMessage: (message) => {
			return set((state) => {
				const currentThread = get().threads[get().currentThreadId ?? ''];
				if (currentThread) {
					askOpenAi(message, currentThread);
				}

				if (state.currentThreadId) {
					const msg: Message = {
						id: uuidv4(),
						owner: 'user',
						text: message,
						timestamp: new Date().toISOString(),
					};
					state.threads[state.currentThreadId].messages[msg.id] = msg;
					storeMessage(state.currentThreadId, msg);
				}
			});
		},
		deleteThread: (threadId) =>
			set((state) => {
				delete state.threads[threadId];
				deleteThread(threadId);
			}),
		streamMessages: (text) => {
			set((state) => {
				state.isStreaming = true;
				const currentThreadId = state.currentThreadId;
				const currentThread = state.threads[currentThreadId ?? ''];
				if (!currentThread || !currentThreadId) return;

				const lastestMessage = maxby(
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

					state.threads[currentThreadId].messages[msg.id] = msg;
					state.threads[currentThreadId].messages[msg.id].text += text;
				} else {
					lastestMessage.text += text;
				}
			});
		},
		finishStreamingMessages: (save = true) => {
			set(() => ({ isStreaming: false }));
			if (!save) return;

			const currentThreadId = get().currentThreadId;
			const currentThread = get().threads[currentThreadId ?? ''];
			if (currentThread) {
				const lastestMessage = maxby(
					Object.values(currentThread.messages),
					'timestamp',
				);
				if (lastestMessage) storeMessage(currentThread.id, lastestMessage);
			}
		},
		toggleModal: () => set((state) => ({ modalVisible: !state.modalVisible })),
		setLlmToken: async (token) => {
			const encryptedToken = await encrypt(token);
			saveToken(encryptedToken);
			set(() => ({ llmToken: token }));
		},
		deleteAllThreads: () => {
			set(() => ({ threads: {} }));
			clearAll();
		},
	})),
);
