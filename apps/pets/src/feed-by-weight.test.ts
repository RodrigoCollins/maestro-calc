import { describe, expect, it } from 'vitest';
import {
  FEED_HUB,
  FEED_PAGES,
  FEED_SOURCES,
  FEED_WEIGHTS,
  feedCalculatorHrefOf,
  feedPageOf,
  feedPathOf,
  merAt,
  WSAVA_ROWS,
  wsavaRowOf,
} from './feed-by-weight.ts';
import { ROUTES } from './routes.ts';

const page = (weight: number) => feedPageOf(feedPathOf(weight));
const sectionText = (weight: number, id: string): string =>
  page(weight)
    .sections.find((section) => section.id === id)
    ?.paragraphs.join(' ') ?? '';
const answerOf = (weight: number, index: number): string =>
  page(weight).questions[index]?.answer ?? '';

/** The six-word shingles of a text, as the content audit counts shared text. */
const shingles = (text: string): Set<string> => {
  const words = text.toLowerCase().match(/[\p{L}\p{N}.’'-]+/gu) ?? [];
  return new Set(words.slice(0, -5).map((_, index) => words.slice(index, index + 6).join(' ')));
};

const prose = (weight: number): string => {
  const { lead, sections, questions, stages, labels } = page(weight);
  return [
    lead,
    ...stages.rows.flat(),
    ...labels.rows.flat(),
    ...sections.flatMap(({ heading, paragraphs }) => [heading, ...paragraphs]),
    ...questions.flatMap(({ question, answer }) => [question, answer]),
  ].join(' ');
};

describe('the feed-by-weight pages', () => {
  it('are 10 to 100 lb, each at an article route, with "an" before 80', () => {
    expect(FEED_WEIGHTS).toEqual([10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 100]);
    expect(FEED_PAGES.map(({ path }) => path)).toEqual([
      '/how-much-to-feed-a-10-lb-dog',
      '/how-much-to-feed-a-15-lb-dog',
      '/how-much-to-feed-a-20-lb-dog',
      '/how-much-to-feed-a-25-lb-dog',
      '/how-much-to-feed-a-30-lb-dog',
      '/how-much-to-feed-a-40-lb-dog',
      '/how-much-to-feed-a-50-lb-dog',
      '/how-much-to-feed-a-60-lb-dog',
      '/how-much-to-feed-a-70-lb-dog',
      '/how-much-to-feed-an-80-lb-dog',
      '/how-much-to-feed-a-100-lb-dog',
    ]);
    for (const { path } of [...FEED_PAGES, FEED_HUB])
      expect(ROUTES.find((route) => route.path === path)?.kind).toBe('article');
    expect(() => feedPageOf('/how-much-to-feed-a-12-lb-dog')).toThrow('no feeding page');
  });

  // 50 lb = 22.680 kg; 22.680^0.75 = 10.393; RER 70 x 10.393 = 727.5 kcal; neutered x 1.6 =
  // 1,164.0 kcal; / 360 kcal a cup = 3.23 cups, 3 1/4 to the quarter
  it('answer first: the title, the h1 and the lead give the cups and the calories', () => {
    const fifty = page(50);
    expect(fifty.title).toBe('How Much to Feed a 50 lb Dog: 3 ¼ Cups a Day | Bowl Figures');
    expect(fifty.h1).toBe('How much should I feed a 50 lb dog? About 3 ¼ cups a day');
    expect(fifty.lead).toBe(
      'A neutered adult dog of 50 lb needs about 1,164 kcal a day (Merck Veterinary Manual), which is about 3 ¼ cups a day of a dry food of 360 kcal a cup. That cup figure is an assumption: read the calorie line on your own bag and divide by it, or use the calculator below.',
    );
    expect(page(80).h1).toBe('How much should I feed an 80 lb dog? About 4 ½ cups a day');
    // 10 lb = 4.536 kg: RER 217.6, x 1.6 = 348.1 kcal, 0.97 cups
    expect(page(10).title).toBe('How Much to Feed a 10 lb Dog: 1 Cup a Day | Bowl Figures');
    // 100 lb = 45.359 kg: RER 1,223.5, x 1.6 = 1,957.6 kcal, 5.44 cups
    expect(page(100).h1).toBe('How much should I feed a 100 lb dog? About 5 ½ cups a day');
  });

  it('keep every title and description unique, and where a result shows them whole', () => {
    const all = [...FEED_PAGES, FEED_HUB];
    expect(new Set(all.map(({ title }) => title)).size).toBe(all.length);
    expect(new Set(all.map(({ description }) => description)).size).toBe(all.length);
    for (const { title, description } of all) {
      expect(title.length, title).toBeLessThanOrEqual(65);
      expect(description.length, description).toBeGreaterThanOrEqual(50);
      expect(description.length, description).toBeLessThanOrEqual(160);
    }
  });

  // 50 lb, RER 727.5: intact x 1.8 = 1,309.5; inactive x 1.4 = 1,018.5; weight loss x 1.0 = 727.5;
  // puppy x 3.0 = 2,182.5 and x 2.0 = 1,455.0; each / 360 to the quarter cup
  it('give the calories and cups of each life stage from the engine', () => {
    expect(page(50).stages.rows).toEqual([
      ['Neutered adult', '1.6', '1,164', '3 ¼ (3.23)'],
      ['Intact adult', '1.8', '1,309', '3 ¾ (3.64)'],
      ['Inactive or prone to weight gain', '1.4', '1,018', '2 ¾ (2.83)'],
      ['On a weight-loss plan, if 50 lb is the ideal weight', '1.0', '727', '2 (2.02)'],
      ['Puppy under 4 months that weighs 50 lb now', '3.0', '2,182', '6 (6.06)'],
      ['Puppy 4 months or older that weighs 50 lb now', '2.0', '1,455', '4 (4.04)'],
    ]);
    expect(merAt(50).toNumber()).toBeCloseTo(1164.0, 0);
    expect(merAt(80).toNumber()).toBeCloseTo(1655.9, 1);
  });

  // 1,164.0 kcal / 300, 360, 420 and 480 kcal a cup
  it('give the cups for other calorie lines on the bag', () => {
    expect(page(50).labels.rows).toEqual([
      ['300', '4', '3.88'],
      ['360', '3 ¼', '3.23'],
      ['420', '2 ¾', '2.77'],
      ['480', '2 ½', '2.42'],
    ]);
  });

  it('show the arithmetic of the answer step by step', () => {
    expect(sectionText(50, 'worked')).toBe(
      '50 lb × 0.45359237 = 22.680 kg. Raised to the power 0.75 that is 10.393, and 70 × 10.393 = 727.5 kcal a day: the resting energy requirement (RER). A neutered adult needs 1.6 times it, Merck’s factor: 727.5 × 1.6 = 1,164 kcal a day. Divided by 360 kcal a cup, that is 3.23 cups, or 3 ¼ to the nearest quarter cup.',
    );
  });

  it('read WSAVA’s table at the nearest row and say where Merck’s figure falls', () => {
    expect(WSAVA_ROWS).toHaveLength(11);
    expect(wsavaRowOf(50)).toEqual({ kg: 23, lb: '50.6', low: 880, high: 1103 });
    expect(wsavaRowOf(10)).toEqual({ kg: 5, lb: '11', low: 280, high: 351 });
    expect(wsavaRowOf(100)).toEqual({ kg: 45, lb: '99', low: 1460, high: 1824 });
    expect(sectionText(50, 'wsava')).toContain(
      'WSAVA’s calorie table for an average healthy adult dog in ideal body condition gives 880 to 1,103 kcal a day at 23 kg (50.6 lb), 2.44 to 3.06 cups of a 360 kcal food.',
    );
    expect(sectionText(50, 'wsava')).toContain('above the top of that range');
    // 10 lb: 348.1 kcal against 280 to 351
    expect(sectionText(10, 'wsava')).toContain('inside that range');
  });

  it('name the treat budget, the 30% band and the life stages that change the figure', () => {
    // 10% of 1,164.0 = 116.4 kcal; 90% of 3.23 cups = 2.91 cups
    expect(sectionText(50, 'treats')).toContain('116 kcal');
    expect(sectionText(50, 'treats')).toContain('2.91 cups');
    // 30% less and more: 814.8 and 1,513.2
    expect(sectionText(50, 'check')).toContain('815 to 1,513 kcal');
    expect(sectionText(50, 'check')).toContain('ribs palpable without excess fat covering');
    expect(sectionText(50, 'check')).toContain('veterinarian');
    // inactive 1.0 to 1.2 of 727.5: 727.5 to 873.0
    expect(sectionText(50, 'life')).toContain('727 to 873 kcal');
    expect(sectionText(50, 'life')).toContain('2,182 kcal');
  });

  it('hold the figures of the hand-written notes to the engine', () => {
    const note = (weight: number) => sectionText(weight, 'note');
    // AAHA's example: 4.5 kg, RER 216, MER 302 at 1.4; the exact pound gives 217.6 and 304.7
    expect(note(10)).toContain('218 and 305');
    expect(merAt(10).div(merAt(10)).toNumber()).toBe(1);
    // a quarter cup of 360 kcal food is 90 kcal, 90 / 348.1 = 25.9%
    expect(note(10)).toContain('26% of the day');
    // 471.8 / 348.1 = 1.355
    expect(note(15)).toContain('472 kcal against 348, 36% more');
    // 585.5 / 348.1 = 1.682; 585.5 / 20 = 29.3 and 348.1 / 10 = 34.8 kcal a pound
    expect(note(20)).toContain('585 kcal against 348, 1.68 times');
    expect(note(20)).toContain('29.3 kcal');
    expect(note(20)).toContain('34.8');
    // an eighth of a cup is 45 kcal, 45 / 692.1 = 6.5%
    expect(note(25)).toContain('6.5%');
    // 793.5 / 348.1 = 2.28
    expect(note(30)).toContain('2.28 times');
    expect(note(40)).toContain('985 kcal');
    // light work 1.6 to 2.0 of 727.5: 1,164 to 1,455
    expect(note(50)).toContain('1,164 to 1,455 kcal');
    // intact 60 lb 834.1 x 1.8 = 1,501.4 against neutered 70 lb 1,498.1
    expect(note(60)).toContain('1,501 kcal');
    expect(note(60)).toContain('1,498');
    // 25% of 1,498.1 = 374.5 kcal, 1.04 cups
    expect(note(70)).toContain('375 kcal');
    // 70 lb ideal weight on the weight-loss factor 1.0: 936.3 kcal, 2.60 cups
    expect(note(80)).toContain('936 kcal');
    expect(note(80)).toContain('2 ½ cups');
    // 1,957.6 / 348.1 = 5.62
    expect(note(100)).toContain('5.62 times');
  });

  it('answer the question people search with the figures of the page', () => {
    expect(page(50).questions[0]?.question).toBe('How much should a 50 lb dog eat?');
    expect(answerOf(50, 0)).toMatch(/^About 3 ¼ cups a day of a 360 kcal a cup dry food/);
    expect(page(80).questions[1]?.question).toBe('How many calories does an 80 lb dog need?');
    expect(answerOf(50, 1)).toContain('727.5');
    expect(answerOf(50, 2)).toContain('veterinarian');
  });

  it('open the calculator with the weight filled in, the default weight as the clean address', () => {
    expect(feedCalculatorHrefOf(40)).toBe('/dog-food-calculator');
    expect(feedCalculatorHrefOf(50)).toBe('/dog-food-calculator?v=1&w=50');
    expect(page(50).calculator.href).toBe('/dog-food-calculator?v=1&w=50');
  });

  it('cite every source with an address, Merck, AAHA, WSAVA and the AKC chart among them', () => {
    const urls = page(50).sources.map(({ url }) => url);
    expect(urls).toContain(FEED_SOURCES.merck.url);
    expect(urls).toContain(FEED_SOURCES.aaha.url);
    expect(urls).toContain(FEED_SOURCES.wsava.url);
    expect(urls).toContain(FEED_SOURCES.wsavaBcs.url);
    expect(urls).toContain(FEED_SOURCES.akc.url);
    expect(page(70).sources.map(({ url }) => url)).toContain(FEED_SOURCES.kealy.url);
    for (const { sources } of [...FEED_PAGES, FEED_HUB]) {
      const all = sources.map(({ url }) => url);
      for (const url of all) expect(url).toMatch(/^https:\/\//);
      expect(new Set(all).size).toBe(all.length);
    }
  });

  // the content audit flags two pages whose six-word shingles overlap by half or more
  it('are no near-duplicates of one another', () => {
    const sets = FEED_WEIGHTS.map((weight) => shingles(prose(weight)));
    for (const [i, a] of sets.entries())
      for (const [j, b] of sets.entries()) {
        if (j <= i) continue;
        const both = [...a].filter((each) => b.has(each)).length;
        const similarity = both / new Set([...a, ...b]).size;
        expect(
          similarity,
          `${String(FEED_WEIGHTS[i])} and ${String(FEED_WEIGHTS[j])}`,
        ).toBeLessThan(0.35);
      }
  });
});

describe('the "how much should I feed my dog" hub', () => {
  it('answers first and lists every weight with its calories, cups and page', () => {
    expect(FEED_HUB.path).toBe('/how-much-should-i-feed-my-dog');
    expect(FEED_HUB.h1).toBe('How much should I feed my dog?');
    expect(FEED_HUB.lead).toContain('985 kcal');
    expect(FEED_HUB.rows).toHaveLength(FEED_WEIGHTS.length);
    expect(FEED_HUB.rows[6]).toEqual({
      href: '/how-much-to-feed-a-50-lb-dog',
      cells: ['50 lb', '1,164', '3 ¼'],
    });
  });

  it('walks the steps, the factors and when to ask a veterinarian first, with its sources', () => {
    const ids = FEED_HUB.sections.map(({ id }) => id);
    expect(ids).toEqual(['steps', 'factors', 'bag', 'check', 'vet']);
    const text = FEED_HUB.sections.flatMap(({ paragraphs }) => paragraphs).join(' ');
    expect(text).toContain('70 × (weight in kg)^0.75');
    expect(text).toContain('3.0 for the last 21 days');
    expect(FEED_HUB.questions[0].question).toBe('How much food should I feed my dog?');
    expect(FEED_HUB.sources.map(({ url }) => url)).toContain(FEED_SOURCES.wsava.url);
  });
});
