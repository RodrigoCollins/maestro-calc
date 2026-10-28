import { describe, expect, it } from 'vitest';
import { enRectangleArea } from './catalogs/en/rectangle-area.ts';
import { esRectangleArea } from './catalogs/es/rectangle-area.ts';
import { placeholdersOf } from './translate.ts';

/** The page copy of the rectangle-area calculator. */
const PAGE_KEYS = [
  'calc.rectangle-area.page.answer',
  'calc.rectangle-area.page.areaFt2',
  'calc.rectangle-area.page.areaM2',
  'calc.rectangle-area.page.drawing',
  'calc.rectangle-area.page.example',
] as const;

const pageKeysOf = (module: Readonly<Record<string, string>>): string[] =>
  Object.keys(module)
    .filter((key) => key.startsWith('calc.rectangle-area.page.'))
    .sort();

describe('rectangle-area page copy (calc-rectangle-area › Page copy and hand-verified display cases)', () => {
  // spec: calc-rectangle-area › [RAP1] exactly the four page keys in both locales
  it('holds exactly the five page keys in both locales', () => {
    expect(pageKeysOf(enRectangleArea)).toEqual(PAGE_KEYS);
    expect(pageKeysOf(esRectangleArea)).toEqual(PAGE_KEYS);
  });

  // spec: calc-rectangle-area › [RAP1] the placeholders are those of the template, the same in both locales
  it.each([
    ['calc.rectangle-area.page.answer', ['area', 'length', 'width']],
    ['calc.rectangle-area.page.areaFt2', ['value']],
    ['calc.rectangle-area.page.areaM2', ['value']],
    // spec: i18n-catalog › [ICW20], [ICW21] the name of the drawing, the same placeholders in both locales
    ['calc.rectangle-area.page.drawing', ['area', 'length', 'width']],
    ['calc.rectangle-area.page.example', []],
  ] as const)('gives %s its placeholders in both locales', (key, names) => {
    expect([...placeholdersOf(enRectangleArea[key])].sort()).toEqual(names);
    expect([...placeholdersOf(esRectangleArea[key])].sort()).toEqual(names);
  });

  // spec: calc-rectangle-area › [RAP2] the sentences the controller fills
  it('says the answer and the two unit sentences exactly', () => {
    expect(enRectangleArea['calc.rectangle-area.page.answer']).toBe(
      'A {length} by {width} area is {area}.',
    );
    expect(esRectangleArea['calc.rectangle-area.page.answer']).toBe(
      'Un área de {length} por {width} mide {area}.',
    );
    expect(enRectangleArea['calc.rectangle-area.page.areaFt2']).toBe('{value} square feet');
    expect(enRectangleArea['calc.rectangle-area.page.areaM2']).toBe('{value} square meters');
    expect(esRectangleArea['calc.rectangle-area.page.areaFt2']).toBe('{value} pies cuadrados');
    expect(esRectangleArea['calc.rectangle-area.page.areaM2']).toBe('{value} metros cuadrados');
  });

  // spec: calc-rectangle-area › [RAP5] the example names the worked example in both locales
  it.each([
    ['en', enRectangleArea['calc.rectangle-area.page.example']],
    ['es', esRectangleArea['calc.rectangle-area.page.example']],
  ] as const)('names 12 ft, 10 ft and 120.00 in the %s example', (_locale, example) => {
    for (const part of ['12 ft', '10 ft', '120.00']) expect(example).toContain(part);
  });

  // spec: calc-rectangle-area › [RAP6] the Spanish terms and the titles
  it('uses the Spanish area terms, adds no unit word to the dimensions and has no rectángulo in the title', () => {
    expect(enRectangleArea['calc.rectangle-area.title']).toBe('Square Footage Calculator');
    expect(esRectangleArea['calc.rectangle-area.title']).toBe('Calculadora de pies cuadrados');
    expect(esRectangleArea['calc.rectangle-area.title']).not.toMatch(/rect[aá]ngulo/i);
    expect(esRectangleArea['calc.rectangle-area.page.answer']).not.toMatch(
      /\{(length|width)\}\s+(pies|ft|metros|m)\b/,
    );
    expect(esRectangleArea['calc.rectangle-area.page.areaFt2']).toContain('pies cuadrados');
    expect(esRectangleArea['calc.rectangle-area.outputs.areaYd2']).toContain('yardas cuadradas');
  });
});

describe('the name of the drawing (i18n-catalog › [ICW20], [ICW21]; blueprint-drawing › [BD15])', () => {
  // spec: blueprint-drawing › [BD15] the accessible name of the plan, in each language
  it('names the plan with its two dimensions and its area', () => {
    expect(enRectangleArea['calc.rectangle-area.page.drawing']).toBe(
      'Plan: {length} by {width}, {area}',
    );
    expect(esRectangleArea['calc.rectangle-area.page.drawing']).toBe(
      'Plano: {length} por {width}, {area}',
    );
  });

  // spec: i18n-catalog › [ICW21] no unit symbol in the words: the fills bring them
  it.each([enRectangleArea, esRectangleArea])('carries no unit symbol of its own', (catalog) => {
    expect(catalog['calc.rectangle-area.page.drawing']).not.toMatch(/\b(ft|in|m|cm)\b|²/);
  });
});
