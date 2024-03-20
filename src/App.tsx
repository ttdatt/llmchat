import { MantineProvider, Stack } from '@mantine/core';
import { ChatMessage } from './components/chat/ChatMessage';
import { DoubleNavbar } from './components/nav/Nav';
import { ChatInput } from './components/ChatInput';

function App() {
  return (
    <MantineProvider>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flex: 1,
        }}>
        <DoubleNavbar />
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          <Stack flex={1}>
            <ChatMessage message='where to configure git hook pre-push' />
            <ChatMessage
              message={`Here's how you configure a Git pre-push hook:

Understanding Git Hooks

    Location: Git hooks are scripts living inside the .git/hooks directory within your local Git repository.
    Not Versioned: Hooks are local to your repository and not shared with others when you push or clone.
    Triggers: Hooks are triggered by specific Git events (pre-commit, pre-push, post-receive, etc.).

Creating and Configuring a Pre-Push Hook

    Navigate to the hooks directory:`}
            />
          </Stack>
          <ChatInput />
        </div>
      </div>
    </MantineProvider>
  );
}

export default App;
