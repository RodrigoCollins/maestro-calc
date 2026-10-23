import { existsSync, globSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

interface Shard {
  mutate: string[];
  tests?: string[];
  deps: string[];
}

interface PackageConfig {
  shards: Record<string, Shard>;
  shardNames: string[];
  identityFilesFor: (shard: string) => string[];
  optionsFor?: (shard: string) => { incrementalFile: string };
}

const core = await importFromRoot<PackageConfig>('packages/core/stryker.config.mjs');
const data = await importFromRoot<PackageConfig>('packages/data/stryker.config.mjs');

const coreRoot = fromRoot('packages/core');
const dataRoot = fromRoot('packages/data');

/** Every core file a shard mutates or runs: the positive mutate globs and the tests. */
const ownFilesOf = (shard: Shard): string[] => {
  const mutated = shard.mutate
    .filter((glob) => !glob.startsWith('!'))
    .flatMap((glob) => globSync(glob, { cwd: coreRoot }));
  const tests = (shard.tests ?? []).flatMap((path) =>
    path.endsWith('.ts') ? [path] : globSync(`${path}/**/*.test.ts`, { cwd: coreRoot }),
  );
  return [...mutated, ...tests]
    .filter((path) => path.endsWith('.ts') && !path.endsWith('.d.ts'))
    .map((path) => resolve(coreRoot, path));
};

describe('core shard identities (quality-gates › Mutation gate on core, design D10)', () => {
  const identity = (name: string): string[] => core.identityFilesFor(name);
  const others = (name: string): string[] => core.shardNames.filter((other) => other !== name);

  it('holds the sources, the tests and the shared files of the shard itself', () => {
    for (const name of core.shardNames) {
      const files = identity(name);
      const shard = core.shards[name];
      expect(shard, name).toBeDefined();
      for (const file of ownFilesOf(shard ?? { mutate: [], deps: [] })) {
        expect(files, `${name} holds ${relative(coreRoot, file)}`).toContain(
          relative(coreRoot, file),
        );
      }
      for (const input of ['stryker.config.mjs', '../../tooling/stryker.mjs', '../../.nvmrc']) {
        expect(files, `${name} holds ${input}`).toContain(input);
      }
      expect(files).toEqual([...files].sort());
    }
  });

  // The point of the change: calculators grow with the catalog, and a calculator PR must cold the
  // `calculators` shard and nothing else.
  it('puts the calculators and the released snapshot in the identity of `calculators` alone', () => {
    const calculatorFiles = [
      'src/calculators/rectangle-area/rectangle-area.ts',
      'src/calculators/rectangle-area/rectangle-area.test.ts',
      'src/calculators/released.contract.test.ts',
      'src/__testing__/released-snapshot.ts',
    ];
    for (const file of calculatorFiles) {
      expect(identity('calculators'), file).toContain(file);
      for (const name of others('calculators')) {
        expect(identity(name), `${name} must not hold ${file}`).not.toContain(file);
      }
    }
  });

  it('keeps the sources of the other shards in step with their own tests, not in `calculators`', () => {
    expect(identity('url')).toContain('src/url/codec.ts');
    expect(identity('calculators')).toContain('src/url/codec.ts');
    expect(identity('rational')).not.toContain('src/url/codec.ts');
    expect(identity('format')).toContain('src/rational/rational.ts');
    expect(identity('rational')).toContain('src/rational/rational.ts');
  });

  it('names each report after its own inputs: a calculator edit changes one hash, not the others', () => {
    const hashOf = (name: string): string | undefined =>
      /stryker-incremental-([0-9a-f]{16})-/.exec(
        core.optionsFor?.(name).incrementalFile ?? '',
      )?.[1];
    expect(hashOf('calculators')).toMatch(/^[0-9a-f]{16}$/);
    expect(hashOf('calculators')).not.toBe(hashOf('rational'));
    // shards with the same inputs share a hash; the shard suffix keeps their report files apart
    expect(hashOf('rational')).toBe(hashOf('units'));
    expect(hashOf('url')).not.toBe(hashOf('rational'));
  });
});

// The identity is only sound if it covers what the shard really executes, so it is checked against
// the import graph read from the files, never against a list written beside them.
type Exports = Record<string, string>;

const WORKSPACE_ROOTS: Record<string, string> = {
  '@maestro-calc/core': 'packages/core',
  '@maestro-calc/data': 'packages/data',
  '@maestro-calc/i18n': 'packages/i18n',
};

const exportsOf = (packageRoot: string): Exports =>
  (JSON.parse(readFileSync(fromRoot(packageRoot, 'package.json'), 'utf8')) as { exports: Exports })
    .exports;

/** The file a workspace import resolves to through the `exports` of its package, or throws. */
const resolveWorkspace = (specifier: string): string => {
  const name = specifier.split('/').slice(0, 2).join('/');
  const root = WORKSPACE_ROOTS[name];
  if (root === undefined) throw new Error(`unknown workspace import: ${specifier}`);
  const subpath = `.${specifier.slice(name.length)}`;
  const entries = exportsOf(root);
  const exact = entries[subpath];
  if (exact !== undefined) return fromRoot(root, exact);
  for (const [pattern, target] of Object.entries(entries)) {
    const [head, tail] = pattern.split('*');
    if (tail === undefined || head === undefined) continue;
    if (subpath.startsWith(head) && subpath.endsWith(tail) && subpath.length > pattern.length - 1) {
      const star = subpath.slice(head.length, subpath.length - tail.length);
      return fromRoot(root, target.replace('*', star));
    }
  }
  throw new Error(`${specifier} matches no export of ${name}`);
};

const importsOf = (file: string): string[] =>
  ts.preProcessFile(readFileSync(file, 'utf8'), true, true).importedFiles.map((i) => i.fileName);

/**
 * Every file reachable from `starts` through relative and workspace imports. Third-party and
 * `node:` imports are not part of the repository and end the walk. A file in `leaves` is counted
 * but not read, and an import that resolves to no file fails the test instead of being skipped.
 */
const closureOf = (starts: readonly string[], leaves: readonly string[] = []): Set<string> => {
  const seen = new Set<string>();
  const todo = [...starts];
  for (let file = todo.pop(); file !== undefined; file = todo.pop()) {
    if (seen.has(file)) continue;
    seen.add(file);
    if (leaves.includes(file)) continue;
    for (const specifier of importsOf(file)) {
      if (specifier.startsWith('.')) {
        const target = resolve(dirname(file), specifier);
        if (!existsSync(target)) {
          throw new Error(`${relative(fromRoot(), file)} imports ${specifier}, which is no file`);
        }
        todo.push(target);
      } else if (specifier.startsWith('@maestro-calc/')) {
        todo.push(resolveWorkspace(specifier));
      }
    }
  }
  return seen;
};

describe('shard identity against the import graph (design D10, fail closed)', () => {
  // `src/index.test.ts` only pins the names the root barrel exports, and a barrel is nothing but
  // `export … from` lines, so the barrel is read for its own text and not followed: every module
  // behind it that a shard really runs is reached through the imports of its own tests.
  const rootBarrel = resolve(coreRoot, 'src/index.ts');

  it.each(core.shardNames)(
    '%s: every file its sources and tests import is in its identity',
    (name) => {
      const shard = core.shards[name];
      const files = new Set(core.identityFilesFor(name));
      const reached = [...closureOf(ownFilesOf(shard ?? { mutate: [], deps: [] }), [rootBarrel])];
      expect(reached.length).toBeGreaterThan(10);
      const missing = reached
        .map((file) => relative(coreRoot, file))
        .filter((path) => !files.has(path));
      expect(missing).toEqual([]);
    },
  );

  // The other direction: the shards that must not move with a calculator really import none, and
  // no test file of them reads the released snapshot.
  it.each(core.shardNames.filter((name) => name !== 'calculators'))(
    '%s: imports no calculator and not the released snapshot',
    (name) => {
      const shard = core.shards[name];
      const reached = [...closureOf(ownFilesOf(shard ?? { mutate: [], deps: [] }), [rootBarrel])];
      const forbidden = reached
        .map((file) => relative(coreRoot, file))
        .filter(
          (path) =>
            path.startsWith('src/calculators/') || path === 'src/__testing__/released-snapshot.ts',
        );
      expect(forbidden).toEqual([]);
    },
  );

  it('walks the graph: a probe import chain is followed and a missing file fails', () => {
    const dir = mkdtempSync(join(tmpdir(), 'closure-'));
    try {
      writeFileSync(join(dir, 'a.ts'), "import { b } from './b.ts';\nexport const a = b;\n");
      writeFileSync(join(dir, 'b.ts'), "export * from './c.ts';\nimport 'vitest';\n");
      writeFileSync(join(dir, 'c.ts'), 'export const b = 1;\n');
      expect([...closureOf([join(dir, 'a.ts')])].map((file) => relative(dir, file)).sort()).toEqual(
        ['a.ts', 'b.ts', 'c.ts'],
      );
      expect([...closureOf([join(dir, 'a.ts')], [join(dir, 'b.ts')])].length).toBe(2);
      writeFileSync(join(dir, 'c.ts'), "import './gone.ts';\n");
      expect(() => closureOf([join(dir, 'a.ts')])).toThrow(/gone\.ts, which is no file/);
    } finally {
      rmSync(dir, { recursive: true });
    }
  });

  // The data tests run the real core beside the mutated data sources, so the identity of the data
  // shard holds every core file that `@maestro-calc/core` reaches (barrels followed).
  it('data: every core file its sources and tests reach is in its identity', () => {
    const own = globSync('src/**/*.ts', { cwd: dataRoot }).map((path) => resolve(dataRoot, path));
    expect(own.length).toBeGreaterThan(2);
    const files = new Set(data.identityFilesFor('data'));
    const missing = [...closureOf(own)]
      .map((file) => relative(dataRoot, file))
      .filter((path) => !files.has(path));
    expect(missing).toEqual([]);
    expect([...files].some((path) => path.startsWith('../core/src/calculators/'))).toBe(false);
  });
});
