import { Text } from '@mantine/core';
import { Message } from '../../types/Message';
import { GptIcon } from '../../assets/gpt';
import { IconUserFilled } from '@tabler/icons-react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatMessage.css';
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
			<div
				style={{
					minWidth: '2rem',
					width: '2rem',
					height: '2rem',
					backgroundColor: 'pink',
					padding: 4,
					borderRadius: '50%',
				}}>
				<IconUserFilled style={{ fill: 'white' }} />
			</div>
		);
	}, [owner]);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				gap: 8,
				padding: 10,
			}}>
			{Icon}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					overflowX: 'scroll',
				}}>
				<Text size='lg' fw={600} lh='2rem'>
					{owner === 'assistant' ? 'Assistant' : 'You'}
				</Text>
				<Markdown
					className='chatdiv'
					children={text}
					components={{
						code: (props) => {
							const { children, className, node, ref, ...rest } = props;

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
									{...rest}
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
					}}
				/>
			</div>
		</div>
	);
});
