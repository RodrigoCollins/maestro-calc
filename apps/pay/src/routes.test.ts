import { globSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LONG_TAIL_ROUTES } from './long-tail/jobs.ts';
import { ROUTES } from './routes.ts';

const pagesDir = new URL('./pages/', import.meta.url).pathname;
const pageFiles = globSync('**/*.astro', { cwd: pagesDir })
  .map((file) => file.replaceAll('\\', '/'))
  .filter((file) => file !== '404.astro')
  // the embeds are not routes: canonical at the full page and noindex (`embed/embeds.test.ts`)
  .filter((file) => !file.startsWith('embed/'));
// the long-tail pages are built by one template per language from their list of jobs
const fileOf = (path: string): string =>
  path === '/' ? 'index.astro' : path === '/es' ? 'es/index.astro' : `${path.slice(1)}.astro`;
const templateOf = (path: string): string =>
  path.startsWith('/pay/')
    ? 'pay/[slug].astro'
    : path.startsWith('/es/pago/')
      ? 'es/pago/[slug].astro'
      : path.startsWith('/military-time/')
        ? 'military-time/[slug].astro'
        : path.startsWith('/states/')
          ? 'states/[slug].astro'
          : path.startsWith('/es/estados/')
            ? 'es/estados/[slug].astro'
            : fileOf(path);

describe('ROUTES', () => {
  it('has one row per page pair, and every page file is in a row', () => {
    const routed = new Set(
      ROUTES.flatMap(({ en, es }) => [en, ...(es === undefined ? [] : [es])].map(templateOf)),
    );
    expect([...routed].sort()).toEqual([...pageFiles].sort());
  });

  it('holds every long-tail page, so the sitemap lists them', () => {
    for (const route of LONG_TAIL_ROUTES) expect(ROUTES).toContainEqual(route);
  });

  it('keeps English at the root and Spanish under /es', () => {
    for (const { en, es } of ROUTES) {
      expect(en === '/es' || en.startsWith('/es/')).toBe(false);
      if (es !== undefined) expect(es === '/es' || es.startsWith('/es/')).toBe(true);
    }
  });

  it('pairs every page but the English-only military times', () => {
    const single = ROUTES.filter(({ es }) => es === undefined).map(({ en }) => en);
    expect(single).toHaveLength(48);
    for (const path of single) expect(path).toMatch(/^\/military-time\/[0-9]{4}$/);
  });

  it('starts with the home pair', () => {
    expect(ROUTES[0]).toEqual({ id: 'home', kind: 'home', en: '/', es: '/es' });
  });
});
