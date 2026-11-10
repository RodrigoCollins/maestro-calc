import { describe, expect, it } from 'vitest';
import { PUPPY_WEIGHT_ARTICLE, PUPPY_WEIGHT_SOURCES, WEEK_ROWS } from './puppy-weight-article.ts';

const article = PUPPY_WEIGHT_ARTICLE;
const text = JSON.stringify(article);
const tableOf = (id: string) => article.tables.find((table) => table.id === id);

describe('the puppy weight article', () => {
  it('is checked against its sources on the day they were read', () => {
    expect(article.checked).toBe('2026-11-10');
  });

  it('works the default case out step by step, with the engine’s figures', () => {
    expect(article.sections[0]?.heading).toBe('How the figures are worked out');
    // 13 weeks x 12 / 52 = 3 months; 35% for a large breed; 21 / 0.35 = 60 lb = 27.2 kg
    expect(text).toContain('13 × 12 ÷ 52 = 3 months');
    expect(text).toContain('21 ÷ 0.35 = 60 lb');
    expect(text).toContain('27.2 kg');
    // small 21 / 0.37 = 56.8, giant 21 / 0.26 = 80.8
    expect(text).toContain('57 to 81 lb');
    // 16 weeks, small: 37 + (9/13) x 15 = 47.4%
    expect(text).toContain('47.4%');
  });

  it('transcribes the WALTHAM table as published, row by row', () => {
    const table = tableOf('share-by-month');
    expect(table?.columns).toHaveLength(4);
    expect(table?.rows).toEqual([
      ['1', '9%', '7%', '6%'],
      ['2', '22%', '20%', '14%'],
      ['3', '37%', '35%', '26%'],
      ['4', '52%', '48%', '38%'],
      ['5', '61%', '57%', '49%'],
      ['6', '70%', '65%', '60%'],
      ['9', '83%', '77%', '70%'],
      ['12', '95%', '88%', '80%'],
      ['15', 'Adult', '94%', '90%'],
      ['18', 'Adult', '100%', '100%'],
    ]);
  });

  it('reads the same table by week, with the multiplier to the adult weight', () => {
    const table = tableOf('share-by-week');
    expect(table?.rows.map(([weeks]) => weeks)).toEqual(WEEK_ROWS.map(String));
    // 8 weeks: 9 + 11 = 20% (x 5), 7 + 11 = 18% (x 5.6), 6 + 88/13 = 12.8% (x 7.8)
    expect(table?.rows[0]).toEqual(['8', '20% (× 5)', '18% (× 5.6)', '13% (× 7.8)']);
    // 16 weeks: 47.4% (x 2.1), 35 + 9 = 44% (x 2.3), 26 + 108/13 = 34.3% (x 2.9)
    expect(table?.rows.find(([weeks]) => weeks === '16')).toEqual([
      '16',
      '47% (× 2.1)',
      '44% (× 2.3)',
      '34% (× 2.9)',
    ]);
    expect(table?.rows.find(([weeks]) => weeks === '26')).toEqual([
      '26',
      '70% (× 1.4)',
      '65% (× 1.5)',
      '60% (× 1.7)',
    ]);
    expect(table?.rows.find(([weeks]) => weeks === '78')).toEqual([
      '78',
      'grown',
      'grown',
      'grown',
    ]);
    expect(table?.links.map(({ href }) => href)).toContain('/puppy-feeding-calculator');
  });

  it('answers whether a 4-month weight doubles, size by size', () => {
    // 1 / 0.52 = 1.9, 1 / 0.48 = 2.1, 1 / 0.38 = 2.6
    const answer = article.questions.find(({ question }) => question.includes('double'))?.answer;
    expect(answer).toContain('1.9');
    expect(answer).toContain('2.1');
    expect(answer).toContain('2.6');
  });

  it('explains breed, sex, neutering and mixed breeds, and sends the reader to the vet', () => {
    expect(text).toContain('mixed');
    expect(text).toContain('54 of 72 breeds');
    expect(text).toContain('37 weeks');
    expect(text).toContain('hip dysplasia');
    expect(text).toContain('veterinarian');
    expect(article.questions.length).toBeGreaterThanOrEqual(4);
  });

  it('cites each source once, each with an address', () => {
    const urls = article.sources.map(({ url }) => url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain(PUPPY_WEIGHT_SOURCES.waltham.url);
    expect(urls).toContain('https://doi.org/10.1371/journal.pone.0182064');
    expect(urls).toContain('https://pmc.ncbi.nlm.nih.gov/articles/PMC9829868/');
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
  });
});
