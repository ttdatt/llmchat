import { Button, Drawer, UnstyledButton } from '@mantine/core';
import classes from './Nav.module.css';
import { NavItem } from './NavItem';
import { IconSettings } from '@tabler/icons-react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  currentThreadIdAtom,
  drawerAtom,
  modalVisibleAtom,
  threadsAtom,
} from '@/atom/atoms';
import orderBy from 'lodash/orderBy';
import { createNewThreadAtom } from '@/atom/derivedAtoms';
import GoogleSSO from '../GoogleSSO';

export function Navbar() {
  const threads = useAtomValue(threadsAtom);
  const currentThreadId = useAtomValue(currentThreadIdAtom);
  const createThread = useSetAtom(createNewThreadAtom);
  const openSettings = useSetAtom(modalVisibleAtom);
  const setDrawerOpen = useSetAtom(drawerAtom);

  const links = orderBy(Object.values(threads), 'timestamp', 'desc').map(
    (t) => <NavItem key={t.id} thread={t} currentThreadId={currentThreadId} />,
  );

  return (
    <div className={classes.navbar}>
      <div className='flex flex-col'>
        <Button onClick={() => createThread()}>New chat</Button>
      </div>
      <div className='flex-1 mt-4'>{links}</div>
      <div className=' sticky bottom-0 flex py-2 items-center bg-white'>
        <UnstyledButton
          onClick={() => {
            setDrawerOpen(false);
            openSettings(true);
          }}>
          <IconSettings className='fill-white' />
        </UnstyledButton>
        <GoogleSSO />
      </div>
    </div>
  );
}

export const MobileNavBar = () => {
  const [isDrawerOpened, setDrawerOpen] = useAtom(drawerAtom);
  const threads = useAtomValue(threadsAtom);
  const currentThreadId = useAtomValue(currentThreadIdAtom);
  const createThread = useSetAtom(createNewThreadAtom);
  const openSettings = useSetAtom(modalVisibleAtom);

  const links = orderBy(Object.values(threads), 'timestamp', 'desc').map(
    (t) => <NavItem key={t.id} thread={t} currentThreadId={currentThreadId} />,
  );

  return (
    <Drawer
      opened={isDrawerOpened}
      onClose={() => setDrawerOpen(false)}
      classNames={{
        content: 'flex flex-col',
        body: 'flex flex-1 flex-col pb-0',
      }}>
      <div className={classes.mobileNavBar}>
        <div className='flex flex-col'>
          <Button h={44} onClick={() => createThread()}>
            New chat
          </Button>
        </div>
        <div className='flex-1 grow-1 mt-4'>{links}</div>
      </div>
      <div className='sticky bottom-0 px-4 py-2 flex items-center bg-white'>
        <UnstyledButton
          onClick={() => {
            setDrawerOpen(false);
            openSettings(true);
          }}>
          <IconSettings className='fill-white' />
        </UnstyledButton>
        <GoogleSSO />
      </div>
    </Drawer>
  );
};
