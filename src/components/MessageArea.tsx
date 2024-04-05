import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './ChatInput';
import sortBy from 'lodash/sortBy';
import { useAtomValue } from 'jotai';
import { currentThreadAtom } from '@/atom/atoms';

export const MessageArea = () => {
  const currentThread = useAtomValue(currentThreadAtom);

  if (!currentThread) return null;

  return (
    <div className='flex flex-col w-full overflow-scroll overscroll-none'>
      <div className='flex-1'>
        {sortBy(Object.values(currentThread.messages), 'timestamp').map((x) => {
          return <ChatMessage key={x.id} text={x.text} owner={x.owner} />;
        })}
      </div>
      <ChatInput />
    </div>
  );
};
