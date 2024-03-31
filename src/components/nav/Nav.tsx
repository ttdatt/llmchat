import { Button, UnstyledButton } from '@mantine/core';
import classes from './Nav.module.css';
import { useAppStore } from '../../store';
import { NavItem } from './NavItem';
import { IconSettings } from '@tabler/icons-react';
// import { clearAll } from '../services/storage/storage';

export function Navbar() {
	const threads = useAppStore((state) => state.threads);
	const currentThreadId = useAppStore((state) => state.currentThreadId);
	const createThread = useAppStore((state) => state.createNewThread);
	const toggleModal = useAppStore((state) => state.toggleModal);

	const links = Object.values(threads).map((t) => (
		<NavItem key={t.id} thread={t} currentThreadId={currentThreadId} />
	));

	return (
		<div className={classes.navbar}>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
				}}>
				<Button onClick={() => createThread()}>New chat</Button>
				{/* <Button onClick={() => clearAll()}>Clear all</Button> */}
			</div>
			<div className={classes.main}>{links}</div>
			<div>
				<UnstyledButton onClick={toggleModal}>
					<IconSettings style={{ fill: 'white' }} />
				</UnstyledButton>
			</div>
		</div>
	);
}
