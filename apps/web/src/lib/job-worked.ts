import {
  bdft,
  ft2,
  ft3,
  gal,
  inch,
  lbYd3,
  m,
  m2,
  m3,
  Rational,
  valueIn,
  yd2,
  yd3,
} from '@maestro-calc/core';
import type { OutputDescriptor } from '@maestro-calc/core';
import { boardFeet } from '@maestro-calc/core/calculators/board-feet';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { topsoil } from '@maestro-calc/core/calculators/topsoil';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import { PAINT_COVERAGE } from '@maestro-calc/data/yields/paint';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText, groupedInteger, outputText } from '../calculator/present.ts';
import {
  ACRE_FT2,
  isChartJob,
  isLandJob,
  JOBS,
  type Job,
  type JobCase,
  type JobId,
} from '../routing/jobs.ts';
import { GRAVEL_DENSITIES } from '@maestro-calc/data/yields/gravel';
import { ROOFING_COVERAGE } from '@maestro-calc/data/yields/roofing';
import { concrete } from './concrete.ts';
import { INSTALLED_PRICES, READY_MIX_PRICES, slabCostOf } from './slab-cost.ts';
import { drywall } from './drywall.ts';
import { gravel } from './gravel.ts';
import { dressedCase, inchText, jobView, nominalOf } from './job-view.ts';
import { dressedOf } from './lumber-sizes.ts';
import { paint } from './paint.ts';
import { roofing } from './roofing.ts';
import { siteText } from './site-text.ts';
import {
  EXTERIOR_GALLON_PRICES,
  EXTERIOR_PRO_PRICE,
  INTERIOR_GALLON_PRICES,
  INTERIOR_PRO_PRICE,
  type PriceRange,
} from './paint-cost.ts';
import { INSTALLED_PRICE, LABOR_PRICE, PANEL_PRICES } from './drywall-cost.ts';

/*
 * The worked example of a job page (AdSense audit 2026-11-08): the first row of the table worked
 * out step by step, in imperial and in metric, so a reader can check the answer by hand. Each step
 * is a label of the `site` catalog and the arithmetic, which reads the same in both languages;
 * every figure is the engine's own, formatted as the page formats it.
 */

/** The calculators whose jobs show a worked example. */
export const WORKED_CALCULATORS: readonly Job['calculator'][] = [
  'concrete',
  'rectangle-area',
  'paint',
  'drywall',
  'roofing',
  'roof-pitch',
  'topsoil',
  'gravel',
  'feet-inches',
  'board-feet',
];

export interface JobStep {
  readonly label: string;
  readonly math: string;
}

export interface JobWorked {
  readonly heading: string;
  readonly steps: readonly [JobStep, JobStep, JobStep, ...JobStep[]];
}

type Steps = JobWorked['steps'];

const valid = <T>(result: { ok: true; value: T } | { ok: false }, raw: JobCase): T => {
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

const two = (value: Rational): string => decimalText(value, 2, true);

/** A figure as the page shows it, back as the exact decimal the reader sees. */
const asShown = (value: Rational, places: number): Rational =>
  Rational.of(BigInt(decimalText(value, places, false).replace('.', '')), 10n ** BigInt(places));

/**
 * `=` when the figures as shown give the result as shown, `≈` when only the exact figures do: the
 * steps round what they show, and a reader who checks them by hand must not find a wrong sum.
 */
const sign = (fromShown: Rational, exact: Rational, places: number): string =>
  decimalText(fromShown, places, true) === decimalText(exact, places, true) ? '=' : '≈';

/** `11ft` as the exact feet it names; a job case of these calculators gives whole feet. */
const feetOf = (value: string | undefined): Rational => {
  const match = /^(\d+)ft$/.exec(value ?? '');
  if (match?.[1] === undefined) throw new Error(`not a length in whole feet: ${String(value)}`);
  return Rational.of(Number(match[1]));
};

/** Feet in meters, exact to four places (1 ft is 0.3048 m), with no trailing zero. */
const metersOf = (feet: Rational): string =>
  decimalText(feet.mul(Rational.of(381, 1250)), 4, false).replace(/\.?0+$/, '');

/** The volume, the extra, the bags of 80 lb and their weight, for the first size of a pour. */
const concreteSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const state = valid(concrete.validate({ ...raw, bag: '80' }), raw);
  const { outputs, shopping } = concrete.compute(state);
  const [bags] = shopping;
  if (bags === undefined) throw new Error('the concrete engine returned no bag line');
  const total = valueIn(outputs.volumeFt3, ft3);
  const perBag = valueIn(CONCRETE_MIX_YIELDS['bag-80'], ft3);
  const netVolume = valueIn(outputs.netVolume, ft3);
  const net = two(netVolume);
  const extra = Rational.ONE.add(state.waste.div(Rational.of(100)));
  const factor = two(extra);
  const count = groupedInteger(bags.qty);
  const totalSign = sign(asShown(netVolume, 2).mul(extra), total, 2);
  const bagSign = sign(asShown(total, 2).div(asShown(perBag, 2)), total.div(perBag), 1);
  return [
    {
      label: text('site.job.worked.concrete.net'),
      math: `${jobView(id, locale).rows[0].label} = ${net} ft³`,
    },
    {
      label: text('site.job.worked.concrete.total'),
      math: `${net} ft³ × ${factor} ${totalSign} ${two(total)} ft³ = ${two(valueIn(outputs.volumeYd3, yd3))} yd³ = ${two(valueIn(outputs.volumeM3, m3))} m³`,
    },
    {
      label: text('site.job.worked.concrete.bags'),
      math: `${two(total)} ft³ ÷ ${two(perBag)} ft³ ${bagSign} ${decimalText(total.div(perBag), 1, true)} → ${count}`,
    },
    {
      label: text('site.job.worked.concrete.weight'),
      math: `${count} × 80 lb = ${groupedInteger(bags.qty * 80n)} lb`,
    },
  ];
};

/**
 * The slab cost page adds the price of its first slab: its cubic yards at the two producer prices,
 * then its area at the lowest and the highest installed price per square foot.
 */
const slabCostSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const cost = slabCostOf(raw);
  const yards = Rational.of(BigInt(cost.yards.replace(/[,.]/g, '')), 100n);
  const priced = READY_MIX_PRICES.map(({ perYard }, index) => {
    const price = Rational.of(BigInt(perYard.replace('.', '')), 100n);
    const shown = `$${decimalText(yards.mul(price), 2, true)}`;
    const exact = cost.readyMixExact[index] ?? '';
    return `${cost.yards} yd³ × $${perYard} ${shown === exact ? '=' : '≈'} ${exact}`;
  });
  const [low, high] = cost.installedAll.split('–');
  const area = `${cost.area} sq ft`;
  const [first, second, third, ...rest] = concreteSteps(id, locale);
  return [
    first,
    second,
    third,
    ...rest,
    { label: text('site.job.worked.cost.readyMix'), math: priced.join('; ') },
    {
      label: text('site.job.worked.cost.installed'),
      math: `${area} × $${INSTALLED_PRICES[0].low} = ${String(low)}; ${area} × $${INSTALLED_PRICES[1].high} = ${String(high)}`,
    },
  ];
};

/** The area in square feet, in square yards, in metric, and with the extra installers add. */
const areaSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const { outputs } = rectangleArea.compute(valid(rectangleArea.validate(raw), raw));
  const feet = two(valueIn(outputs.areaFt2, ft2));
  const length = feetOf(raw['length']);
  const width = feetOf(raw['width']);
  const squareMeters = two(valueIn(outputs.areaM2, m2));
  const [area, yards, metric] = [
    {
      label: text('site.job.worked.area.feet'),
      math: `${length.toString()} ft × ${width.toString()} ft = ${feet} ft²`,
    },
    {
      label: text('site.job.worked.area.yards'),
      math: `${feet} ft² ÷ 9 = ${two(valueIn(outputs.areaYd2, yd2))} yd²`,
    },
    {
      label: text('site.job.worked.area.metric'),
      math: `${metersOf(length)} m × ${metersOf(width)} m = ${squareMeters} m²`,
    },
  ] as const;
  // a lot of land is counted in acres and hectares, and takes nothing for cuts
  if (isLandJob(id)) {
    return [
      area,
      yards,
      metric,
      {
        label: text('site.job.worked.land.acres'),
        math: `${feet} ft² ÷ ${groupedInteger(BigInt(ACRE_FT2))} = ${two(valueIn(outputs.areaFt2, ft2).div(Rational.of(ACRE_FT2)))} ac`,
      },
      {
        label: text('site.job.worked.land.hectares'),
        math: `${squareMeters} m² ÷ 10,000 = ${decimalText(valueIn(outputs.areaM2, m2).div(Rational.of(10_000)), 4, true)} ha`,
      },
    ];
  }
  return [
    area,
    yards,
    metric,
    {
      label: text('site.job.worked.area.cuts'),
      math: `${feet} ft² × 1.10 = ${two(valueIn(outputs.areaFt2, ft2).mul(Rational.of(11, 10)))} ft²`,
    },
  ];
};

const paintOutput = (key: (typeof paint.outputs)[number]['key']): OutputDescriptor => {
  const output = paint.outputs.find((each) => each.key === key);
  if (output === undefined) throw new Error(`the paint engine has no ${key} output`);
  return output;
};

/** The walls, less the openings, the gallons of two coats and the cans, for the first height. */
const paintSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const { outputs, shopping } = paint.compute(valid(paint.validate(raw), raw));
  const [cans] = shopping;
  if (cans === undefined) throw new Error('the paint engine returned no can line');
  const walls = two(valueIn(outputs.wallArea, ft2));
  const area = two(valueIn(outputs.paintArea, ft2));
  const gallons = outputText(paintOutput('gallons'), outputs.gallons);
  const [length, width, height] = (['length', 'width', 'height'] as const).map(
    (key) => `${feetOf(raw[key]).toString()} ft`,
  );
  return [
    {
      label: text('site.job.worked.paint.walls'),
      math: `2 × (${String(length)} + ${String(width)}) × ${String(height)} = ${walls} ft²`,
    },
    {
      label: text('site.job.worked.paint.openings'),
      math: `${walls} ft² − 20 ft² − 2 × 15 ft² = ${area} ft²`,
    },
    {
      label: text('site.job.worked.paint.gallons'),
      math: `${area} ft² × 2 ÷ 350 ft² = ${gallons} gal = ${outputText(paintOutput('liters'), outputs.liters)} L`,
    },
    { label: text('site.job.worked.paint.cans'), math: `${gallons} → ${groupedInteger(cans.qty)}` },
  ];
};

/** The walls less the openings, with the ceiling, and the sheets of 4 × 8 ft with the extra. */
const drywallSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const state = valid(drywall.validate(raw), raw);
  const { outputs, shopping } = drywall.compute(state);
  const [sheets] = shopping;
  if (sheets === undefined) throw new Error('the drywall engine returned no sheet line');
  const length = feetOf(raw['length']);
  const width = feetOf(raw['width']);
  const height = feetOf(raw['height']);
  const area = valueIn(outputs.areaFt2, ft2);
  const walls = area.sub(length.mul(width));
  const factor = Rational.ONE.add(state.waste.div(Rational.of(100)));
  return [
    {
      label: text('site.job.worked.drywall.walls'),
      math: `2 × (${length.toString()} ft + ${width.toString()} ft) × ${height.toString()} ft − 20 ft² − 2 × 15 ft² = ${two(walls)} ft²`,
    },
    {
      label: text('site.job.worked.drywall.ceiling'),
      math: `${two(walls)} ft² + ${length.toString()} ft × ${width.toString()} ft = ${two(area)} ft² = ${two(valueIn(outputs.areaM2, m2))} m²`,
    },
    {
      label: text('site.job.worked.drywall.sheets'),
      math: `${two(area)} ft² × ${two(factor)} ÷ 32 ft² = ${decimalText(area.mul(factor).div(Rational.of(32)), 1, true)} → ${groupedInteger(sheets.qty)}`,
    },
  ];
};

/** The footprint, the slope factor, the roof area, the squares and the bundles with the extra. */
const roofingSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const state = valid(roofing.validate(raw), raw);
  const { outputs, shopping } = roofing.compute(state);
  const [bundles] = shopping;
  if (bundles === undefined) throw new Error('the roofing engine returned no bundle line');
  const length = feetOf(raw['length']);
  const width = feetOf(raw['width']);
  const root = `√(1 + (${String(raw['pitch'])}/12)²)`;
  const area = valueIn(outputs.areaFt2, ft2);
  const perBundle = valueIn(ROOFING_COVERAGE.bundle, ft2);
  const factor = Rational.ONE.add(state.waste.div(Rational.of(100)));
  // the slope factor is the roof area over the footprint, the root the engine takes
  const slope = area.div(length.mul(width));
  return [
    {
      label: text('site.job.worked.roofing.footprint'),
      math: `${length.toString()} ft × ${width.toString()} ft = ${two(length.mul(width))} ft²`,
    },
    {
      label: text('site.job.worked.roofing.slope'),
      math: `${root} = ${decimalText(slope, 3, false)}`,
    },
    {
      label: text('site.job.worked.roofing.area'),
      math: `${two(length.mul(width))} ft² × ${root} = ${two(area)} ft² = ${two(valueIn(outputs.areaM2, m2))} m²`,
    },
    {
      label: text('site.job.worked.roofing.squares'),
      math: `${two(area)} ft² ÷ 100 ft² ${sign(asShown(area, 2).div(Rational.of(100)), area.div(Rational.of(100)), 2)} ${two(area.div(Rational.of(100)))}`,
    },
    {
      label: text('site.job.worked.roofing.bundles'),
      math: `${two(area)} ft² × ${two(factor)} ÷ ${two(perBundle)} ft² ${sign(asShown(area, 2).mul(factor).div(asShown(perBundle, 2)), area.mul(factor).div(perBundle), 1)} ${decimalText(area.mul(factor).div(perBundle), 1, true)} → ${groupedInteger(bundles.qty)}`,
    },
  ];
};

/** The rafter multiplier, the rafter of the first run in feet and in meters, and the angle. */
const roofPitchSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const view = jobView(id, locale);
  const rise = String(raw['rise']).replace(/in$/, '');
  const root = `√(1 + (${rise}/12)²)`;
  const run = feetOf(raw['rafterRun']);
  const [feet = '', meters = ''] = view.rows[0].cells;
  const multiplier = view.facts.at(-1)?.value ?? '';
  return [
    { label: text('site.job.worked.roof-pitch.multiplier'), math: `${root} = ${multiplier}` },
    {
      label: text('site.job.worked.roof-pitch.rafter'),
      math: `${run.toString()} ft × ${root} = ${feet} ft`,
    },
    {
      label: text('site.job.worked.roof-pitch.metric'),
      math: `${metersOf(run)} m × ${root} = ${meters} m`,
    },
    { label: text('site.job.worked.roof-pitch.angle'), math: `atan(${rise}/12) = ${view.answer}` },
  ];
};

/** Up to `places` decimals, with no trailing zero: `29.25`, `2.2`, `114`. */
const trimmed = (value: Rational, places: number): string =>
  decimalText(value, places, true).replace(/\.?0+$/, '');

/** The volume, the extra for settling and the bags of 0.75 cu ft, for the first size. */
const topsoilSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const state = valid(topsoil.validate(raw), raw);
  const { outputs, shopping } = topsoil.compute(state);
  const [bags] = shopping;
  if (bags === undefined) throw new Error('the topsoil engine returned no bag line');
  const netVolume = valueIn(outputs.netVolume, ft3);
  const total = valueIn(outputs.volumeFt3, ft3);
  const extra = Rational.ONE.add(state.waste.div(Rational.of(100)));
  const perBag = Rational.of(3, 4);
  return [
    {
      label: text('site.job.worked.topsoil.net'),
      math: `${jobView(id, locale).rows[0].label} = ${two(netVolume)} ft³`,
    },
    {
      label: text(
        state.waste.isZero() ? 'site.job.worked.topsoil.exact' : 'site.job.worked.topsoil.total',
      ),
      math: `${two(netVolume)} ft³ × ${two(extra)} ${sign(asShown(netVolume, 2).mul(extra), total, 2)} ${two(total)} ft³ = ${two(valueIn(outputs.volumeYd3, yd3))} yd³ = ${two(valueIn(outputs.volumeM3, m3))} m³`,
    },
    {
      label: text('site.job.worked.topsoil.bags'),
      math: `${two(total)} ft³ ÷ ${two(perBag)} ft³ ${sign(asShown(total, 2).div(perBag), total.div(perBag), 1)} ${decimalText(total.div(perBag), 1, true)} → ${groupedInteger(bags.qty)}`,
    },
  ];
};

/** The volume in place, the extra, the weight as placed, the tons and the loose yards to order. */
const gravelSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const state = valid(gravel.validate(raw), raw);
  const { outputs } = gravel.compute(state);
  const placed = valueIn(outputs.placedYd3, yd3);
  const extra = Rational.ONE.add(state.waste.div(Rational.of(100)));
  const total = placed.mul(extra);
  // the gravel weighs what its placement does: compacted in place, or loose as the yard measures it
  const density = valueIn(GRAVEL_DENSITIES[state.placement], lbYd3);
  const loose = valueIn(GRAVEL_DENSITIES.loose, lbYd3);
  const weight = total.mul(density);
  const pounds = Rational.of(2000);
  const shownWeight = asShown(weight, 2);
  return [
    {
      label: text('site.job.worked.gravel.placed'),
      math: `${jobView(id, locale).rows[0].label} = ${two(valueIn(outputs.placedYd3, ft3))} ft³ = ${two(placed)} yd³`,
    },
    {
      label: text(
        state.waste.isZero() ? 'site.job.worked.gravel.exact' : 'site.job.worked.gravel.total',
      ),
      math: `${two(placed)} yd³ × ${two(extra)} ${sign(asShown(placed, 2).mul(extra), total, 2)} ${two(total)} yd³`,
    },
    {
      label: text(
        state.placement === 'loose'
          ? 'site.job.worked.gravel.weightLoose'
          : 'site.job.worked.gravel.weight',
      ),
      math: `${two(total)} yd³ × ${groupedInteger(BigInt(density.toString()))} lb ${sign(asShown(total, 2).mul(density), weight, 2)} ${two(weight)} lb`,
    },
    {
      label: text('site.job.worked.gravel.tons'),
      math: `${two(weight)} lb ÷ 2,000 lb ${sign(shownWeight.div(pounds), weight.div(pounds), 2)} ${two(weight.div(pounds))}`,
    },
    {
      label: text('site.job.worked.gravel.order'),
      math: `${two(weight)} lb ÷ ${groupedInteger(BigInt(loose.toString()))} lb ${sign(shownWeight.div(loose), weight.div(loose), 2)} ${two(weight.div(loose))} yd³`,
    },
  ];
};

/** The length in inches, divided, to the nearest 1/16 in on the tape, and in meters. */
const feetInchesSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const state = valid(feetInches.validate(raw), raw);
  const { outputs } = feetInches.compute(state);
  const first = String(raw['first']);
  const inches = `${trimmed(valueIn(state.first, inch), 4)} in`;
  const each = valueIn(outputs.result, inch);
  const [tape = ''] = jobView(id, locale).rows[0].cells;
  const steps = [
    {
      label: text('site.job.worked.feet-inches.divide'),
      math: `${inches} ÷ ${String(state.factor)} = ${trimmed(each, 4)} in`,
    },
    {
      label: text('site.job.worked.feet-inches.tape'),
      math: `${trimmed(each, 4)} in × 16 = ${trimmed(each.mul(Rational.of(16)), 4)} → ${tape}`,
    },
    {
      label: text('site.job.worked.feet-inches.metric'),
      math: `${trimmed(each, 4)} in × 0.0254 = ${decimalText(valueIn(outputs.resultM, m), 3, true)} m`,
    },
  ] as const;
  // a length typed as plain inches needs no first step: `22 in = 22 in` tells the reader nothing
  if (first === inches) return steps;
  return [
    { label: text('site.job.worked.feet-inches.inches'), math: `${first} = ${inches}` },
    ...steps,
  ];
};

/** A product of sizes with no trailing zeros: `64`, `202.5`, `33`. */
const plain = (value: Rational): string => decimalText(value, 4, true).replace(/\.?0+$/, '');

/** The board measure of the nominal size, of the dry dressed size, and the volume of the piece. */
const boardFeetSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const nominal = boardFeet.compute(valid(boardFeet.validate(raw), raw)).outputs;
  const dressedRaw = dressedCase(raw);
  const dressed = boardFeet.compute(valid(boardFeet.validate(dressedRaw), dressedRaw)).outputs;
  const thickness = nominalOf(raw['thickness']);
  const width = nominalOf(raw['width']);
  const length = feetOf(raw['length']);
  const size = dressedOf(thickness, width);
  const nominalProduct = Rational.of(thickness * width).mul(length);
  const dressedProduct = size.thickness.mul(size.width).mul(length);
  const feet = `${length.toString()} ft`;
  return [
    {
      label: text('site.job.worked.board-feet.nominal'),
      math: `${String(thickness)} in × ${String(width)} in × ${feet} ÷ 12 = ${plain(nominalProduct)} ÷ 12 = ${two(valueIn(nominal.boardFeet, bdft))}`,
    },
    {
      label: text('site.job.worked.board-feet.dressed'),
      math: `${inchText(size.thickness)} × ${inchText(size.width)} × ${feet} ÷ 12 = ${plain(dressedProduct)} ÷ 12 = ${two(valueIn(dressed.boardFeet, bdft))}`,
    },
    {
      label: text('site.job.worked.board-feet.volume'),
      math: `${two(valueIn(nominal.boardFeet, bdft))} ÷ 12 = ${two(valueIn(nominal.volumeFt3, ft3))} ft³ = ${decimalText(valueIn(nominal.volumeM3, m3), 3, true)} m³`,
    },
  ];
};

/*
 * The cost pages: the first room or house worked out from its walls to its price, each product of
 * a quantity and a published price written out, `≈` where the page rounds to whole dollars.
 */

/** A published price per unit as the exact dollars it states. */
const dollarsOf = (price: string): Rational => Rational.of(Math.round(Number(price) * 100), 100);

/** `13 × $10.00 = $130`, `370 ft² × $1.15 ≈ $426`. */
const priced = (quantity: Rational, unit: string, price: string): string => {
  const total = quantity.mul(dollarsOf(price));
  const shown = `${decimalText(quantity, 0, true)}${unit}`;
  return `${shown} × $${price} ${total.isInteger() ? '=' : '≈'} $${decimalText(total, 0, true)}`;
};

/** Both ends of a published range applied to `quantity`, joined as one step. */
const bothEnds = (quantity: Rational, unit: string, low: string, high: string): string =>
  `${priced(quantity, unit, low)}; ${priced(quantity, unit, high)}`;

/** The walls of `raw` less its doors and windows, as the paint and drywall calculators take them. */
const wallsMath = (raw: JobCase, doors: number, windows: number): string => {
  const [length, width, height] = (['length', 'width', 'height'] as const).map((key) =>
    feetOf(raw[key]).toString(),
  );
  const gross = `2 × (${String(length)} ft + ${String(width)} ft) × ${String(height)} ft`;
  const door = doors === 0 ? '' : ` − ${doors === 1 ? '' : `${String(doors)} × `}20 ft²`;
  const window = windows === 0 ? '' : ` − ${windows === 1 ? '' : `${String(windows)} × `}15 ft²`;
  return `${gross}${door}${window}`;
};

/** The paint of the first case: its walls, the gallons of its coats and the whole cans. */
const paintedOf = (raw: JobCase) => {
  const state = valid(paint.validate(raw), raw);
  const { outputs, shopping } = paint.compute(state);
  const cans = shopping.find(({ materialId }) => materialId === 'paint')?.qty;
  if (cans === undefined) throw new Error('the paint engine returned no can line');
  const area = valueIn(outputs.paintArea, ft2);
  const gallons = valueIn(outputs.gallons, gal);
  const shown = decimalText(gallons, 2, true);
  const exactly = gallons.mul(Rational.of(100)).isInteger() ? '=' : '≈';
  return {
    walls: `${wallsMath(raw, state.doors, state.windows)} = ${decimalText(area, 0, true)} ft²`,
    gallons: `${decimalText(area, 0, true)} ft² × ${String(state.coats)} ÷ ${decimalText(valueIn(PAINT_COVERAGE.perGallon, ft2), 0, true)} ft² ${exactly} ${shown} gal → ${groupedInteger(cans)}`,
    area,
    cans: Rational.of(cans),
  };
};

const floorOf = (raw: JobCase): string => {
  const [length, width] = [feetOf(raw['length']), feetOf(raw['width'])];
  return `${length.toString()} ft × ${width.toString()} ft = ${decimalText(length.mul(width), 0, true)} ft²; ${bothEnds(length.mul(width), ' ft²', INTERIOR_PRO_PRICE.low, INTERIOR_PRO_PRICE.high)}`;
};

/** Value paint at its lowest price to premium at its highest, the range the room page gives. */
const widest = (prices: readonly PriceRange[]): readonly [string, string] => [
  prices[0]?.low ?? '',
  prices.at(-1)?.high ?? '',
];

const roomCostSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const room = paintedOf(raw);
  const [low, high] = widest(INTERIOR_GALLON_PRICES);
  return [
    { label: text('site.job.worked.cost.walls'), math: room.walls },
    { label: text('site.job.worked.cost.cans'), math: room.gallons },
    { label: text('site.job.worked.cost.paint'), math: bothEnds(room.cans, '', low, high) },
    { label: text('site.job.worked.cost.painter'), math: floorOf(raw) },
  ];
};

const houseCostSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const house = paintedOf(raw);
  const [low, high] = widest(EXTERIOR_GALLON_PRICES);
  return [
    { label: text('site.job.worked.cost.outsideWalls'), math: house.walls },
    { label: text('site.job.worked.cost.cans'), math: house.gallons },
    { label: text('site.job.worked.cost.outsidePaint'), math: bothEnds(house.cans, '', low, high) },
    {
      label: text('site.job.worked.cost.outside'),
      math: bothEnds(house.area, ' ft²', EXTERIOR_PRO_PRICE.low, EXTERIOR_PRO_PRICE.high),
    },
    { label: text('site.job.worked.cost.inside'), math: floorOf(raw) },
  ];
};

const drywallCostSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const state = valid(drywall.validate(raw), raw);
  const { outputs, shopping } = drywall.compute(state);
  const sheets = shopping.find(({ materialId }) => materialId === 'drywall')?.qty;
  if (sheets === undefined) throw new Error('the drywall engine returned no sheet line');
  const area = valueIn(outputs.areaFt2, ft2);
  const [length, width] = [feetOf(raw['length']), feetOf(raw['width'])];
  const factor = Rational.ONE.add(state.waste.div(Rational.of(100)));
  const panels = area.mul(factor).div(Rational.of(32));
  const tenth = panels.mul(Rational.of(10)).isInteger() ? '=' : '≈';
  return [
    {
      label: text('site.job.worked.cost.drywallArea'),
      math: `${wallsMath(raw, state.doors, state.windows)} + ${length.toString()} ft × ${width.toString()} ft = ${decimalText(area, 0, true)} ft²`,
    },
    {
      label: text('site.job.worked.drywall.sheets'),
      math: `${decimalText(area, 0, true)} ft² × ${two(factor)} ÷ 32 ft² ${tenth} ${decimalText(panels, 1, true)} → ${groupedInteger(sheets)}`,
    },
    {
      label: text('site.job.worked.cost.panels'),
      math: bothEnds(Rational.of(sheets), '', PANEL_PRICES[0].low, PANEL_PRICES[1].high),
    },
    {
      label: text('site.job.worked.cost.drywallInstalled'),
      math: bothEnds(area, ' ft²', INSTALLED_PRICE.low, INSTALLED_PRICE.high),
    },
    {
      label: text('site.job.worked.cost.labor'),
      math: bothEnds(area, ' ft²', LABOR_PRICE.low, LABOR_PRICE.high),
    },
  ];
};

/** The worked examples that price their first case: the cost pages. */
const COST_STEPS: Partial<Record<JobId, (id: JobId, locale: Locale) => Steps>> = {
  'concrete-slab-cost': slabCostSteps,
  'cost-to-paint-a-room': roomCostSteps,
  'cost-to-paint-a-house': houseCostSteps,
  'drywall-installation-cost': drywallCostSteps,
};

const STEPS: Partial<Record<Job['calculator'], (id: JobId, locale: Locale) => Steps>> = {
  concrete: concreteSteps,
  'rectangle-area': areaSteps,
  paint: paintSteps,
  drywall: drywallSteps,
  roofing: roofingSteps,
  'roof-pitch': roofPitchSteps,
  topsoil: topsoilSteps,
  gravel: gravelSteps,
  'feet-inches': feetInchesSteps,
  'board-feet': boardFeetSteps,
};

/** The worked example of job `id` in `locale`, or `undefined` for a chart or another calculator. */
export const jobWorked = (id: JobId, locale: Locale): JobWorked | undefined => {
  const steps = COST_STEPS[id] ?? (isChartJob(id) ? undefined : STEPS[JOBS[id].calculator]);
  if (steps === undefined) return undefined;
  return { heading: siteText(locale)('site.job.worked.heading'), steps: steps(id, locale) };
};
