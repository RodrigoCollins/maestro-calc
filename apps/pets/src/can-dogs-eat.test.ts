import { describe, expect, it } from 'vitest';
import {
  FOOD_HUB,
  FOOD_PAGES,
  FOODS,
  foodPageOf,
  foodPathOf,
  FOOD_CALL,
  VERDICT_COPY,
} from './can-dogs-eat.ts';
import { ROUTES } from './routes.ts';

const page = (id: string) => foodPageOf(foodPathOf(id));
const sectionText = (id: string, section: string): string =>
  page(id)
    .sections.find((each) => each.id === section)
    ?.paragraphs.join(' ') ?? '';

/** The six-word shingles of a text, as the content audit counts shared text. */
const shingles = (text: string): Set<string> => {
  const words = text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’.,/×-]*/gu) ?? [];
  return new Set(words.slice(0, -5).map((_, index) => words.slice(index, index + 6).join(' ')));
};

const prose = (id: string): string => {
  const { h1, lead, sections, table, sizeGuide, questions } = page(id);
  return [
    h1,
    lead,
    ...sections.flatMap(({ heading, paragraphs }) => [heading, ...paragraphs]),
    ...(table === undefined
      ? []
      : [table.heading, ...table.paragraphs, ...table.columns, ...table.rows.flat()]),
    ...(sizeGuide === undefined
      ? []
      : [sizeGuide.heading, sizeGuide.note, ...sizeGuide.rows.flat()]),
    ...questions.flatMap(({ question, answer }) => [question, answer]),
  ].join(' ');
};

describe('the foods', () => {
  it('are the 41 most-searched foods, each once', () => {
    expect(FOODS).toHaveLength(41);
    expect(new Set(FOODS.map(({ id }) => id)).size).toBe(41);
    for (const id of [
      'strawberries',
      'bananas',
      'grapes',
      'raisins',
      'chocolate',
      'xylitol-gum',
      'macadamia-nuts',
      'bell-peppers',
      'zucchini',
      'peanut-butter',
      'sweet-potatoes',
    ])
      expect(FOODS.map((food) => food.id)).toContain(id);
  });

  it('give each verdict its sources, the toxic ones at least three', () => {
    for (const food of FOODS) {
      expect(food.sources.length, food.id).toBeGreaterThanOrEqual(2);
      if (food.verdict === 'toxic') expect(food.sources.length, food.id).toBeGreaterThanOrEqual(3);
      for (const { url } of food.sources) expect(url, food.id).toMatch(/^https:\/\//);
    }
  });

  it('call grapes, raisins, onions, garlic, chocolate, macadamia nuts and xylitol toxic', () => {
    expect(
      FOODS.filter(({ verdict }) => verdict === 'toxic')
        .map(({ id }) => id)
        .sort(),
    ).toEqual(
      [
        'chocolate',
        'garlic',
        'grapes',
        'macadamia-nuts',
        'onions',
        'raisins',
        'xylitol-gum',
      ].sort(),
    );
  });

  it('hold the hand-written comparisons to the data', () => {
    // cucumber, 15 kcal per 100 g, is the lightest food with a USDA record
    const kcal = FOODS.flatMap(({ id, usda }) =>
      usda === undefined ? [] : [[id, usda.kcalPer100g] as const],
    );
    const lightest = [...kcal].sort((a, b) => a[1] - b[1])[0];
    expect(lightest).toEqual(['cucumber', 15]);
    expect(sectionText('cucumber', 'why')).toContain('the lightest of all the foods');
    // a USDA mini box of raisins, 14 g, is 27 raisins of 0.52 g: past Merck's line of 8 at 80 lb
    expect(Math.round(14 / 0.52)).toBe(27);
    expect(sectionText('raisins', 'why')).toContain('more concentrated');
    // PetMD's 50 g of garlic is about 17 USDA cloves of 3 g
    expect(Math.round(50 / 3)).toBe(17);
    expect(sectionText('garlic', 'disagree')).toContain('about 17 USDA cloves');
  });

  it('name the UK and Australian spellings on their foods', () => {
    const alternates = (id: string) =>
      FOODS.find((food) => food.id === id)?.alternates.map(({ name }) => name);
    expect(alternates('bell-peppers')).toContain('capsicum');
    expect(alternates('zucchini')).toContain('courgette');
    expect(alternates('shrimp')).toContain('prawns');
    expect(alternates('raisins')).toContain('sultanas');
  });
});

describe('a food page', () => {
  it('lives at /can-dogs-eat-<food>, an article route', () => {
    expect(foodPathOf('grapes')).toBe('/can-dogs-eat-grapes');
    for (const { path } of FOOD_PAGES)
      expect(ROUTES.find((route) => route.path === path)?.kind, path).toBe('article');
    expect(() => foodPageOf('/can-dogs-eat-stones')).toThrow('no food page');
  });

  it('answers first, in the title and the h1', () => {
    expect(page('grapes').title).toBe(
      'Can Dogs Eat Grapes? No: Grapes Are Toxic to Dogs | Bowl Figures',
    );
    expect(page('grapes').h1).toBe('Can dogs eat grapes? No: grapes are toxic to dogs');
    expect(page('strawberries').h1).toBe(
      'Can dogs eat strawberries? Yes: strawberries are safe as a treat',
    );
    expect(page('bacon').h1).toMatch(/^Can dogs eat bacon\? Best not: /);
    expect(page('cheese').h1).toMatch(/^Can dogs eat cheese\? Yes, a little: /);
  });

  it('keeps every title and description unique and where a result shows them whole', () => {
    expect(new Set(FOOD_PAGES.map(({ title }) => title)).size).toBe(FOOD_PAGES.length);
    expect(new Set(FOOD_PAGES.map(({ description }) => description)).size).toBe(FOOD_PAGES.length);
    for (const { title, description } of [...FOOD_PAGES, FOOD_HUB]) {
      expect(title.length, title).toBeLessThanOrEqual(65);
      expect(description.length, description).toBeGreaterThanOrEqual(50);
      expect(description.length, description).toBeLessThanOrEqual(160);
    }
  });

  // 10 lb: 70 × 4.5359237^0.75 = 217.57 kcal resting, × 1.6 = 348.11, a tenth = 34.81 kcal;
  // at 32 kcal per 100 g that is 108.78 g, 9.07 strawberries of 12 g.
  it('works the treat budget of a safe food into grams and pieces at four weights', () => {
    const { table } = page('strawberries');
    expect(table?.columns).toEqual([
      'Dog’s weight',
      'Treat budget (kcal a day)',
      'Strawberries for the whole budget',
      'In medium strawberries',
    ]);
    expect(table?.rows).toEqual([
      ['10 lb', '35', '109 g', '9.1'],
      ['25 lb', '69', '216 g', '18'],
      ['50 lb', '116', '364 g', '30'],
      ['80 lb', '166', '517 g', '43'],
    ]);
  });

  // broccoli at 34 kcal per 100 g; a quarter of 348.11 kcal is 87.03 kcal, 256 g
  it('adds the toxic ceiling of a source as a column', () => {
    const { table } = page('broccoli');
    expect(table?.columns.at(-1)).toBe('AKC’s toxic line: 25% of the day');
    expect(table?.rows[0]?.at(-1)).toBe('256 g');
  });

  // a 25 lb dog's budget is 69.21 kcal; a baked slice of 8.1 g at 548 kcal per 100 g is 44.39 kcal
  it('measures one piece of an avoid food against the budget, with its sodium', () => {
    const { table, lead } = page('bacon');
    expect(table?.columns).toEqual([
      'Dog’s weight',
      'Treat budget (kcal a day)',
      'One slice (44 kcal) is',
    ]);
    expect(table?.rows[1]).toEqual(['25 lb', '69', '64% of it']);
    expect(lead).toContain('One slice has 44 kcal, 64% of a 25 lb dog’s daily treat budget');
    expect(lead).toContain('178 mg of sodium');
  });

  // one grape per 10 lb (Merck), grapes of 4.9 g; grams to the tenth below 10 g, whole above
  it('counts Merck’s grape line at each weight', () => {
    expect(page('grapes').table?.rows).toEqual([
      ['10 lb', '1 grape (4.9 g)'],
      ['25 lb', '2.5 grapes (12 g)'],
      ['50 lb', '5 grapes (25 g)'],
      ['80 lb', '8 grapes (39 g)'],
    ]);
  });

  // onion: 5 g/kg × 4.5359 kg = 22.7 g (0.2 of a 110 g onion); 15 g/kg × 36.287 kg = 544 g (4.9 onions)
  it('works each source’s onion line in grams and in medium onions', () => {
    const rows = page('onions').table?.rows;
    expect(rows?.[0]).toEqual([
      '10 lb',
      '23 g, about 0.2 medium onions',
      '68 g, about 0.6 medium onions',
    ]);
    expect(rows?.[3]?.[2]).toBe('544 g, about 4.9 medium onions');
  });

  // 0.1 g/kg × 4.5359 kg = 0.45 g of xylitol: 0.45 pieces at 1 g, 2.06 at 0.22 g
  it('turns the xylitol lines into pieces of gum, strong to light', () => {
    const rows = page('xylitol-gum').table?.rows;
    expect(rows?.[0]?.[1]).toBe('0.5 g of xylitol: 0.5 to 2.1 pieces of gum');
    expect(rows?.[3]?.[2]).toBe('18 g of xylitol: 18 to 82 pieces of gum');
  });

  // 2.4 g/kg × 4.5359 kg = 10.9 g, 4.2 nuts of 2.58 g; milk chocolate 20 / 2.3 g/kg: 39.4 g, 1.4 oz
  it('works the macadamia and chocolate lines', () => {
    expect(page('macadamia-nuts').table?.rows[0]).toEqual(['10 lb', '11 g, about 4.2 nuts']);
    expect(page('chocolate').table?.rows[0]?.[1]).toBe('39 g, about 1.4 ounces');
    expect(page('chocolate').table?.columns).toHaveLength(4);
  });

  it('counts the avocado ceiling in teaspoons', () => {
    expect(page('avocado').table?.rows.map((row) => row[1])).toEqual([
      '1 teaspoon',
      '2.5 teaspoons',
      '5 teaspoons',
      '8 teaspoons',
    ]);
  });

  it('puts the poison line on every toxic page, and only there', () => {
    expect(FOOD_CALL).toContain('(888) 426-4435');
    expect(FOOD_CALL).toContain('not a substitute for your veterinarian');
    for (const each of FOOD_PAGES) expect(each.callNow, each.path).toBe(each.verdict === 'toxic');
  });

  it('leads with a figure of the food itself', () => {
    expect(page('strawberries').lead).toContain(
      'For a 25 lb dog, the whole day’s treat budget (69 kcal) is about 216 g',
    );
    expect(page('macadamia-nuts').lead).toContain('For a 25 lb dog, ');
    expect(page('grapes').lead).toContain('2.5 grapes');
  });

  it('answers the other names in the FAQ', () => {
    const questions = page('bell-peppers').questions.map(({ question }) => question);
    expect(questions).toContain('Can dogs eat capsicum?');
    expect(page('raisins').questions.map(({ question }) => question)).toContain(
      'Can dogs eat sultanas?',
    );
  });

  it('copies the source’s serving table by size, with its source', () => {
    const guide = page('blueberries').sizeGuide;
    expect(guide?.heading).toBe('PetMD’s serving guide by dog size');
    expect(guide?.rows[0]).toEqual(['Extra-small (2 to 10 lb)', '1 to 2 blueberries']);
  });

  it('cites the treat rule and USDA where it works the budget, and the poison line where toxic', () => {
    const urls = (id: string) => page(id).sources.map(({ url }) => url);
    expect(urls('strawberries')).toContain('https://vcahospitals.com/know-your-pet/dog-treats');
    expect(urls('strawberries')).toContain(
      'https://fdc.nal.usda.gov/food-details/167762/nutrients',
    );
    expect(urls('grapes')).toContain('https://www.aspca.org/pet-care/animal-poison-control');
    for (const each of FOOD_PAGES) {
      const list = each.sources.map(({ url }) => url);
      expect(new Set(list).size, each.path).toBe(list.length);
    }
  });

  it('links the chocolate calculator from the chocolate page, and the hub and kin from every page', () => {
    expect(page('chocolate').links.map(({ href }) => href)).toContain(
      '/dog-chocolate-toxicity-calculator',
    );
    expect(page('strawberries').links.map(({ href }) => href)).toContain('/dog-food-calculator');
    for (const each of FOOD_PAGES) {
      expect(
        each.links.map(({ href }) => href),
        each.path,
      ).toContain('/can-dogs-eat');
      expect(each.related.length, each.path).toBeGreaterThan(0);
      for (const { href } of each.related) expect(href).not.toBe(each.path);
    }
  });

  // the content audit flags two pages whose six-word shingles overlap by half or more
  it('are no near-duplicates of one another', () => {
    const sets = FOODS.map(({ id }) => [id, shingles(prose(id))] as const);
    for (const [i, [a, first]] of sets.entries())
      for (const [j, [b, second]] of sets.entries()) {
        if (j <= i) continue;
        const both = [...first].filter((each) => second.has(each)).length;
        expect(both / new Set([...first, ...second]).size, `${a} and ${b}`).toBeLessThan(0.3);
      }
  });
});

describe('the hub', () => {
  it('lives at /can-dogs-eat and lists every food once, grouped by verdict, worst first', () => {
    expect(FOOD_HUB.path).toBe('/can-dogs-eat');
    expect(FOOD_HUB.plants.href).toBe('/plants-toxic-to-dogs');
    expect(FOOD_HUB.groups.map(({ verdict }) => verdict)).toEqual([
      'toxic',
      'avoid',
      'moderation',
      'safe',
    ]);
    const listed = FOOD_HUB.groups.flatMap(({ rows }) => rows.map(({ href }) => href));
    expect([...listed].sort()).toEqual(FOOD_PAGES.map(({ path }) => path).sort());
    expect(FOOD_HUB.groups[0]?.rows.map(({ name }) => name)).toContain('Grapes');
  });

  it('names each verdict the same way the pages do', () => {
    expect(VERDICT_COPY.toxic.word).toBe('No');
    expect(VERDICT_COPY.safe.word).toBe('Yes');
    for (const group of FOOD_HUB.groups)
      expect(group.heading).toBe(VERDICT_COPY[group.verdict].heading);
  });

  it('works the treat budget at the four weights', () => {
    expect(FOOD_HUB.budget).toEqual([
      ['10 lb', '348', '35'],
      ['25 lb', '692', '69'],
      ['50 lb', '1,164', '116'],
      ['80 lb', '1,656', '166'],
    ]);
  });
});
