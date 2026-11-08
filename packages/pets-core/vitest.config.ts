import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'pets-core',
    environment: 'node',
    include: ['src/**/*.test.ts'],
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.test.json',
    },
  },
});
