import { type Money, Rational, scaleMoney, usd } from '@maestro-calc/core';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { NEVADA_MINIMUM_WAGE } from '@maestro-calc/pay-core/overtime';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { decimalHoursText, hoursMinutesText, hoursText, moneyText } from '../format.ts';
import { FEDERAL_MINIMUM_WAGE } from '../guide/minimum-wage-states.ts';
import { OVERTIME_STATES, OVERTIME_STATES_SOURCES } from '../guide/overtime-states.ts';
import type { Lang } from '../time-card/receipt.ts';
import { clockOf, DAY_MINUTES, fieldOf } from './clock.ts';
import { appliesTo, MEAL_PERIODS, mealMinutesOf, type Window } from './meal-periods.ts';
import type { Shift } from './routes.ts';
import { type LongTailSection, type LongTailSource, SOURCES } from './sections.ts';

/*
 * The sections of a shift page under its answer: the hours worked out by hand, when to clock out to
 * be paid the whole shift with a lunch, the week, the pay period, the month and their overtime,
 * the gross pay at common rates, and the federal and state rules on meal breaks. Every hour and
 * every dollar is the hours calculator's or the time card's; every rule is quoted from its source.
 */

/** The unpaid lunches the sections work with, in minutes. */
const LUNCHES = [30, 60] as const;

/** A time clock that rounds to the nearest quarter hour records a punch up to 7 minutes off as the hour. */
const ROUNDING = 7;

/** The hours a workday may run before the daily overtime of Alaska, California and Nevada. */
const DAILY_LINE = 8;

/** The weekly hours of full time for the IRS (Affordable Care Act) and the BLS (job statistics). */
const FULL_TIME = { irs: 30, bls: 35 } as const;

/**
 * New York Labor Law 162, for a mercantile or other establishment: more than 6 hours across the
 * noonday period of 11 am to 2 pm owes 30 minutes in it; a start before 11 am that runs past 7 pm,
 * 20 more minutes from 5 pm to 7 pm; more than 6 hours from a start between 1 pm and 6 am, 45
 * minutes midway. In minutes from midnight.
 */
const NEW_YORK = {
  over: 6,
  noonFrom: 11 * 60,
  noonTo: 14 * 60,
  eveningTo: 19 * 60,
  lateFrom: 13 * 60,
  lateTo: 6 * 60,
} as const;

/**
 * The federal hours of 14- and 15-year-olds outside agriculture (DOL Fact Sheet #43): from 7 am to
 * 7 pm, 9 pm from June 1 through Labor Day, and no more than 8 hours on a day without school.
 */
const TEEN_HOURS = { from: 7 * 60, to: 19 * 60, summerTo: 21 * 60, day: 8 } as const;

/** The weekdays of the time card, Monday first. */
const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

/** The days and the rate of the time card table: a Monday-to-Friday week at $20.00 an hour. */
const CARD_DAYS = 5;
const CARD_RATE = usd(20);

/** The worked hours of `shift` less `unpaidBreak` minutes, from the hours calculator. */
const hoursOf = (start: number, end: number, unpaidBreak: number): Rational => {
  const ran = hoursBetween.run({
    start: fieldOf(start % DAY_MINUTES),
    end: fieldOf(end % DAY_MINUTES),
    unpaidBreak: String(unpaidBreak),
  });
  const hours = ran.ok ? ran.value.outputs.find(({ key }) => key === 'hours')?.value : undefined;
  if (hours === undefined) throw new Error(`the hours of ${fieldOf(start)} must run`);
  return hours;
};

interface Week {
  readonly pay: Money;
  readonly regularPay: Money;
  readonly overtimePay: Money;
  readonly totalHours: Rational;
  readonly overtimeHours: Rational;
  readonly doubleHours: Rational;
  /** The hours of each day of the card, Monday first. */
  readonly dayHours: readonly Rational[];
}

/** The time card on `days` shifts of `shift` with `unpaidBreak` minutes each, at `rate`, under `rule`. */
const weekOf = (
  shift: Shift,
  days: number,
  unpaidBreak: number,
  rate: Money = usd(15),
  rule: 'federal' | 'california' = 'federal',
): Week => {
  const raw = Object.fromEntries<string>([
    ['rate', moneyText(rate).replace(/[$,]/g, '')],
    ['rule', rule],
    ...WEEKDAYS.flatMap((day, index): [string, string][] =>
      index < days
        ? [
            [day, fieldOf(shift.start)],
            [`${day}Out`, fieldOf(shift.end)],
            [`${day}Break`, String(unpaidBreak)],
          ]
        : [
            [day, ''],
            [`${day}Out`, ''],
            [`${day}Break`, '0'],
          ],
    ),
    ['sun', ''],
    ['sunOut', ''],
    ['sunBreak', '0'],
  ]);
  const ran = timeCard.run(raw);
  if (!ran.ok) throw new Error(`the week of ${shift.slug.en} must run`);
  const out = new Map<string, unknown>(ran.value.outputs.map(({ key, value }) => [key, value]));
  const money = (key: string): Money => out.get(key) as Money;
  const hours = (key: string): Rational => out.get(key) as Rational;
  return {
    pay: money('pay'),
    regularPay: money('regularPay'),
    overtimePay: money('overtimePay'),
    totalHours: hours('totalHours'),
    overtimeHours: hours('overtimeHours'),
    doubleHours: hours('doubleHours'),
    dayHours: WEEKDAYS.map((day) => hours(`${day}Hours`)),
  };
};

/** `8:00`, `7:30`: a length of time as a clock difference reads it. */
const lengthOf = (hours: Rational): string => {
  const [h = '0', min = '0'] = hoursMinutesText(hours).replace(' min', '').split(' h ');
  return `${h}:${min.padStart(2, '0')}`;
};

const isZero = (hours: Rational): boolean => hoursText(hours) === '0';

/** The overtime hours of a week as text; none when it has none. */
const overtimeOf = (week: Week): string | undefined =>
  isZero(week.overtimeHours) ? undefined : hoursText(week.overtimeHours);

/** `a 9 am`, `an 8 am`, `an 11 am`: the article before a clock time in English. */
const articleOf = (clock: string): string => (/^(8|11)[: ]/.test(clock) ? 'an' : 'a');

/** `a la 1 pm`, `a las 9 am`: a clock time after `a` in Spanish. */
const atClock = (clock: string): string =>
  /^1[: ]/.test(clock) ? `a la ${clock}` : `a las ${clock}`;

/** `la 1 pm`, `las 9 am`: a clock time after `es` or `desde` in Spanish. */
const theClock = (clock: string): string => atClock(clock).replace(/^a /, '');

const capital = (word: string): string => `${word.charAt(0).toUpperCase()}${word.slice(1)}`;

/** `A, B and C`, `A, B y C`. */
const listOf = (items: readonly string[], lang: Lang): string => {
  const and = lang === 'en' ? 'and' : 'y';
  return items.length < 2
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} ${and} ${String(items.at(-1))}`;
};

/** The states whose workday overtime starts after 8 hours, from the overtime table. */
const dailyStatesOf = (lang: Lang): readonly string[] =>
  OVERTIME_STATES.filter(({ daily }) => daily === DAILY_LINE).map(({ name }) => name[lang]);

/** The pay under which Nevada owes daily overtime: 1.5 times its minimum wage. */
const NEVADA_BELOW = moneyText(scaleMoney(NEVADA_MINIMUM_WAGE, Rational.of(3, 2)));

/** The clock times of a meal window on `shift`, or the latest time. */
const windowOf = (window: Window, shift: Shift, end: number): readonly number[] => {
  if (window.kind === 'between')
    return [shift.start + window.afterStart * 60, end - window.beforeEnd * 60];
  if (window.kind === 'fromStart')
    return [shift.start + window.from * 60, shift.start + window.to * 60];
  return [shift.start + window.afterStart * 60];
};

/** The words of each language around the figures. */
const WORDS = {
  en: {
    hours: (hours: Rational): string =>
      `${hoursText(hours)} hour${hoursText(hours) === '1' ? '' : 's'}`,
    worked: {
      heading: 'How the figures are worked out',
      intro: (start: string, end: string, figure: string): string =>
        `To check that ${start} to ${end} is ${figure}, subtract the start from the end:`,
      clock: (start: string, end: string, from: string, to: string): string =>
        `On a 24-hour clock, ${start} is ${from} and ${end} is ${to}.`,
      subtract: (
        from: string,
        to: string,
        length: string,
        figure: string,
        minutes: string,
      ): string => `${to} − ${from} = ${length}, so the shift lasts ${figure}: ${minutes} minutes.`,
      overnight: (
        from: string,
        to: string,
        next: string,
        length: string,
        minutes: string,
      ): string =>
        `${to} comes before ${from}, so the shift ends the next day: add 24 hours, and ${next} − ${from} = ${length}, which is ${minutes} minutes.`,
      midnight: (before: string, after: string, start: string, end: string): string =>
        `Of those, ${before} fall before midnight (${start} to 12 am) and ${after} after it (12 am to ${end}), on the next calendar day.`,
      fraction: (minutes: string, decimal: string, length: string, hours: string): string =>
        `For decimal hours, divide the ${minutes} minutes past the hour by 60: ${minutes} ÷ 60 = ${decimal}, so ${length} is ${hours} hours.`,
      whole: (length: string, hours: string): string =>
        `The shift ends on the hour, so ${length} is ${hours} in decimal hours.`,
      lunch: (
        start: string,
        end: string,
        length: string,
        short: string,
        shortHours: string,
        long: string,
        longHours: string,
      ): string =>
        `${start} to ${end} less a 30-minute unpaid lunch is ${length} − 0:30 = ${short}, or ${shortHours} hours; less a 60-minute one, ${length} − 1:00 = ${long}, or ${longHours} hours.`,
    },
    split: (
      lunchFrom: string,
      lunchTo: string,
      start: string,
      first: string,
      end: string,
      second: string,
      total: string,
    ): string =>
      `A 30-minute lunch at the middle of the shift runs from ${lunchFrom} to ${lunchTo}: ${start} to ${lunchFrom} is ${first} hours and ${lunchTo} to ${end} is ${second}, ${total} hours in all.`,
    rounding: {
      heading: (start: string, end: string): string =>
        `How a quarter-hour time clock records ${start} to ${end}`,
      caption: (start: string, end: string): string =>
        `Punches near ${start} and ${end}, rounded to the nearest quarter hour`,
      head: ['Punch', 'Clock time', 'Recorded as', 'Paid time against the schedule'],
      kinds: ['In', 'Out'],
    },
    clockOut: {
      heading: 'When to clock out with a lunch break',
      rounding: (
        inFrom: string,
        inTo: string,
        start: string,
        outFrom: string,
        outTo: string,
        end: string,
      ): string =>
        `If your time clock rounds to the nearest quarter hour, a punch-in from ${inFrom} to ${inTo} and a punch-out from ${outFrom} to ${outTo} still record ${start} to ${end}. Rounding is allowed only if, over time, you are still paid for all the time you worked (29 CFR 785.48).`,
      intro: (start: string, end: string, figure: string): string =>
        `An unpaid lunch comes off your hours, so leaving at ${end} after a break pays less than ${figure}. To be paid the full ${figure} starting at ${start}, stay as long as the break lasts:`,
      caption: (start: string): string => `Starting at ${start}`,
      head: (end: string, figure: string): readonly string[] => [
        'Unpaid break',
        `Paid if you leave at ${end}`,
        `Leave at, for ${figure}`,
      ],
    },
    week: {
      heading: 'Hours a week, a pay period and a month',
      totals: (
        start: string,
        end: string,
        b0: string,
        b30: string,
        m0: string,
        m30: string,
      ): string =>
        `Paid every two weeks, ${start} to ${end} comes to ${b0} hours a pay period with no unpaid break or ${b30} with a 30-minute lunch each day; over 52 weeks it averages ${m0} or ${m30} hours a month.`,
      four: (w4: string, ot4?: string): string =>
        ot4 === undefined
          ? `Four of these shifts a week, with a 30-minute lunch each, come to ${w4} hours, inside the 40-hour line.`
          : `Four of these shifts a week, with a 30-minute lunch each, come to ${w4} hours, ${ot4} of them overtime.`,
      fullTime: (start: string, end: string, irs: string, bls: string): string =>
        `How many ${start} to ${end} shifts make full time depends on who counts, since the FLSA sets no number: with a 30-minute lunch, ${irs} a week reach the 30 hours the IRS counts for employer health coverage (130 a month), and ${bls} reach the 35 hours of the Bureau of Labor Statistics job statistics.`,
      daily: (
        states: string,
        below: string,
        start: string,
        end: string,
        day: string,
        extra: string,
        ca: string,
        fed: string,
        double: string,
      ): string =>
        `In ${states} (in Nevada only for pay under ${below} an hour), the hours past 8 in a workday are overtime too, whatever the week. ${capital(articleOf(start))} ${start} to ${end} shift with a 30-minute lunch is ${day} hours, so ${extra} of each day is daily overtime: under California's rule this five-day week has ${ca} overtime hours${double === '0' ? '' : ` and ${double} double-time hours`}, against ${fed} under the federal rule. Colorado's daily line is 12 hours.`,
    },
    card: {
      heading: (start: string, end: string): string =>
        `A week of ${start} to ${end} on a time card`,
      intro: (start: string, end: string, rate: string): string =>
        `A Monday-to-Friday week of ${start} to ${end} in the time card calculator, with a 30-minute unpaid lunch a day, at ${rate} an hour under the federal overtime rule.`,
      caption: (start: string, end: string, from: string, to: string, rate: string): string =>
        `Time card: ${start} to ${end} with lunch from ${from} to ${to}, Monday to Friday, at ${rate} an hour`,
      head: [
        'Day',
        'In',
        'Out to lunch',
        'Back in',
        'Out',
        'Hours',
        'Week so far',
        'Gross pay so far',
      ],
      minimum: (start: string, end: string, week: string, two: string): string =>
        `At the federal minimum wage of $7.25, the same ${start} to ${end} card pays ${week} a week and ${two} every two weeks.`,
      saturday: (start: string, time: string): string =>
        `A sixth shift on Saturday from ${start} would reach 40 hours at ${time}; every minute after that is overtime.`,
      punches: (
        start: string,
        lunchOut: string,
        lunchIn: string,
        end: string,
        first: string,
        second: string,
        day: string,
      ): string =>
        `Each day you clock in at ${start}, out for lunch at ${lunchOut}, back in at ${lunchIn} and out at ${end}: ${first} + ${second} = ${day} paid hours.`,
      periods: (
        start: string,
        end: string,
        twoPay: string,
        yearHours: string,
        yearPay: string,
      ): string =>
        `Two weeks of ${start} to ${end} cards pay ${twoPay} a biweekly pay period; 52 weeks of ${start} to ${end} cards, ${yearHours} hours and ${yearPay} a year before taxes.`,
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      regular: (card: string, total: string, rate: string, pay: string, left: string): string =>
        left === '0'
          ? `By Friday the ${card} card shows ${total} hours, all regular time: ${total} × ${rate} = ${pay} before taxes. That is exactly the 40-hour line, so one more minute on the clock this week would be federal overtime.`
          : `By Friday the ${card} card shows ${total} hours, all regular time: ${total} × ${rate} = ${pay} before taxes, ${left} hours short of the 40 that start federal overtime.`,
      overtime: (
        card: string,
        total: string,
        regularPay: string,
        overtime: string,
        overtimeRate: string,
        overtimePay: string,
        pay: string,
        day: string,
        time: string,
      ): string =>
        `By Friday the ${card} card shows ${total} hours: the first 40 are regular time, ${regularPay}, and the ${overtime} hours past 40 are overtime at ${overtimeRate} an hour, ${overtimePay}, for ${pay} before taxes. The week crosses the 40-hour line on ${day} at ${time}, so that day's gross pay so far already includes overtime.`,
    },
    byHour: {
      heading: (start: string, end: string): string => `Hour by hour from ${start} to ${end}`,
      intro: (
        start: string,
        end: string,
        half: string,
        halfHours: string,
        from: string,
        to: string,
        stop: string,
        paid: string,
      ): string =>
        `Halfway through ${start} to ${end} is ${half}, ${halfHours} on the clock. With a 30-minute unpaid lunch from ${from} to ${to}, the paid hours stop at ${stop} during the lunch and reach ${paid} at ${end}.`,
      caption: (start: string, end: string): string =>
        `Hours since ${start} at each hour of ${articleOf(start)} ${start} to ${end} shift`,
      head: ['Time', 'On the clock', 'Paid, with the lunch', 'Gross pay so far at $20.00'],
    },
    teens: {
      heading: (start: string, end: string): string =>
        `Can a 14- or 15-year-old work ${start} to ${end}?`,
      allYear: (start: string, end: string): string =>
        `${start} to ${end} falls inside the 7 am to 7 pm that federal law allows a 14- or 15-year-old all year.`,
      summer: (start: string, end: string): string =>
        `${start} to ${end} ends after 7 pm, so a 14- or 15-year-old may work it only from June 1 through Labor Day, when the evening limit is 9 pm.`,
      early: (start: string, end: string): string =>
        `${start} to ${end} starts before 7 am, the earliest a 14- or 15-year-old may start, so federal law does not allow it.`,
      late: (start: string, end: string): string =>
        `${start} to ${end} ends after 9 pm, later than a 14- or 15-year-old may work even from June 1 through Labor Day, so federal law does not allow it.`,
      night: (start: string, end: string): string =>
        `${start} to ${end} runs through the night, outside the 7 am to 7 pm (9 pm in summer) a 14- or 15-year-old may work, so federal law does not allow it.`,
      within: (paid: string): string =>
        `Its ${paid} paid hours with a 30-minute lunch fit a day without school, up to 8, but never a school day, up to 3.`,
      longLunch: (paid: string, long: string): string =>
        `Its ${paid} paid hours with a 30-minute lunch pass the 8 allowed on a day without school; only a 60-minute lunch, at ${long}, keeps it within the limit.`,
      over: (paid: string, long: string): string =>
        `Its ${paid} paid hours with a 30-minute lunch, and ${long} even with a 60-minute one, pass the 8 allowed on a day without school, so it is not allowed on any day.`,
    },
    breaks: {
      heading: 'Is the lunch break paid?',
      federal: (figure: string, start: string, end: string): string =>
        `Federal law does not require a lunch break: breaks of about 5 to 20 minutes are paid (29 CFR 785.18), and only a meal of 30 minutes or more fully off duty comes off the ${figure} from ${start} to ${end} (29 CFR 785.19).`,
      noon: (start: string, end: string): string =>
        `In New York, ${start} to ${end} runs more than 6 hours across the noonday period of 11 am to 2 pm, so it owes at least 30 minutes off between 11 am and 2 pm (60 minutes in a factory).`,
      evening: (start: string, end: string): string =>
        `Because ${start} to ${end} starts before 11 am and goes past 7 pm, New York adds at least 20 minutes between 5 pm and 7 pm.`,
      late: (start: string, end: string, midway: string): string =>
        `In New York, ${start} to ${end} runs more than 6 hours from a start between 1 pm and 6 am, so it owes at least 45 minutes (60 in a factory) midway through the shift, around ${midway}.`,
      states: (figure: string, count: number, list: string): string =>
        `Some states do require a meal period. For a shift of ${figure} from start to end, the U.S. Department of Labor table of state meal periods (January 1, 2023) lists one in ${String(count)} states: ${list}. Each has exceptions; check yours in the table.`,
      group: (minutes: number | undefined, states: string): string =>
        minutes === undefined
          ? `sufficient unpaid time in ${states}`
          : `${String(minutes)} minutes in ${states}`,
      caption: (start: string, end: string): string =>
        `When the meal period falls on ${articleOf(start)} ${start} to ${end} shift`,
      head: ['State', 'Rule', 'On this shift'],
      rule: {
        between: 'After the first 2 hours and before the last 2',
        fromStart: 'Between 2 and 5 hours from the start',
        by: 'No later than 5 hours after the start',
      },
      between: (from: string, to: string): string => `Between ${from} and ${to}`,
      by: (time: string): string => `By ${time}`,
    },
  },
  es: {
    hours: (hours: Rational): string =>
      `${hoursText(hours)} hora${hoursText(hours) === '1' ? '' : 's'}`,
    worked: {
      heading: 'Cómo se calcula',
      intro: (start: string, end: string, figure: string): string =>
        `Para comprobar que de ${start} a ${end} son ${figure}, resta la entrada de la salida:`,
      clock: (start: string, end: string, from: string, to: string): string =>
        `En un reloj de 24 horas, las ${start} son las ${from} y las ${end} son las ${to}.`,
      subtract: (
        from: string,
        to: string,
        length: string,
        figure: string,
        minutes: string,
      ): string =>
        `${to} − ${from} = ${length}, así que el turno dura ${figure}: ${minutes} minutos.`,
      overnight: (
        from: string,
        to: string,
        next: string,
        length: string,
        minutes: string,
      ): string =>
        `Las ${to} van antes que las ${from}, así que el turno termina al día siguiente: suma 24 horas, y ${next} − ${from} = ${length}, que son ${minutes} minutos.`,
      midnight: (before: string, after: string, start: string, end: string): string =>
        `De ellas, ${before} caen antes de la medianoche (de ${start} a 12 am) y ${after} después (de 12 am a ${end}), ya en el día siguiente.`,
      fraction: (minutes: string, decimal: string, length: string, hours: string): string =>
        `Para las horas decimales, divide entre 60 los ${minutes} minutos que pasan de la hora: ${minutes} ÷ 60 = ${decimal}, así que ${length} son ${hours} horas.`,
      whole: (length: string, hours: string): string =>
        `El turno termina en hora exacta, así que ${length} son ${hours} en horas decimales.`,
      lunch: (
        start: string,
        end: string,
        length: string,
        short: string,
        shortHours: string,
        long: string,
        longHours: string,
      ): string =>
        `De ${start} a ${end}, si restas 30 minutos de comida sin pago, ${length} − 0:30 = ${short}, o ${shortHours} horas; si restas 60 minutos, ${length} − 1:00 = ${long}, o ${longHours} horas.`,
    },
    split: (
      lunchFrom: string,
      lunchTo: string,
      start: string,
      first: string,
      end: string,
      second: string,
      total: string,
    ): string =>
      `Una comida de 30 minutos a la mitad del turno va de ${lunchFrom} a ${lunchTo}: de ${start} a ${lunchFrom} son ${first} horas y de ${lunchTo} a ${end} son ${second}, ${total} horas en total.`,
    rounding: {
      heading: (start: string, end: string): string =>
        `Cómo registra un reloj de cuartos de hora un turno de ${start} a ${end}`,
      caption: (start: string, end: string): string =>
        `Marcas cerca de las ${start} y de las ${end}, redondeadas al cuarto de hora más cercano`,
      head: ['Marca', 'Hora del reloj', 'Queda como', 'Tiempo pagado frente al horario'],
      kinds: ['Entrada', 'Salida'],
    },
    clockOut: {
      heading: 'A qué hora salir si tomas un descanso para comer',
      rounding: (
        inFrom: string,
        inTo: string,
        start: string,
        outFrom: string,
        outTo: string,
        end: string,
      ): string =>
        `Si tu reloj marcador redondea al cuarto de hora, marcar la entrada de ${inFrom} a ${inTo} y la salida de ${outFrom} a ${outTo} sigue quedando de ${start} a ${end}. Es legal si con el tiempo te pagan todo (29 CFR 785.48).`,
      intro: (start: string, end: string, figure: string): string =>
        `Si sales a las ${end}, el descanso sin pago te deja con menos de ${figure}. Para cobrar las ${figure} entrando a las ${start}, sal más tarde lo que dure el descanso:`,
      caption: (start: string): string => `Entrando a las ${start}`,
      head: (end: string, figure: string): readonly string[] => [
        'Descanso sin pago',
        `Pagado si sales a las ${end}`,
        `Hora de salida para ${figure}`,
      ],
    },
    week: {
      heading: 'Horas por semana, por periodo de pago y por mes',
      totals: (
        start: string,
        end: string,
        b0: string,
        b30: string,
        m0: string,
        m30: string,
      ): string =>
        `Con pago cada dos semanas, de ${start} a ${end} son ${b0} horas por periodo sin descanso o ${b30} con 30 minutos de comida al día; en 52 semanas, un promedio de ${m0} o ${m30} horas al mes.`,
      four: (w4: string, ot4?: string): string =>
        ot4 === undefined
          ? `Cuatro de estos turnos a la semana, con 30 minutos de comida cada uno, suman ${w4} horas, dentro del límite de 40.`
          : `Cuatro de estos turnos a la semana, con 30 minutos de comida cada uno, suman ${w4} horas, ${ot4} de ellas extra.`,
      fullTime: (start: string, end: string, irs: string, bls: string): string =>
        `La FLSA no define el tiempo completo: con 30 minutos de comida, ${irs} turnos de ${start} a ${end} llegan a las 30 horas semanales del IRS (cobertura médica, 130 al mes) y ${bls} a las 35 de la BLS.`,
      daily: (
        states: string,
        below: string,
        start: string,
        end: string,
        day: string,
        extra: string,
        ca: string,
        fed: string,
        double: string,
      ): string =>
        `En ${states} (en Nevada solo por debajo de ${below} la hora) también son extra las horas después de 8 en un día. Con 30 minutos de comida, de ${start} a ${end} son ${day} horas al día, ${extra} de ellas extra diarias: con la regla de California la semana suma ${ca} horas extra${double === '0' ? '' : ` y ${double} de tiempo doble`}, frente a ${fed} con la federal. Colorado pone el límite diario en 12 horas.`,
    },
    card: {
      heading: (start: string, end: string): string =>
        `Una semana de ${start} a ${end} en la tarjeta de horas`,
      intro: (start: string, end: string, rate: string): string =>
        `Una semana de lunes a viernes de ${start} a ${end} en la calculadora de tarjeta de horas, con 30 minutos de comida sin pago al día, a ${rate} la hora con la regla federal de horas extra.`,
      caption: (start: string, end: string, from: string, to: string, rate: string): string =>
        `Tarjeta de horas: de ${start} a ${end} con comida de ${from} a ${to}, de lunes a viernes, a ${rate} la hora`,
      head: [
        'Día',
        'Entrada',
        'Salida a comer',
        'Regreso',
        'Salida',
        'Horas',
        'Horas en la semana',
        'Pago bruto acumulado',
      ],
      minimum: (start: string, end: string, week: string, two: string): string =>
        `Con el salario mínimo federal de $7.25, la misma tarjeta de ${start} a ${end} paga ${week} a la semana y ${two} cada dos semanas.`,
      saturday: (start: string, time: string): string =>
        `Un sexto turno el sábado desde ${theClock(start)} llegaría a las 40 horas ${atClock(time)}; cada minuto después es hora extra.`,
      punches: (
        start: string,
        lunchOut: string,
        lunchIn: string,
        end: string,
        first: string,
        second: string,
        day: string,
      ): string =>
        `Cada día marcas la entrada ${atClock(start)}, sales a comer ${atClock(lunchOut)}, regresas ${atClock(lunchIn)} y marcas la salida ${atClock(end)}: ${first} + ${second} = ${day} horas pagadas.`,
      periods: (
        start: string,
        end: string,
        twoPay: string,
        yearHours: string,
        yearPay: string,
      ): string =>
        `Dos semanas de tarjetas de ${start} a ${end} pagan ${twoPay} por un periodo de pago quincenal; 52 semanas de tarjetas de ${start} a ${end}, ${yearHours} horas y ${yearPay} al año antes de impuestos.`,
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      regular: (card: string, total: string, rate: string, pay: string, left: string): string =>
        left === '0'
          ? `Al viernes la tarjeta ${card} suma ${total} horas, todas a tarifa normal: ${total} × ${rate} = ${pay} antes de impuestos. Es justo el límite de 40 horas, así que un minuto más en el reloj esta semana ya serían horas extra federales.`
          : `Al viernes la tarjeta ${card} suma ${total} horas, todas a tarifa normal: ${total} × ${rate} = ${pay} antes de impuestos, a ${left} horas de las 40 en las que empiezan las horas extra federales.`,
      overtime: (
        card: string,
        total: string,
        regularPay: string,
        overtime: string,
        overtimeRate: string,
        overtimePay: string,
        pay: string,
        day: string,
        time: string,
      ): string =>
        `Al viernes la tarjeta ${card} suma ${total} horas: 40 a tarifa normal, ${regularPay}, y ${overtime} extra a ${overtimeRate} la hora, ${overtimePay}; en total, ${pay} antes de impuestos. La semana pasa de 40 horas el ${day} ${atClock(time)}, y desde ahí el acumulado ya incluye horas extra.`,
    },
    byHour: {
      heading: (start: string, end: string): string => `Hora por hora de ${start} a ${end}`,
      intro: (
        start: string,
        end: string,
        half: string,
        halfHours: string,
        from: string,
        to: string,
        stop: string,
        paid: string,
      ): string =>
        `La mitad de un turno de ${start} a ${end} es ${theClock(half)}, con ${halfHours} en el reloj. Con 30 minutos de comida sin pago de ${from} a ${to}, las horas pagadas se quedan en ${stop} durante la comida y llegan a ${paid} ${atClock(end)}.`,
      caption: (start: string, end: string): string =>
        `Horas desde ${theClock(start)} en cada hora de un turno de ${start} a ${end}`,
      head: ['Hora', 'En el reloj', 'Pagadas, con la comida', 'Pago bruto acumulado a $20.00'],
    },
    teens: {
      heading: (start: string, end: string): string =>
        `¿Puede un adolescente de 14 o 15 años trabajar de ${start} a ${end}?`,
      allYear: (start: string, end: string): string =>
        `De ${start} a ${end} cae dentro del horario de 7 am a 7 pm, permitido todo el año a los adolescentes de 14 y 15 años.`,
      summer: (start: string, end: string): string =>
        `De ${start} a ${end} termina después de las 7 pm, así que un adolescente de 14 o 15 años solo puede trabajarlo del 1 de junio al Día del Trabajo, cuando el límite de la tarde son las 9 pm.`,
      early: (start: string, end: string): string =>
        `De ${start} a ${end} empieza antes de las 7 am, la hora más temprana a la que puede entrar un adolescente de 14 o 15 años, así que la ley federal no lo permite.`,
      late: (start: string, end: string): string =>
        `De ${start} a ${end} termina después de las 9 pm, más tarde de lo que puede trabajar un adolescente de 14 o 15 años incluso del 1 de junio al Día del Trabajo, así que la ley federal no lo permite.`,
      night: (start: string, end: string): string =>
        `De ${start} a ${end} es un turno de noche, fuera del horario de 7 am a 7 pm (9 pm en verano) de un adolescente de 14 o 15 años, así que la ley federal no lo permite.`,
      within: (paid: string): string =>
        `Sus ${paid} horas pagadas con 30 minutos de comida caben en un día sin clases, hasta 8, pero nunca en un día de clases, hasta 3.`,
      longLunch: (paid: string, long: string): string =>
        `Sus ${paid} horas pagadas con 30 minutos de comida pasan de las 8 permitidas en un día sin clases; solo con 60 minutos de comida, ${long} horas, queda dentro del límite.`,
      over: (paid: string, long: string): string =>
        `Sus ${paid} horas pagadas con 30 minutos de comida, y ${long} incluso con 60 minutos, pasan de las 8 permitidas en un día sin clases, así que no se permite ningún día.`,
    },
    breaks: {
      heading: '¿Se paga el descanso para comer?',
      federal: (figure: string, start: string, end: string): string =>
        `La ley federal no exige una pausa para comer: las pausas de 5 a 20 minutos se pagan (29 CFR 785.18) y solo una comida libre de 30 minutos o más se resta de las ${figure} de ${start} a ${end} (29 CFR 785.19).`,
      noon: (start: string, end: string): string =>
        `En Nueva York, de ${start} a ${end} pasa de 6 horas y cubre el mediodía, así que da derecho a 30 minutos libres entre las 11 am y las 2 pm (60 en una fábrica).`,
      evening: (start: string, end: string): string =>
        `Como de ${start} a ${end} empieza antes de las 11 am y sigue después de las 7 pm, Nueva York suma 20 minutos como mínimo entre las 5 pm y las 7 pm.`,
      late: (start: string, end: string, midway: string): string =>
        `En Nueva York, de ${start} a ${end} dura más de 6 horas y empieza entre la 1 pm y las 6 am, así que da derecho a 45 minutos como mínimo (60 en una fábrica) a la mitad del turno, hacia ${theClock(midway)}.`,
      states: (figure: string, count: number, list: string): string =>
        `Algunos estados sí la exigen: para ${figure} de entrada a salida, la tabla del Departamento de Trabajo (1 de enero de 2023) la pide en ${String(count)} estados, con excepciones: ${list}.`,
      group: (minutes: number | undefined, states: string): string =>
        minutes === undefined
          ? `tiempo suficiente sin pago en ${states}`
          : `${String(minutes)} minutos en ${states}`,
      caption: (start: string, end: string): string =>
        `Cuándo cae el descanso para comer en un turno de ${start} a ${end}`,
      head: ['Estado', 'Regla', 'En este turno'],
      rule: {
        between: 'Después de las primeras 2 horas y antes de las últimas 2',
        fromStart: 'Entre 2 y 5 horas desde la entrada',
        by: 'A más tardar 5 horas después de la entrada',
      },
      between: (from: string, to: string): string => `Entre las ${from} y las ${to}`,
      by: (time: string): string => `A más tardar a las ${time}`,
    },
  },
} as const;

export interface ShiftSections {
  readonly sections: readonly LongTailSection[];
  readonly sources: readonly LongTailSource[];
}

/** The sections and the sources of the page of `shift` in `lang`. */
export const shiftSectionsOf = (shift: Shift, lang: Lang, figure: string): ShiftSections => {
  const w = WORDS[lang];
  const end = shift.end > shift.start ? shift.end : shift.end + DAY_MINUTES;
  const start = clockOf(shift.start);
  const finish = clockOf(shift.end);
  const span = hoursOf(shift.start, shift.end, 0);
  const [short, long] = LUNCHES.map((lunch) => hoursOf(shift.start, shift.end, lunch));
  if (short === undefined || long === undefined) throw new Error('two lunches');
  const minutes = end - shift.start;
  const spanHours = minutes / 60;

  // a lunch at the middle of the shift: the two parts add up to the shift less the lunch
  const middle = shift.start + Math.floor(minutes / 2 / 15) * 15;
  const first = hoursOf(shift.start, middle, 0);
  const second = hoursOf(middle + 30, end, 0);
  if (!first.add(second).equals(short)) throw new Error('the two parts must add up');
  const splitOf = (): string =>
    w.split(
      clockOf(middle),
      clockOf(middle + 30),
      start,
      hoursText(first),
      finish,
      hoursText(second),
      hoursText(short),
    );

  // hour by hour: the hours on the clock and the paid hours, the lunch at the middle unpaid
  const marks = [
    ...Array.from(
      { length: Math.floor(minutes / 60) },
      (_, index) => shift.start + (index + 1) * 60,
    ),
    ...(minutes % 60 === 0 ? [] : [end]),
  ];
  const paidAt = (at: number): Rational =>
    at <= middle
      ? hoursOf(shift.start, at, 0)
      : at <= middle + 30
        ? first
        : first.add(hoursOf(middle + 30, at, 0));
  if (!paidAt(end).equals(short)) throw new Error('the hour by hour must end at the paid hours');
  const hourRows = marks.map((at) => [
    clockOf(at),
    decimalHoursText(hoursOf(shift.start, at, 0)),
    decimalHoursText(paidAt(at)),
    moneyText(scaleMoney(CARD_RATE, paidAt(at))),
  ]);

  // worked out by hand
  const steps = [
    w.worked.clock(start, finish, fieldOf(shift.start), fieldOf(shift.end)),
    shift.end > shift.start
      ? w.worked.subtract(
          fieldOf(shift.start),
          fieldOf(shift.end),
          lengthOf(span),
          figure,
          String(minutes),
        )
      : w.worked.overnight(
          fieldOf(shift.start),
          fieldOf(shift.end),
          fieldOf(end),
          lengthOf(span),
          String(minutes),
        ),
    ...(shift.end < shift.start && shift.end > 0
      ? [
          w.worked.midnight(
            w.hours(Rational.of(DAY_MINUTES - shift.start, 60)),
            w.hours(Rational.of(shift.end, 60)),
            start,
            finish,
          ),
        ]
      : []),
    minutes % 60 === 0
      ? w.worked.whole(lengthOf(span), decimalHoursText(span))
      : w.worked.fraction(
          String(minutes % 60),
          hoursText(Rational.of(minutes % 60, 60)),
          lengthOf(span),
          decimalHoursText(span),
        ),
    w.worked.lunch(
      start,
      finish,
      lengthOf(span),
      lengthOf(short),
      decimalHoursText(short),
      lengthOf(long),
      decimalHoursText(long),
    ),
    splitOf(),
  ];

  // when to clock out: the end plus the lunch keeps the whole span paid, which the engine checks
  const clockOutRows = LUNCHES.map((lunch, index) => {
    const out = end + lunch;
    if (!hoursOf(shift.start, out, lunch).equals(span))
      throw new Error('the clock-out must pay the span');
    const paid = index === 0 ? short : long;
    return [
      `${String(lunch)} min`,
      `${hoursMinutesText(paid)} (${decimalHoursText(paid)})`,
      clockOf(out),
    ];
  });

  // the week, the pay period, the month and their overtime
  const five0 = weekOf(shift, 5, 0);
  const five30 = weekOf(shift, 5, 30);
  const four30 = weekOf(shift, 4, 30);
  const monthly = (week: Rational): string => hoursText(week.mul(Rational.of(52, 12)));
  const weekParagraphs = [
    w.week.totals(
      start,
      finish,
      hoursText(five0.totalHours.mul(Rational.of(2))),
      hoursText(five30.totalHours.mul(Rational.of(2))),
      monthly(five0.totalHours),
      monthly(five30.totalHours),
    ),
    ...(spanHours >= 10 ? [w.week.four(hoursText(four30.totalHours), overtimeOf(four30))] : []),
  ];
  const shiftsFor = (hours: number): string => String(Rational.of(hours).div(short).ceil());
  weekParagraphs.push(
    w.week.fullTime(start, finish, shiftsFor(FULL_TIME.irs), shiftsFor(FULL_TIME.bls)),
  );
  const dailyOvertime = short.compare(Rational.of(DAILY_LINE)) > 0;
  if (dailyOvertime) {
    const california = weekOf(shift, 5, 30, usd(15), 'california');
    weekParagraphs.push(
      w.week.daily(
        listOf(dailyStatesOf(lang), lang),
        NEVADA_BELOW,
        start,
        finish,
        hoursText(short),
        hoursText(short.sub(Rational.of(DAILY_LINE))),
        hoursText(california.overtimeHours),
        hoursText(five30.overtimeHours),
        hoursText(california.doubleHours),
      ),
    );
  }

  // the time card of a Monday-to-Friday week: each day's hours, and the week and pay so far
  const card = weekOf(shift, CARD_DAYS, 30, CARD_RATE);
  const minimumCard = weekOf(shift, CARD_DAYS, 30, usd(Rational.of(FEDERAL_MINIMUM_WAGE, 100)));
  const soFar = Array.from({ length: CARD_DAYS }, (_, index) =>
    weekOf(shift, index + 1, 30, CARD_RATE),
  );
  if (!soFar.at(-1)?.pay.amount.equals(card.pay.amount)) throw new Error('the card must add up');
  const cardRows = w.card.days.map((day, index) => [
    day,
    start,
    clockOf(middle),
    clockOf(middle + 30),
    finish,
    hoursText(card.dayHours[index] ?? Rational.of(0)),
    hoursText(soFar[index]?.totalHours ?? Rational.of(0)),
    moneyText(soFar[index]?.pay ?? usd(0)),
  ]);
  const cardName = lang === 'en' ? `${start} to ${finish}` : `de ${start} a ${finish}`;
  const crossing = soFar.findIndex(({ overtimeHours }) => !isZero(overtimeHours));
  const punches = w.card.punches(
    start,
    clockOf(middle),
    clockOf(middle + 30),
    finish,
    hoursText(first),
    hoursText(second),
    hoursText(short),
  );
  // the clock time a day of the card brings the week to 40 hours, from `before` hours
  const fortyAt = (before: Rational): string => {
    const needed = Rational.of(40).sub(before);
    const minutesOf = (hours: Rational): number => Number(hoursText(hours.mul(Rational.of(60))));
    const at =
      needed.compare(first) <= 0
        ? shift.start + minutesOf(needed)
        : middle + 30 + minutesOf(needed.sub(first));
    if (!paidAt(at).add(before).equals(Rational.of(40))) throw new Error('40 hours at the time');
    return clockOf(at);
  };
  const cardAfter = isZero(card.overtimeHours)
    ? w.card.regular(
        cardName,
        hoursText(card.totalHours),
        moneyText(CARD_RATE),
        moneyText(card.pay),
        hoursText(Rational.of(40).sub(card.totalHours)),
      )
    : w.card.overtime(
        cardName,
        hoursText(card.totalHours),
        moneyText(card.regularPay),
        hoursText(card.overtimeHours),
        moneyText(scaleMoney(card.overtimePay, Rational.of(1).div(card.overtimeHours))),
        moneyText(card.overtimePay),
        moneyText(card.pay),
        (lang === 'en' ? w.card.days[crossing] : w.card.days[crossing]?.toLowerCase()) ?? '',
        fortyAt(soFar[crossing - 1]?.totalHours ?? Rational.of(0)),
      );
  const saturday =
    card.totalHours.compare(Rational.of(40)) < 0
      ? [w.card.saturday(start, fortyAt(card.totalHours))]
      : [];

  // the meal periods: federal, then the states whose rule a shift of this length meets
  const applying = MEAL_PERIODS.filter((period) => appliesTo(period, spanHours));
  const lengths = [...new Set(applying.map((period) => mealMinutesOf(period, spanHours)))].toSorted(
    (a, b) => (b ?? 0) - (a ?? 0),
  );
  const list = lengths.map((length) =>
    w.breaks.group(
      length,
      listOf(
        applying
          .filter((period) => mealMinutesOf(period, spanHours) === length)
          .map(({ state }) => state[lang]),
        lang,
      ),
    ),
  );
  const windowRows = applying.flatMap((period) => {
    if (period.window === undefined) return [];
    const times = windowOf(period.window, shift, end).map(clockOf);
    const [from = '', to = ''] = times;
    return [
      [
        period.state[lang],
        w.breaks.rule[period.window.kind],
        times.length === 1 ? w.breaks.by(from) : w.breaks.between(from, to),
      ],
    ];
  });

  // New York Labor Law 162: the meal periods by the time of day, for a shift of more than 6 hours
  const newYork: string[] = [];
  if (minutes > NEW_YORK.over * 60) {
    if (shift.start <= NEW_YORK.noonFrom && end >= NEW_YORK.noonTo)
      newYork.push(w.breaks.noon(start, finish));
    if (shift.start < NEW_YORK.noonFrom && end > NEW_YORK.eveningTo)
      newYork.push(w.breaks.evening(start, finish));
    if (shift.start >= NEW_YORK.lateFrom || shift.start < NEW_YORK.lateTo)
      newYork.push(w.breaks.late(start, finish, clockOf(shift.start + minutes / 2)));
  }

  // a quarter-hour clock: 7 minutes or less off records the time, 8 or more the next quarter
  const roundingRows = (
    [
      [0, shift.start, 1],
      [1, end, -1],
    ] as const
  ).flatMap(([kind, at, sign]) =>
    [-8, -ROUNDING, ROUNDING, 8].map((off) => {
      const recorded = at + (Math.abs(off) > ROUNDING ? Math.sign(off) * 15 : 0);
      const paid = sign * (at - recorded);
      return [
        w.rounding.kinds[kind],
        clockOf(at + off),
        clockOf(recorded),
        `${paid > 0 ? '+' : paid < 0 ? '−' : ''}${String(Math.abs(paid))} min`,
      ];
    }),
  );

  // federal child labor hours for 14- and 15-year-olds (DOL Fact Sheet #43)
  const teenWindow =
    shift.end < shift.start && shift.end > 0
      ? 'night'
      : shift.start < TEEN_HOURS.from
        ? 'early'
        : end > TEEN_HOURS.summerTo
          ? 'late'
          : end > TEEN_HOURS.to
            ? 'summer'
            : 'allYear';
  const teenDay = Rational.of(TEEN_HOURS.day);
  const teenLength =
    short.compare(teenDay) <= 0
      ? w.teens.within(hoursText(short))
      : long.compare(teenDay) <= 0
        ? w.teens.longLunch(hoursText(short), hoursText(long))
        : w.teens.over(hoursText(short), hoursText(long));
  const teenText =
    teenWindow === 'allYear' || teenWindow === 'summer'
      ? `${capital(w.teens[teenWindow](start, finish))} ${teenLength}`
      : capital(w.teens[teenWindow](start, finish));
  const teenParagraphs = [`${teenText.replace(/\.$/, '')} (DOL Fact Sheet #43).`];

  const sections: LongTailSection[] = [
    {
      id: 'worked',
      heading: w.worked.heading,
      paragraphs: [w.worked.intro(start, finish, figure)],
      steps,
    },
    {
      id: 'clock-out',
      heading: w.clockOut.heading,
      paragraphs: [w.clockOut.intro(start, finish, figure)],
      table: {
        caption: w.clockOut.caption(start),
        head: w.clockOut.head(finish, figure),
        rows: clockOutRows,
      },
    },
    {
      id: 'rounding',
      heading: w.rounding.heading(start, finish),
      paragraphs: [
        w.clockOut.rounding(
          clockOf(shift.start - ROUNDING),
          clockOf(shift.start + ROUNDING),
          start,
          clockOf(end - ROUNDING),
          clockOf(end + ROUNDING),
          finish,
        ),
      ],
      table: {
        caption: w.rounding.caption(start, finish),
        head: w.rounding.head,
        rows: roundingRows,
      },
    },
    {
      id: 'by-hour',
      heading: w.byHour.heading(start, finish),
      paragraphs: [
        w.byHour.intro(
          start,
          finish,
          clockOf(shift.start + minutes / 2),
          w.hours(Rational.of(minutes, 120)),
          clockOf(middle),
          clockOf(middle + 30),
          hoursText(first),
          hoursText(short),
        ),
      ],
      table: { caption: w.byHour.caption(start, finish), head: w.byHour.head, rows: hourRows },
    },
    { id: 'week', heading: w.week.heading, paragraphs: weekParagraphs },
    {
      id: 'time-card',
      heading: w.card.heading(start, finish),
      paragraphs: [w.card.intro(start, finish, moneyText(CARD_RATE))],
      table: {
        caption: w.card.caption(
          start,
          finish,
          clockOf(middle),
          clockOf(middle + 30),
          moneyText(CARD_RATE),
        ),
        head: w.card.head,
        rows: cardRows,
      },
      after: [
        [punches, cardAfter, ...saturday].join(' '),
        // each workweek stands alone under the FLSA, so a pay period and a year are whole weeks
        w.card.periods(
          start,
          finish,
          moneyText(scaleMoney(card.pay, Rational.of(2))),
          hoursText(card.totalHours.mul(Rational.of(52))),
          moneyText(scaleMoney(card.pay, Rational.of(52))),
        ),
        w.card.minimum(
          start,
          finish,
          moneyText(minimumCard.pay),
          moneyText(scaleMoney(minimumCard.pay, Rational.of(2))),
        ),
      ],
    },
    {
      id: 'breaks',
      heading: w.breaks.heading,
      paragraphs: [
        w.breaks.federal(figure, start, finish),
        ...(applying.length === 0
          ? []
          : [w.breaks.states(figure, applying.length, list.join('; '))]),
        ...(newYork.length === 0 ? [] : [newYork.join(' ')]),
      ],
      ...(windowRows.length === 0
        ? {}
        : {
            table: {
              caption: w.breaks.caption(start, finish),
              head: w.breaks.head,
              rows: windowRows,
            },
          }),
    },
    { id: 'teens', heading: w.teens.heading(start, finish), paragraphs: teenParagraphs },
  ];
  const sources: LongTailSource[] = [
    SOURCES.factSheet23,
    SOURCES.breaks,
    SOURCES.ecfr18,
    SOURCES.ecfr19,
    SOURCES.ecfr48,
    SOURCES.mealTable,
    SOURCES.nyMeal,
    SOURCES.irsFullTime,
    SOURCES.blsCps,
    SOURCES.factSheet43,
    ...(dailyOvertime
      ? [OVERTIME_STATES_SOURCES.dol, OVERTIME_STATES_SOURCES.ca, OVERTIME_STATES_SOURCES.ak]
      : []),
  ];
  return { sections, sources };
};
