/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { handleGeminiRequest, generateGeminiImage } from './gemini';
import { handleClaudeRequest } from './claude';
import { corsHeaders } from './utlis';

export default {
	async fetch(request: Request, _env: Env, ctx: ExecutionContext) {
		if (request.method === 'OPTIONS') {
			// Handle CORS preflight requests
			return new Response(null, {
				status: 204,
				headers: { ...corsHeaders },
			});
		}

		const url = new URL(request.url);
		const path = url.pathname;

		if (path === '/anthropic') {
			return handleClaudeRequest(request, ctx);
		}

		if (path === '/gemini') {
			return handleGeminiRequest(request, ctx);
		}

		if (path === '/gemini-image') {
			return generateGeminiImage(request, ctx);
		}

		return new Response('Not found', { status: 404 });
	},
};
