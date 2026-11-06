import { describe, expect, it } from 'vitest';
import {
  headProblems,
  imageProblems,
  seoProblems,
  type HeadRules,
  type SeoRules,
} from './seo-check.ts';

const RULES: SeoRules = {
  origin: 'https://x.test',
  image: '/og.png',
  typesOf: (path) =>
    path === '/' ? { og: 'website', schema: 'WebSite' } : { og: 'article', schema: 'Article' },
};

const head = (
  overrides: Record<string, string | null> = {},
  ld: string[] | null = null,
): string => {
  const tags: Record<string, string | null> = {
    canonical: '<link rel="canonical" href="https://x.test/guide">',
    title: '<title>Guide | X</title>',
    description: '<meta name="description" content="A guide.">',
    'og:title': '<meta property="og:title" content="Guide | X">',
    'og:description': '<meta property="og:description" content="A guide.">',
    'og:url': '<meta property="og:url" content="https://x.test/guide">',
    'og:type': '<meta property="og:type" content="article">',
    'og:image': '<meta property="og:image" content="https://x.test/og.png">',
    'twitter:card': '<meta name="twitter:card" content="summary_large_image">',
    ...overrides,
  };
  const blocks = (ld ?? ['{"@type":"Article","url":"https://x.test/guide"}']).map(
    (text) => `<script type="application/ld+json">${text}</script>`,
  );
  return `<!doctype html><html><head>${Object.values(tags).join('')}${blocks.join('')}</head><body></body></html>`;
};

const check = (html: string): string[] => seoProblems(new Map([['guide.html', html]]), RULES);

describe('seoProblems', () => {
  it('finds nothing on a page with its link preview and its JSON-LD', () => {
    expect(check(head())).toEqual([]);
  });

  it('skips a page that is never indexed', () => {
    const html = '<html><head><meta name="robots" content="noindex"></head></html>';
    expect(check(html)).toEqual([]);
  });

  it('needs a canonical on an indexable page', () => {
    expect(check(head({ canonical: null }))).toEqual([
      'guide.html: an indexable page needs one canonical link',
    ]);
  });

  it('needs a canonical with an address', () => {
    expect(check(head({ canonical: '<link rel="canonical">' }))).toEqual([
      'guide.html: an indexable page needs one canonical link',
    ]);
  });

  it('holds og:title and og:description to an empty title and description when they are missing', () => {
    expect(check(head({ title: null, description: null }))).toEqual([
      'guide.html: og:title must be "", found "Guide | X"',
      'guide.html: og:description must be "", found "A guide."',
    ]);
  });

  it('needs og:title and og:description equal to the title and the description', () => {
    expect(
      check(
        head({
          'og:title': '<meta property="og:title" content="Other">',
          'og:description': null,
        }),
      ),
    ).toEqual([
      'guide.html: og:title must be "Guide | X", found "Other"',
      'guide.html: og:description must be "A guide.", found none',
    ]);
  });

  it('needs og:url at the canonical, the og:type of the page and the one absolute image', () => {
    expect(
      check(
        head({
          'og:url': '<meta property="og:url" content="https://x.test/other">',
          'og:type': '<meta property="og:type" content="website">',
          'og:image': '<meta property="og:image" content="/og.png">',
          'twitter:card': null,
        }),
      ),
    ).toEqual([
      'guide.html: og:url must be "https://x.test/guide", found "https://x.test/other"',
      'guide.html: og:type must be "article", found "website"',
      'guide.html: og:image must be "https://x.test/og.png", found "/og.png"',
      'guide.html: twitter:card must be "summary_large_image", found none',
    ]);
  });

  it('needs exactly one JSON-LD block', () => {
    expect(check(head({}, []))).toEqual(['guide.html: expected one JSON-LD block, found 0']);
  });

  it('needs the JSON-LD to be valid JSON', () => {
    expect(check(head({}, ['{not json']))).toEqual([
      'guide.html: the JSON-LD block is not valid JSON',
    ]);
  });

  it('needs the JSON-LD of the type of the page, at the canonical', () => {
    expect(check(head({}, ['{"@type":"WebSite","url":"https://x.test/"}']))).toEqual([
      'guide.html: the JSON-LD @type must be "Article", found "WebSite"',
      'guide.html: the JSON-LD url must be "https://x.test/guide", found "https://x.test/"',
    ]);
    expect(check(head({}, ['[]']))).toEqual([
      'guide.html: the JSON-LD @type must be "Article", found none',
      'guide.html: the JSON-LD url must be "https://x.test/guide", found none',
    ]);
    expect(check(head({}, ['null']))).toHaveLength(2);
    expect(check(head({}, ['{"@type":["Article"],"url":"https://x.test/guide"}']))).toEqual([
      'guide.html: the JSON-LD @type must be "Article", found none',
    ]);
  });

  it('finds the node of the type of the page in a @graph, at the canonical', () => {
    const crumbs = '{"@type":"BreadcrumbList","itemListElement":[]}';
    expect(
      check(head({}, [`{"@graph":[${crumbs},{"@type":"Article","url":"https://x.test/guide"}]}`])),
    ).toEqual([]);
    expect(check(head({}, [`{"@graph":[${crumbs}]}`]))).toEqual([
      'guide.html: the JSON-LD @type must be "Article", found "BreadcrumbList"',
      'guide.html: the JSON-LD url must be "https://x.test/guide", found none',
    ]);
    expect(check(head({}, ['{"@graph":[]}']))).toHaveLength(2);
  });

  it('reads the types of a page from the path of its canonical', () => {
    const home = head(
      {
        canonical: '<link rel="canonical" href="https://x.test/">',
        'og:url': '<meta property="og:url" content="https://x.test/">',
        'og:type': '<meta property="og:type" content="website">',
      },
      ['{"@type":"WebSite","url":"https://x.test/"}'],
    );
    expect(check(home)).toEqual([]);
  });
});

const crumbs = (...items: (readonly [number, string])[]): string =>
  JSON.stringify({
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([position, item]) => ({
      '@type': 'ListItem',
      position,
      name: 'N',
      item,
    })),
  });

const graph = (...nodes: string[]): string =>
  `{"@context":"https://schema.org","@graph":[${nodes.join(',')}]}`;

const ARTICLE = '{"@type":"Article","url":"https://x.test/guide"}';

describe('seoProblems on a JSON-LD graph', () => {
  const crumbed: SeoRules = {
    ...RULES,
    breadcrumbHomeOf: (path) => (path === '/' ? undefined : '/'),
  };
  const checkCrumbed = (html: string): string[] =>
    seoProblems(new Map([['guide.html', html]]), crumbed);

  it('reads the type and the url of the page from the first node of its @graph', () => {
    const ld = graph(ARTICLE, crumbs([1, 'https://x.test/'], [2, 'https://x.test/guide']));
    expect(check(head({}, [ld]))).toEqual([]);
    expect(checkCrumbed(head({}, [ld]))).toEqual([]);
    expect(check(head({}, [graph('{"@type":"WebSite","url":"https://x.test/"}')]))).toEqual([
      'guide.html: the JSON-LD @type must be "Article", found "WebSite"',
      'guide.html: the JSON-LD url must be "https://x.test/guide", found "https://x.test/"',
    ]);
  });

  it('needs a breadcrumb where the rules ask for one, and only there', () => {
    expect(checkCrumbed(head())).toEqual(['guide.html: the JSON-LD needs a BreadcrumbList']);
    expect(check(head())).toEqual([]);
  });

  it('needs the breadcrumb numbered from 1, from the home to the page itself', () => {
    const skipped = graph(ARTICLE, crumbs([1, 'https://x.test/'], [3, 'https://x.test/a']));
    expect(checkCrumbed(head({}, [skipped]))).toEqual([
      'guide.html: the BreadcrumbList must be numbered 1 to 2, found 1, 3',
      'guide.html: the BreadcrumbList must end at "https://x.test/guide", found "https://x.test/a"',
    ]);
    const elsewhere = graph(ARTICLE, crumbs([1, 'https://x.test/a'], [2, 'https://x.test/guide']));
    expect(checkCrumbed(head({}, [elsewhere]))).toEqual([
      'guide.html: the BreadcrumbList must start at "https://x.test/", found "https://x.test/a"',
    ]);
  });

  it('needs the breadcrumb to list its steps', () => {
    expect(checkCrumbed(head({}, [graph(ARTICLE, '{"@type":"BreadcrumbList"}')]))).toEqual([
      'guide.html: the BreadcrumbList must be numbered 1 to 0, found none',
      'guide.html: the BreadcrumbList must start at "https://x.test/", found none',
      'guide.html: the BreadcrumbList must end at "https://x.test/guide", found none',
    ]);
  });

  it('refuses FAQ and HowTo markup', () => {
    const spam = graph(ARTICLE, '{"@type":"FAQPage"}', '{"@type":"HowTo"}');
    expect(check(head({}, [spam]))).toEqual([
      'guide.html: the JSON-LD must not hold a FAQPage node',
      'guide.html: the JSON-LD must not hold a HowTo node',
    ]);
  });
});

const HEAD: Omit<HeadRules, 'sitemap'> = {
  languages: ['en-US', 'es-US'],
  title: { max: 30 },
  description: { min: 10, max: 40 },
};

/** A page in `lang` at `path` of the pair `en`/`es`, with its alternates. */
const page = (
  lang: 'en' | 'es',
  pair: { readonly en: string; readonly es: string },
  text: { readonly title?: string; readonly description?: string } = {},
  extra = '',
): string => {
  const url = (path: string): string => `https://x.test${path}`;
  const own = lang === 'en' ? pair.en : pair.es;
  return [
    `<!doctype html><html lang="${lang}"><head>`,
    `<title>${text.title ?? `Title ${own}`}</title>`,
    `<meta name="description" content="${text.description ?? `About the page ${own}`}">`,
    `<link rel="canonical" href="${url(own)}">`,
    `<link rel="alternate" hreflang="en-US" href="${url(pair.en)}">`,
    `<link rel="alternate" hreflang="es-US" href="${url(pair.es)}">`,
    `<link rel="alternate" hreflang="x-default" href="${url(pair.en)}">`,
    extra,
    '</head><body></body></html>',
  ].join('');
};

const entry = (loc: string, pair: { readonly en: string; readonly es: string }): string =>
  [
    `<url><loc>https://x.test${loc}</loc>`,
    `<xhtml:link rel="alternate" hreflang="en-US" href="https://x.test${pair.en}"/>`,
    `<xhtml:link rel="alternate" hreflang="es-US" href="https://x.test${pair.es}"/>`,
    `<xhtml:link rel="alternate" hreflang="x-default" href="https://x.test${pair.en}"/>`,
    '</url>',
  ].join('');

const PAIR = { en: '/a', es: '/es/a' };
const SITEMAP = `<urlset>${entry('/a', PAIR)}${entry('/es/a', PAIR)}</urlset>`;

const site = (pages: Record<string, string>, sitemap = SITEMAP): string[] =>
  headProblems(new Map(Object.entries(pages)), { ...HEAD, sitemap });

describe('headProblems', () => {
  const both = { 'a.html': page('en', PAIR), 'es/a.html': page('es', PAIR) };

  it('finds nothing on a pair of pages that name each other and the sitemap', () => {
    expect(site(both)).toEqual([]);
  });

  it('skips a page that is never indexed', () => {
    const hidden = '<html lang="en"><head><meta name="robots" content="noindex"></head></html>';
    expect(site({ ...both, '404.html': hidden })).toEqual([]);
  });

  it('needs a title and a description of a searchable length', () => {
    const short = page('en', PAIR, { title: 'T'.repeat(31), description: 'Short' });
    expect(site({ ...both, 'a.html': short })).toEqual([
      'a.html: the title is 31 characters, more than 30',
      'a.html: the description is 5 characters, outside 10 to 40',
    ]);
    const bare = page('en', PAIR, { title: '', description: '' });
    expect(site({ ...both, 'a.html': bare })).toContain('a.html: no title');
  });

  it('needs every title and description used once in the site', () => {
    const twin = page('es', PAIR, { title: 'Title /a', description: 'About the page /a' });
    expect(site({ ...both, 'es/a.html': twin })).toEqual([
      'a.html, es/a.html: share the title "Title /a"',
      'a.html, es/a.html: share the description "About the page /a"',
    ]);
  });

  it('needs the language of the page to be the one its canonical has in the alternates', () => {
    const swapped = page('en', PAIR).replace('lang="en"', 'lang="es"');
    expect(site({ ...both, 'a.html': swapped })).toEqual([
      'a.html: <html lang> is "es", and its canonical is the en-US alternate',
    ]);
  });

  it('needs every language and x-default once, x-default at the first language', () => {
    const lost = page('en', PAIR).replace(/<link rel="alternate" hreflang="es-US"[^>]*>/, '');
    expect(site({ ...both, 'a.html': lost })).toContain(
      'a.html: needs one es-US alternate, found 0',
    );
    const elsewhere = page('en', PAIR).replace(
      'hreflang="x-default" href="https://x.test/a"',
      'hreflang="x-default" href="https://x.test/es/a"',
    );
    expect(site({ ...both, 'a.html': elsewhere })).toContain(
      'a.html: x-default must be the en-US alternate "https://x.test/a", found "https://x.test/es/a"',
    );
  });

  it('needs the canonical among the alternates', () => {
    const other = page('en', PAIR).replace(
      '<link rel="canonical" href="https://x.test/a">',
      '<link rel="canonical" href="https://x.test/b">',
    );
    expect(site({ ...both, 'a.html': other })).toContain(
      'a.html: the canonical "https://x.test/b" is none of its alternates',
    );
  });

  it('needs each alternate to be an indexable page that names the same alternates back', () => {
    expect(site({ 'a.html': page('en', PAIR) }, `<urlset>${entry('/a', PAIR)}</urlset>`)).toEqual([
      'a.html: its es-US alternate "https://x.test/es/a" is not an indexable page of the build',
    ]);
    const astray = page('es', { en: '/b', es: '/es/a' });
    expect(site({ ...both, 'es/a.html': astray })).toContain(
      'a.html: its es-US alternate "https://x.test/es/a" does not name the same alternates back',
    );
  });

  it('reads a page with no head as empty, and names what it lacks', () => {
    const bare = '<html><head><link rel="alternate"></head></html>';
    const problems = site({ ...both, 'bare.html': bare }, `${SITEMAP}<url></url>`);
    expect(problems).toEqual(
      expect.arrayContaining([
        'bare.html: no title',
        'bare.html: the description is 0 characters, outside 10 to 40',
        'bare.html: needs one en-US alternate, found 0',
        'bare.html: the canonical none is none of its alternates',
        'bare.html: none is not in the sitemap',
        'sitemap.xml: "" is not an indexable page of the build',
      ]),
    );
  });

  it('needs the sitemap to list every indexable page and nothing else, with its alternates', () => {
    expect(site(both, `<urlset>${entry('/a', PAIR)}${entry('/gone', PAIR)}</urlset>`)).toEqual([
      'es/a.html: "https://x.test/es/a" is not in the sitemap',
      'sitemap.xml: "https://x.test/gone" is not an indexable page of the build',
    ]);
    const wrong = `<urlset>${entry('/a', PAIR)}${entry('/es/a', { en: '/b', es: '/es/a' })}</urlset>`;
    expect(site(both, wrong)).toEqual([
      'sitemap.xml: the alternates of "https://x.test/es/a" are not those of its page',
    ]);
  });
});

/** A page with no alternate at all: one that has no twin yet in a language rollout. */
const single = (lang: string, path: string): string =>
  [
    `<!doctype html><html lang="${lang}"><head>`,
    `<title>Title ${path}</title>`,
    `<meta name="description" content="About the page ${path}">`,
    `<link rel="canonical" href="https://x.test${path}">`,
    '</head><body></body></html>',
  ].join('');

describe('headProblems during a language rollout (partial)', () => {
  const both = { 'a.html': page('en', PAIR), 'es/a.html': page('es', PAIR) };
  const plain = '<url><loc>https://x.test/b</loc></url>';
  const rollout = (pages: Record<string, string>, sitemap: string): string[] =>
    headProblems(new Map(Object.entries(pages)), { ...HEAD, sitemap, partial: true });

  it('refuses a page with no alternate when the rollout is not declared', () => {
    expect(site({ ...both, 'b.html': single('en', '/b') }, `${SITEMAP}${plain}`)).toEqual(
      expect.arrayContaining([
        'b.html: needs one en-US alternate, found 0',
        'b.html: the canonical "https://x.test/b" is none of its alternates',
      ]),
    );
  });

  it('accepts a page with no alternate beside a full pair, its sitemap line plain', () => {
    expect(rollout({ ...both, 'b.html': single('en', '/b') }, `${SITEMAP}${plain}`)).toEqual([]);
  });

  it('needs the language of a page with no alternate to be one of the languages', () => {
    expect(rollout({ ...both, 'b.html': single('fr', '/b') }, `${SITEMAP}${plain}`)).toEqual([
      'b.html: <html lang> is "fr", none of en-US, es-US',
    ]);
  });

  it('still needs a page with any alternate to hold them all, and its twin to exist', () => {
    const lost = page('en', PAIR).replace(/<link rel="alternate" hreflang="es-US"[^>]*>/, '');
    expect(rollout({ ...both, 'a.html': lost }, SITEMAP)).toContain(
      'a.html: needs one es-US alternate, found 0',
    );
    expect(
      rollout({ 'a.html': page('en', PAIR) }, `<urlset>${entry('/a', PAIR)}</urlset>`),
    ).toEqual([
      'a.html: its es-US alternate "https://x.test/es/a" is not an indexable page of the build',
    ]);
  });

  it('still needs the sitemap line of a page with no alternate to carry none', () => {
    const paired = entry('/b', { en: '/b', es: '/es/b' });
    expect(rollout({ ...both, 'b.html': single('en', '/b') }, `${SITEMAP}${paired}`)).toEqual([
      'sitemap.xml: the alternates of "https://x.test/b" are not those of its page',
    ]);
  });
});

/** A PNG signature and the start of an IHDR chunk of `width` by `height`. */
const png = (width: number, height: number): Uint8Array => {
  const bytes = Buffer.alloc(24);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(bytes);
  bytes.writeUInt32BE(13, 8);
  bytes.write('IHDR', 12, 'latin1');
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
};

describe('imageProblems', () => {
  it('finds nothing in a 1200 by 630 PNG', () => {
    expect(imageProblems('og.png', png(1200, 630))).toEqual([]);
  });

  it('needs the image in the build', () => {
    expect(imageProblems('og.png', undefined)).toEqual([
      'og.png: the link preview image is not in the build',
    ]);
  });

  it('needs a PNG of 1200 by 630 pixels', () => {
    expect(imageProblems('og.png', new Uint8Array(30))).toEqual(['og.png: is not a PNG']);
    expect(imageProblems('og.png', png(600, 315))).toEqual([
      'og.png: is 600 by 315 pixels, and a link preview is 1200 by 630',
    ]);
  });
});
