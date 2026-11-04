import type { Money, Rational } from '@maestro-calc/core';
import type { timeCard } from '@maestro-calc/pay-core/time-card';
import { hoursText, moneyText } from '../format.ts';

type Result = Extract<ReturnType<typeof timeCard.run>, { ok: true }>['value'];
export type Lang = 'en' | 'es';

/** The value type of each output, by key. */
type Outputs = { [O in Result['outputs'][number] as O['key']]: O['value'] };

/** The value of one output of a run, by key. */
export const outputOf = <K extends keyof Outputs>(result: Result, key: K): Outputs[K] => {
  const found = result.outputs.find((output) => output.key === key);
  if (found === undefined) throw new TypeError(`no output ${key}`);
  return found.value as Outputs[K];
};

const WORDS = {
  en: { lead: 'My hours this week', overtime: 'overtime', double: 'double time' },
  es: { lead: 'Mis horas de la semana', overtime: 'extra', double: 'doble' },
} as const;

/** The message the receipt button sends: hours, pay, the extra hours, then the link. */
export const receiptMessage = (result: Result, lang: Lang, url: string): string => {
  const words = WORDS[lang];
  const hours = (value: Rational): string => `${hoursText(value)} h`;
  const extra = [
    [outputOf(result, 'overtimeHours'), words.overtime],
    [outputOf(result, 'doubleHours'), words.double],
  ] as const;
  const parts = extra
    .filter(([value]) => !value.isZero())
    .map(([value, word]) => `${hours(value)} ${word}`);
  const pay: Money = outputOf(result, 'pay');
  const detail = parts.length === 0 ? '' : ` (${parts.join(', ')})`;
  return `${words.lead}: ${hours(outputOf(result, 'totalHours'))}, ${moneyText(pay)}${detail}.\n${url}`;
};

/** A WhatsApp link that opens the chat picker with the message filled in. */
export const whatsappHref = (message: string): string =>
  `https://wa.me/?text=${encodeURIComponent(message)}`;

/**
 * The address a receipt shares: the current one with the path of the page's canonical. A page's
 * canonical is its own path; an embed's is the full page, so a receipt sent from another site's
 * frame opens the real page, on the origin that served the frame.
 */
export const sharedUrlOf = (canonical: string | null, href: string): string => {
  if (canonical === null || !URL.canParse(canonical)) return href;
  const url = new URL(href);
  url.pathname = new URL(canonical).pathname;
  return url.href;
};
