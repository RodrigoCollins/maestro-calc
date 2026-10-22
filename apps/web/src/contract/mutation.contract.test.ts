import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

interface StrykerConfig {
  testRunner: string;
  commandRunner: { command: string };
  coverageAnalysis: string;
  checkers?: string[];
  mutate: string[];
  incremental: boolean;
  incrementalFile: string;
  thresholds: { high: number; low: number; break: number };
}

const readJson = (relativePath: string): unknown =>
  JSON.parse(readFileSync(fromRoot(relativePath), 'utf8'));

const config = readJson('packages/core/stryker.config.json') as StrykerConfig;
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
    expect(config.incrementalFile).toBe('reports/stryker-incremental.json');
    expect(config.checkers).toBeUndefined();
  });

  // spec: Equivalent gate on fallback [QG13]: the vitest runner of Stryker 10 filters tests by a
  // name that vitest 5 no longer matches, so no mutant is ever killed; the command runner is the
  // documented fallback and must run the whole core suite.
  it('drives vitest through the command runner without coverage analysis', () => {
    expect(config.testRunner).toBe('command');
    expect(config.commandRunner.command).toMatch(/^npx vitest run\b/);
    expect(config.coverageAnalysis).toBe('off');
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
  });

  // spec: Score below break [QG11]: the command runner reports no test files, so Stryker cannot
  // tell a test was removed; the report file name therefore carries a hash of every core input.
  it('keys the incremental report by a hash of the sources, tests and configuration', () => {
    const script = scripts('packages/core/package.json')['mutation'] ?? '';
    expect(script).toMatch(/^stryker run --incrementalFile reports\/stryker-incremental-\$\(/);
    for (const input of ['src', 'stryker.config.json', 'vitest.config.ts']) {
      expect(script, input).toContain(input);
    }
  });
});
