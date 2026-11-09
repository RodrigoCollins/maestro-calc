import { ft2, gal, m3, Rational, valueIn, yd3 } from '@maestro-calc/core';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText } from '../calculator/present.ts';
import { isChartJob, isLandJob, isQuestionJob, JOBS, type JobId } from '../routing/jobs.ts';
import type { ExtraSection } from './job-extra.ts';
import { concrete } from './concrete.ts';
import { drywall } from './drywall.ts';
import { QUALI_KOTE_PDS } from './job-room.ts';
import { paint } from './paint.ts';
import { siteText } from './site-text.ts';

/*
 * The floor pages of square footage (AdSense audit 2026-11-08): a floor of one size also says what
 * fits on it, worked out from its own sides: the length of its edge, the carpet cut from a 12 ft
 * roll, the walls 8 ft high around it and their paint (the paint engine, no openings), and the
 * whole tiles of three sizes along each side with the 10% installers commonly keep for cuts.
 */

/** The floor pages: a square footage job that is not a lot of land, a chart or a question page (the garages carry their own tables). */
export const isFloorJob = (id: JobId): boolean =>
  JOBS[id].calculator === 'rectangle-area' &&
  !isLandJob(id) &&
  !isChartJob(id) &&
  !isQuestionJob(id);

/** NIST SP 811: 1 ft = 0.3048 m exactly. */
const METERS_PER_FOOT = Rational.of(3048, 10_000);
/** A carpet roll 12 ft wide, and the wall height the paint is worked for. */
const ROLL = 12;
const WALL = 8;
/** The tiles, a side in inches (30 and 60 cm are 3000 ÷ 254 and 6000 ÷ 254 in), and their label. */
const TILES = [
  { side: Rational.of(12), label: '12 × 12 in' },
  { side: Rational.of(18), label: '18 × 18 in' },
  { side: Rational.of(24), label: '24 × 24 in' },
  { side: Rational.of(3000, 254), label: '30 × 30 cm' },
  { side: Rational.of(6000, 254), label: '60 × 60 cm' },
] as const;
const EXTRA = Rational.of(11, 10);

const whole = (value: Rational): string => decimalText(value, 0, true);
const two = (value: Rational): string => decimalText(value, 2, true);

const feetOf = (value: string | undefined): number => {
  const match = /^(\d+)ft$/.exec(value ?? '');
  if (match?.[1] === undefined) throw new Error(`a floor case gives whole feet: ${String(value)}`);
  return Number(match[1]);
};

/** The fewest feet of a 12 ft roll that cover the floor, laid either way, and its strips. */
const carpetOf = (length: number, width: number) => {
  const laid = (across: number, along: number) => {
    const strips = Math.ceil(across / ROLL);
    return { strips, feet: strips * along };
  };
  const one = laid(width, length);
  const other = laid(length, width);
  return other.feet < one.feet ? other : one;
};

/** `=` when a figure shown to two places is exact, `≈` when it is rounded. */
const approx = (value: Rational): string => (value.mul(Rational.of(100)).isInteger() ? '=' : '≈');

/**
 * The floor as a room with walls 8 ft high and no openings, as the paint and drywall engines work it
 * out (two coats; walls and ceiling with 10% extra), and as a 4 in slab of 80 lb bags.
 */
const enginesOf = (length: number, width: number) => {
  const input = { length: `${String(length)}ft`, width: `${String(width)}ft`, height: '8ft' };
  const fail = () => new Error(`invalid floor: ${JSON.stringify(input)}`);
  const painted = paint.validate({ ...input, doors: '0', windows: '0', coats: '2' });
  const lined = drywall.validate({ ...input, doors: '0', windows: '0' });
  const poured = concrete.validate({ ...input, thickness: '4in', bag: '80' });
  if (!painted.ok || !lined.ok || !poured.ok) throw fail();
  const sheets = drywall.compute(lined.value);
  const slab = concrete.compute(poured.value);
  const [panels] = sheets.shopping;
  const [bags] = slab.shopping;
  if (panels === undefined || bags === undefined) throw fail();
  const gallons = valueIn(paint.compute(painted.value).outputs.gallons, gal);
  return { gallons, sheets, panels, slab, bags };
};

/** What the floor page of job `id` adds to its table, or `undefined` for any other job. */
export const jobFloor = (id: JobId, locale: Locale): ExtraSection | undefined => {
  if (!isFloorJob(id)) return undefined;
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const length = feetOf(raw['length']);
  const width = feetOf(raw['width']);
  const around = 2 * (length + width);
  const walls = around * WALL;
  const carpet = carpetOf(length, width);
  const carpetArea = Rational.of(carpet.feet * ROLL);
  const { gallons, sheets, panels, slab, bags } = enginesOf(length, width);
  const ceiling = Rational.of(length * width);
  const ceilingGallons = ceiling.mul(Rational.of(2)).div(Rational.of(350));
  // whole tiles along each side, a cut tile counted whole, then the 10% extra
  const tiled = TILES.map(({ side, label }) => {
    const along = Rational.of(length * 12)
      .div(side)
      .ceil();
    const across = Rational.of(width * 12)
      .div(side)
      .ceil();
    const count = along * across;
    return { label, along, across, count, extra: Rational.of(count).mul(EXTRA).ceil() };
  });
  const strips =
    carpet.strips > 1 ? `, ${String(carpet.strips)} ${text('site.job.floor.strips')}` : '';
  return {
    heading: text('site.job.floor.heading'),
    paragraphs: [
      text('site.job.floor.lead'),
      text('site.job.floor.summary', {
        size: `${String(length)} × ${String(width)}`,
        area: whole(ceiling),
        metric: two(ceiling.mul(METERS_PER_FOOT).mul(METERS_PER_FOOT)),
        edge: around,
        carpet: two(carpetArea.div(Rational.of(9))),
        tiles12: String(tiled[0]?.extra),
        tiles24: String(tiled[2]?.extra),
        sheets: panels.qty,
        bags: bags.qty,
      }),
      text('site.job.floor.tiles'),
    ],
    facts: [
      {
        label: text('site.job.floor.perimeter'),
        value: `2 × (${String(length)} ft + ${String(width)} ft) = ${String(around)} ft (${two(Rational.of(around).mul(METERS_PER_FOOT))} m)`,
      },
      {
        label: text('site.job.floor.carpet'),
        value: `${String(carpet.feet)} ft × ${String(ROLL)} ft = ${whole(carpetArea)} sq ft (${two(carpetArea.div(Rational.of(9)))} sq yd)${strips}`,
      },
      {
        label: text('site.job.floor.walls'),
        value: `${String(around)} ft × ${String(WALL)} ft = ${String(walls)} sq ft`,
      },
      {
        label: text('site.job.floor.paint'),
        value: `${String(walls)} sq ft × 2 ÷ 350 ${approx(gallons)} ${two(gallons)} gal`,
      },
      {
        label: text('site.job.floor.ceiling'),
        value: `${whole(ceiling)} sq ft × 2 ÷ 350 ${approx(ceilingGallons)} ${two(ceilingGallons)} gal`,
      },
      {
        label: text('site.job.floor.drywall'),
        value: `${whole(valueIn(sheets.outputs.areaFt2, ft2))} sq ft: ${String(panels.qty)} ${text('site.job.floor.sheets')}`,
      },
      {
        label: text('site.job.floor.slab'),
        value: `${two(valueIn(slab.outputs.volumeYd3, yd3))} yd³ (${two(valueIn(slab.outputs.volumeM3, m3))} m³), ${String(bags.qty)} ${text('site.job.floor.bags')}`,
      },
    ],
    table: {
      columns: [
        text('site.job.floor.tile'),
        text('site.job.floor.perSide'),
        text('site.job.floor.count'),
        text('site.job.floor.extra'),
      ],
      rows: tiled.map(({ label, along, across, count, extra }) => ({
        label,
        cells: [`${String(along)} × ${String(across)}`, String(count), String(extra)],
      })),
    },
    sources: [QUALI_KOTE_PDS],
  };
};
