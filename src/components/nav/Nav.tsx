import { Button, UnstyledButton } from '@mantine/core';
import classes from './Nav.module.css';
import { NavItem } from './NavItem';
import { IconSettings } from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  createNewThreadAtom,
  currentThreadIdAtom,
  modalVisibleAtom,
  threadsAtom,
} from '@/atom/atoms';
import orderBy from 'lodash/orderBy';

export function Navbar() {
  const threads = useAtomValue(threadsAtom);
  const currentThreadId = useAtomValue(currentThreadIdAtom);
  const createThread = useSetAtom(createNewThreadAtom);
  const openSettings = useSetAtom(modalVisibleAtom);

  const links = orderBy(Object.values(threads), 'timestamp', 'desc').map(
    (t) => <NavItem key={t.id} thread={t} currentThreadId={currentThreadId} />,
  );

  return (
    <div className={classes.navbar}>
      <div className='flex flex-col'>
        <Button onClick={() => createThread()}>New chat</Button>
      </div>
      <div className='flex-1 mt-4'>{links}</div>
      <div>
        <UnstyledButton onClick={() => openSettings(true)}>
          <IconSettings className='fill-white' />
        </UnstyledButton>
      </div>
    </div>
  );
}
