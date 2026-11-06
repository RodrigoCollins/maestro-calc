import type { APIRoute } from 'astro';
import { ROUTES } from '../routes.ts';
import { sitemapXml } from '../seo/sitemap.ts';
import { SITE } from '../site.config.ts';

// Every route of `src/routes.ts`, the job pages included; a test holds the table equal to the
// page files, so a new page cannot be left out.
export const GET: APIRoute = () =>
  new Response(sitemapXml(ROUTES, SITE.origin), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
