import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { fromRoot, importFromRoot } from './root.ts';

// plans/growth/PLAN.md › 4: every `apps/*` site ships G1, G2, G3, G7 and G8, read from what its
// own layout, sitemap and deploy job use (`apps/<app>/src/growth.ts`), so a new site cannot skip one.

/** What a site's layout writes in the head of one page. */
interface Head {
  readonly canonical?: string | undefined;
  readonly robots?: string | undefined;
  /** The link preview tags, `og:title` to `twitter:card`. */
  readonly preview: Readonly<Record<string, string>>;
}

interface Text {
  readonly title: string;
  readonly description: string;
}

/** `src/growth.ts` of a site: its own builders, as its layout, sitemap and deploy job call them. */
interface GrowthSite {
  readonly origin: string;
  readonly indexNowKey: string;
  readonly sitemapXml: string;
  /** Every page, by absolute URL; `page` has no JSON-LD of its own. */
  readonly pages: readonly {
    url: string;
    kind: 'home' | 'calculator' | 'article' | 'collection' | 'page';
  }[];
  /** The head of the page at `url`; `undefined` is the 404. */
  readonly headOf: (url: string | undefined, text: Text) => Head;
  readonly jsonLdOf: (url: string, text: Text) => string | undefined;
}

/** Everything the contract reads of one site. */
interface SiteFacts {
  readonly app: string;
  readonly growth: GrowthSite | undefined;
  readonly robotsTxt: string | undefined;
  /** The body of `public/<indexNowKey>.txt`. */
  readonly keyFile: string | undefined;
  readonly ogPng: Uint8Array | undefined;
  /** The `run` of every IndexNow step of the deploy workflow, matrix values written in. */
  readonly indexNowRuns: readonly string[];
}

const { sitemapUrls } = await importFromRoot<{ sitemapUrls: (xml: string) => string[] }>(
  'packages/site-kit/src/indexnow.ts',
);
const { imageProblems } = await importFromRoot<{
  imageProblems: (file: string, bytes: Uint8Array | undefined) => string[];
}>('packages/site-kit/src/seo-check.ts');

const PROBE: Text = { title: 'Probe title', description: 'Probe description.' };
const SCHEMA = {
  home: 'WebSite',
  calculator: 'WebApplication',
  article: 'Article',
  collection: 'CollectionPage',
} as const;

/** Every schema.org node of a JSON-LD document: the document itself or each of its `@graph`. */
const nodesOf = (jsonLd: string): Record<string, unknown>[] => {
  const document = JSON.parse(jsonLd) as Record<string, unknown>;
  return Array.isArray(document['@graph'])
    ? (document['@graph'] as Record<string, unknown>[])
    : [document];
};

const growthProblems = (facts: SiteFacts): string[] => {
  const { app, growth } = facts;
  if (growth === undefined)
    return [`${app}: G1, G2, G3, G7, G8: no src/growth.ts exporting GROWTH`];
  const { origin, pages } = growth;
  const urls = new Set(pages.map(({ url }) => url));
  const listed = sitemapUrls(growth.sitemapXml);
  const sitemap = `${origin}/sitemap.xml`;
  const key = growth.indexNowKey;
  const preview = (url: string, tag: string, expected: string): string[] => {
    const found = growth.headOf(url, PROBE).preview[tag];
    return found === expected ? [] : [`${app}: G7: ${url} has ${tag} "${String(found)}"`];
  };
  const notFound = growth.headOf(undefined, PROBE);
  return [
    ...pages.flatMap(({ url }) => {
      const { canonical, robots } = growth.headOf(url, PROBE);
      return [
        ...(canonical === url ? [] : [`${app}: G1: ${url} has canonical "${String(canonical)}"`]),
        ...(robots?.includes('noindex') === true ? [`${app}: G1: ${url} is noindex`] : []),
      ];
    }),
    ...(notFound.robots?.includes('noindex') === true ? [] : [`${app}: G1: the 404 is indexable`]),
    ...(notFound.canonical === undefined ? [] : [`${app}: G1: the 404 has a canonical`]),
    ...(listed.length === 0 ? [`${app}: G2: the sitemap lists no page`] : []),
    ...[...urls].flatMap((url) =>
      listed.includes(url) ? [] : [`${app}: G2: the sitemap leaves out ${url}`],
    ),
    ...listed.flatMap((url) => (urls.has(url) ? [] : [`${app}: G2: the sitemap lists ${url}`])),
    ...(facts.robotsTxt?.split('\n').includes(`Sitemap: ${sitemap}`) === true
      ? []
      : [`${app}: G2: public/robots.txt does not point to ${sitemap}`]),
    ...(/^[0-9a-f]{32}$/.test(key) ? [] : [`${app}: G3: the IndexNow key is not 32 hex digits`]),
    ...(facts.keyFile?.trim() === key ? [] : [`${app}: G3: public/${key}.txt does not hold it`]),
    ...(facts.indexNowRuns.some((run) => run.includes(`apps/${app}/`))
      ? []
      : [`${app}: G3: no IndexNow step of the deploy workflow runs for apps/${app}`]),
    ...pages.flatMap(({ url }) => [
      ...preview(url, 'og:title', PROBE.title),
      ...preview(url, 'og:description', PROBE.description),
      ...preview(url, 'og:image', `${origin}/og.png`),
      ...preview(url, 'twitter:card', 'summary_large_image'),
    ]),
    ...imageProblems('og.png', facts.ogPng).map((problem) => `${app}: G7: public/${problem}`),
    ...(['home', 'calculator'] as const).flatMap((kind) =>
      pages.some((page) => page.kind === kind) ? [] : [`${app}: G8: no ${kind} page`],
    ),
    ...pages.flatMap(({ url, kind }) => {
      if (kind === 'page') return [];
      const jsonLd = growth.jsonLdOf(url, PROBE);
      const found = jsonLd === undefined ? [] : nodesOf(jsonLd);
      return found.some((node) => node['@type'] === SCHEMA[kind] && node['url'] === url)
        ? []
        : [`${app}: G8: ${url} has no ${SCHEMA[kind]} JSON-LD at its URL`];
    }),
  ];
};

interface Workflow {
  jobs: Record<
    string,
    { steps: { id?: string; run?: string }[]; strategy?: { matrix?: { include?: object[] } } }
  >;
}

const workflow = parse(readFileSync(fromRoot('.github/workflows/deploy.yml'), 'utf8')) as Workflow;
/** The IndexNow runs of every job, once per matrix row with `${{ matrix.<name> }}` written in. */
const indexNowRuns = Object.values(workflow.jobs).flatMap(({ steps, strategy }) =>
  steps
    .filter(({ id }) => id === 'indexnow')
    .flatMap(({ run = '' }) =>
      (strategy?.matrix?.include ?? [{}]).map((row) =>
        Object.entries(row).reduce(
          (text, [name, value]) => text.replaceAll(`\${{ matrix.${name} }}`, String(value)),
          run,
        ),
      ),
    ),
);

const APPS = readdirSync(fromRoot('apps'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map(({ name }) => name)
  .sort();

const factsOf = async (app: string): Promise<SiteFacts> => {
  const file = (path: string): Buffer | undefined =>
    existsSync(fromRoot('apps', app, path)) ? readFileSync(fromRoot('apps', app, path)) : undefined;
  const growth = existsSync(fromRoot('apps', app, 'src/growth.ts'))
    ? (await importFromRoot<{ GROWTH?: GrowthSite }>(`apps/${app}/src/growth.ts`)).GROWTH
    : undefined;
  return {
    app,
    growth,
    robotsTxt: file('public/robots.txt')?.toString('utf8'),
    keyFile:
      growth === undefined ? undefined : file(`public/${growth.indexNowKey}.txt`)?.toString(),
    ogPng: file('public/og.png'),
    indexNowRuns,
  };
};

describe('growth contract (plans/growth/PLAN.md › 4)', () => {
  it('finds the sites in apps/*: Maestro Calc, Cuenta Horas, Pool Figures and Lawn Figures', () => {
    expect(APPS).toEqual(['lawn', 'pay', 'pool', 'web']);
  });

  it.each(APPS)('apps/%s ships G1, G2, G3, G7 and G8', async (app) => {
    expect(growthProblems(await factsOf(app))).toEqual([]);
  });
});

describe('growth contract on a fixture site', () => {
  const origin = 'https://example.com';
  const pages = [
    { url: `${origin}/`, kind: 'home', type: 'WebSite' },
    { url: `${origin}/a-calculator`, kind: 'calculator', type: 'WebApplication' },
    { url: `${origin}/a-guide`, kind: 'article', type: 'Article' },
  ] as const;
  const key = '0123456789abcdef0123456789abcdef';
  const png = Buffer.alloc(24);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
  png.writeUInt32BE(1200, 16);
  png.writeUInt32BE(630, 20);
  const preview = (text: Text) => ({
    'og:title': text.title,
    'og:description': text.description,
    'og:image': `${origin}/og.png`,
    'twitter:card': 'summary_large_image',
  });
  const growth: GrowthSite = {
    origin,
    indexNowKey: key,
    sitemapXml: pages.map(({ url }) => `<url><loc>${url}</loc></url>`).join(''),
    pages,
    headOf: (url, text) =>
      url === undefined
        ? { robots: 'noindex', preview: {} }
        : { canonical: url, preview: preview(text) },
    jsonLdOf: (url) =>
      JSON.stringify({ '@type': pages.find((page) => page.url === url)?.type, url }),
  };
  const site: SiteFacts = {
    app: 'fixture',
    growth,
    robotsTxt: `User-agent: *\nSitemap: ${origin}/sitemap.xml\n`,
    keyFile: `${key}\n`,
    ogPng: png,
    indexNowRuns: ['node apps/fixture/scripts/indexnow.ts'],
  };
  const withGrowth = (change: Partial<GrowthSite>): SiteFacts => ({
    ...site,
    growth: { ...growth, ...change },
  });

  it('passes when every piece is there', () => {
    expect(growthProblems(site)).toEqual([]);
  });

  it.each<[string, SiteFacts, string]>([
    ['no seam', { ...site, growth: undefined }, 'fixture: G1, G2, G3, G7, G8: no src/growth.ts'],
    [
      'a noindex page',
      withGrowth({
        headOf: (url) => ({ robots: 'noindex', preview: preview(PROBE), canonical: url }),
      }),
      'fixture: G1: https://example.com/a-guide is noindex',
    ],
    [
      'an indexable 404',
      withGrowth({ headOf: (url, text) => ({ canonical: url, preview: preview(text) }) }),
      'fixture: G1: the 404 is indexable',
    ],
    [
      'a page left out of the sitemap',
      withGrowth({ sitemapXml: `<url><loc>${origin}/</loc></url>` }),
      'fixture: G2: the sitemap leaves out https://example.com/a-guide',
    ],
    [
      'robots.txt without the sitemap',
      { ...site, robotsTxt: 'User-agent: *\n' },
      'fixture: G2: public/robots.txt does not point to https://example.com/sitemap.xml',
    ],
    ['no key file', { ...site, keyFile: undefined }, `fixture: G3: public/${key}.txt`],
    ['a short key', withGrowth({ indexNowKey: 'abc' }), 'fixture: G3: the IndexNow key is not'],
    ['no deploy step', { ...site, indexNowRuns: [] }, 'fixture: G3: no IndexNow step'],
    [
      'no twitter card',
      withGrowth({ headOf: (url) => ({ canonical: url, preview: {} }) }),
      'fixture: G7: https://example.com/ has twitter:card "undefined"',
    ],
    ['no og.png', { ...site, ogPng: undefined }, 'fixture: G7: public/og.png'],
    [
      'no Article on a guide',
      withGrowth({ jsonLdOf: () => undefined }),
      'fixture: G8: https://example.com/a-guide has no Article JSON-LD at its URL',
    ],
    ['no calculator page', withGrowth({ pages: [pages[0]] }), 'fixture: G8: no calculator page'],
  ])('fails, naming the site and the piece, on %s', (_, facts, message) => {
    expect(growthProblems(facts).join('\n')).toContain(message);
  });
});
