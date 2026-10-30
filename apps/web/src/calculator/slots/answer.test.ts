import { describe, expect, it } from 'vitest';
import { choiceCalculator, pageModuleErrorOf, unwrap } from '../../__testing__/page-fixtures.ts';
import { concrete } from '../../lib/concrete.ts';
import type { Ready } from '../page-module.ts';
import { answerSlot } from './answer.ts';

const values: (moment: Ready<typeof concrete>, primary: string) => Record<string, string> = (
  _moment,
  primary,
) => ({ primary });

const valid = (raw: Readonly<Record<string, unknown>>) => unwrap(concrete.validate(raw));

/** The ready moment of raw inputs, as the page builds it. */
const momentOf = (raw: Readonly<Record<string, unknown>>): Ready<typeof concrete> => {
  const state = valid(raw);
  return {
    system: 'imperial',
    choices: { shape: state.shape, bag: state.bag },
    valid: state,
    result: unwrap(concrete.run(raw)),
  };
};

describe('answerSlot (calculator-web-core › Page-module contract: answer values)', () => {
  const byShape = answerSlot(concrete, { by: 'shape', values });

  // spec: calculator-web-core › [CWC2] the answer template follows the shape
  it('has one template per option of the select, named answer.<option>', () => {
    expect(byShape.templates).toEqual([
      'answer.slab',
      'answer.footing',
      'answer.column',
      'answer.steps',
    ]);
  });

  it.each(['slab', 'footing', 'column', 'steps'])('picks answer.%s for that shape', (shape) => {
    expect(byShape.template(momentOf({ shape }))).toBe(`answer.${shape}`);
  });

  it('has the one template answer when no select drives it', () => {
    const plain = answerSlot(concrete, { values });
    expect(plain.templates).toEqual(['answer']);
    expect(plain.template(momentOf({ shape: 'column' }))).toBe('answer');
  });

  it('hands the values function the moment and the primary text', () => {
    const moment = {
      system: 'imperial',
      choices: { shape: 'slab', bag: '80' },
      valid: valid({}),
      result: unwrap(concrete.run({})),
    } as const;
    expect(byShape.values(moment, '1.63 cubic yards')).toEqual({ primary: '1.63 cubic yards' });
  });

  it('throws ANSWER_SELECT when the key that drives it is not a select input', () => {
    const error = pageModuleErrorOf(() => answerSlot(concrete, { by: 'waste' as never, values }));
    expect(error.code).toBe('ANSWER_SELECT');
    expect(error.cause).toEqual({ id: 'concrete', at: 'waste' });
  });

  it('throws when the driving select holds no option text', () => {
    const moment = momentOf({});
    expect(() =>
      byShape.template({ ...moment, valid: { ...moment.valid, shape: 3 } } as never),
    ).toThrow('shape holds no option');
  });

  // the template may follow the result instead of a select: one case per outcome
  // (calculator-web-core › answer cases, roof-pitch-calculator)
  it('picks a declared case from the whole moment', () => {
    const byVolume = answerSlot(concrete, {
      cases: ['small', 'large'],
      pick: ({ result }) => ((result.shopping[0]?.qty ?? 0n) > 100n ? 'large' : 'small'),
      values,
    });
    expect(byVolume.templates).toEqual(['answer.small', 'answer.large']);
    expect(byVolume.template(momentOf({}))).toBe('answer.small');
    expect(byVolume.template(momentOf({ length: '30' }))).toBe('answer.large');
  });

  it('throws ANSWER_CASE when the pick names a case it did not declare', () => {
    const odd = answerSlot(concrete, { cases: ['one'], pick: () => 'two', values });
    const error = pageModuleErrorOf(() => odd.template(momentOf({})));
    expect(error.code).toBe('ANSWER_CASE');
    expect(error.cause).toEqual({ id: 'concrete', at: 'two' });
  });

  it('reads a select of any fixture', () => {
    const answer = answerSlot(choiceCalculator, { by: 'mode', values: () => ({}) });
    expect(answer.templates).toEqual(['answer.small', 'answer.large', 'answer.huge']);
  });
});
