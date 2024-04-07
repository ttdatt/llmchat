import { Thread } from '@/types/Message';
import { Store } from '@tauri-apps/plugin-store';

let store: Storage | Store = localStorage;
const isTauri = !!window.__TAURI_INTERNALS__;
if (isTauri) {
  store = new Store('threads.txt');
}

const storeTheads = async (threads: Record<string, Thread>) => {
  if (!isTauri) {
    localStorage.setItem('threads', JSON.stringify(threads));
    return;
  }
  await store.set('threads', threads);
  await store.save();
};

const loadThreads = async () => {
  if (!isTauri) {
    const threads = localStorage.getItem('threads');
    return threads ? (JSON.parse(threads) as Record<string, Thread>) : null;
  }
  const threads = (await store.get('threads')) as Record<string, Thread> | null;
  return threads;
};

const clearAllThreads = async () => {
  if (!isTauri) {
    localStorage.removeItem('threads');
    return;
  }
  await store.clear();
};

export { storeTheads, loadThreads, clearAllThreads };
