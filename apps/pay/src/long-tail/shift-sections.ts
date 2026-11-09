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

/** The rates of the pay table: the federal minimum wage, then common rates. */
const RATES: readonly Money[] = [
  usd(Rational.of(FEDERAL_MINIMUM_WAGE, 100)),
  usd(15),
  usd(20),
  usd(25),
];

/** The hours a workday may run before the daily overtime of Alaska, California and Nevada. */
const DAILY_LINE = 8;

/** The weekly hours of full time for the IRS (Affordable Care Act) and the BLS (job statistics). */
const FULL_TIME = { irs: 30, bls: 35 } as const;

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
        `To check that ${start} to ${end} is ${figure}, put both times on one clock and subtract the start from the end.`,
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
        w0: string,
        w30: string,
        b0: string,
        b30: string,
        m0: string,
        m30: string,
      ): string =>
        `Monday to Friday from ${start} to ${end} is ${w0} hours a week with no unpaid break and ${w30} with a 30-minute lunch each day. Paid every two weeks, ${start} to ${end} comes to ${b0} or ${b30} hours a pay period; over 52 weeks it averages ${m0} or ${m30} hours a month.`,
      rule: 'Under the federal Fair Labor Standards Act (FLSA), only the hours over 40 in a workweek are overtime, paid at least 1.5 times the regular rate (DOL Fact Sheet #23).',
      over: (start: string, end: string, w0: string, ot0: string): string =>
        `Five ${start} to ${end} shifts with no unpaid break come to ${w0} hours, so ${ot0} of them are overtime;`,
      overLunch: (ot30: string): string => `with a 30-minute lunch each day, ${ot30} hours are.`,
      underLunch: (w30: string): string =>
        `with a 30-minute lunch each day the week drops to ${w30} hours, with no overtime.`,
      under: (start: string, end: string, w6: string, ot6?: string): string =>
        ot6 === undefined
          ? `Five ${start} to ${end} shifts stay at or under 40 hours, with or without a lunch, so they owe no federal overtime; even a sixth ${start} to ${end} shift on Saturday keeps the week at ${w6} hours with lunches.`
          : `Five ${start} to ${end} shifts stay at or under 40 hours, with or without a lunch, so they owe no federal overtime; a sixth ${start} to ${end} shift on Saturday would bring the week to ${w6} hours with lunches, ${ot6} of them overtime.`,
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
        `Here is a Monday-to-Friday week of ${start} to ${end} shifts as the time card calculator fills it in, with a 30-minute unpaid lunch each day, at ${rate} an hour under the federal overtime rule: the hours of each day, the hours of the week so far and the gross pay so far.`,
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
        twoHours: string,
        twoPay: string,
        yearHours: string,
        yearPay: string,
      ): string =>
        `Two weeks of ${start} to ${end} cards come to ${twoHours} hours, ${twoPay} a biweekly pay period; 52 weeks of ${start} to ${end} cards, ${yearHours} hours and ${yearPay} a year before taxes.`,
      minimum: (start: string, end: string, week: string, two: string): string =>
        `At the federal minimum wage of $7.25, the same ${start} to ${end} card pays ${week} a week and ${two} every two weeks.`,
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
      ): string =>
        `By Friday the ${card} card shows ${total} hours: the first 40 are regular time, ${regularPay}, and the ${overtime} hours past 40 are overtime at ${overtimeRate} an hour, ${overtimePay}, for ${pay} before taxes. The week crosses the 40-hour line on ${day}, so that day's gross pay so far already includes overtime.`,
    },
    pay: {
      heading: (start: string, end: string): string => `Pay for ${start} to ${end} at common rates`,
      intro: (
        start: string,
        end: string,
        day: string,
        week: string,
        dayPay: string,
        weekPay: string,
      ): string =>
        `From ${start} to ${end} with a 30-minute unpaid lunch you are paid ${day} hours a shift and ${week} in a five-day week: at $15.00 an hour, ${dayPay} a shift and ${weekPay} a week before taxes (time card calculator, federal overtime rule; the first row is the federal minimum wage).`,
      caption: (start: string, end: string): string => `${start} to ${end}, 30-minute lunch`,
      head: ['Hourly rate', 'One shift', 'Five shifts', 'Of it, overtime'],
    },
    breaks: {
      heading: 'Is the lunch break paid?',
      federal: (figure: string, start: string, end: string): string =>
        `Federal law does not require lunch breaks. Short breaks of about 5 to 20 minutes are paid work time (29 CFR 785.18); a meal period, ordinarily 30 minutes or more fully off duty, is not (29 CFR 785.19). So only a real lunch comes off the ${figure} from ${start} to ${end}, and two paid 15-minute breaks stay in your hours.`,
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
        `Para comprobar que de ${start} a ${end} son ${figure}, pon las dos horas en un mismo reloj y resta la entrada de la salida.`,
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
        `Si tu reloj marcador redondea al cuarto de hora más cercano, una marca de entrada de ${inFrom} a ${inTo} y una de salida de ${outFrom} a ${outTo} siguen quedando de ${start} a ${end}. El redondeo solo se permite si, con el tiempo, te pagan todo el tiempo que trabajaste (29 CFR 785.48).`,
      intro: (start: string, end: string, figure: string): string =>
        `El descanso sin pago se resta de tus horas, así que si sales a las ${end} después de un descanso te pagan menos de ${figure}. Para que te paguen las ${figure} completas entrando a las ${start}, quédate lo que dure el descanso:`,
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
        w0: string,
        w30: string,
        b0: string,
        b30: string,
        m0: string,
        m30: string,
      ): string =>
        `De lunes a viernes de ${start} a ${end} son ${w0} horas a la semana sin descanso sin pago y ${w30} con 30 minutos de comida cada día. Si te pagan cada dos semanas, de ${start} a ${end} son ${b0} o ${b30} horas por periodo de pago; en 52 semanas, el promedio es de ${m0} o ${m30} horas al mes.`,
      rule: 'Según la Ley de Normas Justas de Trabajo (FLSA), solo las horas que pasan de 40 en una semana laboral son horas extra, y se pagan al menos a 1.5 veces la tarifa regular (DOL Fact Sheet #23).',
      over: (start: string, end: string, w0: string, ot0: string): string =>
        `Cinco turnos de ${start} a ${end} sin descanso sin pago suman ${w0} horas, así que ${ot0} son horas extra;`,
      overLunch: (ot30: string): string =>
        `con 30 minutos de comida cada día, lo son ${ot30} horas.`,
      underLunch: (w30: string): string =>
        `con 30 minutos de comida cada día la semana baja a ${w30} horas, sin horas extra.`,
      under: (start: string, end: string, w6: string, ot6?: string): string =>
        ot6 === undefined
          ? `Cinco turnos de ${start} a ${end} no pasan de 40 horas, con o sin comida, así que no generan horas extra federales; incluso un sexto turno de ${start} a ${end} el sábado deja la semana en ${w6} horas con comidas.`
          : `Cinco turnos de ${start} a ${end} no pasan de 40 horas, con o sin comida, así que no generan horas extra federales; un sexto turno de ${start} a ${end} el sábado llevaría la semana a ${w6} horas con comidas, ${ot6} de ellas extra.`,
      four: (w4: string, ot4?: string): string =>
        ot4 === undefined
          ? `Cuatro de estos turnos a la semana, con 30 minutos de comida cada uno, suman ${w4} horas, dentro del límite de 40.`
          : `Cuatro de estos turnos a la semana, con 30 minutos de comida cada uno, suman ${w4} horas, ${ot4} de ellas extra.`,
      fullTime: (start: string, end: string, irs: string, bls: string): string =>
        `Cuántos turnos de ${start} a ${end} hacen un tiempo completo depende de quién cuente, porque la FLSA no fija ningún número: con 30 minutos de comida, ${irs} a la semana llegan a las 30 horas que cuenta el IRS para la cobertura médica del empleador (130 al mes), y ${bls} a las 35 horas de las estadísticas de empleo de la Oficina de Estadísticas Laborales (BLS).`,
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
        `En ${states} (en Nevada solo si ganas menos de ${below} la hora), las horas que pasan de 8 en un día de trabajo también son extra, sin importar la semana. Un turno de ${start} a ${end} con 30 minutos de comida es de ${day} horas, así que ${extra} de cada día son horas extra diarias: con la regla de California esta semana de cinco días tiene ${ca} horas extra${double === '0' ? '' : ` y ${double} horas de tiempo doble`}, frente a ${fed} con la regla federal. En Colorado el límite diario es de 12 horas.`,
    },
    card: {
      heading: (start: string, end: string): string =>
        `Una semana de ${start} a ${end} en la tarjeta de horas`,
      intro: (start: string, end: string, rate: string): string =>
        `Esta es una semana de lunes a viernes con turnos de ${start} a ${end} tal como la llena la calculadora de tarjeta de horas, con 30 minutos de comida sin pago cada día, a ${rate} la hora con la regla federal de horas extra: las horas de cada día, las horas acumuladas de la semana y el pago bruto acumulado.`,
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
        twoHours: string,
        twoPay: string,
        yearHours: string,
        yearPay: string,
      ): string =>
        `Dos semanas de tarjetas de ${start} a ${end} suman ${twoHours} horas, ${twoPay} por un periodo de pago quincenal; 52 semanas de tarjetas de ${start} a ${end}, ${yearHours} horas y ${yearPay} al año antes de impuestos.`,
      minimum: (start: string, end: string, week: string, two: string): string =>
        `Con el salario mínimo federal de $7.25, la misma tarjeta de ${start} a ${end} paga ${week} a la semana y ${two} cada dos semanas.`,
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
      ): string =>
        `Al viernes la tarjeta ${card} suma ${total} horas: las primeras 40 son a tarifa normal, ${regularPay}, y las ${overtime} horas después de 40 son horas extra a ${overtimeRate} la hora, ${overtimePay}, en total ${pay} antes de impuestos. La semana pasa de 40 horas el ${day}, así que el pago acumulado de ese día ya incluye horas extra.`,
    },
    pay: {
      heading: (start: string, end: string): string =>
        `Pago de ${start} a ${end} con tarifas comunes`,
      intro: (
        start: string,
        end: string,
        day: string,
        week: string,
        dayPay: string,
        weekPay: string,
      ): string =>
        `De ${start} a ${end} con 30 minutos de comida sin pago te pagan ${day} horas por turno y ${week} en una semana de cinco días: a $15.00 la hora, ${dayPay} por turno y ${weekPay} a la semana antes de impuestos (calculadora de tarjeta de horas, regla federal de horas extra; la primera fila es el salario mínimo federal).`,
      caption: (start: string, end: string): string => `De ${start} a ${end}, 30 minutos de comida`,
      head: ['Tarifa por hora', 'Un turno', 'Cinco turnos', 'De eso, horas extra'],
    },
    breaks: {
      heading: '¿Se paga el descanso para comer?',
      federal: (figure: string, start: string, end: string): string =>
        `La ley federal no exige descansos para comer. Los descansos cortos, de unos 5 a 20 minutos, son tiempo de trabajo pagado (29 CFR 785.18); un descanso para comer, por lo general de 30 minutos o más y libre de tareas, no lo es (29 CFR 785.19). Así que solo una comida de verdad se resta de las ${figure} de ${start} a ${end}, y dos descansos pagados de 15 minutos siguen en tus horas.`,
      states: (figure: string, count: number, list: string): string =>
        `Algunos estados sí exigen un descanso para comer. Para un turno de ${figure} de entrada a salida, la tabla de descansos para comer por estado del Departamento de Trabajo de EE. UU. (1 de enero de 2023) indica uno en ${String(count)} estados: ${list}. Cada una tiene excepciones; revisa la tuya en la tabla.`,
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
  const six30 = weekOf(shift, 6, 30);
  const four30 = weekOf(shift, 4, 30);
  const monthly = (week: Rational): string => hoursText(week.mul(Rational.of(52, 12)));
  const weekParagraphs = [
    w.week.totals(
      start,
      finish,
      hoursText(five0.totalHours),
      hoursText(five30.totalHours),
      hoursText(five0.totalHours.mul(Rational.of(2))),
      hoursText(five30.totalHours.mul(Rational.of(2))),
      monthly(five0.totalHours),
      monthly(five30.totalHours),
    ),
    [
      w.week.rule,
      isZero(five0.overtimeHours)
        ? w.week.under(start, finish, hoursText(six30.totalHours), overtimeOf(six30))
        : `${w.week.over(start, finish, hoursText(five0.totalHours), hoursText(five0.overtimeHours))} ${
            isZero(five30.overtimeHours)
              ? w.week.underLunch(hoursText(five30.totalHours))
              : w.week.overLunch(hoursText(five30.overtimeHours))
          }`,
      ...(spanHours >= 10 ? [w.week.four(hoursText(four30.totalHours), overtimeOf(four30))] : []),
    ].join(' '),
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
  const minimumCard = weekOf(shift, CARD_DAYS, 30, RATES[0]);
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
      );

  // the pay at common rates, from the time card
  const payRows = RATES.map((rate) => {
    const day = weekOf(shift, 1, 30, rate);
    const week = weekOf(shift, 5, 30, rate);
    return [moneyText(rate), moneyText(day.pay), moneyText(week.pay), moneyText(week.overtimePay)];
  });

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
      after: [
        w.clockOut.rounding(
          clockOf(shift.start - ROUNDING),
          clockOf(shift.start + ROUNDING),
          start,
          clockOf(end - ROUNDING),
          clockOf(end + ROUNDING),
          finish,
        ),
      ],
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
        `${punches} ${cardAfter}`,
        // each workweek stands alone under the FLSA, so a pay period and a year are whole weeks
        w.card.periods(
          start,
          finish,
          hoursText(card.totalHours.mul(Rational.of(2))),
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
      id: 'pay',
      heading: w.pay.heading(start, finish),
      paragraphs: [
        w.pay.intro(
          start,
          finish,
          decimalHoursText(short),
          hoursText(five30.totalHours),
          moneyText(weekOf(shift, 1, 30).pay),
          moneyText(five30.pay),
        ),
      ],
      table: { caption: w.pay.caption(start, finish), head: w.pay.head, rows: payRows },
    },
    {
      id: 'breaks',
      heading: w.breaks.heading,
      paragraphs: [
        w.breaks.federal(figure, start, finish),
        ...(applying.length === 0
          ? []
          : [w.breaks.states(figure, applying.length, list.join('; '))]),
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
  ];
  const sources: LongTailSource[] = [
    SOURCES.factSheet23,
    SOURCES.breaks,
    SOURCES.ecfr18,
    SOURCES.ecfr19,
    SOURCES.ecfr48,
    SOURCES.mealTable,
    SOURCES.irsFullTime,
    SOURCES.blsCps,
    ...(dailyOvertime
      ? [OVERTIME_STATES_SOURCES.dol, OVERTIME_STATES_SOURCES.ca, OVERTIME_STATES_SOURCES.ak]
      : []),
  ];
  return { sections, sources };
};
