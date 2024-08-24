export function generateUniqueId() {
	const array = new Uint32Array(4);
	window.crypto.getRandomValues(array);
	return Array.from(array, (dec) => dec.toString(16).padStart(8, '0')).join(
		'-',
	);
}
