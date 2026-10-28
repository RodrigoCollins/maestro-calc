import type { AllErrorCode, messageKeysOf, MessageKeysOf } from '@maestro-calc/core';
import type { concreteMix } from '@maestro-calc/data';
import type { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import type { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import type { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { describe, expectTypeOf, it } from 'vitest';
import type { calculators } from './calculators.ts';

// The English modules are imported by hand (a type cannot read a directory), but the keys they must
// hold come from the registry: a calculator added to `calculators.ts` whose module is not unioned
// here makes the first check below a type error, so the list cannot fall behind the registry.
type EnglishKeys = keyof typeof enCommon | keyof typeof enConcrete | keyof typeof enRectangleArea;

/** The catalog keys of a material record: its name and one per purchase unit. */
type MaterialKeys<M extends { nameKey: string; purchaseUnits: readonly { nameKey: string }[] }> =
  M['nameKey'] | M['purchaseUnits'][number]['nameKey'];

/** The page copy of the concrete calculator (`calc.concrete.page.*`), exactly: a new key is added here. */
type ConcretePageKeys =
  | 'calc.concrete.page.answer.slab'
  | 'calc.concrete.page.answer.footing'
  | 'calc.concrete.page.answer.column'
  | 'calc.concrete.page.answer.steps'
  | 'calc.concrete.page.example'
  | 'calc.concrete.page.volumeYd3'
  | 'calc.concrete.page.volumeM3'
  | 'calc.concrete.page.shoppingLine'
  | 'calc.concrete.page.bagYield'
  | 'calc.concrete.page.wasteHelp'
  | 'calc.concrete.page.wasteLess'
  | 'calc.concrete.page.wasteMore'
  | 'calc.concrete.page.priceHint'
  | 'calc.concrete.page.readyMixNote';

/** The page copy of the rectangle-area calculator (`calc.rectangle-area.page.*`), exactly: a new key is added here. */
type RectangleAreaPageKeys =
  | 'calc.rectangle-area.page.answer'
  | 'calc.rectangle-area.page.areaFt2'
  | 'calc.rectangle-area.page.areaM2'
  | 'calc.rectangle-area.page.drawing'
  | 'calc.rectangle-area.page.example';

/** The keys core derives for every calculator of the registry, one calculator at a time. */
type DerivedKeys<C = (typeof calculators)[number]> = C extends Parameters<typeof messageKeysOf>[0]
  ? MessageKeysOf<C>
  : never;

describe('catalog keys against the calculator (i18n-catalog › Convention for the proof calculator)', () => {
  // design: Completeness proof: the keys core derives all exist in the English modules
  it('has an English message for every key that core derives for a calculator of the registry', () => {
    expectTypeOf<DerivedKeys>().toExtend<EnglishKeys>();
  });

  it('has an English errors.<CODE> message for every user-facing error code', () => {
    expectTypeOf<`errors.${AllErrorCode}`>().toExtend<EnglishKeys>();
  });

  // the other direction: the English modules hold nothing the calculator does not use
  it('holds no English key beyond the derived keys, the error codes, the material keys and the page keys', () => {
    expectTypeOf<EnglishKeys>().toExtend<
      | DerivedKeys
      | `errors.${AllErrorCode}`
      | MaterialKeys<typeof concreteMix>
      | ConcretePageKeys
      | RectangleAreaPageKeys
    >();
  });

  // spec: i18n-catalog › [ICW11] the page keys of the English module are exactly these
  it('holds exactly the page keys of the list, no more and no fewer', () => {
    expectTypeOf<
      Extract<keyof typeof enConcrete, `calc.concrete.page.${string}`>
    >().toEqualTypeOf<ConcretePageKeys>();
    expectTypeOf<
      Extract<keyof typeof enRectangleArea, `calc.rectangle-area.page.${string}`>
    >().toEqualTypeOf<RectangleAreaPageKeys>();
  });
});
