import { Text } from '@mantine/core';
import { Message } from '@/types/Message';
import { GptIcon } from '@/assets/gpt';
import { IconUserFilled } from '@tabler/icons-react';
import Markdown, { ExtraProps } from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-async-light';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import classes from './ChatMessage.module.css';
import { memo, useMemo } from 'react';

type ChatMessageProps = {
  text: Message['text'];
  owner: Message['owner'];
};
export const ChatMessage = memo(({ text, owner }: ChatMessageProps) => {
  const Icon = useMemo(() => {
    if (owner === 'assistant') {
      return <GptIcon />;
    }
    return (
      <div className='w-8 h-8 bg-pink-300 p-1 rounded-full'>
        <IconUserFilled className='fill-white' />
      </div>
    );
  }, [owner]);

  const components = useMemo(
    () => ({
      code: (
        props: React.ClassAttributes<HTMLElement> &
          React.HTMLAttributes<HTMLElement> &
          ExtraProps,
      ) => {
        const { children, className, node } = props;
        const match = /language-(\w+)/.exec(className || '');

        if (node?.position?.start.line === node?.position?.end.line) {
          return <span className='font-bold text-black'>`{children}`</span>;
        }

        return (
          <SyntaxHighlighter
            language={match?.[1] ?? 'plaintext'}
            customStyle={{
              backgroundColor: 'black',
              borderRadius: 4,
              marginBottom: 20,
            }}
            codeTagProps={{
              style: {
                background: 'black',
                fontSize: '14px',
              },
            }}
            style={oneDark}>
            {String(children)}
          </SyntaxHighlighter>
        );
      },
    }),
    [],
  );

  return (
    <div className='flex flex-row gap-2 p-4'>
      {Icon}
      <div className='flex flex-col overflow-x-auto'>
        <Text size='lg' fw={600} lh='2rem'>
          {owner === 'assistant' ? 'Assistant' : 'You'}
        </Text>
        <Markdown className={classes.chatdiv} components={components}>
          {text}
        </Markdown>
      </div>
    </div>
  );
});
