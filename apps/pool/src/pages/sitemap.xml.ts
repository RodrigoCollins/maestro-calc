import type { APIRoute } from 'astro';
import { pagePaths, sitemapXml } from '../seo/sitemap.ts';
import { SITE } from '../site.config.ts';

// Every page file of this directory is a page of the sitemap, so a new page cannot be left out.
const files = Object.keys(import.meta.glob('./*.astro'));

export const GET: APIRoute = () =>
  new Response(sitemapXml(pagePaths(files), SITE.origin), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
