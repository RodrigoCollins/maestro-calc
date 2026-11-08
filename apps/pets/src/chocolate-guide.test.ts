import { describe, expect, it } from 'vitest';
import { POISON_LINE } from './calc/chocolate.ts';
import { CHOCOLATE_CASES, CHOCOLATE_GUIDE, chocolateCaseHref } from './chocolate-guide.ts';
import { hrefOf } from './routes.ts';

describe('the chocolate cases', () => {
  // worked by hand: grams x mg per gram (dark 5.6, milk 2.3, baking 15.5) / (lb x 0.45359237)
  it('give the doses and bands the engine gives, worked out by hand', () => {
    expect(
      CHOCOLATE_CASES.map(({ id, rows }) => [
        id,
        rows.map(({ pounds, dose, band }) => [pounds, dose, band]),
      ]),
    ).toEqual([
      // 15 g of semisweet chips: 84 mg
      [
        'cookie',
        [
          [10, '18.5', 0],
          [20, '9.3', 0],
          [50, '3.7', 0],
        ],
      ],
      // 1 oz of dark chocolate: 158.8 mg; 1 oz on 10 lb is 1/160 of the weight, 5.6 x 1000 / 160 = 35
      [
        'dark',
        [
          [10, '35.0', 1],
          [20, '17.5', 0],
          [50, '7.0', 0],
        ],
      ],
      // 1.5 oz of milk chocolate: 97.8 mg
      [
        'milk',
        [
          [10, '21.6', 1],
          [20, '10.8', 0],
          [50, '4.3', 0],
        ],
      ],
      // 1 oz of baking chocolate: 439.4 mg
      [
        'baking',
        [
          [10, '96.9', 3],
          [20, '48.4', 2],
          [50, '19.4', 0],
        ],
      ],
    ]);
  });

  it('total the milligrams of each case', () => {
    expect(CHOCOLATE_CASES.map(({ totalMg }) => totalMg)).toEqual(['84', '159', '98', '439']);
  });

  it('open the calculator with the case filled in, at the calculator address', () => {
    // the calculator's own encoding: its defaults (20 lb, 1 oz) are left out of the query
    expect(chocolateCaseHref('baking', 20)).toBe(`${hrefOf('chocolate')}?v=1&t=baking`);
    expect(chocolateCaseHref('cookie', 10)).toBe(
      `${hrefOf('chocolate')}?v=1&w=10&t=dark&a=15&au=g`,
    );
    for (const { link } of CHOCOLATE_CASES)
      expect(link.href.startsWith(`${hrefOf('chocolate')}?`)).toBe(true);
  });
});

describe('the chocolate guide', () => {
  const text = JSON.stringify(CHOCOLATE_GUIDE);

  it('answers first: the lead says to call a veterinarian or the poison line now', () => {
    expect(CHOCOLATE_GUIDE.callNow).toBe(true);
    expect(CHOCOLATE_GUIDE.lead).toContain('veterinarian');
    expect(CHOCOLATE_GUIDE.lead).toContain(POISON_LINE.phone);
    expect(CHOCOLATE_GUIDE.h1).toBe('My dog ate chocolate: what to do now');
  });

  it('never calls a dose safe, and says acting fine is not safe', () => {
    for (const row of CHOCOLATE_GUIDE.table?.rows ?? [])
      expect(row.join(' ')).not.toMatch(/\bsafe\b|no risk|nothing to worry/i);
    expect(text).not.toMatch(/is safe|are safe|safe amount|safe dose|no risk/i);
    expect(text).toContain('6–12 hours');
    expect(text).toContain('up to 72 hours');
    expect(text).toContain('17.5 hours');
  });

  it('quotes the Merck bands and signs, and the ASPCA signs, and cites both', () => {
    expect(text).toContain('20 mg/kg');
    expect(text).toContain('40–50 mg/kg');
    expect(text).toContain('60 mg/kg');
    expect(text).toContain(
      'polydipsia, vomiting, diarrhea, abdominal distention, and restlessness',
    );
    expect(text).toContain('hyperactivity, polyuria, ataxia, rigidity, tremors, and seizures');
    expect(text).toContain('abnormal heart rhythm, tremors, seizures and even death');
    const urls = CHOCOLATE_GUIDE.sources.map(({ url }) => url);
    expect(urls).toContain(
      'https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals',
    );
    expect(urls).toContain(POISON_LINE.source);
  });

  it('shows every case at each weight in its table, with a call in every band', () => {
    const rows = CHOCOLATE_GUIDE.table?.rows ?? [];
    expect(rows).toHaveLength(12);
    for (const row of rows) expect(row.at(-1)).toMatch(/call/i);
  });

  it('links the calculator and has a worked example heading and questions', () => {
    expect(CHOCOLATE_GUIDE.calculators).toContain(hrefOf('chocolate'));
    expect(CHOCOLATE_GUIDE.table?.heading).toMatch(/worked example/i);
    expect(CHOCOLATE_GUIDE.questions?.length ?? 0).toBeGreaterThanOrEqual(3);
  });
});
