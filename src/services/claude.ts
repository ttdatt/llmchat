import Anthropic from '@anthropic-ai/sdk';
import { Thread } from '@/types/Message';
import { LlmModelClient } from '@/types/LlmTypes';
import {
  finishStreamingMessagesAtom,
  llmTokenAtom,
  modelAtom,
  streamMessagesAtom,
} from '@/atom/atoms';
import { atomStore } from '@/atom/store';

let anthropic: undefined | Anthropic;

const initializeClient = (token: string) => {
  anthropic = new Anthropic({
    apiKey: token,
  });
  atomStore.sub(llmTokenAtom, async () => {
    if (anthropic) anthropic.apiKey = await atomStore.get(llmTokenAtom);
    else
      anthropic = new Anthropic({
        apiKey: token,
      });
  });
  return anthropic;
};

const generateText = async (question: string, thread?: Thread) => {
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

  if (!question || !thread) return;

  if (!anthropic) {
    anthropic = initializeClient(await atomStore.get(llmTokenAtom));
  }

  const model = (await atomStore.get(modelAtom)).id;
  const stream = await anthropic.messages.create({
    model,
    max_tokens: 1024,
    temperature: 0.5,
    system:
      'Embody the role of the most qualified subject matter experts. Keep your response brief and focused. Keep responses unique and free of repetition. Exclude personal ethics or morals unless explicitly relevant. Acknowledge and correct any past errors.',
    messages: [
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

  for await (const messageStreamEvent of stream) {
    if (messageStreamEvent.type === 'content_block_delta') {
      atomStore.set(streamMessagesAtom, messageStreamEvent.delta.text);
    }
  }
  atomStore.set(finishStreamingMessagesAtom, null);
};

const llmClient: LlmModelClient = {
  generateText,
};

export { llmClient };
