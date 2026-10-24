import { describe, expect, it } from 'vitest';
import { assetProblems } from './assets.ts';
import { pagesOf } from './files.ts';
import { FIXTURE_ROUTES, fixtureSite, VALID_CSS, validDist } from './__testing__/page-fixture.ts';

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

  it('fails any .js or .mjs file in dist, naming it', () => {
    expect(problemsAfter({}, (dist) => dist.set('_astro/a.js', 'x'))).toEqual([
      { file: '_astro/a.js', rule: 'js-file', message: 'dist must hold no JavaScript file' },
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
      { file: 'about.html', rule: 'palette', message: 'the CSS lacks the palette colour #1FAF5A' },
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
        'about.html',
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
        'about.html',
      ),
    ).toEqual(['color-scheme']);
    expect(
      rulesOf(
        problemsAfter({
          'about.html': withCss(`${VALID_CSS}@media (prefers-color-scheme:dark){a{color:#000}}`),
        }),
        'about.html',
      ),
    ).toEqual(['prefers-color-scheme']);
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
        'about.html',
      ),
    ).toEqual(['font-display']);
  });

  it('requires every font url to be a same-origin relative path', () => {
    const rules = (url: string): string[] =>
      rulesOf(
        problemsAfter({
          'about.html': (html) => html.replace('/_astro/fonts/a.woff2', url),
        }),
        'about.html',
      );
    expect(rules('https://example.com/a.woff2')).toEqual(['third-party', 'font-url']);
    expect(rules('//example.com/a.woff2')).toEqual(['third-party', 'font-url']);
    expect(rules('data:font/woff2;base64,AA')).toEqual(['font-url']);
    expect(rules('fonts/a.woff2')).toEqual([]);
  });
});
