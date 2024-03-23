export type Thread = {
  id: string;
  title: string;
  messages: Message[];
};

export type Message = {
  id: string;
  owner: 'user' | 'assistant';
  text: string;
  timestamp: string;
};
