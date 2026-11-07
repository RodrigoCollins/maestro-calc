import { timeCard } from '@maestro-calc/pay-core/time-card';
import { describe, expect, it } from 'vitest';
import { receiptMessage } from './receipt.ts';

const ran = timeCard.run({});
if (!ran.ok) throw new Error('the default week must run');
const url = 'https://cuentahoras.com/es/calculadora-de-horas-trabajadas?v=1';

describe('receiptMessage', () => {
  it('sums up the week in Spanish with the link', () => {
    expect(receiptMessage(ran.value, 'es', url)).toBe(
      `Mis horas de la semana: 49.5 h, $1,193.50 (9.5 h extra).\n${url}`,
    );
  });

  it('sums up the week in English with the link', () => {
    expect(receiptMessage(ran.value, 'en', url)).toBe(
      `My hours this week: 49.5 h, $1,193.50 (9.5 h overtime).\n${url}`,
    );
  });

  it('leaves out overtime and double time when there are none', () => {
    const short = timeCard.run({ fri: '', sat: '' });
    if (!short.ok) throw new Error('must run');
    expect(receiptMessage(short.value, 'en', url)).toBe(
      `My hours this week: 36 h, $792.00.\n${url}`,
    );
  });

  it('names double time when there is some', () => {
    const long = timeCard.run({ rule: 'california', mon: '6:00 am', monOut: '7:30 pm' });
    if (!long.ok) throw new Error('must run');
    expect(receiptMessage(long.value, 'es', url)).toContain('h extra, 1 h doble)');
  });
});
