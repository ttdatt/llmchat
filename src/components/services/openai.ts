import { getClient, Client, Body } from '@tauri-apps/api/http';

let client: Client | null = null;

const initHttpClient = async () => {
  client = await getClient();
};

const askOpenAi = async () => {
  if (!client) return;

  const response = await client.post(
    'https://api.openai.com/v1/chat/completions',
    Body.json({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content:
            'with reactjs, i have 2 div side by side. They both have long text content. I want to have separate scroll for each div. How to do?',
        },
      ],
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`,
      },
    }
  );
  console.log(response);
  return response;
};

export { initHttpClient, askOpenAi };
