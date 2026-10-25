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
 * The package is small (139 mutants, about 30 s cold at PR 12), so it is one shard that runs the
 * whole data suite. Coverage alone let a surviving `month === 2` mutant through `defineMaterial`
 * (PR 10 review RES-5), so the first real material record meets the same gate as core.
 *
 * The data tests import `@maestro-calc/core`, whose sources run unmutated beside the mutated data
 * sources, so every file of core that its root barrel reaches (and the manifest with its `exports`)
 * is part of the identity; otherwise a core change would reuse a stale report. The calculators
 * and the test support of core are not: data imports neither (a contract test walks the import
 * graph and fails if that changes), so a calculator pull request does not cold this shard.
 */
export const shards = {
  data: {
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

/** The inputs that name the incremental report of the one shard: `data`. */
export const identityFilesFor = (shard) => {
  if (shard !== 'data') throw new Error(`unknown mutation shard: ${shard}`);
  return identityFilesOf({ packageDir, shared, ...shards.data });
};

/** Every input of the data shard (kept for the tests that read the identity of the package). */
export const incrementalIdentityFiles = identityFilesFor('data');

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const options = shardOptions({
  identityHash: identityHashOf(packageDir, incrementalIdentityFiles),
  shard: 'data',
  mutate: shards.data.mutate,
  tests: shards.data.tests,
});

// Importing the config (a test, a lint run, an editor) must never delete reports; only a real
// Stryker run prunes.
if (isStrykerEntry(process.argv[1])) {
  pruneStaleReports(join(packageDir, 'reports'), basename(options.incrementalFile));
}

export default options;
