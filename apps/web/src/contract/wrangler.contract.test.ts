import { describe, expect, it } from 'vitest';
import { readJsonc } from '../__testing__/jsonc.ts';

interface Wrangler {
  assets: { not_found_handling: string; html_handling: string };
}

/** The root `wrangler.jsonc` (the file lives at the repository root, not in `apps/web`). */
const wrangler = readJsonc('wrangler.jsonc') as Wrangler;

describe('wrangler.jsonc asset rules (site-routing-i18n › Workers assets)', () => {
  // spec: site-routing-i18n › [SR15]
  it('serves the nearest 404.html with status 404 for unknown paths', () => {
    expect(wrangler.assets.not_found_handling).toBe('404-page');
  });

  it('serves x.html at /x and redirects /x/ and /x.html to /x', () => {
    expect(wrangler.assets.html_handling).toBe('drop-trailing-slash');
  });
});
