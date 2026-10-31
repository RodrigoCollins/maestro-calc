import { basename, dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import {
  identityFilesOf,
  identityHashOf,
  isStrykerEntry,
  pruneStaleReports,
  rootJsonFiles,
  shardOptions,
  sharedIdentityFiles,
  sourceFilesIn,
} from '../../tooling/stryker.mjs';

// The helpers the contract tests (and editors) reach through this config.
export { isStrykerEntry, pruneStaleReports, rootJsonFiles, sourceFilesIn };

const packageDir = dirname(fileURLToPath(import.meta.url));

const shared = sharedIdentityFiles(packageDir);

/**
 * The code every shard runs beside what it mutates, read from the import graph (a contract test
 * walks it and fails when a shard imports a file its identity does not hold): the kernel
 * modules, the barrel tests and the test support that is not the released snapshot. The walk
 * follows the root barrel, and `src/*.ts` covers it. `src/url/**` is in the kernel because
 * `src/index.test.ts` imports the barrel, which re-exports the codec. A change here (a codec edit
 * included) starts a cold run in every core shard; a change to a calculator or to the released
 * snapshot does not.
 */
const kernel = [
  'src/*.ts',
  'src/calculator/**',
  'src/format/**',
  'src/geometry/**',
  'src/money/**',
  'src/rational/**',
  'src/units/**',
  'src/url/**',
  'src/__testing__/arbitraries.ts',
  'src/__testing__/collect-strings.ts',
  'src/__testing__/fixture-box.ts',
  'src/__testing__/language-free.ts',
  'src/__testing__/length-failure.ts',
  'src/__testing__/message-key-fixtures.ts',
  'src/__testing__/property-runs.ts',
  'src/__testing__/thrown-code.ts',
];

/** The test support every calculator group runs beside its calculators. */
const calculatorDeps = [
  ...kernel,
  'src/__testing__/*-arbitraries.ts',
  'src/__testing__/*-yields.ts',
  'src/__testing__/released-snapshot.ts',
];

/**
 * The calculator shards: each mutates and tests its own directories plus the barrel test; the
 * first also runs the released contract, whose imports reach every calculator directory.
 */
const calculatorGroups = (groups) =>
  Object.fromEntries(
    Object.entries(groups).map(([name, ids], index) => {
      const dirs = ids.map((id) => `src/calculators/${id}`);
      const first = index === 0;
      return [
        name,
        {
          mutate: dirs.map((dir) => `${dir}/**`),
          tests: [
            ...dirs,
            ...(first ? ['src/calculators/released.contract.test.ts'] : []),
            'src/index.test.ts',
          ],
          deps: first ? [...calculatorDeps, 'src/calculators/**'] : calculatorDeps,
        },
      ];
    }),
  );

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
    deps: kernel,
  },
  // `src/geometry/**` (pi and the circle area) rides with the units: it is built on them.
  units: {
    mutate: ['src/units/**', 'src/money/**', 'src/geometry/**'],
    tests: ['src/units', 'src/money', 'src/geometry', 'src/index.test.ts'],
    deps: kernel,
  },
  format: {
    mutate: ['src/format/**'],
    tests: ['src/format', 'src/index.test.ts'],
    deps: kernel,
  },
  // The calculator contract is two shards because its single shard measured 9 min 47 s of Stryker
  // on CI (PR 11 run 40006514352, 4.16 times the 141 s local cold run), at the 10 minute trigger of
  // design D10. `define` holds the definition side, `run` the execution side. The run tests build
  // their calculators with `defineCalculator`, so define's sources are part of the run shard's
  // identity (the kernel) and a change to define colds both, but only run files are mutated there.
  'calculator-define': {
    mutate: [
      'src/calculator/constraints.ts',
      'src/calculator/define.ts',
      'src/calculator/definition-checks.ts',
      'src/calculator/descriptors.ts',
      'src/calculator/reserved-keys.ts',
      'src/calculator/validate.ts',
      'src/error-codes.ts',
    ],
    tests: [
      'src/calculator/constraints.test.ts',
      'src/calculator/define.test.ts',
      'src/calculator/reserved-keys.test.ts',
      'src/calculator/validate.test.ts',
      'src/error-codes.test.ts',
      'src/__testing__/fixture-box.test.ts',
      'src/index.test.ts',
    ],
    deps: kernel,
  },
  'calculator-run': {
    mutate: ['src/calculator/message-keys.ts', 'src/calculator/run.ts'],
    tests: [
      'src/calculator/message-keys.test.ts',
      'src/calculator/run-language-free.test.ts',
      'src/calculator/run.test.ts',
      'src/index.test.ts',
    ],
    deps: kernel,
  },
  // The URL codec has its own shard (PR 10 review RES-7): the calculator contract was projected at
  // 6.4 to 8.8 minutes on CI (135 s local cold), and the codec's tests only need the fixture and
  // the barrel. Its tests build their calculators by hand: they import no calculator and not the
  // released snapshot (a contract test checks it), so a new calculator never colds this shard.
  url: {
    mutate: ['src/url/**'],
    tests: ['src/url', 'src/index.test.ts'],
    deps: kernel,
  },
  // Calculators are split by directory (design D10 split rule, AGENTS.md): the single shard passed
  // 947 mutants and 10 minutes of CI with ten calculators. Four groups of about the same source
  // size run on their own runners, and a calculator pull request colds its own group and the first.
  // The first group holds `released.contract.test.ts`, which imports every calculator (so every
  // calculator directory is in its identity): it gets the three smallest calculators, so its cold
  // run stays short. A new calculator joins the group with the least source.
  ...calculatorGroups({
    'calculators-1': ['rectangle-area', 'feet-inches', 'roof-pitch'],
    'calculators-2': ['concrete', 'paint'],
    'calculators-3': ['drywall', 'roofing'],
    'calculators-4': ['gravel', 'mulch', 'topsoil'],
  }),
};

export const shardNames = Object.keys(shards);

/**
 * The inputs that name the incremental report of `shard`: its own sources, tests and `deps` plus
 * the shared files. `all` (a direct `stryker run` with no shard) is every file of `src`.
 */
export const identityFilesFor = (shard) => {
  if (shard === 'all') {
    return [
      ...new Set([
        ...sourceFilesIn(join(packageDir, 'src')).map((path) => `src/${path}`),
        ...shared,
      ]),
    ].sort();
  }
  if (!Object.hasOwn(shards, shard)) throw new Error(`unknown mutation shard: ${shard}`);
  return identityFilesOf({ packageDir, shared, ...shards[shard] });
};

/** Every input of core, the identity of a run with no shard. */
export const incrementalIdentityFiles = identityFilesFor('all');

/** The Stryker options of one shard, or of all of core in one invocation for `all`. */
export const optionsFor = (shard) => {
  const identityHash = identityHashOf(packageDir, identityFilesFor(shard));
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
