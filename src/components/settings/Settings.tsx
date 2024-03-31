import { Button, TextInput, Modal, Text, Divider } from '@mantine/core';
import { useAppStore } from '../../store';
import classes from './Settings.module.css';
import { useEffect, useState } from 'react';

export const Settings = () => {
	const opened = useAppStore((state) => state.modalVisible);
	const toggle = useAppStore((state) => state.toggleModal);
	const setLlmToken = useAppStore((state) => state.setLlmToken);
	const deleteAllChat = useAppStore((state) => state.deleteAllThreads);
	const llmToken = useAppStore((state) => state.llmToken);
	const [text, setText] = useState(llmToken);

	useEffect(() => {
		setText(llmToken);
	}, [llmToken]);

	return (
		<Modal opened={opened} onClose={toggle} title='Settings'>
			<div className={classes.settingsModalDiv}>
				<Text>OpenAI token:</Text>
				<TextInput
					autoCapitalize='off'
					autoCorrect='off'
					value={text}
					placeholder='Enter your OpenAI token'
					onChange={(event) => {
						setText(event.target.value);
					}}
				/>
			</div>
			<Divider style={{ margin: '12px 0' }} />
			<div className={classes.settingsModalDiv}>
				<Text>Delete all chats</Text>
				<Button
					color='red'
					onClick={async () => {
						deleteAllChat();
					}}>
					Delete all
				</Button>
			</div>
			<div className={classes.footer}>
				<Button
					onClick={async () => {
						setLlmToken(text);
						toggle();
					}}>
					Save
				</Button>
			</div>
		</Modal>
	);
};
