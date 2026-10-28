import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

/**
 * The names the proof calculator had before the Square Footage page. They are written in two
 * pieces so this file does not match its own search.
 */
const OLD_TITLES = [
  ['Rectangle', 'Area'].join(' '),
  ['Área de un', 'rectángulo'].join(' '),
] as const;

/**
 * Every source of the apps, the packages and the tooling as git sees it: tracked files and new
 * untracked ones, never an ignored file (build output, mutation reports, browser test results) and
 * nothing outside the three trees (`.claude/` worktrees), so a local run reads what CI reads.
 */
const sourceFiles = (): string[] => {
  const git = spawnSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard', 'apps', 'packages', 'tooling'],
    { cwd: fromRoot('.'), encoding: 'utf8' },
  );
  if (git.status !== 0) throw new Error(`git ls-files failed: ${git.stderr}`);
  return git.stdout.split('\0').filter((file) => /\.(?:ts|astro|md|mjs|json|css)$/.test(file));
};

describe('the old rectangle-area title is gone (calc-rectangle-area › [RAP7])', () => {
  // spec: calc-rectangle-area › [RAP7] no match in code, tests or catalogs outside archived changes
  it('is found in no source, test or catalog', () => {
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(100);
    expect(files).toContain('packages/i18n/src/catalogs/en/rectangle-area.ts');
    const found = files.flatMap((file) => {
      const text = readFileSync(fromRoot(file), 'utf8');
      return OLD_TITLES.filter((title) => text.includes(title)).map((title) => `${file}: ${title}`);
    });
    expect(found).toEqual([]);
  });
});
