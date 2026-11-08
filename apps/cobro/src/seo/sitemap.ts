import { localizedUrls, sitemapXml as sitemapOf } from '@maestro-calc/site-kit/sitemap';
import type { Route } from '../routes.ts';
import { alternatesOf } from './head.ts';

/** The public path of a page as the build names it: `/metodologia.html` is `/metodologia`, `/index.html` is `/`. */
export const canonicalPath = (pathname: string): string =>
  pathname
    .replace(/\.html$/, '')
    .replace(/(^|\/)index$/, '/')
    .replace(/^\/\/$/, '/');

/** The sitemap: every route in both languages, each URL with its es-US, en-US and x-default pair. */
export const sitemapXml = (routes: readonly Route[], origin: string): string =>
  sitemapOf(routes.flatMap((route) => localizedUrls(alternatesOf(route.es, origin, [route]))));
