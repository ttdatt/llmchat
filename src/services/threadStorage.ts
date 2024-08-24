import { Thread } from '@/types/Message';
import { db } from './indexedDb';
import { Store } from '@tauri-apps/plugin-store';
import { isWeb } from './platform';

let store: Store;

if (!isWeb) {
	store = new Store('threads.txt');
}

const storeTheads = async (threads: Record<string, Thread>) => {
	if (isWeb) {
		return db.transaction('rw', db.threads, () => {
			return Promise.all(Object.values(threads).map((thread) => db.threads.put(thread)));
		});
	}
	await store.set('threads', threads);
	await store.save();
};

const loadLocalThreads = async () => {
	if (isWeb) {
		const allThreads = await db.threads.toArray();
		const threads = allThreads.reduce(
			(acc, thread) => {
				acc[thread.id] = thread;
				return acc;
			},
			{} as Record<string, Thread>,
		);
		return threads;
	}

	const threads = (await store.get('threads')) as Record<string, Thread> | null;
	return threads;
};

const deleteThread = async (threadId: string) => {
	if (isWeb) {
		return db.threads.delete(threadId);
	}
	const threads = (await store.get('threads')) as Record<string, Thread> | null;
	if (!threads) return;
	delete threads[threadId];
	await store.set('threads', threads);
	await store.save();
};

const clearAllThreads = async () => {
	return isWeb ? db.threads.clear() : store.clear();
};

export { storeTheads, loadLocalThreads, clearAllThreads, deleteThread };
