import { MantineProvider } from '@mantine/core';
import { Navbar } from './components/nav/Nav';
import { MessageArea } from './components/MessageArea';
import { useAppStore } from './store';
import { useEffect } from 'react';
import { Settings } from './components/settings/Settings';

const MainPage = () => {
	return (
		<div className='h-screen w-screen flex flex-row'>
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
