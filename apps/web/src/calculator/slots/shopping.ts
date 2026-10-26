import { DASH, groupedInteger } from '../present.ts';
import {
  shoppingLinesOf,
  type AnyCalculator,
  type ShoppingLineSpec,
  type ShoppingSlot,
} from '../page-module.ts';

/**
 * The shopping lines a page shows, declared by material. Each is matched to the engine's line by
 * `materialId`, never by position, so the number of lines in the markup stays fixed (K15); `view`
 * throws `SHOPPING_LINES` when the engine's lines or purchase units drift from the declared ones.
 */
export function shoppingSlot<C extends AnyCalculator>(
  calculator: C,
  lines: readonly ShoppingLineSpec<C>[],
): ShoppingSlot<C>;
export function shoppingSlot(
  calculator: AnyCalculator,
  lines: readonly ShoppingLineSpec<AnyCalculator>[],
): ShoppingSlot<AnyCalculator> {
  const materials = lines.map(({ material }) => material);
  return {
    lines,
    view: (moment) => {
      const shown = lines.map((line) => ({ material: line.material, ...line.parts(moment) }));
      const engine =
        moment.result === undefined
          ? []
          : shoppingLinesOf(
              calculator.id,
              materials,
              moment.result.shopping,
              shown.map(({ unit }) => unit),
            );
      return shown.map((line, index) => {
        const found = engine[index];
        return { ...line, qty: found === undefined ? DASH : groupedInteger(found.qty) };
      });
    },
  };
}
