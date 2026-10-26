import {
  fail,
  isTextInput,
  type AnyCalculator,
  type ChoiceGroup,
  type ChoiceSlot,
  type SelectKey,
  type TextKey,
} from '../page-module.ts';

/**
 * The fields each option of a select shows. Every select of a definition is a choice group with no
 * slot code; this adds, per group, what each option value reveals. The reserved height is the
 * largest of those sets, so a taller option grows the area with no constant edited (D12).
 */
export function choiceSlot<C extends AnyCalculator>(
  calculator: C,
  groups: readonly {
    readonly select: SelectKey<C>;
    readonly shows: Readonly<Record<string, readonly TextKey<C>[]>>;
  }[],
): ChoiceSlot<C>;
export function choiceSlot(
  calculator: AnyCalculator,
  groups: readonly {
    readonly select: string;
    readonly shows: Readonly<Record<string, readonly string[]>>;
  }[],
): ChoiceSlot<AnyCalculator> {
  const textKeys = new Set(calculator.inputs.filter(isTextInput).map(({ key }) => key));
  const refuse = (at: string): never => fail('CHOICE_OPTIONS', calculator.id, at);
  const groupOf = ({ select, shows }: (typeof groups)[number]): ChoiceGroup<AnyCalculator> => {
    const input = calculator.inputs.find((found) => found.key === select);
    if (input?.kind !== 'select') return refuse(select);
    const sets = input.options.map((option) => shows[option] ?? refuse(select));
    const used = new Set(sets.flat());
    for (const key of used) if (!textKeys.has(key)) refuse(key);
    return {
      select,
      driven: calculator.inputs.map(({ key }) => key).filter((key) => used.has(key)),
      rows: Math.max(...sets.map((set) => set.length)),
      shown: (option) => shows[option] ?? [],
    };
  };
  return { groups: groups.map(groupOf) };
}
