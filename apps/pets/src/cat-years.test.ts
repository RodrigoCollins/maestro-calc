import { describe, expect, it } from 'vitest';
import {
  CAT_AGE_CHART_ROWS,
  CAT_AGE_SOURCES,
  CAT_AGES,
  CAT_YEARS_PAGES,
  catCalculatorHrefOf,
  catHumanAt,
  catYearsPageOf,
  catYearsPathOf,
  cornellAt,
} from './cat-years.ts';
import { ROUTES } from './routes.ts';

const page = (age: number) => catYearsPageOf(catYearsPathOf(age));
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

describe('the cat years pages', () => {
  it('are 1 to 20 years, each at an article route', () => {
    expect(CAT_AGES).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
    expect(CAT_YEARS_PAGES.map(({ path }) => path)).toEqual([
      '/1-year-in-cat-years',
      ...Array.from({ length: 19 }, (_, i) => `/${String(i + 2)}-years-in-cat-years`),
    ]);
    for (const { path } of CAT_YEARS_PAGES)
      expect(ROUTES.find((route) => route.path === path)?.kind).toBe('article');
    expect(() => catYearsPageOf('/21-years-in-cat-years')).toThrow('no cat age page');
  });

  it('answer first: the title, the h1 and the lead give the human age', () => {
    const five = page(5);
    expect(five.title).toBe('5 Years in Cat Years: About 36 Human Years | Bowl Figures');
    expect(five.h1).toBe('5 years in cat years is about 36 human years');
    expect(five.lead).toBe(
      'A 5-year-old cat is about 36 in human years on the AAFP-AAHA table (2010), and 33 by Cornell’s figures. It is a young adult (AAHA/AAFP 2021) and should see a veterinarian at least once a year.',
    );
    expect(page(1).title).toBe('1 Year in Cat Years: About 15 Human Years | Bowl Figures');
    expect(page(1).h1).toBe('1 year in cat years is about 15 human years');
    expect(page(20).h1).toBe('20 years in cat years is about 96 human years');
  });

  it('say an 8-year-old, an 11-year-old and an 18-year-old', () => {
    expect(page(8).lead).toMatch(/^An 8-year-old cat is about 48/);
    expect(page(11).description).toMatch(/^An 11-year-old cat/);
    expect(page(18).questions[0]?.question).toBe('How old is an 18-year-old cat in human years?');
  });

  it('keep every title and description unique, and where a result shows them whole', () => {
    expect(new Set(CAT_YEARS_PAGES.map(({ title }) => title)).size).toBe(20);
    expect(new Set(CAT_YEARS_PAGES.map(({ description }) => description)).size).toBe(20);
    for (const { title, description } of CAT_YEARS_PAGES) {
      expect(title.length, title).toBeLessThanOrEqual(65);
      expect(description.length, description).toBeGreaterThanOrEqual(50);
      expect(description.length, description).toBeLessThanOrEqual(160);
    }
  });

  // 11 years: 24 + 9 x 4 = 60 on the table, Cornell 21 + 9 x 4 = 57, a senior over 10
  it('give the table of the age from the engine', () => {
    expect(page(11).rows).toEqual([
      ['Human age, AAFP-AAHA table (2010)', '60'],
      ['Human age, Cornell Feline Health Center', '57'],
      ['Human age, 7× rule', '77'],
      ['Life stage, AAHA/AAFP (2021)', 'Senior'],
      ['Life stage, International Cat Care', 'Senior'],
      ['Veterinary exam (2021)', 'At least every 6 months'],
      ['Blood, urine, T4 and blood pressure (2021)', 'At least yearly, every 6 months recommended'],
    ]);
    expect(page(7).rows[3]).toEqual(['Life stage, AAHA/AAFP (2021)', 'Mature adult']);
    expect(page(7).rows[6]?.[1]).toBe('Every 1 to 2 years');
    expect(page(3).rows[6]?.[1]).toBe('A single baseline, then as needed');
  });

  it('say what changes this year, from the engine', () => {
    expect(sectionText(1, 'this-year')).toContain('from birth to 15 human years');
    expect(sectionText(2, 'this-year')).toContain('adds 9 human years on the table');
    expect(sectionText(2, 'this-year')).toContain('5 on Cornell’s figures');
    expect(sectionText(10, 'this-year')).toContain('adds 4 human years on the table');
    expect(sectionText(7, 'this-year')).toContain('from young adult to mature adult');
    expect(sectionText(11, 'this-year')).toContain('from mature adult to senior');
    expect(sectionText(15, 'this-year')).toContain('from senior to super senior');
    expect(sectionText(5, 'this-year')).toContain('No stage changes at 5');
  });

  it('place the age in its stage and count the birthdays to the next', () => {
    expect(sectionText(5, 'stage')).toContain('2 more birthdays before it is a mature adult at 7');
    expect(sectionText(6, 'stage')).toContain('1 more birthday before it is a mature adult at 7');
    expect(sectionText(9, 'stage')).toContain('2 more birthdays before it is a senior at 11');
    expect(sectionText(12, 'stage')).toContain('Senior is the last age stage, and 2 years past');
    expect(sectionText(11, 'stage')).toContain('1 year past the line of 10');
  });

  it('give the focus of the 2021 guidelines on the first birthday of each stage only', () => {
    expect(sectionText(1, 'stage')).toContain('periodontal disease');
    expect(sectionText(7, 'stage')).toContain('thyroid');
    expect(sectionText(11, 'stage')).toContain('litter box');
    for (const age of [2, 6, 8, 10, 12, 20])
      expect(page(age).sections[2]?.paragraphs).toHaveLength(1);
  });

  it('give the visits and the tests of the stage', () => {
    expect(sectionText(3, 'care')).toContain('at least once a year');
    expect(sectionText(3, 'care')).toContain('consider');
    expect(sectionText(8, 'care')).toContain('recommended');
    expect(sectionText(8, 'care')).toContain('every 1 to 2 years');
    expect(sectionText(13, 'care')).toContain('at least every 6 months');
    expect(sectionText(13, 'care')).toContain('strongly recommended');
  });

  it('compare Cornell with the table, as the sign of the gap says', () => {
    expect(sectionText(1, 'cornell')).toContain('16 human years, 1 more than the 15');
    expect(sectionText(10, 'cornell')).toContain('53 human years, 3 fewer than the 56');
    expect(cornellAt(10).toNumber()).toBe(53);
    expect(catHumanAt(10).toNumber()).toBe(56);
  });

  it('measure the seven-year rule against the table', () => {
    expect(sectionText(5, 'seven')).toContain('1 human year too low');
    expect(sectionText(1, 'seven')).toContain('8 human years too low');
    expect(sectionText(20, 'seven')).toContain('44 human years too high');
  });

  it('hold the figures of the hand-written notes to the engine', () => {
    const note = (age: number) => sectionText(age, 'note');
    expect(note(1)).toContain(
      `${String(cornellAt(1).toNumber())} against ${String(catHumanAt(1).toNumber())}`,
    );
    expect(note(10)).toContain(`${String(cornellAt(10).toNumber())}-year-old person`);
    expect(note(12)).toContain(`${String(cornellAt(12).toNumber())}-year-old person`);
    expect(note(15)).toContain(`a person of ${String(cornellAt(15).toNumber())}`);
    expect(note(20)).toContain(`${String(catHumanAt(25).toNumber())} at 25`);
    for (const age of CAT_AGES) expect(note(age), String(age)).not.toBe('');
  });

  it('answer whether the cat is a senior, from the 2021 stage', () => {
    const answer = (age: number) => page(age).questions[1]?.answer ?? '';
    expect(answer(5)).toBe(
      'No: a 5-year-old cat is a young adult by the 2021 AAHA/AAFP guidelines, 6 birthdays short of the senior stage.',
    );
    expect(answer(10)).toMatch(
      /^Not yet: the 2021 AAHA\/AAFP guidelines count a cat as senior once it is over 10/,
    );
    expect(answer(14)).toMatch(/^Yes: .* at 14 International Cat Care says senior/);
    expect(answer(16)).toContain('says super senior');
  });

  it('set a dog of the same age beside the cat, to the 16 years of the dog charts', () => {
    // 5: small 36, AVMA medium 36, giant 24 + 3 x 7.5 = 46.5; the cat 36
    expect(sectionText(5, 'dog')).toBe(
      'A 5-year-old dog is 36 if small, 36 if medium-sized and 46.5 if giant on the dog charts of this site. The cat is the same age as the medium dog.',
    );
    // 10: AVMA medium 60, the cat 56
    expect(sectionText(10, 'dog')).toContain('is 4 human years younger than the medium dog');
    expect(sectionText(1, 'dog')).toContain('is the same age as the medium dog');
    expect(sectionText(18, 'dog')).toBe(
      'The dog charts of this site stop at 16, where a medium dog is 87 and a giant dog 129. A cat of 18 is 2 years older than that and 88 on its own table.',
    );
  });

  it('open the calculator with the age filled in, the default age as the clean address', () => {
    expect(catCalculatorHrefOf(5)).toBe('/cat-age-calculator');
    expect(catCalculatorHrefOf(3)).toBe('/cat-age-calculator?v=1&a=3');
    expect(page(10).calculator.href).toBe('/cat-age-calculator?v=1&a=10');
  });

  it('cite every source with an address, the two guidelines among them', () => {
    const urls = page(1).sources.map(({ url }) => url);
    expect(urls).toContain(CAT_AGE_SOURCES.aafp2021.url);
    expect(urls).toContain(CAT_AGE_SOURCES.aafp2010.url);
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('chart the kitten months and every year to 25, with the stages', () => {
    expect(CAT_AGE_CHART_ROWS.map(([age]) => age)).toEqual([
      '1 month',
      '2 months',
      '3 months',
      '4 months',
      '6 months',
      '7 months',
      '1 year',
      '18 months',
      ...Array.from({ length: 24 }, (_, i) => `${String(i + 2)} years`),
    ]);
    expect(CAT_AGE_CHART_ROWS[2]).toEqual(['3 months', '4', '–', '1.8', 'Kitten', 'Kitten']);
    expect(CAT_AGE_CHART_ROWS[6]).toEqual(['1 year', '15', '16', '7', 'Young adult', 'Junior']);
    expect(CAT_AGE_CHART_ROWS.at(-1)).toEqual([
      '25 years',
      '116',
      '113',
      '175',
      'Senior',
      'Super senior',
    ]);
  });

  // the content audit flags two pages whose six-word shingles overlap by half or more
  it('are no near-duplicates of one another', () => {
    const sets = CAT_AGES.map((age) => shingles(prose(age)));
    for (const [i, a] of sets.entries())
      for (const [j, b] of sets.entries()) {
        if (j <= i) continue;
        const both = [...a].filter((each) => b.has(each)).length;
        const similarity = both / new Set([...a, ...b]).size;
        expect(similarity, `${String(i + 1)} and ${String(j + 1)}`).toBeLessThan(0.35);
      }
  });
});
