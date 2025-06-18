import { atom } from 'jotai';
import { ChatMessageType } from '@/types/Message';
import { LlmModel, LlmModelClient, LlmType } from '@/types/LlmTypes';
import { llmClient as openaiClient } from '@/services/openai';
import { llmClient as claudeClient } from '@/services/claude';
import { llmClient as geminiClient } from '@/services/gemini';
import {
	clearAllThreads,
	deleteThread,
	loadLocalThreads,
	storeTheads,
} from '@/services/threadStorage';
import { v4 as uuidv4 } from 'uuid';
import maxBy from 'lodash/maxBy';
import { unwrap } from 'jotai/utils';
import { decrypt, encrypt } from '@/utils/crypto';
import {
	currentThreadIdAtom,
	threadsAtom,
	isStreamingAtom,
	llmTokensAtom,
	selectedModelAtom,
	currentUserAtom,
} from './atoms';
import {
	getAllThreads,
	getLoggedInUser,
	handleParamAccessToken,
	logout,
} from '@/services/googleApi';
import { mergeThreads } from '@/services/mergeThreads';
import { worker } from '@/workerInstance';
import { AddThread, DeleteThread } from '@/types/Worker';

let llmClient: LlmModelClient;

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

const initModel = (model: LlmModel) => {
	switch (model.type) {
		case LlmType.OpenAI:
			llmClient = openaiClient;
			break;
		case LlmType.Claude:
			llmClient = claudeClient;
			break;
		case LlmType.Gemini:
			llmClient = geminiClient;
			break;
	}
};

const modelAtom = atom(
	(get) => get(selectedModelAtom),
	(_, set, model: LlmModel) => {
		set(selectedModelAtom, model);
		initModel(model);
	},
);

const currentThreadAtom = atom((get) => {
	const currentThreadId = get(currentThreadIdAtom);
	return get(threadsAtom)[currentThreadId ?? ''];
});

const initAtom = atom(null, async (get, set) => {
	const model = get(selectedModelAtom);

	initModel(model);

	// Check if redirect from Google Authentication:
	const params = new URLSearchParams(location.hash.substring(1));
	const accessTokenOnParam = params.get('access_token');
	if (accessTokenOnParam) {
		await handleParamAccessToken(params, accessTokenOnParam);
		return;
	}

	const currentUser = await getLoggedInUser();
	if (!currentUser) {
		await logout();
		const threads = await loadLocalThreads();
		if (threads) set(threadsAtom, threads);
		return;
	}

	set(currentUserAtom, currentUser);
	console.log('user', currentUser);

	const localThreads = await loadLocalThreads();
	const remoteThreads = await getAllThreads();

	const mergedThreads = mergeThreads(Object.values(localThreads || {}), remoteThreads);
	set(threadsAtom, mergedThreads);
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

const sendMessageAtom = atom(null, async (get, set, message: string) => {
	let currentThreadId = get(currentThreadIdAtom);
	if (!currentThreadId) set(createNewThreadAtom);
	currentThreadId = get(currentThreadIdAtom);

	if (currentThreadId) {
		const currentThread = get(threadsAtom)[currentThreadId];

		const msg: ChatMessageType = {
			id: uuidv4(),
			owner: 'user',
			text: message,
			timestamp: new Date().toISOString(),
		};
		set(threadsAtom, (state) => {
			if (state[currentThreadId].title === 'New Thread') {
				state[currentThreadId].title = message.slice(0, 100);
			}
			state[currentThreadId].messages[msg.id] = msg;
		});

		const model = get(selectedModelAtom);
		if (model.modelId === 'imagen-3.0-generate-002') {
			set(isStreamingAtom, true);
			const imageDataUrl = await llmClient.generateImage?.({
				prompt: message,
			});
			set(isStreamingAtom, false);

			if (imageDataUrl) {
				const imgMsg: ChatMessageType = {
					id: uuidv4(),
					owner: 'assistant',
					text: '',
					image: imageDataUrl,
					timestamp: new Date().toISOString(),
				};
				set(threadsAtom, (state) => {
					state[currentThreadId].messages[imgMsg.id] = imgMsg;
				});
				storeTheads(get(threadsAtom));
				if (get(currentUserAtom)) {
					const postData: AddThread = {
						type: 'add-thread',
						threadId: currentThreadId,
					};
					worker.postMessage(postData);
				}
			}
			return;
		}

		set(isStreamingAtom, true);
		llmClient.generateText({
			question: message,
			thread: currentThread,
			onFinish: () => {
				if (get(currentUserAtom)) {
					const postData: AddThread = {
						type: 'add-thread',
						threadId: currentThreadId,
					};
					worker.postMessage(postData);
				}
			},
		});
	}
});

const deleteThreadAtom = atom(null, (get, set, threadId: string) => {
	deleteThread(threadId);
	set(threadsAtom, (state) => {
		delete state[threadId];
	});
	set(currentThreadIdAtom, undefined);

	if (get(currentUserAtom)) {
		const postData: DeleteThread = {
			type: 'delete-thread',
			threadId,
		};
		worker.postMessage(postData);
	}
});

const streamMessagesAtom = atom(null, (get, set, text: string) => {
	set(isStreamingAtom, true);
	set(threadsAtom, (threads) => {
		const currentThreadId = get(currentThreadIdAtom);
		const currentThread = threads[currentThreadId ?? ''];
		if (!currentThread || !currentThreadId) return;

		const lastestMessage = maxBy(Object.values(currentThread.messages), 'timestamp');

		if (!lastestMessage) return;

		if (lastestMessage.owner === 'user') {
			const msg: ChatMessageType = {
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
	currentThreadAtom,
	llmTokenAtom,
	initAtom,
	createNewThreadAtom,
	sendMessageAtom,
	deleteThreadAtom,
	streamMessagesAtom,
	finishStreamingMessagesAtom,
	deleteAllThreadsAtom,
	modelAtom,
};
