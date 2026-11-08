import type { APIRoute } from 'astro';
import { llmsTxt } from '../llms.ts';

// The guide of the site for AI answer engines (llmstxt.org), from the lists the sitemap reads.
export const GET: APIRoute = () =>
  new Response(llmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
