import { Avatar, Group, Text } from '@mantine/core';

type ChatMessageProps = {
  message: string;
  owner?: string;
};
export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <Group style={{ padding: 10, flexWrap: 'nowrap' }}>
      <Avatar
        style={{ alignSelf: 'flex-start' }}
        size='md'
        src='https://avatars.githubusercontent.com/u/1024025?v=4'
      />
      <Text style={{ alignSelf: 'center', whiteSpace: 'pre-line' }}>
        {message}
      </Text>
    </Group>
  );
};
