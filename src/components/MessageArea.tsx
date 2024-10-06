import { ChatMessage } from './chat/ChatMessage';
import { ChatInput } from './ChatInput';
import orderBy from 'lodash/orderBy';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { addFilesToThreadAtom, createNewThreadAtom, currentThreadAtom } from '@/atom/derivedAtoms';
import { useMobile } from '@/hooks/useMobile';
import { Burger } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { drawerAtom, llmTokensAtom } from '@/atom/atoms';
import { IconEdit } from '@tabler/icons-react';
import { isEmpty } from 'lodash';

export const MessageArea = () => {
	const isMobile = useMobile();
	const [isDrawerOpened, setDrawerOpen] = useAtom(drawerAtom);
	const currentThread = useAtomValue(currentThreadAtom);
	const createThread = useSetAtom(createNewThreadAtom);
	const addFiles = useSetAtom(addFilesToThreadAtom);
	const llmTokens = useAtomValue(llmTokensAtom);
	const dontHaveKey = Object.values(llmTokens).every((value) => isEmpty(value.trim()));

	return (
		<div className={`flex flex-col w-full overflow-auto ${isMobile ? 'h-full' : 'w-full'}`}>
			{dontHaveKey && (
				<p className='bg-gray-200 text-center text-xs font-mono'>
					To enable chatting with ChatGPT or Claude, you must enter your API key in the Settings.
				</p>
			)}
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
			<Dropzone.FullScreen
				activateOnDrag
				className='flex-1 overflow-y-auto overscroll-none'
				onDrop={(files) => {
					addFiles(files);
				}}
			/>
			<div className='flex-1 overflow-y-auto overscroll-none'>
				{!!currentThread &&
					orderBy(Object.values(currentThread.messages), 'timestamp', 'asc').map((x) => {
						return <ChatMessage key={x.id} text={x.text} image={x.image} owner={x.owner} />;
					})}
			</div>
			<ChatInput />
		</div>
	);
};
