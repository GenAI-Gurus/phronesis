import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./setupTests.ts'],
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
    ],
    exclude: [
      '**/node_modules/**',
      'tests/e2e/**',
      '**/tests/e2e/**',
    ],
  },
});
