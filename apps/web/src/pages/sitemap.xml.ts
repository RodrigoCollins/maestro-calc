import { sitemapXml } from '../seo/sitemap.ts';

/** `/sitemap.xml`, built at build time from the route table. */
export const GET = (): Response =>
  new Response(sitemapXml(), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
