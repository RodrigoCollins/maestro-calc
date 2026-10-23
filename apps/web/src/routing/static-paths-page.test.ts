import { describe, expect, it } from 'vitest';
import { staticPaths } from './routes.ts';

interface CatchAll {
  getStaticPaths: () => unknown;
}

describe('catch-all page (site-routing-i18n › Route table drives the pages)', () => {
  it('builds exactly the static paths of the route table', async () => {
    const page = (await import('../pages/[...path].astro')) as unknown as CatchAll;
    expect(page.getStaticPaths()).toEqual(staticPaths());
    expect(staticPaths().length).toBeGreaterThan(0);
  });
});
