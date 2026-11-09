import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { describe, expect, it } from 'vitest';
import { SALT } from './doses.ts';
import { outputText } from './format.ts';
import { GUIDES } from './guide.ts';
import { routeOf } from './routes.ts';
import { SALT_AMOUNT_GUIDE } from './salt-amount.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/** The salt calculator's kilograms and 20 kg bags for `litres` from `current` to `target` ppm. */
const metric = (litres: number, current: number, target: number): string => {
  const ran = poolSalt.run({
    gallons: String(litres),
    current: String(current),
    target: String(target),
    units: 'metric',
  });
  if (!ran.ok) throw new Error('run failed');
  const kg = outputText('pounds', ran.value.outputs[0]?.value, 'metric');
  return `${kg} kg (${String(ran.value.shopping[0]?.qty)} bags)`;
};

const guide = SALT_AMOUNT_GUIDE;
const text = JSON.stringify(guide);

describe('how much salt for a pool (kilograms by litres)', () => {
  it('is an article route in both languages, listed with the guides', () => {
    expect(routeOf(guide.path)).toEqual({
      id: 'salt-amount-guide',
      kind: 'article',
      en: '/how-much-salt-for-a-pool',
      es: '/es/cuanta-sal-necesita-una-piscina',
    });
    expect(GUIDES.map(({ path }) => path)).toContain(guide.path);
    expect(guide.title.length).toBeLessThanOrEqual(65);
    expect(guide.description.length).toBeLessThanOrEqual(160);
    expect(guide.checked).toBe('2026-11-08');
  });

  it('leads with the fill of each pool from fresh water at the three makers’ levels', () => {
    const { table } = guide;
    expect(table.head).toEqual([
      'Pool',
      '3,200 ppm (Hayward AquaRite)',
      '4,000 ppm (AstralPool, Zodiac)',
      '6,000 ppm',
    ]);
    const sizes = [20_000, 30_000, 40_000, 50_000, 60_000, 80_000];
    expect(table.rows).toEqual(
      sizes.map((litres) => [
        `${litres.toLocaleString('en-US')} L`,
        metric(litres, 0, 3200),
        metric(litres, 0, 4000),
        metric(litres, 0, 6000),
      ]),
    );
    // AstralPool's own example: 50,000 L to 4,000 ppm take 200 kg
    expect(table.rows[3]?.[2]).toBe('200.0 kg (10 bags)');
  });

  it('tops each pool up to 4,000 ppm from the readings a low salt light shows', () => {
    const [topUp] = guide.moreTables;
    expect(topUp?.head).toEqual(['Pool', 'From 3,000 ppm', 'From 3,500 ppm']);
    expect(topUp?.rows).toEqual(
      [40_000, 50_000, 60_000, 80_000].map((litres) => [
        `${litres.toLocaleString('en-US')} L`,
        metric(litres, 3000, 4000),
        metric(litres, 3500, 4000),
      ]),
    );
    // the AstralPool manual's low-salt rule: about 50 kg per 50,000 litres
    expect(topUp?.rows[1]?.[1]).toBe('50.0 kg (3 bags)');
  });

  it('cites the levels of each manual it names, read on the day it was checked', () => {
    expect(Object.keys(guide.sources)).toEqual(['astral', 'zodiac', 'haywardAu', 'hayward']);
    expect(text).toContain('minimum 3000ppm of salt, but the recommended level is 4000ppm');
    expect(text).toContain('4,000 to 7,000 ppm');
    expect(text).toContain('2,700 to 3,400 ppm');
    expect(text).toContain('read 8 November 2026');
    for (const step of guide.steps) {
      for (const key of step.sources ?? []) expect(guide.sources).toHaveProperty(key);
    }
  });

  it('links the calculators in metric and the volume in litres', () => {
    const links = guide.steps.flatMap(({ link }) => (link === undefined ? [] : [link.href]));
    expect(links).toContain(VOLUME_TEXTS.path);
    expect(links).toContain(SALT.path);
    expect(links).toContain(`${SALT.path}?v=1&g=50000&c=3000&t=4000&m=metric`);
  });

  it('gives the US gallons figure from the same engine', () => {
    const ran = poolSalt.run({ gallons: '20000', current: '0', target: '3200' });
    if (!ran.ok) throw new Error('run failed');
    const pounds = outputText('pounds', ran.value.outputs[0]?.value);
    expect(guide.lead).toContain(`${pounds} lb`);
  });
});
