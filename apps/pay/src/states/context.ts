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
  overtimeHoursOf,
  runWeek,
  short,
  STATE_FACTS,
  valid,
  weekOf,
  yearOf,
  type StateFacts,
} from './facts.ts';
import { childLaborOf, type Limits } from './child-labor.ts';
import { officesOf } from './labor-offices.ts';
import { JOBS, wagesOf, type Job } from './state-wages.ts';
import { paydayOf, type Frequency } from './paydays.ts';
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
  readonly id:
    | 'paycheck'
    | 'daily'
    | 'payday'
    | 'compare'
    | 'wages'
    | 'meal'
    | 'teens'
    | 'next-year'
    | 'office';
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
  const year = yearOf(minimum.wage);
  const weekly = money(year('weekly'));
  const annual = money(year('annual'));
  const tips = (() => {
    if (tipped.credit === 0)
      return lang === 'en'
        ? `${startOf(facts, 'en')} allows no tip credit, so a server or bartender gets the same ${weekly} a week from the employer as any other worker at the minimum, and every tip is on top of it.`
        : `${startOf(facts, 'es')} no permite crédito por propinas, así que un mesero o un bartender recibe del empleador los mismos ${weekly} a la semana que cualquier otro trabajador al mínimo, y cada propina va aparte.`;
    const cashYear = yearOf(tipped.cash);
    const fromTips = money(subMoney(year('annual'), cashYear('annual')));
    const cash = centsText(tipped.cash);
    const worked =
      lang === 'en'
        ? `A tipped worker in ${the} can be paid ${cash} an hour in cash: ${money(cashYear('weekly'))} for 40 hours and ${money(cashYear('annual'))} over a full-time year. Tips have to cover the rest, up to ${fromTips} a year; if they fall short, the employer owes the difference up to ${annual}.`
        : `A quien recibe propinas en ${the} se le pueden pagar ${cash} la hora en efectivo: ${money(cashYear('weekly'))} por 40 horas y ${money(cashYear('annual'))} en un año de tiempo completo. Las propinas deben cubrir el resto, hasta ${fromTips} al año; si no alcanzan, el empleador debe la diferencia hasta llegar a ${annual}.`;
    return `${worked} ${federalTippedOf(facts, lang)}`;
  })();

  return {
    id: 'paycheck',
    heading:
      lang === 'en'
        ? `Tipped pay at ${possessiveIn(facts)} minimum`
        : `Pago con propinas al mínimo de ${the}`,
    paragraphs: [tips],
    sources: unique([
      MINIMUM_WAGE_STATES_SOURCES[minimum.source],
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

// ---------------------------------------------------------------------------------------------
// The paydays of the DOL table, and the check each one makes at the minimum

const PERIOD_WORDS: Readonly<Record<Lang, Readonly<Record<Frequency, string>>>> = {
  en: {
    weekly: 'weekly',
    biweekly: 'every two weeks',
    semimonthly: 'twice a month',
    monthly: 'monthly',
  },
  es: {
    weekly: 'cada semana',
    biweekly: 'cada dos semanas',
    semimonthly: 'dos veces al mes',
    monthly: 'cada mes',
  },
};

const orList = (items: readonly string[], lang: Lang): string => {
  const or = lang === 'en' ? 'or' : 'o';
  return items.length < 2
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} ${or} ${String(items.at(-1))}`;
};

const paydayOfState = (facts: StateFacts, lang: Lang): ContextSection => {
  const the = nameIn(facts, lang);
  const row = paydayOf(facts.tipped.name.en);
  const note = row.notes.map((each) => each[lang]).join(' ');
  const heading = lang === 'en' ? `Paydays in ${the}` : `Días de pago en ${the}`;
  const sources = [SOURCES.paydayTable];
  if (row.marked.length === 0) {
    const none =
      lang === 'en'
        ? `The U.S. Department of Labor’s table of state payday requirements marks no payday frequency for ${the}${note === '' ? ', and gives it no note' : `; its note reads: “${note}”`}.`
        : `La tabla de requisitos estatales de día de pago del Departamento de Trabajo de EE. UU. no marca ninguna frecuencia de pago para ${the}${note === '' ? ' ni le da una nota' : `; su nota dice: “${note}”`}.`;
    return { id: 'payday', heading, paragraphs: [none], sources };
  }
  const periods = orList(
    row.marked.map((each) => PERIOD_WORDS[lang][each]),
    lang,
  );
  const marked =
    lang === 'en'
      ? `The U.S. Department of Labor’s table of state payday requirements marks paydays ${periods} for ${the}.${note === '' ? '' : ` Its note for ${the}: “${note}”`}`
      : `La tabla de requisitos estatales de día de pago del Departamento de Trabajo de EE. UU. marca para ${the} el pago ${periods}.${note === '' ? '' : ` Su nota para ${the}: “${note}”`}`;
  const year = yearOf(facts.minimum.wage);
  const wage = centsText(facts.minimum.wage);
  const annual = money(year('annual'));
  const check = (frequency: Frequency): string => {
    if (frequency === 'weekly')
      return lang === 'en'
        ? `${money(year('weekly'))} on a weekly check (40 hours)`
        : `${money(year('weekly'))} en un cheque semanal (40 horas)`;
    if (frequency === 'biweekly')
      return lang === 'en'
        ? `${money(year('biweekly'))} every two weeks (80 hours)`
        : `${money(year('biweekly'))} cada dos semanas (80 horas)`;
    if (frequency === 'semimonthly')
      return lang === 'en'
        ? `${moneyText(year('semimonthly'))} twice a month (the ${annual} of 52 weeks divided by 24)`
        : `${moneyText(year('semimonthly'))} dos veces al mes (los ${annual} de 52 semanas entre 24)`;
    return lang === 'en'
      ? `${moneyText(year('monthly'))} on a monthly check (${annual} divided by 12)`
      : `${moneyText(year('monthly'))} en un cheque mensual (${annual} entre 12)`;
  };
  const checks = row.marked.map(check).join('; ');
  const worked =
    lang === 'en'
      ? `At the ${wage} minimum, full time of 40 hours a week comes to ${checks}, before taxes.`
      : `Al mínimo de ${wage}, el tiempo completo de 40 horas a la semana da ${checks}, antes de impuestos.`;
  const both = row.marked.includes('biweekly') && row.marked.includes('semimonthly');
  const diff = money(subMoney(year('semimonthly'), year('biweekly')));
  const compared = both
    ? [
        lang === 'en'
          ? `Every two weeks makes 26 checks a year and twice a month makes 24, so the twice-monthly check is ${diff} larger for the same ${annual} a year.`
          : `Cada dos semanas son 26 cheques al año y dos veces al mes son 24, así que el cheque de medio mes es ${diff} más grande por los mismos ${annual} al año.`,
      ]
    : [];
  return { id: 'payday', heading, paragraphs: [marked, worked, ...compared], sources };
};

// ---------------------------------------------------------------------------------------------
// The wages the BLS counted in the state, beside its minimum

/** The five jobs of the OEWS rows, by their occupation titles. */
const JOB_WORDS: Readonly<Record<Lang, Readonly<Record<Job, string>>>> = {
  en: {
    fastFood: 'fast food and counter workers',
    cashiers: 'cashiers',
    retail: 'retail salespersons',
    janitors: 'janitors and cleaners',
    cooks: 'restaurant cooks',
  },
  es: {
    fastFood: 'personal de comida rápida y mostrador',
    cashiers: 'cajeros',
    retail: 'vendedores de tiendas',
    janitors: 'conserjes y personal de limpieza',
    cooks: 'cocineros de restaurante',
  },
};

/** The 51 medians of the OEWS table, by the state's name. */
const MEDIANS = STATE_FACTS.map(({ tipped }) => wagesOf(tipped.name.en).median);

const wagesSection = (facts: StateFacts, lang: Lang): ContextSection => {
  const the = nameIn(facts, lang);
  const { jobs, p10, median, jobsAt } = wagesOf(facts.tipped.name.en);
  const wage = facts.minimum.wage;
  const minimum = centsText(wage);
  const medianText = centsText(median);
  const times = (Math.round((median * 100) / wage) / 100).toFixed(2);
  const medianYear = moneyText(yearOf(median)('annual'));
  const minimumYear = money(yearOf(wage)('annual'));
  const count = jobs.toLocaleString('en-US');
  const first =
    lang === 'en'
      ? `The Bureau of Labor Statistics counted ${count} wage and salary jobs in ${the} in May 2025. Their median pay was ${medianText} an hour, ${times} times the ${minimum} minimum: full time at the median comes to ${medianYear} a year, against ${minimumYear} at the minimum.`
      : `La Oficina de Estadísticas Laborales contó ${count} empleos asalariados en ${the} en mayo de 2025. Su pago mediano fue de ${medianText} la hora, ${times} veces el mínimo de ${minimum}: el tiempo completo a la mediana da ${medianYear} al año, frente a ${minimumYear} al mínimo.`;
  const gap = centsText(Math.abs(p10 - wage));
  const tenth =
    p10 > wage
      ? lang === 'en'
        ? `One job in ten paid less than ${centsText(p10)} an hour, ${gap} above the minimum of 2026.`
        : `Uno de cada diez empleos pagaba menos de ${centsText(p10)} la hora, ${gap} por encima del mínimo de 2026.`
      : p10 < wage
        ? lang === 'en'
          ? `One job in ten paid less than ${centsText(p10)} an hour, ${gap} under the ${minimum} minimum of 2026; the survey’s wages are those of May 2025.`
          : `Uno de cada diez empleos pagaba menos de ${centsText(p10)} la hora, ${gap} por debajo del mínimo de ${minimum} de 2026; los salarios de la encuesta son los de mayo de 2025.`
        : lang === 'en'
          ? `One job in ten paid less than ${centsText(p10)} an hour, the minimum of 2026.`
          : `Uno de cada diez empleos pagaba menos de ${centsText(p10)} la hora, el mínimo de 2026.`;
  const rank = 1 + MEDIANS.filter((each) => each > median).length;
  const lowest = MEDIANS.every((each) => each >= median);
  const standing =
    rank === 1
      ? lang === 'en'
        ? 'That median is the highest of the 50 states and DC.'
        : 'Esa mediana es la más alta de los 50 estados y DC.'
      : lowest
        ? lang === 'en'
          ? 'That median is the lowest of the 50 states and DC.'
          : 'Esa mediana es la más baja de los 50 estados y DC.'
        : lang === 'en'
          ? `That median is the ${ordinal(rank)}-highest of the 50 states and DC.`
          : `Esa mediana ocupa el puesto ${String(rank)} de los 50 estados y DC.`;
  const ranked = (Object.keys(JOBS) as Job[])
    .map((job) => ({ job, cents: jobsAt[job] }))
    .toSorted((a, b) => a.cents - b.cents);
  const low = ranked[0];
  if (low === undefined) throw new Error('no job wages');
  const lowGap = centsText(Math.abs(low.cents - wage));
  const five =
    lang === 'en'
      ? `The medians of five jobs near the bottom of the scale, lowest first: ${listOf(
          ranked.map(({ job, cents }) => `${JOB_WORDS.en[job]} ${centsText(cents)}`),
          'en',
        )}. The lowest is ${lowGap} ${low.cents >= wage ? 'above' : 'under'} the minimum.`
      : `Las medianas de cinco empleos de la parte baja de la escala, de menor a mayor: ${listOf(
          ranked.map(({ job, cents }) => `${JOB_WORDS.es[job]} ${centsText(cents)}`),
          'es',
        )}. La más baja queda ${lowGap} ${low.cents >= wage ? 'por encima del' : 'por debajo del'} mínimo.`;
  return {
    id: 'wages',
    heading:
      lang === 'en'
        ? `Wages in ${the} beside the minimum`
        : `Los salarios de ${the} frente al mínimo`,
    paragraphs: [first, `${tenth} ${standing}`, five],
    sources: [SOURCES.oews],
  };
};

// ---------------------------------------------------------------------------------------------
// The child labor limits of the DOL table

const limitsText = (limits: Limits, lang: Lang): string | undefined => {
  const { hours, night } = limits;
  if (hours === undefined && night === undefined) return undefined;
  const parts = [
    ...(hours === undefined ? [] : [lang === 'en' ? `hours ${hours.en}` : `horas ${hours.es}`]),
    ...(night === undefined
      ? []
      : [lang === 'en' ? `night work ${night.en}` : `trabajo de noche ${night.es}`]),
  ];
  return parts.join('; ');
};

/** A sentence that ends in a full stop, once. */
const stopped = (text: string): string => (text.endsWith('.') ? text : `${text}.`);

const teensOf = (facts: StateFacts, lang: Lang): ContextSection => {
  const the = nameIn(facts, lang);
  const row = childLaborOf(facts.tipped.name.en);
  const young = limitsText(row.under16, lang);
  const under16 =
    young === undefined
      ? lang === 'en'
        ? `For minors under 16, the table sets no limit in ${the}.`
        : `Para menores de 16 años, la tabla no fija ningún límite en ${the}.`
      : lang === 'en'
        ? `Under 16 in ${the}: ${young}`
        : `Menores de 16 años en ${the}: ${young}`;
  const old = limitsText(row.teens, lang);
  const teens =
    old === undefined
      ? lang === 'en'
        ? `The table sets no limit for 16- and 17-year-olds in ${the}.`
        : `La tabla no fija ningún límite para quienes tienen 16 y 17 años en ${the}.`
      : lang === 'en'
        ? `16 and 17 in ${the}: ${old}`
        : `16 y 17 años en ${the}: ${old}`;
  const federal =
    lang === 'en'
      ? 'Where a state child labor law is less restrictive than the federal law, the federal law applies (the table writes 8-40-6 for 8 hours a day, 40 a week and 6 days a week).'
      : 'Donde la ley estatal de trabajo infantil es menos estricta que la federal, se aplica la federal (la tabla escribe 8-40-6 por 8 horas al día, 40 a la semana y 6 días a la semana).';
  return {
    id: 'teens',
    heading: lang === 'en' ? `Teen workers in ${the}` : `Menores que trabajan en ${the}`,
    paragraphs: [stopped(under16), stopped(teens), federal],
    sources: [SOURCES.childLaborTable, SOURCES.factSheet43],
  };
};

// ---------------------------------------------------------------------------------------------
// The state labor office of the DOL list

/** The Wage and Hour Division's phone, as the DOL pages give it. */
const WAGE_AND_HOUR_PHONE = '1-866-487-9243';

const officeOf = (facts: StateFacts, lang: Lang): ContextSection => {
  const the = nameIn(facts, lang);
  const { offices } = officesOf(facts.tipped.name.en);
  const each = offices.map(({ name, address, phone }) =>
    lang === 'en'
      ? `the ${name} at ${address}, phone ${phone}`
      : `la oficina ${name}, en ${address}, teléfono ${phone}`,
  );
  const listed =
    lang === 'en'
      ? `The U.S. Department of Labor’s list of state labor offices gives, for ${the}, ${listOf(each, lang)}.`
      : `La lista de oficinas estatales de trabajo del Departamento de Trabajo de EE. UU. da, para ${the}, ${listOf(each, lang)}.`;
  const federal =
    lang === 'en'
      ? `The federal minimum wage and overtime of the FLSA are enforced by the department’s Wage and Hour Division, at ${WAGE_AND_HOUR_PHONE}.`
      : `El salario mínimo y las horas extra federales de la FLSA los hace cumplir la División de Horas y Salarios del mismo departamento, en el ${WAGE_AND_HOUR_PHONE}.`;
  return {
    id: 'office',
    heading: lang === 'en' ? `Who to ask in ${the}` : `A quién consultar en ${the}`,
    paragraphs: [listed, federal],
    links: offices.map(({ site, href }) => ({ label: site, href })),
    sources: [SOURCES.laborOffices],
  };
};

/** The sections of one state's page beside its table rows, each only where it applies. */
export const contextOf = (facts: StateFacts, lang: Lang): readonly ContextSection[] =>
  [
    paycheckOf(facts, lang),
    dailyOf(facts, lang),
    paydayOfState(facts, lang),
    compareOf(facts, lang),
    wagesSection(facts, lang),
    mealOf(facts, lang),
    teensOf(facts, lang),
    nextYearOf(facts, lang),
    officeOf(facts, lang),
  ].filter((section): section is ContextSection => section !== undefined);
