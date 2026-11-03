// Checks the byte budgets of the built `dist` (see `src/site-check/budgets.ts`).
// Usage: node apps/pay/scripts/check-site.ts [dist-directory]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';
import { budgetProblems } from '../src/site-check/budgets.ts';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';

const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.txt', '.xml', '.json']);
const given = process.argv[2];
const dist = given === undefined ? resolve(import.meta.dirname, '../dist') : resolve(given);

const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });

const texts = new Map<string, string>();
const sizes = new Map<string, number>();
for (const path of walk(dist)) {
  const file = relative(dist, path).split(sep).join('/');
  sizes.set(file, statSync(path).size);
  if (TEXT.has(extname(file))) texts.set(file, readFileSync(path, 'utf8'));
}

const missing = CALCULATOR_PAGES.filter((page) => !texts.has(page)).map(
  (page) => `${page}: a calculator page the build does not hold`,
);
const problems = [
  ...missing,
  ...budgetProblems({ texts, sizes, calculators: new Set(CALCULATOR_PAGES) }),
];
const pages = [...texts.keys()].filter((file) => file.endsWith('.html')).sort();
for (const page of pages)
  console.log(`${page}: ${(sizes.get(page) ?? 0).toLocaleString('en-US')} B`);
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`check:site: ${String(pages.length)} pages within budget`);
