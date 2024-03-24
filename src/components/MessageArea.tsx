import { ChatMessage } from './chat/ChatMessage';
import { useAppStore } from '../store';
import { ChatInput } from './ChatInput';

export const MessageArea = () => {
  const currentThread = useAppStore(state => state.currentThread);

  if (!currentThread) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'scroll',
        overscrollBehavior: 'none',
        width: '100%',
      }}>
      <div
        style={{
          flex: 1,
        }}>
        {currentThread?.messages.map(x => {
          return <ChatMessage key={x.id} message={x} />;
        })}
      </div>
      <ChatInput />
    </div>
  );
};
