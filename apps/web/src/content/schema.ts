import { z } from 'astro/zod';
import { LOCALES } from '../routing/routes.ts';

/** The pages whose long-form copy is Markdown; `home` is composed from the catalog instead. */
export const TRUST_IDS = ['methodology', 'about', 'privacy', 'terms', 'contact'] as const;

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

/** The registry ids as a non-empty tuple (`z.enum` needs one); an empty registry is a build error. */
export const registryIds = (ids: readonly string[]): [string, ...string[]] => {
  const [first, ...others] = ids;
  if (first === undefined) throw new Error('the calculator registry is empty');
  return [first, ...others];
};

/** The frontmatter of the entries of one calculator id. */
const entryOf = <const Id extends ExampleId>(id: Id) =>
  z.strictObject({
    id: z.literal(id),
    locale: z.enum(LOCALES),
    updated: isoDate,
    ownerReview: z.enum(['pending', 'approved']),
    sources: z.array(source).min(1),
    workedExample: WORKED_EXAMPLES[id],
  });

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
  return z.discriminatedUnion('id', [entryOf('concrete'), entryOf('rectangle-area')]);
};

export type CalculatorFrontmatter = z.infer<ReturnType<typeof calculatorSchema>>;
