import { GoogleGenAI } from '@google/genai';
import { corsHeaders, readRequestBody } from './utlis';
import { Thread } from '../../src/types/Message';
import { Buffer } from 'node:buffer';

export async function generateGeminiImage(request: Request, ctx: ExecutionContext) {
	const data = await readRequestBody(request);
	if (!data || !data.model || !data.token || !data.question) {
		return new Response('Missing required fields (model, token, question)', {
			status: 400,
			headers: { ...corsHeaders },
		});
	}

	try {
		const ai = new GoogleGenAI({ apiKey: data.token });

		const response = await ai.models.generateImages({
			model: 'imagen-3.0-generate-002',
			prompt: data.question,
			config: {
				numberOfImages: 1,
			},
		});

		if (
			!response.generatedImages ||
			response.generatedImages.length === 0 ||
			!response.generatedImages[0].image?.imageBytes
		) {
			return new Response('Image generation failed or returned no data', {
				status: 500,
				headers: { ...corsHeaders },
			});
		}

		const generatedImage = response.generatedImages[0];
		const imgBytes = generatedImage.image.imageBytes;
		const buffer = Buffer.from(imgBytes, 'base64');

		return new Response(buffer, {
			headers: {
				...corsHeaders,
				'Content-Type': 'image/png',
				'Content-Length': buffer.length.toString(),
			},
		});
	} catch (error: unknown) {
		console.error('Error generating image:', error);
		const errorMessage = error instanceof Error ? error.message : 'An internal error occurred';
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
}

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
