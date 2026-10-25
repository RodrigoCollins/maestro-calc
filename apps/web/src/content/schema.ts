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

/** The worked example of the Formulas section: display texts and whole numbers (a contract test runs it through the engine). */
const workedExample = z.strictObject({
  netFt3: decimalText,
  totalFt3: decimalText,
  yd3: decimalText,
  bags: z.number().int().nonnegative(),
  bagLb: z.number().int().positive(),
});

/** A source of the entry: a name, an `https` link and the day it was retrieved. */
const source = z.strictObject({
  name: z.string().min(1),
  url: z.url({ protocol: /^https$/, hostname: /^[^\s]+$/ }),
  retrieved: isoDate,
});

/**
 * Frontmatter of one calculator entry (calculator-page › Page anatomy and content collection):
 * strict, with the calculator id limited to the registry's (`ids`), at least one source and the
 * worked example the Formulas section shows.
 */
export const calculatorSchema = (ids: readonly [string, ...string[]]) =>
  z.strictObject({
    id: z.enum(ids),
    locale: z.enum(LOCALES),
    updated: isoDate,
    ownerReview: z.enum(['pending', 'approved']),
    sources: z.array(source).min(1),
    workedExample,
  });

export type CalculatorFrontmatter = z.infer<ReturnType<typeof calculatorSchema>>;
