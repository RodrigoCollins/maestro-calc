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
    expect(text).toContain('a jug that has fallen to 10% takes 51.2 fl oz');
    expect(text).toContain('104 to 208 fl oz');
    expect(text).toContain('41.1 oz of 65% cal-hypo');
  });

  // worked by hand: 151.41647 g of available chlorine (20,000 gal, 1 to 3 ppm) ÷ 0.125 = 1,211.33 mL
  // = 40.96 fl oz; ÷ 0.10 = 1,514.16 mL = 51.20 fl oz; ÷ 0.65 = 232.95 g = 8.22 oz; ÷ 0.56 =
  // 270.39 g = 9.54 oz
  it('compares every product of the chlorine calculator for 20,000 gallons, 1 to 3 ppm', () => {
    const detail = detailOf('/how-much-chlorine-for-a-20000-gallon-pool');
    expect(detail.tables[0]?.head).toEqual([
      'Product',
      'Strength on the label',
      'To add',
      'Metric',
    ]);
    expect(detail.tables[0]?.rows).toEqual([
      ['Liquid chlorine', '12.5%', '41.0 fl oz', '1.21 L'],
      ['Liquid chlorine', '10%', '51.2 fl oz', '1.51 L'],
      ['Cal-hypo', '65%', '8.2 oz', '233 g'],
      ['Dichlor', '56%', '9.5 oz', '270 g'],
    ]);
    const text = sentencesOf(detail).join(' ');
    // the label's upkeep dose, 11 fl oz per 10,000 gallons, and 51.20 − 40.96 = 10.24 fl oz more
    expect(text).toContain('20,000 ÷ 10,000 × 11 = 22.0 fl oz');
    expect(text).toContain('10.2 fl oz more');
    expect(text).toContain('ammonia, acids or detergents');
    expect(text).toContain('goggles');
    expect(text).toContain('8.2 oz of cal-hypo');
    expect(text).toContain('9.5 oz of dichlor');
  });

  // worked by hand: 166,800 lb of water (20,000 gal) × 3,600 ÷ 1,000,000 = 600.48 lb, 15.01 bags so
  // 16; × 3,000 = 500.40 lb (13 bags), × 3,500 = 583.80 lb (14.6 bags so 15)
  it('compares the salt level of each cell maker for 20,000 gallons, against their tables', () => {
    const detail = detailOf('/how-much-salt-for-a-20000-gallon-pool');
    expect(detail.tables[0]?.rows).toEqual([
      ['Hayward AquaRite', '3,200 (2,700 to 3,400)', '533.8', '14'],
      ['Pentair IntelliChlor', '3,600 (3,600 to 4,500)', '600.5', '16'],
      ['Jandy AquaPure', '3,000 to 3,500', '500.4 to 583.8', '13 to 15'],
    ]);
    const text = sentencesOf(detail).join(' ');
    // Pentair's Table 2: 600.87 lb, 0.39 lb over this page; Jandy's Table 1: 500 lb at 3,000 ppm
    expect(text).toContain('600.87 lb');
    expect(text).toContain('0.4 lb');
    expect(text).toContain('500 lb');
    expect(text).toContain('skimmer');
    // 15,000 gallons: Pentair lists 450.65 lb, this page 450.4 (450.36), and Jandy lists no 15,000
    const fifteen = sentencesOf(detailOf('/how-much-salt-for-a-15000-gallon-pool')).join(' ');
    expect(fifteen).toContain('450.65 lb');
    expect(fifteen).not.toContain('Jandy’s Table 1');
    // 5,000 gallons: in neither maker's table
    const five = sentencesOf(detailOf('/how-much-salt-for-a-5000-gallon-pool')).join(' ');
    expect(five).not.toContain('Table');
  });

  it('cites the manuals and labels a salt or chlorine page compares, with the day they were read', () => {
    const salt = detailOf('/how-much-salt-for-a-20000-gallon-pool').sources.map(({ name }) => name);
    expect(salt.some((name) => name.startsWith('Pentair IntelliChlor'))).toBe(true);
    expect(salt.some((name) => name.startsWith('Jandy AquaPure'))).toBe(true);
    for (const name of salt.filter((each) => /Pentair|Jandy/.test(each)))
      expect(name).toContain('read 10 November 2026');
    const chlorine = detailOf('/how-much-chlorine-for-a-20000-gallon-pool').sources;
    expect(chlorine.map(({ name }) => name).join(' ')).toMatch(/Calcium Hypochlorite/);
    expect(chlorine.map(({ name }) => name).join(' ')).toMatch(/dichlor/);
  });

  // worked by hand: 757.08 g of available chlorine (20,000 gal, 0 to 10 ppm) ÷ 0.65 = 1,164.74 g =
  // 41.08 oz; ÷ 0.56 = 1,351.94 g = 47.69 oz; ÷ 0.125 = 6,056.66 mL = 204.80 fl oz; ÷ 0.10 =
  // 7,570.82 mL = 256.00 fl oz
  it('compares every product of the chlorine calculator as a shock for 20,000 gallons', () => {
    const detail = detailOf('/how-much-shock-for-a-20000-gallon-pool');
    expect(detail.tables[0]?.rows).toEqual([
      ['Cal-hypo', '65%', '41.1 oz', '1,165 g'],
      ['Dichlor', '56%', '47.7 oz', '1,352 g'],
      ['Liquid chlorine', '12.5%', '204.8 fl oz', '6.06 L'],
      ['Liquid chlorine', '10%', '256.0 fl oz', '7.57 L'],
    ]);
    expect(detail.tables[0]?.caption).toContain('from 0 to 10 ppm');
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

  // worked by hand: 20,000 gal, 9.16 fl oz a drop per 10,000 gal, so 18.32, 36.64 and 54.96 fl oz;
  // HASA's 32.0 fl oz a day leaves 36.64 − 32 = 4.64 and 54.96 − 32 = 22.96 fl oz for day 2;
  // 29.5735 mL a fl oz: 18.32 = 0.54 L, 32 = 0.95 L, 4.64 = 0.14 L, 22.96 = 0.68 L
  it('splits the muriatic acid of 20,000 gallons into the label’s days, for every test result', () => {
    const detail = detailOf('/how-much-muriatic-acid-for-a-20000-gallon-pool');
    const [days, soda] = detail.tables;
    expect(days?.head).toEqual(['Acid demand test', 'Day 1', 'Test, then day 2']);
    expect(days?.rows).toEqual([
      ['1 drop', '18.3 fl oz (0.54 L)', 'Nothing more'],
      ['2 drops', '32.0 fl oz (0.95 L)', '4.6 fl oz (0.14 L)'],
      ['3 drops', '32.0 fl oz (0.95 L)', '23.0 fl oz (0.68 L)'],
    ]);
    // 5.13 oz of soda ash a drop per 10,000 gal: 10.26 oz = 291 g, 20.52 = 582 g, 30.78 = 873 g
    expect(soda?.head).toEqual(['Base demand test', 'Soda ash', 'Metric']);
    expect(soda?.rows).toEqual([
      ['1 drop', '10.3 oz', '291 g'],
      ['2 drops', '20.5 oz', '582 g'],
      ['3 drops', '30.8 oz', '873 g'],
    ]);
    expect(soda?.caption).toContain('32.0 oz');
    const text = sentencesOf(detail).join(' ');
    expect(text).toContain('at least one foot from the wall');
    expect(text).toContain('7.2 to 7.6');
    expect(text).toContain('36.64 ÷ 128 ≈ 0.29');
    expect(text).toContain('54.96 ÷ 128 ≈ 0.43');
    // an 8 fl oz cup: 32 ÷ 8 = 4 cups, 4.64 ÷ 8 = 0.58 and 22.96 ÷ 8 = 2.87
    expect(text).toContain('32.0 ÷ 8 = 4.00 cups');
    expect(text).toContain('4.64 ÷ 8 = 0.58 cup');
    expect(text).toContain('22.96 ÷ 8 = 2.87 cups');
    expect(text).toContain('each drop the new test takes is 18.3 fl oz more');
    expect(text).toContain('55.6 gpm');
    expect(detail.sources.map(({ name }) => name).join(' ')).toContain('read 10 November 2026');
  });

  // worked by hand: 20,000 gal from 150 ppm, 1.25 lb per 10 ppm per 10,000 gal, at most 6.0 lb a
  // time (3 lb per 10,000 gal), and 6.0 lb raise 6 × 80,000 ÷ 20,000 = 24 ppm; ½ lb a gallon of water
  it('lays out the calcium chloride additions of 20,000 gallons and every level up to 400 ppm', () => {
    const detail = detailOf('/how-much-calcium-chloride-for-a-20000-gallon-pool');
    const [additions, levels] = detail.tables;
    expect(additions?.head).toEqual([
      'Addition',
      'Hours after the first',
      'Calcium chloride (lb)',
      'Water to dissolve it (gal)',
      'Reading to expect (ppm)',
    ]);
    expect(additions?.rows).toEqual([
      ['1', '0', '6.0', '12.0', '174'],
      ['2', '12', '6.0', '12.0', '198'],
      ['3', '24', '6.0', '12.0', '222'],
      ['4', '36', '6.0', '12.0', '246'],
      ['5', '48', '1.0', '2.0', '250'],
    ]);
    // 12.5, 25.0, 37.5, 50.0 and 62.5 lb; ceil(raise ÷ 24 ppm) additions, 12 hours apart
    expect(levels?.rows).toEqual([
      ['200 ppm', '12.5', '3', '24'],
      ['250 ppm', '25.0', '5', '48'],
      ['300 ppm', '37.5', '7', '72'],
      ['350 ppm', '50.0', '9', '96'],
      ['400 ppm', '62.5', '11', '120'],
    ]);
    const text = sentencesOf(detail).join(' ');
    expect(text).toContain('150 to 350 ppm');
    expect(text).toContain('clouding');
    // 25 × 0.45359237 = 11.34 kg, 6 × 0.45359237 = 2.72 kg, 12 gal × 3.785411784 = 45.4 L
    expect(text).toContain('25.00 lb × 0.45359237 ≈ 11.34 kg');
    expect(text).toContain('6.0 × 0.45359237 ≈ 2.72 kg');
    expect(text).toContain('12.0 × 3.785411784 ≈ 45.4 liters');
    expect(text).toContain('50.0 lb');
  });

  // worked by hand: 20,000 gal × 8.34 = 166,800 BTU a degree, so 1,668,000, 2,502,000 and 3,336,000
  // BTU for 10, 15 and 20 °F, over each number of hours, and over each heater output
  it('gives the heater of 20,000 gallons by the hours and the hours by the heater', () => {
    const detail = detailOf('/what-size-pool-heater-for-a-20000-gallon-pool');
    const [hours, heaters] = detail.tables;
    expect(hours?.head).toEqual(['Hours', '10 °F', '15 °F', '20 °F']);
    expect(hours?.rows).toEqual([
      ['8 hours', '208,500', '312,750', '417,000'],
      ['12 hours', '139,000', '208,500', '278,000'],
      ['24 hours', '69,500', '104,250', '139,000'],
      ['48 hours', '34,750', '52,125', '69,500'],
      ['72 hours', '23,167', '34,750', '46,333'],
    ]);
    expect(heaters?.rows).toEqual([
      ['100,000', '16.7 h', '25.0 h', '33.4 h'],
      ['150,000', '11.1 h', '16.7 h', '22.2 h'],
      ['200,000', '8.3 h', '12.5 h', '16.7 h'],
      ['250,000', '6.7 h', '10.0 h', '13.3 h'],
      ['300,000', '5.6 h', '8.3 h', '11.1 h'],
      ['400,000', '4.2 h', '6.3 h', '8.3 h'],
    ]);
    const text = sentencesOf(detail).join(' ');
    // 69,500 × 0.2930711 = 20,368.4 W; 10 × 5 ÷ 9 = 5.6 °C; 1¼ °F an hour is 208,500 BTU an hour
    expect(text).toContain('69,500 × 0.2930711 ≈ 20,368 W');
    expect(text).toContain('10 × 5 ÷ 9 ≈ 5.6 °C');
    expect(text).toContain('208,500');
    expect(detail.sources.map(({ name }) => name).join(' ')).toContain('NIST');
  });

  // worked by hand: 75,708.2 L × 1 mg per ppm = 75.71 g, 0.16691 lb a ppm, and ÷ 0.99 for Primo
  it('gives the stabilizer of 20,000 gallons for every level up to the 90 ppm cap', () => {
    const detail = detailOf('/how-much-stabilizer-for-a-20000-gallon-pool');
    const [levels] = detail.tables;
    expect(levels?.head).toEqual([
      'CYA target',
      'Cyanuric acid (lb)',
      'Ounces',
      'Primo Powder, 99% (lb)',
    ]);
    expect(levels?.rows).toEqual([
      ['30 ppm', '5.0', '80.1', '5.1'],
      ['40 ppm', '6.7', '106.8', '6.7'],
      ['50 ppm', '8.3', '133.5', '8.4'],
      ['60 ppm', '10.0', '160.2', '10.1'],
      ['70 ppm', '11.7', '186.9', '11.8'],
      ['80 ppm', '13.4', '213.6', '13.5'],
      ['90 ppm', '15.0', '240.3', '15.2'],
    ]);
    // Primo: 1 lb for each 4,000 gallons gives 30 ppm, so 20,000 ÷ 4,000 = 5.0 lb
    expect(sentencesOf(detail).join(' ')).toContain('20,000 ÷ 4,000 = 5.0 lb');
  });

  // worked by hand: ClearView, 1 lb raises 5,000 gallons 12 ppm, so 20,000 ÷ 5,000 × 10 ÷ 12 =
  // 3.33 lb for 10 ppm, 6.67 for 20 and 10.0 for 30; the chemistry gives 2.80, 5.60 and 8.41 lb
  it('checks the baking soda of 20,000 gallons against the ClearView label', () => {
    const detail = detailOf('/how-much-baking-soda-for-a-20000-gallon-pool');
    const [label] = detail.tables;
    expect(label?.head).toEqual([
      'Alkalinity',
      'Chemistry (lb)',
      'Chemistry (kg)',
      'ClearView label (lb)',
      'ClearView label (kg)',
    ]);
    // in kg (× 0.45359237): 1.271, 2.542 and 3.813 by the chemistry; 1.512, 3.024, 4.536 by the label
    expect(label?.rows).toEqual([
      ['90 to 100 ppm', '2.8', '1.3', '3.3', '1.5'],
      ['80 to 100 ppm', '5.6', '2.5', '6.7', '3.0'],
      ['70 to 100 ppm', '8.4', '3.8', '10.0', '4.5'],
    ]);
    // 453.59237 g ÷ (5,000 × 3.785411784 L × 1.6788 mg) = 14.27 ppm a pound
    const text = sentencesOf(detail).join(' ');
    expect(text).toContain('14.3 ppm');
    expect(text).toContain('at least 50 ppm');
  });
});
