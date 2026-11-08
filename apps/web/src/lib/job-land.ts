import { encode, ft2, m2, Rational, valueIn, type OutputDescriptor } from '@maestro-calc/core';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { topsoil } from '@maestro-calc/core/calculators/topsoil';
import type { MaterialSource } from '@maestro-calc/data';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText, outputText } from '../calculator/present.ts';
import { isLandJob, JOBS, LAND_ACRES, type JobCase, type JobId } from '../routing/jobs.ts';
import { pathOf, type PageId } from '../routing/routes.ts';
import { siteText } from './site-text.ts';

/*
 * The acre pages (Ahrefs US, 2026-11-08: "how many square feet in an acre", 57K a month): a lot of
 * land is a square footage job whose page also says what an acre is by law, with its source, the
 * side of a square of that area, how many common floors make it up, and the topsoil and mulch that
 * cover it, worked out by the topsoil and mulch engines over the first lot of the table. The text
 * that tells one lot from another (its shapes, what it holds) is the lot's own `page.<id>.shape*`.
 */

/** NIST Handbook 44 (2024), Appendix C: the acre, the chain, the furlong and their metric values. */
export const NIST_HB44_C: Required<MaterialSource> = {
  name: 'NIST Handbook 44 (2024), Appendix C, General Tables of Units of Measurement',
  url: 'https://www.nist.gov/document/nist-hb-44-2024-appendix-c-general-tables-units-measurement',
  retrieved: '2026-11-08',
};

/** A fact of the glance list; a floor that has its own page links to it. */
export interface LandFact {
  readonly label: string;
  readonly value: string;
  readonly href?: string | undefined;
}

export interface LandCoverRow {
  readonly label: string;
  readonly href: string;
  /** The depth, then the cubic yards with the calculator's default extra. */
  readonly cells: readonly [string, string];
}

export interface JobLand {
  readonly heading: string;
  readonly definition: string;
  readonly surveyFoot: string;
  readonly sourceLabel: string;
  readonly source: Required<MaterialSource>;
  readonly shape: { readonly heading: string; readonly paragraphs: readonly [string, string] };
  readonly glance: { readonly heading: string; readonly facts: readonly LandFact[] };
  readonly cover: {
    readonly heading: string;
    readonly lead: string;
    readonly columns: readonly [string, string, string];
    readonly rows: readonly LandCoverRow[];
  };
}

/** The floors the area is counted in: a side in feet, and the job page of that floor, if any. */
const FLOORS = [
  { side: 12, key: 'site.job.land.floor12', page: 'square-feet-12x12' },
  { side: 20, key: 'site.job.land.floor20', page: 'square-feet-20x20' },
  { side: 24, key: 'site.job.land.floor24', page: undefined },
] as const satisfies readonly { side: number; key: string; page: PageId | undefined }[];

const valid = <T>(result: { ok: true; value: T } | { ok: false }, raw: JobCase): T => {
  if (!result.ok) throw new Error(`invalid land case: ${JSON.stringify(raw)}`);
  return result.value;
};

const yardsOf = (outputs: readonly OutputDescriptor[], name: string): OutputDescriptor => {
  const output = outputs.find((each) => each.key === 'volumeYd3');
  if (output === undefined) throw new Error(`the ${name} engine has no volumeYd3 output`);
  return output;
};

/** The first lot of job `id` spread `depth` inches deep with topsoil, at the calculator's defaults. */
const topsoilRow = (raw: JobCase, depth: number, label: string, locale: Locale): LandCoverRow => {
  const input = {
    length: raw['length'] ?? '',
    width: raw['width'] ?? '',
    depth: `${String(depth)}in`,
  };
  const state = valid(topsoil.validate(input), input);
  return {
    label,
    href: `${pathOf('topsoil', locale)}?${encode(topsoil, state, { unitSystem: 'imperial' })}`,
    cells: [
      `${String(depth)} in`,
      outputText(yardsOf(topsoil.outputs, 'topsoil'), topsoil.compute(state).outputs.volumeYd3),
    ],
  };
};

/** The first lot under 3 in of mulch, the mulch calculator's default depth and 5% extra. */
const mulchRow = (raw: JobCase, label: string, locale: Locale): LandCoverRow => {
  const input = { length: raw['length'] ?? '', width: raw['width'] ?? '', depth: '3in' };
  const state = valid(mulch.validate(input), input);
  return {
    label,
    href: `${pathOf('mulch', locale)}?${encode(mulch, state, { unitSystem: 'imperial' })}`,
    cells: [
      '3 in',
      outputText(yardsOf(mulch.outputs, 'mulch'), mulch.compute(state).outputs.volumeYd3),
    ],
  };
};

/** What the acre page of job `id` adds to its table, or `undefined` for any other job. */
export const jobLand = (id: JobId, locale: Locale): JobLand | undefined => {
  if (!isLandJob(id)) return undefined;
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  const { outputs } = rectangleArea.compute(valid(rectangleArea.validate(raw), raw));
  const feet = valueIn(outputs.areaFt2, ft2);
  const meters = valueIn(outputs.areaM2, m2);
  // the side of a square of the same area, √ft², to the hundredth: a display figure only
  const side = Math.sqrt(feet.toNumber());
  const sideText = `${side.toFixed(2)} ft (${(side * 0.3048).toFixed(2)} m)`;
  const one = (value: Rational): string => decimalText(value, 1, true);
  return {
    heading: text('site.job.land.heading'),
    definition: text('site.job.land.definition'),
    surveyFoot: text('site.job.land.surveyFoot'),
    sourceLabel: text('site.job.land.source'),
    source: NIST_HB44_C,
    shape: {
      heading: text('site.job.land.shape'),
      paragraphs: [text(`page.${id}.shape1`), text(`page.${id}.shape2`)],
    },
    glance: {
      heading: text('site.job.land.glance'),
      facts: [
        { label: text('site.job.land.acres'), value: String(LAND_ACRES[id]) },
        {
          label: text('site.job.land.hectares'),
          value: `${decimalText(meters.div(Rational.of(10_000)), 4, true)} ha`,
        },
        { label: text('site.job.land.side'), value: sideText },
        ...FLOORS.map(({ side: floor, key, page }) => ({
          label: text(key),
          value: one(feet.div(Rational.of(floor * floor))),
          href: page === undefined ? undefined : pathOf(page, locale),
        })),
      ],
    },
    cover: {
      heading: text('site.job.land.cover.heading'),
      lead: text('site.job.land.cover.lead'),
      columns: [
        text('site.job.land.cover.material'),
        text('site.job.land.cover.depth'),
        text('site.job.land.cover.yards'),
      ],
      rows: [
        topsoilRow(raw, 4, text('site.job.land.cover.topsoil'), locale),
        topsoilRow(raw, 6, text('site.job.land.cover.topsoil'), locale),
        mulchRow(raw, text('site.job.land.cover.mulch'), locale),
      ],
    },
  };
};
