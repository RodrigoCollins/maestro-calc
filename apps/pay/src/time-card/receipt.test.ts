import { timeCard } from '@maestro-calc/pay-core/time-card';
import { describe, expect, it } from 'vitest';
import { receiptMessage, weekSummary } from './receipt.ts';

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

describe('weekSummary', () => {
  it('lists each day worked, the total with its overtime, the pay and the link, in English', () => {
    expect(weekSummary(ran.value, 'en', url)).toBe(
      [
        'My hours this week',
        'Mon 9 h',
        'Tue 9 h',
        'Wed 9 h',
        'Thu 9 h',
        'Fri 9 h',
        'Sat 4.5 h',
        'Total: 49.5 h (9.5 h overtime)',
        'Gross pay: $1,193.50',
        url,
      ].join('\n'),
    );
  });

  it('says the same in Spanish', () => {
    expect(weekSummary(ran.value, 'es', url)).toBe(
      [
        'Mis horas de la semana',
        'Lun 9 h',
        'Mar 9 h',
        'Mié 9 h',
        'Jue 9 h',
        'Vie 9 h',
        'Sáb 4.5 h',
        'Total: 49.5 h (9.5 h extra)',
        'Pago bruto: $1,193.50',
        url,
      ].join('\n'),
    );
  });

  it('leaves out the days off and the overtime there is none of', () => {
    const short = timeCard.run({ fri: '', sat: '' });
    if (!short.ok) throw new Error('must run');
    expect(weekSummary(short.value, 'en', url)).toBe(
      `My hours this week\nMon 9 h\nTue 9 h\nWed 9 h\nThu 9 h\nTotal: 36 h\nGross pay: $792.00\n${url}`,
    );
  });

  it('names double time when there is some', () => {
    const long = timeCard.run({ rule: 'california', mon: '6:00 am', monOut: '7:30 pm' });
    if (!long.ok) throw new Error('must run');
    expect(weekSummary(long.value, 'es', url)).toMatch(
      /\nTotal: [\d.]+ h \([\d.]+ h extra, 1 h doble\)\n/,
    );
  });
});
