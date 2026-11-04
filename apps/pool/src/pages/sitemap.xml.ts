import type { APIRoute } from 'astro';
import { JOB_PAGES } from '../jobs.ts';
import { pagePaths, sitemapXml } from '../seo/sitemap.ts';
import { SITE } from '../site.config.ts';

// Every page file of this directory is a page of the sitemap, so a new page cannot be left out;
// the job pages of `[job].astro` are listed by the paths they build.
const files = Object.keys(import.meta.glob('./*.astro'));
const dynamic = { './[job].astro': JOB_PAGES.map(({ path }) => path) };

export const GET: APIRoute = () =>
  new Response(sitemapXml(pagePaths(files, dynamic), SITE.origin), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
