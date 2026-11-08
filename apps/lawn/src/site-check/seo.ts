/**
 * The search rules of the built site beyond the link preview of `@maestro-calc/site-kit/seo-check`:
 * every page has its own title and description, of a length a result shows whole; while the site is
 * closed (`SITE.indexable` false) every page but the 404 says `noindex` and has no canonical, and
 * once it is open each has a canonical at its own address and none says `noindex`; the sitemap
 * lists every page but the 404 and nothing else; robots.txt lets search engines in and names it.
 */
export interface SeoAuditRules {
  /** The site origin, `https://lawnfigures.com`. */
  readonly origin: string;
  /** The canonical paths the sitemap lists. */
  readonly sitemap: readonly string[];
  /** The text of the built robots.txt, `undefined` when the build has none. */
  readonly robots: string | undefined;
  /** Whether the site is open to search engines (`SITE.indexable`). */
  readonly indexable: boolean;
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

/** The title, description, canonical and robots of a built page. */
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
  };
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
  rules: SeoAuditRules,
  repeats: { readonly title: string | undefined; readonly description: string | undefined },
): string[] => {
  const url = new URL(path, rules.origin).href;
  const [least, most] = DESCRIPTION_RANGE;
  const { length } = head.description;
  const noindex = head.robots?.includes('noindex') === true;
  return [
    ...(rules.indexable
      ? [
          ...(head.canonical === url
            ? []
            : [`${path}: the canonical must be "${url}", found "${head.canonical ?? 'none'}"`]),
          ...(noindex ? [`${path}: an open site must not say noindex`] : []),
        ]
      : [
          ...(noindex ? [] : [`${path}: a closed site must say noindex`]),
          ...(head.canonical === undefined ? [] : [`${path}: a closed site has no canonical`]),
        ]),
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

/** The search problems of the built site, `pages` keyed by canonical path (the 404 included). */
export const seoAuditProblems = (
  pages: ReadonlyMap<string, string>,
  rules: SeoAuditRules,
): string[] => {
  const heads = [...pages]
    .filter(([path]) => path !== '/404')
    .map(([path, html]) => [path, headTextOf(html)] as const);
  const titles = duplicates(heads, 'title');
  const descriptions = duplicates(heads, 'description');
  const listed = new Set(rules.sitemap);
  const built = new Set(heads.map(([path]) => path));
  return [
    ...heads.flatMap(([path, head]) =>
      pageProblems(path, head, rules, {
        title: titles.get(path),
        description: descriptions.get(path),
      }),
    ),
    ...[...built]
      .filter((path) => !listed.has(path))
      .map((path) => `${path}: a page the sitemap does not list`),
    ...rules.sitemap
      .filter((path) => !built.has(path))
      .map((path) =>
        pages.has(path)
          ? `${path}: in the sitemap, but the page must not be`
          : `${path}: in the sitemap, but the build does not hold it`,
      ),
    ...robotsProblems(rules.robots, rules.origin),
  ];
};
