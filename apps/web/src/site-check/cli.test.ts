import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { afterAll, describe, expect, it } from 'vitest';
import { readEntries } from '../contract/content.ts';
import { fromRoot } from '../contract/root.ts';
import { ROUTES } from '../routing/routes.ts';
import { SITE } from '../site.config.ts';
import { pageCount } from './files.ts';
import { validDist } from './__testing__/page-fixture.ts';

const script = fromRoot('apps/web/scripts/check-site.ts');
// The CLI reads the real content entries, so the expected dates and count derive from them too.
const entries = readEntries(fromRoot('apps/web/src/content/pages'));
const site = {
  routes: ROUTES,
  config: SITE,
  catalogs: { en: enSite, es: esSite },
  updates: Object.fromEntries(
    entries.map((entry) => [entry.path.replace(/\.md$/, ''), entry.fields['updated'] ?? '']),
  ),
};
const scratch = mkdtempSync(join(tmpdir(), 'check-site-'));
afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
});

let counter = 0;
/** Writes the valid dist for the real route table, after `edit`, into a fresh directory. */
const writeDist = (edit: (dist: Map<string, string>) => void = () => undefined): string => {
  const dist = validDist(site);
  edit(dist);
  counter += 1;
  const dir = join(scratch, `dist-${String(counter)}`);
  for (const [file, text] of dist) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), text);
  }
  return dir;
};

const run = (dir: string) => {
  const result = spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });
  return { code: result.status, out: result.stdout, err: result.stderr };
};

const edited =
  (file: string, edit: (html: string) => string) =>
  (dist: Map<string, string>): void => {
    dist.set(file, edit(dist.get(file) ?? ''));
  };

const pending = entries.filter((entry) => entry.fields['ownerReview'] === 'pending').length;

describe('check:site CLI (site-seo › [SE14], monorepo-workspace › [MWW3])', () => {
  it('exits 0 on a valid dist and prints the page count and the pending reviews', () => {
    const { code, out, err } = run(writeDist());
    expect({ code, err }).toEqual({ code: 0, err: '' });
    expect(out).toBe(
      `check:site: checked ${String(pageCount(ROUTES))} pages\npending ownerReview entries: ${String(pending)}\n`,
    );
    expect(pageCount(ROUTES)).toBe(2 * Object.keys(ROUTES).length + 2);
  });

  it.each([
    [
      'a removed description [SE3]',
      edited('index.html', (html) => html.replace(/<meta name="description"[^>]*>/, '')),
      'index.html: description:',
    ],
    [
      'two h1 elements [SE4]',
      edited('es.html', (html) => html.replace('</main>', '<h1>Two</h1></main>')),
      'es.html: h1:',
    ],
    [
      'a removed canonical [SE15]',
      edited('es.html', (html) => html.replace(/<link rel="canonical"[^>]*>/, '')),
      'es.html: canonical:',
    ],
    [
      'malformed JSON-LD [SE8]',
      edited('index.html', (html) => html.replace('{"@context"', '{"@context":')),
      'index.html: json-ld:',
    ],
    [
      'an alternate that does not link back, naming both pages [SR10]',
      edited('es.html', (html) => html.replaceAll(/<link rel="alternate"[^>]*>/g, '')),
      'index.html: reciprocity: alternate es.html does not list index.html back',
    ],
    [
      'a cookie header',
      (dist: Map<string, string>) => dist.set('_headers', '/*\n  Set-Cookie: a=1\n'),
      '_headers: cookie-header:',
    ],
    [
      'a localStorage reference',
      edited('index.html', (html) => html.replace('</main>', 'localStorage</main>')),
      'index.html: storage:',
    ],
    [
      'a third-party origin in a built asset',
      (dist: Map<string, string>) =>
        dist.set('_astro/x.css', '@import url(https://cdn.example.com/a.css);'),
      '_astro/x.css: third-party-origin:',
    ],
  ])('exits 1 for %s, naming the file', (_name, edit, line) => {
    const { code, err } = run(writeDist(edit));
    expect(code).toBe(1);
    expect(err).toContain(line);
  });

  it('exits 1 with a build-first message when the directory is missing', () => {
    const missing = join(scratch, 'missing');
    const { code, err, out } = run(missing);
    expect({ code, out }).toEqual({ code: 1, out: '' });
    expect(err).toBe(`check:site: ${missing} not found. Run \`npm run build\` first.\n`);
  });

  it('resolves a relative directory against the working directory and prints the resolved path [JD-2]', () => {
    const cwd = realpathSync(scratch);
    const dist = writeDist();
    const relative = (argument: string) =>
      spawnSync(process.execPath, [script, argument], { encoding: 'utf8', cwd });
    const missing = relative('nowhere');
    expect({ code: missing.status, out: missing.stdout }).toEqual({ code: 1, out: '' });
    expect(missing.stderr).toBe(
      `check:site: ${join(cwd, 'nowhere')} not found. Run \`npm run build\` first.\n`,
    );
    const found = relative(basename(dist));
    expect({ code: found.status, err: found.stderr }).toEqual({ code: 0, err: '' });
  });

  it('names apps/web/dist when no directory is given and the default one is absent', () => {
    // A copy of the script in a scratch `apps/web` with no `dist`: the real build is never touched.
    const web = join(scratch, 'default-root', 'apps', 'web');
    mkdirSync(join(web, 'scripts'), { recursive: true });
    copyFileSync(script, join(web, 'scripts', 'check-site.ts'));
    symlinkSync(fromRoot('apps/web/src'), join(web, 'src'));
    symlinkSync(fromRoot('node_modules'), join(scratch, 'default-root', 'node_modules'));
    const result = spawnSync(process.execPath, [join(web, 'scripts', 'check-site.ts')], {
      encoding: 'utf8',
    });
    expect({ code: result.status, out: result.stdout }).toEqual({ code: 1, out: '' });
    expect(result.stderr).toBe('check:site: apps/web/dist not found. Run `npm run build` first.\n');
  });
});
