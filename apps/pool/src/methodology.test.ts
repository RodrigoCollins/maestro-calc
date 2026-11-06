import { describe, expect, it } from 'vitest';
import { figure } from './__testing__/figure.ts';
import {
  ALKALINITY,
  CALCIUM,
  CHLORINE,
  FILL_TIME,
  HEATER,
  PH,
  PUMP,
  SALT,
  STABILIZER,
} from './doses.ts';
import { HOME_TOOLS } from './home.ts';
import {
  ALKALINITY_ES,
  CALCIUM_ES,
  CHLORINE_ES,
  FILL_TIME_ES,
  HEATER_ES,
  PH_ES,
  PUMP_ES,
  SALT_ES,
  STABILIZER_ES,
} from './doses-es.ts';
import { METHOD_PAGE, METHOD_SECTIONS, methodSectionsOf } from './methodology.ts';
import { routeOf } from './routes.ts';
import { VOLUME_TEXTS, VOLUME_TEXTS_ES } from './volume/texts.ts';

describe('pool methodology', () => {
  it('has one section per calculator, in the order of the home cards', () => {
    expect(METHOD_SECTIONS.map(({ href }) => href)).toEqual(HOME_TOOLS.map(({ href }) => href));
  });

  it('states each formula and note exactly as the calculator page does', () => {
    const pages = [
      VOLUME_TEXTS,
      SALT,
      CHLORINE,
      PUMP,
      PH,
      ALKALINITY,
      STABILIZER,
      CALCIUM,
      HEATER,
      FILL_TIME,
    ];
    METHOD_SECTIONS.forEach((section, index) => {
      expect(section.method).toBe(pages[index]?.method);
      expect(section.note).toBe(pages[index]?.note);
    });
  });

  it('names at least one source for every section, any link on https', () => {
    for (const { sources } of METHOD_SECTIONS) {
      expect(sources.length).toBeGreaterThan(0);
      for (const { url } of sources)
        if (url !== undefined) expect(url.startsWith('https://')).toBe(true);
    }
  });

  // the published cases are hand-verified; the engine must give the same figure, to the digit
  it.each(METHOD_SECTIONS.flatMap(({ href, cases }) => cases.map((c) => [href, c] as const)))(
    'works out the %s case as published',
    (href, { raw, key, result }) => {
      expect(figure(href, raw, key)).toBe(result);
    },
  );
});

/** The numbers of a text, a thousands comma read inside its number: "20,000" is 20000. */
const numbersOf = (text: string): string[] =>
  (text.replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(?:\.\d+)?/g) ?? []).sort();

describe('pool methodology in Spanish', () => {
  const spanish = methodSectionsOf('es');

  it('is the English methodology in English', () => {
    expect(methodSectionsOf('en')).toBe(METHOD_SECTIONS);
  });

  it('has the same sections, each at its anchor and linking the Spanish calculator', () => {
    expect(spanish.map(({ id }) => id)).toEqual(METHOD_SECTIONS.map(({ id }) => id));
    METHOD_SECTIONS.forEach(({ href }, index) => {
      expect(spanish[index]?.href).toBe(routeOf(href)?.es);
    });
  });

  it('states each formula and note exactly as the Spanish calculator page does', () => {
    const pages = [
      VOLUME_TEXTS_ES,
      SALT_ES,
      CHLORINE_ES,
      PUMP_ES,
      PH_ES,
      ALKALINITY_ES,
      STABILIZER_ES,
      CALCIUM_ES,
      HEATER_ES,
      FILL_TIME_ES,
    ];
    spanish.forEach((section, index) => {
      expect(section.method).toBe(pages[index]?.method);
      expect(section.note).toBe(pages[index]?.note);
    });
  });

  // the cases are the English ones: the same inputs and figure, so the engine run above checks them
  it('works out the same cases, every figure of each case and source as the English one', () => {
    METHOD_SECTIONS.forEach((en, index) => {
      const es = spanish[index];
      expect(es?.cases.map(({ raw, key, result }) => [raw, key, result])).toEqual(
        en.cases.map(({ raw, key, result }) => [raw, key, result]),
      );
      en.cases.forEach(({ text }, at) => {
        expect(numbersOf(es?.cases[at]?.text ?? ''), text).toEqual(numbersOf(text));
      });
      expect(es?.sources.map(({ url }) => url)).toEqual(en.sources.map(({ url }) => url));
      en.sources.forEach(({ name }, at) => {
        expect(numbersOf(es?.sources[at]?.name ?? ''), name).toEqual(numbersOf(name));
      });
    });
  });

  it('speaks in the tú register, with its own title and description', () => {
    const text = JSON.stringify([
      METHOD_PAGE.es,
      spanish.map(({ title, method, note, sources, cases }) => [
        title,
        method,
        note,
        sources.map(({ name }) => name),
        cases.map(({ text: worked, unit }) => [worked, unit]),
      ]),
    ]);
    expect(text).not.toMatch(/\busted\b|\bingrese\b|\bsalfumán\b|\bgallons\b/i);
    expect(METHOD_PAGE.es.title).not.toBe(METHOD_PAGE.en.title);
    expect(METHOD_PAGE.es.title.length).toBeLessThanOrEqual(65);
    expect(METHOD_PAGE.es.description.length).toBeGreaterThanOrEqual(50);
    expect(METHOD_PAGE.es.description.length).toBeLessThanOrEqual(160);
  });
});
