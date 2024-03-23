import { Store } from 'tauri-plugin-store-api';
import { Message, Thread } from '../../../types/Message';
import { v4 as uuidv4 } from 'uuid';

const store = new Store('.settings.dat');
const THREAD_IDS = 'threadIds';

const storeMessage = async (threadId: string = uuidv4(), message: Message) => {
  const thread = (await store.get(threadId)) as Thread | null;

  if (!thread) {
    const threadIds = (await store.get(THREAD_IDS)) as string[] | null;
    if (threadIds) {
      const t = threadIds.find(x => x === threadId);

      if (!t) await store.set(THREAD_IDS, threadIds.concat(threadId));
    } else {
      await store.set(THREAD_IDS, [threadId]);
    }
    await store.set(threadId, {
      id: threadId,
      title: 'New Thread',
      messages: [message],
    });
  } else {
    thread.messages.push(message);
    await store.set(threadId, thread);
  }

  await store.save();
};

const loadThreads = async () => {
  const threadIds = (await store.get(THREAD_IDS)) as string[] | null;

  if (threadIds) {
    const threads = await Promise.all(
      threadIds.map(async x => (await store.get(x)) as Thread)
    );
    return threads;
  }
  return [];
};

const deleteThread = async (threadId: string) => {
  const threadIds = (await store.get(THREAD_IDS)) as string[] | null;
  if (threadIds) {
    await store.set(
      THREAD_IDS,
      threadIds.filter(x => x !== threadId)
    );
    await store.delete(threadId);
    await store.save();
  }
};

const clearAll = async () => {
  await store.clear();
};

export { storeMessage, loadThreads, clearAll, deleteThread };
