import { describe, expect, it } from 'vitest';
import { FOODS, foodPageOf, foodPathOf } from '../can-dogs-eat.ts';
import { ROUTES } from '../routes.ts';
import {
  FOOD_HUB_FR,
  FOOD_PAGES_FR,
  FOODS_FR,
  foodPageFrOf,
  KILOS,
  ofSome,
} from './can-dogs-eat.ts';

const pageOf = (id: string) => {
  const page = FOOD_PAGES_FR.find((candidate) => candidate.id === id);
  if (page === undefined) throw new Error(`no French page ${id}`);
  return page;
};

describe('ofSome', () => {
  it('turns the partitive into the de that follows an amount', () => {
    expect(ofSome('des fraises')).toBe('de fraises');
    expect(ofSome('du raisin')).toBe('de raisin');
    expect(ofSome('de la banane')).toBe('de banane');
    expect(ofSome('de l’ananas')).toBe('d’ananas');
    expect(ofSome('des œufs')).toBe('d’œufs');
  });
});

describe('the French food pages', () => {
  it('are exactly the French twins of the route table, each at its address', () => {
    const routes = ROUTES.filter(({ id, fr }) => id.startsWith('food-') && fr !== undefined);
    expect(FOOD_PAGES_FR.map(({ id, path }) => [`food-${id}`, path])).toEqual(
      routes.map(({ id, fr }) => [id, fr]),
    );
    expect(foodPageFrOf('/fr/chien-peut-il-manger-du-raisin').id).toBe('grapes');
    expect(() => foodPageFrOf('/fr/nowhere')).toThrow('no French food page /fr/nowhere');
  });

  it('keep the verdict of the English twin, and pair each page with it', () => {
    for (const page of FOOD_PAGES_FR) {
      const english = foodPageOf(foodPathOf(page.id));
      expect(page.verdict, page.id).toBe(english.verdict);
      expect(page.twin, page.id).toBe(english.path);
    }
    expect(FOODS_FR.every(({ id }) => FOODS.some((food) => food.id === id))).toBe(true);
  });

  it('answer first: the question, the verdict word and the answer in the h1', () => {
    expect(pageOf('grapes').h1).toMatch(/^Mon chien peut-il manger du raisin \? Non – /);
    for (const page of FOOD_PAGES_FR)
      expect(page.lead, page.id).toMatch(/^(Non|Oui|Mieux vaut éviter)/);
  });

  it('fit a search result: a title of at most 65 characters, a description of 50 to 160', () => {
    for (const { id, title, description } of FOOD_PAGES_FR) {
      expect(title.length, id).toBeLessThanOrEqual(65);
      expect(description.length, id).toBeGreaterThanOrEqual(50);
      expect(description.length, id).toBeLessThanOrEqual(160);
    }
    const titles = FOOD_PAGES_FR.map(({ title }) => title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('work Merck’s grape line at 5, 10, 20 and 35 kg, the French way', () => {
    expect(KILOS).toEqual([5, 10, 20, 35]);
    // one grape per 10 lb (4.5359237 kg) of 4.9 g: 5 kg is 1.10 grapes, 5.4 g
    expect(pageOf('grapes').table?.rows).toEqual([
      // French keeps the singular below 2
      ['5 kg', '1,1 grain de raisin (5,4 g)'],
      ['10 kg', '2,2 grains de raisin (11 g)'],
      ['20 kg', '4,4 grains de raisin (22 g)'],
      ['35 kg', '7,7 grains de raisin (38 g)'],
    ]);
  });

  it('work the treat budget in kilocalories and grams at each weight', () => {
    // 10 kg neutered: 70 x 10^0.75 x 1.6 = 629.8 kcal, a tenth is 63 kcal; at 32 kcal per 100 g
    // that is 196.8 g, 16.4 strawberries of 12 g
    expect(pageOf('strawberries').table?.rows[1]).toEqual(['10 kg', '63', '197 g', '16']);
  });

  it('cite every source of the English twin and the USDA record', () => {
    for (const page of FOOD_PAGES_FR) {
      const english = foodPageOf(foodPathOf(page.id));
      const urls = new Set(page.sources.map(({ url }) => url));
      for (const { url } of english.sources) expect(urls.has(url), `${page.id} ${url}`).toBe(true);
    }
  });

  it('link the hub and the other French pages of the same verdict, never an English food page', () => {
    for (const page of FOOD_PAGES_FR) {
      expect(
        page.links.map(({ href }) => href),
        page.id,
      ).toContain('/fr/que-peut-manger-un-chien');
      for (const { href } of page.related)
        expect(href, page.id).toMatch(/^\/fr\/chien-peut-il-manger-/);
    }
  });

  it('send a reader with a toxic food to a veterinarian at once', () => {
    for (const page of FOOD_PAGES_FR) expect(page.callNow, page.id).toBe(page.verdict === 'toxic');
  });

  it('do not repeat a lead or a summary between two French pages', () => {
    const leads = FOOD_PAGES_FR.map(({ lead }) => lead);
    expect(new Set(leads).size).toBe(leads.length);
  });

  it('name the German-language sources read day only when a page cites one', () => {
    for (const page of FOOD_PAGES_FR) {
      const german = page.sources.some(({ url }) =>
        /vetpharm\.uzh|unibe\.ch|vetmeduni|bundestieraerztekammer|bfr\.bund|toxinfo\.ch\/tiervergiftung$/.test(
          url,
        ),
      );
      expect(page.checkedGerman !== undefined, page.id).toBe(german);
    }
  });
});

describe('the French food hub', () => {
  it('lists every French food page once, grouped worst first', () => {
    const listed = FOOD_HUB_FR.groups.flatMap(({ rows }) => rows.map(({ href }) => href));
    expect([...listed].sort()).toEqual(FOOD_PAGES_FR.map(({ path }) => path).sort());
    expect(FOOD_HUB_FR.groups.map(({ verdict }) => verdict)).toEqual([
      'toxic',
      'avoid',
      'moderation',
      'safe',
    ]);
  });

  it('works the 10 % treat budget at the four weights', () => {
    expect(FOOD_HUB_FR.budget[1]).toEqual(['10 kg', '630', '63']);
  });
});
