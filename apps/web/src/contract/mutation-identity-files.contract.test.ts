import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

interface IdentitySpec {
  packageDir: string;
  shared: string[];
  mutate: string[];
  tests?: string[];
  deps: string[];
}

interface Tooling {
  identityFilesOf: (spec: IdentitySpec) => string[];
  sharedIdentityFiles: (packageDir: string) => string[];
}

const tooling = await importFromRoot<Tooling>('tooling/stryker.mjs');

const touch = (root: string, ...paths: string[]): void => {
  for (const path of paths) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), '');
  }
};

// PR 12 review RES-1: every calculator PR ran all seven shards cold, because one hash over all of
// core named every report. A shard's report is now named after the files its verdicts can depend on.
describe('identityFilesOf (the inputs of one shard)', () => {
  const withPackage = (body: (dir: string) => void): void => {
    const dir = mkdtempSync(join(tmpdir(), 'stryker-identity-'));
    try {
      body(dir);
    } finally {
      rmSync(dir, { recursive: true });
    }
  };
  const spec = (dir: string, extra: Partial<IdentitySpec>): IdentitySpec => ({
    packageDir: dir,
    shared: ['stryker.config.mjs'],
    mutate: ['src/a/**', '!src/**/index.ts'],
    deps: [],
    ...extra,
  });

  it('is the sorted union of the mutate globs, the tests, the deps and the shared files', () => {
    withPackage((dir) => {
      touch(dir, 'src/a/x.ts', 'src/a/x.test.ts', 'src/b/y.ts', 'src/c.ts', 'src/d/z.test.ts');
      touch(dir, 'src/e/other.ts', 'stryker.config.mjs');
      const files = tooling.identityFilesOf(
        spec(dir, { tests: ['src/d', 'src/c.ts'], deps: ['src/b/**'] }),
      );
      expect(files).toEqual([
        'src/a/x.test.ts',
        'src/a/x.ts',
        'src/b/y.ts',
        'src/c.ts',
        'src/d/z.test.ts',
        'stryker.config.mjs',
      ]);
    });
  });

  it('counts a file once, ignores the negated mutate globs and runs without a tests list', () => {
    withPackage((dir) => {
      touch(dir, 'src/a/x.ts', 'src/a/index.ts', 'stryker.config.mjs');
      const files = tooling.identityFilesOf(spec(dir, { deps: ['src/a/x.ts', 'src/a/**'] }));
      expect(files).toEqual(['src/a/index.ts', 'src/a/x.ts', 'stryker.config.mjs']);
    });
  });

  it('leaves out dotfiles and dot directories, as the CI key does for sources', () => {
    withPackage((dir) => {
      touch(dir, 'src/a/x.ts', 'src/a/.swp', 'src/a/.hidden/y.ts', 'stryker.config.mjs');
      expect(tooling.identityFilesOf(spec(dir, {}))).toEqual(['src/a/x.ts', 'stryker.config.mjs']);
    });
  });

  it('reaches a sibling package through a relative glob', () => {
    withPackage((dir) => {
      touch(dir, 'one/src/a.ts', 'two/src/b.ts', 'one/stryker.config.mjs');
      const files = tooling.identityFilesOf({
        packageDir: join(dir, 'one'),
        shared: ['stryker.config.mjs'],
        mutate: ['src/**'],
        deps: ['../two/src/**'],
      });
      expect(files).toEqual(['../two/src/b.ts', 'src/a.ts', 'stryker.config.mjs']);
    });
  });

  // Fail closed: a glob that matches nothing is a typo or a deleted module, and a silent empty
  // match would make the identity smaller than the inputs.
  it('refuses a glob that matches no file, and a shared file that does not exist', () => {
    withPackage((dir) => {
      touch(dir, 'src/a/x.ts', 'stryker.config.mjs');
      expect(() => tooling.identityFilesOf(spec(dir, { deps: ['src/nowhere/**'] }))).toThrow(
        /matches no file: src\/nowhere\/\*\*/,
      );
      expect(() => tooling.identityFilesOf(spec(dir, { shared: ['missing.json'] }))).toThrow(
        /missing\.json/,
      );
    });
  });

  it.each(['regular', 'dangling'])('refuses a %s symlink in the identity set', (kind) => {
    withPackage((dir) => {
      touch(dir, 'src/a/x.ts', 'src/a/target.ts', 'stryker.config.mjs');
      symlinkSync(
        kind === 'regular' ? 'target.ts' : 'missing.ts',
        join(dir, 'src', 'a', 'link.ts'),
      );
      expect(() => tooling.identityFilesOf(spec(dir, {}))).toThrow(/symlink in identity set/);
    });
  });
});

describe('the shared files of an identity', () => {
  it('are the package config, the root toolchain and the package json files', () => {
    const shared = tooling.sharedIdentityFiles(fromRoot('packages/core'));
    for (const input of [
      'stryker.config.mjs',
      'vitest.config.ts',
      'package.json',
      'tsconfig.src.json',
      '../../.nvmrc',
      '../../package-lock.json',
      '../../tooling/stryker.mjs',
      '../../tsconfig.base.json',
      '../../vitest.config.ts',
    ]) {
      expect(shared, input).toContain(input);
    }
    expect(shared).toEqual([...shared].sort());
  });
});
