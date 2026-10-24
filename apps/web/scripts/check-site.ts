// Checks the built `dist` against the route table and the site catalogs (see `src/site-check`).
// Usage: node apps/web/scripts/check-site.ts [dist-directory]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { ROUTES } from '../src/routing/routes.ts';
import { SITE } from '../src/site.config.ts';
import {
  budgetSummary,
  checkSite,
  countPending,
  pageCount,
  pagesOf,
  updatedOf,
} from '../src/site-check/checks.ts';

const BINARY = new Set([
  '.woff2',
  '.woff',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
]);
const webRoot = resolve(import.meta.dirname, '..');

const given = process.argv[2];
// A relative argument resolves against the working directory; the message prints the result.
const dist = given === undefined ? join(webRoot, 'dist') : resolve(given);

if (!existsSync(dist)) {
  console.error(
    `check:site: ${given === undefined ? 'apps/web/dist' : dist} not found. Run \`npm run build\` first.`,
  );
  process.exit(1);
}

/** Every file under `directory` by posix path; binary files hold no text. */
const filesUnder = (directory: string): [string, string][] =>
  readdirSync(directory, { recursive: true, encoding: 'utf8' })
    .filter((file) => statSync(join(directory, file)).isFile())
    .map((file) => [
      file.split(sep).join('/'),
      BINARY.has(extname(file)) ? '' : readFileSync(join(directory, file), 'utf8'),
    ]);

const content = join(webRoot, 'src', 'content', 'pages');
const entries = existsSync(content)
  ? filesUnder(content).filter(([file]) => file.endsWith('.md'))
  : [];
// `en/about.md` becomes the key `en/about`; an entry without a readable date is left out.
const updates = Object.fromEntries(
  entries.flatMap(([file, text]) => {
    const updated = updatedOf(text);
    return updated === undefined ? [] : [[file.replace(/\.md$/, ''), updated]];
  }),
);

const files = filesUnder(dist);
const built = new Map(files);
const site = {
  routes: ROUTES,
  config: SITE,
  catalogs: { en: enSite, es: esSite },
  updates,
};
// What the text map cannot hold: every file's byte size and the bytes of each font.
const binary = {
  sizes: new Map(files.map(([file]) => [file, statSync(join(dist, file)).size])),
  fonts: new Map(
    files
      .filter(([file]) => file.endsWith('.woff2'))
      .map(([file]) => [file, readFileSync(join(dist, file))]),
  ),
};
const problems = checkSite(built, site, binary);

if (problems.length > 0) {
  for (const { file, rule, message } of problems) console.error(`${file}: ${rule}: ${message}`);
  console.error(`check:site: ${String(problems.length)} problems`);
  process.exit(1);
}

console.log(`check:site: checked ${String(pageCount(ROUTES))} pages`);
for (const line of budgetSummary(pagesOf(built, ROUTES), binary.sizes, built)) console.log(line);
console.log(
  `pending ownerReview entries: ${String(countPending(entries.map(([, text]) => text)))}`,
);
