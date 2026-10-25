import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { materialKeysOf, materials, missingMaterialKeys } from './material-catalog.ts';
import { fromRoot } from './root.ts';

/** Every key of every catalog module of a locale, merged (the material keys live in any module). */
const keysOfLocale = async (locale: 'en' | 'es'): Promise<Record<string, string>> => {
  const directory = fromRoot('packages/i18n/src/catalogs', locale);
  const merged: Record<string, string> = {};
  for (const file of readdirSync(directory).filter((name) => name.endsWith('.ts'))) {
    const exported = (await import(/* @vite-ignore */ join(directory, file))) as Record<
      string,
      Readonly<Record<string, string>>
    >;
    for (const catalog of Object.values(exported)) Object.assign(merged, catalog);
  }
  return merged;
};

describe('material catalog completeness (i18n-catalog › [ICW14] Material without keys fails)', () => {
  // spec: i18n-catalog › [ICW14]
  it('lists concreteMix as the only shipped material', () => {
    expect(materials.map(({ id }) => id)).toEqual(['concrete-mix']);
    expect(materials.flatMap(materialKeysOf)).toEqual([
      'material.concrete-mix.name',
      'material.concrete-mix.units.bag-40',
      'material.concrete-mix.units.bag-60',
      'material.concrete-mix.units.bag-80',
    ]);
  });

  // spec: i18n-catalog › [ICW14]: every material has its name and unit keys in both locales
  it.each(['en', 'es'] as const)(
    'has every material key of every material in %s',
    async (locale) => {
      expect(missingMaterialKeys(materials, await keysOfLocale(locale))).toEqual([]);
    },
  );

  // spec: i18n-catalog › [ICW14] (seeded): a catalog without bag-60 names the key
  it('names the key of a unit the catalog lacks', () => {
    const without = Object.fromEntries(
      Object.entries(enConcrete).filter(([key]) => key !== 'material.concrete-mix.units.bag-60'),
    );
    expect(missingMaterialKeys(materials, without)).toEqual(['material.concrete-mix.units.bag-60']);
    expect(missingMaterialKeys(materials, esConcrete)).toEqual([]);
  });
});
