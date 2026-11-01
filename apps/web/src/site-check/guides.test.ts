import { describe, expect, it } from 'vitest';
import { calculatorSite, validDist } from './__testing__/page-fixture.ts';
import { contextOf } from './checks.ts';
import { guideProblems } from './guides.ts';
import type { Dist, Site } from './types.ts';

/** The calculator fixture with one guide, `guide-bags`, that ends in the concrete page. */
const guideSite = (): Site => {
  const site = calculatorSite();
  return {
    ...site,
    routes: { ...site.routes, 'guide-bags': { en: '/guides/bags', es: '/es/guias/bolsas' } },
    guides: { 'guide-bags': 'concrete' },
  };
};

/** The valid dist of `site` with every guide box taken out of the named files. */
const withoutBoxes = (site: Site, files: readonly string[]): Map<string, string> => {
  const dist = validDist(site);
  for (const file of files) {
    dist.set(
      file,
      (dist.get(file) ?? '').replaceAll(/<aside class="guide-[a-z]+".*?<\/aside>/g, ''),
    );
  }
  return dist;
};

/** The valid dist of `site` with `from` replaced by `to` in the named file. */
const edited = (site: Site, file: string, from: string, to: string): Map<string, string> => {
  const dist = validDist(site);
  dist.set(file, (dist.get(file) ?? '').replace(from, to));
  return dist;
};

const FILES = [
  'guides/bags.html',
  'concrete-calculator.html',
  'es/guias/bolsas.html',
  'es/calculadora-de-concreto.html',
];

const messagesOf = (dist: Dist, site: Site): string[] =>
  guideProblems(contextOf(dist, site, new Map())).map(
    ({ file, rule, message }) => `${file} ${rule}: ${message}`,
  );

// spec: guides › [GU1] the guide ends in its calculator, [GU6] the calculator links back
describe('guide links (guides › check:site)', () => {
  it('asks nothing of a site without guides', () => {
    expect(messagesOf(validDist(calculatorSite()), calculatorSite())).toEqual([]);
  });

  it('accepts a valid build with a guide: both links in both languages', () => {
    expect(messagesOf(validDist(guideSite()), guideSite())).toEqual([]);
  });

  it('names a guide without its box and a calculator page without the link back, per language', () => {
    expect(messagesOf(withoutBoxes(guideSite(), FILES), guideSite())).toEqual([
      'guides/bags.html guide-link: the guide must end in a box linking /concrete-calculator',
      'concrete-calculator.html guide-link: the calculator page must link its guide /guides/bags',
      'es/guias/bolsas.html guide-link: the guide must end in a box linking /es/calculadora-de-concreto',
      'es/calculadora-de-concreto.html guide-link: the calculator page must link its guide /es/guias/bolsas',
    ]);
  });

  it('rejects a link to the other language', () => {
    const toSpanish = edited(
      guideSite(),
      'guides/bags.html',
      'href="/concrete-calculator"',
      'href="/es/calculadora-de-concreto"',
    );
    expect(messagesOf(toSpanish, guideSite())).toEqual([
      'guides/bags.html guide-link: the guide must end in a box linking /concrete-calculator',
    ]);
    const toEnglish = edited(
      guideSite(),
      'es/calculadora-de-concreto.html',
      'href="/es/guias/bolsas"',
      'href="/guides/bags"',
    );
    expect(messagesOf(toEnglish, guideSite())).toEqual([
      'es/calculadora-de-concreto.html guide-link: the calculator page must link its guide /es/guias/bolsas',
    ]);
  });

  it('counts a link with no href as missing', () => {
    const noHref = edited(guideSite(), 'guides/bags.html', 'href="/concrete-calculator"', '');
    expect(messagesOf(noHref, guideSite())).toEqual([
      'guides/bags.html guide-link: the guide must end in a box linking /concrete-calculator',
    ]);
  });

  it('leaves a missing page to the file set', () => {
    const dist = validDist(guideSite());
    dist.delete('guides/bags.html');
    dist.delete('concrete-calculator.html');
    expect(messagesOf(dist, guideSite())).toEqual([]);
  });
});
