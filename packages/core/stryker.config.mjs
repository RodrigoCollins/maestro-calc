import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = dirname(fileURLToPath(import.meta.url));

const isFile = (path) => statSync(join(packageDir, path)).isFile();

/**
 * Every input that can change a mutation verdict, relative to this package and sorted. The
 * command runner reports no per-test files, so Stryker cannot see that a test was changed or
 * deleted and would keep stale survivors or kills from an older report. The incremental report
 * is therefore named after one hash of all of these inputs, and any change starts a fresh run.
 *
 * The CI cache key (`hashFiles` in `ci.yml`) covers the same files, which a contract test pins:
 * `.nvmrc` stands for the Node version, so the key and the report name always change together.
 */
export const incrementalIdentityFiles = [
  ...readdirSync(join(packageDir, 'src'), { recursive: true })
    .map((path) => `src/${path.replaceAll('\\', '/')}`)
    .filter(isFile),
  'stryker.config.mjs',
  'vitest.config.ts',
  ...readdirSync(packageDir).filter((name) => name.endsWith('.json')),
  '../../.nvmrc',
  '../../package-lock.json',
  '../../tsconfig.base.json',
  '../../vitest.config.ts',
].sort();

const identity = createHash('sha256');
for (const path of incrementalIdentityFiles) {
  identity
    .update(`${path}\0`)
    .update(readFileSync(join(packageDir, path)))
    .update('\0');
}

const incrementalName = `stryker-incremental-${identity.digest('hex').slice(0, 16)}.json`;

/** Deletes every incremental report except the current one, so old reports do not pile up. */
export const pruneStaleReports = (reportsDirectory, keepFile) => {
  if (!existsSync(reportsDirectory)) return;
  for (const name of readdirSync(reportsDirectory)) {
    if (/^stryker-incremental-.*\.json$/.test(name) && name !== keepFile) {
      rmSync(join(reportsDirectory, name));
    }
  }
};

pruneStaleReports(join(packageDir, 'reports'), incrementalName);

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
  incrementalFile: `reports/${incrementalName}`,
  reporters: ['clear-text', 'progress-append-only', 'html', 'json'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  // A timeout counts as a kill, so the budget is generous and the parallelism fixed.
  timeoutMS: 30000,
  timeoutFactor: 4,
  concurrency: 3,
  thresholds: { high: 95, low: 90, break: 90 },
};
