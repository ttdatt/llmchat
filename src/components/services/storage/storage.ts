import { Store } from '@tauri-apps/plugin-store';
import { Message, Thread } from '../../../types/Message';

const store = new Store('.settings.dat');
const THREAD_IDS = 'threadIds';

const saveToken = async (token: string) => {
	await store.set('llmToken', token);
	await store.save();
};

const getToken = async () => {
	return (await store.get('llmToken')) as string;
};

const storeMessage = async (threadId: string, message: Message) => {
	const thread = (await store.get(threadId)) as Thread | null;

	if (!thread) {
		const threadIds = (await store.get(THREAD_IDS)) as string[] | null;
		if (threadIds) {
			const t = threadIds.find((x) => x === threadId);

			if (!t) await store.set(THREAD_IDS, threadIds.concat(threadId));
		} else {
			await store.set(THREAD_IDS, [threadId]);
		}
		await store.set(threadId, {
			id: threadId,
			title: 'New Thread',
			messages: { [message.id]: message },
		});
	} else {
		thread.messages[message.id] = message;
		await store.set(threadId, thread);
	}

	await store.save();
};

const loadThreads = async () => {
	const threadIds = (await store.get(THREAD_IDS)) as string[] | null;

	if (threadIds) {
		const threads = await Promise.all(
			threadIds.map(async (x) => (await store.get(x)) as Thread),
		);

		const threadsMap: Record<string, Thread> = {};
		for (const thread of threads) {
			threadsMap[thread.id] = thread;
		}

		return threadsMap;
	}
	return {} as Record<string, Thread>;
};

const deleteThread = async (threadId: string) => {
	const threadIds = (await store.get(THREAD_IDS)) as string[] | null;
	if (threadIds) {
		await store.set(
			THREAD_IDS,
			threadIds.filter((x) => x !== threadId),
		);
		await store.delete(threadId);
		await store.save();
	}
};

const clearAll = async () => {
	await store.clear();
};

export {
	storeMessage,
	loadThreads,
	clearAll,
	deleteThread,
	saveToken,
	getToken,
};
