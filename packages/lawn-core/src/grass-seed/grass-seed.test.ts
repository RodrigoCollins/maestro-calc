import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { figure, pounds, ran } from '../__testing__/run.ts';
import { grassSeed } from './grass-seed.ts';
import { SEED_RATES, seedRateOf } from './rates.ts';

// pounds of seed = rate (lb per 1,000 sq ft) x area / 1,000, at the low and the high end of the
// source's range; half goes on in each direction (Virginia Cooperative Extension 426-718).
describe('grass seed', () => {
  it('reads the defaults: 5,000 sq ft of Kentucky bluegrass by Virginia Tech, a 5 lb bag', () => {
    const state = grassSeed.validate({});
    expect(state.ok && state.value).toEqual({
      area: Rational.of(5000),
      species: 'kentucky-bluegrass',
      source: 'virginia-tech',
      bag: Rational.of(5),
    });
  });

  // 2 to 3 lb per 1,000 sq ft x 5 = 10 to 15 lb; half per direction 5 to 7.5; bags 2 to 3
  it('seeds 5,000 sq ft of bluegrass with 10 to 15 lb: two to three 5 lb bags', () => {
    const run = ran(grassSeed);
    expect(pounds(run, 'lowPounds')).toEqual(Rational.of(10));
    expect(pounds(run, 'highPounds')).toEqual(Rational.of(15));
    expect(pounds(run, 'lowPerPass')).toEqual(Rational.of(5));
    expect(pounds(run, 'highPerPass')).toEqual(Rational.of(15, 2));
    expect(figure(run, 'lowBags')).toEqual(Rational.of(2));
    expect(figure(run, 'highBags')).toEqual(Rational.of(3));
    expect(run.shopping).toEqual([{ materialId: 'grass-seed', purchaseUnit: 'bag', qty: 3n }]);
    expect(run.warnings).toEqual([]);
  });

  it('reads the other publication: Tennessee gives bluegrass 1 1/2 to 2 lb', () => {
    const run = ran(grassSeed, { source: 'tennessee' });
    expect(pounds(run, 'lowPounds')).toEqual(Rational.of(15, 2));
    expect(pounds(run, 'highPounds')).toEqual(Rational.of(10));
  });

  it('gives tall fescue 4 to 6 lb in Virginia and 5 to 8 lb in Tennessee, per 1,000 sq ft', () => {
    const virginia = ran(grassSeed, { species: 'tall-fescue', area: '1000' });
    expect(pounds(virginia, 'lowPounds')).toEqual(Rational.of(4));
    expect(pounds(virginia, 'highPounds')).toEqual(Rational.of(6));
    const tennessee = ran(grassSeed, { species: 'tall-fescue', source: 'tennessee', area: '1000' });
    expect(pounds(tennessee, 'lowPounds')).toEqual(Rational.of(5));
    expect(pounds(tennessee, 'highPounds')).toEqual(Rational.of(8));
  });

  it('doubles the hulled bermudagrass rate for unhulled seed in Tennessee: 1 to 2 lb', () => {
    expect(SEED_RATES['bermudagrass-unhulled'].tennessee).toEqual([Rational.of(1), Rational.of(2)]);
    expect(SEED_RATES['bermudagrass-hulled'].tennessee).toEqual([
      Rational.of(1, 2),
      Rational.of(1),
    ]);
  });

  it('gives zoysiagrass 1 to 2 lb of pure live seed whichever source is picked, and says so', () => {
    expect(seedRateOf('zoysiagrass', 'tennessee')).toEqual(
      seedRateOf('zoysiagrass', 'virginia-tech'),
    );
    const run = ran(grassSeed, { species: 'zoysiagrass', source: 'tennessee', area: '1000' });
    expect(pounds(run, 'lowPounds')).toEqual(Rational.of(1));
    expect(pounds(run, 'highPounds')).toEqual(Rational.of(2));
    expect(run.warnings).toEqual([{ code: 'zoysiaSource', params: {} }]);
  });

  it('seeds nothing on a zero area, with zero bags', () => {
    const run = ran(grassSeed, { area: '0' });
    expect(pounds(run, 'highPounds')).toEqual(Rational.ZERO);
    expect(run.shopping[0]?.qty).toBe(0n);
  });

  it('rejects a species or a source that is not offered, and a zero bag', () => {
    expect(grassSeed.run({ species: 'centipedegrass' }).ok).toBe(false);
    expect(grassSeed.run({ source: 'florida' }).ok).toBe(false);
    expect(grassSeed.run({ bag: '0' }).ok).toBe(false);
  });
});
