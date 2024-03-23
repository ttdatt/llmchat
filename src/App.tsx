import { MantineProvider } from '@mantine/core';
import { Navbar } from './components/nav/Nav';
import { ChatInput } from './components/ChatInput';
import { MessageArea } from './components/MessageArea';
import { useAppStore } from './store';
import { useEffect } from 'react';

function App() {
  const init = useAppStore(state => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <MantineProvider>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flex: 1,
        }}>
        <Navbar />
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          <MessageArea />
          <ChatInput />
        </div>
      </div>
    </MantineProvider>
  );
}

export default App;
