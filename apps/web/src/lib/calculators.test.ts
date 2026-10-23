import { readdirSync } from 'node:fs';
import { ft2, valueIn } from '@maestro-calc/core';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { createTranslator } from '@maestro-calc/i18n';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esRectangleArea } from '@maestro-calc/i18n/catalogs/es/rectangle-area';
import { describe, expect, it } from 'vitest';
import { fromRoot } from '../contract/root.ts';
import { calculators } from './calculators.ts';

describe('web smoke (calc-rectangle-area › Web smoke import)', () => {
  // spec: Web smoke import [RA15, MW12]: the packages are consumed through their entry points
  it('computes case A through the core subpath and titles it from the es catalogs', () => {
    const result = rectangleArea.run({ length: "10'", width: '12\' 6"' });
    if (!result.ok) throw new Error('run failed');
    const [primary] = result.value.outputs;
    expect(primary?.key).toBe('areaFt2');
    expect(primary === undefined ? undefined : valueIn(primary.value, ft2).toString()).toBe('125');

    const t = createTranslator({ ...esCommon, ...esRectangleArea });
    expect(t('calc.rectangle-area.title')).toBe('Área de un rectángulo');
  });
});

describe('calculator registry (calc-rectangle-area › Bilingual labels)', () => {
  it('lists rectangle-area, the proof calculator, as the very object core exports', () => {
    expect(calculators).toContain(rectangleArea);
  });

  // design D7: a calculator that core ships but the site does not list would never be checked
  it('lists every calculator that core ships, once', () => {
    const shipped = readdirSync(fromRoot('packages/core/src/calculators'), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(shipped).toContain('rectangle-area');
    expect(calculators.map(({ id }) => id).sort()).toEqual(shipped);
  });
});
