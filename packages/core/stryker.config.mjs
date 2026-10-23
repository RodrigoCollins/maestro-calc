import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const packageDir = dirname(fileURLToPath(import.meta.url));

/**
 * A symlink could make this list and the CI `hashFiles` key disagree (`fs.globSync` follows none,
 * `hashFiles` skips them), so the identity set fails closed instead of guessing.
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
 * Every input that can change a mutation verdict, relative to this package and sorted. The
 * command runner reports no per-test files, so Stryker cannot see that a test was changed or
 * deleted and would keep stale survivors or kills from an older report. The incremental report
 * is therefore named after one hash of all of these inputs, and any change starts a fresh run.
 *
 * The CI cache key (`hashFiles` in `ci.yml`) covers the same files, which a contract test pins:
 * `.nvmrc` stands for the Node version, so the key and the report name always change together.
 */
export const incrementalIdentityFiles = [
  ...sourceFilesIn(join(packageDir, 'src')).map((path) => `src/${path}`),
  'stryker.config.mjs',
  'vitest.config.ts',
  ...rootJsonFiles(packageDir),
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

const identityHash = identity.digest('hex').slice(0, 16);

/**
 * Deletes the incremental reports of the shard that `keepFile` belongs to (and the legacy
 * unsharded ones) except `keepFile` itself, so old reports do not pile up. The reports of the
 * other shards stay: a local full run writes one report per shard. A `keepFile` with no shard
 * suffix (the legacy name) matches only the legacy unsharded reports.
 */
export const pruneStaleReports = (reportsDirectory, keepFile) => {
  if (!existsSync(reportsDirectory)) return;
  const shard = /^stryker-incremental-[0-9a-f]+-(.+)\.json$/.exec(keepFile)?.[1];
  const own = new RegExp(`^stryker-incremental-[0-9a-f]+(-${shard})?\\.json$`);
  for (const name of readdirSync(reportsDirectory)) {
    if (own.test(name) && name !== keepFile) {
      rmSync(join(reportsDirectory, name));
    }
  }
};

/** True when `entry` (`process.argv[1]`) is the Stryker executable, whose file is `stryker.js`. */
export const isStrykerEntry = (entry) =>
  entry !== undefined && /^stryker(\.\w+)?$/.test(basename(entry));

const excluded = [
  '!src/**/*.test.ts',
  '!src/**/*.test-d.ts',
  '!src/__testing__/**',
  '!src/**/index.ts',
];

/**
 * The command runner reruns the whole test command for every mutant, so the cost of a run is
 * (mutants) x (tests per run). A shard mutates a few modules and runs only their tests plus the
 * cross-module `index.test.ts` (cheap, and the only place that pins the wiring of the barrels).
 * The shards must cover every mutable file of `src` exactly once; a contract test asserts it from
 * the filesystem, so a new module cannot be left out. Each shard is one entry of the `matrix.shard`
 * list of the `mutation` job in `.github/workflows/ci.yml` (a contract test keeps the two equal);
 * `npm run mutation -- --list` prints the names, `-- --shard <name>` runs one.
 */
export const shards = {
  rational: {
    mutate: ['src/rational/**', 'src/errors.ts', 'src/result.ts'],
    tests: ['src/rational', 'src/errors.test.ts', 'src/result.test.ts', 'src/index.test.ts'],
  },
  units: {
    mutate: ['src/units/**', 'src/money/**'],
    tests: ['src/units', 'src/money', 'src/index.test.ts'],
  },
  format: {
    mutate: ['src/format/**'],
    tests: ['src/format', 'src/index.test.ts'],
  },
};

export const shardNames = Object.keys(shards);

// STRYKER=1 flips the `__STRYKER__` define, so a direct `stryker run` behaves like the npm
// script. Type tests cannot kill behavioral mutants (they run in `verify`), and skipping them
// keeps every mutant run cheap and out of the sandbox `extends ../../tsconfig.base.json` path.
// `--isolate=false` runs all test files in one worker instead of one fork per file: a mutant
// run costs the vitest boot, not the tests, so this halves the cold run with identical verdicts.
// Core tests therefore must not keep cross-file mutable module state: all files share one
// module registry in a run. The verdict of a mutant run is the exit code, but Stryker stores the
// whole output of every killed mutant in its reports: `--reporter=dot` shrinks the progress lines
// and `--bail=1` stops at the first failing test, so a mutant that fails 190 tests keeps one
// failure report instead of 190 (the cold format shard report shrinks from 12.7 MB to the size in
// apply-progress). A kill is a kill after one failure, so the verdicts do not change.
const vitestCommand =
  'STRYKER=1 npx --no-install vitest run --no-file-parallelism --typecheck.enabled=false --isolate=false --reporter=dot --bail=1';

/** The Stryker options of one shard, or of all of core in one invocation for `all`. */
export const optionsFor = (shard) => {
  if (shard !== 'all' && !Object.hasOwn(shards, shard)) {
    throw new Error(`unknown mutation shard: ${shard}`);
  }
  const selected = shard === 'all' ? undefined : shards[shard];
  const incrementalName = `stryker-incremental-${identityHash}-${shard}.json`;
  return {
    testRunner: 'command',
    commandRunner: {
      command:
        selected === undefined ? vitestCommand : `${vitestCommand} ${selected.tests.join(' ')}`,
    },
    coverageAnalysis: 'off',
    mutate:
      selected === undefined ? ['src/**/*.ts', ...excluded] : [...selected.mutate, ...excluded],
    // Stale reports must not be copied into the sandboxes.
    ignorePatterns: ['reports'],
    incremental: true,
    incrementalFile: `reports/${incrementalName}`,
    reporters: ['clear-text', 'progress-append-only', 'html', 'json'],
    // One directory per shard, so the failure artifact of a runner never mixes with another's.
    htmlReporter: { fileName: `reports/mutation/${shard}/index.html` },
    jsonReporter: { fileName: `reports/mutation/${shard}/mutation.json` },
    // A timeout counts as a kill. Stryker allows `netTime * timeoutFactor + timeoutMS` per mutant
    // run, so a loaded runner has headroom while the 8 `gcd` mutants that never terminate cost
    // about 19 s each. Four workers fit the 4 vCPUs of a CI runner.
    timeoutMS: 10000,
    timeoutFactor: 4,
    concurrency: 4,
    thresholds: { high: 95, low: 90, break: 90 },
  };
};

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const options = optionsFor(process.env.STRYKER_SHARD ?? 'all');

// The config is also imported by tests and editors, which must not delete reports; only a real
// Stryker run prunes.
if (isStrykerEntry(process.argv[1])) {
  pruneStaleReports(join(packageDir, 'reports'), basename(options.incrementalFile));
}

export default options;
