import { MantineProvider } from '@mantine/core';
import { Navbar } from './components/nav/Nav';
import { MessageArea } from './components/MessageArea';
import { useEffect } from 'react';
import { Settings } from './components/Settings';
import { initAtom } from './atom/atoms';
import { Provider, useSetAtom } from 'jotai';
import { atomStore } from './atom/store';
import { Notifications } from '@mantine/notifications';

const MainPage = () => {
  const init = useSetAtom(initAtom);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className='h-screen w-screen flex flex-row'>
      <Navbar />
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
