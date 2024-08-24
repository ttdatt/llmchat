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

async function readRequestBody(request) {
	const contentType = request.headers.get('content-type');
	if (!contentType) {
		return null;
	}

	if (contentType.includes('application/json')) {
		return await request.json();
	}

	if (contentType.includes('application/text') || contentType.includes('text/plain') || contentType.includes('text/html')) {
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

async function handleOptions(request) {
	if (
		request.headers.get('Origin') !== null &&
		request.headers.get('Access-Control-Request-Method') !== null &&
		request.headers.get('Access-Control-Request-Headers') !== null
	) {
		// Handle CORS preflight requests.
		return new Response(null, {
			headers: {
				...corsHeaders,
				'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers'),
			},
		});
	}
	// Handle standard OPTIONS request.
	return new Response(null, {
		headers: {
			Allow: 'GET, HEAD, POST, OPTIONS',
		},
	});
}

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			// Handle CORS preflight requests
			return handleOptions(request);
		}

		const data = await readRequestBody(request);
		if (!data || !data.model || !data.token || !data.customInstructions || !data.thread || !data.question) {
			return new Response('Missing required fields', {
				status: 400,
				headers: { ...corsHeaders },
			});
		}

		const client = new Anthropic({ apiKey: data.token });

		const { readable, writable } = new TransformStream();
		const writer = writable.getWriter();
		const textEncoder = new TextEncoder();

		ctx.waitUntil(
			(async () => {
				const stream = await client.messages.create({
					model: data.model,
					max_tokens: 1024,
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
					stream: true,
				});

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

				writer.close();
			})()
		);

		const response = new Response(readable);
		response.headers.set('Access-Control-Allow-Origin', '*');
		response.headers.append('Vary', 'Origin');
		return response;
	},
};
