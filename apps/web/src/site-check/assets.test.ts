import { describe, expect, it } from 'vitest';
import { assetProblems } from './assets.ts';
import { pagesOf } from './files.ts';
import {
  CALC_ROUTES,
  calculatorSite,
  CHUNK_FILE,
  ENTRY_FILE,
  FIXTURE_ROUTES,
  fixtureSite,
  VALID_CSS,
  validDist,
} from './__testing__/page-fixture.ts';

type Edit = (html: string) => string;

/** Asset problems of a valid dist after `edits` changed files; `mutate` edits the whole map. */
const problemsAfter = (
  edits: Readonly<Record<string, Edit>> = {},
  mutate: (dist: Map<string, string>) => void = () => undefined,
) => {
  const dist = validDist(fixtureSite());
  for (const [file, edit] of Object.entries(edits)) dist.set(file, edit(dist.get(file) ?? ''));
  mutate(dist);
  return assetProblems(pagesOf(dist, FIXTURE_ROUTES), dist);
};

const rulesOf = (problems: ReturnType<typeof problemsAfter>, file: string): string[] =>
  problems.filter((entry) => entry.file === file).map((entry) => entry.rule);

const intoMain: (markup: string) => Edit = (markup) => (html) =>
  html.replace('</main>', `${markup}</main>`);

describe('asset rules over a valid dist', () => {
  it('finds nothing wrong with the valid pages, whose only script is JSON-LD', () => {
    expect(problemsAfter()).toEqual([]);
    expect(validDist().get('index.html')).toContain('application/ld+json');
  });
});

describe('zero client JavaScript (site-shell › [SS18])', () => {
  it.each([
    ['an inline script', '<script>alert(1)</script>', 'script'],
    ['a module script', '<script type="module" src="/a.js"></script>', 'script'],
    ['a script without a type', '<script type="">x</script>', 'script'],
    ['an event handler attribute', '<button onclick="go()">x</button>', 'inline-handler'],
    ['a mixed-case event handler attribute', '<button onClick="go()">x</button>', 'inline-handler'],
    ['an island', '<astro-island></astro-island>', 'astro-island'],
    ['a module preload', '<link rel="modulepreload" href="/a.js">', 'modulepreload'],
  ])('fails a page with %s', (_name, markup, rule) => {
    expect(rulesOf(problemsAfter({ 'about.html': intoMain(markup) }), 'about.html')).toContain(
      rule,
    );
  });

  it('accepts data attributes that merely contain the letters on', () => {
    expect(problemsAfter({ 'about.html': intoMain('<p data-one="1" data-on="x">x</p>') })).toEqual(
      [],
    );
  });

  it('fails any .js or .mjs file in dist that no calculator page loads, naming it', () => {
    expect(problemsAfter({}, (dist) => dist.set('_astro/a.js', 'x'))).toEqual([
      {
        file: '_astro/a.js',
        rule: 'js-file',
        message: 'JavaScript must be reachable from a calculator page',
      },
    ]);
    expect(
      rulesOf(
        problemsAfter({}, (dist) => dist.set('x/b.mjs', 'x')),
        'x/b.mjs',
      ),
    ).toEqual(['js-file']);
  });
});

describe('same-origin subresources (site-shell › [SS9])', () => {
  it.each([
    ['an image', '<img src="https://example.com/x.png">'],
    ['a protocol-relative script source', '<img src="//example.com/x.png">'],
  ])('fails %s from another origin', (_name, markup) => {
    expect(rulesOf(problemsAfter({ 'about.html': intoMain(markup) }), 'about.html')).toEqual([
      'third-party',
    ]);
  });

  it.each([
    ['an absolute candidate', 'https://example.com/a.png 1x, /b.png 2x'],
    ['a later candidate', '/a.png 1x, //example.com/b.png 2x'],
    ['a candidate without a descriptor', '/a.png 1x,\n https://example.com/b.png'],
  ])('fails an image srcset with %s', (_name, srcset) => {
    expect(
      rulesOf(
        problemsAfter({ 'about.html': intoMain(`<img src="/a.png" srcset="${srcset}">`) }),
        'about.html',
      ),
    ).toEqual(['third-party']);
  });

  it('fails a source srcset to another origin and accepts a same-origin one', () => {
    const source = (srcset: string) =>
      intoMain(`<picture><source srcset="${srcset}"><img src="/a.png"></picture>`);
    expect(
      rulesOf(problemsAfter({ 'about.html': source('https://example.com/a.avif') }), 'about.html'),
    ).toEqual(['third-party']);
    expect(problemsAfter({ 'about.html': source('/a.avif 1x, /b.avif 2x') })).toEqual([]);
  });

  it.each(['stylesheet', 'preload', 'icon'])('fails a %s link to another origin', (rel) => {
    expect(
      rulesOf(
        problemsAfter({
          'about.html': (html) =>
            html.replace('</head>', `<link rel="${rel}" href="https://example.com/x"></head>`),
        }),
        'about.html',
      ),
    ).toEqual(['third-party']);
  });

  it('fails a CSS url() to another origin', () => {
    expect(
      rulesOf(
        problemsAfter({
          'about.html': (html) =>
            html.replace('</style>', '.a{background:url(https://example.com/x.png)}</style>'),
        }),
        'about.html',
      ),
    ).toEqual(['third-party']);
  });

  it('accepts same-origin paths, data URIs in CSS and absolute canonical links', () => {
    expect(
      problemsAfter({
        'about.html': (html) =>
          html
            .replace('</style>', '.a{background:url(data:image/png;base64,AA)}</style>')
            .replace('</main>', '<img src="/x.png"></main>'),
      }),
    ).toEqual([]);
  });

  it.each([
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'use.typekit.net',
    'cdn.jsdelivr.net',
    'unpkg.com',
  ])('fails a mention of %s anywhere in a page', (host) => {
    expect(
      rulesOf(problemsAfter({ 'about.html': intoMain(`<!-- ${host} -->`) }), 'about.html'),
    ).toEqual(['font-host']);
  });
});

describe('palette and colour scheme (site-shell › [SS5], [SS6])', () => {
  const withCss =
    (css: string): Edit =>
    (html) =>
      html.replace(VALID_CSS, css);

  it('expects all seven palette values, in any case and short form', () => {
    expect(
      problemsAfter({
        'about.html': withCss(VALID_CSS.replaceAll(/#[0-9a-f]+/g, (hex) => hex.toUpperCase())),
      }),
    ).toEqual([]);
  });

  it('names the palette value that is missing', () => {
    const problems = problemsAfter({
      'about.html': withCss(VALID_CSS.replace('#1faf5a', '#1faf5b')),
    });
    expect(problems).toEqual([
      { file: '(dist)', rule: 'palette', message: 'the CSS lacks the palette colour #1FAF5A' },
    ]);
  });

  it.each([
    ['light dark', 'color-scheme:light dark'],
    ['dark', 'color-scheme:dark'],
    ['lighter', 'color-scheme:lighter'],
    ['light and a later dark declaration', 'color-scheme:light}.b{color-scheme:dark'],
  ])('fails a colour scheme that is not exactly light: %s', (_name, declaration) => {
    expect(
      rulesOf(
        problemsAfter({
          'about.html': withCss(VALID_CSS.replace('color-scheme:light', declaration)),
        }),
        '(dist)',
      ),
    ).toEqual(['color-scheme']);
  });

  it('accepts a spaced light declaration with an important flag', () => {
    expect(
      problemsAfter({
        'about.html': withCss(
          VALID_CSS.replace('color-scheme:light', 'color-scheme : light !important'),
        ),
      }),
    ).toEqual([]);
  });

  it('requires a light colour scheme and forbids a dark one', () => {
    expect(
      rulesOf(
        problemsAfter({ 'about.html': withCss(VALID_CSS.replace('color-scheme:light', '')) }),
        '(dist)',
      ),
    ).toEqual(['color-scheme']);
    expect(
      rulesOf(
        problemsAfter({
          'about.html': withCss(`${VALID_CSS}@media (prefers-color-scheme:dark){a{color:#000}}`),
        }),
        '(dist)',
      ),
    ).toEqual(['prefers-color-scheme']);
  });

  it('reports a CSS finding once for the build, however many pages ship it', () => {
    const broken = (html: string): string => html.replace(VALID_CSS, 'a{color:#000}');
    const problems = problemsAfter(
      Object.fromEntries(['index.html', 'es.html', 'about.html'].map((file) => [file, broken])),
    );
    expect(problems.filter((entry) => entry.rule === 'color-scheme')).toEqual([
      {
        file: '(dist)',
        rule: 'color-scheme',
        message: 'the CSS must declare color-scheme: light, only',
      },
    ]);
    expect(problems.filter((entry) => entry.rule === 'palette')).toHaveLength(7);
  });

  it('reads CSS files of dist as well as inline styles', () => {
    const problems = problemsAfter(
      { 'about.html': (html) => html.replace(`<style>${VALID_CSS}</style>`, '') },
      (dist) => dist.set('_astro/site.css', VALID_CSS),
    );
    expect(rulesOf(problems, 'about.html')).toEqual([]);
  });
});

describe('fonts (site-shell › [SS8])', () => {
  it('requires exactly four woff2 files', () => {
    const three = problemsAfter({}, (dist) => dist.delete('_astro/fonts/d.woff2'));
    expect(three).toEqual([
      { file: '(dist)', rule: 'fonts', message: 'expected exactly four .woff2 files, found 3' },
    ]);
    expect(
      rulesOf(
        problemsAfter({}, (dist) => dist.set('_astro/fonts/e.woff2', '')),
        '(dist)',
      ),
    ).toEqual(['fonts']);
  });

  it('requires every @font-face to swap', () => {
    expect(
      rulesOf(
        problemsAfter({
          'about.html': (html) => html.replace(';font-display:swap}', '}'),
        }),
        '(dist)',
      ),
    ).toEqual(['font-display']);
  });

  it('requires every font url to be a same-origin relative path', () => {
    const rules = (url: string): string[] =>
      problemsAfter({
        'about.html': (html) => html.replace('/_astro/fonts/a.woff2', url),
      }).map((entry) => `${entry.file} ${entry.rule}`);
    expect(rules('https://example.com/a.woff2')).toEqual([
      'about.html third-party',
      '(dist) font-url',
    ]);
    expect(rules('//example.com/a.woff2')).toEqual(['about.html third-party', '(dist) font-url']);
    expect(rules('data:font/woff2;base64,AA')).toEqual(['(dist) font-url']);
    expect(rules('fonts/a.woff2')).toEqual([]);
  });
});

// ---- the calculator template: one module script, a graph of same-origin files ----

type Mutate = (dist: Map<string, string>) => void;

/** Asset problems of a valid dist with a calculator page, after `edits` and `mutate`. */
const calcProblemsAfter = (
  edits: Readonly<Record<string, Edit>> = {},
  mutate: Mutate = () => undefined,
) => {
  const site = calculatorSite();
  const dist = validDist(site);
  for (const [file, edit] of Object.entries(edits)) dist.set(file, edit(dist.get(file) ?? ''));
  mutate(dist);
  return assetProblems(pagesOf(dist, CALC_ROUTES), dist, site);
};

const ENTRY_TAG = `<script type="module" src="/${ENTRY_FILE}"></script>`;
const inHead: (markup: string) => Edit = (markup) => (html) =>
  html.replace('</head>', `${markup}</head>`);
const withoutEntry: Edit = (html) => html.replace(ENTRY_TAG, '');
const PAGE = 'concrete-calculator.html';

describe('calculator page scripts (site-shell › [SS20])', () => {
  // spec: site-shell › [SS20] exactly one module script from /_astro/, otherwise only JSON-LD
  it('accepts a calculator page with its one module script, both locales sharing the entry', () => {
    expect(calcProblemsAfter()).toEqual([]);
    const dist = validDist(calculatorSite());
    expect(dist.get(PAGE)).toContain(ENTRY_TAG);
    expect(dist.get('es/calculadora-de-concreto.html')).toContain(ENTRY_TAG);
  });

  it('accepts a same-origin modulepreload of a file under _astro', () => {
    expect(
      calcProblemsAfter({
        [PAGE]: inHead(`<link rel="modulepreload" href="/${CHUNK_FILE}">`),
      }),
    ).toEqual([]);
  });

  // spec: site-shell › [SS22] each violation names the page and the rule
  it.each([
    ['no module script', withoutEntry, 'script'],
    ['an inline script with text', inHead('<script>alert(1)</script>'), 'script'],
    [
      'a second module script',
      inHead('<script type="module" src="/_astro/other.js"></script>'),
      'script',
    ],
    ['a classic script file', inHead('<script src="/_astro/other.js"></script>'), 'script'],
    [
      'a module script with a body',
      (h: string) =>
        h.replace(ENTRY_TAG, `<script type="module" src="/${ENTRY_FILE}">alert(1)</script>`),
      'script',
    ],
    [
      'a script from another origin',
      (h: string) => h.replace(`/${ENTRY_FILE}`, 'https://example.com/a.js'),
      'script',
    ],
    [
      'a protocol-relative script',
      (h: string) => h.replace(`/${ENTRY_FILE}`, '//example.com/a.js'),
      'script',
    ],
    [
      'a script outside _astro',
      (h: string) => h.replace(`/${ENTRY_FILE}`, '/other/a.js'),
      'script',
    ],
    [
      'an event handler',
      (h: string) => h.replace('<h2>Result</h2>', '<h2 onclick="x()">Result</h2>'),
      'inline-handler',
    ],
    ['an island', inHead('<astro-island></astro-island>'), 'astro-island'],
    [
      'a modulepreload to another origin',
      inHead('<link rel="modulepreload" href="https://example.com/a.js">'),
      'modulepreload',
    ],
    [
      'a protocol-relative modulepreload',
      inHead('<link rel="modulepreload" href="//example.com/a.js">'),
      'modulepreload',
    ],
  ])('fails a calculator page with %s', (_name, edit, rule) => {
    const found = calcProblemsAfter({ [PAGE]: edit }).filter((entry) => entry.file === PAGE);
    expect(found.map((entry) => entry.rule)).toContain(rule);
  });

  it('names the other locale when the two pages load different entries', () => {
    const found = calcProblemsAfter({
      'es/calculadora-de-concreto.html': (h) => h.replace(ENTRY_FILE, '_astro/concrete2.js'),
    });
    expect(found).toContainEqual({
      file: 'es/calculadora-de-concreto.html',
      rule: 'script',
      message: `the entry /_astro/concrete2.js differs from the entry /${ENTRY_FILE} of ${PAGE}`,
    });
  });

  // spec: site-shell › [SS22] a static page never gains a script, whatever the calculator pages do
  it('still fails a script file on a static page of the same site', () => {
    const found = calcProblemsAfter({ 'privacy.html': inHead(ENTRY_TAG) });
    expect(
      found.filter((entry) => entry.file === 'privacy.html').map((entry) => entry.rule),
    ).toContain('script');
  });
});

describe('JavaScript files in dist (site-shell › Client JavaScript only on calculator pages)', () => {
  it('accepts the entry and a chunk that the entry imports', () => {
    expect(calcProblemsAfter()).toEqual([]);
  });

  it.each([
    ['a file outside _astro', 'js/a.js', 'JavaScript is only allowed under _astro/'],
    ['an .mjs file outside _astro', 'a.mjs', 'JavaScript is only allowed under _astro/'],
    [
      'a file nobody loads',
      '_astro/orphan.js',
      'JavaScript must be reachable from a calculator page',
    ],
    [
      'a chunk nobody imports',
      '_astro/chunks/lonely.mjs',
      'JavaScript must be reachable from a calculator page',
    ],
  ])('fails %s, naming it', (_name, file, message) => {
    expect(calcProblemsAfter({}, (dist) => dist.set(file, 'x'))).toEqual([
      { file, rule: 'js-file', message },
    ]);
  });

  it('follows a static import of the entry but not a dynamic one', () => {
    const imported = '_astro/chunks/second.js';
    expect(
      calcProblemsAfter({}, (dist) => {
        dist.set(
          ENTRY_FILE,
          'import"./chunks/rational.js";import{b}from"./chunks/second.js";export{b};',
        );
        dist.set(imported, 'export const b=1;');
      }),
    ).toEqual([]);
    expect(
      calcProblemsAfter({}, (dist) => {
        dist.set(
          ENTRY_FILE,
          'import"./chunks/rational.js";const m=()=>import("./chunks/lazy.js");export{m};',
        );
        dist.set('_astro/chunks/lazy.js', 'x');
      }).map((entry) => entry.file),
    ).toEqual(['_astro/chunks/lazy.js']);
  });
});
