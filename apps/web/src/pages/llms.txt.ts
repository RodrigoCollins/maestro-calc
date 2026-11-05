import { llmsTxt } from '../seo/llms.ts';

/** `/llms.txt` (llmstxt.org), built at build time from the route table and the site catalogs. */
export const GET = (): Response =>
  new Response(llmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
