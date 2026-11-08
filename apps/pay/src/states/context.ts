import { encode, subMoney, type Money } from '@maestro-calc/core';
import { overtime, type Rule } from '@maestro-calc/pay-core/overtime';
import { hoursText, moneyText } from '../format.ts';
import { increasesOf } from '../guide/minimum-wage-2027.ts';
import {
  FEDERAL_MINIMUM_WAGE,
  MINIMUM_WAGE_STATES_SOURCES,
  UNCHANGED_2027,
  UNCONFIRMED_2027,
} from '../guide/minimum-wage-states.ts';
import { OVERTIME_STATES_SOURCES } from '../guide/overtime-states.ts';
import type { GuideSource } from '../guide/texts.ts';
import { centsText, TIPPED_STATES_SOURCES } from '../guide/tipped-states.ts';
import {
  appliesTo,
  MEAL_PERIODS,
  mealMinutesOf,
  type MealPeriod,
} from '../long-tail/meal-periods.ts';
import { SOURCES } from '../long-tail/sections.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import type { Lang } from '../time-card/receipt.ts';
import { CENSUS_DIVISIONS, divisionOf } from './divisions.ts';
import {
  engineRuleOf,
  factsOf,
  nameIn,
  outsideFlsa,
  overtimeHoursOf,
  runWeek,
  short,
  STATE_FACTS,
  valid,
  weekOf,
  yearOf,
  type StateFacts,
} from './facts.ts';
import { statePathOf } from './routes.ts';

/*
 * What one state's figures come to, beside its rows of the state tables (`./pages.ts`): its
 * minimum by the paycheck, its daily overtime on a short week, how it stands against the federal
 * $7.25, the 50 states and DC and its Census division, its meal period in the DOL table and its
 * change of January 1, 2027. Every figure is a table's or an engine's; a section that does not
 * apply to the state is left out rather than printed empty, so two pages differ where their
 * states do.
 */

/** A neighbour of the division: its page, then how it stands against the state. */
export interface ContextItem {
  readonly label: string;
  readonly href: string;
  readonly text: string;
}

export interface ContextSection {
  readonly id: 'paycheck' | 'daily' | 'compare' | 'meal' | 'next-year';
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly items?: readonly ContextItem[];
  readonly links?: readonly { readonly label: string; readonly href: string }[];
  readonly sources: readonly GuideSource[];
}

/**
 * The states whose row of the DOL meal period table turns on the industry, the size of the store
 * or the time of day (`../long-tail/meal-periods.ts` leaves them to the table itself).
 */
export const MEAL_VARIES: readonly string[] = [
  'Colorado',
  'Kentucky',
  'Maryland',
  'Nebraska',
  'New York',
  'Vermont',
];

const money = (value: Money): string => short(moneyText(value));
const capital = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
const plain = ({ label, href }: GuideSource): GuideSource => ({ label, href });
const unique = (sources: readonly GuideSource[]): readonly GuideSource[] =>
  sources
    .map(plain)
    .filter(({ href }, at, all) => all.findIndex((each) => each.href === href) === at);

const listOf = (items: readonly string[], lang: Lang): string => {
  const and = lang === 'en' ? 'and' : 'y';
  return items.length < 2
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} ${and} ${String(items.at(-1))}`;
};

const ordinal = (n: number): string => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${String(n)}th`;
  const suffix = ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th';
  return `${String(n)}${suffix}`;
};

const COUNT_WORDS: Readonly<Record<Lang, readonly string[]>> = {
  en: ['', 'One', 'Two', 'Three', 'Four', 'Five'],
  es: ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco'],
};
const countWord = (n: number, lang: Lang): string => COUNT_WORDS[lang][n] ?? String(n);

/** The 51 minimum wages, lowest first; the 26th is the median. */
const WAGES = STATE_FACTS.map(({ minimum }) => minimum.wage).toSorted((a, b) => a - b);
const MEDIAN = WAGES[(WAGES.length - 1) / 2] ?? FEDERAL_MINIMUM_WAGE;
const AT_FLOOR = STATE_FACTS.filter(({ minimum }) => minimum.wage === FEDERAL_MINIMUM_WAGE).length;

/** The state's name at the start of a sentence, and in its possessive. */
const startOf = (facts: StateFacts, lang: Lang): string => capital(nameIn(facts, lang));
const possessive = (facts: StateFacts): string => `${startOf(facts, 'en')}’s`;
const possessiveIn = (facts: StateFacts): string => `${nameIn(facts, 'en')}’s`;

// ---------------------------------------------------------------------------------------------
// The minimum by the paycheck

/** The FLSA's cash wage and tip credit (29 U.S.C. 203(m), Fact Sheet #15), in cents. */
const FEDERAL_CASH = 213;
const FEDERAL_CREDIT = 512;

/** How a state with a tip credit stands against the federal cash wage and tip credit. */
const federalTippedOf = (facts: StateFacts, lang: Lang): string => {
  const { cash, credit } = facts.tipped;
  if (cash === FEDERAL_CASH && credit === FEDERAL_CREDIT)
    return lang === 'en'
      ? `${startOf(facts, 'en')} uses the federal pair as it stands: the $2.13 cash wage and the $5.12 tip credit of the FLSA.`
      : `${startOf(facts, 'es')} usa la pareja federal tal cual: el salario en efectivo de $2.13 y el crédito por propinas de $5.12 de la FLSA.`;
  const cashDiff = centsText(cash - FEDERAL_CASH);
  const creditDiff = centsText(Math.abs(credit - FEDERAL_CREDIT));
  const creditPart =
    credit === FEDERAL_CREDIT
      ? lang === 'en'
        ? 'the same as the federal $5.12'
        : 'igual al federal de $5.12'
      : credit < FEDERAL_CREDIT
        ? lang === 'en'
          ? `${creditDiff} less than the federal $5.12`
          : `${creditDiff} menos que el federal de $5.12`
        : lang === 'en'
          ? `${creditDiff} more than the federal $5.12, because the full minimum is higher`
          : `${creditDiff} más que el federal de $5.12, porque el mínimo completo es más alto`;
  return lang === 'en'
    ? `That cash wage is ${cashDiff} an hour above the federal $2.13, and ${possessiveIn(facts)} tip credit of ${centsText(credit)} is ${creditPart}.`
    : `Ese salario en efectivo supera en ${cashDiff} la hora los $2.13 federales, y el crédito por propinas de ${nameIn(facts, lang)}, ${centsText(credit)}, es ${creditPart}.`;
};

const paycheckOf = (facts: StateFacts, lang: Lang): ContextSection => {
  const the = nameIn(facts, lang);
  const { minimum, tipped } = facts;
  const wage = centsText(minimum.wage);
  const year = yearOf(minimum.wage);
  const weekly = money(year('weekly'));
  const biweekly = money(year('biweekly'));
  const monthly = moneyText(year('monthly'));
  const annual = money(year('annual'));
  const long = runWeek(weekOf(minimum.wage, engineRuleOf(facts), 10));
  const rate = moneyText(long('overtimeRate'));
  const pay = moneyText(long('pay'));
  const overtimePay = moneyText(long('overtimePay'));

  const first = (() => {
    if (minimum.wage > FEDERAL_MINIMUM_WAGE)
      return lang === 'en'
        ? `Full time at ${possessiveIn(facts)} ${wage} an hour, 40 hours a week for 52 weeks, comes to ${weekly} a week, ${biweekly} on a check every two weeks, ${monthly} a month and ${annual} a year, before taxes.`
        : `En ${the}, tiempo completo al mínimo de ${wage} la hora, 40 horas a la semana durante 52 semanas, da ${weekly} a la semana, ${biweekly} en un cheque cada dos semanas, ${monthly} al mes y ${annual} al año, antes de impuestos.`;
    if (minimum.federal && minimum.stateRate === undefined)
      return lang === 'en'
        ? `With no minimum wage law of its own, ${the} leaves workers on the federal ${wage}: ${weekly} for a 40-hour week, ${biweekly} every two weeks, ${monthly} a month and ${annual} over 52 weeks of full time, before taxes.`
        : `Sin una ley de salario mínimo propia, ${the} deja a sus trabajadores con los ${wage} federales: ${weekly} por una semana de 40 horas, ${biweekly} cada dos semanas, ${monthly} al mes y ${annual} en 52 semanas de tiempo completo, antes de impuestos.`;
    if (minimum.stateRate !== undefined)
      return lang === 'en'
        ? `${possessive(facts)} own rate of ${centsText(minimum.stateRate)} sits under the federal one, so a worker covered by the FLSA gets ${wage}: ${annual} for a full-time year, ${monthly} a month, ${biweekly} every two weeks and ${weekly} a week, before taxes.`
        : `La tarifa propia de ${the}, ${centsText(minimum.stateRate)}, queda por debajo de la federal, así que quien está cubierto por la FLSA cobra ${wage}: ${annual} en un año de tiempo completo, ${monthly} al mes, ${biweekly} cada dos semanas y ${weekly} a la semana, antes de impuestos.`;
    return lang === 'en'
      ? `${possessive(facts)} own law sets the same ${wage} as federal law, which works out to ${monthly} a month for full time: ${weekly} a week, ${biweekly} on a two-week check and ${annual} a year, before taxes.`
      : `La ley de ${the} fija los mismos ${wage} que la ley federal, que dan ${monthly} al mes por tiempo completo: ${weekly} a la semana, ${biweekly} en un cheque de dos semanas y ${annual} al año, antes de impuestos.`;
  })();

  const covered = outsideFlsa(facts.overtime)
    ? lang === 'en'
      ? ', under the federal 40-hour rule that covers most workers there'
      : ', con la regla federal de 40 horas que cubre a la mayoría allí'
    : '';
  const second =
    lang === 'en'
      ? `Overtime at that minimum is ${rate} an hour. Five 10-hour days, a 50-hour week, pay ${pay} in ${the}${covered}, ${overtimePay} of it for the 10 overtime hours.`
      : `Las horas extra a ese mínimo se pagan a ${rate} la hora. Cinco días de 10 horas, una semana de 50 horas, pagan ${pay} en ${the}${covered}, de los que ${overtimePay} son por las 10 horas extra.`;

  const third = (() => {
    if (tipped.credit === 0)
      return lang === 'en'
        ? `${startOf(facts, 'en')} allows no tip credit, so a server or bartender gets the same ${weekly} a week from the employer as any other worker at the minimum, and every tip is on top of it.`
        : `${startOf(facts, 'es')} no permite crédito por propinas, así que un mesero o un bartender recibe del empleador los mismos ${weekly} a la semana que cualquier otro trabajador al mínimo, y cada propina va aparte.`;
    const cashYear = yearOf(tipped.cash);
    const tips = money(subMoney(year('annual'), cashYear('annual')));
    const cash = centsText(tipped.cash);
    const worked =
      lang === 'en'
        ? `A tipped worker in ${the} can be paid ${cash} an hour in cash: ${money(cashYear('weekly'))} for 40 hours and ${money(cashYear('annual'))} over a full-time year. Tips have to cover the rest, up to ${tips} a year; if they fall short, the employer owes the difference up to ${annual}.`
        : `A quien recibe propinas en ${the} se le pueden pagar ${cash} la hora en efectivo: ${money(cashYear('weekly'))} por 40 horas y ${money(cashYear('annual'))} en un año de tiempo completo. Las propinas deben cubrir el resto, hasta ${tips} al año; si no alcanzan, el empleador debe la diferencia hasta llegar a ${annual}.`;
    return `${worked} ${federalTippedOf(facts, lang)}`;
  })();

  return {
    id: 'paycheck',
    heading:
      lang === 'en'
        ? `${possessive(facts)} minimum wage by the paycheck`
        : `El salario mínimo de ${the}, cheque por cheque`,
    paragraphs: [first, second, third],
    sources: unique([
      MINIMUM_WAGE_STATES_SOURCES[minimum.source],
      OVERTIME_STATES_SOURCES[facts.overtime.source],
      TIPPED_STATES_SOURCES[tipped.source],
      ...(tipped.credit === 0 ? [] : [SOURCES.factSheet15]),
    ]),
  };
};

// ---------------------------------------------------------------------------------------------
// Daily overtime on a short week

const dailyOf = (facts: StateFacts, lang: Lang): ContextSection | undefined => {
  const rule: Rule = engineRuleOf(facts);
  const daily = facts.overtime.daily;
  if (rule === 'federal' || daily === undefined) return undefined;
  const the = nameIn(facts, lang);
  const day = daily + 2;
  const days = Math.ceil(40 / day);
  const total = String(day * days);
  const federalWeek = weekOf(facts.minimum.wage, 'federal', day, days);
  const stateWeek = weekOf(facts.minimum.wage, rule, day, days);
  const federalHours = overtimeHoursOf(federalWeek);
  const stateHours = hoursText(overtimeHoursOf(stateWeek));
  const federalPay = moneyText(runWeek(federalWeek)('pay'));
  const statePay = moneyText(runWeek(stateWeek)('pay'));
  const wage = centsText(facts.minimum.wage);
  const none = federalHours.isZero();
  const href = `${OVERTIME_PATHS[lang]}?${encode(overtime, valid(overtime.validate(stateWeek), OVERTIME_PATHS[lang]))}`;
  const paragraph =
    lang === 'en'
      ? `${countWord(days, 'en')} ${String(day)}-hour days make ${total} hours. Counted by the week alone, as the FLSA does, ${none ? 'none of them is overtime' : `${hoursText(federalHours)} of them are overtime`} and the week pays ${federalPay} at the ${wage} minimum; ${possessiveIn(facts)} rule of overtime after ${String(daily)} hours in a day makes ${stateHours} of them overtime, so the same week pays ${statePay}.`
      : `${countWord(days, 'es')} días de ${String(day)} horas suman ${total} horas. Contadas solo por semana, como hace la FLSA, ${none ? 'ninguna es hora extra' : `${hoursText(federalHours)} son horas extra`} y la semana paga ${federalPay} al mínimo de ${wage}; la regla de ${the} de horas extra después de ${String(daily)} horas al día hace que ${stateHours} sean horas extra, así que la misma semana paga ${statePay}.`;
  return {
    id: 'daily',
    heading:
      lang === 'en'
        ? `Daily overtime in ${the}: a ${String(days)}-day week`
        : `Horas extra por día en ${the}: una semana de ${String(days)} días`,
    paragraphs: [paragraph],
    links: [
      {
        label:
          lang === 'en'
            ? `Open these ${String(days)} days in the overtime calculator`
            : `Abre estos ${String(days)} días en la calculadora de horas extra`,
        href,
      },
    ],
    sources: unique([OVERTIME_STATES_SOURCES[facts.overtime.source], SOURCES.factSheet23]),
  };
};

// ---------------------------------------------------------------------------------------------
// The state against the federal rate, the 50 states and DC, and its division

const rankOf = (facts: StateFacts, lang: Lang): string => {
  const wage = facts.minimum.wage;
  const rank = 1 + STATE_FACTS.filter(({ minimum }) => minimum.wage > wage).length;
  const level = STATE_FACTS.filter((each) => each !== facts && each.minimum.wage === wage).map(
    (each) => nameIn(each, lang),
  );
  const median = centsText(MEDIAN);
  if (rank === 1 && level.length === 0)
    return lang === 'en'
      ? 'It is the highest minimum wage of the 50 states and DC.'
      : 'Es el salario mínimo más alto de los 50 estados y DC.';
  const tie =
    level.length === 0
      ? ''
      : level.length <= 3
        ? lang === 'en'
          ? `, level with ${listOf(level, lang)}`
          : `, empatado con ${listOf(level, lang)}`
        : lang === 'en'
          ? `, level with ${String(level.length)} others`
          : `, empatado con otros ${String(level.length)}`;
  const against =
    wage > MEDIAN
      ? lang === 'en'
        ? `above the median state rate of ${median}`
        : `por encima de la mediana estatal de ${median}`
      : wage === MEDIAN
        ? lang === 'en'
          ? 'exactly the median state rate'
          : 'justo en la mediana estatal'
        : lang === 'en'
          ? `below the median state rate of ${median}`
          : `por debajo de la mediana estatal de ${median}`;
  return lang === 'en'
    ? `That makes it the ${ordinal(rank)}-highest of the 50 states and DC${tie}, ${against}.`
    : `Eso lo deja en el puesto ${String(rank)} de los 50 estados y DC${tie}, ${against}.`;
};

/** Whether the DOL meal period table lists a rule for the state. */
const hasMealRule = (facts: StateFacts): boolean =>
  MEAL_VARIES.includes(facts.tipped.name.en) ||
  MEAL_PERIODS.some(({ state }) => state.en === facts.tipped.name.en);

const neighbourOf = (facts: StateFacts, other: StateFacts, lang: Lang): ContextItem => {
  const the = nameIn(facts, lang);
  const wage = facts.minimum.wage;
  const theirs = other.minimum.wage;
  const diff = centsText(Math.abs(theirs - wage));
  const yearly = money(
    theirs > wage
      ? subMoney(yearOf(theirs)('annual'), yearOf(wage)('annual'))
      : subMoney(yearOf(wage)('annual'), yearOf(theirs)('annual')),
  );
  const head =
    theirs === wage
      ? lang === 'en'
        ? `: ${centsText(theirs)} an hour, the same as ${the}`
        : `: ${centsText(theirs)} la hora, lo mismo que ${the}`
      : theirs > wage
        ? lang === 'en'
          ? `: ${centsText(theirs)} an hour, ${diff} more than ${the} and ${yearly} more over a full-time year`
          : `: ${centsText(theirs)} la hora, ${diff} más que ${the} y ${yearly} más en un año de tiempo completo`
        : lang === 'en'
          ? `: ${centsText(theirs)} an hour, ${diff} less than ${the} and ${yearly} less over a full-time year`
          : `: ${centsText(theirs)} la hora, ${diff} menos que ${the} y ${yearly} menos en un año de tiempo completo`;
  const extras = [
    ...(other.tipped.cash === facts.tipped.cash
      ? []
      : [
          other.tipped.credit === 0
            ? lang === 'en'
              ? 'no tip credit'
              : 'sin crédito por propinas'
            : lang === 'en'
              ? `a tipped cash wage of ${centsText(other.tipped.cash)}`
              : `un salario en efectivo con propinas de ${centsText(other.tipped.cash)}`,
        ]),
    ...(other.overtime.daily === undefined || facts.overtime.daily !== undefined
      ? []
      : [
          lang === 'en'
            ? `overtime after ${String(other.overtime.daily)} hours in a day`
            : `horas extra después de ${String(other.overtime.daily)} horas al día`,
        ]),
    ...(other.overtime.seventhDay === undefined || facts.overtime.seventhDay !== undefined
      ? []
      : [
          lang === 'en'
            ? 'an overtime rule for the seventh day of work'
            : 'una regla de horas extra para el séptimo día de trabajo',
        ]),
    ...(!hasMealRule(other) || hasMealRule(facts)
      ? []
      : [
          lang === 'en'
            ? 'a meal-period rule in the DOL table'
            : 'una regla de pausa para comer en la tabla del DOL',
        ]),
    ...(other.minimum.scheduled === undefined
      ? []
      : [
          lang === 'en'
            ? `a rise to ${centsText(other.minimum.scheduled.wage)} in January 2027`
            : `una subida a ${centsText(other.minimum.scheduled.wage)} en enero de 2027`,
        ]),
  ];
  return {
    label: other.tipped.name[lang],
    href: statePathOf(other.tipped.name[lang], lang),
    text: `${head}${extras.map((extra) => `; ${extra}`).join('')}.`,
  };
};

const standingOf = (facts: StateFacts, others: readonly StateFacts[], lang: Lang): string => {
  const wage = facts.minimum.wage;
  const count = (test: (other: number) => boolean): number =>
    others.filter(({ minimum }) => test(minimum.wage)).length;
  const higher = count((other) => other > wage);
  const same = count((other) => other === wage);
  const lower = count((other) => other < wage);
  const all = others.length;
  const every =
    lang === 'en'
      ? all === 2
        ? 'both'
        : `all ${String(all)}`
      : all === 2
        ? 'los dos'
        : `los ${String(all)}`;
  if (higher === all)
    return lang === 'en' ? `${every} pay more an hour` : `${every} pagan más la hora`;
  if (lower === all)
    return lang === 'en' ? `${every} pay less an hour` : `${every} pagan menos la hora`;
  if (same === all) return lang === 'en' ? `${every} pay the same` : `${every} pagan lo mismo`;
  const part = (n: number, en: string, es: string): readonly string[] =>
    n === 0
      ? []
      : [
          lang === 'en'
            ? `${String(n)} ${n === 1 ? `pays ${en}` : `pay ${en}`}`
            : `${String(n)} ${n === 1 ? `paga ${es}` : `pagan ${es}`}`,
        ];
  return listOf(
    [
      ...part(higher, 'more', 'más'),
      ...part(same, 'the same', 'lo mismo'),
      ...part(lower, 'less', 'menos'),
    ],
    lang,
  );
};

const compareOf = (facts: StateFacts, lang: Lang): ContextSection => {
  const the = nameIn(facts, lang);
  const wage = facts.minimum.wage;
  const year = yearOf(wage);
  const federal = yearOf(FEDERAL_MINIMUM_WAGE);
  const first =
    wage > FEDERAL_MINIMUM_WAGE
      ? `${
          lang === 'en'
            ? `${possessive(facts)} ${centsText(wage)} is ${centsText(wage - FEDERAL_MINIMUM_WAGE)} an hour above the federal $7.25, ${money(subMoney(year('weekly'), federal('weekly')))} more for a 40-hour week and ${money(subMoney(year('annual'), federal('annual')))} more over a full-time year.`
            : `Los ${centsText(wage)} de ${the} superan en ${centsText(wage - FEDERAL_MINIMUM_WAGE)} la hora el mínimo federal de $7.25: ${money(subMoney(year('weekly'), federal('weekly')))} más por una semana de 40 horas y ${money(subMoney(year('annual'), federal('annual')))} más en un año de tiempo completo.`
        } ${rankOf(facts, lang)}`
      : lang === 'en'
        ? `${startOf(facts, 'en')} is one of the ${String(AT_FLOOR)} states at the federal $7.25, the lowest rate in the table. The median of the 50 states and DC is ${centsText(MEDIAN)}: a full-time worker paid it earns ${money(subMoney(yearOf(MEDIAN)('annual'), year('annual')))} a year more than one at the minimum in ${the}.`
        : `${startOf(facts, 'es')} es uno de los ${String(AT_FLOOR)} estados con el mínimo federal de $7.25, la tarifa más baja de la tabla. La mediana de los 50 estados y DC es ${centsText(MEDIAN)}: quien trabaja tiempo completo a esa tarifa gana ${money(subMoney(yearOf(MEDIAN)('annual'), year('annual')))} más al año que quien gana el mínimo en ${the}.`;
  const division = divisionOf(facts.tipped.name.en);
  const others = division.states
    .filter((name) => name !== facts.tipped.name.en)
    .map((name) => factsOf(name));
  const second =
    lang === 'en'
      ? `The Census Bureau places ${the} in its ${division.name.en} division; of the ${String(others.length)} neighbours there, ${standingOf(facts, others, lang)}.`
      : `La Oficina del Censo ubica a ${the} en su división ${division.name.es}; de sus ${String(others.length)} vecinos allí, ${standingOf(facts, others, lang)}.`;
  const items = others.map((other) => neighbourOf(facts, other, lang));
  return {
    id: 'compare',
    heading: lang === 'en' ? `How ${the} compares` : `Cómo se compara ${the}`,
    paragraphs: [first, second],
    items,
    sources: unique([
      MINIMUM_WAGE_STATES_SOURCES.dol,
      CENSUS_DIVISIONS,
      ...others.flatMap((other) => [
        ...(other.tipped.cash === facts.tipped.cash
          ? []
          : [TIPPED_STATES_SOURCES[other.tipped.source]]),
        ...(other.minimum.scheduled === undefined
          ? []
          : [MINIMUM_WAGE_STATES_SOURCES[other.minimum.scheduled.source]]),
      ]),
    ]),
  };
};

// ---------------------------------------------------------------------------------------------
// The meal period of the DOL table

const thresholdText = (period: MealPeriod, lang: Lang): string => {
  const hours = String(period.threshold.hours);
  if (period.threshold.kind === 'over')
    return lang === 'en' ? `more than ${hours} hours` : `más de ${hours} horas`;
  return lang === 'en' ? `${hours} hours or more` : `${hours} horas o más`;
};

const windowText = (period: MealPeriod, lang: Lang): string => {
  const window = period.window;
  if (window === undefined) return '';
  if (window.kind === 'between')
    return lang === 'en'
      ? `, taken after the first ${String(window.afterStart)} hours and before the last ${String(window.beforeEnd)}`
      : `, después de las primeras ${String(window.afterStart)} horas y antes de las últimas ${String(window.beforeEnd)}`;
  if (window.kind === 'fromStart')
    return lang === 'en'
      ? `, starting no sooner than ${String(window.from)} hours and no later than ${String(window.to)} hours into the shift`
      : `, que empiece no antes de ${String(window.from)} horas ni después de ${String(window.to)} horas desde el inicio del turno`;
  return lang === 'en'
    ? `, no later than ${String(window.afterStart)} hours into the shift`
    : `, a más tardar ${String(window.afterStart)} horas después del inicio del turno`;
};

const mealOf = (facts: StateFacts, lang: Lang): ContextSection | undefined => {
  const name = facts.tipped.name.en;
  const the = nameIn(facts, lang);
  const heading = lang === 'en' ? `Meal breaks in ${the}` : `Pausas para comer en ${the}`;
  const federal =
    lang === 'en'
      ? 'Federal law requires no meal break, so the rule comes from the state.'
      : 'La ley federal no exige una pausa para comer, así que la regla es del estado.';
  const unpaid =
    lang === 'en'
      ? 'Under federal rules a meal period is unpaid only when the worker is fully relieved of duty, ordinarily for 30 minutes or more (29 CFR 785.19).'
      : 'Según las reglas federales, una pausa para comer no se paga solo si quien trabaja queda libre de toda tarea, normalmente por 30 minutos o más (29 CFR 785.19).';
  const sources = [SOURCES.mealTable, SOURCES.breaks, SOURCES.ecfr19];
  if (MEAL_VARIES.includes(name))
    return {
      id: 'meal',
      heading,
      paragraphs: [
        lang === 'en'
          ? `${federal} The U.S. Department of Labor’s table of state meal periods does list a rule for ${the}, but not as one length owed after a set number of hours, so this page does not reduce it to a figure: read ${possessiveIn(facts)} row in the table before you plan a shift around it.`
          : `${federal} La tabla del Departamento de Trabajo de EE. UU. sobre los periodos de comida estatales sí tiene una regla para ${the}, pero no como una duración fija después de cierto número de horas, así que esta página no la reduce a una cifra: lee la fila de ${the} en la tabla antes de planear un turno.`,
        unpaid,
      ],
      sources,
    };
  const period = MEAL_PERIODS.find(({ state }) => state.en === name);
  if (period === undefined) return undefined;
  const eight = mealMinutesOf(period, 8);
  const six = appliesTo(period, 6) ? mealMinutesOf(period, 6) : undefined;
  const threshold = thresholdText(period, lang);
  const window = windowText(period, lang);
  const rule = (() => {
    if (period.minutes === undefined)
      return lang === 'en'
        ? `The table names no length for ${the}: the time only has to be enough to eat, on a shift of ${threshold} in a row.`
        : `La tabla no fija una duración para ${the}: el tiempo solo tiene que alcanzar para comer, en turnos de ${threshold} seguidas.`;
    const shortShift =
      six === undefined
        ? lang === 'en'
          ? `, while a 6-hour shift falls short of the ${threshold} that set it off`
          : `, mientras que uno de 6 horas no llega a las ${threshold} que la activan`
        : lang === 'en'
          ? `, and a 6-hour shift already does (${String(six)} minutes)`
          : `, y uno de 6 horas también (${String(six)} minutos)`;
    return lang === 'en'
      ? `By that rule, an 8-hour shift in ${the} comes with ${String(eight)} minutes for a meal${window}${shortShift}.`
      : `Con esa regla, un turno de 8 horas en ${the} trae ${String(eight)} minutos para comer${window}${shortShift}.`;
  })();
  const quoted =
    lang === 'en'
      ? `${federal} The U.S. Department of Labor’s table of state meal periods gives ${possessiveIn(facts)} as: “${period.standard}”`
      : `${federal} La tabla del Departamento de Trabajo de EE. UU. sobre los periodos de comida estatales le da a ${the} ${
          period.minutes === undefined
            ? `tiempo suficiente sin pago, sin una duración fija, en turnos de ${threshold} seguidas`
            : `${String(period.minutes)} minutos en turnos de ${threshold}`
        }; la tabla tiene el texto completo, con sus excepciones.`;
  return { id: 'meal', heading, paragraphs: [quoted, rule, unpaid], sources };
};

// ---------------------------------------------------------------------------------------------
// The change of January 1, 2027

const nextYearOf = (facts: StateFacts, lang: Lang): ContextSection | undefined => {
  const name = facts.tipped.name.en;
  const the = nameIn(facts, lang);
  const heading =
    lang === 'en'
      ? `${possessive(facts)} minimum wage in 2027`
      : `El salario mínimo de ${the} en 2027`;
  const row = increasesOf(lang).find((each) => each.name === facts.tipped.name[lang]);
  if (row !== undefined && facts.minimum.scheduled !== undefined) {
    const rate = moneyText(
      runWeek(weekOf(facts.minimum.scheduled.wage, 'federal', 9))('overtimeRate'),
    );
    const annual = short(row.annual);
    return {
      id: 'next-year',
      heading,
      paragraphs: [
        lang === 'en'
          ? `On January 1, 2027, ${possessiveIn(facts)} minimum rises from ${row.current} to ${row.next} an hour, ${row.increase} more (${row.percent}). Over a full-time year that adds ${annual}, and the overtime rate at the new minimum becomes ${rate}.`
          : `El 1 de enero de 2027 el mínimo de ${the} sube de ${row.current} a ${row.next} la hora, ${row.increase} más (${row.percent}). En un año de tiempo completo suma ${annual}, y la tarifa de horas extra con el nuevo mínimo pasa a ${rate}.`,
        ...(row.notes === undefined ? [] : [row.notes]),
      ],
      sources: unique([row.source]),
    };
  }
  const unchanged = UNCHANGED_2027.find(({ state }) => state === name);
  if (unchanged !== undefined)
    return {
      id: 'next-year',
      heading,
      paragraphs: [
        lang === 'en'
          ? `${startOf(facts, 'en')} adjusts its minimum wage by a formula, but its Department of Labor says the rate stays the same on January 1, 2027, because a condition of the law that pauses the inflation increase was met: the ${centsText(facts.minimum.wage)} of this page carries into 2027.`
          : `${startOf(facts, 'es')} ajusta su salario mínimo con una fórmula, pero su Departamento de Trabajo dice que la tarifa no cambia el 1 de enero de 2027, porque se cumplió una condición de la ley que pausa el aumento por inflación: los ${centsText(facts.minimum.wage)} de esta página siguen en 2027.`,
      ],
      sources: unique([MINIMUM_WAGE_STATES_SOURCES[unchanged.source]]),
    };
  const unconfirmed = UNCONFIRMED_2027.find(({ state }) => state === name);
  if (unconfirmed !== undefined)
    return {
      id: 'next-year',
      heading,
      paragraphs: [
        `${unconfirmed.law[lang]} ${unconfirmed.unread[lang]}`,
        lang === 'en'
          ? `Until a primary source gives ${possessiveIn(facts)} 2027 rate, this page keeps the ${centsText(facts.minimum.wage)} in force now; check the new one with the agency.`
          : `Mientras ninguna fuente primaria dé la tarifa de 2027 de ${the}, esta página mantiene los ${centsText(facts.minimum.wage)} vigentes; consulta la nueva con la agencia.`,
      ],
      links: [unconfirmed.check],
      sources: unique([unconfirmed.check]),
    };
  return undefined;
};

/** The sections of one state's page beside its table rows, each only where it applies. */
export const contextOf = (facts: StateFacts, lang: Lang): readonly ContextSection[] =>
  [
    paycheckOf(facts, lang),
    dailyOf(facts, lang),
    compareOf(facts, lang),
    mealOf(facts, lang),
    nextYearOf(facts, lang),
  ].filter((section): section is ContextSection => section !== undefined);
