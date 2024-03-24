import { Text } from '@mantine/core';
import { Message } from '../../types/Message';
import { GptIcon } from '../../assets/gpt';
import { IconUserFilled } from '@tabler/icons-react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type ChatMessageProps = {
  message: Message;
};
export const ChatMessage = ({ message }: ChatMessageProps) => {
  const renderIcon = () => {
    if (message.owner === 'assistant') {
      return <GptIcon iconStyle={{ fill: 'white' }} />;
    }
    return (
      <div
        style={{
          minWidth: '2rem',
          width: '2rem',
          height: '2rem',
          backgroundColor: 'pink',
          padding: 4,
          borderRadius: '50%',
        }}>
        <IconUserFilled style={{ fill: 'white' }} />
      </div>
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
        padding: 10,
      }}>
      {renderIcon()}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'scroll',
        }}>
        <Text size='lg' fw={600} lh='2rem'>
          {message.owner === 'assistant' ? 'Assistant' : 'You'}
        </Text>
        <Markdown
          components={{
            code: props => {
              const { children, className, node, ref, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              console.log('match', { match, className, children });

              return (
                <SyntaxHighlighter
                  {...rest}
                  PreTag='div'
                  children={String(children).replace(/\n$/, '')}
                  language={match?.[1] ?? 'plaintext'}
                  customStyle={{
                    backgroundColor: 'black',
                    borderRadius: 8,
                  }}
                  style={vscDarkPlus}
                />
              );
            },
          }}>
          {message.text}
        </Markdown>
      </div>
    </div>
  );
};
