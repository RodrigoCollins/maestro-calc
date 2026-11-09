import { militaryTimeOf } from '@maestro-calc/pay-core/military-time';
import { describe, expect, it } from 'vitest';
import { spanishNumber, spokenEs, twelveOf } from './words.ts';

describe('spanishNumber', () => {
  it.each([
    [0, 'cero'],
    [1, 'uno'],
    [10, 'diez'],
    [15, 'quince'],
    [16, 'dieciséis'],
    [20, 'veinte'],
    [21, 'veintiuno'],
    [22, 'veintidós'],
    [23, 'veintitrés'],
    [24, 'veinticuatro'],
    [26, 'veintiséis'],
    [30, 'treinta'],
    [31, 'treinta y uno'],
    [45, 'cuarenta y cinco'],
    [59, 'cincuenta y nueve'],
  ])('says %i as %s', (value, words) => {
    expect(spanishNumber(value)).toBe(words);
  });

  it('says one as una before a feminine noun, the hour', () => {
    expect(spanishNumber(1, 'una')).toBe('una');
    expect(spanishNumber(21, 'una')).toBe('veintiuna');
    expect(spanishNumber(31, 'una')).toBe('treinta y una');
  });
});

describe('spokenEs', () => {
  it.each([
    [0, 'las cero horas'],
    [60, 'la una'],
    [480, 'las ocho horas'],
    [900, 'las quince horas'],
    [1260, 'las veintiuna horas'],
    [1440, 'las veinticuatro horas'],
    [5, 'las cero horas y cinco minutos'],
    [90, 'la una y treinta minutos'],
    [825, 'las trece horas y cuarenta y cinco minutos'],
    [1439, 'las veintitrés horas y cincuenta y nueve minutos'],
  ])('reads minute %i as %s', (minutes, words) => {
    expect(spokenEs(militaryTimeOf(minutes))).toBe(words);
  });
});

describe('twelveOf', () => {
  it('writes the 12-hour clock as each language does: PM in English, p. m. in Spanish', () => {
    expect(twelveOf(militaryTimeOf(900), 'en')).toBe('3:00 PM');
    expect(twelveOf(militaryTimeOf(900), 'es')).toBe('3:00 p. m.');
    expect(twelveOf(militaryTimeOf(30), 'es')).toBe('12:30 a. m.');
  });
});
