import { ScrollArea } from '@mantine/core';
import { ChatMessage } from './chat/ChatMessage';
import { useAppStore } from '../store';
import { useRef } from 'react';

export const MessageArea = () => {
  const currentThread = useAppStore(state => state.currentThread);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollArea ref={scrollRef} h='100vh'>
      {currentThread?.messages.map(x => {
        return <ChatMessage key={x.id} message={x} />;
      })}
    </ScrollArea>
  );
};
