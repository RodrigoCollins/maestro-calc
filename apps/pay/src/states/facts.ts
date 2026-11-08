import { Rational, type Money } from '@maestro-calc/core';
import { overtime, RULES, type Rule } from '@maestro-calc/pay-core/overtime';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { MINIMUM_WAGE_STATES, type MinimumWageState } from '../guide/minimum-wage-states.ts';
import { OVERTIME_STATES, type OvertimeState } from '../guide/overtime-states.ts';
import { TIPPED_STATES, type TippedState } from '../guide/tipped-states.ts';
import type { Lang } from '../time-card/receipt.ts';
import { STATE_SLUGS } from './routes.ts';

/*
 * The three state tables (`../guide/*-states.ts`) joined by state, and the engine runs a state
 * page computes from them: the state page (`./pages.ts`) and its comparisons (`./context.ts`)
 * share these, so a figure on either is the table's or an engine's.
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

/** The facts of the state named `name` in English. */
export const factsOf = (name: string): StateFacts => {
  const found = STATE_FACTS.find(({ tipped }) => tipped.name.en === name);
  if (found === undefined) throw new Error(`no state ${name}`);
  return found;
};

export const dollarsOf = (cents: number): string => (cents / 100).toFixed(2);
/** `$676.00` stays whole in a figure; `$676` reads better in a sentence. */
export const short = (text: string): string => text.replace(/\.00$/, '');

/** The states whose daily rule the engine counts by a rule of its own, named by the state. */
const DAILY_RULES: readonly string[] = RULES.filter((rule) => rule !== 'federal');

/**
 * The overtime engine's rule for the state: its own rule where the overtime table gives it a
 * daily threshold (the build stops on a daily state the engine has no rule for), the FLSA
 * elsewhere.
 */
export const engineRuleOf = (facts: StateFacts): Rule => {
  if (facts.overtime.daily === undefined) return 'federal';
  const rule = RULES.find((each) => each === facts.slug.en);
  if (rule === undefined || !DAILY_RULES.includes(rule))
    throw new Error(`no overtime rule for ${facts.slug.en}`);
  return rule;
};

/**
 * A week of `days` days of `day` hours each from Monday at `cents` an hour, as the overtime engine
 * takes it (five days unless `days` says otherwise).
 */
export const weekOf = (cents: number, rule: Rule, day: number, days = 5) => {
  const hours = (at: number): string => (at < days ? String(day) : '0');
  return {
    rate: dollarsOf(cents),
    rule,
    mon: hours(0),
    tue: hours(1),
    wed: hours(2),
    thu: hours(3),
    fri: hours(4),
    sat: '0',
    sun: '0',
  };
};

/** The money outputs of an engine run, by key. */
export type Outputs = (key: string) => Money;

export const outputsOf = (outputs: readonly { key: string; value: unknown }[]): Outputs => {
  const map = new Map(outputs.map(({ key, value }) => [key, value]));
  return (key) => {
    const value = map.get(key);
    if (typeof value !== 'object' || value === null || !('currency' in value))
      throw new Error(`no money output ${key}`);
    return value as Money;
  };
};

export const runWeek = (week: ReturnType<typeof weekOf>): Outputs => {
  const ran = overtime.run(week);
  if (!ran.ok) throw new Error(`the week at ${week.rate} must run`);
  return outputsOf(ran.value.outputs);
};

/** The overtime hours of a week, from the overtime engine. */
export const overtimeHoursOf = (week: ReturnType<typeof weekOf>): Rational => {
  const ran = overtime.run(week);
  if (!ran.ok) throw new Error(`the week at ${week.rate} must run`);
  const hours = ran.value.outputs.find(({ key }) => key === 'overtimeHours')?.value;
  if (!(hours instanceof Rational)) throw new Error('no overtime hours');
  return hours;
};

/** Full time at `cents` an hour, 40 hours a week for 52 weeks, from the hourly to salary engine. */
export const yearOf = (cents: number): Outputs => {
  const ran = payConverter.run({ amount: dollarsOf(cents), per: 'hour' });
  if (!ran.ok) throw new Error(`the year at ${dollarsOf(cents)} must run`);
  return outputsOf(ran.value.outputs);
};

/** A validated state of a calculator, which its link encodes; an invalid one stops the build. */
export const valid = <T>(result: { ok: true; value: T } | { ok: false }, path: string): T => {
  if (!result.ok) throw new Error(`the link to ${path} must validate`);
  return result.value;
};

/** The state's name in a sentence: DC takes its article. */
export const nameIn = (facts: StateFacts, lang: Lang): string => {
  const name = facts.tipped.name[lang];
  if (facts.slug.en !== 'district-of-columbia') return name;
  return lang === 'en' ? `the ${name}` : `el ${name}`;
};

/** Whether the state's own weekly threshold is above 40 and applies only outside the FLSA. */
export const outsideFlsa = (rule: OvertimeState): boolean => rule.weekly > 40;
