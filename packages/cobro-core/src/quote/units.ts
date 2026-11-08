import { Rational } from '@maestro-calc/core';

/** The whole purchase units of the material `materialId` in a shopping list; none when it has no line. */
export const unitsOf = (
  lines: readonly { readonly materialId: string; readonly qty: bigint }[],
  materialId: string,
): Rational => Rational.of(lines.find((line) => line.materialId === materialId)?.qty ?? 0n);
