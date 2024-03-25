import { memo } from 'react';
import { Menu, UnstyledButton } from '@mantine/core';
import classes from './Nav.module.css';
import { IconDots, IconTrash } from '@tabler/icons-react';
import { Thread } from '../../types/Message';
import { useAppStore } from '../../store';

type NavItemProps = {
  thread: Thread;
  currentThreadId?: string;
};

export const NavItem = memo(({ thread: t, currentThreadId }: NavItemProps) => {
  const setCurrentThread = useAppStore(state => state.setCurrentThread);
  const deleteThread = useAppStore(state => state.deleteThread);

  return (
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
  );
});
