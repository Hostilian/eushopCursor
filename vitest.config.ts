import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'packages/auth/src/**/*.test.ts',
      'packages/geo/src/**/*.test.ts',
      'packages/api-router/src/**/*.test.ts',
      'packages/validators/src/**/*.test.ts',
      'packages/catalog-data/src/**/*.test.ts',
    ],
  },
});
