import { describe, expect, it } from 'vitest';
import { contentProblems, countPending, OLD_ADDRESS } from './content.ts';
import { pagesOf } from './files.ts';
import { FIXTURE_ROUTES, fixtureSite, validDist } from './__testing__/page-fixture.ts';

type Edit = (text: string) => string;

const problemsAfter = (
  edits: Readonly<Record<string, Edit>> = {},
  mutate: (dist: Map<string, string>) => void = () => undefined,
) => {
  const site = fixtureSite();
  const dist = validDist(site);
  for (const [file, edit] of Object.entries(edits)) dist.set(file, edit(dist.get(file) ?? ''));
  mutate(dist);
  return contentProblems(pagesOf(dist, FIXTURE_ROUTES), dist, site);
};

const rulesOf = (problems: ReturnType<typeof problemsAfter>, file: string): string[] =>
  problems.filter((entry) => entry.file === file).map((entry) => entry.rule);

const intoMain =
  (markup: string): Edit =>
  (html) =>
    html.replace('</main>', `${markup}</main>`);

describe('content rules over a valid dist', () => {
  it('finds nothing wrong with the valid dist', () => {
    expect(problemsAfter()).toEqual([]);
  });
});

describe('owner-review markers (trust-pages › [TP5])', () => {
  it.each(['ownerReview', 'Draft', 'BORRADOR', 'Pending review'])(
    'fails a page that shows "%s"',
    (text) => {
      expect(
        rulesOf(problemsAfter({ 'about.html': intoMain(`<p>${text}</p>`) }), 'about.html'),
      ).toEqual(['owner-review']);
    },
  );

  it('allows the bare word pending', () => {
    expect(problemsAfter({ 'about.html': intoMain('<p>Pending work, nothing else</p>') })).toEqual(
      [],
    );
  });
});

describe('placeholder address and message keys (trust-pages › [TP18], i18n-catalog › [ICW6])', () => {
  it('fails the old address anywhere in dist, naming the file', () => {
    expect(problemsAfter({}, (dist) => dist.set('notes.txt', `write to ${OLD_ADDRESS}`))).toEqual([
      { file: 'notes.txt', rule: 'old-address', message: `${OLD_ADDRESS} must not appear` },
    ]);
    expect(rulesOf(problemsAfter({ 'about.html': intoMain(OLD_ADDRESS) }), 'about.html')).toEqual([
      'old-address',
    ]);
  });

  it.each(['errors.input', 'calc.rectangle'])('fails the message key %s in a page', (key) => {
    expect(
      rulesOf(problemsAfter({ 'about.html': intoMain(`<p>${key}</p>`) }), 'about.html'),
    ).toEqual(['message-key']);
  });

  it.each(['We fixed the errors. Next', 'the recalc.x file', 'maestrocalc.com', 'calc(1px)'])(
    'accepts the text "%s"',
    (text) => {
      expect(problemsAfter({ 'about.html': intoMain(`<p>${text}</p>`) })).toEqual([]);
    },
  );
});

describe('pending owner reviews (trust-pages › [TP4] evidence)', () => {
  const entry = (status: string): string =>
    `---\nid: about\nownerReview: ${status}\n---\n# About\n`;

  it('counts the entries whose frontmatter says pending', () => {
    expect(countPending([entry('pending'), entry('approved'), entry('pending')])).toBe(2);
  });

  it('is 0 without entries and ignores the word in the body', () => {
    expect(countPending([])).toBe(0);
    expect(countPending(['---\nid: about\n---\nownerReview: pending\n'])).toBe(0);
  });
});

describe('robots.txt (site-seo › [SE9])', () => {
  const robots = (text: string) => problemsAfter({}, (dist) => dist.set('robots.txt', text));
  const valid = 'User-agent: *\nAllow: /\nSitemap: https://maestrocalc.com/sitemap.xml\n';

  it('accepts the three lines', () => {
    expect(robots(valid)).toEqual([]);
  });

  it('fails a missing file', () => {
    expect(problemsAfter({}, (dist) => dist.delete('robots.txt'))).toEqual([
      { file: 'robots.txt', rule: 'robots', message: 'robots.txt is missing' },
    ]);
  });

  it.each([
    ['without a user agent', 'Allow: /\nSitemap: https://maestrocalc.com/sitemap.xml\n'],
    ['with a Disallow: / line', `${valid}Disallow: /private\n`],
    [
      'with the wrong sitemap',
      'User-agent: *\nSitemap: https://maestrocalc.com/sitemap-index.xml\n',
    ],
    ['with two sitemaps', `${valid}Sitemap: https://maestrocalc.com/sitemap.xml\n`],
    ['without a sitemap', 'User-agent: *\nAllow: /\n'],
  ])('fails a robots.txt %s', (_name, text) => {
    expect(rulesOf(robots(text), 'robots.txt')).toEqual(['robots']);
  });
});

describe('sitemap (site-seo › [SE10], [SE11], [SE12])', () => {
  const sitemap = (edit: Edit) => problemsAfter({ 'sitemap.xml': edit });

  it('fails a missing sitemap', () => {
    expect(problemsAfter({}, (dist) => dist.delete('sitemap.xml'))).toEqual([
      { file: 'sitemap.xml', rule: 'sitemap', message: 'sitemap.xml is missing' },
    ]);
  });

  it('names a table URL that the sitemap lacks', () => {
    expect(
      sitemap((xml) =>
        xml.replace(/<url><loc>https:\/\/maestrocalc\.com\/about<\/loc>.*?<\/url>/, ''),
      ),
    ).toEqual([
      {
        file: 'sitemap.xml',
        rule: 'sitemap',
        message: 'missing URL https://maestrocalc.com/about',
      },
    ]);
  });

  it('names a URL outside the table, a 404 and a query string', () => {
    const problems = sitemap((xml) =>
      xml.replace(
        '</urlset>',
        '<url><loc>https://maestrocalc.com/ghost?x=1</loc></url><url><loc>https://maestrocalc.com/404</loc></url></urlset>',
      ),
    );
    expect(problems.map(({ message }) => message)).toEqual([
      'unexpected URL https://maestrocalc.com/ghost?x=1',
      'unexpected URL https://maestrocalc.com/404',
      'URL https://maestrocalc.com/ghost?x=1 has a query string',
    ]);
  });

  it('requires each entry to carry the head alternates of its page', () => {
    expect(
      sitemap((xml) =>
        xml.replace(
          '<xhtml:link rel="alternate" hreflang="x-default" href="https://maestrocalc.com/privacy"/>',
          '<xhtml:link rel="alternate" hreflang="x-default" href="https://maestrocalc.com/"/>',
        ),
      ),
    ).toEqual([
      {
        file: 'sitemap.xml',
        rule: 'sitemap-alternates',
        message:
          'alternates of https://maestrocalc.com/privacy differ from the head of privacy.html',
      },
    ]);
  });

  it('fails a URL listed twice', () => {
    expect(
      sitemap((xml) => {
        const entry =
          /<url><loc>https:\/\/maestrocalc\.com\/about<\/loc>.*?<\/url>/.exec(xml)?.[0] ?? '';
        return xml.replace('</urlset>', `${entry}</urlset>`);
      }),
    ).toEqual([
      {
        file: 'sitemap.xml',
        rule: 'sitemap',
        message: 'duplicate URL https://maestrocalc.com/about',
      },
    ]);
  });

  it('reads XML entities in the URLs', () => {
    expect(
      sitemap((xml) =>
        xml.replace(
          '<loc>https://maestrocalc.com/about</loc>',
          '<loc>https://maestrocalc.com/about&amp;x</loc>',
        ),
      ).map(({ message }) => message),
    ).toEqual([
      'missing URL https://maestrocalc.com/about',
      'unexpected URL https://maestrocalc.com/about&x',
    ]);
  });

  it('allows no other sitemap file', () => {
    const problems = problemsAfter({}, (dist) => {
      dist.set('sitemap-index.xml', '<x/>');
      dist.set('nested/sitemap-0.xml', '<x/>');
    });
    expect(problems).toEqual([
      { file: 'sitemap-index.xml', rule: 'sitemap-index', message: 'only sitemap.xml may exist' },
      {
        file: 'nested/sitemap-0.xml',
        rule: 'sitemap-index',
        message: 'only sitemap.xml may exist',
      },
    ]);
  });
});

describe('structured data (site-seo › [SE6], [SE7], [SE8])', () => {
  const block = (json: string): string => `<script type="application/ld+json">${json}</script>`;
  const home =
    (edit: (graph: string) => string): Edit =>
    (html) =>
      html.replace(/<script type="application\/ld\+json">(.*?)<\/script>/, (_match, json: string) =>
        block(edit(json)),
      );

  it('fails malformed JSON-LD', () => {
    expect(rulesOf(problemsAfter({ 'index.html': home(() => '{"a":') }), 'index.html')).toEqual([
      'json-ld',
    ]);
    expect(
      rulesOf(problemsAfter({ 'about.html': intoMain(block('not json')) }), 'about.html'),
    ).toEqual(['json-ld']);
  });

  it('requires exactly one block on a home page', () => {
    expect(
      rulesOf(
        problemsAfter({
          'es.html': (html) =>
            html.replace(/<script type="application\/ld\+json">.*?<\/script>/, ''),
        }),
        'es.html',
      ),
    ).toEqual(['json-ld']);
    expect(
      rulesOf(
        problemsAfter({ 'es.html': (html) => html.replace('</head>', `${block('{}')}</head>`) }),
        'es.html',
      ),
    ).toContain('json-ld');
  });

  it.each([
    [
      'a logo',
      (json: string) =>
        json.replace(
          '"name":"Maestro Calc","url":"https://maestrocalc.com"}',
          '"name":"Maestro Calc","url":"https://maestrocalc.com","logo":"x"}',
        ),
    ],
    [
      'an image',
      (json: string) =>
        json.replace(
          '"name":"Maestro Calc","url":"https://maestrocalc.com"}',
          '"name":"Maestro Calc","url":"https://maestrocalc.com","image":"x"}',
        ),
    ],
    [
      'the wrong organization name',
      (json: string) =>
        json.replace(
          '"@type":"Organization","@id":"https://maestrocalc.com/#organization","name":"Maestro Calc"',
          '"@type":"Organization","@id":"https://maestrocalc.com/#organization","name":"Other"',
        ),
    ],
    [
      'the wrong organization url',
      (json: string) =>
        json.replace('"url":"https://maestrocalc.com"}', '"url":"https://example.com"}'),
    ],
    [
      'the wrong website url',
      (json: string) =>
        json.replace('"url":"https://maestrocalc.com/"', '"url":"https://maestrocalc.com/es"'),
    ],
    [
      'the wrong language',
      (json: string) => json.replace('"inLanguage":"en-US"', '"inLanguage":"es-US"'),
    ],
    [
      'the wrong website name',
      (json: string) =>
        json.replace('"@type":"WebSite","name":"Maestro Calc"', '"@type":"WebSite","name":"Other"'),
    ],
    [
      'an extra type',
      (json: string) => json.replace('"@graph":[', '"@graph":[{"@type":"Product"},'),
    ],
    ['a missing website', (json: string) => json.replace('"@type":"WebSite"', '"@type":"WebPage"')],
  ])('fails the home page JSON-LD with %s', (_name, edit) => {
    expect(rulesOf(problemsAfter({ 'index.html': home(edit) }), 'index.html')).toEqual(['json-ld']);
  });

  it('treats a graph that is not an object or array as having no nodes', () => {
    expect(rulesOf(problemsAfter({ 'index.html': home(() => '"text"') }), 'index.html')).toEqual([
      'json-ld',
    ]);
    expect(
      rulesOf(problemsAfter({ 'index.html': home(() => '{"@graph":5}') }), 'index.html'),
    ).toEqual(['json-ld']);
  });

  it.each(['Product', 'Review', 'AggregateRating', 'FAQPage', 'BreadcrumbList', 'Person'])(
    'forbids %s on any other page',
    (type) => {
      expect(
        rulesOf(
          problemsAfter({
            'about.html': intoMain(block(`{"@context":"https://schema.org","@type":"${type}"}`)),
          }),
          'about.html',
        ),
      ).toEqual(['json-ld']);
      expect(
        rulesOf(
          problemsAfter({ 'about.html': intoMain(block(`{"@graph":[{"@type":"${type}"}]}`)) }),
          'about.html',
        ),
      ).toEqual(['json-ld']);
    },
  );

  it.each([
    ['a type list', '["Thing","Product"]'],
    ['a one-item type list', '["Review"]'],
  ])('forbids a forbidden type inside %s', (_name, types) => {
    expect(
      rulesOf(problemsAfter({ 'about.html': intoMain(block(`{"@type":${types}}`)) }), 'about.html'),
    ).toEqual(['json-ld']);
    expect(
      rulesOf(
        problemsAfter({ 'about.html': intoMain(block(`{"@graph":[{"@type":${types}}]}`)) }),
        'about.html',
      ),
    ).toEqual(['json-ld']);
  });

  it('accepts a list of allowed types on another page', () => {
    expect(
      problemsAfter({ 'about.html': intoMain(block('{"@type":["Organization","Thing"]}')) }),
    ).toEqual([]);
  });

  it('accepts valid data of an allowed type on another page', () => {
    expect(problemsAfter({ 'about.html': intoMain(block('{"@type":"Organization"}')) })).toEqual(
      [],
    );
  });
});
