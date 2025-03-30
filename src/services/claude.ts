import { GenerateTextParams, LlmModelClient } from '@/types/LlmTypes';
import {
	finishStreamingMessagesAtom,
	llmTokenAtom,
	modelAtom,
	streamMessagesAtom,
} from '@/atom/derivedAtoms';
import { atomStore } from '@/atom/store';
import { notifications } from '@mantine/notifications';
import { customInstructionsAtom } from '@/atom/atoms';

const generateText = async ({ question, thread, onFinish }: GenerateTextParams) => {
	if (!question || !thread) return;

	const model = atomStore.get(modelAtom).modelId;
	const customInstructions = atomStore.get(customInstructionsAtom);
	const token = atomStore.get(llmTokenAtom);

	try {
		const response = await fetch('https://icy-night-f14d.trantiendat1508.workers.dev/anthropic', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				stream: true,
				token,
				model,
				question,
				thread,
				customInstructions,
			}),
		});

		if (!response.ok || !response.body) {
			throw new Error('Failed to generate text');
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder('utf-8');

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const text = decoder.decode(value, { stream: true });
			atomStore.set(streamMessagesAtom, text);
		}

		atomStore.set(finishStreamingMessagesAtom, true);

		console.log('finished!!!');
		if (typeof onFinish === 'function') onFinish();
	} catch (error) {
		if (error instanceof Error) {
			notifications.show({
				title: 'Error',
				message: error.message,
				color: 'red',
				autoClose: 10000,
			});
		}
	}
};

const llmClient: LlmModelClient = {
	generateText,
};

export { llmClient };
