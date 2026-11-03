import { basename, dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  identityFilesOf,
  identityHashOf,
  isStrykerEntry,
  pruneStaleReports,
  shardOptions,
  sharedIdentityFiles,
} from '../../tooling/stryker.mjs';

const packageDir = dirname(fileURLToPath(import.meta.url));

/**
 * The pool calculators of Pool Figures meet the same gate as core and data, as one shard that runs
 * the whole pool-core suite (the package is small).
 *
 * The pool-core tests import `@maestro-calc/core`, whose sources run unmutated beside the mutated
 * pool-core sources, so every file of core that its root barrel reaches (and the manifest with its
 * `exports`) is part of the identity; otherwise a core change would reuse a stale report. The
 * Maestro Calc calculators and the test support of core are not: pool-core imports neither (a
 * contract test walks the import graph and fails if that changes).
 */
export const shards = {
  'pool-core': {
    mutate: ['src/**/*.ts'],
    tests: undefined,
    deps: [
      '../core/*.json',
      '../core/src/*.ts',
      '../core/src/calculator/**',
      '../core/src/format/**',
      '../core/src/geometry/**',
      '../core/src/money/**',
      '../core/src/rational/**',
      '../core/src/units/**',
      '../core/src/url/**',
    ],
  },
};

export const shardNames = Object.keys(shards);

const shared = sharedIdentityFiles(packageDir);

/** The inputs that name the incremental report of the one shard: `pool-core`. */
export const identityFilesFor = (shard) => {
  if (shard !== 'pool-core') throw new Error(`unknown mutation shard: ${shard}`);
  return identityFilesOf({ packageDir, shared, ...shards['pool-core'] });
};

/** Every input of the pool-core shard (kept for the tests that read the identity of the package). */
export const incrementalIdentityFiles = identityFilesFor('pool-core');

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const options = shardOptions({
  identityHash: identityHashOf(packageDir, incrementalIdentityFiles),
  shard: 'pool-core',
  mutate: shards['pool-core'].mutate,
  tests: shards['pool-core'].tests,
});

// Importing the config (a test, a lint run, an editor) must never delete reports; only a real
// Stryker run prunes.
if (isStrykerEntry(process.argv[1])) {
  pruneStaleReports(join(packageDir, 'reports'), basename(options.incrementalFile));
}

export default options;
