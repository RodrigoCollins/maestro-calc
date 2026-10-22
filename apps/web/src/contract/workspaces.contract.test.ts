import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot, repoRoot } from './root.ts';

interface Workspaces {
  packageNames: (root: string) => string[];
  workspaceDirs: (root: string) => string[];
}

const { packageNames, workspaceDirs } = await importFromRoot<Workspaces>('tooling/workspaces.js');

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
