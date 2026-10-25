import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

/** The float and short-fraction spellings of pi that core must never contain. */
const FORBIDDEN: readonly RegExp[] = [/Math\.PI/, /22\/7/, /22 \/ 7/, /355\/113/, /355 \/ 113/];

/** The patterns found in `text`, by source. The helper lives here: in `src` it would match itself. */
const findForbidden = (text: string): string[] =>
  FORBIDDEN.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);

const isSource = (name: string): boolean =>
  name.endsWith('.ts') && !name.endsWith('.test.ts') && !name.endsWith('.test-d.ts');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return isSource(entry.name) ? [path] : [];
  });

describe('no float or short fraction of pi in core (core-geometry › Rational pi)', () => {
  // spec: core-geometry › [GEO3] No float or short fraction in core. This is a web contract
  // because the lint boundary forbids Node builtins inside `packages/core`, tests included.
  it('finds no forbidden pattern in any non-test source file of core', () => {
    const files = sourceFiles(fromRoot('packages/core/src'));
    expect(files.length).toBeGreaterThan(50);
    expect(files.some((file) => file.endsWith('geometry/pi.ts'))).toBe(true);
    const hits = files.flatMap((file) =>
      findForbidden(readFileSync(file, 'utf8')).map((pattern) => `${file}: ${pattern}`),
    );
    expect(hits).toEqual([]);
  });

  it('flags a line holding each pattern (seeded)', () => {
    expect(findForbidden('const x = Math.PI;')).toEqual(['Math\\.PI']);
    expect(findForbidden('a = 22/7')).toEqual(['22\\/7']);
    expect(findForbidden('a = 22 / 7')).toEqual(['22 \\/ 7']);
    expect(findForbidden('a = 355/113')).toEqual(['355\\/113']);
    expect(findForbidden('a = 355 / 113')).toEqual(['355 \\/ 113']);
    expect(findForbidden('const x = 1;')).toEqual([]);
  });
});
