import { Button, Stack } from '@mantine/core';
import classes from './Nav.module.css';
import { useAppStore } from '../../store';
import { NavItem } from './NavItem';
// import { clearAll } from '../services/storage/storage';

export function Navbar() {
  const threads = useAppStore(state => state.threads);
  const currentThreadId = useAppStore(state => state.currentThreadId);
  const createThread = useAppStore(state => state.createNewThread);

  const links = Object.values(threads).map(t => (
    <NavItem thread={t} currentThreadId={currentThreadId} />
  ));

  return (
    <div className={classes.navbar}>
      <Stack>
        <Button onClick={() => createThread()}>New chat</Button>
        {/* <Button onClick={() => clearAll()}>Clear all</Button> */}
      </Stack>
      <div className={classes.main}>{links}</div>
    </div>
  );
}
