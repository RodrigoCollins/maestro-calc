import { hrefOf, TRADE_PATHS, WAGE_STEMS, wageAreasOf, wagePathOf, type Lang } from '../routes.ts';
import { OCCUPATIONS } from '../wages/occupations.ts';

const ANCHOR = /<a\b[^>]*?\shref="([^"]*)"/g;
const MAIN = /<main\b[^>]*>([\s\S]*?)<\/main>/;
const FOOTER = /<footer\b[^>]*>([\s\S]*?)<\/footer>/;

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
  sitemap: readonly string[],
  origin: string,
): ReadonlyMap<string, number> => {
  const links = new Map(sitemap.map((path) => [path, linksOf(site.get(path) ?? '', origin)]));
  return new Map(
    sitemap.map((target) => [
      target,
      sitemap.filter((source) => source !== target && links.get(source)?.has(target)).length,
    ]),
  );
};

/**
 * The internal links the build must hold, by canonical path, in each language: the home links every
 * calculator, guide and the wages hub; a calculator links the other four (its chips), its trade's
 * wages and its guides; the hub links the five wage indexes; each wage index lists every state of
 * its trade and each state page links back to the index and to its calculator; every footer links
 * the guides; and no sitemap page is an orphan.
 */
export const linkProblems = (
  site: ReadonlyMap<string, string>,
  sitemap: readonly string[],
  origin: string,
): string[] => {
  const missing = sitemap.filter((path) => !site.has(path));
  if (missing.length > 0) return missing.map((path) => `${path}: a page the build does not hold`);
  const region = (path: string, pattern: RegExp): ReadonlySet<string> =>
    linksOf(pattern.exec(site.get(path) ?? '')?.[1] ?? '', origin);
  const must = (path: string, targets: readonly string[], what: string, where = MAIN) => {
    const links = region(path, where);
    return targets
      .filter((target) => !links.has(target))
      .map((target) => `${path}: ${what} ${target}`);
  };
  const inbound = inboundOf(site, sitemap, origin);
  const perLanguage = (lang: Lang): string[] => {
    const calculators = OCCUPATIONS.map(({ id }) => TRADE_PATHS[id][lang]);
    const guides = (['quote-guide', 'markup-guide', 'rate-guide'] as const).map((id) =>
      hrefOf(id, lang),
    );
    const home = hrefOf('home', lang);
    return [
      ...must(home, [...calculators, ...guides, hrefOf('wages', lang)], 'the home must link'),
      ...OCCUPATIONS.flatMap(({ id }) => {
        const own = TRADE_PATHS[id][lang];
        const states = wageAreasOf(id).map(({ fips }) => wagePathOf(id, fips, lang));
        return [
          ...must(own, calculators.filter((path) => path !== own), 'must link the other trade'),
          ...must(own, [WAGE_STEMS[id][lang], hrefOf('methodology', lang), ...guides], 'must link'),
          ...must(WAGE_STEMS[id][lang], [own, hrefOf('wages', lang), ...states], 'must link'),
          ...states.flatMap((state) =>
            must(state, [WAGE_STEMS[id][lang], own, hrefOf('rate-guide', lang)], 'must link'),
          ),
        ];
      }),
      ...must(
        hrefOf('wages', lang),
        OCCUPATIONS.map(({ id }) => WAGE_STEMS[id][lang]),
        'the wages hub must link',
      ),
      ...sitemap
        .filter((path) => (lang === 'es' ? !path.startsWith('/en') : path.startsWith('/en')))
        .flatMap((path) => must(path, guides, 'the footer must link the guide', FOOTER)),
    ];
  };
  return [
    ...perLanguage('es'),
    ...perLanguage('en'),
    ...sitemap
      .filter((path) => inbound.get(path) === 0)
      .map((path) => `${path}: no other page in the sitemap links it`),
  ];
};
