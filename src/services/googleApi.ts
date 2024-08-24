import { compress, decompress } from './compression';
import { generateUniqueId } from './crypto';
import { db } from './indexedDb';
import { isWeb } from './platform';

const llmchatDir = 'llmchat';
const clientId = '168012287860-sm87jkbh8uvmia8tf94uec15sjcgg8tt.apps.googleusercontent.com';
const scope = [
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/drive.file',
].join(' ');

export async function getLoggedInUser() {
	const user = (await db.user.toArray())[0];
	if (!user) return false;
	const accessToken = user.accessToken;
	const expiryTime = user.expiryTime;

	if (!accessToken || !expiryTime) return false;

	const currentTime = new Date().getTime();
	if (currentTime < expiryTime) {
		return user;
	}
}

export async function logout() {
	await db.user.clear();
}

export function loginRedirect() {
	const redirectUri = `${location.origin}?loggedIn=true`;
	const responseType = 'token';

	const urlSearchParams = new URLSearchParams();
	urlSearchParams.append('client_id', clientId);
	urlSearchParams.append('redirect_uri', redirectUri);
	urlSearchParams.append('scope', scope);
	urlSearchParams.append('response_type', responseType);

	const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${urlSearchParams.toString()}`;

	if (isWeb) {
		window.location.href = authUrl;
	} else {
		throw new Error('Unsupported!');
	}
}

export async function handleParamAccessToken(params: URLSearchParams, accessToken: string) {
	const tokenType = params.get('token_type') || '';
	const expiresIn = params.get('expires_in');
	const expiryTime = new Date().getTime() + Number.parseInt(expiresIn || '0') * 1000;
	const scope = params.get('scope') || '';
	const authUser = params.get('authuser') || '';

	const { email, picture } = await fetchProfile(accessToken);

	await db.user.add({
		id: generateUniqueId(),
		email: email,
		picture: picture,
		tokenType: tokenType,
		accessToken: accessToken,
		expiryTime: expiryTime,
		ssoMode: 'google',
		scope: scope,
		authUser: authUser,
	});

	window.location.href = '/';
}

export async function getAccessToken() {
	const user = (await db.user.toArray())?.[0];
	return user?.accessToken;
}

export const fetchProfile = async (accessToken?: string | undefined | null) => {
	const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
		headers: {
			Authorization: `Bearer ${accessToken || (await getAccessToken())}`,
		},
	});
	const data = await response.json();
	return { email: data.email, picture: data.picture };
};

export const getThreadByFileId = async (fileId: string) => {
	const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
		headers: new Headers({
			Authorization: `Bearer ${await getAccessToken()}`,
		}),
	});
	const compressedData = await response.arrayBuffer();
	console.log('getThreadByFileId ', fileId);
	const decompressed = await decompress(compressedData);
	return JSON.parse(decompressed);
};

export const getAllThreads = async () => {
	try {
		const folderId = await findFolder(llmchatDir);
		if (!folderId) return [];

		const params = new URLSearchParams();
		params.append('q', `'${folderId}' in parents and name contains 'thread-' and trashed=false`);
		const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
			headers: new Headers({
				Authorization: `Bearer ${await getAccessToken()}`,
			}),
		});

		const searchData = await searchResponse.json();
		console.log('getAllThreads() searchData:', searchData);

		return await Promise.all(
			searchData?.files?.map(async ({ id }: { id: string }) => {
				return await getThreadByFileId(id);
			}) || [],
		);
	} catch (e) {
		console.error(e);
	}
	return [];
};

export const saveThread = async (threadId: string) => {
	const thread = await db.threads.get(threadId);

	const folderId: string = (await findFolder(llmchatDir)) || (await createFolder(llmchatDir)) || '';

	const oldFileIds = await searchByThreadId(threadId, folderId);

	const compressedData = await compress(JSON.stringify(thread));
	const newFile = new Blob([compressedData], { type: 'text/plain' });
	const metadata = {
		name: `thread-${threadId}`,
		mimeType: 'application/gzip',
		parents: [folderId],
	};

	const form = new FormData();
	form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	form.append('file', newFile);

	try {
		const response = await fetch(
			'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
			{
				method: 'POST',
				headers: new Headers({
					Authorization: `Bearer ${await getAccessToken()}`,
				}),
				body: form,
			},
		);
		const result = await response.json();
		console.log('File saved to Drive:', result);

		console.log('start delete:', oldFileIds);
		for (const fileId of oldFileIds) {
			await deleteByFileId(fileId);
		}
	} catch (error) {
		console.error('Error saving file to Drive:', error);
	}
};

async function findFolder(name: string): Promise<string | null> {
	const params = new URLSearchParams({
		q: `name='${name}' and mimeType='application/vnd.google-apps.folder'`,
		fields: 'files(id,name)',
	});

	const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${await getAccessToken()}`,
			'Content-Type': 'application/json',
		},
	});

	const data = await response.json();
	console.log('findFolder', data);
	if (data.files && data.files.length > 0) {
		return data.files[0].id;
	}

	return null;
}

async function createFolder(name: string): Promise<string> {
	const metadata = {
		name: name,
		mimeType: 'application/vnd.google-apps.folder',
	};

	const response = await fetch('https://www.googleapis.com/drive/v3/files', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${await getAccessToken()}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(metadata),
	});

	const data = await response.json();
	console.log('createFolder', data);
	return data.id;
}

export const searchByThreadId = async (threadId: string, parentId: string) => {
	const params = new URLSearchParams();
	params.append('q', `'${parentId}' in parents and name contains 'thread-${threadId}'`);
	const searchResponse = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
		headers: new Headers({
			Authorization: `Bearer ${await getAccessToken()}`,
		}),
	});

	const searchData = await searchResponse.json();
	console.log('searchData:', searchData);
	return (searchData?.files || []).map((file: { id: string }) => file.id);
};

export const deleteByFileId = async (fileId: string) => {
	await fetch(`https://www.googleapis.com/drive/v2/files/${fileId}`, {
		method: 'DELETE',
		headers: new Headers({
			Authorization: `Bearer ${await getAccessToken()}`,
		}),
	});
};

export const deleteThread = async (threadId: string) => {
	const folderId = await findFolder(llmchatDir);
	if (!folderId) return;

	const fileIds = await searchByThreadId(threadId, folderId);
	for (const fileId of fileIds) {
		await deleteByFileId(fileId);
	}
	console.log(`Deleted ${fileIds.length} file!`);
};
