import React, { useState } from 'react';
import { Textarea } from '@mantine/core';
import { useSetAtom } from 'jotai';
import { sendMessageAtom } from '@/atom/atoms';

export const ChatInput = () => {
  const [keydown, setKeydown] = useState<string[]>([]);
  const sendMessage = useSetAtom(sendMessageAtom);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <div className='sticky bottom-0 p-3 pt-0 bg-white'>
      <Textarea
        ref={textareaRef}
        autosize
        autoFocus
        autoComplete='off'
        autoCorrect='off'
        maxRows={6}
        onKeyUp={(e) => {
          if (
            e.key.includes('Shift') ||
            e.key.includes('Control') ||
            e.key.includes('Alt') ||
            e.key.includes('Meta')
          )
            setKeydown((x) => {
              if (x.includes(e.key)) return x.filter((y) => y !== e.key);
              return x;
            });
        }}
        onKeyDown={async (e) => {
          if (
            e.key.includes('Shift') ||
            e.key.includes('Control') ||
            e.key.includes('Alt') ||
            e.key.includes('Meta')
          )
            setKeydown((x) => [...x, e.key]);

          if (e.key === 'Enter' && !keydown.includes('Shift')) {
            e.preventDefault();
            sendMessage(e.currentTarget.value);
            if (textareaRef.current) textareaRef.current.value = '';
          }
        }}
      />
    </div>
  );
};
