import { defineConfig } from 'orval';

export default defineConfig({
	worker: {
		input: './generated/worker-openapi.json',
		output: {
			target: './src/worker/clients/worker.client.ts',
			client: 'fetch',
			baseUrl: 'http://127.0.0.1:8000'
		}
	}
});
