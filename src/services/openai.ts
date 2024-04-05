import OpenAI from 'openai';
import { Thread } from '@/types/Message';
import { LlmModelClient } from '@/types/LlmTypes';
import {
  finishStreamingMessagesAtom,
  llmTokenAtom,
  modelAtom,
  streamMessagesAtom,
} from '@/atom/atoms';
import { atomStore } from '@/atom/store';
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
    openai.apiKey = await atomStore.get(llmTokenAtom);
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

  console.log('openai', openai);

  if (!openai) {
    openai = initializeClient(await atomStore.get(llmTokenAtom));
  }

  const model = (await atomStore.get(modelAtom)).id;

  const stream = await openai.chat.completions.create({
    model,
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
    atomStore.set(streamMessagesAtom, chunk.choices[0]?.delta?.content || '');
  }
  atomStore.set(finishStreamingMessagesAtom, true);
};

const llmClient: LlmModelClient = {
  generateText,
};

export { llmClient };
