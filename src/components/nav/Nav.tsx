import { Button, Menu, Stack, UnstyledButton } from '@mantine/core';
import classes from './Nav.module.css';
import { useAppStore } from '../../store';
import { IconDots, IconTrash } from '@tabler/icons-react';
// import { clearAll } from '../services/storage/storage';

export function Navbar() {
  const threads = useAppStore(state => state.threads);
  const createThread = useAppStore(state => state.createNewThread);
  const setCurrentThread = useAppStore(state => state.setCurrentThread);
  const currentThreadId = useAppStore(state => state.currentThreadId);
  const deleteThread = useAppStore(state => state.deleteThread);

  const links = Object.values(threads).map(t => (
    <div
      className={classes.link}
      data-active={currentThreadId === t.id || undefined}
      onClick={async event => {
        event.preventDefault();
        setCurrentThread(t);
      }}
      key={t.id}>
      {t.title}
      <Menu shadow='md' width={'auto'}>
        <Menu.Target>
          <UnstyledButton
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex',
              height: '100%',
              width: 30,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <IconDots width={14} height={14} />
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => deleteThread(t.id)}
            leftSection={<IconTrash style={{ width: 14, height: 14 }} />}>
            Delete chat
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
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
