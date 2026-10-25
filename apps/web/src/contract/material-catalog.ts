import * as data from '@maestro-calc/data';
import type { MaterialRecord } from '@maestro-calc/data';
import type { Result, ShoppingLine } from '@maestro-calc/core';

const isMaterialRecord = (value: unknown): value is MaterialRecord =>
  typeof value === 'object' && value !== null && 'purchaseUnits' in value;

/** Every material record the data package ships, read from its entry point. */
export const materials: readonly MaterialRecord[] = Object.values(data).flatMap((value) =>
  isMaterialRecord(value) ? [value] : [],
);

/** The catalog keys of one material: its name, then one per purchase unit (i18n-catalog › naming). */
export const materialKeysOf = (material: MaterialRecord): string[] => [
  material.nameKey,
  ...material.purchaseUnits.map(({ nameKey }) => nameKey),
];

/** The material keys that `catalog` has no entry for, by name, in record order. */
export const missingMaterialKeys = (
  records: readonly MaterialRecord[],
  catalog: Readonly<Record<string, string>>,
): string[] => records.flatMap(materialKeysOf).filter((key) => !Object.hasOwn(catalog, key));

/** What `materialsBoughtBy` reads of a calculator: its run, whose shopping names the materials. */
interface Buyer {
  readonly run: (raw: Readonly<Record<string, unknown>>) => Result<
    {
      readonly shopping: readonly ShoppingLine[];
    },
    unknown
  >;
}

/** The materials among `records` that the default run of `calculator` puts on its shopping list. */
export const materialsBoughtBy = (
  calculator: Buyer,
  records: readonly MaterialRecord[],
): MaterialRecord[] => {
  const result = calculator.run({});
  if (!result.ok) throw new Error('the default run of a calculator must succeed');
  const bought = new Set(result.value.shopping.map(({ materialId }) => materialId));
  return records.filter(({ id }) => bought.has(id));
};
