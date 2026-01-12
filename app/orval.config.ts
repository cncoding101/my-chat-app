import { defineConfig } from 'orval';

export default defineConfig({
	worker: {
		input: './generated/worker-openapi.json',
		output: {
			target: './src/lib/api/services/worker.ts',
			client: 'fetch',
			baseUrl: 'http://localhost:8000' // Default worker URL
		}
	}
});
