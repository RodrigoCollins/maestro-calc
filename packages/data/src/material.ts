import { CoreError, sign, type DimensionName, type Quantity } from '@maestro-calc/core';

/** Where a material comes from; `retrieved` is a real calendar date, `YYYY-MM-DD`. */
export interface MaterialSource {
  readonly name: string;
  readonly retrieved: string;
  readonly url?: string;
}

/**
 * One way to buy a material. `size` is the exact physical amount one unit provides (32 ft2 for a
 * 4 x 8 ft sheet), of any dimension, and never a JavaScript number.
 */
export interface PurchaseUnit<Id extends string = string> {
  readonly id: string;
  readonly nameKey: `material.${Id}.units.${string}`;
  readonly size: Quantity<DimensionName>;
}

/** A material and its purchase units. Prices are not part of the record: they are money inputs. */
export interface MaterialRecord<Id extends string = string> {
  readonly id: Id;
  readonly nameKey: `material.${Id}.name`;
  readonly purchaseUnits: readonly [PurchaseUnit<Id>, ...PurchaseUnit<Id>[]];
  readonly source: MaterialSource;
}

/** Why a record is rejected; each is the `reason` of an `INVALID_MATERIAL` error. */
type MaterialReason =
  | 'INVALID_ID'
  | 'INVALID_NAME_KEY'
  | 'NO_PURCHASE_UNITS'
  | 'INVALID_UNIT_ID'
  | 'DUPLICATE_UNIT_ID'
  | 'INVALID_UNIT_NAME_KEY'
  | 'NON_POSITIVE_SIZE'
  | 'MISSING_SOURCE'
  | 'INVALID_SOURCE_DATE';

const ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/**
 * Where a record is faulty, carried as the `cause` of the `INVALID_MATERIAL` error: the material
 * `id` and, for a purchase unit, the unit `id`. Only identifiers, never prose.
 */
export interface MaterialLocus {
  readonly id: string;
  readonly unit?: string;
}

const ensureIn =
  (id: string) =>
  (condition: boolean, reason: MaterialReason, unit?: string): void => {
    if (condition) return;
    const locus: MaterialLocus = unit === undefined ? { id } : { id, unit };
    throw new CoreError('INVALID_MATERIAL', reason, { cause: locus });
  };

/**
 * Defines a material: validates it eagerly, deep-freezes it and returns it. A faulty record throws
 * `CoreError('INVALID_MATERIAL', reason)`; the name keys must be `material.<id>.name` and
 * `material.<id>.units.<unitId>`, the shape the i18n catalogs are checked against.
 */
export const defineMaterial = <const Id extends string>(
  record: MaterialRecord<Id>,
): MaterialRecord<Id> => {
  const { id, nameKey, purchaseUnits, source } = record;
  const ensure = ensureIn(id);
  ensure(ID.test(id), 'INVALID_ID');
  ensure(nameKey === `material.${id}.name`, 'INVALID_NAME_KEY');
  ensure(purchaseUnits.length > 0, 'NO_PURCHASE_UNITS');
  const seen = new Set<string>();
  for (const unit of purchaseUnits) {
    ensure(ID.test(unit.id), 'INVALID_UNIT_ID', unit.id);
    ensure(unit.nameKey === `material.${id}.units.${unit.id}`, 'INVALID_UNIT_NAME_KEY', unit.id);
    ensure(sign(unit.size) > 0, 'NON_POSITIVE_SIZE', unit.id);
    ensure(!seen.has(unit.id), 'DUPLICATE_UNIT_ID', unit.id);
    seen.add(unit.id);
  }
  for (const unit of purchaseUnits) Object.freeze(unit);
  Object.freeze(purchaseUnits);
  Object.freeze(source);
  return Object.freeze(record);
};
