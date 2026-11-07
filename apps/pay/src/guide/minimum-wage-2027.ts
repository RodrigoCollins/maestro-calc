import { subMoney, type Money } from '@maestro-calc/core';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { moneyText } from '../format.ts';
import { PATHS } from '../pay-converter/texts.ts';
import { SITE } from '../site.config.ts';
import { statePathOf } from '../states/routes.ts';
import type { Lang } from '../time-card/receipt.ts';
import {
  MINIMUM_WAGE_STATES,
  MINIMUM_WAGE_STATES_SOURCES,
  type MinimumWageState,
  UNCHANGED_2027,
  UNCONFIRMED_2027,
} from './minimum-wage-states.ts';
import { MINIMUM_WAGE_2027_GUIDE_PATHS, MINIMUM_WAGE_STATES_GUIDE_PATHS } from './paths.ts';
import type { GuideSection, GuideSource } from './texts.ts';
import { centsText } from './tipped-states.ts';

export { MINIMUM_WAGE_2027_GUIDE_PATHS } from './paths.ts';

/*
 * The minimum wage increases of January 1, 2027 (`/guides/minimum-wage-increases-2027`): every
 * state of the minimum wage table (`./minimum-wage-states.ts`, the one copy of the rates) with a
 * scheduled rate, the raise in dollars and percent, and what it adds to a year of full time, which
 * the hourly to salary engine computes at build time. Nothing here is typed by hand but the words.
 */

/** A full-time year: the hourly to salary calculator's defaults, 40 hours a week for 52 weeks. */
const annualOf = (cents: number): Money => {
  const ran = payConverter.run({ amount: (cents / 100).toFixed(2), per: 'hour' });
  if (!ran.ok) throw new Error(`the year at ${String(cents)} cents must run`);
  const annual = ran.value.outputs.find(({ key }) => key === 'annual')?.value;
  if (annual === undefined) throw new Error('no annual output');
  return annual;
};

/** One state's raise on January 1, 2027, in cents an hour. */
export interface Increase2027 {
  readonly state: MinimumWageState;
  readonly current: number;
  readonly next: number;
  /** The raise over a full-time year, from the engine. */
  readonly annual: Money;
}

/** Every state with a scheduled rate, highest new rate first, then by name. */
export const INCREASES_2027: readonly Increase2027[] = MINIMUM_WAGE_STATES.flatMap((state) =>
  state.scheduled === undefined
    ? []
    : [
        {
          state,
          current: state.wage,
          next: state.scheduled.wage,
          annual: subMoney(annualOf(state.scheduled.wage), annualOf(state.wage)),
        },
      ],
).sort((a, b) => b.next - a.next || a.state.name.en.localeCompare(b.state.name.en, 'en'));

/** The raise as a share of the current rate, to one decimal: `3.5%`. */
const percentText = (current: number, next: number): string =>
  `${(Math.round(((next - current) * 1000) / current) / 10).toFixed(1)}%`;

type ShortSource = (typeof MINIMUM_WAGE_STATES_SOURCES)[keyof typeof MINIMUM_WAGE_STATES_SOURCES];

/** One row of the table in a language. */
export interface IncreaseRow {
  readonly name: string;
  readonly href: string;
  readonly current: string;
  readonly next: string;
  readonly increase: string;
  readonly percent: string;
  readonly annual: string;
  readonly source: ShortSource;
  readonly notes: string | undefined;
}

export const increasesOf = (lang: Lang): readonly IncreaseRow[] =>
  INCREASES_2027.map(({ state, current, next, annual }) => ({
    name: state.name[lang],
    href: statePathOf(state.name[lang], lang),
    current: centsText(current),
    next: centsText(next),
    increase: centsText(next - current),
    percent: percentText(current, next),
    annual: moneyText(annual),
    source: MINIMUM_WAGE_STATES_SOURCES[state.scheduled?.source ?? state.source],
    notes: state.scheduled?.notes?.[lang],
  }));

/** The line a state page gives this page: its new rate, or nothing where no rise is scheduled. */
export const riseOf = (
  name: string,
  lang: Lang,
): { readonly label: string; readonly href: string } | undefined => {
  const found = INCREASES_2027.find(({ state }) => state.name.en === name);
  if (found === undefined) return undefined;
  const rate = centsText(found.next);
  return {
    label:
      lang === 'en'
        ? `Rises to ${rate} on January 1, 2027`
        : `Sube a ${rate} el 1 de enero de 2027`,
    href: MINIMUM_WAGE_2027_GUIDE_PATHS[lang],
  };
};

/** The sources of the page: the DOL table first, then every source a row or New York cites. */
export const MINIMUM_WAGE_2027_SOURCES: Readonly<Record<string, ShortSource>> = Object.fromEntries(
  [
    'dol' as const,
    ...INCREASES_2027.map(({ state }) => state.scheduled?.source ?? state.source),
    ...UNCHANGED_2027.map(({ source }) => source),
  ].map((key) => [key, MINIMUM_WAGE_STATES_SOURCES[key]]),
);

const nameOf = (state: string, lang: Lang): string => {
  const row = MINIMUM_WAGE_STATES.find(({ name }) => name.en === state);
  if (row === undefined) throw new Error(`no row for ${state}`);
  return row.name[lang];
};

const first = INCREASES_2027[0];
const largest = INCREASES_2027.reduce<Increase2027 | undefined>(
  (top, row) => (top === undefined || row.next - row.current > top.next - top.current ? row : top),
  undefined,
);
if (first === undefined || largest === undefined) throw new Error('no increase scheduled for 2027');
const count = String(INCREASES_2027.length);
const nyWage = MINIMUM_WAGE_STATES.find(({ name }) => name.en === 'New York')?.wage ?? 0;
const raise = (row: Increase2027): string => centsText(row.next - row.current);

export interface MinimumWage2027Texts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly asOf: string;
  readonly table: {
    readonly caption: string;
    readonly state: string;
    readonly current: string;
    readonly next: string;
    readonly increase: string;
    readonly percent: string;
    readonly annual: string;
    readonly source: string;
  };
  readonly unchanged: {
    readonly heading: string;
    readonly items: readonly { readonly text: string; readonly source: ShortSource }[];
  };
  readonly unconfirmed: {
    readonly heading: string;
    readonly intro: string;
    readonly check: string;
    readonly items: readonly {
      readonly name: string;
      readonly reason: string;
      readonly label: string;
      readonly href: string;
    }[];
  };
  readonly sections: readonly GuideSection[];
  readonly cite: { readonly heading: string; readonly text: string };
  readonly sourcesLabel: string;
  readonly disclaimer: string;
  readonly ctas: readonly { readonly label: string; readonly href: string }[];
  readonly linkLabel: string;
}

const url = (lang: Lang): string => `${SITE.origin}${MINIMUM_WAGE_2027_GUIDE_PATHS[lang]}`;
const DOL: GuideSource = {
  label: MINIMUM_WAGE_STATES_SOURCES.dol.label,
  href: MINIMUM_WAGE_STATES_SOURCES.dol.href,
};

const unconfirmedOf = (lang: Lang): MinimumWage2027Texts['unconfirmed']['items'] =>
  UNCONFIRMED_2027.map(({ state, law, unread, check }) => ({
    name: nameOf(state, lang),
    reason: `${law[lang]} ${unread[lang]}`,
    label: check.label,
    href: check.href,
  }));

export const MINIMUM_WAGE_2027_GUIDE: Readonly<Record<Lang, MinimumWage2027Texts>> = {
  en: {
    title: 'Minimum Wage Increases on January 1, 2027 | Cuenta Horas',
    description:
      'The states that raise the minimum wage on January 1, 2027: the new rate, the raise in dollars and percent, and what it adds to a full-time year, with sources.',
    kicker: 'Hourly pay · data',
    h1: 'Minimum wage increases on January 1, 2027',
    lead: `${count} states raise their minimum wage on January 1, 2027, at rates their governments or the Department of Labor have published; the highest is ${centsText(first.next)} in ${first.state.name.en}, and the largest raise is ${raise(largest)} an hour in ${largest.state.name.en}. Each row gives the raise in dollars and percent and what it adds to a full-time year.`,
    asOf: 'Each new rate is the one the state’s own agency publishes, or the U.S. Department of Labor table “State Minimum Wage Laws” for Michigan; the current rate is the one of our minimum wage by state table. A full-time year is 2,080 hours, 40 a week for 52 weeks, before taxes. City and county minimum wages are not included. Checked November 6, 2026.',
    table: {
      caption: 'Minimum wage increases on January 1, 2027, per hour, by new rate',
      state: 'State',
      current: 'Now',
      next: 'January 1, 2027',
      increase: 'Raise',
      percent: 'Raise, %',
      annual: 'Full-time year',
      source: 'Source',
    },
    unchanged: {
      heading: 'Indexed, but not rising',
      items: UNCHANGED_2027.map(({ state, source }) => ({
        text: `${nameOf(state, 'en')}: the state Department of Labor says the minimum wage stays the same on January 1, 2027 (${centsText(nyWage)} in New York City, Long Island and Westchester; $16.00 in the rest of the state), because a condition of the law that pauses the inflation increase was met.`,
        source: MINIMUM_WAGE_STATES_SOURCES[source],
      })),
    },
    unconfirmed: {
      heading: 'Not yet confirmed',
      intro:
        'Under the law each item names, these states change their minimum wage on January 1, 2027, but we could not read the 2027 rate from a primary source. They are not in the table until we can; check the agency named.',
      check: 'Check',
      items: unconfirmedOf('en'),
    },
    sections: [
      {
        id: 'how-computed',
        heading: 'How the figures are computed',
        paragraphs: [
          'The raise is the new rate minus the current one, and the percent is that raise divided by the current rate, to one decimal. The full-time year is what the hourly to salary calculator gives for the new rate minus what it gives for the current one, at 40 hours a week for 52 weeks.',
          'A rate under January 1, 2027 is scheduled, not yet in force. Some states set other rates by region, employer size or age: the notes give the ones the source names.',
        ],
        sources: [DOL],
      },
    ],
    cite: {
      heading: 'Cite this table',
      text: `Cuenta Horas, “Minimum wage increases on January 1, 2027”, ${url('en')} (data: state labor agencies and the U.S. Department of Labor, checked November 6, 2026).`,
    },
    sourcesLabel: 'Sources',
    disclaimer:
      'A summary of what these agencies publish, not legal advice. Check your state’s labor department and your city.',
    ctas: [
      { label: 'Turn an hourly wage into a salary', href: PATHS.hourly.en },
      { label: 'Minimum wage by state, 2026', href: MINIMUM_WAGE_STATES_GUIDE_PATHS.en },
    ],
    linkLabel: 'Minimum wage increases on January 1, 2027',
  },
  es: {
    title: 'Aumentos del salario mínimo el 1 de enero de 2027 | Cuenta Horas',
    description:
      'Los estados que suben el salario mínimo el 1 de enero de 2027: la nueva tarifa, el aumento en dólares y en porcentaje, y lo que suma en un año, con fuentes.',
    kicker: 'Pago por hora · datos',
    h1: 'Aumentos del salario mínimo el 1 de enero de 2027',
    lead: `${count} estados suben su salario mínimo el 1 de enero de 2027, con tarifas que publicaron sus gobiernos o el Departamento de Trabajo; la más alta es ${centsText(first.next)} en ${first.state.name.es}, y el mayor aumento es ${raise(largest)} la hora en ${largest.state.name.es}. Cada fila da el aumento en dólares y en porcentaje y lo que suma en un año de tiempo completo.`,
    asOf: 'Cada nueva tarifa es la que publica la agencia del propio estado, o la tabla del Departamento de Trabajo de EE. UU. “State Minimum Wage Laws” para Míchigan; la tarifa actual es la de nuestra tabla de salario mínimo por estado. Un año de tiempo completo son 2,080 horas, 40 a la semana durante 52 semanas, antes de impuestos. No incluye los salarios mínimos de ciudades y condados. Revisado el 6 de noviembre de 2026.',
    table: {
      caption: 'Aumentos del salario mínimo el 1 de enero de 2027, por hora, según la nueva tarifa',
      state: 'Estado',
      current: 'Ahora',
      next: '1 de enero de 2027',
      increase: 'Aumento',
      percent: 'Aumento, %',
      annual: 'Año completo',
      source: 'Fuente',
    },
    unchanged: {
      heading: 'Se ajusta por inflación, pero no sube',
      items: UNCHANGED_2027.map(({ state, source }) => ({
        text: `${nameOf(state, 'es')}: el Departamento de Trabajo del estado dice que el salario mínimo no cambia el 1 de enero de 2027 (${centsText(nyWage)} en la ciudad de Nueva York, Long Island y Westchester; $16.00 en el resto del estado), porque se cumplió una condición de la ley que pausa el aumento por inflación.`,
        source: MINIMUM_WAGE_STATES_SOURCES[source],
      })),
    },
    unconfirmed: {
      heading: 'Todavía sin confirmar',
      intro:
        'Según la ley que nombra cada punto, estos estados cambian su salario mínimo el 1 de enero de 2027, pero no pudimos leer la tarifa de 2027 en una fuente oficial. No están en la tabla hasta que podamos leerla; consulta a la agencia indicada.',
      check: 'Consulta',
      items: unconfirmedOf('es'),
    },
    sections: [
      {
        id: 'como-se-calcula',
        heading: 'Cómo se calculan las cifras',
        paragraphs: [
          'El aumento es la nueva tarifa menos la actual, y el porcentaje es ese aumento dividido entre la tarifa actual, con un decimal. El año de tiempo completo es lo que da la calculadora de pago por hora a sueldo anual con la nueva tarifa menos lo que da con la actual, a 40 horas a la semana durante 52 semanas.',
          'Una tarifa del 1 de enero de 2027 está programada, todavía no rige. Algunos estados fijan otras tarifas por región, tamaño del empleador o edad: las notas dan las que nombra la fuente.',
        ],
        sources: [DOL],
      },
    ],
    cite: {
      heading: 'Cita esta tabla',
      text: `Cuenta Horas, “Aumentos del salario mínimo el 1 de enero de 2027”, ${url('es')} (datos: agencias de trabajo de los estados y Departamento de Trabajo de EE. UU., revisado el 6 de noviembre de 2026).`,
    },
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Un resumen de lo que publican estas agencias, no asesoría legal. Consulta al departamento de trabajo de tu estado y a tu ciudad.',
    ctas: [
      { label: 'Convierte tu pago por hora en sueldo anual', href: PATHS.hourly.es },
      { label: 'Salario mínimo por estado, 2026', href: MINIMUM_WAGE_STATES_GUIDE_PATHS.es },
    ],
    linkLabel: 'Aumentos del salario mínimo el 1 de enero de 2027',
  },
};
