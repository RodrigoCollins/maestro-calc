import {
  optionOf,
  fail,
  type AnswerSlot,
  type AnyCalculator,
  type Ready,
  type SelectKey,
} from '../page-module.ts';

type Values<C extends AnyCalculator> = AnswerSlot<C>['values'];

/**
 * The short answer of a page: its template key and the pure function that fills the template from
 * the moment and the primary text. The template follows the select `by` when there is one
 * (`answer.slab`), or the case `pick` names among the declared `cases` (`answer.below`), which may
 * read the result; it is `answer` otherwise. The words stay in the catalog
 * (`calc.<id>.page.<template>`).
 */
export function answerSlot<C extends AnyCalculator>(
  calculator: C,
  spec:
    | { readonly by?: SelectKey<C>; readonly values: Values<C> }
    | {
        readonly cases: readonly [string, ...string[]];
        readonly pick: (moment: Ready<C>) => string;
        readonly values: Values<C>;
      },
): AnswerSlot<C>;
export function answerSlot(
  calculator: AnyCalculator,
  spec:
    | { readonly by?: string; readonly values: Values<AnyCalculator> }
    | {
        readonly cases: readonly [string, ...string[]];
        readonly pick: (moment: Ready<AnyCalculator>) => string;
        readonly values: Values<AnyCalculator>;
      },
): AnswerSlot<AnyCalculator> {
  const { values } = spec;
  if ('cases' in spec) {
    const { cases, pick } = spec;
    return {
      templates: cases.map((name) => `answer.${name}`),
      template: (moment) => {
        const name = pick(moment);
        return cases.includes(name) ? `answer.${name}` : fail('ANSWER_CASE', calculator.id, name);
      },
      values,
    };
  }
  const { by } = spec;
  if (by === undefined) return { templates: ['answer'], template: () => 'answer', values };
  const select = calculator.inputs.find((input) => input.key === by);
  if (select?.kind !== 'select') return fail('ANSWER_SELECT', calculator.id, by);
  return {
    templates: select.options.map((option) => `answer.${option}`),
    template: ({ valid }) => `answer.${optionOf(valid, by)}`,
    values,
  };
}
