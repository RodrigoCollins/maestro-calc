import { describe, expect, it } from 'vitest';
import { pageSchema, TRUST_IDS } from './schema.ts';

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
