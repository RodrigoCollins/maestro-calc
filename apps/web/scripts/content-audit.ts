// The content audit of a built site (`@maestro-calc/site-kit/content-audit`), for the dist of any
// app of the repository: the thinnest indexable pages, the template share, the near-duplicate
// pairs, the sitemap and the orphans. It reports and never fails: read it against `plans/growth/adsense-quality-checklist.md`.
// Usage: npm run audit:content -- <dist-directory> [--json <file>] [--limit <n>] [--thin <words>]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';
import { auditSite, reportText, type AuditFile } from '@maestro-calc/site-kit/content-audit';

const args = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
};
const [given] = args;
if (given === undefined || given.startsWith('--')) {
  process.stderr.write('usage: npm run audit:content -- <dist-directory> [--json <file>]\n');
  process.exit(2);
}
const dist = resolve(given);
const files: AuditFile[] = readdirSync(dist, { recursive: true, encoding: 'utf8' })
  .filter((path) => path.endsWith('.html'))
  .map((path) => ({
    path: relative(dist, join(dist, path)).split('\\').join('/'),
    html: readFileSync(join(dist, path), 'utf8'),
  }));
const sitemapFile = join(dist, 'sitemap.xml');
const thin = flag('--thin');
const report = auditSite(files, {
  ...(existsSync(sitemapFile) ? { sitemap: readFileSync(sitemapFile, 'utf8') } : {}),
  ...(thin === undefined ? {} : { thinBelow: Number(thin) }),
});
process.stdout.write(`${reportText(report, Number(flag('--limit') ?? 30))}\n`);
const json = flag('--json');
if (json !== undefined) writeFileSync(json, `${JSON.stringify(report, null, 1)}\n`);
