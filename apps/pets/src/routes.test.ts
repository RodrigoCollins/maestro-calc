import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hrefOf, routeOf, ROUTES } from './routes.ts';

const pagesDir = resolve(import.meta.dirname, 'pages');

/** The canonical path of every page source file. */
const sourcePaths = (): string[] =>
  readdirSync(pagesDir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.name.endsWith('.astro') || entry.name === '404.astro') return [];
    const name = entry.name.replace(/\.astro$/, '');
    return [name === 'index' ? '/' : `/${name}`];
  });

describe('ROUTES', () => {
  // a published URL is a public contract: every slug is written out, so a changed one fails here
  it('pins the address of every page', () => {
    expect(ROUTES.map(({ id, path }) => [id, path])).toEqual([
      ['home', '/'],
      ['dog', '/dog-food-calculator'],
      ['cat', '/cat-food-calculator'],
      ['puppy', '/puppy-feeding-calculator'],
      ['kitten', '/kitten-feeding-calculator'],
      ['chocolate', '/dog-chocolate-toxicity-calculator'],
      ['due-date', '/dog-pregnancy-calculator'],
      ['charts', '/charts'],
      ['dog-chart', '/dog-feeding-chart'],
      ['puppy-chart', '/puppy-feeding-chart'],
      ['chocolate-chart', '/dog-chocolate-toxicity-chart'],
      ['label-guide', '/how-to-read-pet-food-label'],
      ['breed-guide', '/dog-food-by-breed'],
      ['chocolate-guide', '/my-dog-ate-chocolate'],
      ['methodology', '/methodology'],
      ['about', '/about'],
      ['editorial', '/editorial-policy'],
      ['privacy', '/privacy'],
    ]);
  });

  it('holds every page source file and no page without one', () => {
    expect(ROUTES.map(({ path }) => path).sort()).toEqual(sourcePaths().sort());
  });

  it('gives every route its own id and address', () => {
    expect(new Set(ROUTES.map(({ id }) => id)).size).toBe(ROUTES.length);
    expect(new Set(ROUTES.map(({ path }) => path)).size).toBe(ROUTES.length);
  });

  it('names the home, six calculators, and every other page an article', () => {
    expect(routeOf('/')?.kind).toBe('home');
    expect(ROUTES.filter(({ kind }) => kind === 'calculator')).toHaveLength(6);
    expect(routeOf('/methodology')?.kind).toBe('article');
    expect(routeOf('/no-such-page')).toBeUndefined();
  });
});

describe('hrefOf', () => {
  it('leads to the page of a route', () => {
    expect(hrefOf('about')).toBe('/about');
    expect(hrefOf('home')).toBe('/');
  });

  it('refuses an id that is not a route', () => {
    expect(() => hrefOf('nowhere')).toThrow('no route nowhere');
  });
});
