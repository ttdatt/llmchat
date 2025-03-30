import { GoogleGenAI } from '@google/genai';
import { corsHeaders, readRequestBody } from './utlis';
import { Thread } from '../../src/types/Message';

export async function handleGeminiRequest(request: Request, ctx: ExecutionContext) {
	const data = await readRequestBody(request);
	if (!data || !data.model || !data.token || !data.thread || !data.question) {
		return new Response('Missing required fields', {
			status: 400,
			headers: { ...corsHeaders },
		});
	}

	const client = new GoogleGenAI({ apiKey: data.token });
	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const textEncoder = new TextEncoder();

	ctx.waitUntil(
		(async () => {
			try {
				const thread = data.thread as Thread;
				const history = Object.values(thread.messages).map((x) => ({
					role: x.owner === 'user' ? 'user' : 'model',
					parts: [{ text: x.text }],
				}));
				const chat = client.chats.create({
					model: data.model,
					history,
					config: {
						systemInstruction: data.customInstructions || '',
					},
				});
				const stream = await chat.sendMessageStream({ message: data.question });
				for await (const chunk of stream) {
					if (chunk.text) {
						writer.write(textEncoder.encode(chunk.text));
					}
				}
				writer.close();
			} catch (e) {
				writer.write(textEncoder.encode(JSON.stringify({ error: e.message })));
				writer.close();
			}
		})(),
	);

	return new Response(readable, {
		status: 200,
		headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
	});
}
