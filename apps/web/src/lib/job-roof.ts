import { ft2, Rational, valueIn } from '@maestro-calc/core';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText } from '../calculator/present.ts';
import { JOBS, type JobId } from '../routing/jobs.ts';
import { sentence, type ExtraSection } from './job-extra.ts';
import { roofing } from './roofing.ts';
import { siteText, type SiteText } from './site-text.ts';

/*
 * The roofing job pages (AdSense audit 2026-11-08): a footprint of one size also says what its
 * edges take, worked out by the roofing engine for a gable whose ridge runs along the longer side:
 * the eaves, the four rakes, the drip edge along both, the ridge and its height, and the roof
 * at the pitches the sizes table leaves out.
 */

/** Whether job `id` is a roofing footprint page. */
export const isRoofJob = (id: JobId): boolean => JOBS[id].calculator === 'roofing';

/** Drip edge counted in 10 ft pieces, and the pitches the sizes table (6, 8 and 10) leaves out. */
const PIECE = 10;
const PITCHES = [3, 4, 5, 7, 9, 12] as const;

const two = (value: Rational): string => decimalText(value, 2, true);
const whole = (value: Rational): string => decimalText(value, 0, true);

const feetOf = (value: string | undefined): number => {
  const match = /^(\d+)ft$/.exec(value ?? '');
  if (match?.[1] === undefined)
    throw new Error(`a roofing case gives whole feet: ${String(value)}`);
  return Number(match[1]);
};

/** The engine's roof over `long` × `span` at `pitch`: its area, its bundles and its slope factor. */
const roofOf = (long: number, span: number, pitch: number) => {
  const input = { length: `${String(long)}ft`, width: `${String(span)}ft`, pitch: String(pitch) };
  const valid = roofing.validate(input);
  if (!valid.ok) throw new Error(`invalid roof: ${JSON.stringify(input)}`);
  const result = roofing.compute(valid.value);
  const [bundles] = result.shopping;
  if (bundles === undefined) throw new Error(`no bundles for ${JSON.stringify(input)}`);
  const area = valueIn(result.outputs.areaFt2, ft2);
  return { area, bundles: bundles.qty, factor: area.div(Rational.of(long * span)) };
};

/** The pitch below 4 in 12 at which the IRC asks for two layers of underlayment under shingles. */
const DOUBLE_AT = 3;

/**
 * The four tips of the roofing page `id` (content audit 2026-11-10: the same four on every
 * footprint), with the footprint's own figures: the house its overhangs come from, its squares and
 * bundles, and its underlayment at 3/12, where the layers double. `undefined` for any other job.
 */
export const roofTips = (
  id: JobId,
  text: SiteText,
): readonly [string, string, string, string] | undefined => {
  if (!isRoofJob(id)) return undefined;
  const [raw] = JOBS[id].cases;
  const a = feetOf(raw['length']);
  const b = feetOf(raw['width']);
  const pitch = Number(raw['pitch']);
  const here = roofOf(a, b, pitch);
  const low = roofOf(a, b, DOUBLE_AT);
  return [
    sentence(text, 'site.job.guide.roofing.tip1', [a - 2, b - 2, a, b]),
    sentence(text, 'site.job.guide.roofing.tip2', [
      two(here.area.div(Rational.of(100))),
      `${String(pitch)}/12`,
      String(here.bundles),
    ]),
    sentence(text, 'site.job.guide.roofing.tip3', [
      `${String(DOUBLE_AT)}/12`,
      whole(low.area.mul(Rational.of(2))),
      whole(here.area),
      `${String(pitch)}/12`,
    ]),
    sentence(text, 'site.job.guide.roofing.tip4', [
      two(here.area.div(Rational.of(10))),
      Math.max(a, b),
    ]),
  ];
};

/** What the roofing page `id` adds to its table, or `undefined` for any other job. */
export const jobRoof = (id: JobId, locale: Locale): ExtraSection | undefined => {
  if (!isRoofJob(id)) return undefined;
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const a = feetOf(raw['length']);
  const b = feetOf(raw['width']);
  const pitch = Number(raw['pitch']);
  const long = Math.max(a, b);
  const span = Math.min(a, b);
  const half = Rational.of(span, 2);
  const { factor } = roofOf(long, span, pitch);
  const rake = half.mul(factor);
  const rakes = rake.mul(Rational.of(4));
  const eaves = 2 * long;
  const drip = rakes.add(Rational.of(eaves));
  const rise = half.mul(Rational.of(pitch, 12));
  return {
    heading: text('site.job.roof.heading'),
    paragraphs: [
      text('site.job.roof.lead'),
      sentence(text, 'site.job.roof.summary', [
        long,
        span,
        pitch,
        eaves,
        two(rake),
        long,
        two(rise),
        two(half.mul(roofOf(long, span, 12).factor)),
      ]),
      text('site.job.roof.after'),
    ],
    facts: [
      {
        label: text('site.job.roof.eaves'),
        value: `2 × ${String(long)} ft = ${String(eaves)} ft`,
      },
      {
        label: text('site.job.roof.rakes'),
        value: `4 × ${two(half)} ft × ${decimalText(factor, 3, false)} = ${two(rakes)} ft`,
      },
      {
        label: text('site.job.roof.drip'),
        value: `${String(eaves)} ft + ${two(rakes)} ft = ${two(drip)} ft, ${String(drip.div(Rational.of(PIECE)).ceil())} ${text('site.job.roof.pieces')}`,
      },
      {
        label: text('site.job.roof.ridge'),
        value: `${String(long)} ft`,
      },
      {
        label: text('site.job.roof.rise'),
        value: `${two(half)} ft × ${String(pitch)}/12 = ${two(rise)} ft`,
      },
    ],
    table: {
      columns: [
        text('site.job.roof.pitch'),
        text('site.job.roof.area'),
        text('site.job.roof.squares'),
        text('site.job.roof.bundles'),
        text('site.job.roof.rake'),
      ],
      rows: PITCHES.map((each) => {
        const roof = roofOf(long, span, each);
        return {
          label: `${String(each)}/12`,
          cells: [
            whole(roof.area),
            two(roof.area.div(Rational.of(100))),
            String(roof.bundles),
            two(half.mul(roof.factor)),
          ],
        };
      }),
    },
    sources: [],
  };
};
