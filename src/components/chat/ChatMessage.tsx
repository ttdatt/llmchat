import { Text } from '@mantine/core';
import { Message } from '../../types/Message';
import { GptIcon } from '../../assets/gpt';
import { IconUserFilled } from '@tabler/icons-react';

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
        padding: 10,
        flexWrap: 'nowrap',
        gap: 8,
      }}>
      {renderIcon()}
      <div>
        <Text size='lg' fw={600} lh='2rem'>
          {message.owner === 'assistant' ? 'Assistant' : 'You'}
        </Text>
        <Text style={{ alignSelf: 'center', whiteSpace: 'pre-line' }}>
          {message.text}
        </Text>
      </div>
    </div>
  );
};
