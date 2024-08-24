import { currentUserAtom } from '@/atom/atoms';
import { loginRedirect } from '@/services/googleApi';
import { db } from '@/services/indexedDb';
import { isWeb } from '@/services/platform';
import { Avatar, Menu, UnstyledButton, rem } from '@mantine/core';
import { IconLogin, IconLogout, IconSettings } from '@tabler/icons-react';
import { useAtom } from 'jotai';

type Props = {
	onClickSettings: () => void;
};
export const SettingsButton = ({ onClickSettings }: Props) => {
	const [currentUser, setCurrentUser] = useAtom(currentUserAtom);

	const onClickSignIn = () => {
		loginRedirect();
	};
	const onClickSignOut = async () => {
		await db.user.clear();
		setCurrentUser(undefined);
	};
	return isWeb ? (
		<Menu shadow='md' width={200}>
			<Menu.Target>
				<UnstyledButton>
					{currentUser ? (
						<Avatar src={currentUser.picture} />
					) : (
						<IconSettings className='fill-white' />
					)}
				</UnstyledButton>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Item
					onClick={onClickSettings}
					leftSection={<IconSettings style={{ width: rem(14), height: rem(14) }} />}>
					Settings
				</Menu.Item>
				{!currentUser ? (
					<Menu.Item
						onClick={onClickSignIn}
						leftSection={<IconLogin style={{ width: rem(14), height: rem(14) }} />}>
						Sign in with Google
					</Menu.Item>
				) : (
					<Menu.Item
						onClick={onClickSignOut}
						leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}>
						Sign Out
					</Menu.Item>
				)}
			</Menu.Dropdown>
		</Menu>
	) : (
		<UnstyledButton onClick={onClickSettings}>
			<IconSettings className='fill-white' />
		</UnstyledButton>
	);
};
