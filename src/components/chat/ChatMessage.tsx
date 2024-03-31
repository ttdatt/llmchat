import { Text } from '@mantine/core';
import { Message } from '../../types/Message';
import { GptIcon } from '../../assets/gpt';
import { IconUserFilled } from '@tabler/icons-react';
import Markdown, { ExtraProps } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import classes from './ChatMessage.module.css';
import { memo, useMemo } from 'react';

type ChatMessageProps = {
	text: Message['text'];
	owner: Message['owner'];
};
export const ChatMessage = memo(({ text, owner }: ChatMessageProps) => {
	const Icon = useMemo(() => {
		if (owner === 'assistant') {
			return <GptIcon iconStyle={{ fill: 'white' }} />;
		}
		return (
			<div className={classes.iconContainer}>
				<IconUserFilled style={{ fill: 'white' }} />
			</div>
		);
	}, [owner]);

	const components = useMemo(
		() => ({
			code: (
				props: React.ClassAttributes<HTMLElement> &
					React.HTMLAttributes<HTMLElement> &
					ExtraProps,
			) => {
				const { children, className, node } = props;

				const match = /language-(\w+)/.exec(className || '');

				if (node?.position?.start.line === node?.position?.end.line) {
					return (
						<span
							style={{
								fontWeight: 'bold',
								color: 'black',
							}}>
							`{children}`
						</span>
					);
				}

				return (
					<SyntaxHighlighter
						children={String(children)}
						language={match?.[1] ?? 'plaintext'}
						customStyle={{
							backgroundColor: 'black',
							borderRadius: 4,
						}}
						codeTagProps={{
							style: {
								background: 'black',
								fontSize: '14px',
							},
						}}
						style={oneDark}
					/>
				);
			},
		}),
		[],
	);

	return (
		<div className={classes.chatContainer}>
			{Icon}
			<div className={classes.chatTextDiv}>
				<Text size='lg' fw={600} lh='2rem'>
					{owner === 'assistant' ? 'Assistant' : 'You'}
				</Text>
				<Markdown
					className={classes.chatdiv}
					children={text}
					components={components}
				/>
			</div>
		</div>
	);
});
