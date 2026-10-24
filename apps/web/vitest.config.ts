/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Astro resolves its project from the working directory, which is the repository root when the
// root vitest config runs the `apps/web` project, so the project root is passed explicitly.
export default getViteConfig(
  {
    test: {
      name: 'web',
      environment: 'node',
      // The first ESLint probe in the contract tests is slow on CI.
      testTimeout: 30_000,
      include: ['src/**/*.test.ts'],
      globalSetup: ['./vitest.global-setup.ts'],
      typecheck: {
        enabled: true,
        include: ['src/**/*.test-d.ts'],
        tsconfig: './tsconfig.test.json',
      },
    },
  },
  { root: import.meta.dirname },
);
