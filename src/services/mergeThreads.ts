import { ChatMessageType, Thread } from '@/types/Message';

const NUMBER_OF_SYNCED_RECORDS = 100;

export const mergeThreads = (
	localThreads: Thread[] | null | undefined,
	remoteThreads: Thread[] | null | undefined,
) => {
	const combinedThreads = [...(localThreads || []), ...(remoteThreads || [])].filter(
		Boolean,
	) as Thread[];

	// Sort combined threads by timestamp first
	combinedThreads.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

	const threadMap: Record<string, Thread> = {};
	for (const thread of combinedThreads) {
		if (threadMap[thread.id]) {
			threadMap[thread.id] = {
				...threadMap[thread.id],
				messages: mergeMessages(threadMap[thread.id].messages, thread.messages),
				timestamp:
					new Date(threadMap[thread.id].timestamp) > new Date(thread.timestamp)
						? threadMap[thread.id].timestamp
						: thread.timestamp,
			};
		} else {
			threadMap[thread.id] = thread;
		}

		if (Object.keys(threadMap).length >= NUMBER_OF_SYNCED_RECORDS) {
			break;
		}
	}

	return threadMap;
};

const mergeMessages = (
	messages1: Record<string, ChatMessageType>,
	messages2: Record<string, ChatMessageType>,
): Record<string, ChatMessageType> => {
	return { ...messages1, ...messages2 };
};
