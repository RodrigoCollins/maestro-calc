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
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import {
  IRC_URL,
  NIST_URL,
  QUIKRETE_URL,
  SHERWIN_WILLIAMS_URL,
  USG_COMPOUND_URL,
  USG_TAPE_URL,
  validDist,
  WISDOT_URL,
} from './__testing__/page-fixture.ts';

const FONT_DIRECTORIES = ['barlow', 'barlow', 'barlow-condensed', 'barlow-condensed'] as const;
const FONT_FILES = [
  'barlow-latin-400-normal.woff2',
  'barlow-latin-600-normal.woff2',
  'barlow-condensed-latin-600-normal.woff2',
  'barlow-condensed-latin-700-normal.woff2',
] as const;
/** Real woff2 files: the glyph check reads their cmap and the byte budgets weigh them. */
const realFont = (index: number): string =>
  fromRoot(
    'node_modules/@fontsource',
    FONT_DIRECTORIES[index] ?? '',
    'files',
    FONT_FILES[index] ?? '',
  );

const script = fromRoot('apps/web/scripts/check-site.ts');
// The CLI reads the real content entries, so the expected dates and count derive from them too.
const entries = readEntries(fromRoot('apps/web/src/content/pages'));
const calculatorEntries = readEntries(fromRoot('apps/web/src/content/calculators'));
const site = {
  routes: ROUTES,
  config: SITE,
  catalogs: { en: enSite, es: esSite },
  updates: Object.fromEntries(
    [...entries, ...calculatorEntries].map((entry) => [
      entry.path.replace(/\.md$/, ''),
      entry.fields['updated'] ?? '',
    ]),
  ),
  calculatorPages: CALCULATOR_PAGES,
  externalLinks: {
    concrete: [QUIKRETE_URL, NIST_URL],
    'rectangle-area': [NIST_URL],
    gravel: [WISDOT_URL, NIST_URL],
    mulch: [NIST_URL],
    topsoil: [NIST_URL],
    paint: [SHERWIN_WILLIAMS_URL, NIST_URL],
    drywall: [USG_COMPOUND_URL, USG_TAPE_URL, NIST_URL],
    'roof-pitch': [IRC_URL, NIST_URL],
  },
};
const scratch = mkdtempSync(join(tmpdir(), 'check-site-'));
afterAll(() => {
  rmSync(scratch, { recursive: true, force: true });
});

let counter = 0;
/** Writes the valid dist for the real route table, after `edit`, into a fresh directory. */
const writeDist = (
  edit: (dist: Map<string, string>) => void = () => undefined,
  afterWrite: (dir: string) => void = () => undefined,
): string => {
  const dist = validDist(site);
  edit(dist);
  counter += 1;
  const dir = join(scratch, `dist-${String(counter)}`);
  for (const [file, text] of dist) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), text);
  }
  ['a', 'b', 'c', 'd'].forEach((name, index) => {
    copyFileSync(realFont(index), join(dir, `_astro/fonts/${name}.woff2`));
  });
  afterWrite(dir);
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

// The count covers the trust pages and the calculators collection (calculator-page › Page anatomy).
const pending = [...entries, ...calculatorEntries].filter(
  (entry) => entry.fields['ownerReview'] === 'pending',
).length;

describe('check:site byte budgets and glyphs (site-quality › [SQ6], [SQ7], [SQ8], site-shell › [SS10])', () => {
  it('prints the largest page and size per category on a green build [SQ6]', () => {
    const { code, out } = run(writeDist());
    expect(code).toBe(0);
    expect(out).toMatch(/^budget html: largest \/[\w/.-]+\.html [\d,]+ B \(limit 49,152\)$/m);
    expect(out).toMatch(/^budget css: largest \/[\w/.-]+\.html [\d,]+ B \(limit 20,480\)$/m);
    expect(out).toMatch(
      /^budget font: largest \/_astro\/fonts\/[a-d]\.woff2 [\d,]+ B \(limit 30,720\)$/m,
    );
    expect(out).toMatch(/^budget fonts: total [\d,]+ B in 4 files \(limit 92,160\)$/m);
    expect(out).toMatch(/^budget js: 0 B referenced \(limit 0\)$/m);
    expect(out).toMatch(/^budget weight: largest \/[\w/.-]+\.html [\d,]+ B \(limit 172,032\)$/m);
  });

  it('exits 1 for an HTML file of 49,153 bytes, naming the file and the limit [SQ7]', () => {
    const grow = edited('index.html', (html) => {
      const pad = 49_153 - Buffer.byteLength(html) - '<!---->'.length;
      return `${html}<!--${'x'.repeat(pad)}-->`;
    });
    const { code, err } = run(writeDist(grow));
    expect(code).toBe(1);
    expect(err).toContain('index.html: html-budget: 49,153 B exceeds the limit of 49,152 B');
  });

  it('exits 1 for a referenced JavaScript file, naming it [SQ8]', () => {
    const { code, err } = run(
      writeDist((dist) => {
        dist.set('_astro/x.js', 'x');
        dist.set(
          'index.html',
          (dist.get('index.html') ?? '').replace(
            '</head>',
            '<script src="/_astro/x.js"></script></head>',
          ),
        );
      }),
    );
    expect(code).toBe(1);
    expect(err).toContain('index.html: js-budget: /_astro/x.js (1 B) is JavaScript');
  });

  it('exits 1 for a font without the letter ñ, naming the code point [SS10]', () => {
    const latinExt = fromRoot(
      'node_modules/@fontsource/barlow/files/barlow-latin-ext-400-normal.woff2',
    );
    const { code, err } = run(
      writeDist(undefined, (dir) => {
        copyFileSync(latinExt, join(dir, '_astro/fonts/a.woff2'));
      }),
    );
    expect(code).toBe(1);
    expect(err).toContain('_astro/fonts/a.woff2: glyphs: U+00F1 is missing from the font');
  });
});

describe('check:site CLI (site-seo › [SE14], monorepo-workspace › [MWW3])', () => {
  it('exits 0 on a valid dist and prints the page count and the pending reviews', () => {
    const { code, out, err } = run(writeDist());
    expect({ code, err }).toEqual({ code: 0, err: '' });
    const lines = out.trimEnd().split('\n');
    expect(lines[0]).toBe(`check:site: checked ${String(pageCount(ROUTES))} pages`);
    expect(lines.at(-1)).toBe(`pending ownerReview entries: ${String(pending)}`);
    // between the two: one budget line per category
    expect(lines.slice(1, -1).map((line) => line.split(':')[0])).toEqual([
      'budget html',
      'budget css',
      'budget font',
      'budget fonts',
      'budget js',
      'budget weight',
      'budget js (calculator)',
      'budget weight (calculator)',
    ]);
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
