import { ROUTES } from '../routes.ts';
import { sitemapXml } from '../seo/sitemap.ts';
import { SITE } from '../site.config.ts';

export const GET = () =>
  new Response(sitemapXml(ROUTES, SITE.origin), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
