import { describe, expect, it } from 'vitest';
import { ASPCA_RECORDS, aspcaOf, aspcaSourceOf, listingOf } from './aspca.ts';

describe('the ASPCA entries', () => {
  it('are each listed once, with the lines the ASPCA page gives', () => {
    expect(new Set(ASPCA_RECORDS.map(({ slug }) => slug)).size).toBe(ASPCA_RECORDS.length);
    for (const record of ASPCA_RECORDS) {
      expect(record.name, record.slug).not.toBe('');
      expect(record.scientific, record.slug).not.toBe('');
      expect(`${record.toxicity}${record.nonToxicity}`, record.slug).not.toBe('');
    }
  });

  it('read the species of the Toxicity and Non-Toxicity lines', () => {
    const tulip = aspcaOf('tulip');
    expect(['cats', 'dogs', 'horses'].map((each) => listingOf(tulip, each as 'cats'))).toEqual([
      'toxic',
      'toxic',
      'toxic',
    ]);
    // lilies: toxic to cats only, and the page says non-toxic to dogs and horses
    const easter = aspcaOf('easter-lily');
    expect(listingOf(easter, 'cats')).toBe('toxic');
    expect(listingOf(easter, 'dogs')).toBe('non-toxic');
    expect(listingOf(easter, 'horses')).toBe('non-toxic');
    // catnip: the entry names cats and nothing else
    expect(listingOf(aspcaOf('catnip'), 'dogs')).toBe('not-listed');
    // basil: non-toxic to dogs and cats, horses not named
    expect(listingOf(aspcaOf('basil'), 'cats')).toBe('non-toxic');
    expect(listingOf(aspcaOf('basil'), 'horses')).toBe('not-listed');
  });

  it('copy the verdicts people ask about most', () => {
    const toxicToCats = (slug: string) => listingOf(aspcaOf(slug), 'cats');
    for (const slug of ['lily', 'tiger-lily', 'day-lilies-many-varieties', 'sago-palm', 'tulip'])
      expect(toxicToCats(slug), slug).toBe('toxic');
    for (const slug of ['spider-plant', 'christmas-cactus', 'money-tree', 'rose', 'calathea'])
      expect(toxicToCats(slug), slug).toBe('non-toxic');
    expect(aspcaOf('tulip').signs).toContain('Highest concentration of toxin in bulb');
  });

  it('cite each entry at its address on aspca.org', () => {
    expect(aspcaSourceOf(aspcaOf('tulip')).url).toBe(
      'https://www.aspca.org/pet-care/aspca-poison-control/toxic-and-non-toxic-plants/tulip',
    );
    expect(() => aspcaOf('nope')).toThrow('no ASPCA entry nope');
  });
});
