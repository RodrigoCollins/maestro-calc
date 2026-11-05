/** What the internal links of the built site must hold, by canonical path. */
export interface LinkRules {
  /** The site origin: an absolute link on it counts as internal. */
  readonly origin: string;
  /** The canonical paths of the sitemap: every one must be linked from another of them. */
  readonly sitemap: readonly string[];
  /** Each job page, its calculator and its nearest siblings (`neighborsOf` of `src/jobs.ts`). */
  readonly jobs: readonly {
    readonly path: string;
    readonly calculator: string;
    readonly neighbors: readonly string[];
  }[];
  /** Each guide and the calculators it explains (`GUIDES` of `src/guide.ts`). */
  readonly guides: readonly { readonly path: string; readonly calculators: readonly string[] }[];
}

const ANCHOR = /<a\b[^>]*?\shref="([^"]*)"/g;
const MAIN = /<main\b[^>]*>([\s\S]*?)<\/main>/;
const FOOTER = /<footer\b[^>]*>([\s\S]*?)<\/footer>/;
const HOME_GUIDES = /<section\b[^>]*\saria-labelledby="pool-guides"[^>]*>([\s\S]*?)<\/section>/;

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
 * page links its nearest siblings (each in its `<main>`), every guide is in the home Guides list and in the footer of
 * every page, a guide and each calculator it explains link each other, and no sitemap page is an
 * orphan.
 */
export const linkProblems = (site: ReadonlyMap<string, string>, rules: LinkRules): string[] => {
  const missing = [
    ...new Set([
      ...rules.sitemap,
      ...rules.jobs.flatMap(({ path, calculator }) => [path, calculator]),
      ...rules.guides.flatMap(({ path, calculators }) => [path, ...calculators]),
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
  return [
    ...rules.jobs.flatMap(({ path, calculator, neighbors }) => [
      ...must(calculator, [path], 'must link its job page'),
      ...must(path, [calculator], 'must link its calculator'),
      ...must(path, neighbors, 'must link its sibling'),
    ]),
    ...must('/', guides, 'the Guides list must link', HOME_GUIDES),
    ...rules.sitemap.flatMap((path) =>
      must(path, guides, 'the footer must link the guide', FOOTER),
    ),
    ...rules.guides.flatMap(({ path, calculators }) => [
      ...calculators.flatMap((calculator) => must(calculator, [path], 'must link its guide')),
      ...must(path, calculators, 'must link the calculator it explains,'),
    ]),
    ...rules.sitemap
      .filter((path) => inbound.get(path) === 0)
      .map((path) => `${path}: no other page in the sitemap links it`),
  ];
};
