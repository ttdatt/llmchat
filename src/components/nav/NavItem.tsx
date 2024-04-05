import { memo } from 'react';
import { Menu, UnstyledButton } from '@mantine/core';
import classes from './Nav.module.css';
import { IconDots, IconTrash } from '@tabler/icons-react';
import { Thread } from '@/types/Message';
import { useSetAtom } from 'jotai';
import { currentThreadIdAtom, deleteThreadAtom } from '@/atom/atoms';

type NavItemProps = {
  thread: Thread;
  currentThreadId?: string;
};

export const NavItem = memo(({ thread: t, currentThreadId }: NavItemProps) => {
  const setCurrentThread = useSetAtom(currentThreadIdAtom);
  const deleteThread = useSetAtom(deleteThreadAtom);

  return (
    <div
      className={classes.link}
      data-active={currentThreadId === t.id || undefined}
      onClick={async (event) => {
        event.preventDefault();
        setCurrentThread(t.id);
      }}
      key={t.id}>
      {t.title}
      <Menu shadow='md' width={'auto'}>
        <Menu.Target>
          <UnstyledButton
            onClick={(e) => e.stopPropagation()}
            className='flex h-full w-8 justify-end items-center'>
            <IconDots className='size-3.5' />
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => deleteThread(t.id)}
            leftSection={<IconTrash className='size-3.5' />}>
            Delete chat
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
});
