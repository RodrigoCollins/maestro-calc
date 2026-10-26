import { fail, type AnyPageModule } from './page-module.ts';

/** One item of the form, in the order the page renders it. */
export type FormItem =
  | {
      readonly kind: 'choice';
      readonly select: string;
      /** The block the select drives: the fields any option shows and the rows it reserves. */
      readonly area?: { readonly fields: readonly string[]; readonly rows: number };
    }
  | { readonly kind: 'field'; readonly key: string; readonly stepper: boolean };

/**
 * The form of a module: its inputs in declaration order, each select as a choice item that holds the
 * fields its slot group drives. The driven fields must directly follow their select, so the order
 * of the page is the order of the definition; a boolean has no control on the page, and a driven
 * field has no stepper, so both throw `FORM_ORDER` rather than vanish. Server only:
 * the builder reads it, the client never does.
 */
export const formOf = (module: AnyPageModule): readonly FormItem[] => {
  const { id, inputs } = module.calculator;
  const items: FormItem[] = [];
  let driven = 0;
  for (const [index, input] of inputs.entries()) {
    if (driven > 0) {
      // a choice area renders plain fields, so a stepper on one would vanish from the page
      if (module.steppers?.keys.some((key) => key === input.key))
        return fail('FORM_ORDER', id, input.key);
      driven -= 1;
    } else if (input.kind === 'boolean') {
      return fail('FORM_ORDER', id, input.key);
    } else if (input.kind !== 'select') {
      items.push({
        kind: 'field',
        key: input.key,
        stepper: module.steppers?.keys.some((key) => key === input.key) ?? false,
      });
    } else {
      const group = module.choices?.groups.find(({ select }) => select === input.key);
      if (group === undefined) {
        items.push({ kind: 'choice', select: input.key });
      } else {
        const after = inputs.slice(index + 1, index + 1 + group.driven.length);
        if (!group.driven.every((key, at) => after[at]?.key === key)) {
          return fail('FORM_ORDER', id, input.key);
        }
        items.push({
          kind: 'choice',
          select: input.key,
          area: { fields: group.driven, rows: group.rows },
        });
        driven = group.driven.length;
      }
    }
  }
  return items;
};
