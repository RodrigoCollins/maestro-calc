import { describe, expect, it } from 'vitest';
import { readJsonc } from '../__testing__/jsonc.ts';
import { fromRoot } from './root.ts';
import { assetsProblems } from './wrangler-e2e.ts';
import type { ConfigDirs, WranglerConfig } from './wrangler-e2e.ts';

const dirs: ConfigDirs = { root: fromRoot(), e2e: fromRoot('tooling/site-browser') };
const root = readJsonc('wrangler.jsonc') as WranglerConfig;
const e2e = readJsonc('tooling/site-browser/wrangler.e2e.jsonc') as WranglerConfig;

describe('wrangler.e2e.jsonc serves what the root config serves (site-quality › Workers rows)', () => {
  it('agrees with the root wrangler.jsonc on rules, directory, name and date', () => {
    expect(assetsProblems(root, e2e, dirs)).toEqual([]);
  });

  // the root directory is ./apps/web/dist and the e2e one is ../../apps/web/dist: resolved, not equal text
  it('compares resolved directories, not their text', () => {
    expect(root.assets?.directory).toBe('./apps/web/dist');
    expect(e2e.assets?.directory).toBe('../../apps/web/dist');
    expect(e2e.build).toBeUndefined();
  });

  it('names a different served directory', () => {
    const wrong = { ...e2e, assets: { ...e2e.assets, directory: '../../apps/web/dist2' } };
    expect(assetsProblems(root, wrong, dirs)).toEqual([
      `assets.directory resolves to ${fromRoot('apps/web/dist2')}, not ${fromRoot('apps/web/dist')}`,
    ]);
  });

  it('names every other difference', () => {
    const wrong: WranglerConfig = {
      name: 'other',
      compatibility_date: '2020-01-01',
      build: { command: 'npm run build' },
      assets: {
        directory: '../../apps/web/dist',
        html_handling: 'auto-trailing-slash',
        not_found_handling: 'single-page-application',
      },
    };
    expect(assetsProblems(root, wrong, dirs)).toEqual([
      'html_handling differs',
      'not_found_handling differs',
      'the e2e config must have no build command',
      'name differs',
      'compatibility_date differs',
    ]);
  });
});
