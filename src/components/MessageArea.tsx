import { ChatMessage } from './chat/ChatMessage';
import { useAppStore } from '../store';
import { ChatInput } from './ChatInput';
import './MessageArea.css';

export const MessageArea = () => {
  const currentThread = useAppStore(
    state => state.threads[state.currentThreadId ?? '']
  );

  if (!currentThread) return null;

  return (
    <div
      className='container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'scroll',
        overscrollBehavior: 'none',
        width: '100%',
        scrollSnapType: 'y proximity',
      }}>
      <div style={{ flex: 1 }}>
        {Object.values(currentThread.messages).map(x => {
          return <ChatMessage key={x.id} text={x.text} owner={x.owner} />;
        })}
      </div>
      <ChatInput />
    </div>
  );
};
