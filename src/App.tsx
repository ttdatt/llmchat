import { MantineProvider } from '@mantine/core';
import { Navbar } from './components/nav/Nav';
import { MessageArea } from './components/MessageArea';
import { useAppStore } from './store';
import { useEffect } from 'react';
import { Settings } from './components/settings/Settings';

const MainPage = () => {
	return (
		<div
			style={{
				height: '100vh',
				width: '100vw',
				display: 'flex',
				flexDirection: 'row',
			}}>
			<Navbar />
			<MessageArea />
			<Settings />
		</div>
	);
};

function App() {
	const init = useAppStore((state) => state.init);

	useEffect(() => {
		init();
	}, [init]);

	return (
		<MantineProvider>
			<MainPage />
		</MantineProvider>
	);
}

export default App;
