import { Store } from '@tauri-apps/plugin-store';
import { Thread } from '@/types/Message';

const store = new Store('threads.txt');

const storeTheads = async (threads: Record<string, Thread>) => {
  await store.set('threads', threads);
  await store.save();
};

const loadThreads = async () => {
  const threads = (await store.get('threads')) as Record<string, Thread> | null;
  return threads;
};

const clearAllThreads = async () => {
  await store.clear();
};

export { storeTheads, loadThreads, clearAllThreads };
