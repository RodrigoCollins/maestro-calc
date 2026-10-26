import { describe, expect, it } from 'vitest';
import { contentProblems, countPending, OLD_ADDRESS, sourceUrlsOf, updatedOf } from './content.ts';
import { SITE } from '../site.config.ts';
import { calculatorSite, contextOf, fixtureSite, validDist } from './__testing__/page-fixture.ts';

type Edit = (text: string) => string;

const problemsAfter = (
  edits: Readonly<Record<string, Edit>> = {},
  mutate: (dist: Map<string, string>) => void = () => undefined,
) => {
  const site = fixtureSite();
  const dist = validDist(site);
  for (const [file, edit] of Object.entries(edits)) dist.set(file, edit(dist.get(file) ?? ''));
  mutate(dist);
  return contentProblems(contextOf(dist, site));
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

  it.each([
    'drafting a new guide',
    'los borradores de la guía',
    'write to calc.example for details',
    'redrafted and ownerReviewer-free',
  ])('allows the benign text "%s" (JD-1)', (text) => {
    expect(problemsAfter({ 'about.html': intoMain(`<p>${text}</p>`) })).toEqual([]);
  });

  it('ignores markers inside script and style bodies and attribute values', () => {
    expect(
      problemsAfter({
        'about.html': intoMain(
          '<style>.draft{color:red}</style><p class="borrador" title="ownerReview">ok</p>',
        ),
      }),
    ).toEqual([]);
  });

  it('still fails a marker inside an HTML comment', () => {
    expect(
      rulesOf(problemsAfter({ 'about.html': intoMain('<!-- draft -->') }), 'about.html'),
    ).toEqual(['owner-review']);
  });

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

  it.each(['errors.input', 'errors.EMPTY', 'calc.rectangle-area.title'])(
    'fails the message key %s in a page',
    (key) => {
      expect(
        rulesOf(problemsAfter({ 'about.html': intoMain(`<p>${key}</p>`) }), 'about.html'),
      ).toEqual(['message-key']);
    },
  );

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

  it('reads the site name from the injected site, not the site config', () => {
    const site = { ...fixtureSite(), config: { ...SITE, name: 'Other Co' } };
    const dist = validDist(site);
    for (const file of ['index.html', 'es.html']) {
      dist.set(
        file,
        (dist.get(file) ?? '').replaceAll(`"name":"${SITE.name}"`, '"name":"Other Co"'),
      );
    }
    expect(
      contentProblems(contextOf(dist, site)).filter((entry) => entry.rule === 'json-ld'),
    ).toEqual([]);
  });

  it('accepts valid data of an allowed type on another page', () => {
    expect(problemsAfter({ 'about.html': intoMain(block('{"@type":"Organization"}')) })).toEqual(
      [],
    );
  });
});

describe('trust page update date (trust-pages › [TP6] built side)', () => {
  const dateOf = (about: string) => (html: string) =>
    html.replace(/<time datetime="[^"]*">/, `<time datetime="${about}">`);

  it('accepts a time element equal to the entry date on every trust page', () => {
    expect(problemsAfter()).toEqual([]);
  });

  it('names a page whose time differs from its entry', () => {
    expect(problemsAfter({ 'about.html': dateOf('2026-10-22') })).toEqual([
      {
        file: 'about.html',
        rule: 'updated',
        message: 'time datetime "2026-10-22" is not the entry date 2026-10-23 of en/about',
      },
    ]);
  });

  it('names the Spanish counterpart by its own entry', () => {
    expect(
      problemsAfter({ 'es/sobre-nosotros.html': dateOf('2025-01-01') }).map(
        ({ file, message }) => ({ file, message }),
      ),
    ).toEqual([
      {
        file: 'es/sobre-nosotros.html',
        message: 'time datetime "2025-01-01" is not the entry date 2026-10-23 of es/about',
      },
    ]);
  });

  it('fails a trust page without a time element or with two', () => {
    const none = (html: string) => html.replace(/<p><time[^>]*>[^<]*<\/time><\/p>/, '');
    const two = (html: string) =>
      html.replace('</main>', '<time datetime="2026-10-23">x</time></main>');
    expect(rulesOf(problemsAfter({ 'privacy.html': none }), 'privacy.html')).toEqual(['updated']);
    expect(rulesOf(problemsAfter({ 'privacy.html': two }), 'privacy.html')).toEqual(['updated']);
  });

  it('fails a trust page that has no content entry', () => {
    const site = fixtureSite();
    const dist = validDist(site);
    const updates = Object.fromEntries(
      Object.entries(site.updates).filter(([key]) => key !== 'en/about'),
    );
    expect(
      contentProblems(contextOf(dist, { ...site, updates })).filter(
        ({ file }) => file === 'about.html',
      ),
    ).toEqual([{ file: 'about.html', rule: 'updated', message: 'no content entry for en/about' }]);
  });

  it('ignores the home and not-found pages', () => {
    const withTime = (html: string) =>
      html.replace('</main>', '<time datetime="1999-01-01">x</time></main>');
    expect(problemsAfter({ 'index.html': withTime, '404.html': withTime })).toEqual([]);
  });

  it('reads the date from the frontmatter, with or without quotes', () => {
    expect(updatedOf('---\nid: about\nupdated: 2026-10-23\nownerReview: pending\n---\n# A')).toBe(
      '2026-10-23',
    );
    expect(updatedOf('---\nupdated: "2026-10-23"\n---\n')).toBe('2026-10-23');
    expect(updatedOf('---\nid: about\n---\nupdated: 2026-10-23\n')).toBeUndefined();
    expect(updatedOf('# no frontmatter')).toBeUndefined();
  });
});

// ---- the calculator template: exactly WebApplication, BreadcrumbList and FAQPage ----

interface Node extends Record<string, unknown> {
  '@type': string;
}
interface Graph {
  '@graph': Node[];
}

const CALC_PAGE = 'concrete-calculator.html';
const CALC_ES = 'es/calculadora-de-concreto.html';
const LD = /<script type="application\/ld\+json">(.*?)<\/script>/;

/** Content problems of a valid dist with a calculator page, after `edit` changed its JSON-LD graph or its HTML. */
const calcProblemsAfter = (
  edits: Readonly<Record<string, (graph: Node[]) => Node[]>> = {},
  html: Readonly<Record<string, Edit>> = {},
) => {
  const site = calculatorSite();
  const dist = validDist(site);
  for (const [file, edit] of Object.entries(edits)) {
    dist.set(
      file,
      (dist.get(file) ?? '').replace(LD, (_match, json: string) => {
        const graph = JSON.parse(json) as Graph;
        return `<script type="application/ld+json">${JSON.stringify({ ...graph, '@graph': edit(graph['@graph']) })}</script>`;
      }),
    );
  }
  for (const [file, edit] of Object.entries(html)) dist.set(file, edit(dist.get(file) ?? ''));
  return contentProblems(contextOf(dist, site));
};

const messagesOf = (problems: ReturnType<typeof calcProblemsAfter>, file: string): string[] =>
  problems
    .filter((entry) => entry.file === file && entry.rule === 'json-ld')
    .map((entry) => entry.message);

const at = <T>(list: readonly T[], index: number): T => {
  const found = list[index];
  if (found === undefined) throw new Error(`no item ${String(index)}`);
  return found;
};

/** The items of the BreadcrumbList or the questions of the FAQPage of a graph. */
const listOf = (graph: Node[], type: string, key: string): Node[] => {
  const list = node(graph, type)[key];
  if (!Array.isArray(list)) throw new Error(`${type} has no ${key}`);
  return list as Node[];
};

const node = (graph: Node[], type: string): Node => {
  const found = graph.find((entry) => entry['@type'] === type);
  if (found === undefined) throw new Error(`no ${type}`);
  return found;
};

describe('calculator structured data (site-seo › [SE19], [SE20], [SE21], [SE22])', () => {
  // spec: site-seo › [SE19] the three types with the values of the spec, in both locales
  it('accepts the valid calculator pages', () => {
    expect(calcProblemsAfter()).toEqual([]);
  });

  // spec: site-seo › [SE21] a forbidden property or type fails, naming the page and the property
  it.each([
    [
      'offers',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['offers'] = {};
        return graph;
      },
      'the WebApplication must not have offers',
    ],
    [
      'aggregateRating',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['aggregateRating'] = {};
        return graph;
      },
      'the WebApplication must not have aggregateRating',
    ],
    [
      'review',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['review'] = {};
        return graph;
      },
      'the WebApplication must not have review',
    ],
    [
      'ratingValue',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['ratingValue'] = 5;
        return graph;
      },
      'the WebApplication must not have ratingValue',
    ],
    [
      'image',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['image'] = 'x';
        return graph;
      },
      'the WebApplication must not have image',
    ],
    [
      'a Product node',
      (graph: Node[]) => [...graph, { '@type': 'Product' }],
      'Product is not allowed on this page',
    ],
    [
      'an AggregateRating node',
      (graph: Node[]) => [...graph, { '@type': 'AggregateRating' }],
      'AggregateRating is not allowed on this page',
    ],
    [
      'a Person node',
      (graph: Node[]) => [...graph, { '@type': 'Person' }],
      'Person is not allowed on this page',
    ],
    [
      'a second WebApplication',
      (graph: Node[]) => [...graph, { ...node(graph, 'WebApplication') }],
      'expected exactly one WebApplication, found 2',
    ],
  ])('fails %s', (_name, edit, message) => {
    expect(messagesOf(calcProblemsAfter({ [CALC_PAGE]: edit }), CALC_PAGE)).toContain(message);
  });

  // spec: site-seo › [SE22] a missing type fails, naming the page and the type
  it.each(['WebApplication', 'BreadcrumbList', 'FAQPage'])(
    'fails a page without its %s',
    (type) => {
      const found = messagesOf(
        calcProblemsAfter({
          [CALC_ES]: (graph) => graph.filter((entry) => entry['@type'] !== type),
        }),
        CALC_ES,
      );
      expect(found).toContain(`expected exactly one ${type}, found 0`);
    },
  );

  it('fails a page without any JSON-LD block', () => {
    expect(
      messagesOf(calcProblemsAfter({}, { [CALC_PAGE]: (h) => h.replace(LD, '') }), CALC_PAGE),
    ).toEqual([
      'expected exactly one WebApplication, found 0',
      'expected exactly one BreadcrumbList, found 0',
      'expected exactly one FAQPage, found 0',
    ]);
  });

  // spec: site-seo › [SE19] the property values
  it.each([
    [
      'name',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['name'] = 'Other';
        return graph;
      },
      'the WebApplication name must be the h1 "Heading of concrete"',
    ],
    [
      'url',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['url'] = 'https://maestrocalc.com/x';
        return graph;
      },
      'the WebApplication url must be https://maestrocalc.com/concrete-calculator',
    ],
    [
      'inLanguage',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['inLanguage'] = 'es-US';
        return graph;
      },
      'the WebApplication inLanguage must be en-US',
    ],
    [
      'applicationCategory',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['applicationCategory'] = 'Game';
        return graph;
      },
      'the WebApplication applicationCategory must be UtilitiesApplication',
    ],
    [
      'operatingSystem',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['operatingSystem'] = 'iOS';
        return graph;
      },
      'the WebApplication operatingSystem must be Any',
    ],
    [
      'isAccessibleForFree',
      (graph: Node[]) => {
        node(graph, 'WebApplication')['isAccessibleForFree'] = 'true';
        return graph;
      },
      'the WebApplication isAccessibleForFree must be true',
    ],
  ])('fails a WebApplication with the wrong %s', (_name, edit, message) => {
    expect(messagesOf(calcProblemsAfter({ [CALC_PAGE]: edit }), CALC_PAGE)).toEqual([message]);
  });

  it.each([
    [
      'one item',
      (graph: Node[]) => {
        node(graph, 'BreadcrumbList')['itemListElement'] = [
          (node(graph, 'BreadcrumbList')['itemListElement'] as unknown[])[0],
        ];
        return graph;
      },
    ],
    [
      'a wrong home name',
      (graph: Node[]) => {
        at(listOf(graph, 'BreadcrumbList', 'itemListElement'), 0)['name'] = 'Start';
        return graph;
      },
    ],
    [
      'a wrong home item',
      (graph: Node[]) => {
        at(listOf(graph, 'BreadcrumbList', 'itemListElement'), 0)['item'] =
          'https://maestrocalc.com/es';
        return graph;
      },
    ],
    [
      'a wrong second name',
      (graph: Node[]) => {
        at(listOf(graph, 'BreadcrumbList', 'itemListElement'), 1)['name'] = 'Other';
        return graph;
      },
    ],
    [
      'a wrong second item',
      (graph: Node[]) => {
        at(listOf(graph, 'BreadcrumbList', 'itemListElement'), 1)['item'] =
          'https://maestrocalc.com/x';
        return graph;
      },
    ],
  ])('fails a BreadcrumbList with %s', (_name, edit) => {
    expect(messagesOf(calcProblemsAfter({ [CALC_PAGE]: edit }), CALC_PAGE)).toEqual([
      'the BreadcrumbList must be Home (https://maestrocalc.com/) then the page (name and canonical)',
    ]);
  });

  it('names Inicio and the Spanish home for the Spanish page', () => {
    expect(
      messagesOf(
        calcProblemsAfter({
          [CALC_ES]: (graph) => {
            at(listOf(graph, 'BreadcrumbList', 'itemListElement'), 0)['name'] = 'Home';
            return graph;
          },
        }),
        CALC_ES,
      ),
    ).toEqual([
      'the BreadcrumbList must be Inicio (https://maestrocalc.com/es) then the page (name and canonical)',
    ]);
  });

  // spec: site-seo › [SE20] FAQ parity, one to one, in order, at least four
  it('fails a FAQ question that the page does not show, and a shown one that is missing', () => {
    const found = messagesOf(
      calcProblemsAfter({
        [CALC_PAGE]: (graph) => {
          const faq = node(graph, 'FAQPage');
          faq['mainEntity'] = [
            ...(faq['mainEntity'] as Node[]),
            {
              '@type': 'Question',
              name: 'Hidden?',
              acceptedAnswer: { '@type': 'Answer', text: 'x' },
            },
          ];
          return graph;
        },
      }),
      CALC_PAGE,
    );
    expect(found).toEqual(['the FAQPage has 5 questions and the page shows 4']);
  });

  it('fails a different question text, a different answer and a different order', () => {
    const entities = (graph: Node[]) => listOf(graph, 'FAQPage', 'mainEntity');
    expect(
      messagesOf(
        calcProblemsAfter({
          [CALC_PAGE]: (graph) => {
            at(entities(graph), 1)['name'] = 'Changed?';
            return graph;
          },
        }),
        CALC_PAGE,
      ),
    ).toEqual(['FAQ question 2 "Question 2 in en?" is "Changed?" in the FAQPage']);
    expect(
      messagesOf(
        calcProblemsAfter({
          [CALC_PAGE]: (graph) => {
            (at(entities(graph), 2)['acceptedAnswer'] as Node)['text'] = 'Different.';
            return graph;
          },
        }),
        CALC_PAGE,
      ),
    ).toEqual(['FAQ answer 3 of the page differs from the FAQPage']);
    expect(
      messagesOf(
        calcProblemsAfter({
          [CALC_PAGE]: (graph) => {
            const list = entities(graph);
            node(graph, 'FAQPage')['mainEntity'] = [list[1], list[0], list[2], list[3]];
            return graph;
          },
        }),
        CALC_PAGE,
      ).length,
    ).toBeGreaterThan(0);
  });

  it('reads a missing mainEntity, a missing answer and a missing item list as empty', () => {
    expect(
      messagesOf(
        calcProblemsAfter({
          [CALC_PAGE]: (graph) => {
            delete node(graph, 'FAQPage')['mainEntity'];
            return graph;
          },
        }),
        CALC_PAGE,
      ),
    ).toEqual(['the FAQPage has 0 questions and the page shows 4']);
    expect(
      messagesOf(
        calcProblemsAfter({
          [CALC_PAGE]: (graph) => {
            delete at(listOf(graph, 'FAQPage', 'mainEntity'), 0)['acceptedAnswer'];
            return graph;
          },
        }),
        CALC_PAGE,
      ),
    ).toEqual(['FAQ answer 1 of the page differs from the FAQPage']);
    expect(
      messagesOf(
        calcProblemsAfter({
          [CALC_PAGE]: (graph) => {
            delete node(graph, 'BreadcrumbList')['itemListElement'];
            return graph;
          },
        }),
        CALC_PAGE,
      ),
    ).toEqual([
      'the BreadcrumbList must be Home (https://maestrocalc.com/) then the page (name and canonical)',
    ]);
  });

  it('compares with an empty heading when the page has no h1', () => {
    expect(
      messagesOf(
        calcProblemsAfter(
          {},
          { [CALC_PAGE]: (h) => h.replace('<h1>Heading of concrete</h1>', '') },
        ),
        CALC_PAGE,
      ),
    ).toEqual([
      'the WebApplication name must be the h1 ""',
      'the BreadcrumbList must be Home (https://maestrocalc.com/) then the page (name and canonical)',
    ]);
  });

  it('ignores whitespace differences between the visible answer and the JSON-LD', () => {
    expect(
      calcProblemsAfter(
        {},
        {
          [CALC_PAGE]: (h) => h.replace('<p>Answer 1 in en.</p>', '<p>  Answer 1\n in   en. </p>'),
        },
      ),
    ).toEqual([]);
  });

  it('requires at least four visible FAQ items', () => {
    const three = (h: string) =>
      h.replace(/<h3>Question 4 in en\?<\/h3><p>Answer 4 in en\.<\/p>/, '');
    const dropLast = (graph: Node[]) => {
      const faq = node(graph, 'FAQPage');
      faq['mainEntity'] = listOf(graph, 'FAQPage', 'mainEntity').slice(0, 3);
      return graph;
    };
    expect(
      messagesOf(calcProblemsAfter({ [CALC_PAGE]: dropLast }, { [CALC_PAGE]: three }), CALC_PAGE),
    ).toEqual(['the page needs at least 4 FAQ items, found 3']);
  });

  it('finds no FAQ section on a page without the FAQ heading', () => {
    expect(
      messagesOf(
        calcProblemsAfter({}, { [CALC_PAGE]: (h) => h.replace('id="faq"', 'id="questions"') }),
        CALC_PAGE,
      ),
    ).toContain('the page needs at least 4 FAQ items, found 0');
  });

  // spec: site-seo › [SE8] a malformed block still fails
  it('fails a malformed block on a calculator page', () => {
    expect(
      messagesOf(
        calcProblemsAfter(
          {},
          {
            [CALC_PAGE]: (h) =>
              h.replace('</head>', '<script type="application/ld+json">{"a":</script></head>'),
          },
        ),
        CALC_PAGE,
      ),
    ).toContain('a JSON-LD block is not valid JSON');
  });
});

describe('other pages stay free of calculator types (site-seo › [SE23])', () => {
  it.each([
    'WebApplication',
    'BreadcrumbList',
    'FAQPage',
    'Product',
    'Review',
    'AggregateRating',
    'Person',
  ])('fails %s on a trust page of a site that has a calculator page', (type) => {
    const site = calculatorSite();
    const dist = validDist(site);
    dist.set(
      'privacy.html',
      (dist.get('privacy.html') ?? '').replace(
        '</main>',
        `<script type="application/ld+json">{"@type":"${type}"}</script></main>`,
      ),
    );
    expect(
      contentProblems(contextOf(dist, site))
        .filter((entry) => entry.file === 'privacy.html')
        .map((entry) => entry.message),
    ).toEqual([`${type} is not allowed on this page`]);
  });
});

describe('calculator page update date (calculator-page › [CP8] built side)', () => {
  it('requires the one time element to equal the date of the calculator entry', () => {
    expect(
      calcProblemsAfter(
        {},
        { [CALC_PAGE]: (h) => h.replace('datetime="2026-10-23"', 'datetime="2026-10-24"') },
      )
        .filter((entry) => entry.rule === 'updated')
        .map((entry) => entry.message),
    ).toEqual(['time datetime "2026-10-24" is not the entry date 2026-10-23 of en/concrete']);
  });
});

describe('source links of a calculator entry (calculator-page › [CP8]; site-routing-i18n › [SR2])', () => {
  const entry = [
    '---',
    'id: concrete',
    'locale: en',
    'updated: 2026-10-25',
    'sources:',
    '  - name: QUIKRETE',
    '    url: https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf',
    '    retrieved: 2026-10-25',
    '  - name: NIST',
    '    url: "https://www.nist.gov/pml/special-publication-811"',
    '    retrieved: 2026-10-25',
    '---',
    'url: https://example.com/in-the-body',
    '',
  ].join('\n');

  it('reads the https urls of the frontmatter, quoted or not, in order', () => {
    expect(sourceUrlsOf(entry)).toEqual([
      'https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf',
      'https://www.nist.gov/pml/special-publication-811',
    ]);
  });

  it('reads nothing from a body, a missing frontmatter or an http url', () => {
    expect(sourceUrlsOf('no frontmatter\nurl: https://example.com')).toEqual([]);
    expect(sourceUrlsOf('---\nid: x\n---\nurl: https://example.com\n')).toEqual([]);
    expect(sourceUrlsOf('---\nsources:\n  - url: http://example.com\n---\n')).toEqual([]);
  });
});
