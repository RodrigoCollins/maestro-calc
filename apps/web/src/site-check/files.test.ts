import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routing/routes.ts';
import { expectedFiles, fileSetProblems, pageCount, pagesOf } from './files.ts';
import { FIXTURE_ROUTES, validDist } from './__testing__/page-fixture.ts';

describe('expected built files (site-routing-i18n › [SR1] derived)', () => {
  it('lists the routable pages in both locales and the two not-found pages', () => {
    expect(expectedFiles(ROUTES)).toEqual(['index.html', 'es.html', '404.html', 'es/404.html']);
  });

  it('maps any table path to its file: /x to x.html and /es/x to es/x.html', () => {
    expect(expectedFiles({ x: { en: '/x', es: '/es/x' } })).toEqual([
      'x.html',
      'es/x.html',
      '404.html',
      'es/404.html',
    ]);
  });

  // spec: site-seo › [SE14] derived
  it('counts two files per id plus two not-found pages', () => {
    expect(pageCount(ROUTES)).toBe(4);
    expect(pageCount(FIXTURE_ROUTES)).toBe(10);
  });
});

describe('file set problems (site-routing-i18n › [SR1])', () => {
  it('has none for a complete dist', () => {
    expect(fileSetProblems(validDist(), FIXTURE_ROUTES)).toEqual([]);
  });

  it('reports an orphan HTML file by name', () => {
    const dist = validDist();
    dist.set('extra.html', '<html></html>');
    expect(fileSetProblems(dist, FIXTURE_ROUTES)).toEqual([
      { file: 'extra.html', rule: 'file-set', message: 'orphan page: no route builds this file' },
    ]);
  });

  it('reports a missing page by name', () => {
    const dist = validDist();
    dist.delete('es/privacidad.html');
    expect(fileSetProblems(dist, FIXTURE_ROUTES)).toEqual([
      {
        file: 'es/privacidad.html',
        rule: 'file-set',
        message: 'missing page: the route table expects it',
      },
    ]);
  });

  it('ignores files that are not HTML', () => {
    const dist = validDist();
    dist.set('notes.txt', 'x');
    expect(fileSetProblems(dist, FIXTURE_ROUTES)).toEqual([]);
  });
});

describe('parsed pages', () => {
  it('gives each present file its route id and locale, not-found pages included', () => {
    const pages = pagesOf(validDist(), FIXTURE_ROUTES);
    expect(pages).toHaveLength(pageCount(FIXTURE_ROUTES));
    expect(
      pages.map(({ file, id, locale, routable }) => [file, id, locale, routable].join(' ')),
    ).toContain('es/privacidad.html privacy es true');
    expect(pages.find((page) => page.file === '404.html')).toMatchObject({
      id: 'notFound',
      locale: 'en',
      routable: false,
    });
    expect(pages.find((page) => page.file === 'es/404.html')?.root.querySelector('h1')?.text).toBe(
      'Heading of notFound',
    );
  });

  it('skips a missing file instead of failing on it', () => {
    const dist = validDist();
    dist.delete('about.html');
    expect(pagesOf(dist, FIXTURE_ROUTES)).toHaveLength(pageCount(FIXTURE_ROUTES) - 1);
  });
});
