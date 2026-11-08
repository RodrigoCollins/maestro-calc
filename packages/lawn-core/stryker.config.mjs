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
 * The lawn calculators of Lawn Figures meet the same gate as core and data, as one shard that runs
 * the whole lawn-core suite (the package is small).
 *
 * The lawn-core tests import `@maestro-calc/core`, whose sources run unmutated beside the mutated
 * lawn-core sources, so every file of core that its root barrel reaches (and the manifest with its
 * `exports`) is part of the identity; otherwise a core change would reuse a stale report. The
 * Maestro Calc calculators and the test support of core are not: lawn-core imports neither (a
 * contract test walks the import graph and fails if that changes).
 */
export const shards = {
  'lawn-core': {
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

/** The inputs that name the incremental report of the one shard: `lawn-core`. */
export const identityFilesFor = (shard) => {
  if (shard !== 'lawn-core') throw new Error(`unknown mutation shard: ${shard}`);
  return identityFilesOf({ packageDir, shared, ...shards['lawn-core'] });
};

/** Every input of the lawn-core shard (kept for the tests that read the identity of the package). */
export const incrementalIdentityFiles = identityFilesFor('lawn-core');

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const options = shardOptions({
  identityHash: identityHashOf(packageDir, incrementalIdentityFiles),
  shard: 'lawn-core',
  mutate: shards['lawn-core'].mutate,
  tests: shards['lawn-core'].tests,
});

// Importing the config (a test, a lint run, an editor) must never delete reports; only a real
// Stryker run prunes.
if (isStrykerEntry(process.argv[1])) {
  pruneStaleReports(join(packageDir, 'reports'), basename(options.incrementalFile));
}

export default options;
