import { basename, dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  identityHashOf,
  isStrykerEntry,
  pruneStaleReports,
  rootJsonFiles,
  shardOptions,
  sourceFilesIn,
} from '../../tooling/stryker.mjs';

// The helpers the contract tests (and editors) reach through this config.
export { isStrykerEntry, pruneStaleReports, rootJsonFiles, sourceFilesIn };

const packageDir = dirname(fileURLToPath(import.meta.url));

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
  '../../tooling/stryker.mjs',
  '../../tsconfig.base.json',
  '../../vitest.config.ts',
].sort();

const identityHash = identityHashOf(packageDir, incrementalIdentityFiles);

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
  calculator: {
    mutate: ['src/calculator/**', 'src/error-codes.ts'],
    tests: [
      'src/calculator',
      'src/error-codes.test.ts',
      'src/__testing__/fixture-box.test.ts',
      'src/index.test.ts',
    ],
  },
  // The URL codec has its own shard (PR 10 review RES-7): the `calculator` shard is projected at
  // 6.4 to 8.8 minutes on CI (135 s local cold), and the codec's tests only need the fixture and
  // the barrel.
  url: {
    mutate: ['src/url/**'],
    tests: ['src/url', 'src/index.test.ts'],
  },
  // Calculators are a shard of their own (design D10 split rule, PR 12): one directory per
  // calculator, so the shard grows with the catalog and is split by directory when its cold CI
  // wall time passes 10 minutes. Their tests need only the calculator directories and the barrel.
  calculators: {
    mutate: ['src/calculators/**'],
    tests: ['src/calculators', 'src/index.test.ts'],
  },
};

export const shardNames = Object.keys(shards);

/** The Stryker options of one shard, or of all of core in one invocation for `all`. */
export const optionsFor = (shard) => {
  if (shard !== 'all' && !Object.hasOwn(shards, shard)) {
    throw new Error(`unknown mutation shard: ${shard}`);
  }
  const selected = shard === 'all' ? { mutate: ['src/**/*.ts'], tests: undefined } : shards[shard];
  return shardOptions({ identityHash, shard, ...selected });
};

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const options = optionsFor(process.env.STRYKER_SHARD || 'all');

// The config is also imported by tests and editors, which must not delete reports; only a real
// Stryker run prunes.
if (isStrykerEntry(process.argv[1])) {
  pruneStaleReports(join(packageDir, 'reports'), basename(options.incrementalFile));
}

export default options;
