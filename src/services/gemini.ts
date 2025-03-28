import { GoogleGenAI } from '@google/genai';
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

// import fileText from '../../assets/msg.txt';
// import codeText from '../assets/code.txt';

let gemini: undefined | GoogleGenAI;

const initializeClient = (token: string) => {
	gemini = new GoogleGenAI({ apiKey: token });

	atomStore.sub(llmTokenAtom, async () => {
		const token = await atomStore.get(llmTokenAtom);
		gemini = new GoogleGenAI({ apiKey: token ?? '' });
	});
	return gemini;
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

	if (!gemini) {
		const token = await atomStore.get(llmTokenAtom);
		if (!token) return;
		gemini = initializeClient(token);
	}

	const model = atomStore.get(modelAtom);
	const modelId = model.modelId;
	const customInstructions = atomStore.get(customInstructionsAtom);

	try {
		const history = Object.values(thread.messages);
		const chat = gemini.chats.create({
			model: modelId,
			history: history.map((x) => ({
				role: x.owner === 'user' ? 'user' : 'model',
				parts: [{ text: x.text }],
			})),
			config: {
				systemInstruction: customInstructions,
			},
		});

		const stream = await chat.sendMessageStream({
			message: question,
		});
		for await (const chunk of stream) {
			atomStore.set(streamMessagesAtom, chunk.text || '');
		}

		atomStore.set(finishStreamingMessagesAtom, true);

		// trigger sync to cloud
		console.log('finished!!!');
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
