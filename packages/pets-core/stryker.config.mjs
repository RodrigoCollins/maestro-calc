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
 * The pet-feeding calculators of Bowl Figures meet the same gate as core and data, as one shard that runs
 * the whole pets-core suite (the package is small).
 *
 * The pets-core tests import `@maestro-calc/core`, whose sources run unmutated beside the mutated
 * pets-core sources, so every file of core that its root barrel reaches (and the manifest with its
 * `exports`) is part of the identity; otherwise a core change would reuse a stale report. The
 * Maestro Calc calculators and the test support of core are not: pets-core imports neither (a
 * contract test walks the import graph and fails if that changes).
 */
export const shards = {
  'pets-core': {
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

/** The inputs that name the incremental report of the one shard: `pets-core`. */
export const identityFilesFor = (shard) => {
  if (shard !== 'pets-core') throw new Error(`unknown mutation shard: ${shard}`);
  return identityFilesOf({ packageDir, shared, ...shards['pets-core'] });
};

/** Every input of the pets-core shard (kept for the tests that read the identity of the package). */
export const incrementalIdentityFiles = identityFilesFor('pets-core');

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const options = shardOptions({
  identityHash: identityHashOf(packageDir, incrementalIdentityFiles),
  shard: 'pets-core',
  mutate: shards['pets-core'].mutate,
  tests: shards['pets-core'].tests,
});

// Importing the config (a test, a lint run, an editor) must never delete reports; only a real
// Stryker run prunes.
if (isStrykerEntry(process.argv[1])) {
  pruneStaleReports(join(packageDir, 'reports'), basename(options.incrementalFile));
}

export default options;
