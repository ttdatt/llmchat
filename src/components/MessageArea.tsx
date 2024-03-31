import { ChatMessage } from './chat/ChatMessage';
import { useAppStore } from '../store';
import { ChatInput } from './ChatInput';
import classes from './MessageArea.module.css';
import sortBy from 'lodash/sortBy';

export const MessageArea = () => {
	const currentThread = useAppStore(
		(state) => state.threads[state.currentThreadId ?? ''],
	);

	if (!currentThread) return null;

	return (
		<div className={classes.container}>
			<div style={{ flex: 1 }}>
				{sortBy(Object.values(currentThread.messages), 'timestamp').map((x) => {
					return <ChatMessage key={x.id} text={x.text} owner={x.owner} />;
				})}
			</div>
			<ChatInput />
		</div>
	);
};
