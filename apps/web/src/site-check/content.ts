import { LOCALE_TAGS, LOCALES, pathOf, urlOf } from '../routing/routes.ts';
import { alternatesIn, attr, hasWord, visibleText } from './dom.ts';
import { urlOfPage } from './files.ts';
import { isCalculatorPage, problem } from './types.ts';
import type { Dist, Page, Problem, Site } from './types.ts';

/** Whole words that mean a page still carries review state (a bare `pending` is allowed). */
export const OWNER_REVIEW_MARKERS = ['ownerReview', 'draft', 'borrador', 'pending review'];

/** The retired placeholder address, joined from parts so the source-side scan finds no literal. */
export const OLD_ADDRESS = ['hello', 'maestrocalc.com'].join('@');

/**
 * ICW6: a catalog key printed instead of its message. Calculator keys have at least two
 * segments after `calc` (`calc.rectangle-area.title`), so `calc.example` is plain text.
 */
const MESSAGE_KEY = /\b(?:errors\.[a-z]|calc\.[a-z][a-z0-9-]*\.[a-z])/i;

/** Types a page that is neither a calculator page nor a home page may never declare. */
const FORBIDDEN_TYPES = [
  'Product',
  'Review',
  'AggregateRating',
  'FAQPage',
  'BreadcrumbList',
  'WebApplication',
  'Person',
];

/** The three types of a calculator page, once each (site-seo › Calculator structured data). */
const CALCULATOR_TYPES = ['WebApplication', 'BreadcrumbList', 'FAQPage'];

/** What the `WebApplication` may never claim: it is a free tool without ratings, offers or images. */
const WEB_APPLICATION_FORBIDDEN = ['offers', 'aggregateRating', 'review', 'ratingValue', 'image'];

const HOME_NAME = { en: 'Home', es: 'Inicio' } as const;
const FAQ_SECTION_IDS = ['faq', 'preguntas-frecuentes'];
const MIN_FAQ_ITEMS = 4;

const SITEMAP_URL = urlOf('/sitemap.xml');

/** How many content entries still have `ownerReview: pending` in their frontmatter. */
export const countPending = (entries: readonly string[]): number =>
  entries.filter((entry) =>
    /^---\n(?:[^\n]*\n)*?ownerReview:[ \t]*pending[ \t]*\n(?:[^\n]*\n)*?---/.test(entry),
  ).length;

/** The `updated` date of a content entry, read from its frontmatter, or undefined. */
export const updatedOf = (entry: string): string | undefined =>
  /^---\n(?:[^\n]*\n)*?updated:[ \t]*"?([^\s"]+)"?[ \t]*\n(?:[^\n]*\n)*?---/.exec(entry)?.[1];

const updatedProblems = (page: Page, site: Site): Problem[] => {
  if (!page.routable || page.id === 'home') return [];
  const key = `${page.locale}/${page.id}`;
  const expected = site.updates[key];
  if (expected === undefined) return [problem(page.file, 'updated', `no content entry for ${key}`)];
  const shown = page.root
    .querySelectorAll('main time[datetime]')
    .map((time) => attr(time, 'datetime'));
  if (shown.length === 1 && shown[0] === expected) return [];
  return [
    problem(
      page.file,
      'updated',
      shown.length === 1
        ? `time datetime "${shown.join('')}" is not the entry date ${expected} of ${key}`
        : `expected one time[datetime] equal to ${expected}, found ${String(shown.length)}`,
    ),
  ];
};

const reviewProblems = (page: Page): Problem[] =>
  OWNER_REVIEW_MARKERS.filter((marker) => hasWord(visibleText(page.root), marker)).map((marker) =>
    problem(page.file, 'owner-review', `the page contains "${marker}"`),
  );

const addressProblems = (dist: Dist): Problem[] =>
  [...dist]
    .filter(([, text]) => text.includes(OLD_ADDRESS))
    .map(([file]) => problem(file, 'old-address', `${OLD_ADDRESS} must not appear`));

const messageKeyProblems = (page: Page): Problem[] =>
  MESSAGE_KEY.test(visibleText(page.root))
    ? [problem(page.file, 'message-key', 'a catalog key appears instead of its message')]
    : [];

const robotsProblems = (dist: Dist): Problem[] => {
  const text = dist.get('robots.txt');
  if (text === undefined) return [problem('robots.txt', 'robots', 'robots.txt is missing')];
  const lines = text.split('\n').filter((line) => line !== '');
  const sitemaps = lines.filter((line) => line.startsWith('Sitemap:'));
  const wrong = [
    ...(lines.includes('User-agent: *') ? [] : ['it lacks "User-agent: *"']),
    ...(lines.some((line) => line.startsWith('Disallow: /')) ? ['it disallows a path'] : []),
    ...(sitemaps.length === 1 && sitemaps[0] === `Sitemap: ${SITEMAP_URL}`
      ? []
      : [`it must hold exactly one "Sitemap: ${SITEMAP_URL}" line`]),
  ];
  return wrong.map((what) => problem('robots.txt', 'robots', what));
};

const unescapeXml = (text: string): string =>
  text
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&amp;', '&');

interface SitemapEntry {
  readonly loc: string;
  readonly alternates: string;
}

const entriesOfSitemap = (xml: string): SitemapEntry[] =>
  Array.from(xml.matchAll(/<url>(.*?)<\/url>/gs), ([, body = '']) => ({
    loc: unescapeXml(body.replace(/^.*?<loc>(.*?)<\/loc>.*$/s, '$1')),
    alternates: Array.from(
      body.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]*)" href="([^"]*)"\s*\/>/g),
      ([, hreflang = '', href = '']) => `${hreflang} ${unescapeXml(href)}`,
    )
      .sort()
      .join('\n'),
  }));

const sitemapProblems = (pages: readonly Page[], site: Site, dist: Dist): Problem[] => {
  const xml = dist.get('sitemap.xml');
  const others = [...dist.keys()].filter(
    (file) => /(?:^|\/)sitemap[^/]*\.xml$/.test(file) && file !== 'sitemap.xml',
  );
  const otherProblems = others.map((file) =>
    problem(file, 'sitemap-index', 'only sitemap.xml may exist'),
  );
  if (xml === undefined)
    return [problem('sitemap.xml', 'sitemap', 'sitemap.xml is missing'), ...otherProblems];
  const entries = entriesOfSitemap(xml);
  const expected = Object.keys(site.routes).flatMap((id) =>
    LOCALES.map((locale) => urlOf(pathOf(id, locale, site.routes))),
  );
  const listed = new Set(entries.map(({ loc }) => loc));
  const headOf = (loc: string): Page | undefined =>
    pages.find((page) => page.routable && urlOfPage(page, site) === loc);
  return [
    ...expected
      .filter((url) => !listed.has(url))
      .map((url) => problem('sitemap.xml', 'sitemap', `missing URL ${url}`)),
    ...entries
      .filter(({ loc }) => !expected.includes(loc))
      .map(({ loc }) => problem('sitemap.xml', 'sitemap', `unexpected URL ${loc}`)),
    ...entries
      .filter(({ loc }, index) => entries.findIndex((entry) => entry.loc === loc) !== index)
      .map(({ loc }) => problem('sitemap.xml', 'sitemap', `duplicate URL ${loc}`)),
    ...entries
      .filter(({ loc }) => loc.includes('?'))
      .map(({ loc }) => problem('sitemap.xml', 'sitemap', `URL ${loc} has a query string`)),
    ...entries.flatMap(({ loc, alternates }) => {
      const page = headOf(loc);
      if (page === undefined) return [];
      const head = alternatesIn(page.root).join('\n');
      return head === alternates
        ? []
        : [
            problem(
              'sitemap.xml',
              'sitemap-alternates',
              `alternates of ${loc} differ from the head of ${page.file}`,
            ),
          ];
    }),
    ...otherProblems,
  ];
};

type Node = Readonly<Record<string, unknown>>;

const isNode = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The typed nodes of a JSON-LD document: its `@graph`, or the document itself. */
const nodesOf = (document: unknown): Node[] => {
  if (!isNode(document)) return [];
  const graph = document['@graph'];
  if (graph === undefined) return [document];
  return Array.isArray(graph) ? graph.filter(isNode) : [];
};

const jsonLdBlocks = (page: Page): string[] =>
  page.root.querySelectorAll('script[type="application/ld+json"]').map((script) => script.text);

const homeNodeProblems = (page: Page, site: Site, nodes: readonly Node[]): string[] => {
  const { name, url } = site.config;
  const typeOf = (type: string): Node | undefined => nodes.find((node) => node['@type'] === type);
  const organization = typeOf('Organization');
  const website = typeOf('WebSite');
  const home = urlOf(pathOf('home', page.locale, site.routes));
  return [
    ...(nodes.length === 2 && organization !== undefined && website !== undefined
      ? []
      : ['the graph must hold exactly an Organization and a WebSite']),
    ...(organization === undefined
      ? []
      : [
          ...(organization['name'] === name && organization['url'] === url
            ? []
            : ['the Organization needs the site name and url']),
          ...(['logo', 'image'] as const)
            .filter((key) => key in organization)
            .map((key) => `the Organization must not have ${key}`),
        ]),
    ...(website === undefined
      ? []
      : [
          ...(website['name'] === name ? [] : ['the WebSite needs the site name']),
          ...(website['url'] === home ? [] : [`the WebSite url must be ${home}`]),
          ...(website['inLanguage'] === LOCALE_TAGS[page.locale]
            ? []
            : [`the WebSite inLanguage must be ${LOCALE_TAGS[page.locale]}`]),
        ]),
  ];
};

const normalized = (text: string): string => text.replace(/\s+/g, ' ').trim();

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** The visible FAQ: each `h3` of the FAQ section with the text that follows it up to the next heading. */
const visibleFaq = (page: Page): FaqItem[] => {
  const heading = page.root
    .querySelectorAll('h2')
    .find((candidate) => FAQ_SECTION_IDS.includes(attr(candidate, 'id')));
  const items: { question: string; answer: string[] }[] = [];
  for (
    let element = heading?.nextElementSibling ?? null;
    element !== null && element.tagName !== 'H2';
    element = element.nextElementSibling
  ) {
    if (element.tagName === 'H3') items.push({ question: normalized(element.text), answer: [] });
    else items.at(-1)?.answer.push(element.text);
  }
  return items.map(({ question, answer }) => ({ question, answer: normalized(answer.join(' ')) }));
};

const textOf = (value: unknown): string => (typeof value === 'string' ? normalized(value) : '');

const nodesIn = (value: unknown): Node[] => (Array.isArray(value) ? value.filter(isNode) : []);

const headingOf = (page: Page): string => normalized(page.root.querySelector('h1')?.text ?? '');

const webApplicationProblems = (page: Page, site: Site, app: Node): string[] => {
  const heading = headingOf(page);
  const canonical = urlOfPage(page, site);
  const expected: [string, unknown, unknown][] = [
    ['name', app['name'], heading],
    ['url', app['url'], canonical],
    ['inLanguage', app['inLanguage'], LOCALE_TAGS[page.locale]],
    ['applicationCategory', app['applicationCategory'], 'UtilitiesApplication'],
    ['operatingSystem', app['operatingSystem'], 'Any'],
    ['isAccessibleForFree', app['isAccessibleForFree'], true],
  ];
  return [
    ...expected
      .filter(([, actual, wanted]) => actual !== wanted)
      .map(([key, , wanted]) =>
        key === 'name'
          ? `the WebApplication name must be the h1 "${heading}"`
          : `the WebApplication ${key} must be ${String(wanted)}`,
      ),
    ...WEB_APPLICATION_FORBIDDEN.filter((key) => key in app).map(
      (key) => `the WebApplication must not have ${key}`,
    ),
  ];
};

const breadcrumbProblems = (page: Page, site: Site, list: Node): string[] => {
  const items = nodesIn(list['itemListElement']);
  const home = urlOf(pathOf('home', page.locale, site.routes));
  const heading = headingOf(page);
  const [first, second] = items;
  const right =
    items.length === 2 &&
    first?.['position'] === 1 &&
    first['name'] === HOME_NAME[page.locale] &&
    first['item'] === home &&
    second?.['position'] === 2 &&
    second['name'] === heading &&
    second['item'] === urlOfPage(page, site);
  return right
    ? []
    : [
        `the BreadcrumbList must be ${HOME_NAME[page.locale]} (${home}) then the page (name and canonical)`,
      ];
};

const faqProblems = (page: Page, faq: Node): string[] => {
  const shown = visibleFaq(page);
  const entities = nodesIn(faq['mainEntity']).map((entity) => ({
    question: textOf(entity['name']),
    answer: textOf(nodesIn([entity['acceptedAnswer']]).at(0)?.['text']),
  }));
  const parity =
    entities.length === shown.length
      ? shown.flatMap(({ question, answer }, index) =>
          entities
            .slice(index, index + 1)
            .flatMap((entity) => [
              ...(entity.question === question
                ? []
                : [
                    `FAQ question ${String(index + 1)} "${question}" is "${entity.question}" in the FAQPage`,
                  ]),
              ...(entity.answer === answer
                ? []
                : [`FAQ answer ${String(index + 1)} of the page differs from the FAQPage`]),
            ]),
        )
      : [
          `the FAQPage has ${String(entities.length)} questions and the page shows ${String(shown.length)}`,
        ];
  return [
    ...parity,
    ...(shown.length >= MIN_FAQ_ITEMS
      ? []
      : [
          `the page needs at least ${String(MIN_FAQ_ITEMS)} FAQ items, found ${String(shown.length)}`,
        ]),
  ];
};

/** Exactly WebApplication, BreadcrumbList and FAQPage, with the values of site-seo and the FAQ of the page. */
const calculatorNodeProblems = (page: Page, site: Site, nodes: readonly Node[]): string[] => {
  const typesOf = (node: Node): unknown[] => [node['@type']].flat();
  const ofType = (type: string): Node[] => nodes.filter((node) => typesOf(node).includes(type));
  const [app] = ofType('WebApplication');
  const [list] = ofType('BreadcrumbList');
  const [faq] = ofType('FAQPage');
  return [
    ...CALCULATOR_TYPES.flatMap((type) =>
      ofType(type).length === 1
        ? []
        : [`expected exactly one ${type}, found ${String(ofType(type).length)}`],
    ),
    ...nodes
      .flatMap(typesOf)
      .filter((type) => typeof type === 'string' && !CALCULATOR_TYPES.includes(type))
      .map((type) => `${String(type)} is not allowed on this page`),
    ...(app === undefined || ofType('WebApplication').length !== 1
      ? []
      : webApplicationProblems(page, site, app)),
    ...(list === undefined || ofType('BreadcrumbList').length !== 1
      ? []
      : breadcrumbProblems(page, site, list)),
    ...(faq === undefined || ofType('FAQPage').length !== 1 ? [] : faqProblems(page, faq)),
  ];
};

const jsonLdProblems = (page: Page, site: Site): Problem[] => {
  const blocks = jsonLdBlocks(page);
  const documents: unknown[] = [];
  const problems: string[] = [];
  for (const text of blocks) {
    try {
      documents.push(JSON.parse(text));
    } catch {
      problems.push('a JSON-LD block is not valid JSON');
    }
  }
  const nodes = documents.flatMap(nodesOf);
  if (page.id === 'home') {
    if (blocks.length !== 1)
      problems.push(`expected one JSON-LD block, found ${String(blocks.length)}`);
    else if (documents.length === 1) problems.push(...homeNodeProblems(page, site, nodes));
  } else if (isCalculatorPage(page, site)) {
    problems.push(...calculatorNodeProblems(page, site, nodes));
  } else {
    problems.push(
      ...nodes
        .flatMap((node) => [node['@type']].flat())
        .filter((type) => typeof type === 'string' && FORBIDDEN_TYPES.includes(type))
        .map((type) => `${String(type)} is not allowed on this page`),
    );
  }
  return problems.map((message) => problem(page.file, 'json-ld', message));
};

/** Content, placeholder, robots, sitemap and structured-data rules. */
export const contentProblems = (pages: readonly Page[], site: Site, dist: Dist): Problem[] => [
  ...pages.flatMap((page) => [
    ...reviewProblems(page),
    ...messageKeyProblems(page),
    ...jsonLdProblems(page, site),
    ...updatedProblems(page, site),
  ]),
  ...addressProblems(dist),
  ...robotsProblems(dist),
  ...sitemapProblems(pages, site, dist),
];
