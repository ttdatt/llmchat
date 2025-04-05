import { GenerateTextParams, LlmModelClient, GenerateImageParams } from '@/types/LlmTypes';
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

	const model = atomStore.get(modelAtom)?.modelId;
	const customInstructions = atomStore.get(customInstructionsAtom);
	const token = atomStore.get(llmTokenAtom);

	try {
		const response = await fetch('https://icy-night-f14d.trantiendat1508.workers.dev/gemini', {
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

const generateImage = async ({ prompt, onFinish }: GenerateImageParams): Promise<string | null> => {
	if (!prompt) {
		console.error('Prompt is required for image generation');
		return null;
	}

	const token = atomStore.get(llmTokenAtom);

	if (!token) {
		notifications.show({
			title: 'Error',
			message: 'Gemini API token not set',
			color: 'red',
			autoClose: 5000,
		});
		return null;
	}
	const model = atomStore.get(modelAtom)?.modelId;

	try {
		const response = await fetch(
			'https://icy-night-f14d.trantiendat1508.workers.dev/gemini-image',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token,
					model,
					question: prompt,
				}),
			},
		);

		if (!response.ok) {
			let errorMsg = 'Failed to generate image';
			try {
				const errorData = await response.json();
				errorMsg = errorData?.error || errorMsg;
			} catch (e) {}
			throw new Error(errorMsg);
		}

		if (!response.body) {
			throw new Error('No response body received from image generation');
		}

		const blob = await response.blob();

		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				resolve(reader.result as string);
			};
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		if (error instanceof Error) {
			notifications.show({
				title: 'Image Generation Error',
				message: error.message,
				color: 'red',
				autoClose: 10000,
			});
		}
		return null;
	} finally {
		if (typeof onFinish === 'function') onFinish();
	}
};

const llmClient: LlmModelClient = {
	generateText,
	generateImage,
};

export { llmClient };
