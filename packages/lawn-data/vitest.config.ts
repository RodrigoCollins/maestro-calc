import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'lawn-data',
    environment: 'node',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
});
