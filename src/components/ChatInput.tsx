import { useState } from 'react';
import { Textarea } from '@mantine/core';
import { storeMessage } from './services/storage/storage';

export const ChatInput = () => {
  const [keydown, setKeydown] = useState<string[]>([]);

  console.log(keydown);

  return (
    <Textarea
      autosize
      autoComplete='off'
      autoCorrect='off'
      maxRows={6}
      style={{
        position: 'sticky',
        bottom: 10,
        marginLeft: 10,
        marginRight: 10,
      }}
      onKeyUp={e => {
        if (
          e.key.includes('Shift') ||
          e.key.includes('Control') ||
          e.key.includes('Alt') ||
          e.key.includes('Meta')
        )
          setKeydown(x => {
            if (x.includes(e.key)) return x.filter(y => y !== e.key);
            return x;
          });
      }}
      onKeyDown={async e => {
        if (
          e.key.includes('Shift') ||
          e.key.includes('Control') ||
          e.key.includes('Alt') ||
          e.key.includes('Meta')
        )
          setKeydown(x => [...x, e.key]);

        if (e.key === 'Enter' && !keydown.includes('Shift')) {
          e.preventDefault();
          console.log(e.key, e.code);
          storeMessage('my-thread', {
            owner: 'me',
            text: e.currentTarget.value,
            timestamp: new Date().toISOString(),
          });
        }
      }}
    />
  );
};
