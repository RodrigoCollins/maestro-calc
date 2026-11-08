import type { APIRoute } from 'astro';
import { llmsTxt } from '../seo/llms.ts';
import { SITE } from '../site.config.ts';

// The guide of the site for AI answer engines (llmstxt.org), from the same texts the pages use.
export const GET: APIRoute = () =>
  new Response(llmsTxt(SITE.origin), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
