import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/fetchers/__tests__/smoke.integration.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    env: {
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_SERVICE_KEY: 'test-service-key',
      PIPELINE_ENV: 'dev',
      LOG_LEVEL: 'error',
    },
  },
});
