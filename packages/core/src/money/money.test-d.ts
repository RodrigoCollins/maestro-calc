import { describe, expectTypeOf, it } from 'vitest';
import { add } from '../units/ops.ts';
import type { Quantity } from '../units/quantity.ts';
import { Rational } from '../rational/rational.ts';
import { addMoney, usd, type Money } from './money.ts';

declare const length: Quantity<'length'>;
declare const money: Money;

describe('money types (money › Exact money)', () => {
  // spec: money › Exact money — the brand forbids literals
  it('does not accept an object literal as money', () => {
    const literal = { currency: 'USD', amount: Rational.ONE } as const;
    // control: every field is right, so the literal has the unbranded shape of money
    const unbranded: Pick<Money, 'currency' | 'amount'> = literal;
    // @ts-expect-error only the missing unique-symbol brand makes this an error
    const forged: Money = literal;
    expectTypeOf(unbranded).toEqualTypeOf<Pick<Money, 'currency' | 'amount'>>();
    expectTypeOf(forged).toEqualTypeOf<Money>();
  });

  // spec: money › Mismatched dimension — money never reaches the quantity operations
  it('keeps money and quantities apart', () => {
    expectTypeOf(addMoney(usd(1), money)).toEqualTypeOf<Money>();
    // @ts-expect-error a Money is not a Quantity
    add(money, money);
    // @ts-expect-error a Money is not a Quantity, even as the second operand
    add(length, money);
    // @ts-expect-error a length is not Money
    addMoney(money, length);
    // @ts-expect-error a length is not Money
    addMoney(length, money);
  });
});
