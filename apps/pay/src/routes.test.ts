import { globSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ROUTES } from './routes.ts';

const pagesDir = new URL('./pages/', import.meta.url).pathname;
const pageFiles = globSync('**/*.astro', { cwd: pagesDir })
  .map((file) => file.replaceAll('\\', '/'))
  .filter((file) => file !== '404.astro');
const fileOf = (path: string): string =>
  path === '/' ? 'index.astro' : path === '/es' ? 'es/index.astro' : `${path.slice(1)}.astro`;

describe('ROUTES', () => {
  it('has one row per page pair, and every page file is in a row', () => {
    const routed = ROUTES.flatMap(({ en, es }) => [fileOf(en), fileOf(es)]).sort();
    expect(routed).toEqual([...pageFiles].sort());
  });

  it('keeps English at the root and Spanish under /es', () => {
    for (const { en, es } of ROUTES) {
      expect(en === '/es' || en.startsWith('/es/')).toBe(false);
      expect(es === '/es' || es.startsWith('/es/')).toBe(true);
    }
  });

  it('starts with the home pair', () => {
    expect(ROUTES[0]).toEqual({ id: 'home', kind: 'home', en: '/', es: '/es' });
  });
});
