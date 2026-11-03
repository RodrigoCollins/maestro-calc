import { gal, isQuantityOf } from '@maestro-calc/core';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolPump } from '@maestro-calc/pool-core/pool-pump';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { describe, expect, it } from 'vitest';
import { CHLORINE, PUMP, SALT } from './doses.ts';
import { outputText, volumeText } from './format.ts';
import { HOME_TOOLS } from './home.ts';
import { METHOD_SECTIONS } from './methodology.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

const ENGINES = {
  [VOLUME_TEXTS.path]: poolVolume,
  [SALT.path]: poolSalt,
  [CHLORINE.path]: poolChlorine,
  [PUMP.path]: poolPump,
} as const;

/** The text of one output of an engine run, as its page writes it. */
const figure = (path: string, raw: Readonly<Record<string, string>>, key: string): string => {
  const engine = ENGINES[path];
  if (engine === undefined) throw new Error(`no engine for ${path}`);
  const ran = engine.run(raw);
  if (!ran.ok) throw new Error(`${path} did not run`);
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  return isQuantityOf(value, 'volume') && key === 'gallons'
    ? volumeText(value, gal)
    : outputText(key, value);
};

describe('pool methodology', () => {
  it('has one section per calculator, in the order of the home cards', () => {
    expect(METHOD_SECTIONS.map(({ href }) => href)).toEqual(HOME_TOOLS.map(({ href }) => href));
  });

  it('states each formula and note exactly as the calculator page does', () => {
    const pages = [VOLUME_TEXTS, SALT, CHLORINE, PUMP];
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
