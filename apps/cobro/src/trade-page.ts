import type { InputDescriptor } from '@maestro-calc/core';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { CALCULATORS } from './lib/calculators.ts';
import { defaultTextOf } from './fields.ts';
import { moneyText } from './format.ts';
import { detailsOf, type DetailTexts } from './receipt/details.ts';
import { quoteMessage, whatsappHref, type MessageLine } from './receipt/message.ts';
import { valuesOf } from './receipt/values.ts';
import { TRADE_PATHS, type Lang, type TradeId } from './routes.ts';
import { SITE } from './site.config.ts';
import { COMMON } from './texts/common.ts';
import { TRADE_TEXTS } from './texts/trades.ts';
import { OEWS } from './wages/oews-2025.ts';

/** The groups of fields, in the order of the form. */
export const GROUPS = ['job', 'labor', 'materials', 'markup'] as const;
type Group = (typeof GROUPS)[number];

const LABOR_KEYS = ['laborBy', 'hours', 'crew', 'rate', 'areaRate'];
const MATERIAL_KEYS = ['gallonPrice', 'sheetPrice', 'bagPrice', 'supplies'];
const MARKUP_KEYS = ['overhead', 'profit'];
/** The labor fields that show only for one basis of the select. */
const WHEN: Readonly<Record<string, 'hour' | 'area'>> = {
  hours: 'hour',
  crew: 'hour',
  rate: 'hour',
  areaRate: 'area',
  area: 'area',
};

const groupOf = (key: string): Group =>
  LABOR_KEYS.includes(key)
    ? 'labor'
    : MATERIAL_KEYS.includes(key)
      ? 'materials'
      : MARKUP_KEYS.includes(key)
        ? 'markup'
        : 'job';

export interface FieldView {
  readonly key: string;
  readonly group: Group;
  readonly label: string;
  readonly hint?: string;
  readonly value: string;
  readonly inputmode: 'decimal' | 'numeric';
  readonly options?: readonly (readonly [string, string])[];
  readonly when?: 'hour' | 'area';
}

export interface LineView {
  readonly id: 'labor' | 'materials' | 'subtotal' | 'overhead' | 'profit';
  readonly name: string;
  readonly detail?: string;
  readonly amount: string;
  readonly hideZero: boolean;
  readonly hidden: boolean;
}

export interface TradeView {
  readonly id: TradeId;
  readonly lang: Lang;
  readonly path: string;
  readonly calculatorId: string;
  readonly fields: readonly FieldView[];
  readonly groups: readonly {
    readonly id: Group;
    readonly title: string;
    readonly fields: readonly FieldView[];
  }[];
  readonly lines: readonly LineView[];
  readonly total: string;
  readonly receiptTitle: string;
  readonly detailTexts: DetailTexts;
  readonly shareHref: string;
  readonly national: { readonly mean: string; readonly median: string } | undefined;
}

const dollars = (value: number): string =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Everything the quote page of `trade` in `lang` renders, from the engine at its defaults. */
export const tradeViewOf = (trade: TradeId, lang: Lang): TradeView => {
  const calculator = CALCULATORS[trade];
  const common = COMMON[lang];
  const text = TRADE_TEXTS[lang][trade];
  const state = calculator.validate({});
  const ran = calculator.run({});
  if (!state.ok || !ran.ok) throw new Error(`${calculator.id} must run at its defaults`);
  const out: Readonly<Record<string, unknown>> = Object.fromEntries(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  const money = (key: string): string => moneyText(out[key] as Parameters<typeof moneyText>[0]);

  const fields = calculator.inputs.map((input: InputDescriptor): FieldView => {
    const shared = common.fields[input.key];
    const label = text.fields[input.key] ?? shared?.label;
    if (label === undefined) throw new Error(`no label for ${input.key}`);
    const options =
      input.key === 'laborBy'
        ? Object.entries(common.laborByOptions)
        : text.options[input.key] === undefined
          ? undefined
          : Object.entries(text.options[input.key] ?? {});
    const when = WHEN[input.key];
    return {
      key: input.key,
      group: groupOf(input.key),
      label,
      ...(shared?.hint === undefined ? {} : { hint: shared.hint }),
      value: defaultTextOf(input),
      inputmode: input.kind === 'count' ? 'numeric' : 'decimal',
      ...(options === undefined ? {} : { options }),
      ...(when === undefined ? {} : { when }),
    };
  });

  const detailTexts: DetailTexts = {
    ...common.receipt.detail,
    one: text.unitOne,
    many: text.unitMany,
  };
  const details = detailsOf(detailTexts, valuesOf(state.value, out));
  const hasQuantity = text.unitOne !== '';
  const lines: LineView[] = [
    {
      id: 'labor',
      name: common.receipt.labor,
      detail: details.labor,
      amount: money('labor'),
      hideZero: false,
      hidden: false,
    },
    {
      id: 'materials',
      name: text.materials,
      ...(hasQuantity ? { detail: details.materials } : {}),
      amount: money('materials'),
      hideZero: true,
      hidden: false,
    },
    {
      id: 'subtotal',
      name: common.receipt.subtotal,
      amount: money('subtotal'),
      hideZero: false,
      hidden: false,
    },
    {
      id: 'overhead',
      name: details.overhead,
      amount: money('overhead'),
      hideZero: true,
      hidden: false,
    },
    {
      id: 'profit',
      name: details.profit,
      amount: money('profit'),
      hideZero: true,
      hidden: false,
    },
  ];

  const path = TRADE_PATHS[trade][lang];
  const receiptTitle = `${common.receipt.title} · ${text.name}`;
  const messageLines: MessageLine[] = lines.map((line) => ({
    label: line.name,
    detail: line.detail ?? '',
    amount: line.amount,
  }));
  const shareHref = whatsappHref(
    quoteMessage(
      receiptTitle,
      messageLines,
      { label: common.receipt.total, detail: '', amount: money('total') },
      canonicalUrl(path, SITE.origin),
    ),
  );

  const us = OEWS[trade]?.['US'];
  return {
    id: trade,
    lang,
    path,
    calculatorId: calculator.id,
    fields,
    groups: GROUPS.map((id) => ({
      id,
      title: common.groups[id],
      fields: fields.filter(({ group }) => group === id),
    })).filter(({ fields: members }) => members.length > 0),
    lines,
    total: money('total'),
    receiptTitle,
    detailTexts,
    shareHref,
    national: us === undefined ? undefined : { mean: dollars(us[0]), median: dollars(us[1]) },
  };
};
