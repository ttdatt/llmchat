import React, { useMemo, useState } from 'react';
import { Textarea } from '@mantine/core';
import { useSetAtom } from 'jotai';
import { sendMessageAtom } from '@/atom/derivedAtoms';
import { IconSend } from '@tabler/icons-react';
import { useMobile } from '@/hooks/useMobile';

export const ChatInput = () => {
  const [keydown, setKeydown] = useState<string[]>([]);
  const sendMessage = useSetAtom(sendMessageAtom);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const isMobile = useMobile();

  const sendIcon = useMemo(() => {
    return (
      <IconSend
        onClick={() => {
          if (textareaRef.current) {
            sendMessage(textareaRef.current.value);
            textareaRef.current.value = '';
          }
        }}
        stroke={2}
        color='#228be6'
      />
    );
  }, [sendMessage]);

  return (
    <div className='sticky bottom-0 p-3 pt-0 bg-white'>
      <Textarea
        ref={textareaRef}
        styles={{ input: { fontSize: '1rem' } }}
        autosize
        autoComplete='off'
        autoCorrect='off'
        maxRows={6}
        rightSection={sendIcon}
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

          if (e.key === 'Enter' && !isMobile && !keydown.includes('Shift')) {
            e.preventDefault();
            sendMessage(e.currentTarget.value);
            if (textareaRef.current) textareaRef.current.value = '';
          }
        }}
      />
    </div>
  );
};
