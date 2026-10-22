import { defineProject } from 'vitest/config';

export default defineProject({
  // The config runs in Node; core sources never touch `process`.
  define: { __STRYKER__: Boolean(process.env['STRYKER']) },
  test: {
    name: 'core',
    environment: 'node',
    include: ['src/**/*.test.ts'],
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.test.json',
    },
  },
});
