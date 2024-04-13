import { MantineProvider } from '@mantine/core';
import { MobileNavBar, Navbar } from './components/nav/Nav';
import { MessageArea } from './components/MessageArea';
import { useEffect } from 'react';
import { Settings } from './components/Settings';
import { initAtom } from './atom/derivedAtoms';
import { Provider, useSetAtom } from 'jotai';
import { atomStore } from './atom/store';
import { Notifications } from '@mantine/notifications';
import { useMobile } from './hooks/useMobile';

const MainPage = () => {
  const init = useSetAtom(initAtom);
  const isMobile = useMobile();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className='h-dvh w-screen flex flex-row'>
      {isMobile ? <MobileNavBar /> : <Navbar />}
      <MessageArea />
      <Settings />
    </div>
  );
};

function App() {
  return (
    <MantineProvider>
      <Provider store={atomStore}>
        <Notifications />
        <MainPage />
      </Provider>
    </MantineProvider>
  );
}

export default App;
