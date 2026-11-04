/**
 * The absolute URL of a site path on `origin` (`/` gives `https://…/`): the canonical, the sitemap
 * `<loc>` and the hreflang `href` of a page. Only a rooted path (`/…`, never `//…`) is a site path,
 * so a canonical can never point at another host.
 */
export const canonicalUrl = (path: string, origin: string): string => {
  if (!path.startsWith('/') || path.startsWith('//'))
    throw new Error(`not a site path: ${JSON.stringify(path)}`);
  return new URL(path, origin).href;
};
