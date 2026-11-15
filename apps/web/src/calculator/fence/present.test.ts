import { describe, expect, it } from 'vitest';
import { fence } from '../../lib/fence.ts';
import type { Moment } from '../page-module.ts';
import { DASH } from '../present.ts';
import { bagFills, boardFills, postFills, railFills } from './present.ts';

const valid = (() => {
  const state = fence.validate({});
  if (!state.ok) throw new Error('the defaults are invalid');
  return state.value;
})();

/** A moment whose form holds no result (a field is invalid): every line shows the dash. */
const waiting: Moment<typeof fence> = {
  system: 'imperial',
  choices: { style: 'privacy' },
  valid,
  result: undefined,
};

describe('fence shopping fills without a result', () => {
  it('writes the dash in every length and in the bag yield', () => {
    expect(postFills(waiting)).toEqual({ length: DASH });
    expect(railFills(waiting)).toEqual({ length: DASH });
    expect(boardFills(waiting)).toEqual({ length: DASH });
    expect(bagFills(waiting)).toEqual({ yield: DASH });
  });
});
