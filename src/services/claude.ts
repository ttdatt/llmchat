import Anthropic from '@anthropic-ai/sdk';
import { Thread } from '@/types/Message';
import { LlmModelClient } from '@/types/LlmTypes';
import {
  finishStreamingMessagesAtom,
  llmTokenAtom,
  modelAtom,
  streamMessagesAtom,
} from '@/atom/derivedAtoms';
import { atomStore } from '@/atom/store';
import { notifications } from '@mantine/notifications';
import { customInstructionsAtom } from '@/atom/atoms';

let anthropic: undefined | Anthropic;

const initializeClient = (token: string) => {
  anthropic = new Anthropic({
    apiKey: token,
  });
  atomStore.sub(llmTokenAtom, async () => {
    if (anthropic) anthropic.apiKey = (await atomStore.get(llmTokenAtom)) ?? '';
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
    const token = atomStore.get(llmTokenAtom);
    if (!token) return;
    anthropic = initializeClient(token);
  }

  const model = atomStore.get(modelAtom).id;
  const customInstructions = atomStore.get(customInstructionsAtom);

  try {
    const stream = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      temperature: 0.5,
      system: customInstructions,
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
