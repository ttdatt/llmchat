import Anthropic from '@anthropic-ai/sdk';
import { corsHeaders, readRequestBody } from './utlis';
import type { Thread } from '../../src/types/Message';
import type { MessageCreateParamsStreaming } from '@anthropic-ai/sdk/resources/messages.mjs';

const baseURL =
	'https://gateway.ai.cloudflare.com/v1/902f20ca87daefc7e820749f7ea592e9/dat-anthropic-gateway/anthropic';

export async function handleClaudeRequest(request: Request, ctx: ExecutionContext) {
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
				const thread = data.thread as Thread;
				const body = {
					model: data.model,
					max_tokens: 8192,
					temperature: 0.5,
					system: data.customInstructions,
					messages: [
						...Object.values(thread.messages).map((x) => ({
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
					const stream = await client.messages.create({
						...body,
						stream: true,
					} as MessageCreateParamsStreaming);

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
