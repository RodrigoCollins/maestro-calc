import type { APIRoute } from 'astro';
import { ROUTES } from '../routes.ts';
import { llmsTxt } from '../seo/llms.ts';
import { SITE } from '../site.config.ts';

export const GET: APIRoute = () =>
  new Response(llmsTxt(ROUTES, SITE.origin), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
