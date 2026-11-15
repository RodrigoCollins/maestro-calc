/**
 * The search rules of the built site beyond the link preview of `@maestro-calc/site-kit/seo-check`
 * (which only reads indexable pages): every page has its own title and description, of a length a
 * result shows whole; the sitemap lists exactly the pages of the site (the 404 never); robots.txt
 * lets search engines in and names the sitemap. While the site is closed (`SITE.indexable` false)
 * every page must say `noindex` and name no canonical; once open, every page but the 404 must
 * name its own address as its canonical and none may say `noindex`, but for the pages of a
 * language still closed (`closed`), which say `noindex`, name no canonical and are not listed.
 */
export interface SeoAuditRules {
  /** The site origin, `https://bowlfigures.com`. */
  readonly origin: string;
  /** Whether the site is open to search engines (`SITE.indexable`). */
  readonly indexable: boolean;
  /**
   * The pages of a language still closed on an open site (German until `SITE.deIndexable`): each
   * must say `noindex`, name no canonical and stay out of the sitemap.
   */
  readonly closed?: (path: string) => boolean;
  /** The canonical paths the sitemap lists. */
  readonly sitemap: readonly string[];
  /** The text of the built robots.txt, `undefined` when the build has none. */
  readonly robots: string | undefined;
}

/** A search result shows about 65 characters of a title and 160 of a description. */
export const TITLE_MAX = 65;
export const DESCRIPTION_RANGE = [50, 160] as const;

/** The path of the 404 page, which is never indexed or listed. */
export const NOT_FOUND = '/404';

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

const repeatsOf = (
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
  const [least, most] = DESCRIPTION_RANGE;
  const heads = [...pages]
    .filter(([path]) => path !== NOT_FOUND)
    .map(([path, html]) => [path, headTextOf(html)] as const);
  const titles = repeatsOf(heads, 'title');
  const descriptions = repeatsOf(heads, 'description');
  const listed = new Set(rules.sitemap);
  const held = new Set(heads.map(([path]) => path));
  const notFound = pages.get(NOT_FOUND);
  return [
    ...heads.flatMap(([path, head]) => {
      const url = new URL(path, rules.origin).href;
      const noindex = head.robots?.includes('noindex') === true;
      const closedLanguage = rules.indexable && rules.closed?.(path) === true;
      return [
        ...(closedLanguage
          ? [
              ...(noindex ? [] : [`${path}: a closed language must say noindex`]),
              ...(head.canonical === undefined
                ? []
                : [`${path}: a closed language must name no canonical`]),
            ]
          : rules.indexable
            ? [
                ...(head.canonical === url
                  ? []
                  : [
                      `${path}: the canonical must be "${url}", found "${head.canonical ?? 'none'}"`,
                    ]),
                ...(noindex ? [`${path}: an open site must not say noindex`] : []),
              ]
            : [
                ...(noindex ? [] : [`${path}: a closed site must say noindex`]),
                ...(head.canonical === undefined
                  ? []
                  : [`${path}: a closed site must name no canonical`]),
              ]),
        ...(head.title.length > TITLE_MAX
          ? [
              `${path}: the title has ${String(head.title.length)} characters, more than ${String(TITLE_MAX)}`,
            ]
          : []),
        ...(head.description.length < least || head.description.length > most
          ? [
              `${path}: the description has ${String(head.description.length)} characters, outside ${String(least)} to ${String(most)}`,
            ]
          : []),
        ...(titles.has(path)
          ? [`${path}: the title "${head.title}" is also the title of ${titles.get(path) ?? ''}`]
          : []),
        ...(descriptions.has(path)
          ? [`${path}: the description is also the description of ${descriptions.get(path) ?? ''}`]
          : []),
        ...(closedLanguage
          ? listed.has(path)
            ? [`${path}: closed to search engines, but in the sitemap`]
            : []
          : listed.has(path)
            ? []
            : [`${path}: a page the sitemap does not list`]),
      ];
    }),
    ...rules.sitemap
      .filter((path) => !held.has(path))
      .map((path) => `${path}: in the sitemap, but the build does not hold it`),
    ...(notFound === undefined || headTextOf(notFound).robots?.includes('noindex') === true
      ? []
      : [`${NOT_FOUND}: the 404 page must say noindex`]),
    ...robotsProblems(rules.robots, rules.origin),
  ];
};
