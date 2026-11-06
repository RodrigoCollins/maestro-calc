import { canonicalUrl } from '@maestro-calc/site-kit/canonical';

const PREFIX = 'https://wa.me/?text=';
const ANCHOR = /<a\s[^>]*>/g;

/** The value of attribute `name` of an opening tag, entities of `&` undone, or `undefined`. */
const attributeOf = (tag: string, name: string): string | undefined => {
  const match = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return match?.[1]?.replaceAll('&amp;', '&');
};

/**
 * What breaks the WhatsApp share link of the pages that must have one (each calculator and each
 * state page, by path): the page must hold exactly one link to `wa.me`, opened with
 * `rel="noopener"`, whose message, as built with no script, ends in the page's canonical address.
 */
export const shareProblems = (
  pages: ReadonlyMap<string, string>,
  origin: string,
  required: readonly string[],
): string[] =>
  required.flatMap((path) => {
    const html = pages.get(path);
    if (html === undefined) return [`${path}: a page the build does not hold`];
    const links = Array.from(html.matchAll(ANCHOR), ([tag]) => tag).filter((tag) =>
      (attributeOf(tag, 'href') ?? '').startsWith(PREFIX),
    );
    const [link] = links;
    if (link === undefined) return [`${path}: no WhatsApp share link`];
    if (links.length > 1)
      return [`${path}: ${String(links.length)} WhatsApp share links, one expected`];
    const url = canonicalUrl(path, origin);
    const message = decodeURIComponent((attributeOf(link, 'href') ?? '').slice(PREFIX.length));
    return [
      ...(message.endsWith(`\n${url}`) ? [] : [`${path}: the WhatsApp link does not share ${url}`]),
      ...((attributeOf(link, 'rel') ?? '').split(/\s+/).includes('noopener')
        ? []
        : [`${path}: the WhatsApp link has no rel="noopener"`]),
    ];
  });
