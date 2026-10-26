// Checks the built `dist` against the route table and the site catalogs (see `src/site-check`).
// Usage: node apps/web/scripts/check-site.ts [dist-directory]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { ROUTES } from '../src/routing/routes.ts';
import { CALCULATOR_PAGES } from '../src/routing/templates.ts';
import { SITE } from '../src/site.config.ts';
import {
  budgetSummary,
  checkSite,
  contextOf,
  countPending,
  pageCount,
  sourceUrlsOf,
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

/** The Markdown entries of a content collection, by path relative to the collection (`en/about.md`). */
const collection = (name: string): [string, string][] => {
  const directory = join(webRoot, 'src', 'content', name);
  return existsSync(directory)
    ? filesUnder(directory).filter(([file]) => file.endsWith('.md'))
    : [];
};

const entries = collection('pages');
const calculatorEntries = collection('calculators');
// `en/about.md` becomes the key `en/about`; an entry without a readable date is left out.
const updates = Object.fromEntries(
  [...entries, ...calculatorEntries].flatMap(([file, text]) => {
    const updated = updatedOf(text);
    return updated === undefined ? [] : [[file.replace(/\.md$/, ''), updated]];
  }),
);
// A calculator page may link the sources of its entry, in either locale, and nothing else outbound.
const externalLinks = Object.fromEntries(
  CALCULATOR_PAGES.map((id) => [
    id,
    calculatorEntries
      .filter(([file]) => file.endsWith(`/${id}.md`))
      .flatMap(([, text]) => sourceUrlsOf(text)),
  ]),
);

const files = filesUnder(dist);
const built = new Map(files);
const site = {
  routes: ROUTES,
  config: SITE,
  catalogs: { en: { ...enCommon, ...enSite }, es: { ...esCommon, ...esSite } },
  updates,
  calculatorPages: CALCULATOR_PAGES,
  externalLinks,
};
// What the text map cannot hold: every file's byte size and the bytes of each font.
const buildBytes = {
  sizes: new Map(files.map(([file]) => [file, statSync(join(dist, file)).size])),
  fonts: new Map(
    files
      .filter(([file]) => file.endsWith('.woff2'))
      .map(([file]) => [file, readFileSync(join(dist, file))]),
  ),
};
const problems = checkSite(built, site, buildBytes);

if (problems.length > 0) {
  for (const { file, rule, message } of problems) console.error(`${file}: ${rule}: ${message}`);
  console.error(`check:site: ${String(problems.length)} problems`);
  process.exit(1);
}

console.log(`check:site: checked ${String(pageCount(ROUTES))} pages`);
for (const line of budgetSummary(contextOf(built, site, buildBytes.sizes))) console.log(line);
console.log(
  `pending ownerReview entries: ${String(countPending([...entries, ...calculatorEntries].map(([, text]) => text)))}`,
);
