import type { Route } from '../routes.ts';

const link = (lang: string, href: string): string =>
  `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`;

/** The sitemap: every route in both languages, each URL with its en-US, es-US and x-default pair. */
export const sitemapXml = (routes: readonly Route[], origin: string): string => {
  const href = (path: string): string => new URL(path, origin).href;
  const urls = routes.flatMap((route) =>
    [route.en, route.es].map((path) =>
      [
        '  <url>',
        `    <loc>${href(path)}</loc>`,
        link('en-US', href(route.en)),
        link('es-US', href(route.es)),
        link('x-default', href(route.en)),
        '  </url>',
      ].join('\n'),
    ),
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
};
