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

const packageDir = dirname(fileURLToPath(import.meta.url));
const coreDir = join(packageDir, '..', 'core');

/**
 * The package is small (139 mutants, about 30 s cold at PR 12), so it is one shard that runs the
 * whole data suite. Coverage alone let a surviving `month === 2` mutant through `defineMaterial`
 * (PR 10 review RES-5), so the first real material record meets the same gate as core.
 */
export const shardNames = ['data'];

/**
 * Every input that can change a verdict of this shard, relative to this package and sorted.
 * The data tests import `@maestro-calc/core`, whose sources run unmutated beside the mutated
 * data sources, so any file of core that can change what they see is part of the identity (the
 * sources and the manifest with its `exports`); otherwise a core change would reuse a stale report.
 */
export const incrementalIdentityFiles = [
  ...sourceFilesIn(join(packageDir, 'src')).map((path) => `src/${path}`),
  ...sourceFilesIn(join(coreDir, 'src')).map((path) => `../core/src/${path}`),
  'stryker.config.mjs',
  'vitest.config.ts',
  ...rootJsonFiles(packageDir),
  ...rootJsonFiles(coreDir).map((path) => `../core/${path}`),
  '../../.nvmrc',
  '../../package-lock.json',
  '../../tooling/stryker.mjs',
  '../../tsconfig.base.json',
  '../../vitest.config.ts',
].sort();

/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const options = shardOptions({
  identityHash: identityHashOf(packageDir, incrementalIdentityFiles),
  shard: 'data',
  mutate: ['src/**/*.ts'],
  tests: undefined,
});

// Importing the config (a test, a lint run, an editor) must never delete reports; only a real
// Stryker run prunes.
if (isStrykerEntry(process.argv[1])) {
  pruneStaleReports(join(packageDir, 'reports'), basename(options.incrementalFile));
}

export default options;
