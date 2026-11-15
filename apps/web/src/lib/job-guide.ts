import { inch, Rational, valueIn } from '@maestro-calc/core';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import type { Locale } from '@maestro-calc/i18n';
import { createTranslator } from '@maestro-calc/i18n';
import { enRoofPitch } from '@maestro-calc/i18n/catalogs/en/roof-pitch';
import { esRoofPitch } from '@maestro-calc/i18n/catalogs/es/roof-pitch';
import { isChartJob, isLandJob, JOBS, type JobCase, type JobId } from '../routing/jobs.ts';
import type { PageId } from '../routing/routes.ts';
import { decimalText } from '../calculator/present.ts';
import { footingTips } from './job-concrete.ts';
import { sentence } from './job-extra.ts';
import { pitchTips, sixteenths } from './job-rafter.ts';
import { roofTips } from './job-roof.ts';
import { roomTips } from './job-room.ts';
import { siteText, type SiteText } from './site-text.ts';

/*
 * The buying advice of a job page (AdSense audit 2026-11-08): a page that answered a job with a
 * number and a table now also says how to measure it, what goes wrong and how to buy for it, in four
 * tips written for the kind of job, and links the guide that goes further. A roof pitch also lists
 * the IRC check of every covering at its pitch, worked out by the roof pitch engine. The reference
 * charts carry their own sources and basis, so they take neither.
 */

/** The kinds of job a tip is written for: a calculator, or for concrete the pour. */
export const JOB_GUIDE_KINDS = [
  'concrete-slab',
  'concrete-tube',
  'concrete-footing',
  'roof-pitch',
  'rectangle-area',
  'land',
  'mulch',
  'gravel',
  'paint',
  'drywall',
  'topsoil',
  'roofing',
  'feet-inches',
  'board-feet',
  'fence',
] as const;

export type JobGuideKind = (typeof JOB_GUIDE_KINDS)[number];

/** The guide each kind of job links to: the one that goes further on that job. */
const GUIDE_OF = {
  'concrete-slab': 'guide-concrete-bags-or-truck',
  'concrete-tube': 'guide-fence-post-concrete',
  'concrete-footing': 'guide-cubic-yards',
  'roof-pitch': 'guide-roof-pitch',
  'rectangle-area': 'guide-square-footage',
  land: 'guide-square-footage',
  mulch: 'guide-mulch',
  gravel: 'guide-gravel-driveway',
  paint: 'guide-paint-coverage',
  drywall: 'guide-drywall-estimate',
  topsoil: 'guide-raised-bed-soil',
  roofing: 'guide-roofing-quote',
  'feet-inches': 'guide-tape-measure-fractions',
  'board-feet': 'guide-board-feet',
  fence: 'guide-fence-post-concrete',
} as const satisfies Record<JobGuideKind, PageId>;

export interface JobGuide {
  readonly heading: string;
  readonly tips: readonly [string, string, string, string];
  /** The guide the section links to; the page names it by its h1. */
  readonly read: (typeof GUIDE_OF)[JobGuideKind];
}

/** The kind of job `id`, or `undefined` for a reference chart; a lot of land is not a room. */
export const jobGuideKindOf = (id: JobId): JobGuideKind | undefined => {
  if (isChartJob(id)) return undefined;
  if (isLandJob(id)) return 'land';
  const { calculator, cases } = JOBS[id];
  if (calculator !== 'concrete') return calculator;
  const shape = cases[0]['shape'];
  if (shape === 'column') return 'concrete-tube';
  if (shape === 'footing') return 'concrete-footing';
  return 'concrete-slab';
};

/** The buying advice of job `id` in `locale`, or `undefined` for a reference chart. */
export const jobGuide = (id: JobId, locale: Locale): JobGuide | undefined => {
  const kind = jobGuideKindOf(id);
  if (kind === undefined) return undefined;
  const text = siteText(locale);
  return {
    heading: text(`site.job.guide.${kind}.heading`),
    tips: tipsOf(kind, id, text),
    read: GUIDE_OF[kind],
  };
};

/** `k` eighths of an inch as a tape reads them: `1/8 in`, `1 1/8 in`, `2 in`. */
const eighthsText = (k: number): string => {
  const whole = Math.floor(k / 8);
  let part = k % 8;
  let over = 8;
  while (part !== 0 && part % 2 === 0) {
    part /= 2;
    over /= 2;
  }
  if (part === 0) return `${String(whole)} in`;
  return `${whole === 0 ? '' : `${String(whole)} `}${String(part)}/${String(over)} in`;
};

/**
 * The tips of the division `id` (content audit 2026-11-10: the same four on every division): the
 * tape tip with its own result, and the saw tip with its own cuts: n pieces take n − 1 cuts of
 * about 1/8 in, and each piece is what is left over n, to the nearest 1/16 in as the tape reads it.
 */
const divisionTips = (id: JobId, text: SiteText): JobGuide['tips'] => {
  const [raw] = JOBS[id].cases;
  const valid = feetInches.validate(raw);
  if (!valid.ok) throw new Error(`invalid division: ${JSON.stringify(raw)}`);
  const pieces = Number(raw['factor']);
  const cuts = pieces - 1;
  const length = valueIn(valid.value.first, inch);
  const left = length.sub(Rational.of(cuts, 8));
  const each = length.div(Rational.of(pieces));
  return [
    sentence(text, 'site.job.guide.feet-inches.tip1', [
      decimalText(each, 2, false),
      sixteenths(each.toNumber()),
    ]),
    sentence(text, 'site.job.guide.feet-inches.tip2', [
      cuts,
      eighthsText(cuts),
      pieces,
      sixteenths(left.div(Rational.of(pieces)).toNumber()),
    ]),
    text('site.job.guide.feet-inches.tip3'),
    text('site.job.guide.feet-inches.tip4'),
  ];
};

type FiguredKind = 'roof-pitch' | 'roofing' | 'paint' | 'drywall' | 'concrete-footing';

/** The kinds whose tips carry the figures of their page (content audit 2026-11-10). */
const FIGURED: Record<FiguredKind, (id: JobId, text: SiteText) => JobGuide['tips'] | undefined> = {
  'roof-pitch': pitchTips,
  roofing: roofTips,
  paint: roomTips,
  drywall: roomTips,
  'concrete-footing': footingTips,
};

/** The four tips of job `id`: a pitch, a room or a footing works its figures into them. */
const tipsOf = (kind: JobGuideKind, id: JobId, text: SiteText): JobGuide['tips'] => {
  switch (kind) {
    case 'roof-pitch':
    case 'roofing':
    case 'paint':
    case 'drywall':
    case 'concrete-footing': {
      const tips = FIGURED[kind](id, text);
      if (tips === undefined) throw new Error(`no figured tips for ${id}`);
      return tips;
    }
    case 'feet-inches':
      return divisionTips(id, text);
    default:
      return [
        text(`site.job.guide.${kind}.tip1`),
        text(`site.job.guide.${kind}.tip2`),
        text(`site.job.guide.${kind}.tip3`),
        text(`site.job.guide.${kind}.tip4`),
      ];
  }
};

/* The IRC check of every covering at the pitch of a roof pitch job. */

const roofPitchCatalogs = { en: createTranslator(enRoofPitch), es: createTranslator(esRoofPitch) };

type SelectInput = Extract<(typeof roofPitch.inputs)[number], { readonly kind: 'select' }>;
type Covering = Extract<SelectInput, { readonly key: 'covering' }>['options'][number];

const COVERINGS: readonly Covering[] = (() => {
  const input = roofPitch.inputs.find(
    (each): each is Extract<SelectInput, { readonly key: 'covering' }> => each.key === 'covering',
  );
  if (input === undefined) throw new Error('the roof pitch engine has no covering select');
  return input.options;
})();

type CoveringStatus = 'meets' | 'double' | 'below';

const checkOf = (raw: JobCase, covering: Covering) => {
  const result = roofPitch.validate({ ...raw, covering });
  if (!result.ok) throw new Error(`invalid roof pitch case: ${JSON.stringify(raw)}`);
  return roofPitch.compute(result.value).warnings;
};

/** The IRC minimum of `covering`, as the engine states it for a flat roof, which is below all. */
const minimumOf = (raw: JobCase, covering: Covering): number => {
  const [below] = checkOf({ ...raw, rise: '0in' }, covering);
  const minimum = below?.code === 'belowMinimum' ? below.params['minimum'] : undefined;
  if (typeof minimum !== 'number') throw new Error(`no IRC minimum for ${covering}`);
  return minimum;
};

const statusOf = (raw: JobCase, covering: Covering): CoveringStatus => {
  const codes = checkOf(raw, covering).map(({ code }) => code);
  if (codes.includes('belowMinimum')) return 'below';
  return codes.includes('doubleUnderlayment') ? 'double' : 'meets';
};

export interface JobCoverings {
  readonly heading: string;
  readonly lead: string;
  readonly columns: readonly [string, string, string];
  readonly rows: readonly {
    readonly label: string;
    readonly minimum: string;
    readonly status: string;
  }[];
}

/** The IRC check of every covering at the pitch of job `id`; `undefined` for any other job. */
export const jobCoverings = (id: JobId, locale: Locale): JobCoverings | undefined => {
  const { calculator, cases } = JOBS[id];
  if (calculator !== 'roof-pitch' || isChartJob(id)) return undefined;
  const text = siteText(locale);
  const calc = roofPitchCatalogs[locale];
  const [raw] = cases;
  return {
    heading: text('site.job.coverings.heading'),
    lead: text('site.job.coverings.lead'),
    columns: [
      calc('calc.roof-pitch.inputs.covering'),
      text('site.job.coverings.minimum'),
      text('site.job.coverings.status'),
    ],
    rows: COVERINGS.map((covering) => ({
      label: calc(`calc.roof-pitch.options.covering.${covering}`),
      minimum: calc('calc.roof-pitch.page.pitch', { value: String(minimumOf(raw, covering)) }),
      status: text(`site.job.coverings.${statusOf(raw, covering)}`),
    })),
  };
};
