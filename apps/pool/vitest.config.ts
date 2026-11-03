/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// The root vitest config runs this project from the repository root, so the root is explicit.
export default getViteConfig(
  {
    test: {
      name: 'pool',
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
  },
  { root: import.meta.dirname },
);
