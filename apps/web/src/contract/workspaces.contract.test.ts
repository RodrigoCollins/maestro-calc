import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot, repoRoot } from './root.ts';

interface Workspaces {
  packageNames: (root: string) => string[];
  workspaceDirs: (root: string) => string[];
  packageGlobs: (root: string, tail: string) => string[];
}

const { packageNames, workspaceDirs, packageGlobs } =
  await importFromRoot<Workspaces>('tooling/workspaces.js');

const onDisk = readdirSync(fromRoot('packages'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe('workspace list (monorepo-workspace › Workspace enumeration)', () => {
  // spec: Workspace enumeration [MW2]
  it('derives the package list from the packages directory', () => {
    expect(packageNames(repoRoot)).toEqual([...onDisk].sort());
  });

  it('picks up a new package without any configuration edit', () => {
    const temp = mkdtempSync(join(tmpdir(), 'maestro-ws-'));
    try {
      mkdirSync(join(temp, 'packages', 'extra'), { recursive: true });
      mkdirSync(join(temp, 'apps', 'site'), { recursive: true });
      expect(workspaceDirs(temp)).toEqual(['packages/extra', 'apps/site']);
    } finally {
      rmSync(temp, { recursive: true });
    }
  });

  // Judgment Day F2: a brace glob over one package (`packages/{core}`) or none (`packages/{}`)
  // matches nothing, silently disabling every rule scoped to it.
  describe('packageGlobs', () => {
    const withPackages = (names: string[], check: (root: string) => void): void => {
      const temp = mkdtempSync(join(tmpdir(), 'maestro-globs-'));
      try {
        mkdirSync(join(temp, 'packages'), { recursive: true });
        for (const name of names) mkdirSync(join(temp, 'packages', name));
        check(temp);
      } finally {
        rmSync(temp, { recursive: true });
      }
    };

    it('returns one literal glob per package, never a brace group', () => {
      withPackages(['core', 'data'], (root) => {
        expect(packageGlobs(root, 'src/**')).toEqual([
          'packages/core/src/**',
          'packages/data/src/**',
        ]);
      });
    });

    it('returns a literal glob for a repository with a single package', () => {
      withPackages(['core'], (root) => {
        expect(packageGlobs(root, 'src/**')).toEqual(['packages/core/src/**']);
      });
    });

    it('fails loudly when there is no package to scope rules to', () => {
      withPackages([], (root) => {
        expect(() => packageGlobs(root, 'src/**')).toThrow(/no packages/i);
      });
    });
  });

  // spec: Compiler options inherited [MW13]
  it.each(onDisk)('packages/%s has separate src and test programs', (name) => {
    for (const file of ['tsconfig.src.json', 'tsconfig.test.json']) {
      expect(existsSync(fromRoot('packages', name, file)), `${name}/${file}`).toBe(true);
    }
  });

  // design: every derived workspace is covered by the lint blocks
  it.each(workspaceDirs(repoRoot))(
    '%s sources receive the dependency declaration rule',
    async (dir) => {
      const eslint = new ESLint({ cwd: repoRoot });
      const config = (await eslint.calculateConfigForFile(fromRoot(dir, 'src', 'x.ts'))) as {
        rules: Record<string, unknown>;
      };
      expect(config.rules['import-x/no-extraneous-dependencies']).toBeDefined();
    },
  );
});
