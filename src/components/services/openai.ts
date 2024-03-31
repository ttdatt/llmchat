import OpenAI from 'openai';
import { useAppStore } from '../../store';
import { Thread } from '../../types/Message';
// import fileText from '../../assets/msg.txt';
// import codeText from '../../assets/code.txt';

let openai: undefined | OpenAI;

const init = (token: string) => {
	openai = new OpenAI({
		apiKey: token,
		dangerouslyAllowBrowser: true,
	});
	useAppStore.subscribe((state, prev) => {
		if (state.llmToken !== prev.llmToken) {
			if (openai) openai.apiKey = state.llmToken;
			else
				openai = new OpenAI({
					apiKey: state.llmToken,
					dangerouslyAllowBrowser: true,
				});
		}
	});
};

const askOpenAi = async (question: string, thread?: Thread) => {
	// const STEP = 10;
	// let offset = 0;
	// const r = await fetch(codeText);
	// const text = await r.text();

	// const inte = setInterval(() => {
	// 	useAppStore.getState().streamMessages(text.slice(offset, offset + STEP));
	// 	offset += STEP;
	// 	if (offset >= text.length) {
	// 		clearInterval(inte);
	// 		offset = 0;
	// 		useAppStore.getState().finishStreamingMessages(false);
	// 	}
	// }, 100);
	// return;

	if (!question || !thread || !openai) return;

	const stream = await openai.chat.completions.create({
		model: 'gpt-4-turbo-preview',
		temperature: 0.5,
		messages: [
			{
				role: 'system',
				content:
					'Embody the role of the most qualified subject matter experts. Keep your response brief and focused. Keep responses unique and free of repetition. Exclude personal ethics or morals unless explicitly relevant. Acknowledge and correct any past errors.',
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
	});

	for await (const chunk of stream) {
		useAppStore
			.getState()
			.streamMessages(chunk.choices[0]?.delta?.content || '');
	}

	useAppStore.getState().finishStreamingMessages();
};

export { askOpenAi, init };
