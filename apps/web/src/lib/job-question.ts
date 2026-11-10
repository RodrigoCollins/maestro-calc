import {
  encode,
  ft3,
  gal,
  lb,
  lbYd3,
  liter,
  m3,
  quantity,
  Rational,
  tonne,
  tonYd3,
  valueIn,
  yd3,
  type Quantity,
} from '@maestro-calc/core';
import { topsoil } from '@maestro-calc/core/calculators/topsoil';
import {
  BULK_WEIGHTS,
  concreteMix,
  type BulkWeight,
  type BulkWeightId,
  type MaterialSource,
} from '@maestro-calc/data';
import type { Locale } from '@maestro-calc/i18n';
import { decimalText, groupedInteger } from '../calculator/present.ts';
import { isQuestionJob, JOBS, type JobCase, type JobId, type QuestionId } from '../routing/jobs.ts';
import { pathOf, type PageId } from '../routing/routes.ts';
import { concrete } from './concrete.ts';
import { NIST_HB44_C } from './job-land.ts';
import {
  concreteCostPerSquareFoot,
  INSTALLED_PRICES,
  READY_MIX_PRICES,
  slabCostOf,
} from './slab-cost.ts';
import {
  FENCE_MATERIALS,
  FENCE_PRICES,
  fenceHref,
  fenceMaterialsOf,
  guideRangeOf,
} from './fence-cost.ts';
import { siteText } from './site-text.ts';

/*
 * The question pages (Ahrefs US, 2026-11-08: "how many cubic feet in a cubic yard", "cubic yards to
 * tons", "how many cubic yards in a ton of gravel", "how much does a cubic yard of concrete weigh",
 * "cubic feet to gallons", "how many square feet is a 2 car garage"): a question page is a job page
 * whose h1 answers the question, and which adds an about section written for that question and
 * tables of its own. Every volume is converted with the exact units of the core package (NIST
 * Handbook 44, Appendix C: 1 yd³ = 27 ft³, 1 gal = 231 in³), every weight with the published
 * densities of `BULK_WEIGHTS`, and every job figure by the engine of the page's calculator.
 */

export interface QuestionRow {
  /** Language-free: a number of the first column, a material name or the sizes of a case. */
  readonly label: string;
  /** The calculator with the case filled in, for a row that is a case of the page. */
  readonly href?: string | undefined;
  readonly cells: readonly string[];
}

export interface QuestionTable {
  readonly heading: string;
  readonly lead: string;
  readonly columns: readonly [string, ...string[]];
  readonly rows: readonly [QuestionRow, ...QuestionRow[]];
}

/** A published source and what the page takes from it. */
export interface QuestionSource {
  readonly label: string;
  readonly source: Required<MaterialSource>;
}

export interface JobQuestion {
  readonly heading: string;
  readonly paragraphs: readonly [string, string];
  readonly sourceLabel: string;
  readonly sources: readonly [QuestionSource, ...QuestionSource[]];
  readonly tables: readonly [QuestionTable, ...QuestionTable[]];
  /** The page the question leads to next: its lead, its address and its name. */
  readonly more: { readonly lead: string; readonly href: string; readonly name: string };
}

type Text = ReturnType<typeof siteText>;

const TON_LB = Rational.of(2000);
const CUBIC_FEET_PER_YARD = Rational.of(27);

/** A table number of up to two decimals, exact: `0.25` is 25/100. */
const exact = (value: number): Rational => Rational.of(Math.round(value * 100), 100);

/** A number as a visitor reads it: `0.5`, `27`, `1,000`. */
const plain = (value: number): string =>
  decimalText(exact(value), String(value).split('.')[1]?.length ?? 0, true);

const fixed = (value: Rational, places: number): string => decimalText(value, places, true);

/** Two figures as one when they read the same, else `low–high`, smallest first. */
const range = (a: string, b: string): string => (a === b ? a : `${a}–${b}`);

const sortedRange = (a: Rational, b: Rational, places: number): string => {
  const [low, high] = a.compare(b) <= 0 ? [a, b] : [b, a];
  return range(fixed(low, places), fixed(high, places));
};

const weightOf = (id: BulkWeightId): BulkWeight => {
  const weight = BULK_WEIGHTS.find((each) => each.id === id);
  if (weight === undefined) throw new Error(`no bulk weight ${id}`);
  return weight;
};

/** The tons a cubic yard of the material weighs, low then high. */
const tonsPerYard = (id: BulkWeightId): readonly [Rational, Rational] => {
  const { low, high } = weightOf(id);
  return [valueIn(low, tonYd3), valueIn(high, tonYd3)];
};

const nameOf = (id: BulkWeightId, text: Text): string =>
  text(`page.cubic-yard-weight-chart.materials.${id}`);

/** The sources of `ids`, once each in the order given, labelled by the materials they give. */
const sourcesOf = (
  ids: readonly BulkWeightId[],
  text: Text,
): [QuestionSource, ...QuestionSource[]] => {
  const byUrl = new Map<string, { source: Required<MaterialSource>; names: string[] }>();
  for (const id of ids) {
    for (const source of weightOf(id).sources) {
      const entry = byUrl.get(source.url) ?? { source, names: [] };
      entry.names.push(nameOf(id, text));
      byUrl.set(source.url, entry);
    }
  }
  const [first, ...rest] = [...byUrl.values()].map(({ source, names }) => ({
    label: names.join('; '),
    source,
  }));
  if (first === undefined) throw new Error('a question page has no source');
  return [first, ...rest];
};

const units = (text: Text): QuestionSource => ({
  label: text('site.job.question.unitSource'),
  source: NIST_HB44_C,
});

const bagSource = (text: Text): QuestionSource => {
  const { name, url, retrieved } = concreteMix.source;
  if (url === undefined) throw new Error('the concrete mix source has no address');
  return { label: text('site.job.question.bagSource'), source: { name, url, retrieved } };
};

/** The first row and the rest mapped, keeping the list non-empty for the type. */
const mapRows = <T>(
  [first, ...rest]: readonly [T, ...T[]],
  each: (item: T) => QuestionRow,
): readonly [QuestionRow, ...QuestionRow[]] => [each(first), ...rest.map(each)];

/** The tables a question page can add, each with a heading and a lead of the site catalog. */
type TableKind =
  | 'feetToYards'
  | 'yardsToFeet'
  | 'boxGallons'
  | 'feetToGallons'
  | 'gallonsToFeet'
  | 'materialTons'
  | 'yardsPerTon'
  | 'tonsToYards'
  | 'soilTons'
  | 'slabWeight'
  | 'loadWeight'
  | 'garageSlab'
  | 'slabCost'
  | 'thicknessCost'
  | 'fencePrices'
  | 'fenceMaterials';

/** The column headings of those tables. */
type Column =
  | 'cubicFeet'
  | 'cubicYards'
  | 'cubicMeters'
  | 'gallons'
  | 'liters'
  | 'size'
  | 'material'
  | 'tons'
  | 'tonnes'
  | 'pounds'
  | 'tonsPerYard'
  | 'yardsPerTon'
  | 'feetPerTon'
  | 'netYards'
  | 'slab4'
  | 'bags4'
  | 'slab6'
  | 'thickness'
  | 'yardsWithExtra'
  | 'yardsPer100'
  | 'readyMix'
  | 'readyMixPerFoot'
  | 'thisOldHouse'
  | 'bobVila'
  | 'length'
  | 'posts'
  | 'rails'
  | 'boards'
  | 'bags80';

const table = (
  text: Text,
  kind: TableKind,
  columns: readonly [string, ...string[]],
  rows: readonly [QuestionRow, ...QuestionRow[]],
): QuestionTable => ({
  heading: text(`site.job.question.${kind}.heading`),
  lead: text(`site.job.question.${kind}.lead`),
  columns,
  rows,
});

const col = (text: Text, key: Column): string => text(`site.job.question.col.${key}`);

/** `10ft` as `10 ft`: the sizes of a case read the same in both languages. */
const sizeText = (value: string | undefined): string =>
  (value ?? '').replace(/^(\d+(?:\.\d+)?)(ft|in)$/, '$1 $2');

const sizesOf = (raw: JobCase, keys: readonly string[]): string =>
  keys.map((key) => sizeText(raw[key])).join(' × ');

const valid = <T>(result: { ok: true; value: T } | { ok: false }, raw: JobCase): T => {
  if (!result.ok) throw new Error(`invalid question case: ${JSON.stringify(raw)}`);
  return result.value;
};

const BOX = ['length', 'width', 'depth'] as const;

/** A case of the topsoil calculator: its state, its volume as the engine gives it, its link. */
const soilCase = (raw: JobCase, locale: Locale) => {
  const state = valid(topsoil.validate(raw), raw);
  const { outputs } = topsoil.compute(state);
  return {
    label: sizesOf(raw, BOX),
    href: `${pathOf('topsoil', locale)}?${encode(topsoil, state, { unitSystem: 'imperial' })}`,
    volume: outputs.volumeYd3,
  };
};

const volume = (value: number, unit: typeof ft3): Quantity<'volume'> =>
  quantity(exact(value), unit);

/* Cubic feet and cubic yards. */

const FEET = [10, 20, 27, 32, 50, 54, 64, 81, 100, 135, 150, 200, 270, 500] as const;
const YARDS = [0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 10] as const;

const cubicFeetInAYard = (text: Text): QuestionTable[] => [
  table(
    text,
    'feetToYards',
    [col(text, 'cubicFeet'), col(text, 'cubicYards'), col(text, 'cubicMeters')],
    mapRows(FEET, (feet) => {
      const each = volume(feet, ft3);
      return {
        label: plain(feet),
        cells: [fixed(valueIn(each, yd3), 2), fixed(valueIn(each, m3), 2)],
      };
    }),
  ),
  table(
    text,
    'yardsToFeet',
    [col(text, 'cubicYards'), col(text, 'cubicFeet'), col(text, 'cubicMeters')],
    mapRows(YARDS, (yards) => {
      const each = volume(yards, yd3);
      return {
        label: plain(yards),
        cells: [fixed(valueIn(each, ft3), 2), fixed(valueIn(each, m3), 2)],
      };
    }),
  ),
];

/* Cubic feet and gallons. */

const GALLON_FEET = [0.5, 0.75, 1, 1.5, 2, 2.5, 3, 5, 10, 27, 100] as const;
const GALLONS = [1, 2, 3, 5, 7, 10, 15, 20, 25, 50, 100, 1000] as const;

const cubicFeetToGallons = (id: QuestionId, text: Text, locale: Locale): QuestionTable[] => [
  table(
    text,
    'boxGallons',
    [col(text, 'size'), col(text, 'cubicFeet'), col(text, 'gallons'), col(text, 'liters')],
    mapRows(JOBS[id].cases, (raw) => {
      const { label, href, volume: each } = soilCase(raw, locale);
      return {
        label,
        href,
        cells: [
          fixed(valueIn(each, ft3), 2),
          fixed(valueIn(each, gal), 2),
          fixed(valueIn(each, liter), 2),
        ],
      };
    }),
  ),
  table(
    text,
    'feetToGallons',
    [col(text, 'cubicFeet'), col(text, 'gallons'), col(text, 'liters')],
    mapRows(GALLON_FEET, (feet) => {
      const each = volume(feet, ft3);
      return {
        label: plain(feet),
        cells: [fixed(valueIn(each, gal), 2), fixed(valueIn(each, liter), 2)],
      };
    }),
  ),
  table(
    text,
    'gallonsToFeet',
    [col(text, 'gallons'), col(text, 'cubicFeet'), col(text, 'liters')],
    mapRows(GALLONS, (gallons) => {
      const each = volume(gallons, gal);
      return {
        label: plain(gallons),
        cells: [fixed(valueIn(each, ft3), 3), fixed(valueIn(each, liter), 2)],
      };
    }),
  ),
];

/* Cubic yards and tons. */

const MATERIAL_YARDS = [1, 3, 5, 10] as const;

const yardsToTons = (text: Text): QuestionTable[] => [
  table(
    text,
    'materialTons',
    [col(text, 'material'), ...MATERIAL_YARDS.map((yards) => `${plain(yards)} yd³`)],
    mapRows(BULK_WEIGHTS, ({ id }) => {
      const [low, high] = tonsPerYard(id);
      return {
        label: nameOf(id, text),
        cells: MATERIAL_YARDS.map((yards) =>
          sortedRange(low.mul(Rational.of(yards)), high.mul(Rational.of(yards)), 2),
        ),
      };
    }),
  ),
];

/** Tons a yard, yards a ton and cubic feet a ton of each material. */
const yardsPerTon = (ids: readonly [BulkWeightId, ...BulkWeightId[]], text: Text): QuestionTable =>
  table(
    text,
    'yardsPerTon',
    [
      col(text, 'material'),
      col(text, 'tonsPerYard'),
      col(text, 'yardsPerTon'),
      col(text, 'feetPerTon'),
    ],
    mapRows(ids, (id) => {
      const [low, high] = tonsPerYard(id);
      const yards = [Rational.ONE.div(low), Rational.ONE.div(high)] as const;
      return {
        label: nameOf(id, text),
        cells: [
          sortedRange(low, high, 2),
          sortedRange(yards[0], yards[1], 2),
          sortedRange(yards[0].mul(CUBIC_FEET_PER_YARD), yards[1].mul(CUBIC_FEET_PER_YARD), 1),
        ],
      };
    }),
  );

const TONS = [1, 2, 3, 5, 10, 15, 20] as const;

/** The cubic yards of 1 to 20 tons of each material. */
const tonsToYards = (ids: readonly [BulkWeightId, ...BulkWeightId[]], text: Text): QuestionTable =>
  table(
    text,
    'tonsToYards',
    [col(text, 'tons'), ...ids.map((id) => nameOf(id, text))],
    mapRows(TONS, (tons) => ({
      label: plain(tons),
      cells: ids.map((id) => {
        const [low, high] = tonsPerYard(id);
        const each = Rational.of(tons);
        return sortedRange(each.div(low), each.div(high), 2);
      }),
    })),
  );

const GRAVELS = ['gravel-loose', 'gravel', 'gravel-compacted'] as const;

const yardsInATonOfGravel = (text: Text): QuestionTable[] => [
  yardsPerTon(['gravel-loose', 'gravel', 'pit-run-gravel', 'gravel-compacted', 'sand'], text),
  tonsToYards(GRAVELS, text),
];

const DIRTS = ['topsoil', 'soil-in-place'] as const;

const yardsInATonOfDirt = (id: QuestionId, text: Text, locale: Locale): QuestionTable[] => {
  const [low] = tonsPerYard('topsoil');
  return [
    yardsPerTon(['topsoil', 'fill-dirt', 'soil-in-place'], text),
    table(
      text,
      'soilTons',
      [col(text, 'size'), col(text, 'cubicYards'), col(text, 'tons'), col(text, 'tonnes')],
      mapRows(JOBS[id].cases, (raw) => {
        const { label, href, volume: each } = soilCase(raw, locale);
        const tons = valueIn(each, yd3).mul(low);
        return {
          label,
          href,
          cells: [
            fixed(valueIn(each, yd3), 2),
            fixed(tons, 2),
            fixed(valueIn(quantity(tons.mul(TON_LB), lb), tonne), 2),
          ],
        };
      }),
    ),
    tonsToYards(DIRTS, text),
  ];
};

/* Concrete: the weight of each slab and of a load. */

const SLAB = ['length', 'width', 'thickness'] as const;
const LOADS = [0.5, 1, 2, 3, 4, 5, 8, 10] as const;

/** Pounds, tons and tonnes of `yards` cubic yards of concrete, each low–high. */
const concreteWeight = (yards: Rational): readonly [string, string, string] => {
  const { low, high } = weightOf('concrete');
  const pounds = [valueIn(low, lbYd3).mul(yards), valueIn(high, lbYd3).mul(yards)] as const;
  const tonnes = pounds.map((each) => valueIn(quantity(each, lb), tonne));
  return [
    sortedRange(pounds[0], pounds[1], 0),
    sortedRange(pounds[0].div(TON_LB), pounds[1].div(TON_LB), 2),
    sortedRange(tonnes[0] ?? Rational.ZERO, tonnes[1] ?? Rational.ZERO, 2),
  ];
};

const concreteState = (raw: JobCase) => valid(concrete.validate(raw), raw);

const concreteHref = (raw: JobCase, locale: Locale): string =>
  `${pathOf('concrete', locale)}?${encode(concrete, concreteState(raw), { unitSystem: 'imperial' })}`;

const concreteYardWeight = (id: QuestionId, text: Text, locale: Locale): QuestionTable[] => [
  table(
    text,
    'slabWeight',
    [col(text, 'size'), col(text, 'netYards'), col(text, 'pounds'), col(text, 'tons')],
    mapRows(JOBS[id].cases, (raw) => {
      const net = valueIn(concrete.compute(concreteState(raw)).outputs.netVolume, yd3);
      const [pounds, tons] = concreteWeight(net);
      return {
        label: sizesOf(raw, SLAB),
        href: concreteHref(raw, locale),
        cells: [fixed(net, 2), pounds, tons],
      };
    }),
  ),
  table(
    text,
    'loadWeight',
    [col(text, 'cubicYards'), col(text, 'pounds'), col(text, 'tons'), col(text, 'tonnes')],
    mapRows(LOADS, (yards) => ({
      label: plain(yards),
      cells: [...concreteWeight(exact(yards))],
    })),
  ),
];

/* Garages: the concrete floor of each size. */

const garageFloor = (id: QuestionId, text: Text, locale: Locale): QuestionTable[] => [
  table(
    text,
    'garageSlab',
    [col(text, 'size'), col(text, 'slab4'), col(text, 'bags4'), col(text, 'slab6')],
    mapRows(JOBS[id].cases, (raw) => {
      const at = (thickness: string): JobCase => ({ ...raw, thickness, bag: '80' });
      const four = concrete.compute(concreteState(at('4in')));
      const six = concrete.compute(concreteState(at('6in')));
      const [bags] = four.shopping;
      if (bags === undefined) throw new Error('the concrete engine returned no bag line');
      return {
        label: sizesOf(raw, ['length', 'width']),
        href: concreteHref(at('4in'), locale),
        cells: [
          fixed(valueIn(four.outputs.volumeYd3, yd3), 2),
          groupedInteger(bags.qty),
          fixed(valueIn(six.outputs.volumeYd3, yd3), 2),
        ],
      };
    }),
  ),
];

/* Slab cost: each common slab priced, and the concrete of each thickness per square foot. */

const THICKNESSES = [4, 5, 6, 8] as const;

/** The 30 × 30 ft slab (Ahrefs US, 2026-11-08: "30x30 slab cost 4 in", the largest size row). */
const THIRTY = [4, 5, 6] as const;

const slabCost = (_id: QuestionId, text: Text, locale: Locale): QuestionTable[] => [
  table(
    text,
    'thicknessCost',
    [col(text, 'thickness'), col(text, 'yardsPer100'), col(text, 'readyMixPerFoot')],
    mapRows(THICKNESSES, (inches) => ({
      label: `${String(inches)} in`,
      cells: [
        slabCostOf({ length: '10ft', width: '10ft', thickness: `${String(inches)}in` }).yards,
        concreteCostPerSquareFoot(inches),
      ],
    })),
  ),
  table(
    text,
    'slabCost',
    [col(text, 'size'), col(text, 'yardsWithExtra'), col(text, 'readyMix')],
    mapRows(THIRTY, (inches) => {
      const raw = { length: '30ft', width: '30ft', thickness: `${String(inches)}in` };
      const cost = slabCostOf(raw);
      return {
        label: cost.label,
        href: concreteHref(raw, locale),
        cells: [cost.yards, cost.readyMix],
      };
    }),
  ),
];

/** The four published prices of the slab cost page, each labelled by what it gives. */
const priceSources = (text: Text): [QuestionSource, ...QuestionSource[]] => {
  const readyMix = text('site.job.question.readyMixSource');
  const installed = text('site.job.question.installedSource');
  const [low, high] = READY_MIX_PRICES;
  return [
    { label: readyMix, source: low.source },
    { label: readyMix, source: high.source },
    ...INSTALLED_PRICES.map(({ source }) => ({ label: installed, source })),
  ];
};

/* Fence cost: each guide's price per material, and the materials of each length. */

const fenceCost = (_id: QuestionId, text: Text, locale: Locale): QuestionTable[] => [
  table(
    text,
    'fencePrices',
    [col(text, 'material'), col(text, 'thisOldHouse'), col(text, 'bobVila')],
    mapRows(FENCE_MATERIALS, (material) => ({
      label: text(`site.job.fenceCost.${material}`),
      cells: FENCE_PRICES.map((prices) => guideRangeOf(prices, material)),
    })),
  ),
  table(
    text,
    'fenceMaterials',
    [
      col(text, 'length'),
      col(text, 'posts'),
      col(text, 'rails'),
      col(text, 'boards'),
      col(text, 'bags80'),
    ],
    mapRows(JOBS['fence-cost'].cases, (raw) => {
      const { posts, rails, boards, bags } = fenceMaterialsOf(raw);
      return {
        label: sizeText(raw['length']),
        href: fenceHref(raw, locale),
        cells: [posts, rails, boards, bags],
      };
    }),
  ),
];

/** The Quikrete project sheet that sizes the holes of the materials table. */
const QUIKRETE_POSTS = {
  name: 'Quikrete, "Setting Posts" project sheet (hole 3 times the post width, 1/3 of the post in the ground plus 6 in of gravel)',
  url: 'https://www.quikrete.com/PDFs/Projects/SettingPosts.pdf',
  retrieved: '2026-11-10',
};

/** The Home Depot fencing guide that sets the rails of each section by the height. */
const HOME_DEPOT_FENCING = {
  name: 'The Home Depot, "Wood Fencing: Planning and Installing Your Fence" (three rails for fences 6 ft tall and higher, two for shorter ones)',
  url: 'https://images.homedepot-static.com/catalog/pdfImages/66/665f47cf-0ce3-4613-b7ca-88426b6f6e03.pdf',
  retrieved: '2026-11-10',
};

/** The two cost guides of the fence cost page and the hole rules, each labelled by what it gives. */
const fenceSources = (text: Text): [QuestionSource, ...QuestionSource[]] => {
  const price = text('site.job.question.fencePriceSource');
  const [thisOldHouse, bobVila] = FENCE_PRICES;
  return [
    { label: price, source: thisOldHouse.source },
    { label: price, source: bobVila.source },
    { label: text('site.job.question.postHoleSource'), source: QUIKRETE_POSTS },
    { ...bagSource(text), label: text('site.job.question.postConcreteSource') },
    { label: text('site.job.question.railSource'), source: HOME_DEPOT_FENCING },
  ];
};

/** What each question page builds: its tables, its sources and the page it leads to. */
const QUESTIONS = {
  'concrete-cubic-yard-weight': {
    tables: concreteYardWeight,
    sources: (text) => sourcesOf(['concrete'], text),
    more: 'concrete-slab-chart',
  },
  'concrete-slab-cost': {
    tables: slabCost,
    sources: priceSources,
    more: 'concrete-slab-chart',
  },
  'square-feet-1-car-garage': {
    tables: garageFloor,
    sources: (text) => [bagSource(text)],
    more: 'square-feet-2-car-garage',
  },
  'square-feet-2-car-garage': {
    tables: garageFloor,
    sources: (text) => [bagSource(text)],
    more: 'square-feet-1-car-garage',
  },
  'cubic-yards-to-tons': {
    tables: (_id, text) => yardsToTons(text),
    sources: (text) =>
      sourcesOf(
        BULK_WEIGHTS.map(({ id }) => id),
        text,
      ),
    more: 'cubic-yard-weight-chart',
  },
  'cubic-yards-in-a-ton-of-gravel': {
    tables: (_id, text) => yardsInATonOfGravel(text),
    sources: (text) => sourcesOf(['gravel-loose', 'gravel', 'pit-run-gravel', 'sand'], text),
    more: 'cubic-yards-to-tons',
  },
  'cubic-feet-in-a-cubic-yard': {
    tables: (_id, text) => cubicFeetInAYard(text),
    sources: (text) => [units(text)],
    more: 'mulch-bags-per-yard',
  },
  'cubic-feet-to-gallons': {
    tables: cubicFeetToGallons,
    sources: (text) => [units(text)],
    more: 'cubic-feet-in-a-cubic-yard',
  },
  'cubic-yards-in-a-ton-of-dirt': {
    tables: yardsInATonOfDirt,
    sources: (text) => sourcesOf(['topsoil', 'soil-in-place'], text),
    more: 'cubic-yard-weight-chart',
  },
  'fence-cost': {
    tables: fenceCost,
    sources: fenceSources,
    more: 'concrete-slab-cost',
  },
} as const satisfies Record<
  QuestionId,
  {
    readonly tables: (id: QuestionId, text: Text, locale: Locale) => QuestionTable[];
    readonly sources: (text: Text) => [QuestionSource, ...QuestionSource[]];
    readonly more: PageId;
  }
>;

/** What the question page of job `id` adds to its table, or `undefined` for any other job. */
export const jobQuestion = (id: JobId, locale: Locale): JobQuestion | undefined => {
  if (!isQuestionJob(id)) return undefined;
  const text = siteText(locale);
  const { tables: build, sources, more } = QUESTIONS[id];
  const [first, ...rest] = build(id, text, locale);
  if (first === undefined) throw new Error(`the question page ${id} has no table`);
  return {
    heading: text(`page.${id}.about`),
    paragraphs: [text(`page.${id}.p1`), text(`page.${id}.p2`)],
    sourceLabel: text('site.job.question.sources'),
    sources: sources(text),
    tables: [first, ...rest],
    more: {
      lead: text('site.job.question.more'),
      href: pathOf(more, locale),
      name: text(`page.${more}.label`),
    },
  };
};
