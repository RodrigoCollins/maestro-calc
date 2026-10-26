import {
  optionOf,
  fail,
  type AnswerSlot,
  type AnyCalculator,
  type SelectKey,
} from '../page-module.ts';

/**
 * The short answer of a page: its template key, which follows the select `by` when there is one
 * (`answer.slab`) and is `answer` otherwise, and the pure function that fills the template from
 * the moment and the primary text. The words stay in the catalog (`calc.<id>.page.<template>`).
 */
export function answerSlot<C extends AnyCalculator>(
  calculator: C,
  spec: { readonly by?: SelectKey<C>; readonly values: AnswerSlot<C>['values'] },
): AnswerSlot<C>;
export function answerSlot(
  calculator: AnyCalculator,
  spec: { readonly by?: string; readonly values: AnswerSlot<AnyCalculator>['values'] },
): AnswerSlot<AnyCalculator> {
  const { by, values } = spec;
  if (by === undefined) return { templates: ['answer'], template: () => 'answer', values };
  const select = calculator.inputs.find((input) => input.key === by);
  if (select?.kind !== 'select') return fail('ANSWER_SELECT', calculator.id, by);
  return {
    templates: select.options.map((option) => `answer.${option}`),
    template: (valid) => `answer.${optionOf(valid, by)}`,
    values,
  };
}
