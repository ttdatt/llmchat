import OpenAI from 'openai';
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
// import fileText from '../../assets/msg.txt';
// import codeText from '../assets/code.txt';

let openai: undefined | OpenAI;

const initializeClient = (token: string) => {
  openai = new OpenAI({
    apiKey: token,
    dangerouslyAllowBrowser: true,
  });

  atomStore.sub(llmTokenAtom, async () => {
    if (!openai) return;
    openai.apiKey = (await atomStore.get(llmTokenAtom)) ?? '';
  });
  return openai;
};

const generateText = async (question: string, thread?: Thread) => {
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

  if (!openai) {
    const token = await atomStore.get(llmTokenAtom);
    if (!token) return;
    openai = initializeClient(token);
  }

  const model = atomStore.get(modelAtom).id;
  const customInstructions = atomStore.get(customInstructionsAtom);

  try {
    const stream = await openai.chat.completions.create({
      model,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: customInstructions,
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
      atomStore.set(streamMessagesAtom, chunk.choices[0]?.delta?.content || '');
    }

    atomStore.set(finishStreamingMessagesAtom, true);
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
