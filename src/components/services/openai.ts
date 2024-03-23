import OpenAI from 'openai';
import { useAppStore } from '../../store';
import { Thread } from '../../types/Message';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

const askOpenAi = async (question: string, thread: Thread) => {
  if (!question) return;

  const stream = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'Do not answer too long. Less than 50 words',
      },
      ...thread.messages.map(x => ({
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
    useAppStore
      .getState()
      .streamMessages(chunk.choices[0]?.delta?.content || '');
  }

  useAppStore.getState().finishStreamingMessages();
};

export { askOpenAi };
