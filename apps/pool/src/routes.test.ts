import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { JOB_PAGES } from './jobs.ts';
import { hrefOf, langOf, pathsOf, routeOf, ROUTES } from './routes.ts';

const pagesDir = resolve(import.meta.dirname, 'pages');

/** The canonical path of every page source file, Spanish ones under `es/` included. */
const sourcePaths = (dir: string, prefix = ''): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory())
      return entry.name === 'embed'
        ? []
        : sourcePaths(resolve(dir, entry.name), `${prefix}/${entry.name}`);
    if (!entry.name.endsWith('.astro') || entry.name.startsWith('[') || entry.name === '404.astro')
      return [];
    const name = entry.name.replace(/\.astro$/, '');
    return [name === 'index' ? prefix || '/' : `${prefix}/${name}`];
  });

describe('ROUTES', () => {
  // a published URL is a public contract: every slug is written out, so a changed one fails here
  it('pins the address of every page in each language it is published in', () => {
    expect(
      ROUTES.filter(({ id }) => !id.startsWith('job:')).map(({ id, en, es }) => [id, en, es]),
    ).toEqual([
      ['home', '/', '/es'],
      ['volume', '/pool-volume-calculator', undefined],
      ['salt', '/pool-salt-calculator', undefined],
      ['chlorine', '/pool-chlorine-calculator', undefined],
      ['pump', '/pool-pump-size-calculator', undefined],
      ['ph', '/pool-ph-calculator', undefined],
      ['alkalinity', '/pool-alkalinity-calculator', undefined],
      ['stabilizer', '/pool-stabilizer-calculator', undefined],
      ['calcium', '/pool-calcium-hardness-calculator', undefined],
      ['heater', '/pool-heater-size-calculator', undefined],
      ['fill-time', '/pool-fill-time-calculator', undefined],
      ['chemistry-chart', '/pool-water-chemistry-chart', undefined],
      ['dosing-chart', '/pool-chemical-dosing-chart', undefined],
      ['volume-chart', '/pool-volume-chart', undefined],
      ['charts', '/charts', undefined],
      ['opening-guide', '/opening-your-pool', undefined],
      ['closing-guide', '/closing-your-pool', undefined],
      ['pump-guide', '/how-long-to-run-pool-pump', undefined],
      ['salt-guide', '/salt-water-pool-vs-chlorine-pool', undefined],
      ['shock-guide', '/how-to-shock-a-pool', undefined],
      ['ph-guide', '/how-to-lower-ph-in-a-pool', undefined],
      ['calcium-guide', '/how-to-raise-calcium-hardness-in-a-pool', undefined],
      ['swim-guide', '/how-long-after-adding-chemicals-can-you-swim', undefined],
      ['methodology', '/methodology', undefined],
      ['about', '/about', '/es/acerca'],
      ['privacy', '/privacy', '/es/privacidad'],
      ['embed', '/embed-calculators', '/es/calculadoras-para-tu-sitio'],
    ]);
  });

  it('holds every page source file, Spanish ones included, and no page without one', () => {
    const routed = ROUTES.filter(({ id }) => !id.startsWith('job:')).flatMap(pathsOf);
    expect([...routed].sort()).toEqual(sourcePaths(pagesDir).sort());
  });

  it('holds every job page of [job].astro as an article, after the page files', () => {
    const jobs = ROUTES.filter(({ id }) => id.startsWith('job:'));
    expect(jobs.map(({ en }) => en)).toEqual(JOB_PAGES.map(({ path }) => path));
    expect(new Set(jobs.map(({ kind }) => kind))).toEqual(new Set(['article']));
  });

  it('gives every route its own id and every address one route', () => {
    expect(new Set(ROUTES.map(({ id }) => id)).size).toBe(ROUTES.length);
    const paths = ROUTES.flatMap(pathsOf);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('keeps every Spanish address under /es', () => {
    for (const { es } of ROUTES) if (es !== undefined) expect(langOf(es), es).toBe('es');
  });

  it('names the home, the calculators by their route, and every other page an article', () => {
    expect(routeOf('/')?.kind).toBe('home');
    expect(ROUTES.filter(({ kind }) => kind === 'calculator')).toHaveLength(10);
    expect(routeOf('/methodology')?.kind).toBe('article');
    expect(routeOf('/no-such-page')).toBeUndefined();
  });
});

describe('langOf and pathsOf', () => {
  it('reads the language from the address: /es and below are Spanish', () => {
    expect(langOf('/')).toBe('en');
    expect(langOf('/pool-salt-calculator')).toBe('en');
    expect(langOf('/es')).toBe('es');
    expect(langOf('/es/calculadora-de-sal-para-piscina')).toBe('es');
    expect(langOf('/estabilizador')).toBe('en');
  });

  it('lists the English page, then its Spanish twin when it has one', () => {
    expect(pathsOf({ id: 'a', kind: 'article', en: '/a' })).toEqual(['/a']);
    expect(pathsOf({ id: 'a', kind: 'article', en: '/a', es: '/es/a' })).toEqual(['/a', '/es/a']);
  });
});

describe('hrefOf', () => {
  it('leads to the page in the language asked, or to the English page until its twin is built', () => {
    expect(hrefOf('about', 'en')).toBe('/about');
    expect(hrefOf('about', 'es')).toBe('/es/acerca');
    expect(hrefOf('home', 'es')).toBe('/es');
    expect(hrefOf('methodology', 'es')).toBe('/methodology');
  });

  it('refuses an id that is not a route', () => {
    expect(() => hrefOf('nowhere', 'en')).toThrow('no route nowhere');
  });
});
