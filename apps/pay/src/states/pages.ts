import { encode, subMoney, type Money } from '@maestro-calc/core';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { DATA_PAGES, dayText } from '../data/pages.ts';
import { moneyText } from '../format.ts';
import {
  MINIMUM_WAGE_STATES,
  MINIMUM_WAGE_STATES_GUIDE,
  MINIMUM_WAGE_STATES_GUIDE_PATHS,
  MINIMUM_WAGE_STATES_SOURCES,
  minimumWageRowsOf,
  type MinimumWageState,
} from '../guide/minimum-wage-states.ts';
import {
  OVERTIME_STATES,
  OVERTIME_STATES_GUIDE,
  OVERTIME_STATES_GUIDE_PATHS,
  OVERTIME_STATES_SOURCES,
  type OvertimeState,
} from '../guide/overtime-states.ts';
import type { GuideSource } from '../guide/texts.ts';
import {
  centsText,
  TIPPED_STATES,
  TIPPED_STATES_GUIDE,
  TIPPED_STATES_GUIDE_PATHS,
  TIPPED_STATES_SOURCES,
  type TippedState,
} from '../guide/tipped-states.ts';
import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { PATHS } from '../pay-converter/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import { TIPPED_PATHS } from '../tipped/texts.ts';
import { STATE_ROUTES, STATE_SLUGS, STATES_INDEX_PATHS } from './routes.ts';

/*
 * The state pages (`/states/<state>`, `/es/estados/<state>`): one state's rows of the three state
 * tables (`../guide/*-states.ts`) with their sources and checked day, and worked examples the
 * pay-core engines compute at build time from those rows. Nothing on a page is typed by hand: a
 * figure is a table's or an engine's, so two states differ exactly where their laws do.
 */

type Words = Readonly<Record<Lang, string>>;

/** One state's rows of the three tables, and its slugs. */
export interface StateFacts {
  readonly slug: Words;
  readonly tipped: TippedState;
  readonly minimum: MinimumWageState;
  readonly overtime: OvertimeState;
}

const rowOf = <R extends { readonly name: Words }>(rows: readonly R[], name: string): R => {
  const row = rows.find((each) => each.name.en === name);
  if (row === undefined) throw new Error(`no row for ${name}`);
  return row;
};

/** The 50 states and DC, each with its row of every table, in the order of the slugs. */
export const STATE_FACTS: readonly StateFacts[] = TIPPED_STATES.map((tipped, index) => {
  const slug = STATE_SLUGS[index];
  if (slug === undefined) throw new Error(`no slug for ${tipped.name.en}`);
  return {
    slug,
    tipped,
    minimum: rowOf(MINIMUM_WAGE_STATES, tipped.name.en),
    overtime: rowOf(OVERTIME_STATES, tipped.name.en),
  };
});

/** The day each table was last checked, `YYYY-MM-DD`, from the data index. */
const checkedOf = (id: string): string => {
  const page = DATA_PAGES.find((each) => each.id === id);
  if (page === undefined) throw new Error(`no data page ${id}`);
  return page.checked;
};

export interface Fact {
  readonly key: string;
  readonly label: string;
  readonly value: string;
}

/** One table's row on the page. */
export interface StateSection {
  readonly id: 'minimum' | 'tipped' | 'overtime';
  readonly heading: string;
  readonly facts: readonly Fact[];
  readonly notes: readonly string[];
  readonly sources: readonly GuideSource[];
  /** The day the table was checked, in the long form of the language. */
  readonly checked: string;
  /** The table the row comes from. */
  readonly table: { readonly label: string; readonly href: string };
}

export interface Example {
  readonly id: 'week40' | 'week45' | 'annual' | 'tipped30';
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  /** The calculator opened on this example, where its address can hold the state's numbers. */
  readonly href?: string;
  readonly linkLabel?: string;
}

export interface StatePage {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly paths: Words;
  readonly sections: readonly StateSection[];
  readonly examples: {
    readonly heading: string;
    readonly items: readonly Example[];
    readonly notes: readonly string[];
  };
  readonly labels: { readonly sources: string; readonly checked: string; readonly table: string };
  readonly index: { readonly label: string; readonly href: string };
  readonly disclaimer: string;
}

const dollarsOf = (cents: number): string => (cents / 100).toFixed(2);
/** `$676.00` stays whole in a figure; `$676` reads better in a sentence. */
const short = (text: string): string => text.replace(/\.00$/, '');

/** The overtime engine's rule for the state: the California rule there, the FLSA elsewhere. */
const engineRuleOf = (facts: StateFacts): 'federal' | 'california' =>
  facts.slug.en === 'california' ? 'california' : 'federal';

/** A Monday-to-Friday week of `day` hours each at `cents` an hour, as the overtime engine takes it. */
const weekOf = (cents: number, rule: 'federal' | 'california', day: number) => {
  const hours = String(day);
  return {
    rate: dollarsOf(cents),
    rule,
    mon: hours,
    tue: hours,
    wed: hours,
    thu: hours,
    fri: hours,
    sat: '0',
    sun: '0',
  };
};

type Outputs = (key: string) => Money;

const outputsOf = (outputs: readonly { key: string; value: unknown }[]): Outputs => {
  const map = new Map(outputs.map(({ key, value }) => [key, value]));
  return (key) => {
    const value = map.get(key);
    if (typeof value !== 'object' || value === null || !('currency' in value))
      throw new Error(`no money output ${key}`);
    return value as Money;
  };
};

const runWeek = (week: ReturnType<typeof weekOf>): Outputs => {
  const ran = overtime.run(week);
  if (!ran.ok) throw new Error(`the week at ${week.rate} must run`);
  return outputsOf(ran.value.outputs);
};

/** A validated state of a calculator, which its link encodes; an invalid one stops the build. */
const valid = <T>(result: { ok: true; value: T } | { ok: false }, path: string): T => {
  if (!result.ok) throw new Error(`the link to ${path} must validate`);
  return result.value;
};

/** The state's name in a sentence: DC takes its article. */
const nameIn = (facts: StateFacts, lang: Lang): string => {
  const name = facts.tipped.name[lang];
  if (facts.slug.en !== 'district-of-columbia') return name;
  return lang === 'en' ? `the ${name}` : `el ${name}`;
};

const capital = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
const lowerFirst = (text: string): string => `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
const stop = (text: string): string => (text.endsWith('.') ? text : `${text}.`);

/** Whether the state's own weekly threshold is above 40 and applies only outside the FLSA. */
const outsideFlsa = (rule: OvertimeState): boolean => rule.weekly > 40;

const WORDS = {
  en: {
    title: (name: string) => `${name} wage and hour laws, 2026`,
    kicker: 'Laws by state · data',
    federal: (row: MinimumWageState, the: string) =>
      row.stateRate === undefined
        ? `The ${centsText(row.wage)} is the federal rate: ${the} has no minimum wage law.`
        : `The ${centsText(row.wage)} is the federal rate: the state’s own ${centsText(row.stateRate)} is lower.`,
    overtime: (rule: OvertimeState) => {
      if (!rule.stateRule) return '40 hours a week, under federal law';
      if (outsideFlsa(rule)) return '40 hours a week for most workers (federal law)';
      const hours =
        rule.daily === undefined
          ? `${String(rule.weekly)} hours a week`
          : `${String(rule.daily)} hours a day or ${String(rule.weekly)} a week`;
      return rule.notes === undefined ? hours : `${hours} (see the notes below)`;
    },
    lead: (facts: StateFacts, the: string) =>
      `The minimum wage in ${the} is ${centsText(facts.minimum.wage)} an hour in 2026; overtime is owed after ${WORDS.en.overtime(facts.overtime)}.`,
    outside: (weekly: number) =>
      `The state’s own ${String(weekly)}-hour rule covers only work the FLSA does not.`,
    double: (text: string) => `Double time is owed ${lowerFirst(stop(text))}`,
    tipped: (tipped: TippedState, the: string) =>
      tipped.credit === 0
        ? `Tipped workers get the full ${centsText(tipped.minimum)} before tips: ${the} allows no tip credit.`
        : `Tipped workers can be paid ${centsText(tipped.cash)} an hour in cash, with up to ${centsText(tipped.credit)} of their tips counted toward the ${centsText(tipped.minimum)} minimum.`,
    scheduled: (cents: number) => `The minimum rises to ${centsText(cents)} on January 1, 2027.`,
    sections: {
      minimum: 'Minimum wage',
      tipped: 'Tipped minimum wage',
      overtime: 'Overtime',
    },
    facts: {
      wage: 'Minimum wage, per hour',
      basis: 'Set by',
      scheduled: 'January 1, 2027 (scheduled)',
      cash: 'Minimum cash wage',
      credit: 'Max tip credit',
      minimum: 'Full minimum wage',
      daily: 'Time and a half after, per day',
      weekly: 'Time and a half after, per week',
      doubleTime: 'Double time',
      seventhDay: 'Seventh day',
    },
    none: 'None',
    no: 'No',
    examples: 'Worked examples at the minimum wage',
    week40: 'A 40-hour week',
    week45: 'A 45-hour week',
    annual: 'A year of full time',
    tipped30: 'A tipped worker’s 30 hours',
    week40Detail: (wage: string) =>
      `Five 8-hour days at the ${wage} minimum, before taxes: 40 regular hours, no overtime.`,
    week45Detail: (wage: string, rate: string, overtimePay: string) =>
      `Five 9-hour days at the ${wage} minimum, before taxes: 40 regular hours and 5 overtime hours at ${rate} (1.5 times ${wage}), ${overtimePay} of overtime pay.`,
    annualDetail: (wage: string, monthly: string) =>
      `40 hours a week for 52 weeks at the ${wage} minimum, before taxes: ${monthly} a month.`,
    tippedDetail: (tipped: TippedState, wages: string, credit: string) =>
      tipped.credit === 0
        ? `With no tip credit, the employer pays the full ${centsText(tipped.minimum)} an hour for the 30 hours, before tips; the tips are on top.`
        : `The employer pays ${wages} in cash wages (${centsText(tipped.cash)} an hour) and may count up to ${credit} of tips toward the rest; if tips fall short, the employer makes up the difference.`,
    overtimeLink: 'Open this week in the overtime calculator',
    annualLink: 'Open it in the hourly to salary calculator',
    tippedLink: 'Open these 30 hours in the tipped wage calculator',
    dailyNote: (name: string, daily: number) =>
      `The overtime calculator applies the federal rule and California’s. For these 9-hour days, ${name}’s daily rule after ${String(daily)} hours owes no more overtime, but the calculator will not apply that daily rule to a longer day you enter.`,
    outsideNote: (name: string, weekly: number) =>
      `These weeks follow the federal 40-hour rule, which covers most workers in ${name}; the state’s ${String(weekly)}-hour rule applies only to work the FLSA does not cover.`,
    labels: { sources: 'Sources', checked: 'Checked', table: 'The full table' },
    index: 'Wage and hour laws in every state',
    disclaimer:
      'A summary of what these agencies and statutes say, not legal advice. Cities and counties may set higher minimum wages, and exemptions or industry rules can change what you are owed: check your state’s labor department.',
  },
  es: {
    title: (name: string) => `Leyes de salario y horas en ${name}, 2026`,
    kicker: 'Leyes por estado · datos',
    federal: (row: MinimumWageState, the: string) =>
      row.stateRate === undefined
        ? `Los ${centsText(row.wage)} son la tarifa federal: ${capital(the)} no tiene ley de salario mínimo.`
        : `Los ${centsText(row.wage)} son la tarifa federal: la estatal de ${centsText(row.stateRate)} es menor.`,
    overtime: (rule: OvertimeState) => {
      if (!rule.stateRule) return '40 horas a la semana, por ley federal';
      if (outsideFlsa(rule)) return '40 horas a la semana para la mayoría (ley federal)';
      const hours =
        rule.daily === undefined
          ? `${String(rule.weekly)} horas a la semana`
          : `${String(rule.daily)} horas al día o ${String(rule.weekly)} a la semana`;
      return rule.notes === undefined ? hours : `${hours} (mira las notas abajo)`;
    },
    lead: (facts: StateFacts, the: string) =>
      `El salario mínimo en ${the} es ${centsText(facts.minimum.wage)} la hora en 2026; las horas extra se pagan después de ${WORDS.es.overtime(facts.overtime)}.`,
    outside: (weekly: number) =>
      `La regla estatal de ${String(weekly)} horas solo cubre el trabajo que la FLSA no cubre.`,
    double: (text: string) => `Se paga tiempo doble por ${lowerFirst(stop(text))}`,
    tipped: (tipped: TippedState, the: string) =>
      tipped.credit === 0
        ? `Quien recibe propinas cobra el mínimo completo de ${centsText(tipped.minimum)} antes de propinas: ${capital(the)} no permite crédito por propinas.`
        : `A quien recibe propinas se le puede pagar ${centsText(tipped.cash)} la hora en efectivo, con hasta ${centsText(tipped.credit)} de sus propinas contadas para el mínimo de ${centsText(tipped.minimum)}.`,
    scheduled: (cents: number) => `El mínimo sube a ${centsText(cents)} el 1 de enero de 2027.`,
    sections: {
      minimum: 'Salario mínimo',
      tipped: 'Salario mínimo con propinas',
      overtime: 'Horas extra',
    },
    facts: {
      wage: 'Salario mínimo, por hora',
      basis: 'Lo fija',
      scheduled: '1 de enero de 2027 (programado)',
      cash: 'Salario mínimo en efectivo',
      credit: 'Crédito máximo por propinas',
      minimum: 'Salario mínimo completo',
      daily: 'Tiempo y medio después de, por día',
      weekly: 'Tiempo y medio después de, por semana',
      doubleTime: 'Tiempo doble',
      seventhDay: 'Séptimo día',
    },
    none: 'Ninguno',
    no: 'No',
    examples: 'Ejemplos con el salario mínimo',
    week40: 'Una semana de 40 horas',
    week45: 'Una semana de 45 horas',
    annual: 'Un año de tiempo completo',
    tipped30: '30 horas de quien recibe propinas',
    week40Detail: (wage: string) =>
      `Cinco días de 8 horas al mínimo de ${wage}, antes de impuestos: 40 horas regulares, sin horas extra.`,
    week45Detail: (wage: string, rate: string, overtimePay: string) =>
      `Cinco días de 9 horas al mínimo de ${wage}, antes de impuestos: 40 horas regulares y 5 horas extra a ${rate} (1.5 veces ${wage}), ${overtimePay} de pago de horas extra.`,
    annualDetail: (wage: string, monthly: string) =>
      `40 horas a la semana durante 52 semanas al mínimo de ${wage}, antes de impuestos: ${monthly} al mes.`,
    tippedDetail: (tipped: TippedState, wages: string, credit: string) =>
      tipped.credit === 0
        ? `Sin crédito por propinas, el empleador paga el mínimo completo de ${centsText(tipped.minimum)} la hora por las 30 horas, antes de propinas; las propinas van aparte.`
        : `El empleador paga ${wages} de salario en efectivo (${centsText(tipped.cash)} la hora) y puede contar hasta ${credit} de propinas para el resto; si las propinas no alcanzan, el empleador completa la diferencia.`,
    overtimeLink: 'Abre esta semana en la calculadora de horas extra',
    annualLink: 'Ábrelo en la calculadora de pago por hora a sueldo anual',
    tippedLink: 'Abre estas 30 horas en la calculadora de propinas por hora',
    dailyNote: (name: string, daily: number) =>
      `La calculadora de horas extra aplica la regla federal y la de California. Con estos días de 9 horas, la regla por día de ${name} después de ${String(daily)} horas no suma más horas extra, pero la calculadora no aplicará esa regla por día a un día más largo que anotes.`,
    outsideNote: (name: string, weekly: number) =>
      `Estas semanas siguen la regla federal de 40 horas, que cubre a la mayoría de los trabajadores en ${name}; la regla estatal de ${String(weekly)} horas solo se aplica al trabajo que la FLSA no cubre.`,
    labels: { sources: 'Fuentes', checked: 'Revisado el', table: 'La tabla completa' },
    index: 'Leyes de salario y horas en cada estado',
    disclaimer:
      'Un resumen de lo que dicen estas agencias y leyes, no asesoría legal. Las ciudades y los condados pueden fijar salarios mínimos más altos, y las exenciones o las reglas de cada industria pueden cambiar lo que te deben: consulta al departamento de trabajo de tu estado.',
  },
} as const;

const plain = ({ label, href }: GuideSource): GuideSource => ({ label, href });

const minimumSection = (facts: StateFacts, lang: Lang): StateSection => {
  const w = WORDS[lang];
  const row = facts.minimum;
  const basis = minimumWageRowsOf(lang).find(({ name }) => name === row.name[lang])?.basis;
  if (basis === undefined) throw new Error(`no minimum wage row for ${row.name.en}`);
  const sources = [plain(MINIMUM_WAGE_STATES_SOURCES[row.source])];
  if (row.scheduled !== undefined && row.scheduled.source !== row.source)
    sources.push(plain(MINIMUM_WAGE_STATES_SOURCES[row.scheduled.source]));
  return {
    id: 'minimum',
    heading: w.sections.minimum,
    facts: [
      { key: 'wage', label: w.facts.wage, value: centsText(row.wage) },
      { key: 'basis', label: w.facts.basis, value: basis },
      ...(row.scheduled === undefined
        ? []
        : [{ key: 'scheduled', label: w.facts.scheduled, value: centsText(row.scheduled.wage) }]),
    ],
    notes: [row.notes?.[lang], row.scheduled?.notes?.[lang]].filter(
      (note): note is string => note !== undefined,
    ),
    sources,
    checked: dayText(checkedOf('minimum-wage-states-guide'), lang),
    table: {
      label: MINIMUM_WAGE_STATES_GUIDE[lang].linkLabel,
      href: MINIMUM_WAGE_STATES_GUIDE_PATHS[lang],
    },
  };
};

const tippedSection = (facts: StateFacts, lang: Lang): StateSection => {
  const w = WORDS[lang];
  const row = facts.tipped;
  return {
    id: 'tipped',
    heading: w.sections.tipped,
    facts: [
      { key: 'cash', label: w.facts.cash, value: centsText(row.cash) },
      {
        key: 'credit',
        label: w.facts.credit,
        value: row.credit === 0 ? w.none : centsText(row.credit),
      },
      { key: 'minimum', label: w.facts.minimum, value: centsText(row.minimum) },
    ],
    notes: row.notes === undefined ? [] : [row.notes[lang]],
    sources: [TIPPED_STATES_SOURCES[row.source]],
    checked: dayText(checkedOf('tipped-states-guide'), lang),
    table: { label: TIPPED_STATES_GUIDE[lang].linkLabel, href: TIPPED_STATES_GUIDE_PATHS[lang] },
  };
};

const hoursText = (hours: number): string => `${String(hours)} h`;

const overtimeSection = (facts: StateFacts, lang: Lang): StateSection => {
  const w = WORDS[lang];
  const rule = facts.overtime;
  const sources: GuideSource[] = [OVERTIME_STATES_SOURCES[rule.source]];
  if (rule.notesSource !== undefined && rule.notesSource !== rule.source)
    sources.push(OVERTIME_STATES_SOURCES[rule.notesSource]);
  return {
    id: 'overtime',
    heading: w.sections.overtime,
    facts: [
      {
        key: 'daily',
        label: w.facts.daily,
        value: rule.daily === undefined ? w.no : hoursText(rule.daily),
      },
      { key: 'weekly', label: w.facts.weekly, value: hoursText(rule.weekly) },
      ...(rule.doubleTime === undefined
        ? []
        : [{ key: 'doubleTime', label: w.facts.doubleTime, value: rule.doubleTime[lang] }]),
      ...(rule.seventhDay === undefined
        ? []
        : [{ key: 'seventhDay', label: w.facts.seventhDay, value: rule.seventhDay[lang] }]),
    ],
    notes: rule.notes === undefined ? [] : [rule.notes[lang]],
    sources,
    checked: dayText(checkedOf('overtime-states-guide'), lang),
    table: {
      label: OVERTIME_STATES_GUIDE[lang].linkLabel,
      href: OVERTIME_STATES_GUIDE_PATHS[lang],
    },
  };
};

const examplesOf = (facts: StateFacts, lang: Lang): StatePage['examples'] => {
  const w = WORDS[lang];
  const rule = engineRuleOf(facts);
  const wage = facts.minimum.wage;
  const wageText = short(centsText(wage));
  const forty = weekOf(wage, rule, 8);
  const fortyFive = weekOf(wage, rule, 9);
  const long = runWeek(fortyFive);
  const converted = payConverter.run({ amount: dollarsOf(wage), per: 'hour' });
  if (!converted.ok) throw new Error(`the year at ${dollarsOf(wage)} must run`);
  const year = outputsOf(converted.value.outputs);
  const tipped = facts.tipped;
  const guaranteed = runWeek(weekOf(tipped.minimum, 'federal', 6))('pay');
  const cashWages = runWeek(weekOf(tipped.cash, 'federal', 6))('pay');
  // the state's row of the tipped table: its cash wage, full minimum and maximum tip credit
  const tippedWeek = {
    cashWage: dollarsOf(tipped.cash),
    minimumWage: dollarsOf(tipped.minimum),
    maxTipCredit: dollarsOf(tipped.credit),
    tips: '0',
    hours: '30',
  };
  const tippedHref = `${TIPPED_PATHS[lang]}?${encode(tippedWage, valid(tippedWage.validate(tippedWeek), TIPPED_PATHS[lang]))}`;
  const name = nameIn(facts, lang);
  const daily = facts.overtime.daily;
  const notes = [
    ...(daily !== undefined && rule === 'federal' ? [w.dailyNote(capital(name), daily)] : []),
    ...(outsideFlsa(facts.overtime) ? [w.outsideNote(name, facts.overtime.weekly)] : []),
  ];
  return {
    heading: w.examples,
    items: [
      {
        id: 'week40',
        label: w.week40,
        value: moneyText(runWeek(forty)('pay')),
        detail: w.week40Detail(wageText),
        href: `${OVERTIME_PATHS[lang]}?${encode(overtime, valid(overtime.validate(forty), OVERTIME_PATHS[lang]))}`,
        linkLabel: w.overtimeLink,
      },
      {
        id: 'week45',
        label: w.week45,
        value: moneyText(long('pay')),
        detail: w.week45Detail(
          wageText,
          moneyText(long('overtimeRate')),
          short(moneyText(long('overtimePay'))),
        ),
        href: `${OVERTIME_PATHS[lang]}?${encode(overtime, valid(overtime.validate(fortyFive), OVERTIME_PATHS[lang]))}`,
        linkLabel: w.overtimeLink,
      },
      {
        id: 'annual',
        label: w.annual,
        value: moneyText(year('annual')),
        detail: w.annualDetail(wageText, short(moneyText(year('monthly')))),
        href: `${PATHS.hourly[lang]}?${encode(
          payConverter,
          valid(
            payConverter.validate({
              amount: dollarsOf(wage),
              per: 'hour',
              hoursPerWeek: '40',
              weeksPerYear: '52',
            }),
            PATHS.hourly[lang],
          ),
        )}`,
        linkLabel: w.annualLink,
      },
      {
        id: 'tipped30',
        label: w.tipped30,
        value: moneyText(guaranteed),
        detail: w.tippedDetail(
          tipped,
          short(moneyText(cashWages)),
          short(moneyText(subMoney(guaranteed, cashWages))),
        ),
        href: tippedHref,
        linkLabel: w.tippedLink,
      },
    ],
    notes,
  };
};

/** The page of one state in one language. */
export const statePageOf = (facts: StateFacts, lang: Lang): StatePage => {
  const w = WORDS[lang];
  const route = STATE_ROUTES.find(({ id }) => id === `state-${facts.slug.en}`);
  if (route === undefined) throw new Error(`no route for ${facts.slug.en}`);
  const the = nameIn(facts, lang);
  const rule = facts.overtime;
  const answer = w.lead(facts, the);
  const lead = [
    answer,
    // who the state's rate covers (a region, an employer size): the notes of its row
    ...(facts.minimum.federal
      ? [w.federal(facts.minimum, the)]
      : facts.minimum.notes === undefined
        ? []
        : [facts.minimum.notes[lang]]),
    ...(outsideFlsa(rule) ? [w.outside(rule.weekly)] : []),
    ...(rule.doubleTime === undefined ? [] : [w.double(rule.doubleTime[lang])]),
    w.tipped(facts.tipped, the),
    ...(facts.minimum.scheduled === undefined ? [] : [w.scheduled(facts.minimum.scheduled.wage)]),
  ].join(' ');
  const h1 = w.title(lang === 'en' ? facts.tipped.name.en : the);
  return {
    title: titleOf(h1),
    description: descriptionOf(lead),
    kicker: w.kicker,
    h1,
    lead,
    paths: { en: route.en, es: route.es },
    sections: [
      minimumSection(facts, lang),
      tippedSection(facts, lang),
      overtimeSection(facts, lang),
    ],
    examples: examplesOf(facts, lang),
    labels: w.labels,
    index: { label: w.index, href: STATES_INDEX_PATHS[lang] },
    disclaimer: w.disclaimer,
  };
};

/** One state of the index: its page and its figures in a line. */
export interface StatesIndexItem {
  readonly name: string;
  readonly href: string;
  readonly summary: string;
}

export interface StatesIndex {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly paths: Words;
  readonly items: readonly StatesIndexItem[];
  readonly tablesHeading: string;
  /** The text of the link the footer and the data index give to this page. */
  readonly linkLabel: string;
  readonly tables: readonly { readonly label: string; readonly href: string }[];
}

const INDEX = {
  en: {
    title: 'Wage and Hour Laws by State, 2026 | Cuenta Horas',
    description:
      'The minimum wage, tipped cash wage and overtime rules of each of the 50 states and DC, one page each, with sources and worked examples of weekly pay.',
    h1: 'Wage and hour laws by state, 2026',
    lead: 'One page for each state and DC: its minimum wage, its tipped cash wage and tip credit, and when overtime is owed, each with its government source and the day we checked it, and the pay of a 40-hour and a 45-hour week at the minimum.',
    summary: (facts: StateFacts) =>
      `${centsText(facts.minimum.wage)} an hour · tipped ${centsText(facts.tipped.cash)} · overtime after ${
        facts.overtime.daily === undefined
          ? `${String(outsideFlsa(facts.overtime) ? 40 : facts.overtime.weekly)} h a week`
          : `${String(facts.overtime.daily)} h a day or ${String(facts.overtime.weekly)} h a week`
      }`,
    tablesHeading: 'The tables these pages come from',
    linkLabel: 'Laws by state',
  },
  es: {
    title: 'Leyes de salario y horas por estado, 2026 | Cuenta Horas',
    description:
      'El salario mínimo, el salario en efectivo con propinas y las horas extra de cada uno de los 50 estados y DC, una página por estado, con fuentes y ejemplos.',
    h1: 'Leyes de salario y horas por estado, 2026',
    lead: 'Una página para cada estado y DC: su salario mínimo, su salario en efectivo con propinas y crédito por propinas, y cuándo se pagan horas extra, cada uno con su fuente oficial y el día en que lo revisamos, y el pago de una semana de 40 y de 45 horas al mínimo.',
    summary: (facts: StateFacts) =>
      `${centsText(facts.minimum.wage)} la hora · con propinas ${centsText(facts.tipped.cash)} · horas extra después de ${
        facts.overtime.daily === undefined
          ? `${String(outsideFlsa(facts.overtime) ? 40 : facts.overtime.weekly)} h a la semana`
          : `${String(facts.overtime.daily)} h al día o ${String(facts.overtime.weekly)} h a la semana`
      }`,
    tablesHeading: 'Las tablas de donde salen estas páginas',
    linkLabel: 'Leyes por estado',
  },
} as const;

/** The index of the state pages in one language, sorted by the state's name in it. */
export const statesIndexOf = (lang: Lang): StatesIndex => {
  const t = INDEX[lang];
  return {
    title: t.title,
    description: t.description,
    kicker: WORDS[lang].kicker,
    h1: t.h1,
    lead: t.lead,
    paths: STATES_INDEX_PATHS,
    items: [...STATE_FACTS]
      .sort((a, b) => a.tipped.name[lang].localeCompare(b.tipped.name[lang], lang))
      .map((facts) => ({
        name: facts.tipped.name[lang],
        href: statePageOf(facts, lang).paths[lang],
        summary: t.summary(facts),
      })),
    tablesHeading: t.tablesHeading,
    linkLabel: t.linkLabel,
    tables: [
      {
        label: MINIMUM_WAGE_STATES_GUIDE[lang].linkLabel,
        href: MINIMUM_WAGE_STATES_GUIDE_PATHS[lang],
      },
      { label: TIPPED_STATES_GUIDE[lang].linkLabel, href: TIPPED_STATES_GUIDE_PATHS[lang] },
      { label: OVERTIME_STATES_GUIDE[lang].linkLabel, href: OVERTIME_STATES_GUIDE_PATHS[lang] },
    ],
  };
};
