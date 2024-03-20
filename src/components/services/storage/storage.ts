import { Store } from 'tauri-plugin-store-api';
import { Message } from '../../../types/Message';

const store = new Store('.settings.dat');

const storeMessage = async (
  threadName: string = 'my-thread',
  message: Message
) => {
  const thread = (await store.get(threadName)) as Message[] | null;
  if (!thread) {
    await store.set(threadName, [message]);
  } else {
    thread.push(message);
    await store.set(threadName, thread);
  }

  await store.save();
};

export { storeMessage };
