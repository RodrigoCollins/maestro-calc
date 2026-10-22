import { defineConfig } from 'vitest/config';
import { testGlobs } from './tooling/test-globs.js';

const full = { lines: 100, branches: 100, functions: 100, statements: 100 };
const ninety = { lines: 90, branches: 90, functions: 90, statements: 90 };

export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/web'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**'],
      exclude: [...testGlobs, '**/*.d.ts'],
      thresholds: {
        ...ninety,
        'packages/core/src/**': full,
        'packages/data/src/**': ninety,
        'packages/i18n/src/**': ninety,
      },
    },
  },
});
