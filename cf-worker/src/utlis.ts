export const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
	'Access-Control-Max-Age': '86400',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export async function readRequestBody(request) {
	const contentType = request.headers.get('content-type');
	if (!contentType) {
		return null;
	}

	if (contentType.includes('application/json')) {
		return await request.json();
	}

	if (
		contentType.includes('application/text') ||
		contentType.includes('text/plain') ||
		contentType.includes('text/html')
	) {
		return request.text();
	}

	if (contentType.includes('form')) {
		const formData = await request.formData();
		const body = {};
		for (const entry of formData.entries()) {
			body[entry[0]] = entry[1];
		}
		return JSON.stringify(body);
	}
	// Perhaps some other type of data was submitted in the form
	// like an image, or some other binary data.
	return 'a file';
}
