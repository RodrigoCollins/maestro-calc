import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

const loadThresholds = async (): Promise<Record<string, unknown>> => {
  const config = await importFromRoot<{
    default: { test: { coverage: { thresholds: Record<string, unknown> } } };
  }>('vitest.config.ts');
  return config.default.test.coverage.thresholds;
};

describe('coverage thresholds (quality-gates › Coverage gate)', () => {
  // spec: Coverage thresholds cover every package [QG8, QG10]
  it.each(readdirSync(fromRoot('packages')))('packages/%s has a threshold glob', async (name) => {
    expect(Object.keys(await loadThresholds())).toContain(`packages/${name}/src/**`);
  });

  it('sets a global fallback threshold for files no glob covers', async () => {
    expect(await loadThresholds()).toMatchObject({ lines: 90, branches: 90 });
  });
});
