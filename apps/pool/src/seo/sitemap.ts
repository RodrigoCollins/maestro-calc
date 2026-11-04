/** The paths of the page files (`./methodology.astro` is `/methodology`, `./index.astro` is `/`), sorted; the 404 is never listed. */
export const pagePaths = (files: readonly string[]): string[] =>
  files
    .map((file) => file.replace(/^\.\//, '/').replace(/\.astro$/, ''))
    .filter((path) => path !== '/404')
    .map((path) => (path === '/index' ? '/' : path))
    .sort();

/** The public path of a page as the build names it: `/methodology.html` is `/methodology`, `/index.html` is `/`. */
export const canonicalPath = (pathname: string): string =>
  pathname
    .replace(/\.html$/, '')
    .replace(/(^|\/)index$/, '/')
    .replace(/^\/\/$/, '/');

/** The sitemap of the site: one `<loc>` per path on the origin. */
export const sitemapXml = (paths: readonly string[], origin: string): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => `  <url><loc>${new URL(path, origin).href}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
