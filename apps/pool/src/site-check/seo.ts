/**
 * The search rules of the built site beyond the link preview of `@maestro-calc/site-kit/seo-check`:
 * every indexable page has its own title and description, of a length a result shows whole, a
 * canonical at its own address and a line in the sitemap (and the sitemap nothing else); a job page
 * names its size in its title and description and carries its `BreadcrumbList`; robots.txt lets
 * search engines in and names the sitemap.
 */
export interface SeoAuditRules {
  /** The site origin, `https://poolfigures.com`. */
  readonly origin: string;
  /** The canonical paths the sitemap lists. */
  readonly sitemap: readonly string[];
  /** Each job page and the calculator it belongs to (`JOB_PAGES` of `src/jobs.ts`). */
  readonly jobs: readonly { readonly path: string; readonly calculator: string }[];
  /** The text of the built robots.txt, `undefined` when the build has none. */
  readonly robots: string | undefined;
}

/** A search result shows about 65 characters of a title and 160 of a description. */
export const TITLE_MAX = 65;
export const DESCRIPTION_RANGE = [50, 160] as const;

/** What the head of a built page says about it, the entities of its text decoded. */
export interface HeadText {
  readonly title: string;
  readonly description: string;
  readonly canonical?: string;
  readonly robots?: string;
  readonly jsonLd: readonly unknown[];
}

const ENTITIES: Readonly<Record<string, string>> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

const decoded = (text: string): string =>
  text.replace(/&(?:amp|quot|#39|#x27|lt|gt);/g, (entity) => ENTITIES[entity] ?? entity);

const parsed = (text: string): unknown[] => {
  try {
    return [JSON.parse(text) as unknown];
  } catch {
    return [];
  }
};

/** The title, description, canonical, robots and JSON-LD documents of a built page. */
export const headTextOf = (html: string): HeadText => {
  const read = (pattern: RegExp): string | undefined => {
    const found = pattern.exec(html)?.[1];
    return found === undefined ? undefined : decoded(found);
  };
  const canonical = read(/<link rel="canonical" href="([^"]*)"/);
  const robots = read(/<meta name="robots" content="([^"]*)"/);
  return {
    title: read(/<title>([^<]*)<\/title>/) ?? '',
    description: read(/<meta name="description" content="([^"]*)"/) ?? '',
    ...(canonical === undefined ? {} : { canonical }),
    ...(robots === undefined ? {} : { robots }),
    jsonLd: [
      ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
    ].flatMap(([, text = '']) => parsed(text)),
  };
};

/** The numbers of a text ("15,000", "12x24" or "12 x 24", "31.45"), the size a job page is about. */
const numbersOf = (text: string): string[] =>
  text.replace(/(\d) x (\d)/g, '$1x$2').match(/\d+(?:[.,x]\d+)*/g) ?? [];

const field = (value: unknown, key: string): unknown =>
  typeof value === 'object' && value !== null ? (Reflect.get(value, key) as unknown) : undefined;

/** The addresses of the first `BreadcrumbList` of the documents, in order, or `undefined`. */
const trailOf = (documents: readonly unknown[]): string[] | undefined => {
  const nodes = documents.flatMap((document) => {
    const graph = field(document, '@graph');
    return Array.isArray(graph) ? (graph as unknown[]) : [document];
  });
  const list = nodes.find((node) => field(node, '@type') === 'BreadcrumbList');
  const items = field(list, 'itemListElement');
  if (!Array.isArray(items)) return undefined;
  return (items as unknown[]).map((item) => String(field(item, 'item')));
};

const duplicates = (
  heads: readonly (readonly [string, HeadText])[],
  key: 'title' | 'description',
): Map<string, string> => {
  const first = new Map<string, string>();
  const repeated = new Map<string, string>();
  for (const [path, head] of heads) {
    const seen = first.get(head[key]);
    if (seen === undefined) first.set(head[key], path);
    else repeated.set(path, seen);
  }
  return repeated;
};

const pageProblems = (
  path: string,
  head: HeadText,
  origin: string,
  repeats: { readonly title?: string; readonly description?: string },
): string[] => {
  const url = new URL(path, origin).href;
  const [least, most] = DESCRIPTION_RANGE;
  const { length } = head.description;
  return [
    ...(head.canonical === url
      ? []
      : [`${path}: the canonical must be "${url}", found "${head.canonical ?? 'none'}"`]),
    ...(head.title.length > TITLE_MAX
      ? [
          `${path}: the title has ${String(head.title.length)} characters, more than ${String(TITLE_MAX)}`,
        ]
      : []),
    ...(length < least || length > most
      ? [
          `${path}: the description has ${String(length)} characters, outside ${String(least)} to ${String(most)}`,
        ]
      : []),
    ...(repeats.title === undefined
      ? []
      : [`${path}: the title "${head.title}" is also the title of ${repeats.title}`]),
    ...(repeats.description === undefined
      ? []
      : [`${path}: the description is also the description of ${repeats.description}`]),
  ];
};

const jobProblems = (
  path: string,
  calculator: string,
  head: HeadText,
  origin: string,
): string[] => {
  const numbers = numbersOf(head.title);
  const described = new Set(numbersOf(head.description));
  const expected = ['/', calculator, path].map((at) => new URL(at, origin).href);
  const found = trailOf(head.jsonLd);
  return [
    ...(numbers.length === 0
      ? [`${path}: the title of a job page must hold its size or number`]
      : numbers
          .filter((number) => !described.has(number))
          .map((number) => `${path}: the description must hold "${number}" of its title`)),
    ...(found?.join(' > ') === expected.join(' > ')
      ? []
      : [
          `${path}: the BreadcrumbList must lead to ${expected.join(' > ')}, found ${found?.join(' > ') ?? 'none'}`,
        ]),
  ];
};

const robotsProblems = (robots: string | undefined, origin: string): string[] => {
  if (robots === undefined) return ['robots.txt: not in the build'];
  const sitemap = new URL('/sitemap.xml', origin).href;
  return [
    ...(/^Disallow:\s*\/\s*$/m.test(robots)
      ? ['robots.txt: "Disallow: /" keeps search engines out']
      : []),
    ...(robots.split('\n').some((line) => line.trim() === `Sitemap: ${sitemap}`)
      ? []
      : [`robots.txt: must name the sitemap ${sitemap}`]),
  ];
};

/** The search problems of the built site, `pages` keyed by canonical path (the 404 and the embeds included). */
export const seoAuditProblems = (
  pages: ReadonlyMap<string, string>,
  rules: SeoAuditRules,
): string[] => {
  const heads = [...pages].map(([path, html]) => [path, headTextOf(html)] as const);
  const indexable = heads.filter(([, head]) => head.robots?.includes('noindex') !== true);
  const indexed = new Set(indexable.map(([path]) => path));
  const titles = duplicates(indexable, 'title');
  const descriptions = duplicates(indexable, 'description');
  const listed = new Set(rules.sitemap);
  const missing = rules.jobs.filter(({ path }) => !pages.has(path));
  if (missing.length > 0)
    return missing.map(({ path }) => `${path}: a job page the build does not hold`);
  const headOf = new Map(heads);
  return [
    ...indexable.flatMap(([path, head]) =>
      pageProblems(path, head, rules.origin, {
        ...(titles.has(path) ? { title: titles.get(path) } : {}),
        ...(descriptions.has(path) ? { description: descriptions.get(path) } : {}),
      }),
    ),
    ...[...indexed]
      .filter((path) => !listed.has(path))
      .map((path) => `${path}: an indexable page the sitemap does not list`),
    ...rules.sitemap
      .filter((path) => !indexed.has(path))
      .map((path) =>
        pages.has(path)
          ? `${path}: in the sitemap, but the page is not indexable`
          : `${path}: in the sitemap, but the build does not hold it`,
      ),
    ...rules.jobs.flatMap(({ path, calculator }) => {
      const head = headOf.get(path);
      return head === undefined ? [] : jobProblems(path, calculator, head, rules.origin);
    }),
    ...robotsProblems(rules.robots, rules.origin),
  ];
};
