const pass = 'default-password';

const arrayBufferToBinaryString = (buffer: ArrayBuffer) => {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return binary;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
	const binaryString = arrayBufferToBinaryString(buffer);
	return window.btoa(binaryString);
};

const base64ToArrayBuffer = (base64: string) => {
	const binaryString = window.atob(base64);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);

	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	return bytes;
};

const generateKey = async (password: string, salt: ArrayBuffer) => {
	const baseKey = await window.crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey'],
	);
	const key = await window.crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			hash: 'SHA-256',
			salt,
			iterations: 600000,
		},
		baseKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt'],
	);
	return key;
};

export const encrypt = async (plaintext: string, password: string = pass) => {
	const salt = window.crypto.getRandomValues(new Uint8Array(32));
	const iv = window.crypto.getRandomValues(new Uint8Array(12));

	const key = await generateKey(password, salt);
	const encodedData = await window.crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		new TextEncoder().encode(plaintext),
	);
	const encodedBase64Data = arrayBufferToBase64(encodedData);
	const base64Salt = arrayBufferToBase64(salt);
	const base64Iv = arrayBufferToBase64(iv);

	const hasPass = password !== pass;
	console.log(hasPass);

	return `${hasPass.toString()};${encodedBase64Data};${base64Salt};${base64Iv}`;
};

export async function decrypt(ciphertext: string, password: string = pass) {
	const [_hasPass, encodedBase64Data, base64Salt, base64Iv] = ciphertext.split(';');

	const salt = base64ToArrayBuffer(base64Salt);
	const iv = base64ToArrayBuffer(base64Iv);
	const encodedData = base64ToArrayBuffer(encodedBase64Data);
	const key = await generateKey(password, salt);
	const decryptedData = await window.crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		key,
		encodedData,
	);
	const haha = arrayBufferToBinaryString(decryptedData);
	return haha;
}
