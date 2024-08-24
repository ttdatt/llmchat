export async function compress(input: string): Promise<ArrayBuffer> {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);

	const compressedStream = new CompressionStream('gzip');
	const writer = compressedStream.writable.getWriter();
	writer.write(data);
	writer.close();

	return await new Response(compressedStream.readable).arrayBuffer();
}

export async function decompress(compressedData: ArrayBuffer): Promise<string> {
	const decompressedStream = new DecompressionStream('gzip');
	const writer = decompressedStream.writable.getWriter();
	writer.write(new Uint8Array(compressedData));
	writer.close();

	const decompressedData = await new Response(
		decompressedStream.readable,
	).arrayBuffer();
	const decoder = new TextDecoder();
	return decoder.decode(decompressedData);
}
