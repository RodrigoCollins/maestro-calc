import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = dirname(fileURLToPath(import.meta.url));

const isFile = (path) => statSync(join(packageDir, path)).isFile();

/**
 * Every input that can change a mutation verdict, relative to this package and sorted. The
 * command runner reports no per-test files, so Stryker cannot see that a test was changed or
 * deleted and would keep stale survivors or kills from an older report. The incremental report
 * is therefore named after one hash of all of these inputs, and any change starts a fresh run.
 */
export const incrementalIdentityFiles = [
  ...readdirSync(join(packageDir, 'src'), { recursive: true })
    .map((path) => `src/${path.replaceAll('\\', '/')}`)
    .filter(isFile),
  'stryker.config.mjs',
  'vitest.config.ts',
  ...readdirSync(packageDir).filter((name) => /^tsconfig.*\.json$/.test(name)),
  '../../package-lock.json',
].sort();

const identity = createHash('sha256');
for (const path of incrementalIdentityFiles) {
  identity
    .update(`${path}\0`)
    .update(readFileSync(join(packageDir, path)))
    .update('\0');
}

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  testRunner: 'command',
  commandRunner: {
    // STRYKER=1 flips the `__STRYKER__` define, so a direct `stryker run` behaves like the npm
    // script. Type tests cannot kill behavioral mutants (they run in `verify`), and skipping them
    // keeps every mutant run cheap and out of the sandbox `extends ../../tsconfig.base.json` path.
    command:
      'STRYKER=1 npx --no-install vitest run --no-file-parallelism --typecheck.enabled=false',
  },
  coverageAnalysis: 'off',
  mutate: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.test-d.ts',
    '!src/__testing__/**',
    '!src/**/index.ts',
  ],
  // Stale reports must not be copied into the sandboxes.
  ignorePatterns: ['reports'],
  incremental: true,
  incrementalFile: `reports/stryker-incremental-${identity.digest('hex').slice(0, 16)}.json`,
  reporters: ['clear-text', 'progress-append-only', 'html', 'json'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  // A timeout counts as a kill, so the budget is generous and the parallelism fixed.
  timeoutMS: 30000,
  timeoutFactor: 4,
  concurrency: 3,
  thresholds: { high: 95, low: 90, break: 90 },
};
