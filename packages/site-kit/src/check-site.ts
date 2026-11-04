import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { budgetProblems } from './budgets.ts';

const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.txt', '.xml', '.json']);

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

/** One built page and its size on disk. */
export interface PageSize {
  readonly file: string;
  readonly bytes: number;
}

/** What the check of a built site found: every page with its size, and every problem. */
export interface SiteCheck {
  readonly pages: readonly PageSize[];
  readonly problems: readonly string[];
}

/**
 * Checks a built `dist` against the byte budgets (`budgets.ts`): every calculator page must be
 * there, and each page, font and script within its limit. Paths are `/`-separated, relative to
 * `dist`, on every platform.
 */
export const checkSite = (dist: string, calculatorPages: readonly string[]): SiteCheck => {
  const texts = new Map<string, string>();
  const sizes = new Map<string, number>();
  const pages: PageSize[] = [];
  for (const path of walk(dist)) {
    const file = relative(dist, path).split(sep).join('/');
    const bytes = statSync(path).size;
    sizes.set(file, bytes);
    if (TEXT.has(extname(file))) texts.set(file, readFileSync(path, 'utf8'));
    if (file.endsWith('.html')) pages.push({ file, bytes });
  }
  const missing = calculatorPages
    .filter((page) => !texts.has(page))
    .map((page) => `${page}: a calculator page the build does not hold`);
  return {
    pages: pages.sort((a, b) => Number(a.file > b.file) - Number(a.file < b.file)),
    problems: [
      ...missing,
      ...budgetProblems({ texts, sizes, calculators: new Set(calculatorPages) }),
    ],
  };
};
