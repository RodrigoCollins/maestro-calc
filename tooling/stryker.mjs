import { createHash } from 'node:crypto';
import { existsSync, globSync, lstatSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

/*
 * What every package's Stryker config shares: the identity of an incremental report, the pruning of
 * stale reports and the options of one shard. `packages/core/stryker.config.mjs` and
 * `packages/data/stryker.config.mjs` build their options from these, so a gate changed here changes
 * for both. The file is part of both identity sets (and of the CI cache key), because the command
 * flags below decide the verdict of a mutant.
 */

/**
 * A symlink could make an identity list and the CI `hashFiles` key disagree (`fs.globSync` follows
 * none, `hashFiles` skips them), so the identity set fails closed instead of guessing.
 */
const failOnSymlink = (path) => {
  throw new Error(`symlink in identity set: ${path}`);
};

/**
 * The files below `directory` (relative, with forward slashes), leaving out dotfiles and dot
 * directories. `fs.globSync` skips them too, and the contract test compares this list with the
 * files the CI key hashes. `hashFiles` in CI hashes dotfiles as well, so the CI key stays a
 * superset: a stray editor file only costs a cold run, never a stale hit.
 */
export const sourceFilesIn = (directory) =>
  readdirSync(directory, { recursive: true, withFileTypes: true })
    .map((entry) => ({
      entry,
      path: relative(directory, join(entry.parentPath, entry.name)).replaceAll('\\', '/'),
    }))
    .filter(({ path }) => !path.split('/').some((part) => part.startsWith('.')))
    .filter(({ entry, path }) => (entry.isSymbolicLink() ? failOnSymlink(path) : entry.isFile()))
    .map(({ path }) => path);

/** The `*.json` files directly in `directory` (package manifest and tsconfigs), without dotfiles. */
export const rootJsonFiles = (directory) =>
  readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.name.endsWith('.json') && !entry.name.startsWith('.'))
    .filter((entry) => (entry.isSymbolicLink() ? failOnSymlink(entry.name) : entry.isFile()))
    .map((entry) => entry.name);

/**
 * The files `patterns` match under `packageDir` (relative, with forward slashes), leaving out
 * dotfiles and dot directories like `sourceFilesIn`. A pattern may reach a sibling package
 * (`../core/src/**`). Fail closed: a pattern that matches no file is a typo or a deleted module,
 * and a symlink could make this list and the CI `hashFiles` key disagree.
 */
const filesMatching = (packageDir, patterns) =>
  patterns.flatMap((pattern) => {
    const files = globSync(pattern, { cwd: packageDir })
      .map((path) => path.replaceAll('\\', '/'))
      .filter((path) => !path.split('/').some((part) => part.startsWith('.') && part !== '..'))
      .filter((path) => {
        const stat = lstatSync(join(packageDir, path));
        return stat.isSymbolicLink() ? failOnSymlink(path) : stat.isFile();
      });
    if (files.length === 0) throw new Error(`identity glob matches no file: ${pattern}`);
    return files;
  });

/**
 * What every shard of a package shares: the package config, the vitest config, the package json
 * files and the toolchain of the repository (Node version, lockfile, this file, compiler and test
 * config of the root). Any change to them can change a verdict of any shard.
 */
export const sharedIdentityFiles = (packageDir) =>
  [
    'stryker.config.mjs',
    'vitest.config.ts',
    ...rootJsonFiles(packageDir),
    '../../.nvmrc',
    '../../package-lock.json',
    '../../tooling/stryker.mjs',
    '../../tsconfig.base.json',
    '../../vitest.config.ts',
  ].sort();

/**
 * Every input that can change a verdict of one shard, relative to `packageDir` and sorted: the
 * files its `mutate` globs match (the negated ones are ignored), its `tests` (a directory stands
 * for everything below it), its `deps` (the other sources its code and tests import) and the
 * `shared` files. A report is named after one hash of exactly these, so a change elsewhere in
 * the package does not start a cold run. A contract test checks the `deps` against the import
 * graph, and the CI cache key hashes the same files.
 */
export const identityFilesOf = ({ packageDir, shared, mutate, tests = [], deps }) => {
  const testGlobs = tests.map((path) => (path.endsWith('.ts') ? path : `${path}/**`));
  const patterns = [...mutate.filter((glob) => !glob.startsWith('!')), ...testGlobs, ...deps];
  for (const path of shared) {
    if (!existsSync(join(packageDir, path)))
      throw new Error(`shared identity file missing: ${path}`);
  }
  return [...new Set([...filesMatching(packageDir, patterns), ...shared])].sort();
};

/** The first 16 hex digits of one SHA-256 over the paths and contents of `files` (relative to `packageDir`). */
export const identityHashOf = (packageDir, files) => {
  const identity = createHash('sha256');
  for (const path of files) {
    identity
      .update(`${path}\0`)
      .update(readFileSync(join(packageDir, path)))
      .update('\0');
  }
  return identity.digest('hex').slice(0, 16);
};

// `stryker-incremental-<hash>-<shard>.json`, or the legacy unsharded `stryker-incremental-<hash>.json`.
const REPORT_NAME = /^stryker-incremental-[0-9a-f]+(?:-(.+))?\.json$/;

/** The shard a report belongs to: `undefined` for a legacy report, `null` for any other file. */
const shardOfReport = (name) => {
  const match = REPORT_NAME.exec(name);
  return match === null ? null : match[1];
};

/**
 * Deletes the incremental reports of the shard that `keepFile` belongs to (and the legacy
 * unsharded ones) except `keepFile` itself, so old reports do not pile up. The reports of the
 * other shards stay: a local full run writes one report per shard. A `keepFile` with no shard
 * suffix (the legacy name) matches only the legacy unsharded reports. The shard is compared as
 * text, never interpolated into a pattern.
 */
export const pruneStaleReports = (reportsDirectory, keepFile) => {
  if (!existsSync(reportsDirectory)) return;
  const keepShard = shardOfReport(keepFile);
  for (const name of readdirSync(reportsDirectory)) {
    const shard = shardOfReport(name);
    if (name === keepFile || shard === null) continue;
    if (shard === undefined || shard === keepShard) rmSync(join(reportsDirectory, name));
  }
};

/** True when `entry` (`process.argv[1]`) is the Stryker executable, whose file is `stryker.js`. */
export const isStrykerEntry = (entry) =>
  entry !== undefined && /^stryker(\.\w+)?$/.test(basename(entry));

export const excluded = [
  '!src/**/*.test.ts',
  '!src/**/*.test-d.ts',
  '!src/__testing__/**',
  '!src/**/index.ts',
];

// STRYKER=1 flips the `__STRYKER__` define, so a direct `stryker run` behaves like the npm
// script. Type tests cannot kill behavioral mutants (they run in `verify`), and skipping them
// keeps every mutant run cheap and out of the sandbox `extends ../../tsconfig.base.json` path.
// `--isolate=false` runs all test files in one worker instead of one fork per file: a mutant
// run costs the vitest boot, not the tests, so this halves the cold run with identical verdicts.
// Package tests therefore must not keep cross-file mutable module state: all files share one
// module registry in a run. The verdict of a mutant run is the exit code, but Stryker stores the
// whole output of every killed mutant in its reports: `--reporter=dot` shrinks the progress lines
// and `--bail=1` stops at the first failing test, so a mutant that fails 190 tests keeps one
// failure report instead of 190. A kill is a kill after one failure, so the verdicts do not
// change. Evidence measured on the first core shards (design D10): the cold `format` shard report
// shrank from 12.7 MB to about 0.8 MB. The `STRYKER=1 npx` prefix is POSIX shell syntax, so
// mutation runs on Linux and macOS only (design Open Questions, mutation on Windows).
export const vitestCommand =
  'STRYKER=1 npx --no-install vitest run --no-file-parallelism --typecheck.enabled=false --isolate=false --reporter=dot --bail=1';

/**
 * The Stryker options of one shard: `mutate` globs (plus the shared exclusions) and the vitest
 * paths of its `tests` (none runs the whole package). Reports, timeouts and thresholds are the
 * same for every shard of every package.
 */
export const shardOptions = ({ identityHash, shard, mutate, tests }) => ({
  testRunner: 'command',
  commandRunner: {
    command: tests === undefined ? vitestCommand : `${vitestCommand} ${tests.join(' ')}`,
  },
  coverageAnalysis: 'off',
  mutate: [...mutate, ...excluded],
  // Stale reports must not be copied into the sandboxes.
  ignorePatterns: ['reports'],
  incremental: true,
  incrementalFile: `reports/stryker-incremental-${identityHash}-${shard}.json`,
  reporters: ['clear-text', 'progress-append-only', 'html', 'json'],
  // One directory per shard, so the failure artifact of a runner never mixes with another's.
  htmlReporter: { fileName: `reports/mutation/${shard}/index.html` },
  jsonReporter: { fileName: `reports/mutation/${shard}/mutation.json` },
  // A timeout counts as a kill. Stryker allows `netTime * timeoutFactor + timeoutMS` per mutant
  // run, so a loaded runner has headroom, while a mutant that never terminates (the `gcd` mutants
  // of the rational shard, 7 timeouts under bail) costs about 19 s each. Four workers fit the 4
  // vCPUs of a CI runner.
  timeoutMS: 10000,
  timeoutFactor: 4,
  concurrency: 4,
  thresholds: { high: 95, low: 90, break: 90 },
});
