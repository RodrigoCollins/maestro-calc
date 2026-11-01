import { describe, expect, it } from 'vitest';
import { calculatorSite, UPDATED, validDist } from './__testing__/page-fixture.ts';
import { contextOf } from './checks.ts';
import { contentProblems } from './content.ts';
import { structureProblems } from './structure.ts';
import type { Site } from './types.ts';

const FILE = 'guides/bags.html';

/** The calculator fixture with one guide, `guide-bags`, that ends in the concrete page. */
const guideSite = (): Site => {
  const site = calculatorSite();
  return {
    ...site,
    routes: { ...site.routes, 'guide-bags': { en: '/guides/bags', es: '/es/guias/bolsas' } },
    updates: { ...site.updates, 'en/guide-bags': UPDATED, 'es/guide-bags': UPDATED },
    guides: { 'guide-bags': 'concrete' },
  };
};

/** The json-ld and breadcrumb problems of the guide pages after `edit` changed the English one. */
const problemsAfter = (edit: (html: string) => string = (html) => html): string[] => {
  const site = guideSite();
  const dist = validDist(site);
  dist.set(FILE, edit(dist.get(FILE) ?? ''));
  const context = contextOf(dist, site, new Map());
  return [...contentProblems(context), ...structureProblems(context)]
    .filter(({ file }) => file.includes('guia') || file.includes('guides'))
    .map(({ file, rule, message }) => `${file} ${rule}: ${message}`);
};

/** The English guide's JSON-LD graph with `edit` applied to it. */
const withGraph =
  (edit: (graph: Record<string, unknown>[]) => unknown[]) =>
  (html: string): string =>
    html.replace(/<script type="application\/ld\+json">(.*?)<\/script>/, (_all, json: string) => {
      const document = JSON.parse(json) as { '@graph': Record<string, unknown>[] };
      return `<script type="application/ld+json">${JSON.stringify({ ...document, '@graph': edit(document['@graph']) })}</script>`;
    });

// spec: guides › [GU9] breadcrumb and Article on a guide
describe('guide pages (guides › check:site)', () => {
  it('accepts a valid guide in both languages', () => {
    expect(problemsAfter()).toEqual([]);
  });

  it('asks a guide for a labelled breadcrumb before its h1', () => {
    expect(
      problemsAfter((html) => html.replace(/<ol aria-label="Breadcrumb">.*?<\/ol>/, '')),
    ).toEqual([`${FILE} breadcrumb: a guide page needs a labelled ol before the h1`]);
  });

  it('asks for exactly one Article and one BreadcrumbList, and nothing else', () => {
    expect(
      problemsAfter(withGraph((graph) => graph.filter((node) => node['@type'] !== 'Article'))),
    ).toEqual([`${FILE} json-ld: expected exactly one Article, found 0`]);
    expect(
      problemsAfter(withGraph((graph) => [...graph, { '@type': 'FAQPage', mainEntity: [] }])),
    ).toEqual([`${FILE} json-ld: FAQPage is not allowed on this page`]);
  });

  it('ties the Article to the h1, the canonical, the language and the updated day', () => {
    expect(
      problemsAfter(
        withGraph((graph) =>
          graph.map((node) =>
            node['@type'] === 'Article'
              ? {
                  ...node,
                  headline: 'Other',
                  url: 'https://maestrocalc.com/x',
                  inLanguage: 'es-US',
                  dateModified: '2020-01-01',
                }
              : node,
          ),
        ),
      ),
    ).toEqual([
      `${FILE} json-ld: the Article headline must be the h1`,
      `${FILE} json-ld: the Article url must be the canonical`,
      `${FILE} json-ld: the Article inLanguage must be en-US`,
      `${FILE} json-ld: the Article dateModified must be ${UPDATED}`,
    ]);
  });

  it('checks the guide breadcrumb like a calculator one', () => {
    expect(
      problemsAfter(
        withGraph((graph) =>
          graph.map((node) =>
            node['@type'] === 'BreadcrumbList' ? { ...node, itemListElement: [] } : node,
          ),
        ),
      ),
    ).toEqual([
      `${FILE} json-ld: the BreadcrumbList must be Home (https://maestrocalc.com/) then the page (name and canonical)`,
    ]);
  });
});
