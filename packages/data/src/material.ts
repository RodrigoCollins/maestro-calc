import { CoreError, isQuantity, sign, type DimensionName, type Quantity } from '@maestro-calc/core';

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
const DATE = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const isLeapYear = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

/**
 * True for a real `YYYY-MM-DD` date. Integer arithmetic only: `Date` would read `2026-02-30` as
 * March and depends on the host clock settings. A month outside 1..12 has no entry, so its last
 * day is 0 and no day fits.
 */
const isCalendarDate = (text: string): boolean => {
  const match = DATE.exec(text);
  if (match === null) return false;
  // the regex guarantees three groups; the defaults only satisfy the index check
  const [year = 0, month = 0, day = 0] = match.slice(1).map(Number);
  const last = month === 2 && isLeapYear(year) ? 29 : (DAYS_IN_MONTH[month - 1] ?? 0);
  return day >= 1 && day <= last;
};

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null;

const hasSourceName = (source: unknown): boolean =>
  isRecord(source) && typeof source['name'] === 'string' && source['name'].trim() !== '';

/** The id of a purchase unit, or `undefined` when the unit is not an object with a text id. */
const unitIdOf = (unit: unknown): string | undefined =>
  isRecord(unit) && typeof unit['id'] === 'string' ? unit['id'] : undefined;

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
 * `CoreError('INVALID_MATERIAL', reason)`; each unit is checked on its own before its id is compared
 * with the earlier ones, and the name keys must be `material.<id>.name` and
 * `material.<id>.units.<unitId>`, the shape the i18n catalogs are checked against.
 */
export const defineMaterial = <const Id extends string>(
  record: MaterialRecord<Id>,
): MaterialRecord<Id> => {
  const { id, nameKey, purchaseUnits, source } = record;
  const ensure = ensureIn(id);
  ensure(ID.test(id), 'INVALID_ID');
  ensure(nameKey === `material.${id}.name`, 'INVALID_NAME_KEY');
  ensure(Array.isArray(purchaseUnits) && purchaseUnits.length > 0, 'NO_PURCHASE_UNITS');
  const seen = new Set<string>();
  for (const unit of purchaseUnits) {
    const unitId = unitIdOf(unit);
    ensure(unitId !== undefined && ID.test(unitId), 'INVALID_UNIT_ID', unitId);
    ensure(unit.nameKey === `material.${id}.units.${unit.id}`, 'INVALID_UNIT_NAME_KEY', unit.id);
    ensure(isQuantity(unit.size) && sign(unit.size) > 0, 'NON_POSITIVE_SIZE', unit.id);
    ensure(!seen.has(unit.id), 'DUPLICATE_UNIT_ID', unit.id);
    seen.add(unit.id);
  }
  ensure(hasSourceName(source), 'MISSING_SOURCE');
  ensure(isCalendarDate(source.retrieved), 'INVALID_SOURCE_DATE');
  for (const unit of purchaseUnits) Object.freeze(unit);
  Object.freeze(purchaseUnits);
  Object.freeze(source);
  return Object.freeze(record);
};
