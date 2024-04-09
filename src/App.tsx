import { MantineProvider } from '@mantine/core';
import { Navbar } from './components/nav/Nav';
import { MessageArea } from './components/MessageArea';
import { useEffect } from 'react';
import { Settings } from './components/Settings';
import { initAtom } from './atom/atoms';
import { Provider, useSetAtom } from 'jotai';
import { atomStore } from './atom/store';
import { Notifications } from '@mantine/notifications';
import { useMobile } from './hooks/useMobile';

const MainPage = () => {
  const init = useSetAtom(initAtom);

  useEffect(() => {
    init();
  }, [init]);

  const isMobile = useMobile();

  return (
    <div
      className={`h-screen w-screen flex ${
        isMobile ? 'flex-col' : 'flex-row'
      }`}>
      {isMobile !== undefined ? (
        <Navbar key={String(isMobile)} isMobile={isMobile} />
      ) : null}
      {isMobile !== undefined ? <MessageArea isMobile={isMobile} /> : null}
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
