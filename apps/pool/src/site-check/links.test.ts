import { describe, expect, it } from 'vitest';
import { inboundOf, linkProblems, linksOf, type LinkRules } from './links.ts';

const ORIGIN = 'https://poolfigures.com';

const page = (body: string, footer = ''): string =>
  `<html><body><header><a href="/">Pool Figures</a></header><main>${body}</main><footer class="pool-footer">${footer}</footer></body></html>`;

const a = (href: string): string => `<a href="${href}">x</a>`;

const FOOTER = a('/guide');

const RULES: LinkRules = {
  origin: ORIGIN,
  sitemap: ['/', '/calc', '/job-1', '/job-2', '/guide'],
  jobs: [
    { path: '/job-1', calculator: '/calc', neighbors: ['/job-2'] },
    { path: '/job-2', calculator: '/calc', neighbors: ['/job-1'] },
  ],
  guides: [{ path: '/guide', calculators: ['/calc'] }],
};

const SITE: ReadonlyMap<string, string> = new Map([
  [
    '/',
    page(`<section aria-labelledby="pool-guides">${a('/guide')}</section>${a('/calc')}`, FOOTER),
  ],
  ['/calc', page(`${a('/job-1')}${a('/job-2')}${a('/guide')}`, FOOTER)],
  ['/job-1', page(`${a('/calc?gallons=1')}${a('/job-2')}`, FOOTER)],
  ['/job-2', page(`${a('/calc#top')}${a('/job-1')}`, FOOTER)],
  ['/guide', page(a('/calc'), FOOTER)],
]);

const without = (path: string, html: string): ReadonlyMap<string, string> =>
  new Map([...SITE, [path, html]]);

describe('linksOf', () => {
  it('reads the internal links of a page as canonical paths, without query or fragment', () => {
    const html = `${a('/calc?gallons=1')}${a('/calc#x')}${a(`${ORIGIN}/guide`)}${a('https://example.com/a')}${a('#local')}${a('mailto:a@b.c')}${a('/about.html')}`;
    expect([...linksOf(html, ORIGIN)].sort()).toEqual(['/about', '/calc', '/guide']);
  });

  it('reads the href of an anchor that carries other attributes first', () => {
    expect([...linksOf('<a class="b" data-x="1" href="/calc">c</a>', ORIGIN)]).toEqual(['/calc']);
  });
});

describe('inboundOf', () => {
  it('counts, for every sitemap page, the other sitemap pages that link it', () => {
    const inbound = inboundOf(SITE, RULES);
    expect(inbound.get('/job-1')).toBe(2);
    expect(inbound.get('/guide')).toBe(4);
    expect(inbound.get('/')).toBe(4);
  });
});

describe('linkProblems', () => {
  it('passes a site whose pages link one another as the rules ask', () => {
    expect(linkProblems(SITE, RULES)).toEqual([]);
  });

  it('names a job page its calculator does not link', () => {
    const site = without('/calc', page(`${a('/job-2')}${a('/guide')}`, FOOTER));
    expect(linkProblems(site, RULES)).toContain('/calc: must link its job page /job-1');
  });

  it('names a job page that does not link back to its calculator', () => {
    const site = without('/job-1', page(a('/job-2'), FOOTER));
    expect(linkProblems(site, RULES)).toContain('/job-1: must link its calculator /calc');
  });

  it('reads a relation in the main content only, not in the header or the footer', () => {
    const html = page(a('/job-2'), `${FOOTER}${a('/calc')}`).replace(
      '<header>',
      `<header>${a('/calc')}`,
    );
    expect(linkProblems(without('/job-1', html), RULES)).toContain(
      '/job-1: must link its calculator /calc',
    );
  });

  it('names a job page that does not link a nearest sibling', () => {
    const site = without('/job-1', page(a('/calc'), FOOTER));
    expect(linkProblems(site, RULES)).toContain('/job-1: must link its sibling /job-2');
  });

  describe('a job page a guide sizes', () => {
    const rules: LinkRules = {
      ...RULES,
      jobs: [
        { path: '/job-1', calculator: '/calc', neighbors: ['/job-2'], guide: '/guide' },
        { path: '/job-2', calculator: '/calc', neighbors: ['/job-1'] },
      ],
    };
    const linked = new Map([
      ...SITE,
      ['/job-1', page(`${a('/calc')}${a('/job-2')}${a('/guide')}`, FOOTER)],
      ['/guide', page(`${a('/calc')}${a('/job-1')}`, FOOTER)],
    ]);

    it('passes when the job page and its guide link each other', () => {
      expect(linkProblems(linked, rules)).toEqual([]);
    });

    it('names a job page that does not link its guide', () => {
      const site = new Map([...linked, ['/job-1', page(`${a('/calc')}${a('/job-2')}`, FOOTER)]]);
      expect(linkProblems(site, rules)).toEqual(['/job-1: must link its guide /guide']);
    });

    it('names a guide that does not link its job page', () => {
      const site = new Map([...linked, ['/guide', page(a('/calc'), FOOTER)]]);
      expect(linkProblems(site, rules)).toEqual(['/guide: must link its job page /job-1']);
    });
  });

  it('names a guide the home Guides list leaves out', () => {
    const site = without(
      '/',
      page(`<section aria-labelledby="pool-guides"></section>${a('/guide')}`, FOOTER),
    );
    expect(linkProblems(site, RULES)).toContain('/: the Guides list must link /guide');
  });

  it('names a page whose footer leaves a guide out', () => {
    const site = without('/job-2', page(`${a('/calc')}${a('/job-1')}${a('/guide')}`));
    expect(linkProblems(site, RULES)).toContain('/job-2: the footer must link the guide /guide');
  });

  // a Spanish page's footer links the Spanish twin of a guide, the page in its own language
  it('reads each footer link in the language of its page, when the rules say how', () => {
    const site = new Map([...SITE, ['/es', page(a('/'), a('/es/guia'))]]);
    const plain: LinkRules = { ...RULES, sitemap: [...RULES.sitemap, '/es'] };
    const rules: LinkRules = {
      ...plain,
      localize: (target, path) =>
        path.startsWith('/es') && target === '/guide' ? '/es/guia' : target,
    };
    expect(linkProblems(site, rules).filter((line) => line.includes('footer'))).toEqual([]);
    expect(linkProblems(site, plain)).toContain('/es: the footer must link the guide /guide');
  });

  it('names a calculator that does not link a guide that explains it', () => {
    const site = without('/calc', page(`${a('/job-1')}${a('/job-2')}`, FOOTER));
    expect(linkProblems(site, RULES)).toContain('/calc: must link its guide /guide');
  });

  it('names a guide that does not link a calculator it explains', () => {
    const site = without('/guide', page('', FOOTER));
    expect(linkProblems(site, RULES)).toContain(
      '/guide: must link the calculator it explains, /calc',
    );
  });

  describe('the data index', () => {
    const DATA_FOOTER = `${FOOTER}${a('/data')}`;
    const rules: LinkRules = {
      ...RULES,
      sitemap: [...RULES.sitemap, '/data'],
      data: [{ index: '/data', pages: ['/guide'] }],
    };
    const pages: readonly (readonly [string, string])[] = [
      ...SITE,
      ['/guide', page(`${a('/calc')}${a('/data')}`, FOOTER)],
      ['/data', page(a('/guide'), FOOTER)],
    ];
    const linked = new Map(
      pages.map(([path, html]) => [
        path,
        html.replace(`${FOOTER}</footer>`, `${DATA_FOOTER}</footer>`),
      ]),
    );

    it('passes when the index and each data page link each other, and every footer links it', () => {
      expect(linkProblems(linked, rules)).toEqual([]);
    });

    it('names a data page that does not link the index', () => {
      const site = new Map([...linked, ['/guide', page(a('/calc'), DATA_FOOTER)]]);
      expect(linkProblems(site, rules)).toEqual(['/guide: must link the data index /data']);
    });

    it('names a data page the index does not list', () => {
      const site = new Map([...linked, ['/data', page('', DATA_FOOTER)]]);
      expect(linkProblems(site, rules)).toEqual(['/data: must list the data page /guide']);
    });

    it('names a page whose footer leaves the index out', () => {
      const site = new Map([...linked, ['/job-2', page(`${a('/calc')}${a('/job-1')}`, FOOTER)]]);
      expect(linkProblems(site, rules)).toEqual([
        '/job-2: the footer must link the data index /data',
      ]);
    });
  });

  // a footer links each guide in the language of its page: the Spanish twin once it is built
  describe('the guides of a Spanish footer', () => {
    const rules: LinkRules = {
      ...RULES,
      sitemap: [...RULES.sitemap, '/es/guia'],
      localize: (target, path) =>
        path.startsWith('/es/') && target === '/guide' ? '/es/guia' : target,
    };
    const site = new Map([
      ...SITE,
      ['/calc', page(`${a('/job-1')}${a('/job-2')}${a('/guide')}${a('/es/guia')}`, FOOTER)],
      ['/es/guia', page(a('/calc'), a('/es/guia'))],
    ]);

    it('passes when the Spanish footer links the Spanish guide', () => {
      expect(linkProblems(site, rules)).toEqual([]);
    });

    it('names a Spanish footer that links the English guide only', () => {
      const broken = new Map([...site, ['/es/guia', page(a('/calc'), FOOTER)]]);
      expect(linkProblems(broken, rules)).toContain(
        '/es/guia: the footer must link the guide /es/guia',
      );
    });
  });

  // each language has its own index: a page's footer links the index of its own language
  describe('a data index per language', () => {
    const rules: LinkRules = {
      ...RULES,
      sitemap: [...RULES.sitemap, '/data', '/es/data', '/es/guide'],
      data: [
        { index: '/data', pages: ['/guide'], footers: [...RULES.sitemap, '/data'] },
        { index: '/es/data', pages: ['/es/guide'], footers: ['/es/data', '/es/guide'] },
      ],
    };
    const en = `${FOOTER}${a('/data')}`;
    const es = `${FOOTER}${a('/es/data')}`;
    const site = new Map([
      ...[...SITE].map(
        ([path, html]) => [path, html.replace(`${FOOTER}</footer>`, `${en}</footer>`)] as const,
      ),
      ['/guide', page(`${a('/calc')}${a('/data')}`, en)],
      ['/data', page(`${a('/guide')}${a('/es/data')}`, en)],
      ['/es/guide', page(a('/es/data'), es)],
      ['/es/data', page(a('/es/guide'), es)],
    ]);

    it('passes when every footer links the index of its language', () => {
      expect(linkProblems(site, rules)).toEqual([]);
    });

    it('names a Spanish page whose footer links the English index only', () => {
      const broken = new Map([...site, ['/es/guide', page(a('/es/data'), en)]]);
      expect(linkProblems(broken, rules)).toEqual([
        '/es/guide: the footer must link the data index /es/data',
      ]);
    });
  });

  it('names a sitemap page no other page links', () => {
    const rules = { ...RULES, sitemap: [...RULES.sitemap, '/lost'] };
    const site = new Map([...SITE, ['/lost', page(a('/lost'), FOOTER)]]);
    expect(linkProblems(site, rules)).toEqual(['/lost: no other page in the sitemap links it']);
  });

  it('names a page of the rules the build does not hold', () => {
    const site = new Map([...SITE].filter(([path]) => path !== '/job-2'));
    expect(linkProblems(site, RULES)).toContain('/job-2: a page the build does not hold');
  });
});
