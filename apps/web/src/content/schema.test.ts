import { describe, expect, it } from 'vitest';
import { calculatorSchema, pageSchema, registryIds, TRUST_IDS } from './schema.ts';

const valid = {
  id: 'about',
  locale: 'en',
  updated: '2026-10-23',
  ownerReview: 'pending',
} as const;

// spec: trust-pages › [TP2] (schema side)
describe('pageSchema', () => {
  it('lists the five trust ids', () => {
    expect(TRUST_IDS).toEqual(['methodology', 'about', 'privacy', 'terms', 'contact']);
  });

  it('parses valid frontmatter', () => {
    expect(pageSchema.parse(valid)).toEqual(valid);
    expect(pageSchema.parse({ ...valid, ownerReview: 'approved', locale: 'es' })).toEqual({
      ...valid,
      ownerReview: 'approved',
      locale: 'es',
    });
  });

  it('keeps the date as the ISO text when YAML hands it over as a Date', () => {
    expect(pageSchema.parse({ ...valid, updated: new Date('2026-10-23T00:00:00Z') }).updated).toBe(
      '2026-10-23',
    );
  });

  it.each([
    ['an unknown review state', { ownerReview: 'maybe' }],
    ['a day-first date', { updated: '23/10/2026' }],
    ['an impossible date', { updated: '2026-02-30' }],
    ['a date with a time', { updated: '2026-10-23T10:00:00Z' }],
    ['an invalid Date', { updated: new Date('nope') }],
    ['an unknown id', { id: 'pricing' }],
    ['an unknown locale', { locale: 'fr' }],
    ['an extra field', { title: 'About' }],
  ])('rejects %s', (_name, change) => {
    expect(pageSchema.safeParse({ ...valid, ...change }).success).toBe(false);
  });

  it.each(['id', 'locale', 'updated', 'ownerReview'] as const)('rejects a missing %s', (field) => {
    const rest = Object.fromEntries(Object.entries(valid).filter(([key]) => key !== field));
    expect(pageSchema.safeParse(rest).success).toBe(false);
  });

  it('accepts a leap day and rejects the day after the end of a month', () => {
    expect(pageSchema.safeParse({ ...valid, updated: '2028-02-29' }).success).toBe(true);
    expect(pageSchema.safeParse({ ...valid, updated: '2026-04-31' }).success).toBe(false);
  });
});

// ---- the calculators collection (calculator-page › Page anatomy and content collection, [CP6]) ----

const calculator = {
  id: 'concrete',
  locale: 'en',
  updated: '2026-10-25',
  ownerReview: 'pending',
  sources: [
    {
      name: 'QUIKRETE Concrete Mix No. 1101 data sheet',
      url: 'https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf',
      retrieved: '2026-10-25',
    },
  ],
  workedExample: { netFt3: '40.00', totalFt3: '44.00', yd3: '1.63', bags: 74, bagLb: 80 },
} as const;

describe('calculatorSchema', () => {
  const schema = calculatorSchema(['rectangle-area', 'concrete']);

  it('parses a valid entry and keeps every field', () => {
    expect(schema.parse(calculator)).toEqual(calculator);
    expect(schema.parse({ ...calculator, locale: 'es', ownerReview: 'approved' }).locale).toBe(
      'es',
    );
  });

  it('keeps the dates as ISO text when YAML hands them over as Dates', () => {
    const parsed = schema.parse({
      ...calculator,
      updated: new Date('2026-10-25T00:00:00Z'),
      sources: [{ ...calculator.sources[0], retrieved: new Date('2026-10-24T00:00:00Z') }],
    });
    expect(parsed.updated).toBe('2026-10-25');
    expect(parsed.sources[0]?.retrieved).toBe('2026-10-24');
  });

  // spec: calculator-page › [CP6] each invalid field is rejected and named
  it.each([
    ['sources: []', { sources: [] }, 'sources'],
    ['an unknown review state', { ownerReview: 'maybe' }, 'ownerReview'],
    ['a day-first date', { updated: '25/10/2026' }, 'updated'],
    ['an impossible date', { updated: '2026-02-30' }, 'updated'],
    [
      'an http source url',
      { sources: [{ ...calculator.sources[0], url: 'http://www.quikrete.com/x.pdf' }] },
      'sources.0.url',
    ],
    [
      'a source without a name',
      { sources: [{ ...calculator.sources[0], name: '' }] },
      'sources.0.name',
    ],
    [
      'a source with a bad date',
      { sources: [{ ...calculator.sources[0], retrieved: 'yesterday' }] },
      'sources.0.retrieved',
    ],
    [
      'a worked example without bags',
      { workedExample: { netFt3: '40.00', totalFt3: '44.00', yd3: '1.63', bagLb: 80 } },
      'workedExample.bags',
    ],
    [
      'a worked example with a non-integer bag count',
      { workedExample: { ...calculator.workedExample, bags: 74.5 } },
      'workedExample.bags',
    ],
    [
      'a figure that is not a decimal text',
      { workedExample: { ...calculator.workedExample, netFt3: 'forty' } },
      'workedExample.netFt3',
    ],
    ['an unknown locale', { locale: 'fr' }, 'locale'],
    ['an unknown calculator id', { id: 'asphalt' }, 'id'],
    ['an extra field', { title: 'Concrete' }, ''],
  ])('rejects %s, naming the field', (_name, change, field) => {
    const result = schema.safeParse({ ...calculator, ...change });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths.some((path) => path === field || (field === '' && path === ''))).toBe(true);
    }
  });

  it.each(['id', 'locale', 'updated', 'ownerReview', 'sources', 'workedExample'] as const)(
    'rejects a missing %s',
    (field) => {
      const rest = Object.fromEntries(Object.entries(calculator).filter(([key]) => key !== field));
      expect(schema.safeParse(rest).success).toBe(false);
    },
  );

  it('accepts only the ids of the registry it is built from', () => {
    expect(calculatorSchema(['rectangle-area']).safeParse(calculator).success).toBe(false);
    expect(calculatorSchema(['concrete']).safeParse(calculator).success).toBe(true);
  });
});

describe('registryIds', () => {
  it('returns the ids as a non-empty tuple', () => {
    expect(registryIds(['concrete'])).toEqual(['concrete']);
    expect(registryIds(['rectangle-area', 'concrete'])).toEqual(['rectangle-area', 'concrete']);
  });

  it('throws on an empty registry instead of building an enum that accepts nothing', () => {
    expect(() => registryIds([])).toThrow('registry is empty');
  });
});
