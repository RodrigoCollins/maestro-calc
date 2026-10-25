import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { placeholdersOf } from '@maestro-calc/i18n';
import { catalogProblems } from '@maestro-calc/i18n/testing/catalog-problems';
import { describe, expect, it } from 'vitest';
import { extraKeys, missingKeys, requiredKeys } from '../contract/missing-keys.ts';
import { materials, materialsBoughtBy } from '../contract/material-catalog.ts';
import { fromRoot } from '../contract/root.ts';
import { calculators } from './calculators.ts';

type Module = Readonly<Record<string, string>>;

const LOCALES = ['en', 'es'] as const;
type Locale = (typeof LOCALES)[number];

/**
 * The catalog modules of a locale, read from its directory: module id (the file name) to the one
 * catalog the file exports. Nothing is listed by hand, so a module added to a directory is
 * checked by every test below the day it is written.
 */
const loadModules = async (locale: Locale): Promise<Record<string, Module>> => {
  const directory = fromRoot('packages/i18n/src/catalogs', locale);
  const files = readdirSync(directory).filter((file) => file.endsWith('.ts'));
  const loaded = await Promise.all(
    files.map(async (file) => {
      const exported = Object.values(
        (await import(/* @vite-ignore */ join(directory, file))) as object,
      );
      const [catalog, ...others] = exported as Module[];
      if (catalog === undefined || others.length > 0) {
        throw new Error(`${locale}/${file}: a catalog module exports exactly one catalog`);
      }
      return [file.replace(/\.ts$/, ''), catalog] as const;
    }),
  );
  return Object.fromEntries(loaded.sort(([a], [b]) => a.localeCompare(b)));
};

const modules: Record<Locale, Record<string, Module>> = {
  en: await loadModules('en'),
  es: await loadModules('es'),
};

/** The catalog a page builds for `id` in `locale`: the common module and the calculator's own. */
const catalogOf = (locale: Locale, id: string): Module => ({
  ...modules[locale]['common'],
  ...modules[locale][id],
});

const RECTANGLE_AREA_KEYS = [
  'calc.rectangle-area.title',
  'calc.rectangle-area.inputs.length',
  'calc.rectangle-area.inputs.width',
  'calc.rectangle-area.outputs.areaFt2',
  'calc.rectangle-area.outputs.areaYd2',
  'calc.rectangle-area.outputs.areaM2',
];
/**
 * The keys the naming convention asks of a calculator, written out from its descriptors (a title,
 * one label per input, one per option of each select, one per output) so that no calculator's key
 * list is kept by hand: a new calculator is checked against the convention the day it is listed.
 */
const conventionKeys = (calculator: (typeof calculators)[number]): string[] => {
  const prefix = `calc.${calculator.id}`;
  return [
    `${prefix}.title`,
    ...calculator.inputs.map(({ key }) => `${prefix}.inputs.${key}`),
    ...calculator.inputs.flatMap((input) =>
      input.kind === 'select'
        ? input.options.map((option) => `${prefix}.options.${input.key}.${option}`)
        : [],
    ),
    ...calculator.outputs.map(({ key }) => `${prefix}.outputs.${key}`),
  ];
};
const ERROR_KEYS = [
  'errors.EMPTY',
  'errors.MALFORMED',
  'errors.DECIMAL_COMMA',
  'errors.ZERO_DENOMINATOR',
  'errors.UNKNOWN_UNIT',
  'errors.TOO_LONG',
  'errors.TOO_LARGE',
  'errors.BELOW_MIN',
  'errors.ABOVE_MAX',
  'errors.UNKNOWN_OPTION',
  'errors.INVALID_VALUE',
  'errors.UNSUPPORTED_VERSION',
];

describe('registry catalog completeness (i18n-catalog › Catalog completeness and hygiene)', () => {
  // spec: Convention for the proof calculator [IN3, RA14]
  it('requires the six calculator keys and the twelve error keys, in that order', () => {
    const [rectangleArea] = calculators;
    expect(requiredKeys(rectangleArea)).toEqual([...RECTANGLE_AREA_KEYS, ...ERROR_KEYS]);
  });

  // spec: i18n-catalog › [ICW10] Derived keys, for every listed calculator
  it.each(calculators.map((calculator) => [calculator.id, calculator] as const))(
    'requires the keys of the naming convention and the twelve error keys for %s',
    (_id, calculator) => {
      expect(requiredKeys(calculator)).toEqual([...conventionKeys(calculator), ...ERROR_KEYS]);
    },
  );

  // spec: i18n-catalog › [ICW10] Derived keys of concrete (final: 17 inputs, four shapes, six outputs)
  it('requires 43 keys for concrete: title, 17 inputs, 4 shape, 3 bag options, 6 outputs, 12 errors', () => {
    const concrete = calculators.find(({ id }) => id === 'concrete');
    if (concrete === undefined) throw new Error('concrete is not in the registry');
    const keys = requiredKeys(concrete);
    expect(keys).toHaveLength(43);
    expect(keys).toContain('calc.concrete.options.shape.steps');
    expect(keys).toContain('calc.concrete.options.bag.60');
    expect(keys).toContain('calc.concrete.outputs.readyMixCost');
  });

  it('has every required key of every listed calculator in both locales', () => {
    expect(calculators.length).toBeGreaterThan(0);
    for (const calculator of calculators) {
      for (const locale of ['en', 'es'] as const) {
        expect(missingKeys(calculator, catalogOf(locale, calculator.id)), locale).toEqual([]);
      }
    }
  });

  // spec: i18n-catalog › [ICW15] Undeclared extra key fails; [ICW11] the material keys are allowed
  it('holds no key beyond the derived ones and the material keys of the materials it buys', () => {
    for (const calculator of calculators) {
      for (const locale of LOCALES) {
        expect(
          extraKeys(
            calculator,
            catalogOf(locale, calculator.id),
            materialsBoughtBy(calculator, materials),
          ),
          locale,
        ).toEqual([]);
      }
    }
    const concrete = calculators.find(({ id }) => id === 'concrete');
    if (concrete === undefined) throw new Error('concrete is not in the registry');
    const withExtra = { ...catalogOf('en', 'concrete'), 'calc.concrete.extra': 'Extra' };
    expect(extraKeys(concrete, withExtra, materialsBoughtBy(concrete, materials))).toEqual([
      'calc.concrete.extra',
    ]);
    // a material key is allowed for the calculator that buys it, and only for that one
    const rectangle = calculators.find(({ id }) => id === 'rectangle-area');
    if (rectangle === undefined) throw new Error('rectangle-area is not in the registry');
    expect(
      extraKeys(rectangle, catalogOf('en', 'concrete'), materialsBoughtBy(rectangle, materials)),
    ).toContain('calc.concrete.title');
  });

  it('keeps the same placeholders in en and es for every required key', () => {
    for (const calculator of calculators) {
      const en = catalogOf('en', calculator.id);
      const es = catalogOf('es', calculator.id);
      for (const key of requiredKeys(calculator)) {
        expect(placeholdersOf(es[key] ?? ''), key).toEqual(placeholdersOf(en[key] ?? ''));
      }
    }
  });

  // spec: Key naming convention: {min} only in BELOW_MIN, {max} only in ABOVE_MAX
  it('has {min} in errors.BELOW_MIN, {max} in errors.ABOVE_MAX and nothing else', () => {
    for (const locale of ['en', 'es'] as const) {
      const common = modules[locale]['common'] ?? {};
      expect(Object.keys(common)).toEqual(ERROR_KEYS);
      for (const [key, message] of Object.entries(common)) {
        const expected = { 'errors.BELOW_MIN': ['min'], 'errors.ABOVE_MAX': ['max'] }[key] ?? [];
        expect(placeholdersOf(message), `${locale} ${key}`).toEqual(expected);
      }
    }
  });

  it('has one module per listed calculator and the common module in each locale directory', () => {
    const expected = ['common', 'site', ...calculators.map(({ id }) => id)].sort();
    for (const locale of LOCALES) {
      expect(Object.keys(modules[locale]), locale).toEqual(expected);
    }
  });

  // PR 12 review REL-2 and RD-1: the hygiene of the i18n package (same keys, clean messages, same
  // placeholders) applies to every module of the directory, not to a list kept in a test.
  it('keeps every module of es in step with en: keys, grammar, whitespace, braces, placeholders', () => {
    expect(Object.keys(modules.en).length).toBeGreaterThan(1);
    for (const [id, en] of Object.entries(modules.en)) {
      expect(catalogProblems(en, modules.es[id] ?? {}), id).toEqual([]);
    }
  });

  // spec: Calculator without labels fails [IN11]
  it('names a key that a calculator needs and the catalog lacks', () => {
    const [rectangleArea] = calculators;
    const withPerimeter = {
      id: rectangleArea.id,
      inputs: rectangleArea.inputs,
      outputs: [
        ...rectangleArea.outputs,
        { key: 'perimeter', measure: 'length', role: 'secondary' },
      ],
      warnings: ['tooLong'],
    } as const;
    expect(missingKeys(withPerimeter, catalogOf('en', 'rectangle-area'))).toEqual([
      'calc.rectangle-area.outputs.perimeter',
      'calc.rectangle-area.warnings.tooLong',
    ]);
    expect(missingKeys(rectangleArea, {})).toEqual([...RECTANGLE_AREA_KEYS, ...ERROR_KEYS]);
  });
});
