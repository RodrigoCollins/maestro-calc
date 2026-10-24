import { describe, expect, it } from 'vitest';
import { headProblems } from './head.ts';
import { pagesOf } from './files.ts';
import { FIXTURE_ROUTES, fixtureSite, validDist } from './__testing__/page-fixture.ts';
import type { Site } from './types.ts';

/** Head problems of a valid dist after `edit` changed a page's HTML (and optionally the catalog). */
const problemsAfter = (
  edits: Readonly<Record<string, (html: string) => string>> = {},
  catalogEdits: Readonly<Record<string, string>> = {},
) => {
  const base = fixtureSite();
  const site: Site = {
    ...base,
    catalogs: { ...base.catalogs, en: { ...base.catalogs.en, ...catalogEdits } },
  };
  const dist = validDist(site);
  for (const [file, edit] of Object.entries(edits)) dist.set(file, edit(dist.get(file) ?? ''));
  return headProblems(pagesOf(dist, FIXTURE_ROUTES), site);
};

const rulesOf = (problems: ReturnType<typeof problemsAfter>, file: string): string[] =>
  problems.filter((entry) => entry.file === file).map((entry) => entry.rule);

describe('head rules over a valid dist', () => {
  it('finds nothing wrong with ten valid pages', () => {
    expect(problemsAfter()).toEqual([]);
  });
});

describe('language and meta (site-seo › [SS2], site-routing-i18n › [SR4])', () => {
  it('requires en-US on an English path and es-US on a Spanish one', () => {
    expect(
      rulesOf(
        problemsAfter({ 'index.html': (h) => h.replace('lang="en-US"', 'lang="en"') }),
        'index.html',
      ),
    ).toEqual(['lang']);
    expect(
      rulesOf(
        problemsAfter({ 'es.html': (h) => h.replace('lang="es-US"', 'lang="en-US"') }),
        'es.html',
      ),
    ).toEqual(['lang']);
  });

  it('requires charset utf-8 and the exact viewport without a zoom limit', () => {
    expect(
      rulesOf(
        problemsAfter({ 'about.html': (h) => h.replace('<meta charset="utf-8">', '') }),
        'about.html',
      ),
    ).toEqual(['charset']);
    expect(
      rulesOf(
        problemsAfter({
          'about.html': (h) => h.replace('initial-scale=1"', 'initial-scale=1, maximum-scale=1"'),
        }),
        'about.html',
      ),
    ).toEqual(['viewport']);
  });
});

describe('title (site-seo › [SE1], [SE2])', () => {
  const title = (value: string) => ({ 'page.home.title': value });

  it('accepts 10 and 60 characters and rejects 9 and 61', () => {
    expect(problemsAfter({}, title('a'.repeat(10)))).toEqual([]);
    expect(problemsAfter({}, title('a'.repeat(60)))).toEqual([]);
    expect(rulesOf(problemsAfter({}, title('a'.repeat(9))), 'index.html')).toEqual(['title']);
    expect(rulesOf(problemsAfter({}, title('a'.repeat(61))), 'index.html')).toEqual(['title']);
  });

  it('requires the suffix on every page but the home page, not-found included', () => {
    expect(
      rulesOf(
        problemsAfter({}, { 'page.about.title': 'About the company at large' }),
        'about.html',
      ),
    ).toEqual(['title']);
    expect(
      rulesOf(problemsAfter({}, { 'page.notFound.title': 'Nothing is here at all' }), '404.html'),
    ).toEqual(['title']);
  });

  it('requires exactly one title element', () => {
    expect(
      rulesOf(
        problemsAfter({ 'index.html': (h) => h.replace('</title>', '</title><title>b</title>') }),
        'index.html',
      ),
    ).toContain('title');
    expect(
      rulesOf(
        problemsAfter({ 'index.html': (h) => h.replace(/<title>.*<\/title>/, '') }),
        'index.html',
      ),
    ).toContain('title');
  });

  it('requires the built title to be the catalog value of that page id', () => {
    const problems = problemsAfter({
      'about.html': (h) => h.replace('about en | Maestro Calc', 'Something else | Maestro Calc'),
    });
    expect(problems).toEqual([
      {
        file: 'about.html',
        rule: 'title-catalog',
        message:
          'title "Something else | Maestro Calc" is not page.about.title "about en | Maestro Calc"',
      },
    ]);
  });

  it('names a title key that the catalog lacks', () => {
    const base = fixtureSite();
    const rest = Object.fromEntries(
      Object.entries(base.catalogs.en).filter(([key]) => key !== 'page.about.title'),
    );
    const site: Site = { ...base, catalogs: { ...base.catalogs, en: rest } };
    expect(
      headProblems(pagesOf(validDist(base), FIXTURE_ROUTES), site).filter(
        (entry) => entry.rule === 'title-catalog',
      ),
    ).toEqual([
      {
        file: 'about.html',
        rule: 'title-catalog',
        message: 'page.about.title is missing from the en catalog',
      },
    ]);
  });

  it('reports a title shared by two pages against the second one', () => {
    const problems = problemsAfter({}, { 'page.about.title': 'methodology en | Maestro Calc' });
    expect(problems).toEqual([
      {
        file: 'about.html',
        rule: 'title-unique',
        message: 'title is also the title of methodology.html',
      },
    ]);
  });
});

describe('description (site-seo › [SE1], [SE2], [SE3])', () => {
  const text = (length: number) => 'd'.repeat(length);

  it('fails the gate when a description is removed', () => {
    expect(
      rulesOf(
        problemsAfter({ 'index.html': (h) => h.replace(/<meta name="description"[^>]*>/, '') }),
        'index.html',
      ),
    ).toEqual(['description']);
  });

  it('requires exactly one description', () => {
    expect(
      rulesOf(
        problemsAfter({
          'index.html': (h) =>
            h.replace('</title>', '</title><meta name="description" content="x">'),
        }),
        'index.html',
      ),
    ).toContain('description');
  });

  it('accepts 70 and 160 characters and rejects 69 and 161', () => {
    expect(problemsAfter({}, { 'page.home.description': text(70) })).toEqual([]);
    expect(problemsAfter({}, { 'page.home.description': text(160) })).toEqual([]);
    expect(rulesOf(problemsAfter({}, { 'page.home.description': text(69) }), 'index.html')).toEqual(
      ['description'],
    );
    expect(
      rulesOf(problemsAfter({}, { 'page.home.description': text(161) }), 'index.html'),
    ).toEqual(['description']);
  });

  it('names a description key that the catalog lacks', () => {
    const base = fixtureSite();
    const rest = Object.fromEntries(
      Object.entries(base.catalogs.en).filter(([key]) => key !== 'page.about.description'),
    );
    const site: Site = { ...base, catalogs: { ...base.catalogs, en: rest } };
    expect(
      headProblems(pagesOf(validDist(base), FIXTURE_ROUTES), site).filter(
        (entry) => entry.rule === 'description-catalog',
      ),
    ).toEqual([
      {
        file: 'about.html',
        rule: 'description-catalog',
        message: 'page.about.description is missing from the en catalog',
      },
    ]);
  });

  it('requires the catalog value', () => {
    expect(
      rulesOf(
        problemsAfter({
          'index.html': (h) => h.replace('Description of the home', 'Text of the home'),
        }),
        'index.html',
      ),
    ).toEqual(['description-catalog']);
  });

  it('requires routable pages to differ but lets the not-found page repeat one', () => {
    expect(
      problemsAfter({}, { 'page.about.description': text(80), 'page.home.description': text(80) }),
    ).toEqual([
      {
        file: 'about.html',
        rule: 'description-unique',
        message: 'description is also the description of index.html',
      },
    ]);
    expect(
      problemsAfter(
        {},
        { 'page.notFound.description': text(80), 'page.home.description': text(80) },
      ),
    ).toEqual([]);
  });
});

describe('canonical and hreflang (site-seo › [SE15], site-routing-i18n › [SR8], [SR9], [SR10])', () => {
  it('names the page whose canonical was removed', () => {
    expect(
      rulesOf(
        problemsAfter({ 'privacy.html': (h) => h.replace(/<link rel="canonical"[^>]*>/, '') }),
        'privacy.html',
      ),
    ).toEqual(['canonical']);
  });

  it('requires the canonical to be the absolute self URL, once', () => {
    expect(
      rulesOf(
        problemsAfter({
          'es.html': (h) =>
            h.replace('href="https://maestrocalc.com/es"', 'href="https://maestrocalc.com/"'),
        }),
        'es.html',
      ),
    ).toContain('canonical');
    expect(
      rulesOf(
        problemsAfter({
          'es.html': (h) =>
            h.replace(
              '<link rel="alternate"',
              '<link rel="canonical" href="https://maestrocalc.com/es"><link rel="alternate"',
            ),
        }),
        'es.html',
      ),
    ).toContain('canonical');
  });

  it('requires the three alternates, equal to the route table', () => {
    expect(
      rulesOf(
        problemsAfter({
          'about.html': (h) => h.replace(/<link rel="alternate" hreflang="x-default"[^>]*>/, ''),
        }),
        'about.html',
      ),
    ).toEqual(['hreflang']);
    expect(
      rulesOf(
        problemsAfter({
          'about.html': (h) =>
            h.replace(
              'href="https://maestrocalc.com/es/sobre-nosotros"',
              'href="https://maestrocalc.com/es/about"',
            ),
        }),
        'about.html',
      ),
    ).toContain('hreflang');
  });

  it('names both pages when an alternate does not link back', () => {
    const problems = problemsAfter({
      'es/privacidad.html': (h) =>
        h.replaceAll(/<link rel="alternate" hreflang="(en-US|x-default)"[^>]*>/g, ''),
    });
    expect(problems).toContainEqual({
      file: 'privacy.html',
      rule: 'reciprocity',
      message: 'alternate es/privacidad.html does not list privacy.html back',
    });
  });

  it('names an alternate that is not a page of the build', () => {
    const problems = problemsAfter({
      'about.html': (h) =>
        h.replace(
          'href="https://maestrocalc.com/es/sobre-nosotros"',
          'href="https://maestrocalc.com/es/about"',
        ),
    });
    expect(problems).toContainEqual({
      file: 'about.html',
      rule: 'reciprocity',
      message: 'alternate https://maestrocalc.com/es/about is not a page of the build',
    });
  });
});

describe('indexing (site-routing-i18n › [SR14], site-seo › [SE13])', () => {
  it('requires noindex and no canonical or hreflang on the not-found pages', () => {
    expect(
      rulesOf(
        problemsAfter({
          '404.html': (h) => h.replace('<meta name="robots" content="noindex">', ''),
        }),
        '404.html',
      ),
    ).toEqual(['noindex']);
    expect(
      rulesOf(
        problemsAfter({
          'es/404.html': (h) =>
            h.replace(
              '<link rel="icon"',
              '<link rel="canonical" href="https://maestrocalc.com/es/404"><link rel="icon"',
            ),
        }),
        'es/404.html',
      ),
    ).toEqual(['canonical']);
    expect(
      rulesOf(
        problemsAfter({
          '404.html': (h) =>
            h.replace(
              '<link rel="icon"',
              '<link rel="alternate" hreflang="en-US" href="https://maestrocalc.com/"><link rel="icon"',
            ),
        }),
        '404.html',
      ),
    ).toEqual(['hreflang']);
  });

  it('forbids noindex on a routable page, in any case', () => {
    expect(
      rulesOf(
        problemsAfter({
          'about.html': (h) =>
            h.replace(
              '<link rel="icon"',
              '<meta name="robots" content="NoIndex, nofollow"><link rel="icon"',
            ),
        }),
        'about.html',
      ),
    ).toEqual(['noindex']);
    expect(
      rulesOf(
        problemsAfter({
          'about.html': (h) =>
            h.replace(
              '<link rel="icon"',
              '<meta name="robots" content="index, follow"><link rel="icon"',
            ),
        }),
        'about.html',
      ),
    ).toEqual([]);
  });
});
