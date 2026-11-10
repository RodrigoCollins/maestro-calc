import {
  countInput,
  decimalInput,
  defineCalculator,
  gal,
  oz,
  quantity,
  Rational,
  selectInput,
} from '@maestro-calc/core';
import { gallonsOf, unitsInput } from '../units.ts';

/**
 * Muriatic acid (20° Baumé, 31.45% HCl) lowers pH; soda ash (sodium carbonate, 100%) raises it; dry
 * acid (sodium bisulfate, 93.2%) lowers it too. A new product is appended: a shared link keeps its
 * meaning.
 */
const PRODUCTS = ['muriatic-31-45', 'soda-ash', 'dry-acid'] as const;

/**
 * Taylor Technologies, K-1003 instructions (Instr. #5816), pH dosage charts, per drop of the
 * demand reagent in 10,000 gallons: 9.16 fl oz of muriatic acid a drop of acid demand reagent
 * (R-0015) and 5.13 oz of soda ash a drop of base demand reagent (R-0016). A fluid ounce is 1/128
 * US gallon.
 */
const ACID_GALLONS_PER_DROP = Rational.of(916, 100 * 128 * 10_000);
const SODA_OUNCES_PER_DROP = Rational.of(513, 100 * 10_000);
/**
 * The same chart, dry acid (sodium bisulfate, 93.2%): 6.16 oz a drop of acid demand reagent in
 * 5,000 gallons, 12.32 oz in 10,000.
 */
const DRY_ACID_OUNCES_PER_DROP = Rational.of(1232, 100 * 10_000);
/** The chart lists 1, 2 and 3 drops. */
const CHART_DROPS = 3;
/**
 * HASA Muriatic Acid (31.45% hydrochloric acid), directions for use: "add one quart HASA MURIATIC
 * ACID per 20,000 gallons of pool water per 24 hours ... Repeat as necessary at 24 hour
 * intervals." A quart is 1/4 gallon, so at most gallons / 80,000 gallons of acid a day.
 */
const ACID_GALLONS_PER_DAY = Rational.of(1, 4 * 20_000);
/**
 * pH Up (sodium carbonate 100%) label, made for Alliance Trading, Inc. (01616483, REV050824):
 * "distribute a maximum of one bag or 1 pound per 10,000 gallons ... Allow water to recirculate two
 * to three hours, recheck pH, and repeat treatments if necessary." 16 oz per 10,000 gallons a time.
 */
const SODA_OUNCES_PER_ADDITION = Rational.of(16, 10_000);
/**
 * pH Down (sodium bisulfate 93.2%) label, made for Alliance Trading, Inc. (01616484, REV052024):
 * "Never add more than 1.5 pounds of this product per 10,000 gallons of pool water at any one time.
 * Allow pool water to recirculate two hours and retest pH." 24 oz per 10,000 gallons a time.
 */
const DRY_ACID_OUNCES_PER_ADDITION = Rational.of(24, 10_000);

/** The parts a dose takes at `most` a part: none for no dose, else the dose over it, rounded up. */
const partsOf = (dose: Rational, most: Rational): Rational =>
  dose.isZero() ? Rational.ZERO : Rational.of(dose.div(most).ceil());

/**
 * Pool pH: the dose of Taylor's pH dosage chart for the drops the acid demand or base demand test
 * took, gallons x drops x 9.16 fl oz of muriatic acid, or x 5.13 oz of soda ash, per 10,000
 * gallons. The test titrates the pool's own water, so its alkalinity is in the count. The other
 * product is zero, so a page shows the one that applies; past the chart's 3 drops each drop still
 * adds the same amount, and the run says the chart stops there. The labels cap one addition: HASA's
 * acid at a quart per 20,000 gallons in 24 hours, the pH Up soda ash at 1 lb per 10,000 gallons
 * 2 to 3 hours apart; the run gives that most for the pool's gallons and the days (acid) or the
 * additions (soda ash) the dose takes at it, and says so when it takes more than one. Dry acid reads
 * the chart's sodium bisulfate column, 12.32 oz a drop, in the dry output, and the pH Down label
 * caps it at 1.5 lb per 10,000 gallons a time, 2 hours apart: additions, as soda ash.
 */
export const poolPh = defineCalculator({
  id: 'pool-ph',
  inputs: [
    decimalInput({
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    }),
    selectInput({ key: 'product', urlKey: 'p', options: PRODUCTS, default: 'muriatic-31-45' }),
    countInput({ key: 'drops', urlKey: 'd', default: 2, max: 10 }),
    unitsInput(),
  ],
  outputs: [
    {
      key: 'liquid',
      measure: 'volume',
      role: 'primary',
      display: { unit: 'gal', format: 'decimal', places: 2 },
    },
    {
      key: 'dry',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'oz', format: 'decimal', places: 1 },
    },
    {
      key: 'liquidPerDay',
      measure: 'volume',
      role: 'secondary',
      display: { unit: 'gal', format: 'decimal', places: 2 },
    },
    { key: 'days', measure: 'number', role: 'secondary' },
    {
      key: 'dryPerAddition',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'oz', format: 'decimal', places: 1 },
    },
    { key: 'additions', measure: 'number', role: 'secondary' },
  ],
  warnings: ['pastChart', 'splitDays', 'splitAdditions'],
  compute: ({ gallons: volume, product, drops, units }) => {
    const gallons = gallonsOf(volume, units);
    const dose = gallons.mul(Rational.of(drops));
    const acid = product === 'muriatic-31-45';
    const dryAcid = product === 'dry-acid';
    const liquid = acid ? dose.mul(ACID_GALLONS_PER_DROP) : Rational.ZERO;
    const dry = acid
      ? Rational.ZERO
      : dose.mul(dryAcid ? DRY_ACID_OUNCES_PER_DROP : SODA_OUNCES_PER_DROP);
    const perDay = gallons.mul(ACID_GALLONS_PER_DAY);
    const perAddition = gallons.mul(
      dryAcid ? DRY_ACID_OUNCES_PER_ADDITION : SODA_OUNCES_PER_ADDITION,
    );
    const days = partsOf(liquid, perDay);
    const additions = partsOf(dry, perAddition);
    const one = Rational.of(1);
    return {
      outputs: {
        liquid: quantity(liquid, gal),
        dry: quantity(dry, oz),
        liquidPerDay: quantity(perDay, gal),
        days,
        dryPerAddition: quantity(perAddition, oz),
        additions,
      },
      shopping: [],
      warnings: [
        ...(drops > CHART_DROPS ? [{ code: 'pastChart' as const, params: {} }] : []),
        ...(days.compare(one) === 1 ? [{ code: 'splitDays' as const, params: {} }] : []),
        ...(additions.compare(one) === 1 ? [{ code: 'splitAdditions' as const, params: {} }] : []),
      ],
    };
  },
});
