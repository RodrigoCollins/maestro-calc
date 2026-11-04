import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { sitemapXml as sitemapOf } from '@maestro-calc/site-kit/sitemap';

/**
 * The paths of the page files (`./methodology.astro` is `/methodology`, `./index.astro` is `/`),
 * sorted; the 404 is never listed. A dynamic file (`./[job].astro`) stands for the paths `dynamic`
 * gives it, and one it does not name throws, so a dynamic page cannot drop out of the sitemap.
 */
export const pagePaths = (
  files: readonly string[],
  dynamic: Readonly<Record<string, readonly string[]>> = {},
): string[] =>
  files
    .flatMap((file) => {
      if (!file.includes('[')) return [file.replace(/^\.\//, '/').replace(/\.astro$/, '')];
      const paths = dynamic[file];
      if (paths === undefined) throw new Error(`no paths for the dynamic page ${file}`);
      return paths;
    })
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
  sitemapOf(paths.map((path) => ({ loc: canonicalUrl(path, origin) })));
