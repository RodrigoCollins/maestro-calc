import { describe, expect, it } from 'vitest';
import {
  CHARTS_INDEX,
  CHARTS_INDEX_ES,
  DATA_PAGES,
  DATA_PAGES_ES,
  DATA_TEXTS,
  checkedText,
} from './charts.ts';
import { CHEMISTRY_CHART } from './chemistry.ts';
import { CHEMISTRY_CHART_ES } from './chemistry-es.ts';
import { DOSING_CHART, type DosingChart } from './dosing.ts';
import { DOSING_CHART_ES } from './dosing-es.ts';
import type { GuideSource } from './guide.ts';
import { routeOf } from './routes.ts';
import { SWIM_GUIDE } from './swim.ts';
import { SWIM_GUIDE_ES } from './swim-es.ts';
import { VOLUME_CHART } from './volume/chart.ts';
import { VOLUME_CHART_ES } from './volume/chart-es.ts';

/** The numbers of a text, a thousands comma read inside its number: "20,000" is 20000. */
const numbersOf = (text: string): string[] =>
  (text.replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(?:\.\d+)?/g) ?? []).sort();

/** The Spanish twin of an English address of the site, or the address itself when it has none. */
const twinOf = (href: string): string => {
  const [path = href, query] = href.split('?');
  const es = routeOf(path)?.es ?? path;
  return query === undefined ? es : `${es}?${query}`;
};

/** The sources of a Spanish page name the same documents, at the same links, with the same figures. */
const sameSources = (
  en: Readonly<Record<string, GuideSource>>,
  es: Readonly<Record<string, GuideSource>>,
) => {
  expect(Object.keys(es)).toEqual(Object.keys(en));
  for (const [key, source] of Object.entries(en)) {
    expect(es[key]?.url, key).toBe(source.url);
    expect(numbersOf(es[key]?.name ?? ''), key).toEqual(numbersOf(source.name));
  }
};

const PAGES = [
  ['chemistry', CHEMISTRY_CHART, CHEMISTRY_CHART_ES],
  ['dosing', DOSING_CHART, DOSING_CHART_ES],
  ['volume', VOLUME_CHART, VOLUME_CHART_ES],
  ['swim', SWIM_GUIDE, SWIM_GUIDE_ES],
  ['index', CHARTS_INDEX, CHARTS_INDEX_ES],
] as const;

describe('the Spanish charts', () => {
  for (const [id, en, es] of PAGES)
    describe(id, () => {
      it('lives at the Spanish address of its route', () => {
        expect(routeOf(en.path)?.es).toBe(es.path);
      });

      it('is titled for search, its own title and description', () => {
        expect(es.title.endsWith(' | Pool Figures')).toBe(true);
        expect(es.title.length).toBeLessThanOrEqual(65);
        expect(es.description.length).toBeGreaterThan(50);
        expect(es.description.length).toBeLessThanOrEqual(160);
        expect(es.title).not.toBe(en.title);
        expect(numbersOf(es.lead)).toEqual(numbersOf(en.lead));
      });

      it('labels the same parts of the page as the English one', () => {
        expect(Object.keys(es.page)).toEqual(Object.keys(en.page));
      });

      // neutral Spanish, the tú register, and the US label names (plans/pool/SPANISH.md)
      it('speaks in the tú register', () => {
        const text = JSON.stringify(es);
        expect(text).not.toMatch(/\busted\b|\bingrese\b|\bsalfumán\b/i);
      });
    });

  describe('water chemistry', () => {
    it('gives every level the same ranges, figures, doses and sources', () => {
      expect(CHEMISTRY_CHART_ES.rows.map(({ id }) => id)).toEqual(
        CHEMISTRY_CHART.rows.map(({ id }) => id),
      );
      CHEMISTRY_CHART.rows.forEach((row, index) => {
        const es = CHEMISTRY_CHART_ES.rows[index];
        expect(numbersOf(es?.home ?? ''), row.id).toEqual(numbersOf(row.home));
        expect(numbersOf(es?.publicPool ?? ''), row.id).toEqual(numbersOf(row.publicPool));
        expect(numbersOf(es?.text ?? ''), row.id).toEqual(numbersOf(row.text));
        expect(es?.sources, row.id).toEqual(row.sources);
        expect(es?.link?.href, row.id).toBe(
          row.link === undefined ? undefined : twinOf(row.link.href),
        );
        const shape = (example: typeof row.example) =>
          example === undefined ? undefined : [example.raw, example.key, example.result];
        expect(shape(es?.example), row.id).toEqual(shape(row.example));
        expect(numbersOf(es?.example?.text ?? ''), row.id).toEqual(
          numbersOf(row.example?.text ?? ''),
        );
      });
      expect(CHEMISTRY_CHART_ES.gallons.href).toBe(twinOf(CHEMISTRY_CHART.gallons.href));
      sameSources(CHEMISTRY_CHART.sources, CHEMISTRY_CHART_ES.sources);
    });
  });

  describe('chemical dosing', () => {
    it('prints the very cells of the English tables, worked out once by the calculators', () => {
      expect(DOSING_CHART_ES.tables.map(({ id }) => id)).toEqual(
        DOSING_CHART.tables.map(({ id }) => id),
      );
      DOSING_CHART.tables.forEach((table, index) => {
        expect(DOSING_CHART_ES.tables[index]?.rows).toBe(table.rows);
      });
    });

    it('names each column with the same figures, unit, sources and calculator', () => {
      const columns = (chart: DosingChart) => chart.tables.flatMap((t) => t.columns);
      const es = columns(DOSING_CHART_ES);
      columns(DOSING_CHART).forEach((column, index) => {
        const twin = es[index];
        expect(twin?.id).toBe(column.id);
        expect(twin?.unit).toBe(column.unit);
        expect(twin?.key).toBe(column.key);
        expect(twin?.sources).toEqual(column.sources);
        expect(numbersOf(twin?.head ?? ''), column.id).toEqual(numbersOf(column.head));
        expect(numbersOf(twin?.assumption ?? ''), column.id).toEqual(numbersOf(column.assumption));
        expect(twin?.link.href, column.id).toBe(twinOf(column.link.href));
        expect(twin?.method.split('#')[1]).toBe(column.method.split('#')[1]);
      });
      sameSources(DOSING_CHART.sources, DOSING_CHART_ES.sources);
    });

    it('is cited at its own Spanish address, by its Spanish name', () => {
      expect(DOSING_CHART_ES.cite.url).toBe(`https://poolfigures.com${DOSING_CHART_ES.path}`);
      expect(DOSING_CHART_ES.cite.text).toContain(DOSING_CHART_ES.h1);
      expect(numbersOf(DOSING_CHART_ES.cite.text)).toEqual(numbersOf(DOSING_CHART.cite.text));
    });
  });

  describe('pool volume', () => {
    it('prints the very gallons of the English tables, each row opening the Spanish calculator', () => {
      VOLUME_CHART.tables.forEach((table, index) => {
        const es = VOLUME_CHART_ES.tables[index];
        expect(es?.id).toBe(table.id);
        expect(numbersOf(es?.note ?? '')).toEqual(numbersOf(table.note));
        table.columns.forEach((column, at) => {
          const twin = es?.columns[at];
          expect([twin?.shallow, twin?.deep, twin?.average]).toEqual([
            column.shallow,
            column.deep,
            column.average,
          ]);
          expect(numbersOf(twin?.head ?? '')).toEqual(numbersOf(column.head));
        });
        table.rows.forEach((row, at) => {
          const twin = es?.rows[at];
          expect(twin?.cells).toBe(row.cells);
          expect(twin?.size).toBe(row.size);
          expect(numbersOf(twin?.label ?? '')).toEqual(numbersOf(row.label));
          expect(twin?.href).toBe(twinOf(row.href));
        });
      });
    });

    it('prints the very litres of the English metric tables, each row opening the Spanish calculator', () => {
      expect(VOLUME_CHART_ES.metricTables).toHaveLength(VOLUME_CHART.metricTables.length);
      VOLUME_CHART.metricTables.forEach((table, index) => {
        const es = VOLUME_CHART_ES.metricTables[index];
        expect(es?.id).toBe(table.id);
        expect(es?.caption).not.toBe(table.caption);
        expect(numbersOf(es?.note ?? '')).toEqual(numbersOf(table.note));
        table.columns.forEach((column, at) => {
          const twin = es?.columns[at];
          expect([twin?.shallow, twin?.deep, twin?.average]).toEqual([
            column.shallow,
            column.deep,
            column.average,
          ]);
          expect(numbersOf(twin?.head ?? '')).toEqual(numbersOf(column.head));
        });
        table.rows.forEach((row, at) => {
          const twin = es?.rows[at];
          expect(twin?.cells).toBe(row.cells);
          expect(twin?.cubicMetres).toBe(row.cubicMetres);
          expect(numbersOf(twin?.label ?? '')).toEqual(numbersOf(row.label));
          expect(twin?.href).toBe(twinOf(row.href));
        });
      });
      expect(VOLUME_CHART_ES.page.litres).toContain('Litros');
    });

    it('states the same factors, assumptions and shortcuts', () => {
      expect(VOLUME_CHART_ES.factors).toBe(VOLUME_CHART.factors);
      expect(VOLUME_CHART_ES.assumptions.map(numbersOf)).toEqual(
        VOLUME_CHART.assumptions.map(numbersOf),
      );
      expect(VOLUME_CHART_ES.shortcuts.map(numbersOf)).toEqual(
        VOLUME_CHART.shortcuts.map(numbersOf),
      );
      expect(VOLUME_CHART_ES.source.url).toBe(VOLUME_CHART.source.url);
      expect(VOLUME_CHART_ES.calculator.href).toBe(twinOf(VOLUME_CHART.calculator.href));
      expect(VOLUME_CHART_ES.cite.url).toBe(`https://poolfigures.com${VOLUME_CHART_ES.path}`);
      expect(VOLUME_CHART_ES.cite.text).toContain(VOLUME_CHART_ES.h1);
    });
  });

  describe('when to swim', () => {
    it('gives every chemical the same readings, times, figures and sources', () => {
      expect(SWIM_GUIDE_ES.rows.map(({ id }) => id)).toEqual(SWIM_GUIDE.rows.map(({ id }) => id));
      SWIM_GUIDE.rows.forEach((row, index) => {
        const es = SWIM_GUIDE_ES.rows[index];
        for (const part of ['chemical', 'when', 'time', 'text'] as const)
          expect(numbersOf(es?.[part] ?? ''), `${row.id} ${part}`).toEqual(numbersOf(row[part]));
        expect(es?.sources, row.id).toEqual(row.sources);
        expect(es?.link.href, row.id).toBe(twinOf(row.link.href));
      });
      expect(numbersOf(SWIM_GUIDE_ES.rules.text)).toEqual(numbersOf(SWIM_GUIDE.rules.text));
      expect(SWIM_GUIDE_ES.rules.sources).toEqual(SWIM_GUIDE.rules.sources);
      expect(SWIM_GUIDE_ES.charts.map(({ href }) => href)).toEqual(
        SWIM_GUIDE.charts.map(({ href }) => twinOf(href)),
      );
      sameSources(SWIM_GUIDE.sources, SWIM_GUIDE_ES.sources);
    });

    // a guide still in English is linked in English, and says so
    it('links each guide in Spanish once it is built, in English until then', () => {
      SWIM_GUIDE.rows.forEach((row, index) => {
        const es = SWIM_GUIDE_ES.rows[index]?.guide;
        if (row.guide === undefined) {
          expect(es).toBeUndefined();
          return;
        }
        expect(es?.href).toBe(twinOf(row.guide.href));
        expect(es?.label.endsWith(' (en inglés)')).toBe(es?.href === row.guide.href);
      });
    });
  });

  describe('the data index', () => {
    it('lists the Spanish twin of every data page, checked the same day, by the same owners', () => {
      expect(DATA_PAGES_ES.map(({ path }) => path)).toEqual(
        DATA_PAGES.map(({ path }) => twinOf(path)),
      );
      DATA_PAGES.forEach((page, index) => {
        expect(DATA_PAGES_ES[index]?.checked).toBe(page.checked);
        expect(DATA_PAGES_ES[index]?.owners).toHaveLength(page.owners.length);
      });
      expect(CHARTS_INDEX_ES.press.email).toBe(CHARTS_INDEX.press.email);
    });

    it('dates a check in the language of the page', () => {
      expect(checkedText('2026-11-05', 'es')).toBe('5 de noviembre de 2026');
      expect(checkedText('2026-11-05', 'en')).toBe('November 5, 2026');
    });

    it('closes each data page with the line to the index in its language', () => {
      expect(Object.keys(DATA_TEXTS.es)).toEqual(Object.keys(DATA_TEXTS.en));
    });
  });
});
