import {
  existsSync,
  globSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

interface StrykerConfig {
  testRunner: string;
  commandRunner: { command: string };
  coverageAnalysis: string;
  checkers?: string[];
  mutate: string[];
  ignorePatterns: string[];
  incremental: boolean;
  incrementalFile: string;
  reporters: string[];
  htmlReporter: { fileName: string };
  jsonReporter: { fileName: string };
  timeoutMS: number;
  timeoutFactor: number;
  concurrency: number;
  thresholds: { high: number; low: number; break: number };
}

interface Shard {
  mutate: string[];
  tests: string[];
}

interface StrykerModule {
  default: StrykerConfig;
  shards: Record<string, Shard>;
  shardNames: string[];
  optionsFor: (shard: string) => StrykerConfig;
  incrementalIdentityFiles: string[];
  pruneStaleReports: (reportsDirectory: string, keepFile: string) => void;
  isStrykerEntry: (entry: string | undefined) => boolean;
  sourceFilesIn: (directory: string) => string[];
  rootJsonFiles: (directory: string) => string[];
}

const readJson = (relativePath: string): unknown =>
  JSON.parse(readFileSync(fromRoot(relativePath), 'utf8'));

const module_ = await importFromRoot<StrykerModule>('packages/core/stryker.config.mjs');
// The data package builds its own single shard on the same gate (task 12.10c).
const dataModule = await importFromRoot<StrykerModule>('packages/data/stryker.config.mjs');
// The default export follows STRYKER_SHARD, so assertions about all of core read it explicitly.
const config = module_.optionsFor('all');
const scripts = (relativePath: string): Record<string, string> =>
  (readJson(relativePath) as { scripts: Record<string, string> }).scripts;

describe('mutation gate (quality-gates › Mutation gate on core)', () => {
  // spec: Score below break / Score at threshold [QG11, QG12]
  it('uses the high 95, low 90, break 90 thresholds', () => {
    expect(config.thresholds).toEqual({ high: 95, low: 90, break: 90 });
  });

  // spec: Mutation gate on core — incremental, no TypeScript checker initially
  it('is incremental and enables no checker', () => {
    expect(config.incremental).toBe(true);
    expect(config.checkers).toBeUndefined();
  });

  // spec: Equivalent gate on fallback [QG13]: the vitest runner of Stryker 10 filters tests by a
  // name that vitest 5 no longer matches, so no mutant is ever killed; the command runner is the
  // documented fallback and must run the whole core suite.
  it('drives vitest through the command runner without coverage analysis', () => {
    expect(config.testRunner).toBe('command');
    expect(config.coverageAnalysis).toBe('off');
  });

  // design: a direct `stryker run` must behave like `npm run mutation`, so the define flag is set
  // in the command; type tests cannot kill behavioral mutants and run in `verify`, and skipping
  // them also avoids the sandbox `extends ../../tsconfig.base.json` path. `--isolate=false` keeps
  // one vitest process per mutant run instead of one fork per test file: the cost of a mutant is
  // the vitest boot, not the tests, and the measured cold run halves (4 min 57 s to 2 min 24 s on
  // 418 mutants) with identical verdicts. The mutant still lives in a fresh process per run.
  // Consequence for every core test: with `--isolate=false` all test files share one module
  // registry, so a test must not keep mutable module state (a counter, a cache, a mutated
  // constant) that another file could observe; such state would make a verdict depend on order.
  it('runs the whole suite serially in one process with STRYKER set and without type tests', () => {
    expect(config.commandRunner.command).toBe(
      'STRYKER=1 npx --no-install vitest run --no-file-parallelism --typecheck.enabled=false --isolate=false --reporter=dot --bail=1',
    );
  });

  // design: a timeout is an optimistic kill, so the budget is fixed. Stryker allows
  // `netTime * timeoutFactor + timeoutMS` per mutant run (2.3 s * 4 + 10 s, about 19 s), which
  // leaves headroom for a loaded runner while a non-terminating mutant costs about 19 s instead
  // of about 39 s at `timeoutMS 30000`; 4 workers fit a 4-vCPU runner.
  it('bounds each mutant run and fixes the parallelism', () => {
    expect(config.timeoutMS).toBe(10000);
    expect(config.timeoutFactor).toBe(4);
    expect(config.concurrency).toBe(4);
  });

  // design: stale reports must not be copied into the sandboxes
  it('keeps the reports out of the sandbox and emits the CI-friendly reporters', () => {
    expect(config.ignorePatterns).toEqual(['reports']);
    expect(config.reporters).toEqual(['clear-text', 'progress-append-only', 'html', 'json']);
  });

  // spec: Mutation gate on core — over core sources, excluding tests, test support and barrels
  it('mutates core sources but not tests, test support or barrels', () => {
    expect(config.mutate).toEqual([
      'src/**/*.ts',
      '!src/**/*.test.ts',
      '!src/**/*.test-d.ts',
      '!src/__testing__/**',
      '!src/**/index.ts',
    ]);
  });

  // spec: Mutation gate on core — property runs drop to 50 under STRYKER
  it('exposes npm run mutation at the root, delegating to core (the command flags STRYKER)', () => {
    expect(scripts('package.json')['mutation']).toBe('node scripts/mutation.mjs');
    expect(scripts('packages/core/package.json')['mutation']).toBe('stryker run');
  });

  // spec: Score below break [QG11]: the command runner reports no test files, so Stryker cannot
  // tell a test was removed; the report file name therefore carries one hash of every core input.
  it('keys the incremental report by a hash computed once in the Stryker config', () => {
    expect(config.incrementalFile).toMatch(/^reports\/stryker-incremental-[0-9a-f]{16}-all\.json$/);
    const files = module_.incrementalIdentityFiles;
    for (const input of [
      'src/rational/rational.ts',
      'src/rational/rational.test.ts',
      'stryker.config.mjs',
      'vitest.config.ts',
      'tsconfig.json',
      'tsconfig.src.json',
      'tsconfig.test.json',
      'package.json',
      '../../tsconfig.base.json',
      '../../vitest.config.ts',
      '../../.nvmrc',
      '../../package-lock.json',
      '../../tooling/stryker.mjs',
    ]) {
      expect(files, input).toContain(input);
    }
    expect(files).toEqual([...files].sort());
  });

  // design D10: only the report that matches the current inputs is useful; older ones pile up in
  // `reports/` locally and in the cache directory. A shard prunes its own reports (and the legacy
  // unsharded ones), never the reports of the other shards that a local full run just produced.
  it('prunes the stale reports of its own shard and keeps every other shard', () => {
    const directory = mkdtempSync(join(tmpdir(), 'stryker-prune-'));
    try {
      for (const name of [
        'stryker-incremental-aaaaaaaaaaaaaaaa-units.json',
        'stryker-incremental-bbbbbbbbbbbbbbbb-units.json',
        'stryker-incremental-aaaaaaaaaaaaaaaa-format.json',
        'stryker-incremental-aaaaaaaaaaaaaaaa.json',
        'other.json',
      ]) {
        writeFileSync(join(directory, name), '{}');
      }
      mkdirSync(join(directory, 'mutation'));
      module_.pruneStaleReports(directory, 'stryker-incremental-bbbbbbbbbbbbbbbb-units.json');
      expect(readdirSync(directory).sort()).toEqual([
        'mutation',
        'other.json',
        'stryker-incremental-aaaaaaaaaaaaaaaa-format.json',
        'stryker-incremental-bbbbbbbbbbbbbbbb-units.json',
      ]);
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  // A legacy `keepFile` (no shard suffix) prunes the legacy reports only. The match is explicit, so
  // a shard that happens to be named `undefined` is a shard like any other and survives.
  it('prunes only the legacy reports when the kept report has no shard suffix', () => {
    const directory = mkdtempSync(join(tmpdir(), 'stryker-prune-legacy-'));
    try {
      for (const name of [
        'stryker-incremental-aaaaaaaaaaaaaaaa.json',
        'stryker-incremental-bbbbbbbbbbbbbbbb.json',
        'stryker-incremental-aaaaaaaaaaaaaaaa-undefined.json',
        'stryker-incremental-aaaaaaaaaaaaaaaa-units.json',
      ]) {
        writeFileSync(join(directory, name), '{}');
      }
      module_.pruneStaleReports(directory, 'stryker-incremental-bbbbbbbbbbbbbbbb.json');
      expect(readdirSync(directory).sort()).toEqual([
        'stryker-incremental-aaaaaaaaaaaaaaaa-undefined.json',
        'stryker-incremental-aaaaaaaaaaaaaaaa-units.json',
        'stryker-incremental-bbbbbbbbbbbbbbbb.json',
      ]);
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  // The shard name is data, not a pattern: a name with regex metacharacters prunes exactly itself.
  it('treats the shard name literally when pruning', () => {
    const directory = mkdtempSync(join(tmpdir(), 'stryker-prune-literal-'));
    try {
      for (const name of [
        'stryker-incremental-aaaaaaaaaaaaaaaa-a.c.json',
        'stryker-incremental-aaaaaaaaaaaaaaaa-abc.json',
        'stryker-incremental-bbbbbbbbbbbbbbbb-a.c.json',
      ]) {
        writeFileSync(join(directory, name), '{}');
      }
      module_.pruneStaleReports(directory, 'stryker-incremental-bbbbbbbbbbbbbbbb-a.c.json');
      expect(readdirSync(directory).sort()).toEqual([
        'stryker-incremental-aaaaaaaaaaaaaaaa-abc.json',
        'stryker-incremental-bbbbbbbbbbbbbbbb-a.c.json',
      ]);
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  // Importing the config (a test, a lint run, an editor) must never delete reports; only the
  // Stryker entry point may prune.
  it('does not touch the reports directory when it is merely imported', async () => {
    const reports = fromRoot('packages/core/reports');
    const stale = join(reports, 'stryker-incremental-0000000000000000.json');
    mkdirSync(reports, { recursive: true });
    writeFileSync(stale, '{}');
    try {
      // a distinct query string makes Node evaluate the module again
      await import(
        `${pathToFileURL(fromRoot('packages/core/stryker.config.mjs')).href}?import-only`
      );
      expect(existsSync(stale)).toBe(true);
    } finally {
      rmSync(stale, { force: true });
    }
  });

  it('recognises the Stryker entry point by its file name only', () => {
    expect(module_.isStrykerEntry('/p/node_modules/@stryker-mutator/core/bin/stryker.js')).toBe(
      true,
    );
    expect(module_.isStrykerEntry('/p/stryker-work/node_modules/vitest/vitest.mjs')).toBe(false);
    expect(module_.isStrykerEntry(undefined)).toBe(false);
  });

  // CI `hashFiles` skips nothing, while `fs.globSync` skips dotfiles; the config therefore leaves
  // dotfiles and dot directories out of its list, and the CI key stays a superset of it (an
  // editor swap file changes the CI key only, which costs a cold run, never a stale hit).
  it('lists source files without dotfiles and dot directories', () => {
    const directory = mkdtempSync(join(tmpdir(), 'stryker-list-'));
    try {
      mkdirSync(join(directory, 'sub'));
      mkdirSync(join(directory, '.hidden'));
      for (const name of ['a.ts', 'sub/b.ts', '.swp', 'sub/.c.ts', '.hidden/d.ts']) {
        writeFileSync(join(directory, name), '');
      }
      expect(module_.sourceFilesIn(directory).sort()).toEqual(['a.ts', 'sub/b.ts']);
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  // The package-root `*.json` files join the identity like the sources do: a dotfile such as an
  // editor's `.eslintrc.json` is skipped by `fs.globSync`, so the config must skip it as well.
  it('lists package-root json files without dotfiles, directories and other extensions', () => {
    const directory = mkdtempSync(join(tmpdir(), 'stryker-json-'));
    try {
      mkdirSync(join(directory, 'nested.json'));
      for (const name of ['package.json', 'tsconfig.json', '.hidden.json', 'notes.txt']) {
        writeFileSync(join(directory, name), '{}');
      }
      expect(module_.rootJsonFiles(directory).sort()).toEqual(['package.json', 'tsconfig.json']);
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  // Fail closed: `fs.globSync` follows no symlink and CI `hashFiles` skips them, so a link in the
  // identity set could make the config and the CI key disagree. A dangling link must throw too.
  it.each(['regular', 'dangling'])('refuses a %s symlink in the identity set', (kind) => {
    const directory = mkdtempSync(join(tmpdir(), 'stryker-link-'));
    try {
      writeFileSync(join(directory, 'target.json'), '{}');
      symlinkSync(
        kind === 'regular' ? 'target.json' : 'missing.json',
        join(directory, 'link.json'),
      );
      expect(() => module_.sourceFilesIn(directory)).toThrow(
        /symlink in identity set: .*link\.json/,
      );
      expect(() => module_.rootJsonFiles(directory)).toThrow(
        /symlink in identity set: .*link\.json/,
      );
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  it('tolerates a missing reports directory', () => {
    const missing = join(tmpdir(), 'stryker-prune-missing');
    expect(existsSync(missing)).toBe(false);
    expect(() => {
      module_.pruneStaleReports(missing, 'stryker-incremental-bbbbbbbbbbbbbbbb-all.json');
    }).not.toThrow();
  });
});

// design D10 / 3.19b: the command runner reruns the whole suite per mutant, so the mutation job is
// split by module: one Stryker invocation per shard whose test command shrinks with `mutate`.
describe('mutation shards (quality-gates › Mutation gate on core, design 3.19b)', () => {
  const srcRoot = fromRoot('packages/core/src');
  const base = 'STRYKER=1 npx --no-install vitest run --no-file-parallelism';
  const flags = '--typecheck.enabled=false --isolate=false --reporter=dot --bail=1';
  const filesUnder = (path: string): string[] => globSync(path, { cwd: fromRoot('packages/core') });
  // every file the mutation gate must score: sources, not tests, test support or barrels
  const mutable = readdirSync(srcRoot, { recursive: true })
    .map(String)
    .filter((path) => path.endsWith('.ts') && !path.endsWith('.d.ts'))
    .filter((path) => !/\.test(-d)?\.ts$/.test(path))
    .filter((path) => !path.startsWith('__testing__/') && !/(^|\/)index\.ts$/.test(path))
    .map((path) => `src/${path}`)
    .sort();
  const isExclusion = (glob: string): boolean => glob.startsWith('!');
  const exclusions = config.mutate.filter(isExclusion);
  const owners = (file: string): string[] =>
    module_.shardNames.filter((name) =>
      (module_.shards[name]?.mutate ?? []).some((glob) => filesUnder(glob).includes(file)),
    );

  it('has six named shards', () => {
    expect(module_.shardNames).toEqual([
      'rational',
      'units',
      'format',
      'calculator',
      'url',
      'calculators',
    ]);
  });

  // design 3.19b: no gap (a file nobody mutates) and no overlap (a file scored twice, which also
  // costs twice) between the shards, asserted from the filesystem so a new module cannot slip by.
  it('assigns every mutable source file to exactly one shard', () => {
    expect(mutable.length).toBeGreaterThan(10);
    for (const file of mutable) {
      expect(owners(file), file).toHaveLength(1);
    }
  });

  it('lists only globs that match files, and keeps the shared exclusions', () => {
    for (const name of module_.shardNames) {
      expect(module_.optionsFor(name).mutate.filter(isExclusion), name).toEqual(exclusions);
      for (const glob of module_.shards[name]?.mutate ?? []) {
        expect(filesUnder(glob), glob).not.toHaveLength(0);
      }
    }
  });

  // The test command must run the tests of the shard's own files (a sibling `x.test.ts`) and the
  // cross-module tests, and nothing is left unrun: every test file belongs to some shard.
  it('runs the sibling test of each mutated file and the cross-module test in every shard', () => {
    for (const name of module_.shardNames) {
      const shard = module_.shards[name];
      const tests = shard?.tests ?? [];
      expect(tests, name).toContain('src/index.test.ts');
      for (const file of mutable.filter((path) => owners(path).includes(name))) {
        const sibling = file.replace(/\.ts$/, '.test.ts');
        if (!existsSync(fromRoot('packages/core', sibling))) continue;
        expect(
          tests.some((test) => sibling.startsWith(test)),
          `${name} runs ${sibling}`,
        ).toBe(true);
      }
      expect(module_.optionsFor(name).commandRunner.command).toBe(
        `${base} ${flags} ${tests.join(' ')}`,
      );
    }
  });

  // The tests of the arbitraries exercise test support, not a mutable source, so no shard runs
  // them; `verify` does. Every other test file, `fixture-box.test.ts` included, must run in at
  // least one shard.
  const unsharded = [
    'src/__testing__/arbitraries.test.ts',
    'src/__testing__/property-runs.test.ts',
  ];
  it('leaves no test file unrun by every shard', () => {
    const tests = globSync('src/**/*.test.ts', { cwd: fromRoot('packages/core') })
      .map((path) => path.replaceAll('\\', '/'))
      .filter((path) => !unsharded.includes(path));
    expect(tests.length).toBeGreaterThan(10);
    for (const test of tests) {
      const runners = module_.shardNames.filter((name) =>
        (module_.shards[name]?.tests ?? []).some((prefix) => test.startsWith(prefix)),
      );
      expect(runners, test).not.toHaveLength(0);
    }
  });

  // Stryker writes one report per shard under `reports/mutation/<shard>/`, so the failure artifact
  // (path `reports/mutation`) of one runner never mixes with another's.
  it('writes the html and json reports of each shard to its own directory', () => {
    for (const name of module_.shardNames) {
      const options = module_.optionsFor(name);
      expect(options.htmlReporter.fileName).toBe(`reports/mutation/${name}/index.html`);
      expect(options.jsonReporter.fileName).toBe(`reports/mutation/${name}/mutation.json`);
    }
  });

  it('names the incremental report after the shard and keeps one threshold set', () => {
    for (const name of module_.shardNames) {
      const options = module_.optionsFor(name);
      expect(options.incrementalFile, name).toMatch(
        new RegExp(`^reports/stryker-incremental-[0-9a-f]{16}-${name}\\.json$`),
      );
      expect(options.thresholds).toEqual({ high: 95, low: 90, break: 90 });
      expect(options.incremental).toBe(true);
    }
    // the per-shard identity is pinned in mutation-identity.contract.test.ts
  });

  it('rejects an unknown shard and defaults to all of core', () => {
    expect(() => module_.optionsFor('nope')).toThrow(/unknown mutation shard: nope/);
    expect(module_.optionsFor('all').mutate).toEqual(config.mutate);
    expect(config.commandRunner.command).not.toContain(' src/');
  });

  it('reads the shard from STRYKER_SHARD', async () => {
    const saved = process.env['STRYKER_SHARD'];
    process.env['STRYKER_SHARD'] = 'units';
    try {
      const url = `${pathToFileURL(fromRoot('packages/core/stryker.config.mjs')).href}?shard=units`;
      const loaded = (await import(url)) as StrykerModule;
      expect(loaded.default.incrementalFile).toMatch(/-units\.json$/);
    } finally {
      if (saved === undefined) delete process.env['STRYKER_SHARD'];
      else process.env['STRYKER_SHARD'] = saved;
    }
  });
});

describe('mutation shard environment (STRYKER_SHARD)', () => {
  const incrementalFileWith = async (value: string | undefined): Promise<string> => {
    const saved = process.env['STRYKER_SHARD'];
    if (value === undefined) delete process.env['STRYKER_SHARD'];
    else process.env['STRYKER_SHARD'] = value;
    try {
      // the query string defeats the module cache, so the config is evaluated once per value
      const url = `${pathToFileURL(fromRoot('packages/core/stryker.config.mjs')).href}?env=${String(value)}`;
      return ((await import(url)) as StrykerModule).default.incrementalFile;
    } finally {
      if (saved === undefined) delete process.env['STRYKER_SHARD'];
      else process.env['STRYKER_SHARD'] = saved;
    }
  };

  // A CI matrix or a shell can export an empty variable; that means "not set", never a shard named ''.
  it.each([undefined, ''])(
    'treats STRYKER_SHARD=%j as unset and runs all of core',
    async (value) => {
      expect(await incrementalFileWith(value)).toBe(config.incrementalFile);
    },
  );

  it('still selects the shard that the variable names', async () => {
    expect(await incrementalFileWith('format')).toMatch(/-format\.json$/);
  });
});

// PR 10 review RES-5 and PR 11 validator D5: coverage alone let a surviving `month === 2` mutant
// through `defineMaterial`, so the data package is mutation-tested like core, as one shard.
describe('data mutation shard (quality-gates › Mutation gate, task 12.10c)', () => {
  const dataSrc = fromRoot('packages/data/src');
  const sources = readdirSync(dataSrc, { recursive: true })
    .map(String)
    .filter((path) => path.endsWith('.ts') && !/\.test(-d)?\.ts$/.test(path))
    .filter((path) => !/(^|\/)index\.ts$/.test(path) && !path.startsWith('__testing__/'))
    .map((path) => `src/${path}`);
  const options = dataModule.default;

  it('is the one shard named data', () => {
    expect(dataModule.shardNames).toEqual(['data']);
    expect(module_.shardNames).not.toContain('data');
  });

  it('mutates every source of the package and not its tests, test support or barrels', () => {
    expect(sources).toContain('src/material.ts');
    const exclusions = config.mutate.filter((glob) => glob.startsWith('!'));
    expect(options.mutate).toEqual(['src/**/*.ts', ...exclusions]);
    const matched = globSync('src/**/*.ts', { cwd: fromRoot('packages/data') });
    expect(sources.every((path) => matched.includes(path))).toBe(true);
  });

  it('runs the whole data suite with the same flags as core, in its own package directory', () => {
    expect(options.commandRunner.command).toBe(config.commandRunner.command);
    expect(options.commandRunner.command).not.toContain(' src/');
    expect(options.incrementalFile).toMatch(
      /^reports\/stryker-incremental-[0-9a-f]{16}-data\.json$/,
    );
    expect(options.htmlReporter.fileName).toBe('reports/mutation/data/index.html');
    expect(options.jsonReporter.fileName).toBe('reports/mutation/data/mutation.json');
  });

  it('shares the gate options with core: runner, thresholds, timeouts and reporters', () => {
    const own = ['mutate', 'commandRunner', 'incrementalFile', 'htmlReporter', 'jsonReporter'];
    const shared = (source: StrykerConfig) =>
      Object.fromEntries(Object.entries(source).filter(([key]) => !own.includes(key)));
    expect(shared(options)).toEqual(shared(config));
    expect(options.thresholds).toEqual({ high: 95, low: 90, break: 90 });
  });

  // The data tests import the core sources, so a core change can change a verdict: the report
  // is named after the sources of both packages, and the CI key (a superset) covers them too.
  it('keys its report by its own inputs and by every source of core', () => {
    const files = dataModule.incrementalIdentityFiles;
    for (const input of [
      'src/material.ts',
      'src/material.test.ts',
      'stryker.config.mjs',
      'vitest.config.ts',
      'package.json',
      '../core/src/rational/rational.ts',
      '../core/src/units/quantity.ts',
      '../core/package.json',
      '../../package-lock.json',
      '../../tooling/stryker.mjs',
    ]) {
      expect(files, input).toContain(input);
    }
    expect(files).toEqual([...files].sort());
  });

  it('is run by the root script, which lists it after the core shards', () => {
    const { stdout } = spawnSync(process.execPath, [fromRoot('scripts/mutation.mjs'), '--list'], {
      cwd: fromRoot(),
      encoding: 'utf8',
    });
    expect(stdout.trim().split('\n').at(-1)).toBe('data');
    expect(scripts('packages/data/package.json')['mutation']).toBe('stryker run');
  });
});

describe('mutation runner script (scripts/mutation.mjs)', () => {
  interface Runner {
    selectShards: (argv: string[], names: string[]) => string[];
  }
  const run = (...args: string[]): { status: number | null; stdout: string; stderr: string } =>
    spawnSync(process.execPath, [fromRoot('scripts/mutation.mjs'), ...args], {
      cwd: fromRoot(),
      encoding: 'utf8',
    });

  it('lists the shards and rejects an unknown one without running Stryker', () => {
    expect(run('--list').stdout.trim().split('\n')).toEqual([
      ...module_.shardNames,
      ...dataModule.shardNames,
    ]);
    const bad = run('--shard', 'nope');
    expect(bad.status).toBe(1);
    expect(bad.stderr).toMatch(/unknown mutation shard: nope/);
  });

  it('validates --shard before listing and rejects more than one', () => {
    const listed = run('--list', '--shard', 'nope');
    expect(listed.status).toBe(1);
    expect(listed.stderr).toMatch(/unknown mutation shard: nope/);
    const twice = run('--shard', 'rational', '--shard=format');
    expect(twice.status).toBe(1);
    expect(twice.stderr).toMatch(/only one --shard/);
  });

  // A typo such as `--shards` or `--lst` used to run every shard silently (A5/B-6).
  it('rejects an unknown argument without running Stryker', () => {
    for (const argument of ['--bogus', '--shards', 'rational', '-l']) {
      const result = run(argument);
      expect(result.status, argument).toBe(1);
      expect(result.stderr, argument).toContain(`unknown argument: ${argument}`);
    }
    const mixed = run('--shard', 'rational', '--bogus');
    expect(mixed.status).toBe(1);
    expect(mixed.stderr).toContain('unknown argument: --bogus');
  });

  // Each shard runs in the package that declares it (core for the first seven, data for `data`).
  it('maps every shard to the package that declares it, and refuses a name declared twice', async () => {
    const { loadShardOwners } = await importFromRoot<{
      loadShardOwners: (root: string) => Promise<Map<string, string>>;
    }>('scripts/mutation.mjs');
    const owners = await loadShardOwners(fromRoot());
    expect(owners.get('rational')).toBe(fromRoot('packages/core'));
    expect(owners.get('data')).toBe(fromRoot('packages/data'));
    expect([...owners.keys()]).toEqual([...module_.shardNames, ...dataModule.shardNames]);
    // the discovery is the directory scan itself: no package with a config can be left out
    const withConfig = readdirSync(fromRoot('packages')).filter((name) =>
      existsSync(fromRoot('packages', name, 'stryker.config.mjs')),
    );
    expect(withConfig.sort()).toEqual(['core', 'data']);
    expect(new Set(owners.values())).toEqual(
      new Set(withConfig.map((name) => fromRoot('packages', name))),
    );

    const root = mkdtempSync(join(tmpdir(), 'mutation-owners-'));
    try {
      for (const name of ['alpha', 'beta']) {
        mkdirSync(join(root, 'packages', name), { recursive: true });
        writeFileSync(
          join(root, 'packages', name, 'stryker.config.mjs'),
          "export const shardNames = ['same'];\n",
        );
      }
      await expect(loadShardOwners(root)).rejects.toThrow('mutation shard declared twice: same');
    } finally {
      rmSync(root, { recursive: true });
    }
  });

  // PR 12 review RES-8: a package is found by its config, not by a name kept in the script, and a
  // package with no config (i18n today) is simply not a mutation package. A fresh root per test:
  // Node caches an imported config by its path.
  it('discovers the packages that have a Stryker config, in name order', async () => {
    const { loadShardOwners } = await importFromRoot<{
      loadShardOwners: (root: string) => Promise<Map<string, string>>;
    }>('scripts/mutation.mjs');
    const root = mkdtempSync(join(tmpdir(), 'mutation-discovery-'));
    try {
      for (const [name, shard] of [
        ['zeta', 'last'],
        ['alpha', 'first'],
      ] as const) {
        mkdirSync(join(root, 'packages', name), { recursive: true });
        writeFileSync(
          join(root, 'packages', name, 'stryker.config.mjs'),
          `export const shardNames = ['${shard}'];\n`,
        );
      }
      mkdirSync(join(root, 'packages', 'no-config'));
      writeFileSync(join(root, 'packages', 'stray-file.txt'), '');
      expect([...(await loadShardOwners(root))]).toEqual([
        ['first', join(root, 'packages', 'alpha')],
        ['last', join(root, 'packages', 'zeta')],
      ]);
    } finally {
      rmSync(root, { recursive: true });
    }
  });

  it('accepts exactly --list, --shard <name> and --shard=<name>', async () => {
    const { selectShards } = await importFromRoot<Runner>('scripts/mutation.mjs');
    const names = ['a', 'b'];
    expect(selectShards(['--list'], names)).toEqual(names);
    expect(selectShards(['--list', '--shard', 'b'], names)).toEqual(['b']);
    expect(selectShards(['--shard=a', '--list'], names)).toEqual(['a']);
    expect(() => selectShards(['--shard', 'a', 'b'], names)).toThrow(/unknown argument: b/);
    expect(() => selectShards(['--shard=a', '--list=1'], names)).toThrow(
      /unknown argument: --list=1/,
    );
  });

  it('selects every shard by default and exactly one with --shard', async () => {
    const { selectShards } = await importFromRoot<Runner>('scripts/mutation.mjs');
    const names = ['a', 'b', 'c'];
    expect(selectShards([], names)).toEqual(names);
    expect(selectShards(['--shard', 'b'], names)).toEqual(['b']);
    expect(selectShards(['--shard=c'], names)).toEqual(['c']);
    expect(() => selectShards(['--shard'], names)).toThrow(/--shard needs a name/);
    expect(() => selectShards(['--shard', 'z'], names)).toThrow(/unknown mutation shard: z/);
  });
});

// The gate excludes barrels from mutation and honors `Stryker disable` pragmas, so both are
// policed: a pragma can hide a real survivor and a barrel with logic would escape the gate.
describe('mutation gate escape hatches (quality-gates › Mutation gate on core)', () => {
  const sourceFiles = readdirSync(fromRoot('packages/core/src'), { recursive: true })
    .map(String)
    .filter((path) => path.endsWith('.ts'));
  const read = (path: string): string => readFileSync(fromRoot('packages/core/src', path), 'utf8');

  // design: no equivalent mutant is left (the sign test is `value <= -1n`, so each operator
  // mutant is killed by a negative, zero or positive case); any pragma would need a new audit.
  it('allows no Stryker disable pragma', () => {
    const pragmas = sourceFiles.flatMap((path) =>
      read(path)
        .split('\n')
        .filter((line) => /Stryker\s+disable/.test(line))
        .map((line) => ({ path, line: line.trim() })),
    );
    expect(pragmas).toEqual([]);
  });

  // design: barrels are excluded from mutation, so they may only re-export
  it('keeps every barrel to export-from lines', () => {
    const barrels = sourceFiles.filter((path) => path === 'index.ts' || path.endsWith('/index.ts'));
    expect(barrels.length).toBeGreaterThan(1);
    for (const path of barrels) {
      const remainder = read(path).replace(
        /^export\s+(?:type\s+)?(?:\*|\{[^}]*\})\s+from\s+'[^']+';$/gm,
        '',
      );
      expect(remainder.trim(), path).toBe('');
    }
  });
});

// design: `__STRYKER__` is the vitest define that drops property runs to 50, and only the exact
// flag value 1 turns it on (`STRYKER=0` or an empty value must not).
describe('core vitest config STRYKER flag (quality-gates › Mutation gate on core)', () => {
  const definedFlag = async (value: string | undefined): Promise<unknown> => {
    const saved = process.env['STRYKER'];
    if (value === undefined) delete process.env['STRYKER'];
    else process.env['STRYKER'] = value;
    try {
      // the query string defeats the module cache, so the config is evaluated once per value
      const url = `${pathToFileURL(fromRoot('packages/core/vitest.config.ts')).href}?flag=${String(value)}`;
      const loaded = (await import(url)) as { default: { define: Record<string, unknown> } };
      return loaded.default.define['__STRYKER__'];
    } finally {
      if (saved === undefined) delete process.env['STRYKER'];
      else process.env['STRYKER'] = saved;
    }
  };

  it('is true only when STRYKER is exactly 1', async () => {
    expect(await definedFlag('1')).toBe(true);
    expect(await definedFlag('0')).toBe(false);
    expect(await definedFlag('')).toBe(false);
    expect(await definedFlag(undefined)).toBe(false);
  });
});
