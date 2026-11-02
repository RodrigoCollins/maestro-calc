import { describe, expect, it } from 'vitest';
import { calculatorSite, validDist } from './__testing__/page-fixture.ts';
import { contextOf } from './checks.ts';
import { hubProblems } from './hubs.ts';
import type { Dist, Site } from './types.ts';

/** The calculator fixture with one hub, `hub-concrete`, that lists the concrete page. */
const hubSite = (): Site => {
  const site = calculatorSite();
  return {
    ...site,
    routes: { ...site.routes, 'hub-concrete': { en: '/concrete', es: '/es/concreto' } },
    hubs: { 'hub-concrete': ['concrete'] },
  };
};

/** The valid dist of `site` with `pattern` taken out of the named files. */
const without = (site: Site, files: readonly string[], pattern: RegExp): Map<string, string> => {
  const dist = validDist(site);
  for (const file of files) dist.set(file, (dist.get(file) ?? '').replaceAll(pattern, ''));
  return dist;
};

/** The valid dist of `site` with `from` replaced by `to` in the named file. */
const edited = (site: Site, file: string, from: string, to: string): Map<string, string> => {
  const dist = validDist(site);
  dist.set(file, (dist.get(file) ?? '').replace(from, to));
  return dist;
};

const HUB_FILES = ['concrete.html', 'es/concreto.html'];
const CALCULATOR_FILES = ['concrete-calculator.html', 'es/calculadora-de-concreto.html'];

const messagesOf = (dist: Dist, site: Site): string[] =>
  hubProblems(contextOf(dist, site, new Map())).map(
    ({ file, rule, message }) => `${file} ${rule}: ${message}`,
  );

// spec: hubs › [HB1] the hub lists its calculators, [HB3] each calculator links its hub
describe('hub links (hubs › check:site)', () => {
  it('asks nothing of a site without hubs', () => {
    expect(messagesOf(validDist(calculatorSite()), calculatorSite())).toEqual([]);
  });

  it('accepts a valid build with a hub: both links in both languages', () => {
    expect(messagesOf(validDist(hubSite()), hubSite())).toEqual([]);
  });

  it('names a hub that does not list its calculator, per language', () => {
    const dist = without(hubSite(), HUB_FILES, /<section class="hub-directory".*?<\/section>/g);
    expect(messagesOf(dist, hubSite())).toEqual([
      'concrete.html hub-link: the hub must list its calculator /concrete-calculator',
      'es/concreto.html hub-link: the hub must list its calculator /es/calculadora-de-concreto',
    ]);
  });

  it('names a calculator page that does not link its hub, per language', () => {
    const dist = without(hubSite(), CALCULATOR_FILES, /<p class="hub-link">.*?<\/p>/g);
    expect(messagesOf(dist, hubSite())).toEqual([
      'concrete-calculator.html hub-link: the calculator page must link its hub /concrete',
      'es/calculadora-de-concreto.html hub-link: the calculator page must link its hub /es/concreto',
    ]);
  });

  it('rejects a link to the other language', () => {
    const toSpanish = edited(
      hubSite(),
      'concrete-calculator.html',
      'href="/concrete"',
      'href="/es/concreto"',
    );
    expect(messagesOf(toSpanish, hubSite())).toEqual([
      'concrete-calculator.html hub-link: the calculator page must link its hub /concrete',
    ]);
    const toEnglish = edited(
      hubSite(),
      'es/concreto.html',
      'href="/es/calculadora-de-concreto"',
      'href="/concrete-calculator"',
    );
    expect(messagesOf(toEnglish, hubSite())).toEqual([
      'es/concreto.html hub-link: the hub must list its calculator /es/calculadora-de-concreto',
    ]);
  });

  it('counts a link with no href as missing', () => {
    const noHref = edited(hubSite(), 'concrete-calculator.html', 'href="/concrete"', '');
    expect(messagesOf(noHref, hubSite())).toEqual([
      'concrete-calculator.html hub-link: the calculator page must link its hub /concrete',
    ]);
  });

  it('leaves a missing page to the file set', () => {
    const dist = validDist(hubSite());
    dist.delete('concrete.html');
    dist.delete('concrete-calculator.html');
    expect(messagesOf(dist, hubSite())).toEqual([]);
  });
});
