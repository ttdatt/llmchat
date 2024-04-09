import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './ChatInput';
import orderBy from 'lodash/orderBy';
import { useAtomValue } from 'jotai';
import { currentThreadAtom } from '@/atom/atoms';
import cls from 'classnames';

export const MessageArea = ({ isMobile }: { isMobile: boolean }) => {
  const currentThread = useAtomValue(currentThreadAtom);

  if (!currentThread) return null;

  return (
    <div
      className={cls(
        'flex flex-col overflow-auto',
        isMobile ? 'h-full' : 'w-full',
      )}>
      <div className='flex-1 overflow-y-auto overscroll-none'>
        {orderBy(Object.values(currentThread.messages), 'timestamp', 'asc').map(
          (x) => {
            return <ChatMessage key={x.id} text={x.text} owner={x.owner} />;
          },
        )}
      </div>
      <ChatInput />
    </div>
  );
};
