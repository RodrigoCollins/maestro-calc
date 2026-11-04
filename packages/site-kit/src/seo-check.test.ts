import { describe, expect, it } from 'vitest';
import { imageProblems, seoProblems, type SeoRules } from './seo-check.ts';

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
