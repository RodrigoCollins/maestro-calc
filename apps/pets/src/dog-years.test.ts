import { describe, expect, it } from 'vitest';
import {
  AGE_PAGES,
  agePageOf,
  agePathOf,
  calculatorHrefOf,
  DOG_AGE_SOURCES,
  humanAt,
  wangAt,
  yearsText,
} from './dog-years.ts';
import { ROUTES } from './routes.ts';

const page = (age: number) => agePageOf(agePathOf(age));
const sectionText = (age: number, id: string): string =>
  page(age)
    .sections.find((section) => section.id === id)
    ?.paragraphs.join(' ') ?? '';

/** The six-word shingles of a text, as the content audit counts shared text. */
const shingles = (text: string): Set<string> => {
  const words = text.toLowerCase().match(/[\p{L}\p{N}.’'-]+/gu) ?? [];
  return new Set(words.slice(0, -5).map((_, index) => words.slice(index, index + 6).join(' ')));
};

const prose = (age: number): string => {
  const { lead, sections, questions, rows } = page(age);
  return [
    lead,
    ...rows.flat(),
    ...sections.flatMap(({ heading, paragraphs }) => [heading, ...paragraphs]),
    ...questions.flatMap(({ question, answer }) => [question, answer]),
  ].join(' ');
};

describe('the dog years pages', () => {
  it('are 1 to 16 years, each at an article route', () => {
    expect(AGE_PAGES.map(({ path }) => path)).toEqual([
      '/1-year-in-dog-years',
      ...Array.from({ length: 15 }, (_, i) => `/${String(i + 2)}-years-in-dog-years`),
    ]);
    for (const { path } of AGE_PAGES)
      expect(ROUTES.find((route) => route.path === path)?.kind).toBe('article');
    expect(() => agePageOf('/17-years-in-dog-years')).toThrow('no dog age page');
  });

  it('answer first: the title, the h1 and the lead give the human age', () => {
    const three = page(3);
    expect(three.title).toBe('3 Years in Dog Years: About 28 Human Years | Bowl Figures');
    expect(three.h1).toBe('3 years in dog years is about 28 human years');
    expect(three.lead).toBe(
      'A 3-year-old dog is about 28 in human years if it is medium-sized (21 to 50 lb), on AVMA’s chart. A small dog of the same age is about 28, a large one 29.5 and a giant one 31.5. The DNA clock of a 2020 study gives 48.6.',
    );
    expect(page(1).title).toBe('1 Year in Dog Years: About 15 Human Years | Bowl Figures');
    expect(page(1).h1).toBe('1 year in dog years is about 15 human years');
  });

  it('say an 8-year-old, an 11-year-old, and a 3-year-old', () => {
    expect(page(8).lead).toMatch(/^An 8-year-old dog is about 51/);
    expect(page(11).description).toMatch(/^An 11-year-old dog/);
    expect(page(8).questions[1]?.question).toBe('Is an 8-year-old dog a senior?');
    expect(page(3).lead).toMatch(/^A 3-year-old/);
  });

  it('keep every title and description unique, and where a result shows them whole', () => {
    expect(new Set(AGE_PAGES.map(({ title }) => title)).size).toBe(16);
    expect(new Set(AGE_PAGES.map(({ description }) => description)).size).toBe(16);
    for (const { title, description } of AGE_PAGES) {
      expect(title.length, title).toBeLessThanOrEqual(65);
      expect(description.length, description).toBeGreaterThanOrEqual(50);
      expect(description.length, description).toBeLessThanOrEqual(160);
    }
  });

  // 10 years: small 24 + 8 x 4 = 56, medium AVMA 60, large 24 + 8 x 5.5 = 68, giant 24 + 8 x 7.5 = 84
  it('give the table by size from the engine, with the stage and the senior age', () => {
    expect(page(10).rows).toEqual([
      ['Small (20 lb or less)', '56', 'Mature adult', '11 years'],
      ['Medium (21 to 50 lb)', '60', 'Senior', '10 years'],
      ['Large (51 to 100 lb)', '68', 'Senior', '8 years'],
      ['Giant (over 100 lb)', '84', 'Senior', '7 years'],
    ]);
    expect(page(2).rows.map((row) => row[2])).toEqual(Array(4).fill('Young adult'));
  });

  it('say what changes this year, from the engine', () => {
    expect(sectionText(10, 'this-year')).toBe(
      'This birthday adds 4 for a small dog, 4 for a medium dog, 5.5 for a large dog and 7.5 for a giant dog in human years on the chart. The DNA clock adds 1.7.',
    );
    expect(sectionText(6, 'this-year')).toContain('6 for a medium dog');
    expect(sectionText(1, 'this-year')).toContain('about 15 human years');
  });

  it('group the sizes by life stage, and name the size that turns senior', () => {
    expect(sectionText(8, 'stage')).toMatch(
      /^Small and medium dogs are mature adults; large and giant dogs are seniors at 8/,
    );
    expect(sectionText(8, 'stage')).toContain('Large dogs turn senior at 8.');
    expect(sectionText(12, 'stage')).toMatch(/^Dogs of every size are seniors at 12/);
    expect(sectionText(5, 'stage')).toContain('No size turns senior at exactly 5.');
  });

  it('compare the DNA clock with the charts, as the sign of the gap says', () => {
    expect(sectionText(1, 'clock')).toContain('31.0 human years, 16.0 more than the 15');
    expect(sectionText(1, 'clock')).toContain('older than the chart of every size');
    expect(sectionText(10, 'clock')).toContain(
      'older than the clock for large and giant dogs and younger for small and medium dogs',
    );
    expect(sectionText(16, 'clock')).toContain('75.4 human years, 11.6 fewer than the 87');
    expect(sectionText(16, 'clock')).toContain('the chart of every size reads at least the clock');
  });

  it('measure the seven-year rule against the medium chart', () => {
    expect(sectionText(6, 'seven')).toContain('exactly right for a medium dog');
    expect(sectionText(1, 'seven')).toContain('8 human years too low');
    expect(sectionText(16, 'seven')).toContain('25 human years too high');
  });

  it('hold the figures of the hand-written notes to the engine', () => {
    const note = (age: number) => sectionText(age, 'note');
    expect(note(4)).toContain('more than 20 years older');
    expect(wangAt(4).sub(humanAt(4, 'medium')).toNumber()).toBeGreaterThan(20);
    for (const age of [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
      expect(
        wangAt(4)
          .sub(humanAt(4, 'medium'))
          .compare(wangAt(age).sub(humanAt(age, 'medium'))),
      ).not.toBe(-1);
    expect(note(5)).toContain(
      `36 human years for a small dog to ${yearsText(humanAt(5, 'giant'))}`,
    );
    expect(note(9)).toContain(`it reads ${wangAt(9).toNumber().toFixed(1)}`);
    expect(note(10)).toContain(
      `${yearsText(humanAt(10, 'large'))} human years against ${wangAt(10).toNumber().toFixed(1)}`,
    );
    expect(note(12)).toContain(`The clock reads ${wangAt(12).toNumber().toFixed(1)} at 12`);
    expect(note(13)).toContain(`the DNA clock ${wangAt(13).toNumber().toFixed(1)}`);
    expect(note(14)).toContain(
      `${wangAt(14).toNumber().toFixed(1)} human years, still above the 72`,
    );
    expect(note(15)).toContain(`above the clock’s ${wangAt(15).toNumber().toFixed(1)}`);
    expect(humanAt(13, 'medium').compare(wangAt(13))).toBe(1);
    expect(humanAt(12, 'medium').compare(wangAt(12))).toBe(-1);
    expect(humanAt(8, 'giant').compare(wangAt(8))).toBe(1);
    expect(humanAt(7, 'giant').compare(wangAt(7))).toBe(-1);
  });

  it('answer whether the dog is a senior, by size', () => {
    const answer = (age: number) => page(age).questions[1]?.answer ?? '';
    expect(answer(5)).toMatch(/^Not by size alone/);
    expect(answer(8)).toMatch(/^It depends on its size: at 8, a large or giant dog is a senior/);
    expect(answer(11)).toMatch(/^Yes, whatever its size/);
  });

  it('open the calculator with the age filled in, the default age as the clean address', () => {
    expect(calculatorHrefOf(3)).toBe('/dog-age-calculator');
    expect(calculatorHrefOf(5)).toBe('/dog-age-calculator?v=1&a=5');
    expect(page(10).calculator.href).toBe('/dog-age-calculator?v=1&a=10');
  });

  it('cite every source with an address, the AVMA chart and the study among them', () => {
    const urls = page(1).sources.map(({ url }) => url);
    expect(urls).toContain(DOG_AGE_SOURCES.avma.url);
    expect(urls).toContain('https://doi.org/10.1016/j.cels.2020.06.006');
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
    expect(new Set(urls).size).toBe(urls.length);
  });

  // the content audit flags two pages whose six-word shingles overlap by half or more
  it('are no near-duplicates of one another', () => {
    const sets = AGE_PAGES.map(({ age }) => shingles(prose(age)));
    for (const [i, a] of sets.entries())
      for (const [j, b] of sets.entries()) {
        if (j <= i) continue;
        const both = [...a].filter((each) => b.has(each)).length;
        const similarity = both / new Set([...a, ...b]).size;
        expect(similarity, `${String(i + 1)} and ${String(j + 1)}`).toBeLessThan(0.35);
      }
  });
});
