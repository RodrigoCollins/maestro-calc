import { poolAlkalinity } from '@maestro-calc/pool-core/pool-alkalinity';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolFillTime } from '@maestro-calc/pool-core/pool-fill-time';
import { poolHeater } from '@maestro-calc/pool-core/pool-heater';
import { poolPh } from '@maestro-calc/pool-core/pool-ph';
import { poolPump } from '@maestro-calc/pool-core/pool-pump';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolStabilizer } from '@maestro-calc/pool-core/pool-stabilizer';
import { describe, expect, it } from 'vitest';
import { ALKALINITY, CHLORINE, FILL_TIME, HEATER, PH, PUMP, SALT, STABILIZER } from './doses.ts';
import { outputText } from './format.ts';

const CASES = [
  ['salt', SALT, poolSalt],
  ['chlorine', CHLORINE, poolChlorine],
  ['pump', PUMP, poolPump],
  ['pH', PH, poolPh],
  ['alkalinity', ALKALINITY, poolAlkalinity],
  ['stabilizer', STABILIZER, poolStabilizer],
  ['heater', HEATER, poolHeater],
  ['fill time', FILL_TIME, poolFillTime],
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

  it('labels both pH products, each shown by one result', () => {
    const product = poolPh.inputs.find(({ key }) => key === 'product');
    const options = product?.kind === 'select' ? product.options : [];
    expect(Object.keys(PH.fields['product']?.options ?? {})).toEqual(options);
    expect(PH.results.map(({ forms }) => forms)).toEqual([['muriatic-31-45'], ['soda-ash']]);
  });

  // Taylor Technologies' pH dosage charts (K-1003, Instr. #5816) per drop per 10,000 gallons
  it('states the Taylor chart figures, the strength they assume and the safety rules', () => {
    expect(PH.method).toContain('Taylor');
    expect(PH.method).toContain('9.16 fl oz');
    expect(PH.method).toContain('5.13 oz');
    expect(PH.method).toContain('approximate');
    expect(PH.note).toContain('31.45%');
    expect(PH.note).toContain('Add acid to water, never water to acid');
    expect(PH.note).toContain('pump running');
    expect(PH.note).toContain('wait time on the label');
    expect(PH.warnings?.['pastChart']).toContain('3 drops');
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
    expect(PH.strip).toBeUndefined();
    expect(ALKALINITY.strip).toBeUndefined();
    expect(STABILIZER.strip).toBeUndefined();
    expect(HEATER.strip).toBeUndefined();
    expect(FILL_TIME.strip).toBeUndefined();
  });

  it('names every warning of the salt, pH, alkalinity and stabilizer engines', () => {
    expect(Object.keys(SALT.warnings ?? {})).toEqual(poolSalt.warnings);
    expect(Object.keys(PH.warnings ?? {})).toEqual(poolPh.warnings);
    expect(Object.keys(ALKALINITY.warnings ?? {})).toEqual(poolAlkalinity.warnings);
    expect(Object.keys(STABILIZER.warnings ?? {})).toEqual(poolStabilizer.warnings);
  });

  // the 90 ppm and 60 to 180 ppm figures are the 2024 Model Aquatic Health Code's, for public pools
  it('cites the public-pool limits of the code it names, and no other range', () => {
    expect(ALKALINITY.note).toContain('60 to 180 ppm');
    expect(STABILIZER.warnings?.['overCodeLimit']).toContain('90 ppm');
    for (const page of [ALKALINITY, STABILIZER])
      expect(`${page.method} ${page.note}`).toContain('Model Aquatic Health Code');
    expect(STABILIZER.note).toContain('100%');
    expect(STABILIZER.note.toLowerCase()).toContain('label');
  });

  // first principles: 1 BTU warms 1 lb of water 1 °F, a gallon weighs about 8.34 lb; the loss and
  // the surface-area method are the U.S. Department of Energy's, quoted, never a multiplier of ours
  it('states the heat assumptions and that a real heater is sized larger', () => {
    expect(HEATER.method).toContain('8.34 lb');
    expect(HEATER.method).toContain('1 °F');
    expect(HEATER.note).toContain('sized larger');
    expect(HEATER.note).toContain('Department of Energy');
    expect(HEATER.note).toContain('× 12');
    expect(FILL_TIME.note).toContain('300 ÷');
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
    expect(text(poolPh, 'liquid')).toBe('36.6');
    expect(text(poolPh, 'dry', { product: 'soda-ash' })).toBe('20.5');
    expect(text(poolAlkalinity, 'pounds')).toBe('8.4');
    expect(text(poolAlkalinity, 'ounces')).toBe('134.5');
    expect(text(poolStabilizer, 'pounds')).toBe('5.0');
    expect(text(poolStabilizer, 'ounces')).toBe('80.1');
    expect(text(poolHeater, 'btuPerHour')).toBe('69,500');
    expect(text(poolHeater, 'btu')).toBe('1,668,000');
    expect(text(poolFillTime, 'time')).toBe('33 h 20 min');
    expect(text(poolFillTime, 'minutes')).toBe('2,000');
    expect(() => outputText('x', 1)).toThrow('no text for output x');
  });
});
