// Checks the built `dist` against the route table and the site catalogs (see `src/site-check`).
// Usage: node apps/web/scripts/check-site.ts [dist-directory]
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { ROUTES } from '../src/routing/routes.ts';
import { SITE } from '../src/site.config.ts';
import { checkSite, countPending, pageCount } from '../src/site-check/checks.ts';

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
  ? filesUnder(content)
      .filter(([file]) => file.endsWith('.md'))
      .map(([, text]) => text)
  : [];

const problems = checkSite(new Map(filesUnder(dist)), {
  routes: ROUTES,
  config: SITE,
  catalogs: { en: enSite, es: esSite },
});

if (problems.length > 0) {
  for (const { file, rule, message } of problems) console.error(`${file}: ${rule}: ${message}`);
  console.error(`check:site: ${String(problems.length)} problems`);
  process.exit(1);
}

console.log(`check:site: checked ${String(pageCount(ROUTES))} pages`);
console.log(`pending ownerReview entries: ${String(countPending(entries))}`);
