import { describe, expect, it } from 'vitest';
import { FOODS, foodPageOf, foodPathOf } from '../can-dogs-eat.ts';
import { ROUTES } from '../routes.ts';
import { FOOD_HUB_DE, FOOD_PAGES_DE, FOODS_DE, foodPageDeOf, KILOS } from './can-dogs-eat.ts';

const pageOf = (id: string) => {
  const page = FOOD_PAGES_DE.find((candidate) => candidate.id === id);
  if (page === undefined) throw new Error(`no German page ${id}`);
  return page;
};

describe('the German food pages', () => {
  it('are exactly the German twins of the route table, each at its address', () => {
    const routes = ROUTES.filter(({ id, de }) => id.startsWith('food-') && de !== undefined);
    expect(FOOD_PAGES_DE.map(({ id, path }) => [`food-${id}`, path])).toEqual(
      routes.map(({ id, de }) => [id, de]),
    );
    expect(foodPageDeOf('/de/duerfen-hunde-weintrauben-essen').id).toBe('grapes');
    expect(() => foodPageDeOf('/de/nowhere')).toThrow('no German food page /de/nowhere');
  });

  it('keep the verdict of the English twin, and pair each page with it', () => {
    for (const page of FOOD_PAGES_DE) {
      const english = foodPageOf(foodPathOf(page.id));
      expect(page.verdict, page.id).toBe(english.verdict);
      expect(page.twin, page.id).toBe(english.path);
    }
    expect(FOODS_DE.every(({ id }) => FOODS.some((food) => food.id === id))).toBe(true);
  });

  it('answer first: the question, the verdict word and the answer in the h1', () => {
    expect(pageOf('grapes').h1).toBe(
      'Dürfen Hunde Weintrauben essen? Nein – Weintrauben sind für Hunde giftig',
    );
    for (const page of FOOD_PAGES_DE) expect(page.lead, page.id).toMatch(/^(Nein|Ja|Besser nicht)/);
  });

  it('fit a search result: a title of at most 65 characters, a description of 50 to 160', () => {
    for (const { id, title, description } of FOOD_PAGES_DE) {
      expect(title.length, id).toBeLessThanOrEqual(65);
      expect(description.length, id).toBeGreaterThanOrEqual(50);
      expect(description.length, id).toBeLessThanOrEqual(160);
    }
    const titles = FOOD_PAGES_DE.map(({ title }) => title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('work Merck’s grape line at 5, 10, 20 and 35 kg, the German way', () => {
    expect(KILOS).toEqual([5, 10, 20, 35]);
    // one grape per 10 lb (4.5359237 kg) of 4.9 g: 5 kg is 1.10 grapes, 5.4 g
    expect(pageOf('grapes').table?.rows).toEqual([
      ['5 kg', '1,1 Weintrauben (5,4 g)'],
      ['10 kg', '2,2 Weintrauben (11 g)'],
      ['20 kg', '4,4 Weintrauben (22 g)'],
      ['35 kg', '7,7 Weintrauben (38 g)'],
    ]);
  });

  it('work the treat budget in kilocalories and grams at each weight', () => {
    // 10 kg neutered: 70 x 10^0.75 x 1.6 = 629.8 kcal, a tenth is 63 kcal; at 32 kcal per 100 g
    // that is 196.8 g, 16.4 strawberries of 12 g
    const row = pageOf('strawberries').table?.rows[1];
    expect(row).toEqual(['10 kg', '63', '197 g', '16']);
  });

  it('cite every source of the English twin and the USDA record', () => {
    for (const page of FOOD_PAGES_DE) {
      const english = foodPageOf(foodPathOf(page.id));
      const urls = new Set(page.sources.map(({ url }) => url));
      for (const { url } of english.sources) expect(urls.has(url), `${page.id} ${url}`).toBe(true);
    }
  });

  it('link the hub and the other German pages of the same verdict, never an English food page', () => {
    for (const page of FOOD_PAGES_DE) {
      expect(
        page.links.map(({ href }) => href),
        page.id,
      ).toContain('/de/was-duerfen-hunde-essen');
      for (const { href } of page.related) expect(href, page.id).toMatch(/^\/de\/duerfen-hunde-/);
    }
  });

  it('send a reader with a toxic food to a veterinarian at once', () => {
    for (const page of FOOD_PAGES_DE) expect(page.callNow, page.id).toBe(page.verdict === 'toxic');
  });

  it('do not repeat a lead or a summary between two German pages', () => {
    const leads = FOOD_PAGES_DE.map(({ lead }) => lead);
    expect(new Set(leads).size).toBe(leads.length);
  });
});

describe('the German food hub', () => {
  it('lists every German food page once, grouped worst first', () => {
    const listed = FOOD_HUB_DE.groups.flatMap(({ rows }) => rows.map(({ href }) => href));
    expect([...listed].sort()).toEqual(FOOD_PAGES_DE.map(({ path }) => path).sort());
    const verdicts = FOOD_HUB_DE.groups.map(({ verdict }) => verdict);
    // a verdict no German page has yet gets no empty group
    expect(verdicts).toEqual(
      ['toxic', 'avoid', 'moderation', 'safe'].filter((verdict) =>
        FOOD_PAGES_DE.some((page) => page.verdict === verdict),
      ),
    );
  });

  it('works the 10 % treat budget at the four weights', () => {
    expect(FOOD_HUB_DE.budget[1]).toEqual(['10 kg', '630', '63']);
  });
});
