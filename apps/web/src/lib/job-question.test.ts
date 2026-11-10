import { describe, expect, it } from 'vitest';
import { isQuestionJob, JOB_IDS, QUESTION_IDS, type QuestionId } from '../routing/jobs.ts';
import { LOCALES, pathOf, ROUTES } from '../routing/routes.ts';
import { jobQuestion } from './job-question.ts';
import { NIST_HB44_C } from './job-land.ts';

const PAIRS = QUESTION_IDS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));

/** The rows of table `index` of question `id` in English, each its label then its cells. */
const rowsOf = (id: QuestionId, index: number) =>
  jobQuestion(id, 'en')?.tables[index]?.rows.map(({ label, cells }) => [label, ...cells]);

// queries (Ahrefs US, 2026-11-08): "how many cubic feet in a cubic yard", "cubic yards to tons",
// "how many cubic yards in a ton of gravel", "... of dirt", "how much does a cubic yard of concrete
// weigh", "cubic feet to gallons", "how many square feet is a 2 car garage" and "1 car garage"
describe('jobQuestion (the tables a question page adds to its job table)', () => {
  // hand-verified: NIST HB44 Appendix C, 1 yd³ = 27 ft³ = 0.764554857984 m³; 100 ÷ 27 = 3.7037,
  // 500 ÷ 27 = 18.5185, 500 ft³ = 14.158 m³; 0.5 yd³ = 13.5 ft³ = 0.3823 m³, 10 yd³ = 7.6455 m³
  it('converts cubic feet to cubic yards and back, by the NIST definitions', () => {
    const feet = rowsOf('cubic-feet-in-a-cubic-yard', 0);
    expect(feet).toContainEqual(['27', '1.00', '0.76']);
    expect(feet).toContainEqual(['100', '3.70', '2.83']);
    expect(feet).toContainEqual(['500', '18.52', '14.16']);
    const yards = rowsOf('cubic-feet-in-a-cubic-yard', 1);
    expect(yards).toContainEqual(['0.5', '13.50', '0.38']);
    expect(yards).toContainEqual(['10', '270.00', '7.65']);
    expect(
      jobQuestion('cubic-feet-in-a-cubic-yard', 'en')?.sources.map(({ source }) => source),
    ).toEqual([NIST_HB44_C]);
  });

  // hand-verified: a US gallon is 231 in³, so 1 ft³ = 1,728 ÷ 231 = 7.480519 gal = 28.316846592 L;
  // 4 ft³ = 29.92 gal = 113.27 L, 72 ft³ = 538.60 gal = 2,038.81 L, 27 ft³ = 201.97 gal = 764.55 L;
  // 1 gal = 0.1337 ft³ = 3.785 L, 100 gal = 13.368 ft³ = 378.54 L
  it('gives the gallons and liters of each box and converts both ways', () => {
    const boxes = rowsOf('cubic-feet-to-gallons', 0);
    expect(boxes?.[0]).toEqual(['2 ft × 2 ft × 12 in', '4.00', '29.92', '113.27']);
    expect(boxes?.at(-1)).toEqual(['4 ft × 12 ft × 18 in', '72.00', '538.60', '2,038.81']);
    expect(jobQuestion('cubic-feet-to-gallons', 'es')?.tables[0]?.rows[0]?.href).toMatch(
      new RegExp(`^${pathOf('topsoil', 'es')}\\?`),
    );
    expect(rowsOf('cubic-feet-to-gallons', 1)).toContainEqual(['1', '7.48', '28.32']);
    expect(rowsOf('cubic-feet-to-gallons', 1)).toContainEqual(['27', '201.97', '764.55']);
    expect(rowsOf('cubic-feet-to-gallons', 2)).toContainEqual(['1', '0.134', '3.79']);
    expect(rowsOf('cubic-feet-to-gallons', 2)).toContainEqual(['100', '13.368', '378.54']);
  });

  // hand-verified: tons = cubic yards × tons per cubic yard; loose base 2,580 lb = 1.29 t, compacted
  // 1.80 to 1.86 t; concrete 145 to 150 lb/ft³ × 27 = 3,915 to 4,050 lb = 1.9575 to 2.025 t, so 3 yd³
  // is 5.8725 to 6.075 t and 10 yd³ 19.575 to 20.25 t (ties round away from zero)
  it('weighs 1, 3, 5 and 10 cubic yards of every material of the weight chart in tons', () => {
    const rows = rowsOf('cubic-yards-to-tons', 0);
    expect(rows).toContainEqual(['Gravel base, loose', '1.29', '3.87', '6.45', '12.90']);
    expect(rows).toContainEqual([
      'Gravel base, compacted',
      '1.80–1.86',
      '5.40–5.58',
      '9.00–9.30',
      '18.00–18.60',
    ]);
    expect(rows).toContainEqual([
      'Concrete',
      '1.96–2.03',
      '5.87–6.08',
      '9.79–10.13',
      '19.58–20.25',
    ]);
    expect(rows).toContainEqual(['Topsoil', '0.80', '2.40', '4.00', '8.00']);
    expect(rows).toContainEqual(['Sand', '1.45', '4.35', '7.25', '14.50']);
    expect(rows).toHaveLength(11);
    expect(jobQuestion('cubic-yards-to-tons', 'en')?.sources).toHaveLength(6);
  });

  // hand-verified: yards per ton = 1 ÷ tons per yard; loose 2,000 ÷ 2,580 = 0.775 (20.9 ft³), gravel
  // 1 ÷ 1.42 = 0.704 (19.0 ft³), compacted 1 ÷ 1.86 to 1 ÷ 1.80 = 0.538 to 0.556 (14.5 to 15.0 ft³);
  // 20 tons: 15.50, 14.08 and 10.75 to 11.11 yd³
  it('gives the cubic yards in a ton of each gravel and the yards of 1 to 20 tons', () => {
    const per = rowsOf('cubic-yards-in-a-ton-of-gravel', 0);
    expect(per).toContainEqual(['Gravel base, loose', '1.29', '0.78', '20.9']);
    expect(per).toContainEqual(['Gravel, 1/4 to 2 in', '1.42', '0.70', '19.0']);
    expect(per).toContainEqual(['Gravel base, compacted', '1.80–1.86', '0.54–0.56', '14.5–15.0']);
    expect(per).toContainEqual(['Sand', '1.45', '0.69', '18.6']);
    const tons = rowsOf('cubic-yards-in-a-ton-of-gravel', 1);
    expect(tons?.[0]).toEqual(['1', '0.78', '0.70', '0.54–0.56']);
    expect(tons?.at(-1)).toEqual(['20', '15.50', '14.08', '10.75–11.11']);
  });

  // hand-verified: topsoil 0.80 t/yd³ (1.25 yd³ and 33.75 ft³ a ton); dry soil in place 1,330 kg/m³ ×
  // 0.764554857984 ÷ 907.18474 = 1.1209 t/yd³ (0.8921 yd³, 24.09 ft³ a ton); a 4 × 6 ft bed 12 in deep
  // with the topsoil calculator's 10% is 26.4 ft³ = 0.9778 yd³ = 0.782 t = 0.710 tonnes
  it('gives the cubic yards in a ton of dirt, the tons of each job and the yards of 1 to 20 tons', () => {
    const per = rowsOf('cubic-yards-in-a-ton-of-dirt', 0);
    expect(per).toContainEqual(['Topsoil', '0.80', '1.25', '33.8']);
    expect(per).toContainEqual(['Soil in the ground, dry', '1.12', '0.89', '24.1']);
    const jobs = rowsOf('cubic-yards-in-a-ton-of-dirt', 1);
    expect(jobs?.[0]).toEqual(['4 ft × 6 ft × 12 in', '0.98', '0.78', '0.71']);
    expect(rowsOf('cubic-yards-in-a-ton-of-dirt', 2)).toContainEqual(['10', '12.50', '8.92']);
  });

  // hand-verified: 145 to 150 lb/ft³; a 10 × 16 ft slab 4 in thick is 53.33 ft³ = 1.98 yd³ before
  // the extra: 7,733 to 8,000 lb, 3.87 to 4.00 t; 24 × 36 ft × 6 in is 432 ft³ = 16 yd³: 62,640 to
  // 64,800 lb, 31.32 to 32.40 t; 1 yd³ is 3,915 to 4,050 lb = 1.78 to 1.84 tonnes, 10 yd³ 17.76 to 18.37 tonnes
  it('weighs each slab and 1 to 10 cubic yards of concrete', () => {
    const slabs = rowsOf('concrete-cubic-yard-weight', 0);
    expect(slabs?.[0]).toEqual(['10 ft × 16 ft × 4 in', '1.98', '7,733–8,000', '3.87–4.00']);
    expect(slabs?.at(-1)).toEqual([
      '24 ft × 36 ft × 6 in',
      '16.00',
      '62,640–64,800',
      '31.32–32.40',
    ]);
    const yards = rowsOf('concrete-cubic-yard-weight', 1);
    expect(yards).toContainEqual(['1', '3,915–4,050', '1.96–2.03', '1.78–1.84']);
    expect(yards).toContainEqual(['10', '39,150–40,500', '19.58–20.25', '17.76–18.37']);
  });

  // hand-verified: a 20 × 20 ft floor 4 in thick is 133.33 ft³, with the concrete calculator's 10%
  // 146.67 ft³ = 5.43 yd³ and 146.67 ÷ 0.6 = 244.4, so 245 bags of 80 lb; 6 in thick 220 ft³ = 8.15 yd³
  it('works out the concrete floor of each garage size at 4 and 6 in thick', () => {
    expect(rowsOf('square-feet-2-car-garage', 0)).toContainEqual([
      '20 ft × 20 ft',
      '5.43',
      '245',
      '8.15',
    ]);
    expect(rowsOf('square-feet-1-car-garage', 0)).toHaveLength(5);
    expect(jobQuestion('square-feet-1-car-garage', 'en')?.tables[0]?.rows[0]?.href).toMatch(
      new RegExp(`^${pathOf('concrete', 'en')}\\?`),
    );
  });

  // hand-verified in slab-cost.test.ts: 4 in with 10% extra, the ready-mix at the producer prices
  // $160.18 and $201.90 a cubic yard, installed at $4 to $8 and $6.50 to $10.50 a square foot;
  // 100 sq ft takes 1.1 × t/12 × 100 ÷ 27 yd³: 1.36 at 4 in, 1.70 at 5, 2.04 at 6 and 2.72 at 8
  // 30 × 30 ft with 10% extra: 4 in 12.22 yd³ ($1,958–$2,468), 5 in 900 × 5/12 × 1.1 ÷ 27 =
  // 15.28 yd³ × 160.18 = 2,447.19 and × 201.90 = 3,084.58, 6 in 55/3 = 18.33 yd³ × 160.18 =
  // 2,936.63 and × 201.90 = 3,701.50 (ties away from zero: $3,702)
  it('prices the concrete of each thickness and of a 30 × 30 ft slab, with dated sources', () => {
    expect(rowsOf('concrete-slab-cost', 0)).toEqual([
      ['4 in', '1.36', '$2.18–$2.74'],
      ['5 in', '1.70', '$2.72–$3.43'],
      ['6 in', '2.04', '$3.26–$4.11'],
      ['8 in', '2.72', '$4.35–$5.48'],
    ]);
    expect(rowsOf('concrete-slab-cost', 1)).toEqual([
      ['30 ft × 30 ft × 4 in', '12.22', '$1,958–$2,468'],
      ['30 ft × 30 ft × 5 in', '15.28', '$2,447–$3,085'],
      ['30 ft × 30 ft × 6 in', '18.33', '$2,937–$3,702'],
    ]);
    expect(jobQuestion('concrete-slab-cost', 'es')?.tables[1]?.rows[0]?.href).toMatch(
      new RegExp(`^${pathOf('concrete', 'es')}\\?`),
    );
    expect(
      jobQuestion('concrete-slab-cost', 'en')?.sources.map(({ source }) => source.url),
    ).toEqual([
      'https://www.sec.gov/Archives/edgar/data/0000918646/000119312526446156/d135289dex991.htm',
      'https://www.sec.gov/Archives/edgar/data/1955520/000162828026069132/a2026q3ex99.htm',
      'https://www.thisoldhouse.com/foundations/concrete-slab-cost',
      'https://www.concretenetwork.com/concrete-prices.html',
    ]);
  });

  it.each(PAIRS)('writes %s an about section of its own in %s, with sources', (id, locale) => {
    const question = jobQuestion(id, locale);
    expect(question).toBeDefined();
    for (const paragraph of question?.paragraphs ?? []) {
      expect(paragraph.length, id).toBeGreaterThan(250);
    }
    for (const { source } of question?.sources ?? []) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    for (const table of question?.tables ?? []) {
      for (const row of table.rows) expect(row.cells).toHaveLength(table.columns.length - 1);
    }
    expect(Object.values(ROUTES).some((paths) => paths[locale] === question?.more.href)).toBe(true);
    expect(question?.more.href).not.toBe(pathOf(id, locale));
  });

  it('writes every paragraph and heading once', () => {
    const texts = PAIRS.flatMap(([id, locale]) => {
      const question = jobQuestion(id, locale);
      return [question?.heading, ...(question?.paragraphs ?? [])];
    });
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('is only for the question pages', () => {
    for (const id of JOB_IDS.filter((each) => !isQuestionJob(each))) {
      expect(jobQuestion(id, 'en'), id).toBeUndefined();
    }
  });
});
