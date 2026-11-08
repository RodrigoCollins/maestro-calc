/**
 * A built page as it will read once the owner opens the site (`SITE.indexable` true): the `noindex`
 * line becomes the canonical, and `og:url` is added, so `@maestro-calc/site-kit/seo-check` can
 * check the link preview and the JSON-LD of every page before launch day, not on it.
 */
export const asLaunched = (html: string, path: string, origin: string): string => {
  const url = new URL(path, origin).href;
  return html
    .replace(/<meta name="robots" content="noindex"\s*\/?>/, `<link rel="canonical" href="${url}">`)
    .replace(/(<meta property="og:locale")/, `<meta property="og:url" content="${url}">$1`);
};
