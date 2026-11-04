import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolPump } from '@maestro-calc/pool-core/pool-pump';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { describe, expect, it } from 'vitest';
import { CHLORINE, PUMP, SALT } from './doses.ts';
import { outputText } from './format.ts';

const CASES = [
  ['salt', SALT, poolSalt],
  ['chlorine', CHLORINE, poolChlorine],
  ['pump', PUMP, poolPump],
] as const;

describe('dose pages', () => {
  it.each(CASES)(
    'labels every input of the %s engine in order, and every output',
    (_n, page, engine) => {
      expect(Object.keys(page.fields)).toEqual(engine.inputs.map(({ key }) => key));
      expect(page.results.map(({ key }) => key)).toEqual(engine.outputs.map(({ key }) => key));
      expect(page.title.length).toBeLessThanOrEqual(70);
      expect(page.description.length).toBeLessThanOrEqual(160);
    },
  );

  it('labels every chlorine product the engine offers, each shown by one result', () => {
    const product = poolChlorine.inputs.find(({ key }) => key === 'product');
    const options = product?.kind === 'select' ? product.options : [];
    expect(Object.keys(CHLORINE.fields['product']?.options ?? {})).toEqual(options);
    expect(CHLORINE.results.flatMap(({ forms }) => forms ?? []).sort()).toEqual(
      [...options].sort(),
    );
  });

  it('gives the chlorine page the strip picker on its reading, and no other page one', () => {
    const current = poolChlorine.inputs.find(({ key }) => key === 'current');
    expect(CHLORINE.strip?.field).toBe('current');
    expect(current?.kind).toBe('decimal');
    // every pad is a reading the engine accepts
    for (const { ppm } of CHLORINE.strip?.pads ?? []) {
      expect(poolChlorine.validate({ current: ppm }).ok).toBe(true);
    }
    expect(SALT.strip).toBeUndefined();
    expect(PUMP.strip).toBeUndefined();
  });

  it('names every warning of the salt engine', () => {
    expect(Object.keys(SALT.warnings ?? {})).toEqual(poolSalt.warnings);
  });

  it('writes the default results in the units the pages name', () => {
    const text = (engine: (typeof CASES)[number][2], key: string, raw = {}) => {
      const ran = engine.run(raw);
      if (!ran.ok) throw new Error('run failed');
      return outputText(key, ran.value.outputs.find((output) => output.key === key)?.value);
    };
    expect(text(poolSalt, 'pounds')).toBe('133.4');
    expect(text(poolSalt, 'kilograms')).toBe('60.5');
    expect(text(poolChlorine, 'liquid')).toBe('41.0');
    expect(text(poolChlorine, 'dry', { product: 'cal-hypo-65' })).toBe('8.2');
    expect(text(poolPump, 'flow')).toBe('55.6');
    expect(text(poolPump, 'eightHour')).toBe('41.7');
    expect(() => outputText('x', 1)).toThrow('no text for output x');
  });
});
