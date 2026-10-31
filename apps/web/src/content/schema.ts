import { z } from 'astro/zod';
import { LOCALES } from '../routing/routes.ts';

/** The pages whose long-form copy is Markdown; `home` is composed from the catalog instead. */
export const TRUST_IDS = [
  'methodology',
  'about',
  'privacy',
  'terms',
  'contact',
  'embed-calculators',
] as const;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Whether `text` is `YYYY-MM-DD` and names a real calendar day (`2026-02-30` is not). */
const isCalendarDay = (text: string): boolean => {
  const [, year = '', month = '', day = ''] = ISO_DATE.exec(text) ?? [];
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.toISOString().startsWith(text);
};

// YAML 1.1 loaders hand `updated: 2026-10-23` over as a Date; the page shows the ISO text.
const isoDate = z.preprocess(
  (value) =>
    value instanceof Date && !Number.isNaN(value.getTime())
      ? value.toISOString().slice(0, 10)
      : value,
  z.string().regex(ISO_DATE).refine(isCalendarDay, 'not a calendar day'),
);

/** Frontmatter of one trust page: strict, so a typo is a build error rather than a silent field. */
export const pageSchema = z.strictObject({
  id: z.enum(TRUST_IDS),
  locale: z.enum(LOCALES),
  updated: isoDate,
  ownerReview: z.enum(['pending', 'approved']),
});

export type PageFrontmatter = z.infer<typeof pageSchema>;

const decimalText = z.string().regex(/^\d+\.\d{2}$/, 'a decimal with two places');

/** A display figure of four digits or more, grouped by thousands as the page shows it: `1,341.64`. */
const groupedDecimalText = z
  .string()
  .regex(/^\d{1,3}(,\d{3})*\.\d{2}$/, 'a decimal with two places, grouped by thousands');

/**
 * The worked example of the Formulas section, strict per calculator id: display texts and numbers
 * the contract tests run through the page's own controller. A calculator id with an entry has one
 * row here, and the row's keys are its figures (a typo is a build error, not a silent field).
 */
export const WORKED_EXAMPLES = {
  concrete: z.strictObject({
    netFt3: decimalText,
    totalFt3: decimalText,
    yd3: decimalText,
    bags: z.number().int().nonnegative(),
    bagLb: z.number().int().positive(),
  }),
  'rectangle-area': z.strictObject({
    query: z.string().regex(/^v=1(&[a-z]+=[\w/.]+)*$/, 'a v=1 link query'),
    ft2: decimalText,
    yd2: decimalText,
    m2: decimalText,
  }),
  gravel: z.strictObject({
    query: z.string().regex(/^v=1(&[a-z]+=[\w/.]+)*$/, 'a v=1 link query'),
    tons: decimalText,
    tonnes: decimalText,
    orderYd3: decimalText,
    placedYd3: decimalText,
  }),
  mulch: z.strictObject({
    query: z.string().regex(/^v=1(&[a-z]+=[\w/.]+)*$/, 'a v=1 link query'),
    yd3: decimalText,
    ft3: decimalText,
    m3: decimalText,
    netFt3: decimalText,
    bags: z.number().int().nonnegative(),
  }),
  topsoil: z.strictObject({
    query: z.string().regex(/^v=1(&[a-z]+=[\w/.]+)*$/, 'a v=1 link query'),
    yd3: decimalText,
    ft3: decimalText,
    m3: decimalText,
    netFt3: decimalText,
    bags: z.number().int().nonnegative(),
  }),
  paint: z.strictObject({
    query: z.string().regex(/^v=1(&[a-z]+=[\w/.]+)*$/, 'a v=1 link query'),
    gallons: decimalText,
    liters: decimalText,
    paintFt2: decimalText,
    wallFt2: decimalText,
    cans: z.number().int().nonnegative(),
  }),
  drywall: z.strictObject({
    query: z.string().regex(/^v=1(&[a-z]+=[\w/.]+)*$/, 'a v=1 link query'),
    areaFt2: decimalText,
    areaM2: decimalText,
    compoundGal: decimalText,
    tapeFt: decimalText,
    sheets: z.number().int().nonnegative(),
  }),
  'roof-pitch': z.strictObject({
    query: z.string().regex(/^v=1(&[a-z]+=[\w/.]+)*$/, 'a v=1 link query'),
    pitch: decimalText,
    angle: decimalText,
    rafterFt: decimalText,
    rafterM: decimalText,
  }),
  roofing: z.strictObject({
    query: z.string().regex(/^v=1(&[a-z]+=[\w/.]+)*$/, 'a v=1 link query'),
    squares: decimalText,
    areaFt2: groupedDecimalText,
    areaM2: decimalText,
    bundles: z.number().int().nonnegative(),
    rolls: z.number().int().nonnegative(),
  }),
  'feet-inches': z.strictObject({
    query: z.string().regex(/^v=1(&[a-z]+=[\w/.]+)*$/, 'a v=1 link query'),
    result: z.string().regex(/^(\d+ ft)?( ?\d+( \d+\/\d+)? in)?$/, 'feet and inches'),
    resultIn: decimalText,
    resultM: z.string().regex(/^\d+\.\d{3}$/, 'a decimal with three places'),
  }),
};

/** The calculator ids that have a worked example row. */
export type ExampleId = keyof typeof WORKED_EXAMPLES;

/** The worked example of the calculator `Id`. */
export type WorkedExample<Id extends ExampleId> = z.infer<(typeof WORKED_EXAMPLES)[Id]>;

/** A source of the entry: a name, an `https` link and the day it was retrieved. */
const source = z.strictObject({
  name: z.string().min(1),
  url: z.url({ protocol: /^https$/, hostname: /^[^\s]+$/ }),
  retrieved: isoDate,
});

/** `items` as a non-empty tuple, or an error naming what is empty. */
const nonEmpty = <T>(items: readonly T[], what: string): [T, ...T[]] => {
  const [first, ...others] = items;
  if (first === undefined) throw new Error(`the ${what} is empty`);
  return [first, ...others];
};

/** The registry ids as a non-empty tuple (`z.enum` needs one); an empty registry is a build error. */
export const registryIds = (ids: readonly string[]): [string, ...string[]] =>
  nonEmpty(ids, 'calculator registry');

/** The fields every calculator entry shares, whatever its id. */
const ENTRY_FIELDS = {
  locale: z.enum(LOCALES),
  updated: isoDate,
  ownerReview: z.enum(['pending', 'approved']),
  sources: z.array(source).min(1),
};

/** The schema of the entries of the calculator `Id`: its own literal id and its own example. */
type EntrySchema<Id extends ExampleId> = z.ZodObject<
  typeof ENTRY_FIELDS & {
    id: z.ZodLiteral<Id>;
    workedExample: (typeof WORKED_EXAMPLES)[Id];
  },
  z.core.$strict
>;

/**
 * The entry schema of each id of `Ids`, by id. Indexed by `Ids` itself it is one schema for one
 * id, and the union of their own schemas for a union of ids, which is what keeps each id with its
 * own example in the union below.
 */
type EntrySchemas<Ids extends ExampleId> = { [Id in Ids]: EntrySchema<Id> };

/**
 * The frontmatter of the entries of one calculator id. Typed through `EntrySchemas` so that
 * mapping a list of ids gives the union of their own schemas (a correlated union, without a cast).
 */
const entryOf = <Id extends ExampleId>(id: Id): EntrySchemas<Id>[Id] =>
  z.strictObject({ ...ENTRY_FIELDS, id: z.literal(id), workedExample: WORKED_EXAMPLES[id] });

const isExampleId = (id: string): id is ExampleId => Object.hasOwn(WORKED_EXAMPLES, id);

/**
 * Frontmatter of one calculator entry (calculator-page › Page anatomy and content collection):
 * strict, selected by the calculator id, at least one source and the worked example of that id.
 * A row of `WORKED_EXAMPLES` for an id outside the registry (`ids`) throws; an entry whose id has
 * no row fails the parse on `id`.
 */
export const calculatorSchema = (ids: readonly [string, ...string[]]) => {
  const stray = Object.keys(WORKED_EXAMPLES).find((id) => !ids.includes(id));
  if (stray !== undefined) {
    throw new Error(`worked example for an id outside the registry: ${stray}`);
  }
  // one member per row of the table: calculator N+1 needs its row and nothing else here
  const rows = Object.keys(WORKED_EXAMPLES).filter(isExampleId);
  return z.discriminatedUnion('id', nonEmpty(rows.map(entryOf), 'worked-example table'));
};

export type CalculatorFrontmatter = z.infer<ReturnType<typeof calculatorSchema>>;
