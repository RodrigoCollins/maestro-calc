import { describe, expect, it } from 'vitest';
import type { CivilDate } from '../calendar/calendar.ts';
import {
  finiquitoOf,
  INDEMNIZACION_DAYS,
  SEPARATION_EXEMPT_UMA,
  VEINTE_DIAS_PER_YEAR,
  type FiniquitoInput,
} from './finiquito.ts';

const date = (y: number, m: number, d: number): CivilDate => ({ y, m, d });

// The rules, as the Ley Federal del Trabajo (Cámara de Diputados text, last reform DOF
// 21-02-2025) and the Ley del ISR (last reform DOF 01-04-2024) read on 2026-11-16:
// - LFT art. 87: the aguinaldo of 15 days, its share for the days worked in the year.
// - LFT arts. 76, 79 and 80: the vacation days of the year completed and not taken, the share of
//   the year begun («una remuneración proporcionada al tiempo de servicios prestados»), and a prima
//   of 25% on their salary.
// - LFT art. 162: 12 days a year (arts. 485 and 486: from the minimum wage to twice it), on any
//   dismissal and on a resignation from 15 years.
// - LFT arts. 48, 50 and 89: on an unjustified dismissal, three months (90 days) of the integrated
//   salary, and 20 days of it for each year of service when the employer refuses reinstatement.
// - LISR art. 93 fr. XIII: the separation payments are free of ISR up to 90 UMA for each year of
//   service, a fraction of more than six months counting as a whole year; fr. XIV: 30 UMA of the
//   aguinaldo and 15 UMA of the prima vacacional. UMA 2026: $117.31 (DOF 09-01-2026).
// Every figure below was worked by hand with exact fractions, rounded half up once.

/** $15,000 a month from 1 March 2019 to 15 November 2026, dismissed with no cause. */
const BASE: FiniquitoInput = {
  wageCents: 1_500_000,
  period: 'month',
  zone: 'general',
  start: date(2019, 3, 1),
  end: date(2026, 11, 15),
  exit: 'unjustifiedDismissal',
  refusedReinstatement: false,
  vacationTaken: 4,
  unpaidDays: 15,
};

describe('the legal figures', () => {
  it('holds the days and the exemption of the law', () => {
    expect(INDEMNIZACION_DAYS).toBe(90);
    expect(VEINTE_DIAS_PER_YEAR).toBe(20);
    expect(SEPARATION_EXEMPT_UMA).toBe(90);
  });
});

describe('finiquitoOf', () => {
  it('works the finiquito and the liquidación of an unjustified dismissal', () => {
    const result = finiquitoOf(BASE);
    // 15,000 / 30 = 500.00 a day; 7 years and 260 days (1 March 2026 to 16 November 2026)
    expect(result.dailyCents).toBe(50000);
    expect([result.years, result.extraDays, result.yearDays]).toEqual([7, 260, 365]);
    // 15 unpaid days: 500 × 15 = 7,500.00
    expect(result.unpaidCents).toBe(750000);
    // 1 January to 15 November: 319 days; 500 × 15 × 319 / 365 = 6,554.794… → 6,554.79
    expect(result.aguinaldo.daysWorked).toBe(319);
    expect(result.aguinaldo.amountCents).toBe(655479);
    // 22 days of the seventh year, 22 × 260 / 365 = 15.67 of the eighth, less 4 taken: 33.67
    expect(result.pendingVacationDays).toBe(22);
    expect(result.proportionalHundredths).toBe(1567);
    expect(result.vacationHundredths).toBe(3367);
    // 500 × 12,290 / 365 = 16,835.616… → 16,835.62; 25% of it: 4,208.904… → 4,208.90
    expect(result.vacationCents).toBe(1683562);
    expect(result.primaVacacionalCents).toBe(420890);
    // 500 is under the cap of 630.08: 500 × 12 × 2,815 / 365 = 46,273.972… → 46,273.97
    expect(result.antiguedad.baseCents).toBe(50000);
    expect(result.antiguedadCents).toBe(4627397);
    // the integrated salary of the eighth year: 500 × (365 + 15 + 5.5) / 365 = 528.082… → 528.08
    expect(result.sdi.sdiCents).toBe(52808);
    // 528.08 × 90 = 47,527.20; no 20 days unless the employer refuses reinstatement
    expect(result.indemnizacionCents).toBe(4752720);
    expect(result.veinteDiasCents).toBe(0);
    // 7,500 + 6,554.79 + 16,835.62 + 4,208.90 + 46,273.97 = 81,373.28
    expect(result.finiquitoCents).toBe(8137328);
    expect(result.liquidacionCents).toBe(4752720);
    expect(result.totalCents).toBe(12890048);
  });

  it('splits what is free of ISR: 90 UMA a year of service, 30 and 15 UMA', () => {
    const { isr } = finiquitoOf(BASE);
    // 260 days past 1 September 2026, six months after the anniversary: 8 years
    expect(isr.exemptYears).toBe(8);
    // 46,273.97 + 47,527.20 = 93,801.17, free up to 90 × 117.31 × 8 = 84,463.20
    expect(isr.separationCents).toBe(9380117);
    expect(isr.separationExemptCents).toBe(8446320);
    expect(isr.aguinaldoExemptCents).toBe(351930);
    expect(isr.primaExemptCents).toBe(175965);
    // 84,463.20 + 3,519.30 + 1,759.65 = 89,742.15; 128,900.48 − 89,742.15 = 39,158.33
    expect(isr.exemptCents).toBe(8974215);
    expect(isr.taxableCents).toBe(3915833);
  });

  it('adds 20 days a year of the integrated salary when the employer refuses reinstatement', () => {
    const result = finiquitoOf({ ...BASE, refusedReinstatement: true });
    // 528.08 × 20 × 2,815 / 365 = 81,454.528… → 81,454.53
    expect(result.veinteDiasCents).toBe(8145453);
    expect(result.liquidacionCents).toBe(12898173);
    expect(result.totalCents).toBe(21035501);
    expect(result.isr.separationCents).toBe(17525570);
    expect(result.isr.taxableCents).toBe(12061286);
  });

  it('pays no indemnización and no prima de antigüedad on a resignation before 15 years', () => {
    // 315.04 a day from 1 February to 31 August 2026: 212 days, under the first year
    const result = finiquitoOf({
      wageCents: 31504,
      period: 'day',
      zone: 'general',
      start: date(2026, 2, 1),
      end: date(2026, 8, 31),
      exit: 'resignation',
      refusedReinstatement: true,
      vacationTaken: 0,
      unpaidDays: 0,
    });
    expect([result.years, result.extraDays]).toEqual([0, 212]);
    // 315.04 × 15 × 212 / 365 = 2,744.725… → 2,744.73
    expect(result.aguinaldo.amountCents).toBe(274473);
    // 12 × 212 / 365 = 6.97 days; 315.04 × 2,544 / 365 = 2,195.785… → 2,195.79; 25%: 548.95
    expect(result.pendingVacationDays).toBe(0);
    expect(result.vacationHundredths).toBe(697);
    expect(result.vacationCents).toBe(219579);
    expect(result.primaVacacionalCents).toBe(54895);
    expect(result.antiguedad.eligible).toBe(false);
    expect(result.antiguedadCents).toBe(0);
    expect(result.indemnizacionCents).toBe(0);
    expect(result.veinteDiasCents).toBe(0);
    expect(result.finiquitoCents).toBe(548947);
    expect(result.totalCents).toBe(548947);
    // the whole aguinaldo and prima are under 30 and 15 UMA
    expect(result.isr.exemptCents).toBe(274473 + 54895);
    expect(result.isr.taxableCents).toBe(219579);
  });

  it('pays the prima de antigüedad on a resignation at 15 years', () => {
    // $12,000 a month from 1 July 2011 to 30 June 2026: 15 years exactly
    const result = finiquitoOf({
      wageCents: 1_200_000,
      period: 'month',
      zone: 'general',
      start: date(2011, 7, 1),
      end: date(2026, 6, 30),
      exit: 'resignation',
      refusedReinstatement: false,
      vacationTaken: 0,
      unpaidDays: 5,
    });
    expect([result.years, result.extraDays]).toEqual([15, 0]);
    // 400 × 12 × 15 = 72,000.00, all of it under 90 × 117.31 × 15 = 158,368.50
    expect(result.antiguedadCents).toBe(7200000);
    expect(result.isr.exemptYears).toBe(15);
    expect(result.isr.separationExemptCents).toBe(7200000);
    // the 24 days of the fifteenth year, none of the sixteenth begun: 400 × 24 = 9,600.00
    expect(result.vacationHundredths).toBe(2400);
    expect(result.vacationCents).toBe(960000);
    // 2,000.00 + 2,975.34 + 9,600.00 + 2,400.00 + 72,000.00
    expect(result.finiquitoCents).toBe(8897534);
    expect(result.liquidacionCents).toBe(0);
    expect(result.isr.taxableCents).toBe(1224035);
  });

  it('caps the prima at twice the border minimum and the exemption at 90 UMA a year', () => {
    const result = finiquitoOf({
      wageCents: 4_000_000,
      period: 'month',
      zone: 'border',
      start: date(2010, 1, 10),
      end: date(2026, 6, 30),
      exit: 'unjustifiedDismissal',
      refusedReinstatement: true,
      vacationTaken: 10,
      unpaidDays: 0,
    });
    // 2 × 440.87 = 881.74; 16 years and 172 days: 881.74 × 12 × (16 + 172/365) = 174,280.14
    expect(result.antiguedad.capped).toBe(true);
    expect(result.antiguedadCents).toBe(17428014);
    // 1,333.33 × (365 + 15 + 6.5) / 365 = 1,411.87; × 90 = 127,068.30
    expect(result.sdi.sdiCents).toBe(141187);
    expect(result.indemnizacionCents).toBe(12706830);
    expect(result.veinteDiasCents).toBe(46510479);
    expect(result.totalCents).toBe(82345780);
    // the service runs to 1 July, before 10 July, six months after the anniversary: 16 years,
    // free up to 90 × 117.31 × 16 = 168,926.40
    expect(result.isr.exemptYears).toBe(16);
    expect(result.isr.separationExemptCents).toBe(16892640);
    expect(result.isr.taxableCents).toBe(64925245);
  });

  it('counts exactly six months as no whole year, and never owes fewer than 0 vacation days', () => {
    // 1 March 2020 to 31 August 2026: 6 years and 184 days, the fraction is six months exactly
    const result = finiquitoOf({
      wageCents: 1_200_000,
      period: 'month',
      zone: 'general',
      start: date(2020, 3, 1),
      end: date(2026, 8, 31),
      exit: 'justifiedDismissal',
      refusedReinstatement: true,
      vacationTaken: 30,
      unpaidDays: 0,
    });
    expect(result.isr.exemptYears).toBe(6);
    expect(result.antiguedadCents).toBe(3121973);
    expect(result.indemnizacionCents).toBe(0);
    expect(result.veinteDiasCents).toBe(0);
    // 22 + 22 × 184 / 365 − 30 = 3.09 days
    expect(result.vacationHundredths).toBe(309);
    expect(result.primaVacacionalCents).toBe(30904);
    expect(result.finiquitoCents).toBe(3675945);
    const none = finiquitoOf({ ...BASE, vacationTaken: 60 });
    expect(none.vacationHundredths).toBe(0);
    expect(none.vacationCents).toBe(0);
    expect(none.primaVacacionalCents).toBe(0);
  });

  it('takes the six months of a 31 August anniversary to the last day of February', () => {
    // 31 August 2025 + 6 months is 28 February 2026: a last day of 27 February serves six months
    // exactly, a last day of 28 February more than six
    const at = (end: CivilDate) =>
      finiquitoOf({ ...BASE, start: date(2024, 8, 31), end, vacationTaken: 0 }).isr.exemptYears;
    expect(at(date(2026, 2, 27))).toBe(1);
    expect(at(date(2026, 2, 28))).toBe(2);
  });

  it('refuses an end before the start', () => {
    expect(() => finiquitoOf({ ...BASE, end: date(2019, 2, 28) })).toThrow(RangeError);
  });
});
