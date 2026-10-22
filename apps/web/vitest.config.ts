import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'web',
    environment: 'node',
    // The first ESLint probe in the contract tests is slow on CI.
    testTimeout: 30_000,
    include: ['src/**/*.test.ts'],
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.test.json',
    },
  },
});
