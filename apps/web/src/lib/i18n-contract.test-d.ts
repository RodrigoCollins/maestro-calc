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
  it('holds no English key beyond the derived keys, the error codes and the material keys', () => {
    expectTypeOf<EnglishKeys>().toExtend<
      DerivedKeys | `errors.${AllErrorCode}` | MaterialKeys<typeof concreteMix>
    >();
  });
});
