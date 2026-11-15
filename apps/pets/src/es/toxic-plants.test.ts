import { describe, expect, it } from 'vitest';
import { ASPCA_RECORDS } from '../plants/aspca.ts';
import { ROUTES } from '../routes.ts';
import { PLANT_PAGES, PLANTS, plantPageOf, plantPathOf, SAFE_HUB } from '../toxic-plants.ts';
import { ENTRY_NAMES_ES } from './plants/names.ts';
import {
  CATS_HUB_ES,
  DOGS_HUB_ES,
  PLANT_CALL_ES,
  PLANT_PAGES_ES,
  plantPageEsOf,
  PLANTS_ES,
  SAFE_HUB_ES,
} from './toxic-plants.ts';

const pageOf = (id: string) => {
  const page = PLANT_PAGES_ES.find((candidate) => candidate.id === id);
  if (page === undefined) throw new Error(`no Spanish plant page ${id}`);
  return page;
};

const ALL = [...PLANT_PAGES_ES, CATS_HUB_ES, DOGS_HUB_ES, SAFE_HUB_ES];

describe('the Spanish plant pages', () => {
  it('are one per English plant, in the same order', () => {
    expect(PLANTS_ES.map(({ id }) => id)).toEqual(PLANTS.map(({ id }) => id));
  });

  it('are exactly the Spanish twins of the route table, each at its address', () => {
    const routes = ROUTES.filter(({ id, es }) => id.startsWith('plant-') && es !== undefined);
    expect(PLANT_PAGES_ES.map(({ id, path }) => [`plant-${id}`, path])).toEqual(
      routes.map(({ id, es }) => [id, es]),
    );
    expect(plantPageEsOf('/es/nochebuena-es-toxica-para-perros-y-gatos').id).toBe('poinsettias');
    expect(() => plantPageEsOf('/es/nowhere')).toThrow('no Spanish plant page /es/nowhere');
  });

  it('keep the verdict of the English twin, and pair each page with it', () => {
    for (const page of PLANT_PAGES_ES) {
      const english = plantPageOf(page.twin);
      expect(english.id, page.id).toBe(page.id);
      expect(page.verdict, page.id).toBe(english.verdict);
      expect(page.callNow, page.id).toBe(english.callNow);
    }
  });

  it('answer first in the searched word order: the question, then the verdict', () => {
    expect(pageOf('poinsettias').h1).toBe(
      '¿La flor de Nochebuena es tóxica para perros y gatos? Poco: irrita la boca y el estómago',
    );
    const words = {
      both: /^(Sí|Poco):/,
      cats: /^(Para gatos, sí|Poco):/,
      dogs: /^(Para perros, sí|Poco):/,
      neither: /^No:/,
    } as const;
    for (const page of PLANT_PAGES_ES) {
      expect(page.title, page.id).toMatch(
        /^¿(El|La|Los|Las) .+ (es|son) tóxic(o|a|os|as) para perros y gatos\? /,
      );
      expect(page.lead, page.id).toMatch(words[page.verdict]);
      expect(
        page.h1.startsWith(page.title.replace(/ \| Bowl Figures$/, '').split('?')[0] ?? ''),
        page.id,
      ).toBe(true);
    }
  });

  it('name the regional names and the botanical name in the lead', () => {
    expect(pageOf('poinsettias').lead).toContain('flor de Pascua');
    expect(pageOf('poinsettias').lead).toContain('Euphorbia pulcherrima');
    for (const page of PLANT_PAGES_ES) expect(page.lead, page.id).toContain('Otros nombres: ');
  });

  it('fit a search result: a title of at most 65 characters, a description of 50 to 160', () => {
    for (const { path, title, description } of ALL) {
      expect(title.length, path).toBeLessThanOrEqual(65);
      expect(description.length, path).toBeGreaterThanOrEqual(50);
      expect(description.length, path).toBeLessThanOrEqual(160);
    }
    const titles = ALL.map(({ title }) => title);
    expect(new Set(titles).size).toBe(titles.length);
    const descriptions = ALL.map(({ description }) => description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('cite every source of the English twin', () => {
    for (const page of PLANT_PAGES_ES) {
      const urls = new Set(page.sources.map(({ url }) => url));
      for (const { url } of plantPageOf(page.twin).sources)
        expect(urls.has(url), `${page.id} ${url}`).toBe(true);
    }
  });

  it('cite the Spanish edition of the MSD manual on the Christmas plants and the deadliest ones', () => {
    for (const id of ['poinsettias', 'holly', 'mistletoe', 'lilies', 'sago-palms', 'oleander'])
      expect(
        pageOf(id).sources.some(({ url }) => url.startsWith('https://www.msdvetmanual.com/es/')),
        id,
      ).toBe(true);
  });

  it('say when the sources were read, in Spanish', () => {
    expect(pageOf('poinsettias').readOn).toBe(
      'El equipo editorial leyó las fuentes en inglés el 9 de noviembre de 2026 y las fuentes en español el 15 de noviembre de 2026.',
    );
    for (const page of PLANT_PAGES_ES.filter(({ sources }) =>
      sources.every(({ url }) => !url.startsWith('https://www.msdvetmanual.com/es/')),
    ))
      expect(page.readOn, page.id).toBe(
        'El equipo editorial leyó todas las fuentes el 9 de noviembre de 2026.',
      );
  });

  it('table every ASPCA entry of the English twin, with its Spanish name', () => {
    const lilies = pageOf('lilies');
    expect(lilies.table.rows).toHaveLength(plantPageOf(lilies.twin).table.rows.length);
    expect(lilies.table.rows[0]).toEqual([
      'Lirio (azucena)',
      'Lily',
      'Lilium species',
      'Tóxica',
      'No tóxica',
      'No tóxica',
    ]);
    for (const record of ASPCA_RECORDS)
      expect(ENTRY_NAMES_ES[record.slug], record.slug).toBeDefined();
  });

  it('send a reader with a toxic plant to a veterinarian, and name no poison line', () => {
    expect(PLANT_CALL_ES).toContain('veterinario');
    expect(PLANT_CALL_ES).not.toMatch(/\d{3}/);
    for (const page of PLANT_PAGES_ES)
      expect(page.callNow, page.id).toBe(plantPageOf(page.twin).callNow);
  });

  it('link the Spanish hubs and Spanish plant pages only, besides ASPCA entries', () => {
    for (const page of PLANT_PAGES_ES) {
      for (const { href } of [...page.related, ...page.links])
        expect(href, page.id).toMatch(/^\/es\//);
      for (const { href } of page.alternatives)
        expect(href, page.id).toMatch(/^(\/es\/|https:\/\/www\.aspca\.org\/)/);
      expect(page.related.length, page.id).toBeGreaterThan(0);
    }
  });

  it('do not repeat a lead, a summary or a section between two Spanish pages', () => {
    const leads = PLANT_PAGES_ES.map(({ lead }) => lead);
    expect(new Set(leads).size).toBe(leads.length);
    const summaries = PLANTS_ES.map(({ summary }) => summary);
    expect(new Set(summaries).size).toBe(summaries.length);
    const paragraphs = PLANTS_ES.flatMap(({ parts, why, signs, act }) => [
      parts,
      ...why,
      ...signs,
      ...act,
    ]);
    expect(paragraphs.filter((text, index) => paragraphs.indexOf(text) !== index)).toEqual([]);
  });

  it('keep the grade and the disagreement sections of the English twin', () => {
    for (const es of PLANTS_ES) {
      const english = PLANTS.find(({ id }) => id === es.id);
      expect(es.grade === undefined, es.id).toBe(english?.grade === undefined);
      expect(es.disagree === undefined, es.id).toBe(english?.disagree === undefined);
    }
  });

  it('write neutral Spanish in tú: no voseo and no vosotros', () => {
    const text = JSON.stringify(PLANTS_ES);
    expect(text).not.toMatch(
      /\b(vosotros|vuestro|vuestra|podéis|tenés|podés|llamá|fijate|vos|sabés|querés)\b/i,
    );
  });
});

describe('the Spanish plant hubs', () => {
  it('list every Spanish plant page in each species hub, once', () => {
    for (const hub of [CATS_HUB_ES, DOGS_HUB_ES]) {
      const hrefs = hub.groups.flatMap(({ rows }) => rows.map(({ href }) => href));
      expect([...hrefs].sort(), hub.path).toEqual(PLANT_PAGES_ES.map(({ path }) => path).sort());
    }
  });

  it('are the twins of the English hubs, at the measured address', () => {
    expect(DOGS_HUB_ES.path).toBe('/es/plantas-toxicas-para-perros');
    expect(DOGS_HUB_ES.title).toMatch(/^Plantas tóxicas para perros/);
    expect(CATS_HUB_ES.title).toMatch(/^Plantas tóxicas para gatos/);
    expect(DOGS_HUB_ES.twin).toBe('/plants-toxic-to-dogs');
    expect(CATS_HUB_ES.twin).toBe('/plants-toxic-to-cats');
    expect(SAFE_HUB_ES.twin).toBe(SAFE_HUB.path);
  });

  it('count the same plants per verdict as the English hubs', () => {
    const toxicToDogs = PLANT_PAGES.filter(
      ({ verdict }) => verdict === 'both' || verdict === 'dogs',
    );
    expect(DOGS_HUB_ES.groups[0]?.rows).toHaveLength(toxicToDogs.length);
    expect(DOGS_HUB_ES.title).toContain(String(toxicToDogs.length));
  });

  it('list every ASPCA entry safe for both in the safe hub, with its Spanish name', () => {
    expect(SAFE_HUB_ES.rows.map(({ slug }) => slug).sort()).toEqual(
      SAFE_HUB.rows.map(({ slug }) => slug).sort(),
    );
    expect(SAFE_HUB_ES.avoid.map(({ href }) => href)).toContain(
      '/es/potus-es-toxico-para-perros-y-gatos',
    );
    const pothos = PLANTS.find(({ id }) => id === 'pothos');
    expect(pothos === undefined ? '' : plantPathOf(pothos)).toBe(
      '/is-pothos-toxic-to-cats-and-dogs',
    );
  });
});
