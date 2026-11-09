import { describe, expect, it } from 'vitest';
import { aspcaOf, listingOf } from './plants/aspca.ts';
import { ROUTES } from './routes.ts';
import {
  CATS_HUB,
  DOGS_HUB,
  PLANT_CALL,
  PLANT_PAGES,
  PLANTS,
  plantPageOf,
  plantPathOf,
  SAFE_HUB,
  verdictOf,
} from './toxic-plants.ts';

const plant = (id: string) => {
  const found = PLANTS.find((each) => each.id === id);
  if (found === undefined) throw new Error(`no plant ${id}`);
  return found;
};
const page = (id: string) => plantPageOf(plantPathOf(plant(id)));

/** The six-word shingles of a text, as the content audit counts shared text. */
const shingles = (text: string): Set<string> => {
  const words = text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’.,/×-]*/gu) ?? [];
  return new Set(words.slice(0, -5).map((_, index) => words.slice(index, index + 6).join(' ')));
};

const prose = (id: string): string => {
  const { h1, lead, table, sections, questions, alternatives } = page(id);
  return [
    h1,
    lead,
    table.heading,
    ...table.paragraphs,
    ...table.columns,
    ...table.rows.flat(),
    ...sections.flatMap(({ heading, paragraphs }) => [heading, ...paragraphs]),
    ...alternatives.map(({ label }) => label),
    ...questions.flatMap(({ question, answer }) => [question, answer]),
  ].join(' ');
};

describe('the plants', () => {
  it('are each listed once, the most-searched among them', () => {
    expect(new Set(PLANTS.map(({ id }) => id)).size).toBe(PLANTS.length);
    expect(PLANTS.length).toBeGreaterThanOrEqual(25);
    for (const id of ['lilies', 'tulips', 'pothos', 'snake-plants', 'monstera', 'spider-plants'])
      expect(PLANTS.map((each) => each.id)).toContain(id);
  });

  it('take every verdict from an ASPCA entry, never from the page’s own words', () => {
    for (const each of PLANTS) {
      for (const slug of [...each.entries, ...each.alternatives]) expect(() => aspcaOf(slug)).not.toThrow();
      const main = aspcaOf(each.entries[0] ?? '');
      const verdict = verdictOf(each);
      expect(verdict === 'both' || verdict === 'cats', each.id).toBe(
        listingOf(main, 'cats') === 'toxic',
      );
      expect(verdict === 'both' || verdict === 'dogs', each.id).toBe(
        listingOf(main, 'dogs') === 'toxic',
      );
    }
    expect(verdictOf(plant('tulips'))).toBe('both');
    expect(verdictOf(plant('lilies'))).toBe('cats');
    expect(verdictOf(plant('spider-plants'))).toBe('neither');
  });

  it('offer as alternatives only plants the ASPCA lists non-toxic to cats and dogs', () => {
    for (const each of PLANTS) {
      expect(each.alternatives.length, each.id).toBeGreaterThanOrEqual(2);
      for (const slug of each.alternatives) {
        expect(listingOf(aspcaOf(slug), 'cats'), `${each.id}: ${slug}`).toBe('non-toxic');
        expect(listingOf(aspcaOf(slug), 'dogs'), `${each.id}: ${slug}`).toBe('non-toxic');
        expect(slug, each.id).not.toBe(each.entries[0]);
      }
    }
  });

  it('say which parts, and why, with the signs, for every plant', () => {
    for (const each of PLANTS) {
      expect(each.parts.length, each.id).toBeGreaterThan(10);
      expect(each.why.length, each.id).toBeGreaterThan(0);
      expect(each.signs.length, each.id).toBeGreaterThan(0);
      expect(each.act.length, each.id).toBeGreaterThan(0);
    }
  });
});

describe('a plant page', () => {
  it('lives at /<is|are>-<plant>-toxic-to-cats-and-dogs, an article route', () => {
    expect(plantPathOf(plant('tulips'))).toBe('/are-tulips-toxic-to-cats-and-dogs');
    expect(plantPathOf(plant('pothos'))).toBe('/is-pothos-toxic-to-cats-and-dogs');
    for (const { path } of PLANT_PAGES)
      expect(ROUTES.find((route) => route.path === path)?.kind, path).toBe('article');
    expect(() => plantPageOf('/are-stones-toxic-to-cats-and-dogs')).toThrow('no plant page');
  });

  it('answers first, in the title and the h1', () => {
    expect(page('tulips').h1).toBe(
      'Are tulips toxic to cats and dogs? Yes: the bulbs are the most toxic part',
    );
    expect(page('lilies').h1).toMatch(/^Are lilies toxic to cats and dogs\? To cats, yes: /);
    expect(page('spider-plants').h1).toMatch(/^Are spider plants toxic to cats and dogs\? No: /);
    expect(page('tulips').title).toMatch(/^Are Tulips Toxic to Cats and Dogs\? Yes: /);
  });

  it('keeps every title and description unique and where a result shows them whole', () => {
    expect(new Set(PLANT_PAGES.map(({ title }) => title)).size).toBe(PLANT_PAGES.length);
    expect(new Set(PLANT_PAGES.map(({ description }) => description)).size).toBe(
      PLANT_PAGES.length,
    );
    for (const { title, description } of [...PLANT_PAGES, CATS_HUB, DOGS_HUB, SAFE_HUB]) {
      expect(title.length, title).toBeLessThanOrEqual(65);
      expect(description.length, description).toBeGreaterThanOrEqual(50);
      expect(description.length, description).toBeLessThanOrEqual(160);
    }
  });

  it('leads with what the ASPCA lists, species by species', () => {
    expect(page('tulips').lead).toContain(
      'The ASPCA Animal Poison Control Center lists the tulip (Tulipa spp.) as toxic to dogs, cats and horses.',
    );
    expect(page('lilies').lead).toContain('as toxic to cats, and non-toxic to dogs and horses.');
  });

  it('copies each ASPCA entry into its table, word for word', () => {
    const { table } = page('tulips');
    expect(table.columns).toEqual([
      'Plant',
      'Scientific name',
      'Cats',
      'Dogs',
      'Horses',
      'Toxic principle',
      'Clinical signs (ASPCA)',
    ]);
    expect(table.rows[0]).toEqual([
      'Tulip',
      'Tulipa spp.',
      'Toxic',
      'Toxic',
      'Toxic',
      'Tulipalin A and B',
      'Vomiting, depression, diarrhea, hypersalivation. Highest concentration of toxin in bulb.',
    ]);
    expect(page('lilies').table.rows.map(([name]) => name)).toContain('Peace Lily');
    expect(page('catnip').table.rows[0]?.[3]).toBe('Not listed');
  });

  it('puts both poison lines on every page with a toxic entry, and only there', () => {
    expect(PLANT_CALL).toContain('(888) 426-4435');
    expect(PLANT_CALL).toContain('(855) 764-7661');
    for (const each of PLANT_PAGES) {
      const toxic = plant(each.id).entries.some((slug) =>
        (['cats', 'dogs'] as const).some((species) => listingOf(aspcaOf(slug), species) === 'toxic'),
      );
      expect(each.callNow, each.path).toBe(toxic);
    }
    expect(page('spider-plants').callNow).toBe(false);
  });

  it('answers the cat and the dog question in the FAQ from the ASPCA entry', () => {
    const questions = page('lilies').questions;
    expect(questions[0]?.question).toBe('Are lilies toxic to cats?');
    expect(questions[0]?.answer).toMatch(/^Yes\. /);
    expect(questions[1]?.question).toBe('Are lilies toxic to dogs?');
    expect(questions[1]?.answer).toMatch(/^No\. /);
    expect(page('catnip').questions[1]?.answer).toMatch(/^The ASPCA does not list/);
  });

  it('cites its ASPCA entries, each source once, and links the hubs', () => {
    for (const each of PAGES_WITH_URLS()) {
      expect(each.urls[0], each.path).toMatch(/^https:\/\/www\.aspca\.org\/pet-care\/aspca-poison-control\/toxic-and-non-toxic-plants\//);
      expect(new Set(each.urls).size, each.path).toBe(each.urls.length);
    }
    for (const each of PLANT_PAGES) {
      const hrefs = each.links.map(({ href }) => href);
      expect(hrefs, each.path).toContain('/plants-toxic-to-cats');
      expect(hrefs, each.path).toContain('/plants-toxic-to-dogs');
      expect(hrefs, each.path).toContain('/pet-safe-houseplants');
      for (const { href } of each.related) expect(href).not.toBe(each.path);
    }
  });

  it('links an alternative to its own page where it has one, else to the ASPCA entry', () => {
    for (const each of PLANT_PAGES)
      for (const { href } of each.alternatives)
        expect(href, each.path).toMatch(/^(\/(is|are)-[a-z-]+-toxic-to-cats-and-dogs|https:\/\/www\.aspca\.org\/)/);
  });

  // the content audit flags two pages whose six-word shingles overlap by half or more
  it('are no near-duplicates of one another', () => {
    const sets = PLANTS.map(({ id }) => [id, shingles(prose(id))] as const);
    for (const [i, [a, first]] of sets.entries())
      for (const [j, [b, second]] of sets.entries()) {
        if (j <= i) continue;
        const both = [...first].filter((each) => second.has(each)).length;
        expect(both / new Set([...first, ...second]).size, `${a} and ${b}`).toBeLessThan(0.3);
      }
  });
});

const PAGES_WITH_URLS = () =>
  PLANT_PAGES.map(({ path, sources }) => ({ path, urls: sources.map(({ url }) => url) }));

describe('the hubs', () => {
  it('live at their addresses as article routes', () => {
    for (const hub of [CATS_HUB, DOGS_HUB, SAFE_HUB])
      expect(ROUTES.find((route) => route.path === hub.path)?.kind, hub.path).toBe('article');
  });

  it('list every plant page once, by its verdict for the species', () => {
    for (const hub of [CATS_HUB, DOGS_HUB]) {
      const listed = hub.groups.flatMap(({ rows }) => rows.map(({ href }) => href));
      expect([...listed].sort(), hub.path).toEqual(PLANT_PAGES.map(({ path }) => path).sort());
    }
    expect(CATS_HUB.groups[0]?.rows.map(({ name }) => name)).toContain('Lilies');
    const dogsSafe = DOGS_HUB.groups.find(({ id }) => id === 'cats-only');
    expect(dogsSafe?.rows.map(({ name }) => name)).toContain('Lilies');
  });

  it('give the cat hub the whole sourced table, one row per plant', () => {
    expect(CATS_HUB.table.rows).toHaveLength(PLANTS.length);
    expect(CATS_HUB.table.columns).toContain('Toxic principle');
    expect(CATS_HUB.table.columns).toContain('Which parts');
    const tulip = CATS_HUB.table.rows.find(([name]) => name === 'Tulips');
    expect(tulip?.[3]).toBe('Toxic');
  });

  it('list on the safe hub only ASPCA entries non-toxic to cats and dogs', () => {
    expect(SAFE_HUB.rows.length).toBeGreaterThanOrEqual(15);
    for (const { slug } of SAFE_HUB.rows) {
      expect(listingOf(aspcaOf(slug), 'cats'), slug).toBe('non-toxic');
      expect(listingOf(aspcaOf(slug), 'dogs'), slug).toBe('non-toxic');
    }
    expect(SAFE_HUB.rows.map(({ name }) => name)).toContain('Spider Plant');
  });
});
