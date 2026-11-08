import { type Money, Rational, scaleMoney, usd } from '@maestro-calc/core';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { moneyText } from '../format.ts';
import { MINIMUM_WAGE_STATES, MINIMUM_WAGE_STATES_SOURCES } from '../guide/minimum-wage-states.ts';
import { OVERTIME_STATES_SOURCES } from '../guide/overtime-states.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { Job } from './routes.ts';
import { type LongTailSection, type LongTailSource, SOURCES } from './sections.ts';

/*
 * The sections of the pay converter pages (an hourly rate a year, a salary an hour) and of the
 * time-and-a-half pages under their answer: the arithmetic period by period, the figures at other
 * weekly hours, the overtime the FLSA adds (Fact Sheet #23), the exemption salary level (Fact
 * Sheet #17A) or the state minimum wages, and California's daily overtime. Every dollar is the pay
 * converter's or the time card's.
 */

/** The salary the executive, administrative and professional exemptions require, a week (Fact Sheet #17A). */
const EXEMPT_WEEKLY = usd(684);

/** The weekly hours of the tables. */
const HOURLY_HOURS = ['20', '30', '35', '37.5', '40'] as const;
const SALARY_HOURS = ['35', '37.5', '40', '45', '50', '55', '60'] as const;

const short = (money: Money): string => moneyText(money).replace(/\.00$/, '');

/** The pay converter's outputs on `amount` per `per`, at `hours` a week and `weeks` paid weeks. */
const convert = (
  amount: string,
  per: 'hour' | 'year',
  hours = '40',
  weeks = 52,
): Readonly<
  Record<'annual' | 'hourly' | 'weekly' | 'biweekly' | 'semimonthly' | 'monthly', Money>
> => {
  const ran = payConverter.run({ amount, per, hoursPerWeek: hours, weeksPerYear: String(weeks) });
  if (!ran.ok) throw new Error(`the pay converter must run on ${amount}`);
  const out = new Map<string, Money>(ran.value.outputs.map(({ key, value }) => [key, value]));
  const of = (key: string): Money => {
    const value = out.get(key);
    if (value === undefined) throw new Error(`no output ${key}`);
    return value;
  };
  return {
    annual: of('annual'),
    hourly: of('hourly'),
    weekly: of('weekly'),
    biweekly: of('biweekly'),
    semimonthly: of('semimonthly'),
    monthly: of('monthly'),
  };
};

/** One day of a time card week: clock in and out on a 24-hour clock, no break. */
type Day = readonly [string, string];

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/** The gross pay of the time card on `days` at `rate` under `rule`. */
export const payOf = (
  rate: string,
  days: readonly Day[],
  rule: 'federal' | 'california',
): Money => {
  const raw = Object.fromEntries<string>([
    ['rate', rate],
    ['rule', rule],
    ...DAYS.flatMap((day, index): [string, string][] => {
      const worked = days[index];
      return [
        [day, worked?.[0] ?? ''],
        [`${day}Out`, worked?.[1] ?? ''],
        [`${day}Break`, '0'],
      ];
    }),
  ]);
  const ran = timeCard.run(raw);
  const pay = ran.ok ? ran.value.outputs.find(({ key }) => key === 'pay')?.value : undefined;
  if (pay === undefined || !('currency' in pay)) throw new Error(`the week at ${rate} must run`);
  return pay;
};

/** A week of `count` days of `hours` hours from 7:00 or 8:00, and its length. */
export const daysOf = (count: number, hours: number): readonly Day[] => {
  const start = hours > 10 ? 7 : 8;
  return Array.from({ length: count }, (): Day => [
    `${String(start)}:00`,
    `${String(start + hours)}:00`,
  ]);
};

/** A federal week of 40 hours plus `overtime` hours, Monday to Friday from 8:00. */
const federalWeekOf = (overtime: number): readonly Day[] =>
  Array.from({ length: 5 }, (_, index): Day => {
    const extra = Math.floor(overtime / 5) + (index === 4 ? overtime % 5 : 0);
    return ['8:00', `${String(16 + extra)}:00`];
  });

/** The pay of a week of 40 hours plus `overtime` under the federal rule, from the time card. */
const overtimeWeek = (rate: string, overtime: number): Money =>
  payOf(rate, federalWeekOf(overtime), 'federal');

const WORDS = {
  en: {
    heading: 'How the figures are worked out',
    hourly: {
      intro: (rate: string, annual: string): string =>
        `${rate} an hour comes to ${annual} a year at 40 hours a week and 52 paid weeks. Here is the arithmetic, period by period:`,
      steps: (
        r: string,
        w: string,
        b: string,
        a: string,
        m: string,
        s: string,
      ): readonly string[] => [
        `A week: ${r} × 40 hours = ${w}.`,
        `Every two weeks: ${w} × 2 = ${b}.`,
        `A year: ${w} × 52 weeks = ${a}, the same as ${r} × 2,080 hours.`,
        `A month: ${a} ÷ 12 = ${m}; twice a month: ${a} ÷ 24 = ${s}.`,
      ],
      hoursHeading: (rate: string): string => `${rate} an hour at other weekly hours`,
      hoursIntro: (rate: string): string =>
        `A part-time or shorter full-time schedule changes every figure. At 52 paid weeks, the pay converter gives ${rate} an hour as:`,
      caption: (rate: string): string => `${rate} an hour by hours a week`,
      head: ['Hours a week', 'A week', 'A month', 'A year'],
      overtime: (rate: string, half: string, w45: string, w50: string, a45: string): string =>
        `Past 40 hours the federal FLSA owes at least time and a half for each hour over 40 in a workweek, ${half} an hour at ${rate} (DOL Fact Sheet #23). The time card puts a 45-hour week at ${w45} and a 50-hour week at ${w50}; 45 hours every week of the year would come to ${a45}.`,
      unpaid: (rate: string, a50: string, annual: string): string =>
        `If two of the 52 weeks are unpaid, ${rate} an hour at 40 hours comes to ${a50} a year instead of ${annual}; paid time off keeps those weeks paid.`,
      minimumHeading: 'Against the minimum wage',
      below: (rate: string, count: number, list: string): string =>
        `The federal minimum wage is $7.25 an hour. In the state table of this site (U.S. Department of Labor, July 1, 2026), the minimum wage is above ${rate} in ${String(count)} of the 50 states and DC: ${list}. In those states most employers must pay more than ${rate} (the table notes the exceptions); everywhere else ${rate} is at or above the state minimum.`,
      above: (rate: string, top: string, state: string, gap: string): string =>
        `The federal minimum wage is $7.25 an hour, and the highest minimum in the state table of this site (U.S. Department of Labor, July 1, 2026) is ${top} in ${state}: ${rate} is ${gap} an hour above it, so it clears the minimum wage in every state.`,
    },
    salary: {
      intro: (salary: string, hourly: string): string =>
        `${salary} a year comes to ${hourly} an hour at 40 hours a week and 52 paid weeks. Here is the arithmetic:`,
      steps: (
        s: string,
        w: string,
        h: string,
        b: string,
        sm: string,
        m: string,
      ): readonly string[] => [
        `A week: ${s} ÷ 52 = ${w}.`,
        `An hour: ${w} ÷ 40 = ${h}, the same as ${s} ÷ 2,080 hours.`,
        `Every two weeks: ${s} ÷ 26 = ${b}; twice a month: ${s} ÷ 24 = ${sm}.`,
        `A month: ${s} ÷ 12 = ${m}.`,
      ],
      hoursHeading: (salary: string): string => `${salary} a year at other weekly hours`,
      hoursIntro: (salary: string): string =>
        `A salary pays the same however long the week, so the hourly figure of ${salary} falls as the hours rise:`,
      caption: (salary: string): string => `${salary} a year, an hour, by hours a week`,
      head: ['Hours a week', 'An hour'],
      exemptHeading: 'Paid or unpaid overtime',
      under: (salary: string, weekly: string): string =>
        `${salary} a year is ${weekly} a week, under the $684 a week that the FLSA requires for the executive, administrative and professional exemptions (DOL Fact Sheet #17A). Paid that salary, you cannot be exempt from overtime under those exemptions, whatever your title: each hour over 40 in a workweek is owed at least time and a half.`,
      over: (salary: string, weekly: string): string =>
        `${salary} a year is ${weekly} a week, over the $684 a week that the FLSA requires for the executive, administrative and professional exemptions (DOL Fact Sheet #17A). The salary alone does not make you exempt: your duties must meet the test of the exemption too, and if they do not, each hour over 40 in a workweek is overtime.`,
      paid: (hourly: string, half: string, w45: string, w50: string): string =>
        `If the salary pays for a 40-hour week and you are not exempt, the regular rate is the weekly salary divided by those 40 hours, ${hourly} (29 CFR 778.113), and time and a half is ${half}. A 45-hour week then pays ${w45} and a 50-hour week ${w50}, the salary plus the overtime hours at ${half}.`,
      unpaid: (salary: string, h45: string, h50: string): string =>
        `If you are exempt, the extra hours are unpaid: at 45 hours a week ${salary} is ${h45} an hour, and at 50 hours ${h50}.`,
    },
    overtime: {
      steps: (
        r: string,
        half: string,
        ot: string,
        reg: string,
        pay: string,
        annual: string,
        otAnnual: string,
      ): readonly string[] => [
        `Time and a half: ${r} × 1.5 = ${half} an hour.`,
        `10 overtime hours: 10 × ${half} = ${ot}.`,
        `A 50-hour week: 40 × ${r} = ${reg} for the regular hours, plus ${ot}, is ${pay} before taxes.`,
        `50 hours every week for a year of 52 weeks comes to ${annual}, of which ${otAnnual} is overtime.`,
      ],
      intro: (rate: string): string =>
        `Under the federal FLSA only the hours over 40 in a workweek are overtime, paid at least 1.5 times the regular rate (DOL Fact Sheet #23). At ${rate} an hour:`,
      californiaHeading: (rate: string): string =>
        `Daily overtime in California at ${rate} an hour`,
      california: (rate: string): string =>
        `California also counts each workday: time and a half past 8 hours and double time past 12, ${rate} × 2 an hour (California Labor Commissioner). The time card prices three weeks at ${rate} under each rule:`,
      caption: (rate: string): string => `Weeks at ${rate} an hour, gross pay`,
      head: ['Week', 'Federal rule', 'California rule'],
      weeks: ['Four 10-hour days (40 h)', 'Five 10-hour days (50 h)', 'Three 13-hour days (39 h)'],
    },
  },
  es: {
    heading: 'Cómo se calcula',
    hourly: {
      intro: (rate: string, annual: string): string =>
        `${rate} la hora son ${annual} al año con 40 horas por semana y 52 semanas pagadas. Esta es la cuenta, período por período:`,
      steps: (
        r: string,
        w: string,
        b: string,
        a: string,
        m: string,
        s: string,
      ): readonly string[] => [
        `Por semana: ${r} × 40 horas = ${w}.`,
        `Cada dos semanas: ${w} × 2 = ${b}.`,
        `Al año: ${w} × 52 semanas = ${a}, lo mismo que ${r} × 2,080 horas.`,
        `Al mes: ${a} ÷ 12 = ${m}; dos veces al mes: ${a} ÷ 24 = ${s}.`,
      ],
      hoursHeading: (rate: string): string => `${rate} la hora con otras horas por semana`,
      hoursIntro: (rate: string): string =>
        `Un horario de medio tiempo o un tiempo completo más corto cambia todas las cifras. Con 52 semanas pagadas, la calculadora de pago da para ${rate} la hora:`,
      caption: (rate: string): string => `${rate} la hora según las horas por semana`,
      head: ['Horas por semana', 'Por semana', 'Al mes', 'Al año'],
      overtime: (rate: string, half: string, w45: string, w50: string, a45: string): string =>
        `Después de 40 horas, la ley federal FLSA exige al menos tiempo y medio por cada hora que pase de 40 en una semana laboral, ${half} la hora con ${rate} (DOL Fact Sheet #23). La tarjeta de horas da ${w45} por una semana de 45 horas y ${w50} por una de 50; 45 horas todas las semanas del año sumarían ${a45}.`,
      unpaid: (rate: string, a50: string, annual: string): string =>
        `Si dos de las 52 semanas no se pagan, ${rate} la hora con 40 horas son ${a50} al año en lugar de ${annual}; las vacaciones pagadas mantienen esas semanas pagadas.`,
      minimumHeading: 'Frente al salario mínimo',
      below: (rate: string, count: number, list: string): string =>
        `El salario mínimo federal es de $7.25 la hora. En la tabla por estado de este sitio (Departamento de Trabajo de EE. UU., 1 de julio de 2026), el mínimo es mayor que ${rate} en ${String(count)} de los 50 estados y DC: ${list}. En esos estados la mayoría de los empleadores debe pagar más de ${rate} (la tabla indica las excepciones); en el resto, ${rate} está en el mínimo estatal o por encima.`,
      above: (rate: string, top: string, state: string, gap: string): string =>
        `El salario mínimo federal es de $7.25 la hora, y el mínimo más alto de la tabla por estado de este sitio (Departamento de Trabajo de EE. UU., 1 de julio de 2026) es de ${top} en ${state}: ${rate} está ${gap} la hora por encima, así que supera el salario mínimo de todos los estados.`,
    },
    salary: {
      intro: (salary: string, hourly: string): string =>
        `${salary} al año son ${hourly} la hora con 40 horas por semana y 52 semanas pagadas. Esta es la cuenta:`,
      steps: (
        s: string,
        w: string,
        h: string,
        b: string,
        sm: string,
        m: string,
      ): readonly string[] => [
        `Por semana: ${s} ÷ 52 = ${w}.`,
        `Por hora: ${w} ÷ 40 = ${h}, lo mismo que ${s} ÷ 2,080 horas.`,
        `Cada dos semanas: ${s} ÷ 26 = ${b}; dos veces al mes: ${s} ÷ 24 = ${sm}.`,
        `Al mes: ${s} ÷ 12 = ${m}.`,
      ],
      hoursHeading: (salary: string): string => `${salary} al año con otras horas por semana`,
      hoursIntro: (salary: string): string =>
        `Un sueldo paga lo mismo sin importar cuánto dure la semana, así que lo que rinden ${salary} por hora baja cuando suben las horas:`,
      caption: (salary: string): string => `${salary} al año, por hora, según las horas por semana`,
      head: ['Horas por semana', 'Por hora'],
      exemptHeading: 'Horas extra pagadas o sin pagar',
      under: (salary: string, weekly: string): string =>
        `${salary} al año son ${weekly} a la semana, menos de los $684 a la semana que la FLSA exige para las exenciones de ejecutivo, administrativo y profesional (DOL Fact Sheet #17A). Con ese sueldo no puedes quedar exento de horas extra por esas exenciones, sea cual sea tu puesto: cada hora que pase de 40 en una semana laboral se paga al menos a tiempo y medio.`,
      over: (salary: string, weekly: string): string =>
        `${salary} al año son ${weekly} a la semana, más de los $684 a la semana que la FLSA exige para las exenciones de ejecutivo, administrativo y profesional (DOL Fact Sheet #17A). El sueldo solo no te hace exento: tus tareas también deben cumplir la prueba de la exención, y si no la cumplen, cada hora que pase de 40 en una semana laboral es hora extra.`,
      paid: (hourly: string, half: string, w45: string, w50: string): string =>
        `Si el sueldo paga una semana de 40 horas y no estás exento, la tarifa regular es el sueldo semanal dividido entre esas 40 horas, ${hourly} (29 CFR 778.113), y el tiempo y medio es ${half}. Una semana de 45 horas paga entonces ${w45} y una de 50 horas ${w50}: el sueldo más las horas extra a ${half}.`,
      unpaid: (salary: string, h45: string, h50: string): string =>
        `Si estás exento, las horas de más no se pagan: con 45 horas a la semana ${salary} rinden ${h45} la hora, y con 50 horas ${h50}.`,
    },
    overtime: {
      steps: (
        r: string,
        half: string,
        ot: string,
        reg: string,
        pay: string,
        annual: string,
        otAnnual: string,
      ): readonly string[] => [
        `Tiempo y medio: ${r} × 1.5 = ${half} la hora.`,
        `10 horas extra: 10 × ${half} = ${ot}.`,
        `Una semana de 50 horas: 40 × ${r} = ${reg} por las horas regulares, más ${ot}, son ${pay} antes de impuestos.`,
        `50 horas todas las semanas durante un año de 52 semanas suman ${annual}, de los que ${otAnnual} son horas extra.`,
      ],
      intro: (rate: string): string =>
        `Según la ley federal FLSA, solo las horas que pasan de 40 en una semana laboral son horas extra, y se pagan al menos a 1.5 veces la tarifa regular (DOL Fact Sheet #23). Con ${rate} la hora:`,
      californiaHeading: (rate: string): string =>
        `Horas extra diarias en California a ${rate} la hora`,
      california: (rate: string): string =>
        `California también cuenta cada día de trabajo: tiempo y medio después de 8 horas y tiempo doble después de 12, ${rate} × 2 la hora (Comisionado Laboral de California). La tarjeta de horas calcula tres semanas a ${rate} con cada regla:`,
      caption: (rate: string): string => `Semanas a ${rate} la hora, pago bruto`,
      head: ['Semana', 'Regla federal', 'Regla de California'],
      weeks: [
        'Cuatro días de 10 horas (40 h)',
        'Cinco días de 10 horas (50 h)',
        'Tres días de 13 horas (39 h)',
      ],
    },
  },
} as const;

export interface JobSections {
  readonly sections: readonly LongTailSection[];
  readonly sources: readonly LongTailSource[];
}

const hourlySections = (job: Job, lang: Lang): JobSections => {
  const w = WORDS[lang].hourly;
  const base = convert(job.amount, 'hour');
  const rate = short(usd(Rational.of(Math.round(Number(job.amount) * 100), 100)));
  const half = moneyText(scaleMoney(base.hourly, Rational.of(3, 2)));
  const w45 = overtimeWeek(job.amount, 5);
  const w50 = overtimeWeek(job.amount, 10);
  const rows = HOURLY_HOURS.map((hours) => {
    const at = convert(job.amount, 'hour', hours);
    return [hours, moneyText(at.weekly), moneyText(at.monthly), moneyText(at.annual)];
  });
  // the state minimum wages, in cents, set against the rate
  const cents = Math.round(Number(job.amount) * 100);
  if (MINIMUM_WAGE_STATES.length !== 51) throw new Error('the table holds the 50 states and DC');
  const above = MINIMUM_WAGE_STATES.filter(({ wage }) => wage > cents).toSorted(
    (a, b) => b.wage - a.wage || a.name[lang].localeCompare(b.name[lang]),
  );
  const dollars = (wage: number): string => moneyText(usd(Rational.of(wage, 100)));
  const [top] = MINIMUM_WAGE_STATES.toSorted((a, b) => b.wage - a.wage);
  if (top === undefined) throw new Error('no state minimum wage');
  const minimum =
    above.length > 0
      ? w.below(
          rate,
          above.length,
          above.map(({ name, wage }) => `${name[lang]} (${dollars(wage)})`).join(', '),
        )
      : w.above(rate, dollars(top.wage), top.name[lang], dollars(cents - top.wage));
  return {
    sections: [
      {
        id: 'worked',
        heading: WORDS[lang].heading,
        paragraphs: [w.intro(rate, moneyText(base.annual))],
        steps: w.steps(
          rate,
          moneyText(base.weekly),
          moneyText(base.biweekly),
          moneyText(base.annual),
          moneyText(base.monthly),
          moneyText(base.semimonthly),
        ),
      },
      {
        id: 'hours',
        heading: w.hoursHeading(rate),
        paragraphs: [w.hoursIntro(rate)],
        table: { caption: w.caption(rate), head: w.head, rows },
        after: [
          w.overtime(
            rate,
            half,
            moneyText(w45),
            moneyText(w50),
            moneyText(scaleMoney(w45, Rational.of(52))),
          ),
          w.unpaid(
            rate,
            moneyText(convert(job.amount, 'hour', '40', 50).annual),
            moneyText(base.annual),
          ),
        ],
      },
      { id: 'minimum', heading: w.minimumHeading, paragraphs: [minimum] },
    ],
    sources: [SOURCES.factSheet23, MINIMUM_WAGE_STATES_SOURCES.dol],
  };
};

const salarySections = (job: Job, lang: Lang): JobSections => {
  const w = WORDS[lang].salary;
  const base = convert(job.amount, 'year');
  const salary = short(usd(Number(job.amount)));
  const half = scaleMoney(base.hourly, Rational.of(3, 2));
  const withOvertime = (hours: number): Money =>
    usd(base.weekly.amount.add(half.amount.mul(Rational.of(hours))));
  const rows = SALARY_HOURS.map((hours) => [
    hours,
    moneyText(convert(job.amount, 'year', hours).hourly),
  ]);
  const exempt =
    base.weekly.amount.compare(EXEMPT_WEEKLY.amount) < 0
      ? w.under(salary, moneyText(base.weekly))
      : w.over(salary, moneyText(base.weekly));
  return {
    sections: [
      {
        id: 'worked',
        heading: WORDS[lang].heading,
        paragraphs: [w.intro(salary, moneyText(base.hourly))],
        steps: w.steps(
          salary,
          moneyText(base.weekly),
          moneyText(base.hourly),
          moneyText(base.biweekly),
          moneyText(base.semimonthly),
          moneyText(base.monthly),
        ),
      },
      {
        id: 'hours',
        heading: w.hoursHeading(salary),
        paragraphs: [w.hoursIntro(salary)],
        table: { caption: w.caption(salary), head: w.head, rows },
      },
      {
        id: 'exempt',
        heading: w.exemptHeading,
        paragraphs: [
          exempt,
          w.paid(
            moneyText(base.hourly),
            moneyText(half),
            moneyText(withOvertime(5)),
            moneyText(withOvertime(10)),
          ),
          w.unpaid(
            salary,
            moneyText(convert(job.amount, 'year', '45').hourly),
            moneyText(convert(job.amount, 'year', '50').hourly),
          ),
        ],
      },
    ],
    sources: [SOURCES.factSheet23, SOURCES.factSheet17a, SOURCES.ecfr778113],
  };
};

const overtimeSections = (job: Job, lang: Lang): JobSections => {
  const w = WORDS[lang].overtime;
  const rate = `$${job.amount}`;
  const hourly = usd(Rational.of(Math.round(Number(job.amount) * 100), 100));
  const half = scaleMoney(hourly, Rational.of(3, 2));
  const ot = scaleMoney(half, Rational.of(10));
  const reg = scaleMoney(hourly, Rational.of(40));
  const pay = overtimeWeek(job.amount, 10);
  if (!pay.amount.equals(reg.amount.add(ot.amount))) throw new Error('the time card must add up');
  const weeks = [daysOf(4, 10), daysOf(5, 10), daysOf(3, 13)];
  const rows = weeks.map((days, index) => [
    w.weeks[index] ?? '',
    moneyText(payOf(job.amount, days, 'federal')),
    moneyText(payOf(job.amount, days, 'california')),
  ]);
  return {
    sections: [
      {
        id: 'worked',
        heading: WORDS[lang].heading,
        paragraphs: [w.intro(rate)],
        steps: w.steps(
          rate,
          moneyText(half),
          moneyText(ot),
          moneyText(reg),
          moneyText(pay),
          moneyText(scaleMoney(pay, Rational.of(52))),
          moneyText(scaleMoney(ot, Rational.of(52))),
        ),
      },
      {
        id: 'california',
        heading: w.californiaHeading(rate),
        paragraphs: [w.california(rate)],
        table: { caption: w.caption(rate), head: w.head, rows },
      },
    ],
    sources: [SOURCES.factSheet23, OVERTIME_STATES_SOURCES.ca],
  };
};

/** The sections and sources of a pay converter or time-and-a-half page. */
export const jobSectionsOf = (job: Job, lang: Lang): JobSections => {
  if (job.kind === 'overtime') return overtimeSections(job, lang);
  return job.per === 'hour' ? hourlySections(job, lang) : salarySections(job, lang);
};
