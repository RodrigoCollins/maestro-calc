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
      ['dog-age', '/dog-age-calculator'],
      ['charts', '/charts'],
      ['dog-chart', '/dog-feeding-chart'],
      ['puppy-chart', '/puppy-feeding-chart'],
      ['chocolate-chart', '/dog-chocolate-toxicity-chart'],
      ['dog-age-chart', '/dog-age-chart'],
      ['label-guide', '/how-to-read-pet-food-label'],
      ['breed-guide', '/dog-food-by-breed'],
      ['chocolate-guide', '/my-dog-ate-chocolate'],
      ['dog-years-1', '/1-year-in-dog-years'],
      ['dog-years-2', '/2-years-in-dog-years'],
      ['dog-years-3', '/3-years-in-dog-years'],
      ['dog-years-4', '/4-years-in-dog-years'],
      ['dog-years-5', '/5-years-in-dog-years'],
      ['dog-years-6', '/6-years-in-dog-years'],
      ['dog-years-7', '/7-years-in-dog-years'],
      ['dog-years-8', '/8-years-in-dog-years'],
      ['dog-years-9', '/9-years-in-dog-years'],
      ['dog-years-10', '/10-years-in-dog-years'],
      ['dog-years-11', '/11-years-in-dog-years'],
      ['dog-years-12', '/12-years-in-dog-years'],
      ['dog-years-13', '/13-years-in-dog-years'],
      ['dog-years-14', '/14-years-in-dog-years'],
      ['dog-years-15', '/15-years-in-dog-years'],
      ['dog-years-16', '/16-years-in-dog-years'],
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

  it('names the home, seven calculators, and every other page an article', () => {
    expect(routeOf('/')?.kind).toBe('home');
    expect(ROUTES.filter(({ kind }) => kind === 'calculator')).toHaveLength(7);
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
