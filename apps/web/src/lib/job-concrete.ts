import { ft3, lbFt3, quantity, Rational, tonYd3, valueIn, yd3 } from '@maestro-calc/core';
import { BULK_WEIGHTS, concreteMix, type BulkWeightId } from '@maestro-calc/data';
import type { MaterialSource } from '@maestro-calc/data';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText } from '../calculator/present.ts';
import { isChartJob, isQuestionJob, JOBS, type JobCase, type JobId } from '../routing/jobs.ts';
import { concrete } from './concrete.ts';
import { sentence, type ExtraSection, type ExtraTable } from './job-extra.ts';
import { siteText } from './site-text.ts';

/*
 * The concrete job pages (AdSense audit 2026-11-08): a slab, a pad, a Sonotube or a footing of one
 * size also says what only that size weighs, holds and takes, worked out by the concrete engine
 * and from the cited unit weights of concrete (FHWA, WSDOT) and compacted gravel (WisDOT): the
 * slab its edge, its gravel base and its weight at each thickness; a tube its section, the concrete
 * per foot and a row of tubes; a footing its section, the concrete per foot and the footing under
 * four common buildings.
 */

type Shape = 'slab' | 'column' | 'footing';

/** The shape of concrete job `id`: a slab (or pad) unless its cases name a column or a footing. */
const shapeOf = (id: JobId): Shape | undefined => {
  if (JOBS[id].calculator !== 'concrete' || isChartJob(id) || isQuestionJob(id)) return undefined;
  const [first] = JOBS[id].cases;
  const shape = first['shape'];
  return shape === 'column' || shape === 'footing' ? shape : 'slab';
};

/** Whether job `id` is a slab, a pad, a Sonotube or a footing page. */
export const isConcreteJob = (id: JobId): boolean => shapeOf(id) !== undefined;

/** NIST SP 811: 1 ft = 0.3048 m and 1 ft³ = 28.316846592 L, both exact. */
const METERS_PER_FOOT = Rational.of(3048, 10_000);
const LITERS_PER_FT3 = Rational.of(28_316_846_592n, 1_000_000_000n);
/** The 4 in gravel base the slab is worked out over, and the 10% extra of the engine's default. */
const BASE_INCHES = 4;
/** The row of tubes of a deck or a porch, each 48 in deep, the deepest case of the tube pages. */
const TUBE_COUNTS = [4, 6, 8, 10, 12] as const;
const TUBE_DEPTH = 48;
/** The depths of one tube the sizes table (24, 36 and 48 in) leaves out, in inches. */
const DEPTHS = [30, 42, 54, 60, 72] as const;
/** The rebar grid spacings, on center, in inches. */
const SPACINGS = [12, 16, 18, 24] as const;
/** Four common buildings, the footing measured along its centre line (2 × (length + width)). */
const BUILDINGS = [
  [12, 16],
  [20, 20],
  [24, 24],
  [24, 36],
] as const;

const two = (value: Rational): string => decimalText(value, 2, true);
const whole = (value: Rational): string => decimalText(value, 0, true);
const ft = (value: number): string => `${String(value)} ft`;

const inchesOf = (value: string | undefined, unit: 'ft' | 'in'): number => {
  const match = new RegExp(`^(\\d+)${unit}$`).exec(value ?? '');
  if (match?.[1] === undefined)
    throw new Error(`a concrete case gives whole ${unit}: ${String(value)}`);
  return Number(match[1]);
};

const weightOf = (id: BulkWeightId) => {
  const weight = BULK_WEIGHTS.find((each) => each.id === id);
  if (weight === undefined) throw new Error(`no bulk weight ${id}`);
  return weight;
};

/** The pounds `volume` of concrete weighs, low then high (145 to 150 lb/ft³). */
const concretePounds = (volume: Rational): readonly [Rational, Rational] => {
  const { low, high } = weightOf('concrete');
  return [volume.mul(valueIn(low, lbFt3)), volume.mul(valueIn(high, lbFt3))];
};

const range = (low: string, high: string): string => (low === high ? low : `${low}–${high}`);

/** The pounds `volume` of concrete weighs, as `low–high`. */
const poundsOf = (volume: Rational): string => {
  const [low, high] = concretePounds(volume);
  return range(whole(low), whole(high));
};

const pounds = (volume: Rational): string => `${poundsOf(volume)} lb`;

/** The concrete engine's result for one case, its yd³ and its bags of each size. */
const poured = (raw: Record<string, string>) => {
  const valid = concrete.validate(raw);
  if (!valid.ok) throw new Error(`invalid concrete case: ${JSON.stringify(raw)}`);
  const result = concrete.compute(valid.value);
  const [bags] = result.shopping;
  if (bags === undefined) throw new Error(`no bags for ${JSON.stringify(raw)}`);
  return {
    feet: valueIn(result.outputs.volumeFt3, ft3),
    yards: valueIn(result.outputs.volumeYd3, yd3),
    bags: bags.qty,
  };
};

const bagsOf = (raw: Record<string, string>, bag: '80' | '60'): string =>
  String(poured({ ...raw, bag }).bags);

/** The feet of a section of `area` ft² that one bag of each size fills. */
const fillsOf = (area: Rational): string =>
  (['bag-80', 'bag-60', 'bag-40'] as const)
    .map((bag) => `${two(valueIn(CONCRETE_MIX_YIELDS[bag], ft3).div(area))} ft`)
    .join(' / ');

const sourceOf = (source: MaterialSource): Required<MaterialSource> => {
  const { name, url, retrieved } = source;
  if (url === undefined) throw new Error(`the source ${name} has no address`);
  return { name, url, retrieved };
};

const CONCRETE_WEIGHT_SOURCES = weightOf('concrete').sources.map(sourceOf);
const GRAVEL_SOURCES = weightOf('gravel-compacted').sources.map(sourceOf);
const BAG_SOURCE = sourceOf(concreteMix.source);

type Text = ReturnType<typeof siteText>;

/**
 * A rebar grid over a `length` × `width` ft slab at each spacing: ⌊side ÷ spacing⌋ + 1 bars run
 * across each side, each bar the full other side, before laps and edge cover.
 */
const rebarOf = (length: number, width: number, text: Text): ExtraTable => ({
  columns: [
    text('site.job.concrete.slab.spacing'),
    text('site.job.concrete.slab.alongLength'),
    text('site.job.concrete.slab.alongWidth'),
    text('site.job.concrete.slab.total'),
  ],
  rows: SPACINGS.map((spacing) => {
    const alongLength = Math.floor((width * 12) / spacing) + 1;
    const alongWidth = Math.floor((length * 12) / spacing) + 1;
    return {
      label: `${String(spacing)} in`,
      cells: [
        `${String(alongLength)} × ${ft(length)}`,
        `${String(alongWidth)} × ${ft(width)}`,
        `${decimalText(Rational.of(alongLength * length + alongWidth * width), 0, true)} ft`,
      ],
    };
  }),
});

const slabOf = (raw: JobCase, text: Text): ExtraSection => {
  const length = inchesOf(raw['length'], 'ft');
  const width = inchesOf(raw['width'], 'ft');
  const area = Rational.of(length * width);
  const around = 2 * (length + width);
  const base = area.mul(Rational.of(BASE_INCHES, 12));
  const { low, high } = weightOf('gravel-compacted');
  const baseYards = valueIn(quantity(base, ft3), yd3);
  const tons = [baseYards.mul(valueIn(low, tonYd3)), baseYards.mul(valueIn(high, tonYd3))] as const;
  const metric = area.mul(METERS_PER_FOOT).mul(METERS_PER_FOOT);
  const perFootOf = (inches: number): readonly [string, string] => {
    const [low, high] = concretePounds(Rational.of(inches, 12));
    return [whole(low), whole(high)];
  };
  const table: ExtraTable = {
    columns: [
      text('site.job.concrete.slab.thickness'),
      text('site.job.concrete.slab.net'),
      text('site.job.concrete.slab.weight'),
      text('site.job.concrete.slab.perFoot'),
    ],
    rows: [4, 5, 6].map((inches) => {
      const volume = area.mul(Rational.of(inches, 12));
      const [perLow, perHigh] = concretePounds(Rational.of(inches, 12));
      return {
        label: `${String(inches)} in`,
        cells: [
          `${two(volume)} ft³ (${two(volume.mul(LITERS_PER_FT3).div(Rational.of(1000)))} m³)`,
          pounds(volume),
          `${range(whole(perLow), whole(perHigh))} lb`,
        ],
      };
    }),
  };
  return {
    heading: text('site.job.concrete.slab.heading'),
    paragraphs: [
      text('site.job.concrete.slab.lead'),
      sentence(text, 'site.job.concrete.slab.summary', [
        `${String(length)} × ${String(width)}`,
        two(area.div(Rational.of(3))),
        poundsOf(area.div(Rational.of(3))),
        range(...perFootOf(4)),
        two(area.div(Rational.of(2))),
        poundsOf(area.div(Rational.of(2))),
        two(baseYards),
        range(two(tons[0]), two(tons[1])),
      ]),
    ],
    facts: [
      {
        label: text('site.job.concrete.slab.area'),
        value: `${ft(length)} × ${ft(width)} = ${whole(area)} sq ft (${two(metric)} m²)`,
      },
      {
        label: text('site.job.concrete.slab.edge'),
        value: `2 × (${ft(length)} + ${ft(width)}) = ${String(around)} ft (${two(Rational.of(around).mul(METERS_PER_FOOT))} m)`,
      },
      {
        label: text('site.job.concrete.slab.base'),
        value: `${whole(area)} sq ft × ${String(BASE_INCHES)} in = ${two(base)} ft³ = ${two(baseYards)} yd³, ${range(two(tons[0]), two(tons[1]))} ${text('site.job.concrete.tons')}`,
      },
    ],
    table,
    more: {
      lead: text('site.job.concrete.slab.rebar'),
      label: text('site.job.concrete.slab.rebarLabel'),
      table: rebarOf(length, width, text),
    },
    sources: [...CONCRETE_WEIGHT_SOURCES, ...GRAVEL_SOURCES],
  };
};

const columnOf = (raw: JobCase, text: Text): ExtraSection => {
  const diameter = inchesOf(raw['diameter'], 'in');
  // the engine's volume of a 12 in length with no extra: the section, in ft², times 1 ft
  const perFoot = poured({
    shape: 'column',
    diameter: `${String(diameter)}in`,
    height: '12in',
    waste: '0',
  }).feet;
  const squareInches = perFoot.mul(Rational.of(144));
  const depth = `${String(TUBE_DEPTH)}in`;
  const twelve = poured({
    shape: 'column',
    diameter: `${String(diameter)}in`,
    height: depth,
    count: '12',
  });
  return {
    heading: text('site.job.concrete.column.heading'),
    paragraphs: [
      text('site.job.concrete.column.lead'),
      sentence(text, 'site.job.concrete.column.summary', [
        diameter,
        two(perFoot),
        two(perFoot.mul(LITERS_PER_FT3).div(METERS_PER_FOOT)),
        two(valueIn(CONCRETE_MIX_YIELDS['bag-80'], ft3).div(perFoot)),
        poundsOf(perFoot.mul(Rational.of(TUBE_DEPTH, 12))),
        twelve.bags,
        two(twelve.yards),
      ]),
      text('site.job.concrete.column.after'),
    ],
    facts: [
      {
        label: text('site.job.concrete.column.section'),
        value: `π × (${String(diameter)} in ÷ 2)² ≈ ${two(squareInches)} sq in (${two(perFoot)} sq ft)`,
      },
      {
        label: text('site.job.concrete.column.perFoot'),
        value: `${two(perFoot)} ft³ (${two(perFoot.mul(LITERS_PER_FT3))} L)`,
      },
      {
        label: text('site.job.concrete.column.fills'),
        value: fillsOf(perFoot),
      },
      {
        label: text('site.job.concrete.column.weight'),
        value: pounds(perFoot.mul(Rational.of(TUBE_DEPTH, 12))),
      },
    ],
    table: {
      columns: [
        text('site.job.concrete.column.tubes'),
        text('site.job.concrete.yards'),
        text('site.job.concrete.bags80'),
        text('site.job.concrete.bags60'),
      ],
      rows: TUBE_COUNTS.map((count) => {
        const raw = {
          shape: 'column',
          diameter: `${String(diameter)}in`,
          height: depth,
          count: String(count),
        };
        return {
          label: `${String(count)} × ${String(TUBE_DEPTH)} in`,
          cells: [two(poured(raw).yards), bagsOf(raw, '80'), bagsOf(raw, '60')],
        };
      }),
    },
    more: {
      lead: text('site.job.concrete.column.depthLead'),
      label: text('site.job.concrete.column.depthLabel'),
      table: {
        columns: [
          text('site.job.concrete.column.depth'),
          text('site.job.concrete.column.net'),
          text('site.job.concrete.column.bags'),
        ],
        rows: DEPTHS.map((inches) => {
          const volume = perFoot.mul(Rational.of(inches, 12));
          return {
            label: `${String(inches)} in`,
            cells: [
              `${two(volume)} ft³`,
              (['bag-80', 'bag-60', 'bag-40'] as const)
                .map((bag) => String(volume.div(valueIn(CONCRETE_MIX_YIELDS[bag], ft3)).ceil()))
                .join(' / '),
            ],
          };
        }),
      },
    },
    sources: [BAG_SOURCE, ...CONCRETE_WEIGHT_SOURCES],
  };
};

const footingOf = (raw: JobCase, text: Text): ExtraSection => {
  const width = inchesOf(raw['footingWidth'], 'in');
  const depth = inchesOf(raw['footingDepth'], 'in');
  const squareInches = Rational.of(width * depth);
  const perFoot = squareInches.div(Rational.of(144));
  const sizes = { footingWidth: `${String(width)}in`, footingDepth: `${String(depth)}in` };
  const [a, b] = BUILDINGS[3];
  const run = 2 * (a + b);
  const largest = {
    run,
    bags: poured({ shape: 'footing', length: `${String(run)}ft`, ...sizes }).bags,
  };
  return {
    heading: text('site.job.concrete.footing.heading'),
    paragraphs: [
      text('site.job.concrete.footing.lead'),
      sentence(text, 'site.job.concrete.footing.summary', [
        `${String(width)} × ${String(depth)}`,
        two(perFoot),
        two(perFoot.mul(LITERS_PER_FT3).div(METERS_PER_FOOT)),
        two(valueIn(CONCRETE_MIX_YIELDS['bag-80'], ft3).div(perFoot)),
        poundsOf(perFoot),
        largest.run,
        largest.bags,
      ]),
      text('site.job.concrete.footing.after'),
    ],
    facts: [
      {
        label: text('site.job.concrete.footing.section'),
        value: `${String(width)} in × ${String(depth)} in = ${whole(squareInches)} sq in (${two(perFoot)} sq ft)`,
      },
      {
        label: text('site.job.concrete.footing.perFoot'),
        value: `${two(perFoot)} ft³ (${two(perFoot.mul(LITERS_PER_FT3))} L)`,
      },
      {
        label: text('site.job.concrete.footing.fills'),
        value: fillsOf(perFoot),
      },
      {
        label: text('site.job.concrete.footing.weight'),
        value: pounds(perFoot),
      },
    ],
    table: {
      columns: [
        text('site.job.concrete.footing.building'),
        text('site.job.concrete.footing.run'),
        text('site.job.concrete.yards'),
        text('site.job.concrete.bags80'),
      ],
      rows: BUILDINGS.map(([a, b]) => {
        const run = 2 * (a + b);
        const raw = { shape: 'footing', length: `${String(run)}ft`, ...sizes };
        return {
          label: `${String(a)} × ${String(b)} ft`,
          cells: [ft(run), two(poured(raw).yards), bagsOf(raw, '80')],
        };
      }),
    },
    sources: [BAG_SOURCE, ...CONCRETE_WEIGHT_SOURCES],
  };
};

/** What the concrete job page `id` adds to its table, or `undefined` for any other job. */
export const jobConcrete = (id: JobId, locale: Locale): ExtraSection | undefined => {
  const shape = shapeOf(id);
  if (shape === undefined) return undefined;
  const text = siteText(locale);
  const [raw] = JOBS[id].cases;
  if (shape === 'column') return columnOf(raw, text);
  if (shape === 'footing') return footingOf(raw, text);
  return slabOf(raw, text);
};
