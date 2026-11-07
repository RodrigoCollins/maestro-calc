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
 * The quote calculators of Cuánto Le Cobro meet the same gate as core and data, as one
 * shard that runs the whole cobro-core suite (the package is small).
 *
 * The cobro-core tests import `@maestro-calc/core`, whose sources run unmutated beside the mutated
 * cobro-core sources, so every file of core that its root barrel reaches (and the manifest with its
 * `exports`) is part of the identity; otherwise a core change would reuse a stale report. The
 * quotes compose the paint, drywall, concrete and mulch calculators of core (their tests build
 * them with the yields fixtures of core), so those four directories and the three fixtures are in
 * the identity as well.
 */
export const shards = {
  'cobro-core': {
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
      '../core/src/calculators/concrete/**',
      '../core/src/calculators/drywall/**',
      '../core/src/calculators/mulch/**',
      '../core/src/calculators/paint/**',
      '../core/src/__testing__/concrete-yields.ts',
      '../core/src/__testing__/drywall-yields.ts',
      '../core/src/__testing__/paint-yields.ts',
    ],
  },
};

export const shardNames = Object.keys(shards);

const shared = sharedIdentityFiles(packageDir);

/** The inputs that name the incremental report of the one shard: `cobro-core`. */
export const identityFilesFor = (shard) => {
  if (shard !== 'cobro-core') throw new Error(`unknown mutation shard: ${shard}`);
  return identityFilesOf({ packageDir, shared, ...shards['cobro-core'] });
};

/** Every input of the cobro-core shard (kept for the tests that read the identity of the package). */
export const incrementalIdentityFiles = identityFilesFor('cobro-core');

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const options = shardOptions({
  identityHash: identityHashOf(packageDir, incrementalIdentityFiles),
  shard: 'cobro-core',
  mutate: shards['cobro-core'].mutate,
  tests: shards['cobro-core'].tests,
});

// Importing the config (a test, a lint run, an editor) must never delete reports; only a real
// Stryker run prunes.
if (isStrykerEntry(process.argv[1])) {
  pruneStaleReports(join(packageDir, 'reports'), basename(options.incrementalFile));
}

export default options;
