import { describe, expect, it } from 'vitest';
import { handProblems } from './__testing__/hand-check.ts';
import { ROUTED_PAGES } from './site-check/pages.ts';
import { jobDetailOf, type JobDetail } from './job-detail.ts';
import { JOB_PAGES, type JobPage } from './jobs.ts';

const byPath = (path: string): JobPage => {
  const page = JOB_PAGES.find((job) => job.path === path);
  if (page === undefined) throw new Error(`no job page ${path}`);
  return page;
};

const detailOf = (path: string): JobDetail => jobDetailOf(byPath(path));

/** Every sentence of a detail, in page order. */
const sentencesOf = ({ worked, label, next }: JobDetail): string[] => [
  ...worked,
  ...(label?.items ?? []),
  ...next.items.map(({ text }) => text),
];

describe('the worked figures, notes and next tests of a job page', () => {
  it('works every page out step by step, down to its own large figure', () => {
    for (const page of JOB_PAGES) {
      const { worked } = jobDetailOf(page);
      expect(worked.length, page.path).toBeGreaterThanOrEqual(4);
      expect(
        worked.some((step) => step.includes(page.figure.value)),
        page.path,
      ).toBe(true);
    }
  });

  it('reaches the liters of the table on every volume page', () => {
    for (const page of JOB_PAGES.filter(({ kind }) => kind === 'volume')) {
      const liters = page.rows[page.main]?.cells[2] ?? '';
      expect(jobDetailOf(page).worked.join(' '), page.path).toContain(`${liters} liters.`);
    }
  });

  it('gives every page sentences no other job page has', () => {
    const seen = new Map<string, string>();
    for (const page of JOB_PAGES) {
      for (const sentence of jobDetailOf(page).worked) {
        expect(seen.get(sentence), `${page.path}: ${sentence}`).toBeUndefined();
        seen.set(sentence, page.path);
      }
    }
  });

  it('puts a figure in every note and every next test, so no two pages read the same', () => {
    for (const page of JOB_PAGES) {
      for (const sentence of sentencesOf(jobDetailOf(page)))
        expect(sentence, page.path).toMatch(/\d/);
    }
  });

  it('writes every sum so a reader who works it by hand gets the same result', () => {
    expect(handProblems('2,944.0 × 1,728 ÷ 231 ≈ 22,023 gallons')).toEqual([]);
    expect(handProblems('So: 25.0 − 4 × 6.0 = 1.0 lb.')).toEqual([]);
    expect(handProblems('Depth: (3.5 + 8) ÷ 2 = 5.75 ft.')).toEqual([]);
    expect(handProblems('Grams: 757.1 × 100 ÷ 65 ≈ 1,164.7 g.')).toHaveLength(1);
    const problems = JOB_PAGES.flatMap((page) =>
      sentencesOf(jobDetailOf(page)).flatMap(handProblems),
    );
    expect(problems).toEqual([]);
  });

  it('links each next test to a job page or a calculator opened on this pool', () => {
    const jobs = new Set(JOB_PAGES.map(({ path }) => path));
    for (const page of JOB_PAGES) {
      const { next } = jobDetailOf(page);
      expect(next.items.length, page.path).toBeGreaterThanOrEqual(3);
      for (const { link } of next.items) {
        if (link === undefined) continue;
        const [path = '', query] = link.href.split('?');
        expect(link.href, page.path).not.toBe(page.path);
        if (query === undefined) expect(jobs.has(path), link.href).toBe(true);
        else expect(ROUTED_PAGES, link.href).toContain(`${path.slice(1)}.html`);
      }
    }
  });

  it('works stabilizer for 10,000 gallons from fresh water to 30 ppm as by hand', () => {
    const detail = detailOf('/how-much-stabilizer-for-a-10000-gallon-pool');
    expect(detail.worked).toContain(
      '10,000 gallons × 3.785411784 liters a gallon ≈ 37,854.1 liters of water to stabilize.',
    );
    expect(detail.worked.join(' ')).toContain(
      '37,854.1 L × 30 mg per liter ÷ 1,000 mg a gram ≈ 1,135.62 g',
    );
    expect(detail.worked.join(' ')).toContain('1,135.62 g ÷ 453.59237 g a pound ≈ 2.5 lb');
    expect(sentencesOf(detail).join(' ')).toContain('40.5 oz');
    expect(sentencesOf(detail).join(' ')).toContain('1.7 lb');
    expect(sentencesOf(detail).join(' ')).toContain('5.0 lb');
    expect(detail.next.items.map(({ link }) => link?.href)).toContain(
      '/how-much-chlorine-for-a-10000-gallon-pool',
    );
  });

  it('works salt for 15,000 gallons from fresh water to 3,200 ppm as by hand', () => {
    const detail = detailOf('/how-much-salt-for-a-15000-gallon-pool');
    const text = sentencesOf(detail).join(' ');
    expect(text).toContain('15,000 gallons × 8.34 lb a gallon = 125,100 lb of water');
    expect(text).toContain('125,100 × 3,200 ÷ 1,000,000 ≈ 400.3 lb');
    expect(text).toContain('400.32 lb ÷ 40 lb a bag ≈ 10.01 bags, rounded up to 11 bags');
    expect(text).toContain('≈ 181.6 kg');
    expect(text).toContain('337.8 lb');
    expect(text).toContain('425.3');
    expect(text).toContain('300.2 lb');
  });

  it('works chlorine for 20,000 gallons, 1 to 3 ppm of 12.5% liquid, as by hand', () => {
    const text = sentencesOf(detailOf('/how-much-chlorine-for-a-20000-gallon-pool')).join(' ');
    expect(text).toContain('75,708.2 × 2 ÷ 1,000 ≈ 151.416 g');
    expect(text).toContain('151.416 g × 100 ÷ 12.5 ≈ 1,211.3 mL');
    expect(text).toContain('1,211.3 mL ÷ 29.5735295625 mL a fluid ounce ≈ 41.0 fl oz');
    expect(text).toContain(
      '51.2 fl oz of 10% liquid, 8.2 oz of 65% cal-hypo or 9.5 oz of 56% dichlor',
    );
    expect(text).toContain('104 to 208 fl oz');
    expect(text).toContain('41.1 oz of 65% cal-hypo');
  });

  it('works shock for 20,000 gallons, cal-hypo to 10 ppm, against the labels, as by hand', () => {
    const text = sentencesOf(detailOf('/how-much-shock-for-a-20000-gallon-pool')).join(' ');
    expect(text).toContain('≈ 757.08 g of available chlorine');
    expect(text).toContain('757.08 × 100 ÷ 65 ≈ 1,164.74 g');
    expect(text).toContain('≈ 41.1 oz');
    expect(text).toContain('≈ 2.57 lb');
    expect(text).toContain('20 to 40 oz');
    expect(text).toContain('40 oz for 20,000 gallons');
  });

  it('works baking soda for 20,000 gallons, 90 to 100 ppm, as by hand', () => {
    const text = sentencesOf(detailOf('/how-much-baking-soda-for-a-20000-gallon-pool')).join(' ');
    expect(text).toContain('≈ 1,271.0 g');
    expect(text).toContain('1,271.0 g ÷ 453.59237 ≈ 2.8 lb');
    expect(text).toContain('≈ 44.8 oz');
    expect(text).toContain('11.2 lb');
    expect(text).toContain('12.5 lb of calcium chloride');
  });

  it('works calcium chloride for 20,000 gallons, 150 to 250 ppm, in its split additions', () => {
    const text = sentencesOf(detailOf('/how-much-calcium-chloride-for-a-20000-gallon-pool')).join(
      ' ',
    );
    expect(text).toContain('20,000 ÷ 1,000 × 2 oz = 40.0 oz for each 10 ppm');
    expect(text).toContain('40.0 × 10 = 400.0 oz, ÷ 16 = 25.0 lb');
    expect(text).toContain('20,000 ÷ 10,000 × 3 lb = 6.0 lb');
    expect(text).toContain('5 additions');
    expect(text).toContain('48 hours');
    expect(text).toContain('12.0 gallons');
    expect(text).toContain('18.50 lb');
    expect(text).toContain('62.5 lb');
  });

  it('works muriatic acid for 20,000 gallons, 2 drops, over the label’s days, as by hand', () => {
    const text = sentencesOf(detailOf('/how-much-muriatic-acid-for-a-20000-gallon-pool')).join(' ');
    expect(text).toContain('20,000 ÷ 10,000 = 2.0');
    expect(text).toContain('2.0 × 2 drops × 9.16 fl oz ≈ 36.6 fl oz');
    expect(text).toContain('20,000 × 32 ÷ 20,000 = 32.0 fl oz a day');
    expect(text).toContain('≈ 1.15');
    expect(text).toContain('20.5 oz');
    expect(text).toContain('2.8 lb of baking soda');
  });

  it('works the heater for 20,000 gallons, 10 °F in 24 hours, as by hand', () => {
    const text = sentencesOf(detailOf('/what-size-pool-heater-for-a-20000-gallon-pool')).join(' ');
    expect(text).toContain('= 166,800 lb');
    expect(text).toContain('166,800 lb × 10 °F = 1,668,000 BTU');
    expect(text).toContain('1,668,000 ÷ 24 = 69,500 BTU an hour');
    expect(text).toContain('139,000');
    expect(text).toContain('6,950 BTU an hour');
    expect(text).toContain('55.6 gpm');
  });

  it('works filling 15,000 gallons at 10 gallons a minute as by hand', () => {
    const text = sentencesOf(detailOf('/how-long-to-fill-a-15000-gallon-pool')).join(' ');
    expect(text).toContain('15,000 gallons ÷ 10 gallons a minute = 1,500 minutes');
    expect(text).toContain('1,500 ÷ 60 = 25.00 hours');
    expect(text).toContain('1,500 ÷ 1,440 minutes a day ≈ 1.04 days');
    expect(text).toContain('50.0 minutes');
    expect(text).toContain('41.7 gpm');
  });

  it('works the 16 x 32, the 24 ft round and the 15 x 30 oval pools as by hand', () => {
    const rectangle = detailOf('/16x32-pool-gallons').worked.join(' ');
    expect(rectangle).toContain('32 ft × 16 ft = 512 ft²');
    expect(rectangle).toContain('(3.5 + 8) ÷ 2 = 5.75 ft');
    expect(rectangle).toContain('512 ft² × 5.75 ft = 2,944.0 ft³');
    expect(rectangle).toContain('2,944.0 × 1,728 ÷ 231 ≈ 22,023 gallons');
    expect(rectangle).toContain('22,022.649 gallons × 3.785411784 ≈ 83,365 liters');
    const round = detailOf('/24-ft-round-pool-gallons').worked.join(' ');
    expect(round).toContain('π × 24² ÷ 4 ≈ 452.3893 ft²');
    expect(round).toContain('≈ 13,536 gallons');
    const oval = detailOf('/15x30-oval-pool-gallons').worked.join(' ');
    expect(oval).toContain('π × 30 × 15 ÷ 4 ≈ 353.4292 ft²');
    expect(oval).toContain('≈ 10,575 gallons');
  });
});
