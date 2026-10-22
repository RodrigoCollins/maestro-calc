import {
  existsSync,
  globSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
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
  timeoutMS: number;
  timeoutFactor: number;
  concurrency: number;
  thresholds: { high: number; low: number; break: number };
}

interface StrykerModule {
  default: StrykerConfig;
  incrementalIdentityFiles: string[];
  pruneStaleReports: (reportsDirectory: string, keepFile: string) => void;
}

const readJson = (relativePath: string): unknown =>
  JSON.parse(readFileSync(fromRoot(relativePath), 'utf8'));

const module_ = await importFromRoot<StrykerModule>('packages/core/stryker.config.mjs');
const config = module_.default;
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
  // them also avoids the sandbox `extends ../../tsconfig.base.json` path.
  it('runs the whole suite serially with STRYKER set and without type tests', () => {
    expect(config.commandRunner.command).toBe(
      'STRYKER=1 npx --no-install vitest run --no-file-parallelism --typecheck.enabled=false',
    );
  });

  // design: a timeout is an optimistic kill, so the budget is generous and the parallelism fixed
  it('bounds each mutant run and fixes the parallelism', () => {
    expect(config.timeoutMS).toBe(30000);
    expect(config.timeoutFactor).toBe(4);
    expect(config.concurrency).toBe(3);
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
  it('exposes npm run mutation at the root, flagging STRYKER and delegating to core', () => {
    expect(scripts('package.json')['mutation']).toBe(
      'STRYKER=1 npm run mutation -w @maestro-calc/core',
    );
    expect(scripts('packages/core/package.json')['mutation']).toBe('stryker run');
  });

  // spec: Score below break [QG11]: the command runner reports no test files, so Stryker cannot
  // tell a test was removed; the report file name therefore carries one hash of every core input.
  it('keys the incremental report by a hash computed once in the Stryker config', () => {
    expect(config.incrementalFile).toMatch(/^reports\/stryker-incremental-[0-9a-f]{16}\.json$/);
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
    ]) {
      expect(files, input).toContain(input);
    }
    expect(files).toEqual([...files].sort());
  });

  // design D10: the CI cache key and the Stryker report name must cover the same inputs. A file
  // hashed by CI but not by the config would let a local run reuse a stale report; a file hashed
  // by the config but not by CI would let an exact cache hit restore a report for other inputs.
  it('hashes exactly the files that the CI cache key hashes', () => {
    const workflow = parse(readFileSync(fromRoot('.github/workflows/ci.yml'), 'utf8')) as {
      jobs: { mutation: { steps: { run?: string }[] } };
    };
    const keyStep = workflow.jobs.mutation.steps.find((step) => step.run?.includes('hashFiles('));
    const expression = /hashFiles\(([^)]*)\)/.exec(keyStep?.run ?? '')?.[1] ?? '';
    const globs = [...expression.matchAll(/'([^']+)'/g)].map((match) => match[1] ?? '');
    expect(globs.length).toBeGreaterThan(4);

    const ciFiles = globs
      .flatMap((glob) => globSync(glob, { cwd: fromRoot() }))
      .filter((path) => statSync(fromRoot(path)).isFile())
      .sort();
    const configFiles = module_.incrementalIdentityFiles
      .map((path) => relative(fromRoot(), fromRoot('packages/core', path)))
      .sort();
    expect(configFiles).toEqual(ciFiles);
  });

  // design D10: only the report that matches the current inputs is useful; older ones pile up in
  // `reports/` locally and in the cache directory.
  it('prunes sibling incremental reports and keeps the current one', () => {
    const directory = mkdtempSync(join(tmpdir(), 'stryker-prune-'));
    try {
      for (const name of [
        'stryker-incremental-aaaaaaaaaaaaaaaa.json',
        'stryker-incremental-bbbbbbbbbbbbbbbb.json',
        'other.json',
      ]) {
        writeFileSync(join(directory, name), '{}');
      }
      mkdirSync(join(directory, 'mutation'));
      module_.pruneStaleReports(directory, 'stryker-incremental-bbbbbbbbbbbbbbbb.json');
      expect(readdirSync(directory).sort()).toEqual([
        'mutation',
        'other.json',
        'stryker-incremental-bbbbbbbbbbbbbbbb.json',
      ]);
    } finally {
      rmSync(directory, { recursive: true });
    }
  });

  it('tolerates a missing reports directory', () => {
    const missing = join(tmpdir(), 'stryker-prune-missing');
    expect(existsSync(missing)).toBe(false);
    expect(() => {
      module_.pruneStaleReports(missing, 'stryker-incremental-bbbbbbbbbbbbbbbb.json');
    }).not.toThrow();
  });
});

// The gate excludes barrels from mutation and honors `Stryker disable` pragmas, so both are
// policed: a pragma can hide a real survivor and a barrel with logic would escape the gate.
describe('mutation gate escape hatches (quality-gates › Mutation gate on core)', () => {
  const sourceFiles = readdirSync(fromRoot('packages/core/src'), { recursive: true })
    .map(String)
    .filter((path) => path.endsWith('.ts'));
  const read = (path: string): string => readFileSync(fromRoot('packages/core/src', path), 'utf8');

  // design: equivalent mutants are suppressed individually, with a reason, and counted here
  it('allows exactly the audited EqualityOperator pragma on the next line', () => {
    const pragmas = sourceFiles.flatMap((path) =>
      read(path)
        .split('\n')
        .filter((line) => /Stryker\s+disable/.test(line))
        .map((line) => ({ path, line: line.trim() })),
    );
    expect(pragmas).toHaveLength(1);
    for (const { path, line } of pragmas) {
      expect(path).toBe('rational/rational.ts');
      expect(line).toMatch(/^\/\/ Stryker disable next-line EqualityOperator: \S.+$/);
    }
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
