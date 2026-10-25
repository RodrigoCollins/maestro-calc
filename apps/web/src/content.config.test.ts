import { describe, expect, it } from 'vitest';
import { collections } from './content.config.ts';

describe('content collections (calculator-page › Page anatomy and content collection)', () => {
  it('has the trust pages and the calculators', () => {
    expect(Object.keys(collections)).toEqual(['pages', 'calculators']);
  });

  // spec: calculator-page › [CP6] the collection validates its frontmatter with the strict schema
  it('validates calculator entries against the registry ids', () => {
    const schema: unknown = Reflect.get(collections.calculators, 'schema');
    const entry = {
      id: 'concrete',
      locale: 'en',
      updated: '2026-10-25',
      ownerReview: 'pending',
      sources: [{ name: 'S', url: 'https://example.com/s', retrieved: '2026-10-25' }],
      workedExample: { netFt3: '40.00', totalFt3: '44.00', yd3: '1.63', bags: 74, bagLb: 80 },
    };
    const safeParse = (value: unknown): { success: boolean } => {
      const parse: unknown = Reflect.get(schema as object, 'safeParse');
      if (typeof parse !== 'function') throw new Error('the schema has no safeParse');
      return parse.call(schema, value) as { success: boolean };
    };
    expect(safeParse(entry).success).toBe(true);
    expect(safeParse({ ...entry, id: 'asphalt' }).success).toBe(false);
    expect(safeParse({ ...entry, sources: [] }).success).toBe(false);
  });
});
