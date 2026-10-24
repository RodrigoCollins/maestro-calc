import { readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

const loadThresholds = async (): Promise<Record<string, unknown>> => {
  const config = await importFromRoot<{
    default: { test: { coverage: { thresholds: Record<string, unknown> } } };
  }>('vitest.config.ts');
  return config.default.test.coverage.thresholds;
};

const all = (value: number) => ({
  lines: value,
  branches: value,
  functions: value,
  statements: value,
});

const packageNames = readdirSync(fromRoot('packages'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe('coverage thresholds (quality-gates › Coverage gate)', () => {
  // spec: Coverage thresholds cover every package [QG8, QG10]
  it.each(packageNames)('packages/%s has a threshold glob', async (name) => {
    expect(Object.keys(await loadThresholds())).toContain(`packages/${name}/src/**`);
  });

  // spec: core is held to 100 percent, other packages and the fallback to 90 [QG8, QG10]
  it.each([
    ['packages/core/src/**', 100],
    ['packages/data/src/**', 90],
    ['packages/i18n/src/**', 90],
  ])('%s requires %i on every metric', async (glob, value) => {
    expect((await loadThresholds())[glob]).toEqual(all(value));
  });

  // spec: quality-gates › Coverage gate for the web helpers: pure routing, SEO and built-HTML check code is held to 100
  it.each(['apps/web/src/routing/**', 'apps/web/src/seo/**', 'apps/web/src/site-check/**'])(
    '%s is covered and requires 100 on every metric',
    async (glob) => {
      const config = await importFromRoot<{
        default: { test: { coverage: { include: string[] } } };
      }>('vitest.config.ts');
      expect(config.default.test.coverage.include).toContain(glob);
      expect((await loadThresholds())[glob]).toEqual(all(100));
    },
  );

  it('sets a global fallback of 90 on every metric', async () => {
    expect(await loadThresholds()).toMatchObject(all(90));
  });
});
