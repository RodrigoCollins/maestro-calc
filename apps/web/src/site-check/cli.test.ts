import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { afterAll, describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import { ROUTES } from '../routing/routes.ts';
import { SITE } from '../site.config.ts';
import { pageCount } from './files.ts';
import { validDist } from './__testing__/page-fixture.ts';

const script = fromRoot('apps/web/scripts/check-site.ts');
const site = { routes: ROUTES, config: SITE, catalogs: { en: enSite, es: esSite } };
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

describe('check:site CLI (site-seo › [SE14], monorepo-workspace › [MWW3])', () => {
  it('exits 0 on a valid dist and prints the page count and the pending reviews', () => {
    const { code, out, err } = run(writeDist());
    expect({ code, err }).toEqual({ code: 0, err: '' });
    expect(out).toBe(
      `check:site: checked ${String(pageCount(ROUTES))} pages\npending ownerReview entries: 0\n`,
    );
    expect(pageCount(ROUTES)).toBe(4);
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
