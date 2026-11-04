import { isMoney, usd } from '../../money/money.ts';
import { parseMoney } from '../../money/parse.ts';
import { ok } from '../../result.ts';
import type { InputKind, MoneyDescriptor } from '../descriptors.ts';
import { builderOf, parseText, readUrlAmount, withinBounds } from './shared.ts';

/** US dollars: money as it is, or text in the money grammar; the URL holds the dollars. */
const MONEY: InputKind<MoneyDescriptor> = {
  read: (input, raw) => {
    const money = isMoney(raw) ? ok(raw) : parseText(raw, parseMoney);
    return money.ok ? withinBounds(input, money.value.amount, money.value) : money;
  },
  urlText: (_input, value) => (isMoney(value) ? value.amount.toString() : undefined),
  fromUrl: (input, text) => {
    const amount = readUrlAmount(input, text);
    return amount === undefined ? undefined : usd(amount);
  },
};

/** An amount of US dollars; the minimum defaults to `usd(0)` and is never negative. */
export const moneyInput = /* @__PURE__ */ builderOf<MoneyDescriptor>('money', MONEY);
