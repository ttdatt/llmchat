import { Text } from '@mantine/core';
import { Message } from '../../types/Message';
import { GptIcon } from '../../assets/gpt';
import { IconUserFilled } from '@tabler/icons-react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatMessage.css';

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

  console.log('message', message);

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
          className='chatdiv'
          children={message.text}
          components={{
            code: props => {
              const { children, className, node, ref, ...rest } = props;
              console.log('code', {
                children,
                className,
                node,
                ref,
                rest,
              });

              const match = /language-(\w+)/.exec(className || '');

              if (node?.position?.start.line === node?.position?.end.line) {
                return (
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: 'black',
                    }}>
                    `{children}`
                  </span>
                );
              } else
                return (
                  <SyntaxHighlighter
                    {...rest}
                    children={String(children)}
                    language={match?.[1] ?? 'plaintext'}
                    customStyle={{
                      backgroundColor: 'black',
                      borderRadius: 4,
                    }}
                    codeTagProps={{
                      style: {
                        background: 'black',
                        fontSize: '14px',
                      },
                    }}
                    style={oneDark}
                  />
                );
            },
          }}
        />
      </div>
    </div>
  );
};
