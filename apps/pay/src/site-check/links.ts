/** A long-tail page, the calculator it answers for and the nearest pages of its family. */
export interface LongTailRule {
  readonly path: string;
  readonly calculator: string;
  readonly siblings: readonly string[];
}

/** A guide and the calculators it explains. */
export interface GuideRule {
  readonly path: string;
  readonly calculators: readonly string[];
}

/** The built pages of the sitemap, by path, and what each must link or be linked from. */
export interface LinkRules {
  readonly origin: string;
  /** Every page of the sitemap: its path (`/`, `/es`, `/pay/…`) and its built HTML. */
  readonly pages: ReadonlyMap<string, string>;
  readonly longTail: readonly LongTailRule[];
  readonly guides: readonly GuideRule[];
  /** The home of each language and the hubs: one of them must link every guide. */
  readonly hubs: readonly string[];
}

const ANCHOR = /<a\s[^>]*?href="([^"]*)"/g;

/** The internal paths the anchors of `html` link, once each, in order, without query or hash. */
export const linksOf = (html: string, origin: string): readonly string[] => {
  const paths = new Set<string>();
  for (const [, href = ''] of html.matchAll(ANCHOR)) {
    const local = href.startsWith(origin) ? href.slice(origin.length) || '/' : href;
    if (!local.startsWith('/')) continue;
    const path = local.replace(/[?#].*$/, '');
    paths.add(path.length > 1 ? path.replace(/\/$/, '') : path);
  }
  return [...paths];
};

/** How many other pages of `pages` link each page of it. */
export const inboundOf = (
  pages: ReadonlyMap<string, string>,
  origin: string,
): ReadonlyMap<string, number> => {
  const inbound = new Map([...pages.keys()].map((path) => [path, 0]));
  for (const [from, html] of pages)
    for (const to of linksOf(html, origin)) {
      const count = inbound.get(to);
      if (count !== undefined && to !== from) inbound.set(to, count + 1);
    }
  return inbound;
};

/**
 * What breaks the internal links of the site: a long-tail page its calculator does not link, or
 * that does not link its calculator and its nearest siblings; a guide neither a home nor a hub
 * links, or that does not link a calculator it explains or is not linked from it; and an orphan, a page of the sitemap no
 * other page links.
 */
export const linkProblems = ({ origin, pages, longTail, guides, hubs }: LinkRules): string[] => {
  const links = new Map(
    [...pages].map(([path, html]) => [path, new Set(linksOf(html, origin))] as const),
  );
  const linked = (from: string, to: string): boolean => links.get(from)?.has(to) === true;
  const named = [
    ...longTail.flatMap(({ path, calculator, siblings }) => [path, calculator, ...siblings]),
    ...guides.flatMap(({ path, calculators }) => [path, ...calculators]),
    ...hubs,
  ];
  const missing = [...new Set(named)]
    .filter((path) => !pages.has(path))
    .map((path) => `${path}: a page the build does not hold`);
  const tail = longTail.flatMap(({ path, calculator, siblings }) => [
    ...(linked(calculator, path) ? [] : [`${path}: not linked from its calculator ${calculator}`]),
    ...(linked(path, calculator) ? [] : [`${path}: does not link its calculator ${calculator}`]),
    ...siblings
      .filter((sibling) => !linked(path, sibling))
      .map((sibling) => `${path}: does not link its sibling ${sibling}`),
  ]);
  const guide = guides.flatMap(({ path, calculators }) => [
    ...(hubs.some((hub) => linked(hub, path))
      ? []
      : [`${path}: not linked from the home or a hub`]),
    ...calculators
      .filter((calculator) => !linked(calculator, path))
      .map((calculator) => `${path}: not linked from the calculator it explains ${calculator}`),
    ...calculators
      .filter((calculator) => !linked(path, calculator))
      .map((calculator) => `${path}: does not link the calculator it explains ${calculator}`),
  ]);
  const orphans = [...inboundOf(pages, origin)]
    .filter(([, count]) => count === 0)
    .map(([path]) => `${path}: an orphan, no other page links it`);
  return [...missing, ...tail, ...guide, ...orphans];
};
