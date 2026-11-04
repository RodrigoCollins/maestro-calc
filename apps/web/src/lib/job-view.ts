import { encode, yd3 } from '@maestro-calc/core';
import type { Locale } from '@maestro-calc/i18n';
import { createTranslator } from '@maestro-calc/i18n';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { groupedInteger, volumeText } from '../calculator/present.ts';
import { JOB_IDS, JOBS, type JobCase, type JobId } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import { concrete } from './concrete.ts';
import { siteText } from './site-text.ts';

/** One case of a job page: its sizes, the calculator link that loads it, and what the engine gives. */
export interface JobRow {
  /** The sizes of the case, language-free: `10 ft × 10 ft × 4 in`. */
  readonly label: string;
  /** The calculator page with the case in its URL state. */
  readonly href: string;
  /** Cubic yards with the default extra, as the calculator shows them. */
  readonly yards: string;
  /** Whole bags of each size of `BAGS`, in that order. */
  readonly bags: readonly string[];
}

export interface JobView {
  readonly heading: string;
  /** The names of the case's sizes, from the calculator catalog: `Length × Width × Thickness`. */
  readonly sizeLabel: string;
  readonly yardsLabel: string;
  readonly bagLabels: readonly string[];
  /** The answer of the first case: `1.36 cubic yards`. */
  readonly answer: string;
  readonly rows: readonly JobRow[];
  /** The calculator page, prefilled with the first case. */
  readonly cta: string;
  readonly calculatorName: string;
  readonly methodology: string;
  readonly others: readonly { readonly href: string; readonly title: string }[];
}

/** The bag sizes of the table, the calculator's default first. */
const BAGS = ['80', '60', '40'] as const;

/** The concrete section of the methodology page, by locale. */
export const METHODOLOGY_ANCHOR = { en: 'concrete', es: 'concreto' } as const;

const catalogs = { en: createTranslator(enConcrete), es: createTranslator(esConcrete) };

/** The validated state of a case: a case the engine rejects is a programming error. */
const stateOf = (raw: JobCase) => {
  const result = concrete.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

/** The length fields of a case, in the order the calculator declares them (`shape` is not one). */
type LengthInput = Extract<(typeof concrete.inputs)[number], { readonly kind: 'length' }>;

const isLength = (input: (typeof concrete.inputs)[number]): input is LengthInput =>
  input.kind === 'length';

const sizeKeysOf = (raw: JobCase): LengthInput['key'][] =>
  concrete.inputs
    .filter(isLength)
    .filter(({ key }) => Object.hasOwn(raw, key))
    .map(({ key }) => key);

/** `10ft` as `10 ft`: the sizes read the same in both languages. */
const sizeText = (value: string): string => value.replace(/^(\d+)(ft|in)$/, '$1 $2');

const rowOf = (raw: JobCase, locale: Locale): JobRow => {
  const state = stateOf(raw);
  const { outputs } = concrete.compute(state);
  return {
    label: sizeKeysOf(raw)
      .map((key) => sizeText(raw[key] ?? ''))
      .join(' × '),
    href: `${pathOf('concrete', locale)}?${encode(concrete, state, { unitSystem: 'imperial' })}`,
    yards: volumeText(outputs.volumeYd3, yd3),
    bags: BAGS.map((bag) => {
      const [line] = concrete.compute(stateOf({ ...raw, bag })).shopping;
      if (line === undefined) throw new Error('the concrete engine returned no bag line');
      return groupedInteger(line.qty);
    }),
  };
};

/** The page of job `id` in `locale`: every figure worked out by the concrete engine. */
export const jobView = (id: JobId, locale: Locale): JobView => {
  const text = siteText(locale);
  const calc = catalogs[locale];
  const [first, ...rest] = JOBS[id].cases;
  const rows = [rowOf(first, locale), ...rest.map((raw) => rowOf(raw, locale))] as const;
  return {
    heading: text(`page.${id}.heading`),
    sizeLabel: sizeKeysOf(first)
      .map((key) => calc(`calc.concrete.inputs.${key}`))
      .join(' × '),
    yardsLabel: calc('calc.concrete.outputs.volumeYd3'),
    bagLabels: BAGS.map((bagLb) => calc('calc.concrete.page.shoppingLine', { bagLb })),
    answer: calc('calc.concrete.page.volumeYd3', { value: rows[0].yards }),
    rows,
    cta: rows[0].href,
    calculatorName: calc('calc.concrete.title'),
    methodology: `${pathOf('methodology', locale)}#${METHODOLOGY_ANCHOR[locale]}`,
    others: JOB_IDS.filter((other) => other !== id).map((other) => ({
      href: pathOf(other, locale),
      title: text(`page.${other}.heading`),
    })),
  };
};
