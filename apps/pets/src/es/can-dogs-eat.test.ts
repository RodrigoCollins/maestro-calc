import { describe, expect, it } from 'vitest';
import { FOODS, foodPageOf, foodPathOf } from '../can-dogs-eat.ts';
import { ROUTES } from '../routes.ts';
import { FOOD_HUB_ES, FOOD_PAGES_ES, FOODS_ES, foodPageEsOf, KILOS } from './can-dogs-eat.ts';

const pageOf = (id: string) => {
  const page = FOOD_PAGES_ES.find((candidate) => candidate.id === id);
  if (page === undefined) throw new Error(`no Spanish page ${id}`);
  return page;
};

describe('the Spanish food pages', () => {
  it('are exactly the Spanish twins of the route table, each at its address', () => {
    const routes = ROUTES.filter(({ id, es }) => id.startsWith('food-') && es !== undefined);
    expect(FOOD_PAGES_ES.map(({ id, path }) => [`food-${id}`, path])).toEqual(
      routes.map(({ id, es }) => [id, es]),
    );
    expect(foodPageEsOf('/es/los-perros-pueden-comer-uvas').id).toBe('grapes');
    expect(() => foodPageEsOf('/es/nowhere')).toThrow('no Spanish food page /es/nowhere');
  });

  it('keep the verdict of the English twin, and pair each page with it', () => {
    for (const page of FOOD_PAGES_ES) {
      const english = foodPageOf(foodPathOf(page.id));
      expect(page.verdict, page.id).toBe(english.verdict);
      expect(page.twin, page.id).toBe(english.path);
    }
    expect(FOODS_ES.every(({ id }) => FOODS.some((food) => food.id === id))).toBe(true);
  });

  it('answer first in the searched word order: the question, then the verdict', () => {
    expect(pageOf('strawberries').title).toMatch(/^¿Los perros pueden comer fresas\? Sí/);
    expect(pageOf('grapes').h1).toMatch(/^¿Los perros pueden comer uvas\? No – /);
    for (const page of FOOD_PAGES_ES) {
      expect(page.title, page.id).toMatch(/^¿Los perros pueden comer /);
      expect(page.lead, page.id).toMatch(/^(No|Sí|Mejor evitarlo)/);
    }
  });

  it('fit a search result: a title of at most 65 characters, a description of 50 to 160', () => {
    for (const { id, title, description } of FOOD_PAGES_ES) {
      expect(title.length, id).toBeLessThanOrEqual(65);
      expect(description.length, id).toBeGreaterThanOrEqual(50);
      expect(description.length, id).toBeLessThanOrEqual(160);
    }
    const titles = FOOD_PAGES_ES.map(({ title }) => title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('work Merck’s grape line at 5, 10, 20 and 35 kg, with a decimal comma', () => {
    expect(KILOS).toEqual([5, 10, 20, 35]);
    // one grape per 10 lb (4.5359237 kg) of 4.9 g: 5 kg is 1.10 grapes, 5.4 g
    expect(pageOf('grapes').table?.rows).toEqual([
      ['5 kg', '1,1 uvas (5,4 g)'],
      ['10 kg', '2,2 uvas (11 g)'],
      ['20 kg', '4,4 uvas (22 g)'],
      ['35 kg', '7,7 uvas (38 g)'],
    ]);
  });

  it('work the treat budget in kilocalories and grams at each weight', () => {
    // 10 kg neutered: 70 x 10^0.75 x 1.6 = 629.8 kcal, a tenth is 63 kcal; at 32 kcal per 100 g
    // that is 196.8 g, 16.4 strawberries of 12 g
    expect(pageOf('strawberries').table?.rows[1]).toEqual(['10 kg', '63', '197 g', '16']);
    expect(pageOf('strawberries').lead).toContain('197 g de fresas');
  });

  it('cite every source of the English twin and the USDA record', () => {
    for (const page of FOOD_PAGES_ES) {
      const english = foodPageOf(foodPathOf(page.id));
      const urls = new Set(page.sources.map(({ url }) => url));
      for (const { url } of english.sources) expect(urls.has(url), `${page.id} ${url}`).toBe(true);
    }
  });

  it('cite a Spanish-language veterinary source on every toxic food page', () => {
    for (const page of FOOD_PAGES_ES.filter(({ verdict }) => verdict === 'toxic'))
      expect(
        page.sources.some(({ url }) => url.startsWith('https://www.msdvetmanual.com/es/')),
        page.id,
      ).toBe(true);
  });

  it('link the hub and the other Spanish pages of the same verdict, never an English food page', () => {
    for (const page of FOOD_PAGES_ES) {
      expect(
        page.links.map(({ href }) => href),
        page.id,
      ).toContain('/es/que-frutas-pueden-comer-los-perros');
      for (const { href } of page.related)
        expect(href, page.id).toMatch(/^\/es\/los-perros-pueden-comer-/);
    }
  });

  it('send a reader with a toxic food to a veterinarian at once', () => {
    for (const page of FOOD_PAGES_ES) expect(page.callNow, page.id).toBe(page.verdict === 'toxic');
  });

  it('do not repeat a lead or a summary between two Spanish pages', () => {
    const leads = FOOD_PAGES_ES.map(({ lead }) => lead);
    expect(new Set(leads).size).toBe(leads.length);
    const summaries = FOODS_ES.map(({ summary }) => summary);
    expect(new Set(summaries).size).toBe(summaries.length);
  });

  it('write no voseo and no vosotros', () => {
    const text = JSON.stringify(FOODS_ES);
    expect(text).not.toMatch(/\b(vosotros|vuestro|vuestra|podéis|tenés|podés|llamá|vos)\b/i);
  });
});

describe('the Spanish food hub', () => {
  it('answers the fruit question first, then lists every other food once, worst first', () => {
    expect(FOOD_HUB_ES.title).toMatch(/^¿Qué frutas pueden comer los perros\?/);
    const fruits = FOOD_HUB_ES.fruits.rows.map(({ href }) => href);
    const others = FOOD_HUB_ES.groups.flatMap(({ rows }) => rows.map(({ href }) => href));
    expect([...fruits, ...others].sort()).toEqual(FOOD_PAGES_ES.map(({ path }) => path).sort());
    expect(fruits).toContain('/es/los-perros-pueden-comer-fresas');
    expect(fruits).toContain('/es/los-perros-pueden-comer-aguacate');
    expect(FOOD_HUB_ES.groups.map(({ verdict }) => verdict)).toEqual([
      'toxic',
      'avoid',
      'moderation',
      'safe',
    ]);
  });

  it('works the 10 % treat budget at the four weights', () => {
    expect(FOOD_HUB_ES.budget[1]).toEqual(['10 kg', '630', '63']);
  });
});
