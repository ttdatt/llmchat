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
import { HamburgerMenuIcon } from '../../assets/HamburgerMenuIcon';
import { XIcon } from '../../assets/XIcon';
import cls from 'classnames';
import { useState } from 'react';

export function Navbar({ isMobile }: { isMobile: boolean }) {
  const threads = useAtomValue(threadsAtom);
  const currentThreadId = useAtomValue(currentThreadIdAtom);
  const createThread = useSetAtom(createNewThreadAtom);
  const openSettings = useSetAtom(modalVisibleAtom);

  const links = orderBy(Object.values(threads), 'timestamp', 'desc').map(
    (t) => <NavItem key={t.id} thread={t} currentThreadId={currentThreadId} />,
  );

  const [shouldShowNavbar, setShouldShowNavbar] = useState(!isMobile);

  const onClickHamburger = () => {
    setShouldShowNavbar(true);
  };

  const onClose = () => setShouldShowNavbar(false);

  return (
    <>
      {isMobile ? (
        <div className={classes.mobileToolbar}>
          <span onClick={onClickHamburger}>
            <HamburgerMenuIcon />
          </span>
        </div>
      ) : null}
      {shouldShowNavbar ? (
        <div
          className={cls(classes.navbar, { [classes.navbarMobile]: isMobile })}>
          {isMobile ? (
            <>
              <div style={{ height: 40 }} />
              <div className={classes.close} onClick={onClose}>
                <XIcon />
              </div>
            </>
          ) : null}
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
      ) : null}
    </>
  );
}
