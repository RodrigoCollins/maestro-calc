import { globSync, lstatSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { fromRoot, importFromRoot } from './root.ts';

interface PackageConfig {
  shardNames: string[];
  identityFilesFor: (shard: string) => string[];
}

const core = await importFromRoot<PackageConfig>('packages/core/stryker.config.mjs');
const data = await importFromRoot<PackageConfig>('packages/data/stryker.config.mjs');

const hasDotSegment = (path: string): boolean =>
  path.split('/').some((part) => part.startsWith('.'));

interface Entry {
  shard: string;
  inputs: string;
}

interface Workflow {
  jobs: {
    mutation: {
      strategy: { matrix: { include: Entry[] } };
      steps: { run?: string }[];
    };
  };
}

const workflow = parse(readFileSync(fromRoot('.github/workflows/ci.yml'), 'utf8')) as Workflow;
const mutationJob = workflow.jobs.mutation;
const keyStep = mutationJob.steps.find((step) => step.run?.includes('hashFiles('));

describe('CI cache key per shard (design D10, quality-gates › Mutation job always runs incrementally)', () => {
  const entries = mutationJob.strategy.matrix.include;
  const quoted = [
    ...(/hashFiles\(([^)]*)\)/.exec(keyStep?.run ?? '')?.[1] ?? '').matchAll(/'([^']+)'/g),
  ].map((match) => match[1] ?? '');
  const lines = (entry: Entry): string[] =>
    entry.inputs
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');

  /** The files `hashFiles` would hash for this entry: its own globs and the key step's. */
  const hashed = (entry: Entry): string[] =>
    [
      ...new Set(
        [...lines(entry), ...quoted]
          .flatMap((glob) => globSync(glob, { cwd: fromRoot() }))
          .filter((path) => lstatSync(fromRoot(path)).isFile())
          .filter((path) => !/^packages\/[^/]+\/src\//.test(path) || !hasDotSegment(path)),
      ),
    ].sort();

  const identity = (entry: Entry): string[] => {
    const [packageName, config]: [string, PackageConfig] = core.shardNames.includes(entry.shard)
      ? ['core', core]
      : ['data', data];
    return [
      ...new Set(
        config
          .identityFilesFor(entry.shard)
          .map((path) => relative(fromRoot(), fromRoot('packages', packageName, path))),
      ),
    ].sort();
  };

  it('has one entry per Stryker shard, in the order of the configs', () => {
    expect(entries.map(({ shard }) => shard)).toEqual([...core.shardNames, ...data.shardNames]);
  });

  it('hashes the key step globs and the entry inputs, nothing else', () => {
    expect(keyStep?.run).toContain('hashFiles(matrix.inputs,');
    expect(quoted).toEqual([
      'vitest.config.ts',
      'tooling/stryker.mjs',
      'tsconfig.base.json',
      '.nvmrc',
      'package-lock.json',
    ]);
  });

  // The kernel shards hold the codec behind the root barrel (design W1), so CI must hash it too.
  it.each(['rational', 'units', 'format', 'calculator-define', 'calculator-run'])(
    '%s: the matrix inputs hash the URL codec',
    (shard) => {
      const entry = entries.find((candidate) => candidate.shard === shard);
      expect(lines(entry ?? { shard, inputs: '' })).toContain('packages/core/src/url/**');
    },
  );

  // A file hashed by CI but not by the config would let a local run reuse a stale report; a file
  // hashed by the config but not by CI would let an exact cache hit restore a report for other inputs.
  it.each([...core.shardNames, ...data.shardNames])(
    '%s: CI hashes exactly the files that name its report',
    (shard) => {
      const entry = entries.find((candidate) => candidate.shard === shard);
      expect(entry, shard).toBeDefined();
      if (entry === undefined) return;
      expect(hashed(entry)).toEqual(identity(entry));
    },
  );
});
