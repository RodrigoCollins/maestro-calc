import { Rational, tonYd3, valueIn } from '@maestro-calc/core';
import { BULK_WEIGHTS, type MaterialSource } from '@maestro-calc/data';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText } from '../calculator/present.ts';
import { isChartJob, isQuestionJob, JOBS, type JobId } from '../routing/jobs.ts';
import type { ExtraSection } from './job-extra.ts';
import { siteText } from './site-text.ts';

/*
 * The topsoil job pages (AdSense audit 2026-11-08): an area or a raised bed of one size also says
 * what each inch of soil on it holds and weighs, from its own sides and the cited weight of a
 * cubic yard of topsoil (New Mexico EMNRD, 0.80 ton), and how many bags of each labelled volume
 * fill it at the depths a bed or a lawn is worked to.
 */

/** Whether job `id` is a topsoil area or raised bed page. */
export const isSoilJob = (id: JobId): boolean =>
  JOBS[id].calculator === 'topsoil' && !isChartJob(id) && !isQuestionJob(id);

/** NIST SP 811: 1 ft = 0.3048 m and 1 ft³ = 28.316846592 L, both exact. */
const METERS_PER_FOOT = Rational.of(3048, 10_000);
const LITERS_PER_FT3 = Rational.of(28_316_846_592n, 1_000_000_000n);
/** The depths of a lawn or a garden area, and of a raised bed, in inches. */
const AREA_DEPTHS = [1, 2, 3, 4, 6, 8] as const;
const BED_DEPTHS = [6, 8, 10, 12, 18, 24] as const;
/** The bag volumes the topsoil calculator offers, in cubic feet, as their labels give them. */
const BAGS = [Rational.of(3, 4), Rational.of(1), Rational.of(3, 2)] as const;

const two = (value: Rational): string => decimalText(value, 2, true);
const whole = (value: Rational): string => decimalText(value, 0, true);

const feetOf = (value: string | undefined): number => {
  const match = /^(\d+)ft$/.exec(value ?? '');
  if (match?.[1] === undefined)
    throw new Error(`a topsoil case gives whole feet: ${String(value)}`);
  return Number(match[1]);
};

const TOPSOIL = BULK_WEIGHTS.find((each) => each.id === 'topsoil');
if (TOPSOIL === undefined) throw new Error('no bulk weight topsoil');
const TONS_PER_YARD = valueIn(TOPSOIL.low, tonYd3);
const SOURCES = TOPSOIL.sources.map(({ name, url, retrieved }): Required<MaterialSource> => {
  if (url === undefined) throw new Error(`the source ${name} has no address`);
  return { name, url, retrieved };
});

/** What the topsoil page `id` adds to its table, or `undefined` for any other job. */
export const jobSoil = (id: JobId, locale: Locale): ExtraSection | undefined => {
  if (!isSoilJob(id)) return undefined;
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const length = feetOf(raw['length']);
  const width = feetOf(raw['width']);
  const area = Rational.of(length * width);
  const bed = id.includes('raised-bed');
  const inch = area.div(Rational.of(12));
  const inchYards = inch.div(Rational.of(27));
  const metric = area.mul(METERS_PER_FOOT).mul(METERS_PER_FOOT);
  const depths = bed ? BED_DEPTHS : AREA_DEPTHS;
  return {
    heading: text(bed ? 'site.job.soil.bedHeading' : 'site.job.soil.heading'),
    paragraphs: [text('site.job.soil.lead'), text('site.job.soil.after')],
    facts: [
      {
        label: text('site.job.soil.area'),
        value: `${String(length)} ft × ${String(width)} ft = ${whole(area)} sq ft (${two(metric)} m²)`,
      },
      {
        label: text('site.job.soil.inch'),
        value: `${whole(area)} sq ft × 1 in = ${two(inch)} ft³ = ${two(inchYards)} yd³ (${two(inch.mul(LITERS_PER_FT3))} L)`,
      },
      {
        label: text('site.job.soil.inchWeight'),
        value: `${two(inchYards)} yd³ × ${two(TONS_PER_YARD)} ${text('site.job.soil.tonPerYard')} ≈ ${two(inchYards.mul(TONS_PER_YARD))} ${text('site.job.soil.tons')} (${whole(inchYards.mul(TONS_PER_YARD).mul(Rational.of(2000)))} lb)`,
      },
    ],
    table: {
      columns: [
        text('site.job.soil.depth'),
        text('site.job.soil.volume'),
        text('site.job.soil.weight'),
        text('site.job.soil.bags'),
      ],
      rows: depths.map((inches) => {
        const feet = inch.mul(Rational.of(inches));
        const yards = feet.div(Rational.of(27));
        return {
          label: `${String(inches)} in`,
          cells: [
            `${two(feet)} ft³ (${two(yards)} yd³)`,
            `${two(yards.mul(TONS_PER_YARD))} ${text('site.job.soil.tons')}`,
            BAGS.map((bag) => String(feet.div(bag).ceil())).join(' / '),
          ],
        };
      }),
    },
    sources: SOURCES,
  };
};
