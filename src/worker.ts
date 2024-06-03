import { saveThread } from './services/googleApi';
import { deleteThread } from './services/threadStorage';
import { WorkerData, WorkerResponse } from './types/Worker';

self.onmessage = async (event) => {
  const data: WorkerData = event.data;
  try {
    if (data.type === 'add-thread') {
      const { threadId } = data;

      await saveThread(threadId);

      const response: WorkerResponse = {
        from: data.type,
        success: true,
      };
      self.postMessage(response);
    } else if (data.type === 'delete-thread') {
      const { threadId } = data;
      await deleteThread(threadId);
      const response: WorkerResponse = {
        from: data.type,
        success: true,
      };
      self.postMessage(response);
    }
  } catch (e) {
    console.error(e);
    const errorResponse: WorkerResponse = {
      from: data.type,
      success: false,
      error: String(e),
    };
    self.postMessage(errorResponse);
  }
};
