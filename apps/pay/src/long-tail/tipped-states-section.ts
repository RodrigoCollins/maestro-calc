import { compareMoney, type Money, Rational, usd } from '@maestro-calc/core';
import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { moneyText } from '../format.ts';
import {
  centsText,
  TIPPED_STATES,
  TIPPED_STATES_GUIDE_PATHS,
  TIPPED_STATES_SOURCES,
  type TippedState,
} from '../guide/tipped-states.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { Tipped } from './routes.ts';
import type { LongTailSection, LongTailSource } from './sections.ts';

/*
 * The state section of a tipped page: the page's own week (its tips and its hours) run through the
 * tipped wage calculator under each row of the tipped minimum wage table (DOL, last revised July 1,
 * 2026), with the state's cash wage, tip credit and minimum wage. Every dollar is the calculator's.
 */

/** Hawaii allows its tip credit only when wages and tips come to $7.00 an hour above the minimum. */
const HAWAII = 'Hawaii';
const HAWAII_MARGIN = 700;

interface StateWeek {
  readonly state: TippedState;
  /** The cash wage the employer pays on this week, in cents an hour. */
  readonly cash: number;
  /** Whether Hawaii's condition took the tip credit away on this week. */
  readonly creditLost: boolean;
  readonly topUp: Money;
  readonly totalPay: Money;
  readonly perHour: Money;
}

const dollars = (cents: number): string => (cents / 100).toFixed(2);

/** The calculator on the week of `job` under `state`. */
const stateWeekOf = (job: Tipped, state: TippedState): StateWeek => {
  const hours = Rational.of(Number(job.hours));
  // Hawaii: wages and tips together must reach the minimum plus $7.00 an hour, else no tip credit
  const creditLost =
    state.name.en === HAWAII &&
    Rational.of(state.cash, 100)
      .mul(hours)
      .add(Rational.of(Number(job.tips)))
      .compare(Rational.of(state.minimum + HAWAII_MARGIN, 100).mul(hours)) < 0;
  const cash = creditLost ? state.minimum : state.cash;
  const ran = tippedWage.run({
    cashWage: dollars(cash),
    tips: job.tips,
    hours: job.hours,
    minimumWage: dollars(state.minimum),
    maxTipCredit: dollars(creditLost ? 0 : state.credit),
  });
  if (!ran.ok) throw new Error(`the tipped week of ${job.slug.en} in ${state.name.en} must run`);
  const out = new Map<string, unknown>(ran.value.outputs.map(({ key, value }) => [key, value]));
  const money = (key: string): Money => out.get(key) as Money;
  return {
    state,
    cash,
    creditLost,
    topUp: money('topUp'),
    totalPay: money('totalPay'),
    perHour: money('perHour'),
  };
};

/** `A, B and C`, `A, B y C`. */
const listOf = (items: readonly string[], lang: Lang): string =>
  items.length < 2
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} ${lang === 'en' ? 'and' : 'y'} ${String(items.at(-1))}`;

const WORDS = {
  en: {
    heading: (tips: string, hours: string): string =>
      `${tips} in tips over ${hours} hours, state by state`,
    intro: (tips: string, hours: string): string =>
      `Most states set their own tipped minimum wage. Here is this same week, ${hours} hours with ${tips} in tips, under each state's cash wage, tip credit and minimum wage, worked out by the tipped wage calculator: the top-up the employer owes when wages and tips fall short of the state minimum, and what the week pays before taxes.`,
    range: (low: string, lowStates: string, high: string, highStates: string): string =>
      `The week pays the least, ${low}, in ${lowStates}, and the most, ${high}, in ${highStates}.`,
    count: (count: number): string => `${String(count)} states`,
    owing: (count: number, federal: string, above: number): string =>
      `${count === 0 ? 'No state owes a top-up on this week' : `The employer owes a top-up in ${String(count)} of the 50 states and DC`}; at the federal $2.13 and $7.25 the week pays ${federal}, and ${String(above)} states pay more.`,
    caption: (tips: string, hours: string): string =>
      `${hours} hours with ${tips} in tips, by state`,
    head: ['State', 'Cash wage', 'Top-up owed', 'Week before taxes', 'An hour'],
    rows: 'Each row is the state’s main tipped rate in the U.S. Department of Labor table of tipped minimum wages (last revised July 1, 2026); New York, food service in New York City, Long Island and Westchester, is from the New York State Department of Labor, and Florida’s $15.00 of September 30, 2026 from its constitution.',
    hawaii: (minimum: string, cash: string): string =>
      `Hawaii allows its tip credit only when wages and tips come to at least $7.00 an hour above its minimum: they do not on this week, so the employer pays the full ${minimum} minimum as the cash wage instead of ${cash}.`,
    hawaiiKept: (cash: string): string =>
      `Hawaii allows its tip credit only when wages and tips come to at least $7.00 an hour above its minimum: they do on this week, so its ${cash} cash wage stands.`,
    others:
      'Some states set other rates for some tipped workers, such as Connecticut bartenders and New York outside the city; the guide lists every state with its notes.',
    guide: 'Tipped minimum wage by state',
  },
  es: {
    heading: (tips: string, hours: string): string =>
      `${tips} de propinas en ${hours} horas, estado por estado`,
    intro: (tips: string, hours: string): string =>
      `La mayoría de los estados fija su propio salario mínimo con propinas. Esta es la misma semana, ${hours} horas con ${tips} de propinas, con el salario en efectivo, el crédito por propinas y el salario mínimo de cada estado, calculada con la calculadora de propinas por hora: la diferencia que te debe el empleador si el salario y las propinas no llegan al mínimo del estado, y lo que paga la semana antes de impuestos.`,
    range: (low: string, lowStates: string, high: string, highStates: string): string =>
      `La semana paga lo mínimo, ${low}, en ${lowStates}, y lo máximo, ${high}, en ${highStates}.`,
    count: (count: number): string => `${String(count)} estados`,
    owing: (count: number, federal: string, above: number): string =>
      `${count === 0 ? 'Ningún estado debe una diferencia en esta semana' : `El empleador debe una diferencia en ${String(count)} de los 50 estados y DC`}; con los $2.13 y $7.25 federales la semana paga ${federal}, y ${String(above)} estados pagan más.`,
    caption: (tips: string, hours: string): string =>
      `${hours} horas con ${tips} de propinas, por estado`,
    head: [
      'Estado',
      'Salario en efectivo',
      'Diferencia que te deben',
      'Semana antes de impuestos',
      'Por hora',
    ],
    rows: 'Cada fila es la tarifa principal con propinas del estado en la tabla de salarios mínimos con propinas del Departamento de Trabajo de EE. UU. (última revisión: 1 de julio de 2026); Nueva York, servicio de comidas en la ciudad de Nueva York, Long Island y Westchester, viene del Departamento de Trabajo del Estado de Nueva York, y los $15.00 de Florida desde el 30 de septiembre de 2026, de su constitución.',
    hawaii: (minimum: string, cash: string): string =>
      `Hawái permite el crédito por propinas solo si el salario y las propinas suman al menos $7.00 la hora más que su mínimo: en esta semana no llegan, así que el empleador paga el mínimo completo de ${minimum} como salario en efectivo en lugar de ${cash}.`,
    hawaiiKept: (cash: string): string =>
      `Hawái permite el crédito por propinas solo si el salario y las propinas suman al menos $7.00 la hora más que su mínimo: en esta semana llegan, así que se mantiene su salario en efectivo de ${cash}.`,
    others:
      'Algunos estados fijan otras tarifas para algunos trabajadores con propinas, como los bartenders de Connecticut y Nueva York fuera de la ciudad; la guía lista cada estado con sus notas.',
    guide: 'Salario mínimo con propinas por estado',
  },
} as const;

/** The states of `weeks` named, or counted when there are more than three. */
const statesText = (weeks: readonly StateWeek[], lang: Lang): string =>
  weeks.length > 3
    ? WORDS[lang].count(weeks.length)
    : listOf(
        weeks.map(({ state }) => state.name[lang]),
        lang,
      );

/** The state section of the tipped page of `job` in `lang`, and the sources it cites. */
export const tippedStatesSectionOf = (
  job: Tipped,
  lang: Lang,
  federal: Money,
): { readonly section: LongTailSection; readonly sources: readonly LongTailSource[] } => {
  const w = WORDS[lang];
  const tips = moneyText(usd(Number(job.tips)));
  const weeks = TIPPED_STATES.map((state) => stateWeekOf(job, state));
  const sorted = weeks.toSorted((a, b) => compareMoney(a.totalPay, b.totalPay));
  const [first, last] = [sorted[0], sorted.at(-1)];
  if (first === undefined || last === undefined) throw new Error('the tipped table has states');
  const lowest = weeks.filter(({ totalPay }) => compareMoney(totalPay, first.totalPay) === 0);
  const highest = weeks.filter(({ totalPay }) => compareMoney(totalPay, last.totalPay) === 0);
  const owing = weeks.filter(({ topUp }) => compareMoney(topUp, usd(0)) > 0).length;
  const above = weeks.filter(({ totalPay }) => compareMoney(totalPay, federal) > 0).length;
  const hawaii = weeks.find(({ state }) => state.name.en === HAWAII);
  if (hawaii === undefined) throw new Error('the tipped table has Hawaii');
  return {
    section: {
      id: 'states',
      heading: w.heading(tips, job.hours),
      paragraphs: [
        w.intro(tips, job.hours),
        `${w.range(
          moneyText(first.totalPay),
          statesText(lowest, lang),
          moneyText(last.totalPay),
          statesText(highest, lang),
        )} ${w.owing(owing, moneyText(federal), above)}`,
      ],
      table: {
        caption: w.caption(tips, job.hours),
        head: w.head,
        rows: weeks.map(({ state, cash, topUp, totalPay, perHour }) => [
          state.name[lang],
          centsText(cash),
          moneyText(topUp),
          moneyText(totalPay),
          moneyText(perHour),
        ]),
      },
      after: [
        w.rows,
        hawaii.creditLost
          ? w.hawaii(centsText(hawaii.state.minimum), centsText(hawaii.state.cash))
          : w.hawaiiKept(centsText(hawaii.state.cash)),
        w.others,
      ],
      links: [{ href: TIPPED_STATES_GUIDE_PATHS[lang], label: w.guide }],
    },
    sources: [TIPPED_STATES_SOURCES.dol, TIPPED_STATES_SOURCES.ny, TIPPED_STATES_SOURCES.fl],
  };
};
