import Anthropic from '@anthropic-ai/sdk';
import { corsHeaders, readRequestBody } from './utlis';
import type { Thread } from '../../src/types/Message';
import type { MessageCreateParamsStreaming } from '@anthropic-ai/sdk/resources/messages.mjs';
import { MessageStreamParams } from '@anthropic-ai/sdk/resources/index.mjs';

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
				const body: MessageStreamParams = {
					model: data.model,
					max_tokens: 32000,
					temperature: 0.7,
					system: data.customInstructions,
					stream: true,
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
					const stream = await client.messages.stream({
						...body,
					} as MessageCreateParamsStreaming);

					// loop over the data as it is streamed and write to the writeable
					for await (const messageStreamEvent of stream) {
						if (messageStreamEvent.type === 'content_block_delta') {
							switch (messageStreamEvent.delta.type) {
								case 'text_delta':
									writer.write(textEncoder.encode(messageStreamEvent.delta.text));
									break;
								case 'input_json_delta':
									writer.write(textEncoder.encode(messageStreamEvent.delta.partial_json));
									break;
								case 'citations_delta':
									writer.write(textEncoder.encode(messageStreamEvent.delta.citation.cited_text));
									break;
								case 'thinking_delta':
									writer.write(textEncoder.encode(messageStreamEvent.delta.thinking));
									break;
								case 'signature_delta':
									writer.write(textEncoder.encode(messageStreamEvent.delta.signature));
									break;
								default:
									break;
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
