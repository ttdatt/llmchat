import { Button, Menu, ScrollArea, Stack, UnstyledButton } from '@mantine/core';
import classes from './Nav.module.css';
import { useAppStore } from '../../store';
import { IconDots, IconTrash } from '@tabler/icons-react';

export function Navbar() {
  const threads = useAppStore(state => state.threads);
  const createThread = useAppStore(state => state.createNewThread);
  const setCurrentThread = useAppStore(state => state.setCurrentThread);
  const currentThread = useAppStore(state => state.currentThread);
  const deleteThread = useAppStore(state => state.deleteThread);

  const links = threads.map(t => (
    <div
      className={classes.link}
      data-active={currentThread?.id === t.id || undefined}
      onClick={async event => {
        event.preventDefault();
        setCurrentThread(t);
      }}
      key={t.id}>
      {t.title}
      <Menu shadow='md' width={'auto'}>
        <Menu.Target>
          <UnstyledButton
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
    <ScrollArea className={classes.navbar}>
      <Stack>
        <Button onClick={() => createThread()}>New chat</Button>
      </Stack>
      <div className={classes.main}>{links}</div>
    </ScrollArea>
  );
}
