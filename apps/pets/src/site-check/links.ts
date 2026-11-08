/** What the internal links of the built site must hold, by canonical path. */
export interface LinkRules {
  /** The site origin: an absolute link on it counts as internal. */
  readonly origin: string;
  /** The canonical paths of the sitemap: every one must be linked from another of them. */
  readonly sitemap: readonly string[];
  /** Links a page must carry in its `<main>`: a guide to the calculators it explains, and so on. */
  readonly must: readonly { readonly path: string; readonly targets: readonly string[] }[];
}

const ANCHOR = /<a\b[^>]*?\shref="([^"]*)"/g;
const MAIN = /<main\b[^>]*>([\s\S]*?)<\/main>/;

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

/**
 * The internal links the build is missing: no link leads to a page the build does not hold (a
 * file of `public`, like `/og.png`, is not a page and is not followed), each page lists the links
 * it must carry in its `<main>`, and no sitemap page is an orphan (linked by no other).
 */
export const linkProblems = (
  site: ReadonlyMap<string, string>,
  rules: LinkRules,
  files: ReadonlySet<string> = new Set(),
): string[] => {
  const missing = [...new Set([...rules.sitemap, ...rules.must.map(({ path }) => path)])].filter(
    (path) => !site.has(path),
  );
  if (missing.length > 0) return missing.map((path) => `${path}: a page the build does not hold`);
  const links = new Map([...site].map(([path, html]) => [path, linksOf(html, rules.origin)]));
  return [
    ...[...links].flatMap(([path, targets]) =>
      [...targets]
        .filter((target) => !site.has(target) && !files.has(target))
        .map((target) => `${path}: links ${target}, which the build does not hold`),
    ),
    ...rules.must.flatMap(({ path, targets }) => {
      const inMain = linksOf(MAIN.exec(site.get(path) ?? '')?.[1] ?? '', rules.origin);
      return targets
        .filter((target) => !inMain.has(target))
        .map((target) => `${path}: must link ${target} in its main`);
    }),
    ...rules.sitemap
      .filter(
        (target) =>
          ![...links].some(([source, targets]) => source !== target && targets.has(target)),
      )
      .map((path) => `${path}: no other page in the sitemap links it`),
  ];
};
