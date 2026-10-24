import { existsSync, globSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { readJsonc } from '../__testing__/jsonc.ts';
import { fromRoot } from './root.ts';

interface Manifest {
  private?: boolean;
  workspaces?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const readManifest = (dir: string): Manifest =>
  JSON.parse(readFileSync(fromRoot(dir, 'package.json'), 'utf8')) as Manifest;

const toolingDir = 'tooling/site-browser';
const browserPackages = ['wrangler', '@playwright/test', '@axe-core/playwright'];

describe('browser tooling stays out of the workspaces (monorepo-workspace › [MWW1], [MWW2])', () => {
  // spec: monorepo-workspace › [MWW1]
  it('names no browser tool in any packages/* manifest', () => {
    const manifests = globSync('packages/*/package.json', { cwd: fromRoot() });
    expect(manifests.length).toBeGreaterThan(0);
    for (const manifest of manifests) {
      expect(readFileSync(fromRoot(manifest), 'utf8'), manifest).not.toMatch(
        /playwright|axe-core|lhci|wrangler/,
      );
    }
  });

  it('gives packages/core no runtime dependency at all', () => {
    expect(readManifest('packages/core').dependencies).toBeUndefined();
  });

  // spec: monorepo-workspace › [MWW2]
  it('does not list the tooling package as a workspace', () => {
    expect(readManifest('.').workspaces).not.toContain(toolingDir);
    expect(readManifest('.').workspaces).not.toContain('tooling/*');
  });

  it('is a private package with exact pins and its own lockfile', () => {
    const manifest = readManifest(toolingDir);
    expect(manifest.private).toBe(true);
    for (const name of browserPackages) {
      expect(manifest.devDependencies?.[name], name).toMatch(/^\d+\.\d+\.\d+$/);
    }
    expect(existsSync(fromRoot(toolingDir, 'package-lock.json'))).toBe(true);
  });

  it('keeps every browser tool out of the root lockfile', () => {
    const lock = readFileSync(fromRoot('package-lock.json'), 'utf8');
    for (const name of browserPackages) {
      expect(lock, name).not.toContain(`"node_modules/${name}"`);
    }
    expect(lock).not.toContain('"node_modules/playwright-core"');
  });

  it('installs no browser in the verify job', () => {
    const workflow = parse(readFileSync(fromRoot('.github/workflows/ci.yml'), 'utf8')) as {
      jobs: Record<string, { steps: { run?: string }[] }>;
    };
    const runs = (workflow.jobs['verify']?.steps ?? []).flatMap((step) =>
      step.run === undefined ? [] : [step.run],
    );
    expect(runs.length).toBeGreaterThan(0);
    expect(runs.filter((run) => run.includes('playwright'))).toEqual([]);
  });
});

describe('dependency updates cover the second lockfile', () => {
  it('has a weekly npm entry for the tooling directory with a playwright group', () => {
    const config = parse(readFileSync(fromRoot('.github/dependabot.yml'), 'utf8')) as {
      updates: {
        'package-ecosystem': string;
        directory: string;
        schedule: { interval: string };
        groups?: Record<string, { patterns: string[] }>;
      }[];
    };
    const entry = config.updates.find(
      (update) => update['package-ecosystem'] === 'npm' && update.directory === `/${toolingDir}`,
    );
    expect(entry?.schedule.interval).toBe('weekly');
    expect(entry?.groups?.['playwright']?.patterns).toEqual(['@playwright/*', 'playwright*']);
  });
});

describe('tooling tsconfig', () => {
  const config = readJsonc(`${toolingDir}/tsconfig.json`) as {
    extends: string;
    include: string[];
    compilerOptions: { paths: Record<string, string[]> };
  };

  it('extends the base config and covers the specs and the root TypeScript configs', () => {
    expect(config.extends).toBe('../../tsconfig.base.json');
    expect(config.include).toEqual(['e2e', '*.ts']);
  });

  // so the type-only import in apps/web/src/routing/routes.ts resolves without a root install
  it('maps @maestro-calc/i18n to its source through paths', () => {
    expect(config.compilerOptions.paths['@maestro-calc/i18n']).toEqual([
      '../../packages/i18n/src/index.ts',
    ]);
  });
});
