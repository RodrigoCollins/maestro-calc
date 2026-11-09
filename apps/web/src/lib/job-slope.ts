import { ft, inch, Rational, valueIn } from '@maestro-calc/core';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import type { MaterialSource } from '@maestro-calc/data';
import type { Locale } from '@maestro-calc/i18n';
import { createTranslator } from '@maestro-calc/i18n';
import { enRoofing } from '@maestro-calc/i18n/catalogs/en/roofing';
import { esRoofing } from '@maestro-calc/i18n/catalogs/es/roofing';
import { decimalText } from '../calculator/present.ts';
import { isPitchJob, JOBS, PITCH_RISES, type JobCase, type JobId } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import { siteText } from './site-text.ts';

/*
 * The exact pitch pages (Ahrefs US, 2026-11-08: "6/12 roof pitch" 1.8K, "4/12 roof pitch" 900,
 * "roof pitch multiplier" 800): a pitch page also says how OSHA classes the pitch for fall
 * protection, with its source, how tall a gable of that pitch stands at the ridge, and how much roof
 * covers a footprint, worked out with the multiplier the roof pitch engine gives for one foot of run.
 * The text that tells one pitch from another is the pitch's own `page.<id>.slope`.
 */

/** OSHA 29 CFR 1926.500(b): the definitions of a low-slope roof and of a steep roof. */
export const OSHA_1926_500: Required<MaterialSource> = {
  name: 'OSHA 29 CFR 1926.500, Scope, application and definitions (fall protection)',
  url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.500',
  retrieved: '2026-11-08',
};

/** OSHA 29 CFR 1926.501(b)(10) and (b)(11): fall protection on low-slope and on steep roofs. */
export const OSHA_1926_501: Required<MaterialSource> = {
  name: 'OSHA 29 CFR 1926.501, Duty to have fall protection',
  url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.501',
  retrieved: '2026-11-08',
};

/** OSHA's line between a low-slope and a steep roof: 4 in 12. */
const LOW_SLOPE_MAX = 4;

/** The gables whose ridge height the page gives: a span in feet, half of it the run. */
const SPANS = [
  { span: 24, key: 'site.job.slope.ridge.span24' },
  { span: 30, key: 'site.job.slope.ridge.span30' },
  { span: 36, key: 'site.job.slope.ridge.span36' },
] as const;

/** The footprints, overhangs included, whose roof surface the page gives, in square feet. */
const FOOTPRINTS = [1000, 1500, 2000] as const;

const roofingCatalogs = { en: createTranslator(enRoofing), es: createTranslator(esRoofing) };

const METERS_PER_FOOT = Rational.of(3048, 10_000);
const SQUARE_FT2 = Rational.of(100);

export interface SlopeFact {
  readonly label: string;
  readonly value: string;
}

export interface SlopeAreaRow {
  readonly label: string;
  /** The roof surface, then the squares. */
  readonly cells: readonly [string, string];
}

export interface JobSlope {
  readonly heading: string;
  /** Whether OSHA counts the pitch as a steep roof (above 4 in 12). */
  readonly steep: boolean;
  readonly osha: string;
  readonly sourceLabel: string;
  readonly sources: readonly [Required<MaterialSource>, Required<MaterialSource>];
  readonly note: string;
  readonly ridge: { readonly heading: string; readonly facts: readonly SlopeFact[] };
  readonly area: {
    readonly heading: string;
    readonly lead: string;
    readonly columns: readonly [string, string, string];
    readonly rows: readonly SlopeAreaRow[];
    /** The roofing calculator, which adds the waste and counts bundles and rolls. */
    readonly href: string;
    readonly more: string;
    readonly calculator: string;
  };
}

const stateOf = (raw: JobCase) => {
  const result = roofPitch.validate(raw);
  if (!result.ok) throw new Error(`invalid roof pitch case: ${JSON.stringify(raw)}`);
  return result.value;
};

/** The feet of rafter per foot of run of the pitch of `raw`, √(1 + t²), as the engine gives it. */
const multiplierOf = (raw: JobCase): Rational => {
  const { outputs } = roofPitch.compute(stateOf({ ...raw, rafterRun: '1ft', overhang: '0in' }));
  return valueIn(outputs.rafter, ft);
};

/** The rise over the run of the pitch of `raw`, exact. */
const slopeOf = (raw: JobCase): Rational => {
  const { rise, run } = stateOf(raw);
  return valueIn(rise, inch).div(valueIn(run, inch));
};

const feetText = (feet: Rational): string =>
  `${decimalText(feet, 2, true)} ft (${decimalText(feet.mul(METERS_PER_FOOT), 2, true)} m)`;

/** What the exact pitch page of job `id` adds to its table, or `undefined` for any other job. */
export const jobSlope = (id: JobId, locale: Locale): JobSlope | undefined => {
  if (!isPitchJob(id)) return undefined;
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const steep = PITCH_RISES[id] > LOW_SLOPE_MAX;
  const slope = slopeOf(raw);
  const multiplier = multiplierOf(raw);
  return {
    heading: text('site.job.slope.heading'),
    steep,
    osha: text(steep ? 'site.job.slope.steep' : 'site.job.slope.low'),
    sourceLabel: text('site.job.slope.sources'),
    sources: [OSHA_1926_500, OSHA_1926_501],
    note: text(`page.${id}.slope`),
    ridge: {
      heading: text('site.job.slope.ridge.heading'),
      facts: SPANS.map(({ span, key }) => ({
        label: text(key),
        value: feetText(slope.mul(Rational.of(span, 2))),
      })),
    },
    area: {
      heading: text('site.job.slope.area.heading'),
      lead: text('site.job.slope.area.lead'),
      columns: [
        text('site.job.slope.area.footprint'),
        text('site.job.slope.area.roof'),
        text('site.job.slope.area.squares'),
      ],
      rows: FOOTPRINTS.map((footprint) => {
        const roof = multiplier.mul(Rational.of(footprint));
        return {
          label: `${decimalText(Rational.of(footprint), 0, true)} sq ft`,
          cells: [
            `${decimalText(roof, 0, true)} sq ft`,
            decimalText(roof.div(SQUARE_FT2), 2, true),
          ],
        };
      }),
      href: pathOf('roofing', locale),
      more: text('site.job.slope.area.more'),
      calculator: roofingCatalogs[locale]('calc.roofing.title'),
    },
  };
};
