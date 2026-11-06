import { describe, expect, it } from 'vitest';
import { ALKALINITY, CHLORINE, PH, SALT, type DosePage } from './doses.ts';
import { ALKALINITY_ES, CHLORINE_ES, PH_ES, SALT_ES } from './doses-es.ts';
import { routeOf } from './routes.ts';
import { VOLUME_TEXTS, VOLUME_TEXTS_ES } from './volume/texts.ts';

const PAIRS: readonly (readonly [string, DosePage, DosePage])[] = [
  ['salt', SALT, SALT_ES],
  ['chlorine', CHLORINE, CHLORINE_ES],
  ['ph', PH, PH_ES],
  ['alkalinity', ALKALINITY, ALKALINITY_ES],
];

/** The numbers of a text, a thousands comma read inside its number: "20,000" is 20000. */
const numbersOf = (text: string): string[] =>
  (text.replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(?:\.\d+)?/g) ?? []).sort();

/** Every text of a dose page a reader sees, but its field and result labels. */
const proseOf = (page: DosePage): string =>
  [
    page.lead,
    page.method,
    page.note,
    ...Object.values(page.warnings ?? {}),
    page.strip?.legend ?? '',
    page.strip?.note ?? '',
  ].join('\n');

describe('the Spanish dose pages', () => {
  for (const [id, en, es] of PAIRS) {
    describe(id, () => {
      it('lives at the Spanish address of its route', () => {
        expect(routeOf(en.path)?.es).toBe(es.path);
        expect(routeOf(es.path)?.id).toBe(id);
      });

      // every field, option, result, product form and warning of the engine has its Spanish text
      it('labels the same fields, options, results and warnings as the English page', () => {
        expect(Object.keys(es.fields)).toEqual(Object.keys(en.fields));
        for (const [key, field] of Object.entries(en.fields))
          expect(Object.keys(es.fields[key]?.options ?? {}), key).toEqual(
            Object.keys(field.options ?? {}),
          );
        const shape = ({ key, forms, detail }: DosePage['results'][number]) => [key, forms, detail];
        expect(es.results.map(shape)).toEqual(en.results.map(shape));
        expect(Object.keys(es.warnings ?? {})).toEqual(Object.keys(en.warnings ?? {}));
        expect(es.bags === undefined).toBe(en.bags === undefined);
        expect(es.strip?.field).toBe(en.strip?.field);
        expect(es.strip?.pads).toEqual(en.strip?.pads);
      });

      // the safety and dose copy says what the English says: the same figures, none left out
      it('states every figure of the English method, note and warnings', () => {
        expect(numbersOf(es.method)).toEqual(numbersOf(en.method));
        expect(numbersOf(es.note)).toEqual(numbersOf(en.note));
        for (const [code, text] of Object.entries(en.warnings ?? {}))
          expect(numbersOf(es.warnings?.[code] ?? ''), code).toEqual(numbersOf(text));
      });

      it('is titled for search, its own title and description', () => {
        expect(es.title.endsWith(' | Pool Figures')).toBe(true);
        expect(es.title.length).toBeLessThanOrEqual(65);
        expect(es.description.length).toBeGreaterThanOrEqual(50);
        expect(es.description.length).toBeLessThanOrEqual(160);
        expect(es.title).not.toBe(en.title);
      });

      it('links the section of the methodology that works it out', () => {
        expect(es.methodLink?.href).toBe(`/methodology#${id}`);
        expect(en.methodLink).toBeUndefined();
      });

      // neutral Spanish, the tú register, and the US label names (plans/pool/SPANISH.md)
      it('speaks in the tú register, in US units and US product names', () => {
        const text = proseOf(es);
        expect(text).not.toMatch(/\busted\b|\bingrese\b|\bsalfumán\b/i);
        expect(text).not.toMatch(/\b(litros?|kilos?) de agua\b/);
      });
    });
  }

  it('keeps the acid safety rules of the English pH page', () => {
    expect(PH_ES.note).toContain('Agrega el ácido al agua, nunca el agua al ácido');
    expect(PH_ES.note).toContain('nunca lo mezcles con cloro');
    expect(PH_ES.note).toContain('ácido muriático');
  });

  it('names the products as the US labels do, with their Spanish name', () => {
    const text = JSON.stringify([CHLORINE_ES, PH_ES, ALKALINITY_ES]);
    for (const name of [
      'cloro líquido',
      'hipoclorito de calcio (cal-hypo)',
      'dicloro',
      'ácido muriático',
      'carbonato de sodio',
      'bicarbonato de sodio',
    ])
      expect(text, name).toContain(name);
  });

  it('says alberca once in the salt lead, for the readers who search it', () => {
    expect(SALT_ES.lead).toContain('alberca');
  });
});

describe('the Spanish volume page', () => {
  it('lives at the Spanish address of its route', () => {
    expect(routeOf(VOLUME_TEXTS.path)?.es).toBe(VOLUME_TEXTS_ES.path);
  });

  it('labels the same fields, shapes and rows as the English page', () => {
    expect(Object.keys(VOLUME_TEXTS_ES.fields)).toEqual(Object.keys(VOLUME_TEXTS.fields));
    expect(Object.keys(VOLUME_TEXTS_ES.fields.shape.options)).toEqual(
      Object.keys(VOLUME_TEXTS.fields.shape.options),
    );
    expect(Object.keys(VOLUME_TEXTS_ES.rows)).toEqual(Object.keys(VOLUME_TEXTS.rows));
    expect(numbersOf(VOLUME_TEXTS_ES.method)).toEqual(numbersOf(VOLUME_TEXTS.method));
  });

  it('is titled for search, says alberca once and links its methodology', () => {
    expect(VOLUME_TEXTS_ES.title.length).toBeLessThanOrEqual(65);
    expect(VOLUME_TEXTS_ES.description.length).toBeGreaterThanOrEqual(50);
    expect(VOLUME_TEXTS_ES.description.length).toBeLessThanOrEqual(160);
    expect(VOLUME_TEXTS_ES.lead).toContain('alberca');
    expect(VOLUME_TEXTS_ES.methodLink.href).toBe('/methodology#volume');
  });
});
