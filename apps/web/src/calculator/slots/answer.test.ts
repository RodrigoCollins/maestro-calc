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
    expect(byShape.template(valid({ shape }))).toBe(`answer.${shape}`);
  });

  it('has the one template answer when no select drives it', () => {
    const plain = answerSlot(concrete, { values });
    expect(plain.templates).toEqual(['answer']);
    expect(plain.template(valid({ shape: 'column' }))).toBe('answer');
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
    expect(() => byShape.template({ ...valid({}), shape: 3 } as never)).toThrow(
      'shape holds no option',
    );
  });

  it('reads a select of any fixture', () => {
    const answer = answerSlot(choiceCalculator, { by: 'mode', values: () => ({}) });
    expect(answer.templates).toEqual(['answer.small', 'answer.large', 'answer.huge']);
  });
});
