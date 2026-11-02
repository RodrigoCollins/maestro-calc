import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

// quality-gates › Byte-identical Maestro Calc build on refactor branches: the `dist-identical`
// CI job compares the fingerprints of two builds, so the script must be stable and exact.
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true });
});

const tree = (files: Record<string, string>): string => {
  const root = mkdtempSync(join(tmpdir(), 'dist-fingerprint-'));
  roots.push(root);
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
};

const run = (dir: string): { status: number | null; stdout: string; stderr: string } => {
  const { status, stdout, stderr } = spawnSync(
    process.execPath,
    [fromRoot('scripts/dist-fingerprint.mjs'), dir],
    { encoding: 'utf8' },
  );
  return { status, stdout, stderr };
};

const sha256 = (content: string): string => createHash('sha256').update(content).digest('hex');

describe('dist fingerprint (scripts/dist-fingerprint.mjs)', () => {
  it('prints one sha256 and relative path per file, sorted by path', () => {
    const dir = tree({ 'b.html': 'b', 'a/z.css': 'z', 'a/index.html': 'i' });
    expect(run(dir)).toEqual({
      status: 0,
      stdout: [
        `${sha256('i')}  a/index.html`,
        `${sha256('z')}  a/z.css`,
        `${sha256('b')}  b.html`,
        '',
      ].join('\n'),
      stderr: '',
    });
  });

  it('gives the same output for the same tree and a different one for one changed byte', () => {
    const files = { 'index.html': '<p>1</p>', 'es/index.html': '<p>2</p>' };
    const first = run(tree(files)).stdout;
    expect(run(tree(files)).stdout).toBe(first);
    expect(run(tree({ ...files, 'es/index.html': '<p>3</p>' })).stdout).not.toBe(first);
  });

  it('fails with exit code 2 when the directory does not exist', () => {
    const result = run(join(tmpdir(), 'dist-fingerprint-missing-dir'));
    expect(result.status).toBe(2);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('dist-fingerprint-missing-dir');
  });
});
