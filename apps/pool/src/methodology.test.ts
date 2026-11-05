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
import { METHOD_SECTIONS } from './methodology.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

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
