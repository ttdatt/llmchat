/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

const baseURL =
	'https://gateway.ai.cloudflare.com/v1/902f20ca87daefc7e820749f7ea592e9/dat-anthropic-gateway/anthropic';

async function readRequestBody(request) {
	const contentType = request.headers.get('content-type');
	if (!contentType) {
		return null;
	}

	if (contentType.includes('application/json')) {
		return await request.json();
	}

	if (
		contentType.includes('application/text') ||
		contentType.includes('text/plain') ||
		contentType.includes('text/html')
	) {
		return request.text();
	}

	if (contentType.includes('form')) {
		const formData = await request.formData();
		const body = {};
		for (const entry of formData.entries()) {
			body[entry[0]] = entry[1];
		}
		return JSON.stringify(body);
	}
	// Perhaps some other type of data was submitted in the form
	// like an image, or some other binary data.
	return 'a file';
}

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
	'Access-Control-Max-Age': '86400',
	'Access-Control-Allow-Headers': 'Content-Type',
};

async function handleGeminiRequest(request, ctx) {
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
				const chat = client.chats.create({
					model: data.model,
					history: Object.values(data.thread.messages).map((x) => ({
						role: x.owner === 'user' ? 'user' : 'model',
						parts: [{ text: x.text }]
					})),
					config: {
						systemInstruction: data.customInstructions || ''
					}
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
		})()
	);

	return new Response(readable, {
		status: 200,
		headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
	});
}

async function handleClaudeRequest(request, ctx) {
	const data = await readRequestBody(request);
	if (!data || !data.model || !data.token || !data.thread || !data.question) {
		return new Response('Missing required fields', {
			status: 400,
			headers: { ...corsHeaders },
		});
	}

	const client = new Anthropic({ apiKey: data.token, baseURL });

	const { readable, writable } = new TransformStream();
	const writer = writable.getWriter();
	const textEncoder = new TextEncoder();

	ctx.waitUntil(
		(async () => {
			try {
				const body = {
					model: data.model,
					max_tokens: 8192,
					temperature: 0.5,
					system: data.customInstructions,
					messages: [
						...Object.values(data.thread.messages).map((x) => ({
							role: x.owner,
							content: x.text,
						})),
						{
							role: 'user',
							content: data.question,
						},
					],
				};
				if (data.stream) {
					const stream = await client.messages.create({ ...body, stream: true });

					// loop over the data as it is streamed and write to the writeable
					for await (const messageStreamEvent of stream) {
						if (messageStreamEvent.type === 'content_block_delta') {
							if (messageStreamEvent.delta.type === 'text_delta') {
								writer.write(textEncoder.encode(messageStreamEvent.delta.text));
							} else {
								writer.write(textEncoder.encode(messageStreamEvent.delta.partial_json));
							}
						}
					}
				} else {
					const response = await fetch(
						'https://gateway.ai.cloudflare.com/v1/902f20ca87daefc7e820749f7ea592e9/dat-anthropic-gateway/anthropic/v1/messages',
						{
							method: 'POST',
							headers: {
								'x-api-key': data.token,
								'anthropic-version': '2023-06-01',
								'content-type': 'application/json',
							},
							body: JSON.stringify(body),
						},
					);
					const json = await response.json();
					if (json.content?.[0]?.text) {
						writer.write(textEncoder.encode(JSON.stringify(json.content?.[0].text)));
					} else {
						writer.write(textEncoder.encode(JSON.stringify(json)));
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

export default {
	async fetch(request, _env, ctx) {
		if (request.method === 'OPTIONS') {
			// Handle CORS preflight requests
			return new Response(null, {
				status: 204,
				headers: { ...corsHeaders },
			});
		}

		const url = new URL(request.url);
		const path = url.pathname;

		if (path === '/anthropic') {
			return handleClaudeRequest(request, ctx);
		}

		if (path === '/gemini') {
			return handleGeminiRequest(request, ctx);
		}

		return new Response('Not found', { status: 404 });
	},
};
