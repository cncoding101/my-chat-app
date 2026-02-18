import { defineConfig } from 'orval';

export default defineConfig({
  worker: {
    input: './generated/worker-openapi.json',
    output: {
      target: './src/worker/clients/worker.client.ts',
      client: 'fetch',
      baseUrl: 'http://localhost:8000',
    },
  },
});
