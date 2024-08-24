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

const generateText = async ({ question, thread }: GenerateTextParams) => {
	if (!question || !thread) return;

	const model = atomStore.get(modelAtom).id;
	const customInstructions = atomStore.get(customInstructionsAtom);
	const token = atomStore.get(llmTokenAtom);

	try {
		const response = await fetch(
			'https://dawn-shape-88ec.trantiendat1508.workers.dev/',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token,
					model,
					question,
					thread,
					customInstructions,
				}),
			},
		);

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

		atomStore.set(finishStreamingMessagesAtom, null);
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
