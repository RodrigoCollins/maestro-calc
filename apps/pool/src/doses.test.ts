import { poolAlkalinity } from '@maestro-calc/pool-core/pool-alkalinity';
import { poolCalcium } from '@maestro-calc/pool-core/pool-calcium';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolFillTime } from '@maestro-calc/pool-core/pool-fill-time';
import { poolHeater } from '@maestro-calc/pool-core/pool-heater';
import { poolPh } from '@maestro-calc/pool-core/pool-ph';
import { poolPump } from '@maestro-calc/pool-core/pool-pump';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolStabilizer } from '@maestro-calc/pool-core/pool-stabilizer';
import { describe, expect, it } from 'vitest';
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
import {
  ALKALINITY_ES,
  CALCIUM_ES,
  CHLORINE_ES,
  PH_ES,
  SALT_ES,
  STABILIZER_ES,
} from './doses-es.ts';
import { outputText } from './format.ts';

const CASES = [
  ['salt', SALT, poolSalt],
  ['chlorine', CHLORINE, poolChlorine],
  ['pump', PUMP, poolPump],
  ['pH', PH, poolPh],
  ['alkalinity', ALKALINITY, poolAlkalinity],
  ['stabilizer', STABILIZER, poolStabilizer],
  ['calcium', CALCIUM, poolCalcium],
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
    expect(PH.results.map(({ forms }) => forms)).toEqual([
      ['muriatic-31-45'],
      ['soda-ash'],
      ['muriatic-31-45'],
      ['muriatic-31-45'],
      ['soda-ash'],
      ['soda-ash'],
    ]);
    // one large figure per product; the labels' most and the parts it takes sit under it
    expect(PH.results.filter(({ detail }) => detail !== true).map(({ key }) => key)).toEqual([
      'liquid',
      'dry',
    ]);
  });

  // HASA Muriatic Acid, directions for use: one quart per 20,000 gallons per 24 hours, repeated at
  // 24-hour intervals; pH Up (Alliance Trading) label: at most 1 lb per 10,000 gallons a time, the
  // water recirculating 2 to 3 hours before the pH is checked and the treatment repeated
  it('states the labels’ most per addition and how the split goes', () => {
    expect(PH.method).toContain('one quart per 20,000 gallons in 24 hours');
    expect(PH.method).toContain('HASA');
    expect(PH.method).toContain('1 lb per 10,000 gallons');
    expect(PH.method).toContain('2 to 3 hours');
    expect(PH.warnings?.['splitDays']).toContain('24 hours');
    expect(PH.warnings?.['splitDays']).toContain('test');
    expect(PH.warnings?.['splitAdditions']).toContain('2 to 3 hours');
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

  // ClearView Calcium Increaser label (Oreq): 2 oz per 1,000 gallons per 10 ppm, at most 3 lb per
  // 10,000 gallons a dose, 12 hours apart; the target range is Hayward's (the chart's)
  it('states the label dose, the split, the dilution rule and the range it cites', () => {
    expect(CALCIUM.method).toContain('2 oz of calcium chloride flake per 1,000 gallons');
    expect(CALCIUM.method).toContain('1.25 lb per 10 ppm per 10,000 gallons');
    expect(CALCIUM.method).toContain('0.925 lb');
    expect(CALCIUM.warnings?.['splitDose']).toContain('3 lb per 10,000 gallons');
    expect(CALCIUM.warnings?.['splitDose']).toContain('12 hours');
    expect(CALCIUM.warnings?.['dilutionToLower']).toContain('drain');
    expect(CALCIUM.note).toContain('200 to 400 ppm');
    expect(CALCIUM.note).toContain('2,500 ppm');
    expect(CALCIUM.note).toContain('Model Aquatic Health Code');
    expect(CALCIUM.note.toLowerCase()).toContain('label');
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
    expect(CALCIUM.strip).toBeUndefined();
    expect(HEATER.strip).toBeUndefined();
    expect(FILL_TIME.strip).toBeUndefined();
  });

  it('names every warning of the salt, pH, alkalinity, stabilizer and calcium engines', () => {
    expect(Object.keys(CALCIUM.warnings ?? {})).toEqual(poolCalcium.warnings);
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
    expect(text(poolPh, 'liquidPerDay')).toBe('32.0');
    expect(text(poolPh, 'days')).toBe('2');
    expect(text(poolPh, 'dryPerAddition', { product: 'soda-ash' })).toBe('32.0');
    expect(text(poolPh, 'additions', { product: 'soda-ash' })).toBe('1');
    expect(text(poolAlkalinity, 'pounds')).toBe('8.4');
    expect(text(poolAlkalinity, 'ounces')).toBe('134.5');
    expect(text(poolStabilizer, 'pounds')).toBe('5.0');
    expect(text(poolStabilizer, 'ounces')).toBe('80.1');
    expect(text(poolCalcium, 'pounds')).toBe('5.0');
    expect(text(poolCalcium, 'ounces')).toBe('80.0');
    expect(text(poolCalcium, 'firstAddition')).toBe('5.0');
    expect(text(poolHeater, 'btuPerHour')).toBe('69,500');
    expect(text(poolHeater, 'btu')).toBe('1,668,000');
    expect(text(poolFillTime, 'time')).toBe('33 h 20 min');
    expect(text(poolFillTime, 'minutes')).toBe('2,000');
    expect(() => outputText('x', 1)).toThrow('no text for output x');
  });
});

const METRIC = [
  ['salt', SALT, SALT_ES, poolSalt],
  ['chlorine', CHLORINE, CHLORINE_ES, poolChlorine],
  ['pH', PH, PH_ES, poolPh],
  ['alkalinity', ALKALINITY, ALKALINITY_ES, poolAlkalinity],
  ['stabilizer', STABILIZER, STABILIZER_ES, poolStabilizer],
  ['calcium', CALCIUM, CALCIUM_ES, poolCalcium],
] as const;

describe('the metric choice of the dose pages', () => {
  // the gallon job pages quote `method` and `note`: the litres are said once, on the dose page only
  it.each(METRIC)(
    'keeps the litres of the %s page in its metric method, out of its method and note',
    (_n, en, es) => {
      for (const page of [en, es]) {
        expect(page.metricMethod, page.path).toMatch(/litr|L\b/);
        expect(`${page.method} ${page.note}`, page.path).not.toMatch(
          /\b(In metric|en métrico)\b|\blitres\b|\bkg\b|\b1,000 L\b/i,
        );
      }
    },
  );

  it.each(METRIC)(
    'labels the units choice of the %s page and the volume in litres, in both languages',
    (_n, en, es) => {
      expect(en.fields['units']).toEqual({
        label: 'Units',
        options: { us: 'US: gallons, pounds', metric: 'Metric: litres, kilograms' },
      });
      expect(en.fields['gallons']?.metric).toBe('Pool volume (litres)');
      expect(es.fields['units']).toEqual({
        label: 'Unidades',
        options: { us: 'EE. UU.: galones, libras', metric: 'Métrico: litros, kilos' },
      });
      expect(es.fields['gallons']?.metric).toBe('Volumen de la piscina (litros)');
    },
  );

  it.each(METRIC)(
    'names a metric unit for every mass and liquid result of the %s page',
    (_n, en, es, engine) => {
      const measured = engine.outputs
        .filter(({ measure }) => measure === 'mass' || measure === 'volume')
        .map(({ key }) => key);
      for (const page of [en, es]) {
        const named = page.results.filter(({ metricUnit }) => metricUnit !== undefined);
        expect(named.map(({ key }) => key)).toEqual(measured);
      }
    },
  );

  it('names kilograms and 20 kg bags on the salt page, and pounds under the large figure', () => {
    expect(SALT.metricBags).toBe('bags of 20 kg');
    expect(SALT_ES.metricBags).toBe('sacos de 20 kg');
    expect(SALT.results.map(({ metricUnit }) => metricUnit)).toEqual(['KG', 'lb', 'kg']);
    expect(SALT.results[1]?.metricLabel).toBe('Pounds');
    expect(SALT_ES.results[1]?.metricLabel).toBe('Libras');
  });

  it('writes the metric results of 50,000 L the way the units name them', () => {
    const text = (engine: (typeof METRIC)[number][3], key: string, raw = {}) => {
      const ran = engine.run({ gallons: '50000', units: 'metric', ...raw });
      if (!ran.ok) throw new Error('run failed');
      const value = ran.value.outputs.find((output) => output.key === key)?.value;
      return outputText(key, value, 'metric');
    };
    // 50,000 L x 800 ppm / 1e6 = 40 kg, 88.2 lb; three quarters first, 30 kg
    expect(text(poolSalt, 'pounds')).toBe('40.0');
    expect(text(poolSalt, 'kilograms')).toBe('88.2');
    expect(text(poolSalt, 'firstAddition')).toBe('30.0');
    // 50,000 L x 2 ppm = 100 g of chlorine: 0.8 L of 12.5% liquid, 154 g of cal-hypo
    expect(text(poolChlorine, 'liquid')).toBe('0.80');
    expect(text(poolChlorine, 'dry', { product: 'cal-hypo-65' })).toBe('154');
    // 50,000 L x 30 ppm x 84.007 / 50.04 = 2,518 g of baking soda
    expect(text(poolAlkalinity, 'pounds')).toBe('2.5');
    expect(text(poolAlkalinity, 'ounces')).toBe('2,518');
    expect(text(poolStabilizer, 'pounds')).toBe('1.5');
    expect(text(poolStabilizer, 'ounces')).toBe('1,500');
  });
});
