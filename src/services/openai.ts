import OpenAI from 'openai';
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
import { ChatCompletionCreateParamsStreaming } from 'openai/resources/index.mjs';

// import fileText from '../../assets/msg.txt';
// import codeText from '../assets/code.txt';

let openai: undefined | OpenAI;

const initializeClient = (token: string) => {
	openai = new OpenAI({
		apiKey: token,
		dangerouslyAllowBrowser: true,
	});

	atomStore.sub(llmTokenAtom, async () => {
		if (!openai) return;
		openai.apiKey = (await atomStore.get(llmTokenAtom)) ?? '';
	});
	return openai;
};

const isReasonModalFamily = (model: string) => {
	return model.includes('o1') || model.includes('o3');
};

const generateText = async ({ question, thread, onFinish }: GenerateTextParams) => {
	// const STEP = 10;
	// let offset = 0;
	// const r = await fetch(codeText);
	// const text = await r.text();

	// const inte = setInterval(() => {
	//   atomStore.set(streamMessagesAtom, text.slice(offset, offset + STEP));
	//   offset += STEP;
	//   if (offset >= text.length) {
	//     clearInterval(inte);
	//     offset = 0;
	//     atomStore.set(finishStreamingMessagesAtom, true);
	//   }
	// }, 10);
	// return;

	if (!question || !thread) return;

	if (!openai) {
		const token = await atomStore.get(llmTokenAtom);
		if (!token) return;
		openai = initializeClient(token);
	}

	const model = atomStore.get(modelAtom);
	const modelId = model.modelId;
	const customInstructions = atomStore.get(customInstructionsAtom);

	try {
		const body: ChatCompletionCreateParamsStreaming = {
			model: modelId,
			temperature: isReasonModalFamily(modelId) ? 1 : 0.5,
			messages: [
				{
					role: 'developer',
					content: customInstructions,
				},
				...Object.values(thread.messages).map((x) => ({
					role: x.owner,
					content: x.text,
				})),
				{
					role: 'user',
					content: question,
				},
			],
			stream: true,
		};
		if (model.reasoning) {
			body.reasoning_effort = model.reasoning;
		}
		const stream = await openai.chat.completions.create(body);

		for await (const chunk of stream) {
			atomStore.set(streamMessagesAtom, chunk.choices[0]?.delta?.content || '');
		}

		atomStore.set(finishStreamingMessagesAtom, true);

		// trigger sync to cloud
		if (typeof onFinish === 'function') {
			onFinish();
		}
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
