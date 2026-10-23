import { describe, expectTypeOf, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import type { InputsOf, UnitSystem } from '../calculator/descriptors.ts';
import { decode, encode, type UrlIssue } from './codec.ts';

describe('url codec types (url-state-codec › Encoding, Decoding)', () => {
  it('types the decoded state like the inputs of the calculator', () => {
    const decoded = decode(fixtureBox, 'v=1');
    expectTypeOf(decoded.state).toEqualTypeOf<InputsOf<typeof fixtureBox.inputs>>();
    expectTypeOf(decoded.state.sel).toEqualTypeOf<'x' | 'y'>();
    expectTypeOf(decoded.unitSystem).toEqualTypeOf<UnitSystem>();
    expectTypeOf(decoded.issues).toEqualTypeOf<readonly UrlIssue[]>();
  });

  it('encodes only a state typed for the calculator', () => {
    const state = decode(fixtureBox, '').state;
    expectTypeOf(encode(fixtureBox, state)).toBeString();
    // @ts-expect-error a select state must be one of the declared option ids
    encode(fixtureBox, { ...state, sel: 'z' });
    // @ts-expect-error a state needs every declared field
    encode(fixtureBox, {});
  });
});
