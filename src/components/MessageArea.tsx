import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './ChatInput';
import orderBy from 'lodash/orderBy';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { createNewThreadAtom, currentThreadAtom } from '@/atom/derivedAtoms';
import { useMobile } from '@/hooks/useMobile';
import { Burger } from '@mantine/core';
import { drawerAtom } from '@/atom/atoms';
import { IconEdit } from '@tabler/icons-react';

export const MessageArea = () => {
	const isMobile = useMobile();
	const [isDrawerOpened, setDrawerOpen] = useAtom(drawerAtom);
	const currentThread = useAtomValue(currentThreadAtom);
	const createThread = useSetAtom(createNewThreadAtom);

	return (
		<div className={`flex flex-col w-full overflow-auto ${isMobile ? 'h-full' : 'w-full'}`}>
			{isMobile && (
				<div className='sticky top-0 left-0 right-0 px-4 flex flex-row items-center justify-between'>
					<Burger
						opened={isDrawerOpened}
						onClick={() => setDrawerOpen(true)}
						aria-label='Toggle navigation'
					/>
					<IconEdit
						onClick={() => {
							createThread();
						}}
						size={28}
					/>
				</div>
			)}
			<div className='flex-1 overflow-y-auto overscroll-none'>
				{!!currentThread &&
					orderBy(Object.values(currentThread.messages), 'timestamp', 'asc').map((x) => {
						return <ChatMessage key={x.id} text={x.text} owner={x.owner} />;
					})}
			</div>
			<ChatInput />
		</div>
	);
};
