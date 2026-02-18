import { defineConfig } from 'orval';

export default defineConfig({
  server: {
    input: '../server/generated/server-openapi.json',
    output: {
      target: './src/api/generated/server.client.ts',
      client: 'fetch',
      baseUrl: '',
    },
  },
});
