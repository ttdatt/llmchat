import { currentUserAtom } from '@/atom/atoms';
import { loginRedirect } from '@/services/googleApi';
import { db } from '@/services/indexedDb';
import { Avatar } from '@mantine/core';
import { useAtom } from 'jotai';
import React from 'react';

const GoogleSSO: React.FC = () => {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);

  const handleLogin = () => {
    loginRedirect();
  };

  const onClickSignOut = async () => {
    await db.user.clear();
    setCurrentUser(undefined);
  };

  return currentUser?.picture ? (
    <>
      <Avatar src={currentUser.picture} />
      <button type='button' onClick={onClickSignOut}>
        Sign out
      </button>
    </>
  ) : (
    <button type='button' onClick={handleLogin}>
      Sign in with Google
    </button>
  );
};

export default GoogleSSO;
