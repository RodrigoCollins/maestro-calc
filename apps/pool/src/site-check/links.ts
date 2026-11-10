/** What the internal links of the built site must hold, by canonical path. */
export interface LinkRules {
  /** The site origin: an absolute link on it counts as internal. */
  readonly origin: string;
  /** The canonical paths of the sitemap: every one must be linked from another of them. */
  readonly sitemap: readonly string[];
  /**
   * Each job page, its calculator, its nearest siblings (`neighborsOf` of `src/jobs.ts`) and the
   * guide whose dose it works out, when it has one.
   */
  readonly jobs: readonly {
    readonly path: string;
    readonly calculator: string;
    readonly neighbors: readonly string[];
    readonly guide?: string;
  }[];
  /** Each guide and the calculators it explains (`GUIDES` of `src/guide.ts`). */
  readonly guides: readonly { readonly path: string; readonly calculators: readonly string[] }[];
  /**
   * Each Spanish guide that is built and the Spanish calculators it explains: they link each other
   * as their English twins do (the home list and the footers are checked through `guides`).
   */
  readonly spanishGuides?: readonly {
    readonly path: string;
    readonly calculators: readonly string[];
  }[];
  /**
   * The page of `target` a footer of the page at `path` links, in that page's language: the
   * Spanish twin of a guide once it is built (`localHrefOf` of `src/routes.ts`). By default, itself.
   */
  readonly localize?: (target: string, path: string) => string;
  /**
   * The cost guides: the home Pool costs list links the hub and each page, the hub links each
   * page and each page links the hub (in its `<main>`).
   */
  readonly costs?: {
    /** The cost hub (`COST_HUB` of `src/costs.ts`). */
    readonly hub: string;
    /** The priced questions the hub gathers. */
    readonly pages: readonly string[];
  };
  /**
   * The data index of each language and the citable pages it lists (`DATA_PAGES_OF` of
   * `src/charts.ts`), with the sitemap pages whose footer links it (every one when unnamed).
   */
  readonly data?: readonly {
    readonly index: string;
    readonly pages: readonly string[];
    readonly footers?: readonly string[];
  }[];
}

const ANCHOR = /<a\b[^>]*?\shref="([^"]*)"/g;
const MAIN = /<main\b[^>]*>([\s\S]*?)<\/main>/;
const FOOTER = /<footer\b[^>]*>([\s\S]*?)<\/footer>/;
const HOME_GUIDES = /<section\b[^>]*\saria-labelledby="pool-guides"[^>]*>([\s\S]*?)<\/section>/;
const HOME_COSTS = /<section\b[^>]*\saria-labelledby="pool-costs"[^>]*>([\s\S]*?)<\/section>/;

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
  rules: LinkRules,
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
 * The internal links the build is missing: a job page and its calculator link each other, a job
 * page links its nearest siblings, a job page and the guide whose dose it works out link each
 * other (each in its `<main>`), every guide is in the home Guides list and in the footer of
 * every page, a guide and each calculator it explains link each other, the data index and each
 * data page link each other (the index in every footer too), and no sitemap page is an orphan.
 */
export const linkProblems = (site: ReadonlyMap<string, string>, rules: LinkRules): string[] => {
  const missing = [
    ...new Set([
      ...rules.sitemap,
      ...rules.jobs.flatMap(({ path, calculator }) => [path, calculator]),
      ...[...rules.guides, ...(rules.spanishGuides ?? [])].flatMap(({ path, calculators }) => [
        path,
        ...calculators,
      ]),
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
  const { costs, data, localize = (target: string) => target } = rules;
  return [
    ...rules.jobs.flatMap(({ path, calculator, neighbors, guide }) => [
      ...must(calculator, [path], 'must link its job page'),
      ...must(path, [calculator], 'must link its calculator'),
      ...must(path, neighbors, 'must link its sibling'),
      ...(guide === undefined
        ? []
        : [
            ...must(path, [guide], 'must link its guide'),
            ...must(guide, [path], 'must link its job page'),
          ]),
    ]),
    ...must('/', guides, 'the Guides list must link', HOME_GUIDES),
    ...rules.sitemap.flatMap((path) =>
      must(
        path,
        guides.map((guide) => localize(guide, path)),
        'the footer must link the guide',
        FOOTER,
      ),
    ),
    ...[...rules.guides, ...(rules.spanishGuides ?? [])].flatMap(({ path, calculators }) => [
      ...calculators.flatMap((calculator) => must(calculator, [path], 'must link its guide')),
      ...must(path, calculators, 'must link the calculator it explains,'),
    ]),
    ...(costs === undefined
      ? []
      : [
          ...must('/', [costs.hub, ...costs.pages], 'the Pool costs list must link', HOME_COSTS),
          ...must(costs.hub, costs.pages, 'must link the cost guide'),
          ...costs.pages.flatMap((path) => must(path, [costs.hub], 'must link the cost hub')),
        ]),
    ...(data ?? []).flatMap(({ index, pages, footers = rules.sitemap }) => [
      ...pages.flatMap((path) => must(path, [index], 'must link the data index')),
      ...must(index, pages, 'must list the data page'),
      ...footers.flatMap((path) =>
        must(path, [index], 'the footer must link the data index', FOOTER),
      ),
    ]),
    ...rules.sitemap
      .filter((path) => inbound.get(path) === 0)
      .map((path) => `${path}: no other page in the sitemap links it`),
  ];
};
