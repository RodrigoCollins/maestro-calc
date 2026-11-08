import { ft2, ft3, inch, lbYd3, m, m2, m3, Rational, valueIn, yd2, yd3 } from '@maestro-calc/core';
import type { OutputDescriptor } from '@maestro-calc/core';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { topsoil } from '@maestro-calc/core/calculators/topsoil';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText, groupedInteger, outputText } from '../calculator/present.ts';
import { isChartJob, JOBS, type Job, type JobCase, type JobId } from '../routing/jobs.ts';
import { GRAVEL_DENSITIES } from '@maestro-calc/data/yields/gravel';
import { ROOFING_COVERAGE } from '@maestro-calc/data/yields/roofing';
import { concrete } from './concrete.ts';
import { drywall } from './drywall.ts';
import { gravel } from './gravel.ts';
import { jobView } from './job-view.ts';
import { paint } from './paint.ts';
import { roofing } from './roofing.ts';
import { siteText } from './site-text.ts';

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

/** The area in square feet, in square yards, in metric, and with the extra installers add. */
const areaSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const { outputs } = rectangleArea.compute(valid(rectangleArea.validate(raw), raw));
  const feet = two(valueIn(outputs.areaFt2, ft2));
  const length = feetOf(raw['length']);
  const width = feetOf(raw['width']);
  return [
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
      math: `${metersOf(length)} m × ${metersOf(width)} m = ${two(valueIn(outputs.areaM2, m2))} m²`,
    },
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
      label: text('site.job.worked.topsoil.total'),
      math: `${two(netVolume)} ft³ × ${two(extra)} ${sign(asShown(netVolume, 2).mul(extra), total, 2)} ${two(total)} ft³ = ${two(valueIn(outputs.volumeYd3, yd3))} yd³ = ${two(valueIn(outputs.volumeM3, m3))} m³`,
    },
    {
      label: text('site.job.worked.topsoil.bags'),
      math: `${two(total)} ft³ ÷ ${two(perBag)} ft³ ${sign(asShown(total, 2).div(perBag), total.div(perBag), 1)} ${decimalText(total.div(perBag), 1, true)} → ${groupedInteger(bags.qty)}`,
    },
  ];
};

/** The volume in place, the extra, the weight compacted, the tons and the loose yards to order. */
const gravelSteps = (id: JobId, locale: Locale): Steps => {
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const state = valid(gravel.validate(raw), raw);
  const { outputs } = gravel.compute(state);
  const placed = valueIn(outputs.placedYd3, yd3);
  const extra = Rational.ONE.add(state.waste.div(Rational.of(100)));
  const total = placed.mul(extra);
  const compacted = valueIn(GRAVEL_DENSITIES.compacted, lbYd3);
  const loose = valueIn(GRAVEL_DENSITIES.loose, lbYd3);
  const weight = total.mul(compacted);
  const pounds = Rational.of(2000);
  const shownWeight = asShown(weight, 2);
  return [
    {
      label: text('site.job.worked.gravel.placed'),
      math: `${jobView(id, locale).rows[0].label} = ${two(valueIn(outputs.placedYd3, ft3))} ft³ = ${two(placed)} yd³`,
    },
    {
      label: text('site.job.worked.gravel.total'),
      math: `${two(placed)} yd³ × ${two(extra)} ${sign(asShown(placed, 2).mul(extra), total, 2)} ${two(total)} yd³`,
    },
    {
      label: text('site.job.worked.gravel.weight'),
      math: `${two(total)} yd³ × ${groupedInteger(BigInt(compacted.toString()))} lb ${sign(asShown(total, 2).mul(compacted), weight, 2)} ${two(weight)} lb`,
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
};

/** The worked example of job `id` in `locale`, or `undefined` for a chart or another calculator. */
export const jobWorked = (id: JobId, locale: Locale): JobWorked | undefined => {
  const steps = isChartJob(id) ? undefined : STEPS[JOBS[id].calculator];
  if (steps === undefined) return undefined;
  return { heading: siteText(locale)('site.job.worked.heading'), steps: steps(id, locale) };
};
