/** What the internal links of the built site must hold, by canonical path. */
export interface LinkRules {
  /** The site origin: an absolute link on it counts as internal. */
  readonly origin: string;
  /** The canonical paths of the sitemap: every one must be linked from another of them. */
  readonly sitemap: readonly string[];
  /** Each guide and the calculators it explains (`GUIDES` of `src/guide.ts`). */
  readonly guides: readonly { readonly path: string; readonly calculators: readonly string[] }[];
  /** The calculators: each links the methodology. */
  readonly calculators: readonly string[];
  readonly methodology: string;
  /** The frost dates index and the pages of each state (`FROST_PAGES` of `src/frost.ts`). */
  readonly frost: {
    readonly index: string;
    readonly states: readonly {
      readonly slug: string;
      readonly pages: readonly string[];
    }[];
  };
}

const ANCHOR = /<a\b[^>]*?\shref="([^"]*)"/g;
const MAIN = /<main\b[^>]*>([\s\S]*?)<\/main>/;
const FOOTER = /<footer\b[^>]*>([\s\S]*?)<\/footer>/;
const HOME_GUIDES = /<section\b[^>]*\saria-labelledby="guides"[^>]*>([\s\S]*?)<\/section>/;

/** The canonical path of a link, or `undefined` for a link off the site, a fragment or a scheme. */
const pathOf = (href: string, origin: string): string | undefined => {
  const local = href.startsWith(`${origin}/`) ? href.slice(origin.length) : href;
  if (!local.startsWith('/') || local.startsWith('//')) return undefined;
  const path = local.split(/[?#]/, 1)[0] ?? local;
  return path.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
};

/** The internal links of `html`, as canonical paths with no query and no fragment. */
export const linksOf = (html: string, origin: string): ReadonlySet<string> =>
  new Set(
    [...html.matchAll(ANCHOR)]
      .map(([, href = '']) => pathOf(href.replaceAll('&amp;', '&'), origin))
      .filter((path) => path !== undefined),
  );

/** For every sitemap page, how many other sitemap pages link it. */
export const inboundOf = (
  site: ReadonlyMap<string, string>,
  rules: Pick<LinkRules, 'origin' | 'sitemap'>,
): ReadonlyMap<string, number> => {
  const links = new Map(
    rules.sitemap.map((path) => [path, linksOf(site.get(path) ?? '', rules.origin)]),
  );
  return new Map(
    rules.sitemap.map((target) => [
      target,
      rules.sitemap.filter((source) => source !== target && links.get(source)?.has(target)).length,
    ]),
  );
};

/**
 * The internal links the build is missing: every guide is in the home Guides list and in the
 * footer of every page, a guide and each calculator it explains link each other, each calculator
 * links the methodology, the frost index lists the first page of every state and every frost page
 * links back to the index (the index is in every footer too), the parts of a state link each
 * other, and no sitemap page is an orphan.
 */
export const linkProblems = (site: ReadonlyMap<string, string>, rules: LinkRules): string[] => {
  const missing = [
    ...new Set([
      ...rules.sitemap,
      ...rules.guides.flatMap(({ path, calculators }) => [path, ...calculators]),
      rules.frost.index,
    ]),
  ].filter((path) => !site.has(path));
  if (missing.length > 0) return missing.map((path) => `${path}: a page the build does not hold`);
  const linked = (path: string, region: RegExp): ReadonlySet<string> =>
    linksOf(region.exec(site.get(path) ?? '')?.[1] ?? '', rules.origin);
  // the header and the footer link the same pages from everywhere, so a relation lives in `<main>`
  const must = (path: string, targets: readonly string[], what: string, region = MAIN) => {
    const links = linked(path, region);
    return targets
      .filter((target) => !links.has(target))
      .map((target) => `${path}: ${what} ${target}`);
  };
  const guides = rules.guides.map(({ path }) => path);
  const inbound = inboundOf(site, rules);
  const { index, states } = rules.frost;
  return [
    ...must('/', guides, 'the Guides list must link', HOME_GUIDES),
    ...rules.sitemap.flatMap((path) =>
      must(path, [...guides, index], 'the footer must link', FOOTER),
    ),
    ...rules.guides.flatMap(({ path, calculators }) => [
      ...calculators.flatMap((calculator) => must(calculator, [path], 'must link its guide')),
      ...must(path, calculators, 'must link the calculator it explains,'),
    ]),
    ...rules.calculators.flatMap((path) => must(path, [rules.methodology], 'must link')),
    ...must(
      index,
      states.flatMap(({ pages }) => pages.slice(0, 1)),
      'must list the state page',
    ),
    ...states.flatMap(({ pages }) =>
      pages.flatMap((path) => [
        ...must(path, [index], 'must link the frost index'),
        ...must(
          path,
          pages.filter((other) => other !== path),
          'must link its part',
        ),
      ]),
    ),
    ...rules.sitemap
      .filter((path) => inbound.get(path) === 0)
      .map((path) => `${path}: no other page in the sitemap links it`),
  ];
};
