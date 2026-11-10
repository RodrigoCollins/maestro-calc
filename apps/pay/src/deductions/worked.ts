import type { Money } from '@maestro-calc/core';
import { noTaxOnOvertime } from '@maestro-calc/pay-core/no-tax-on-overtime';
import { noTaxOnTips } from '@maestro-calc/pay-core/no-tax-on-tips';
import { moneyText } from '../format.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { Deduction } from './texts.ts';

/*
 * How a no-tax page works its deduction out (Schedule 1-A, Parts II and III): the engine at the
 * page's starting inputs, then past the income limit and at the cap, so each figure of the text is
 * one the calculator gives for those inputs.
 */

export interface WorkedSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

type Outputs = (key: string) => string;

type Ran =
  | {
      readonly ok: true;
      readonly value: { readonly outputs: readonly { key: string; value: unknown }[] };
    }
  | { readonly ok: false };

const outputsOf = (ran: Ran, what: string): Outputs => {
  if (!ran.ok) throw new Error(`the ${what} deduction must run`);
  const outputs = new Map(ran.value.outputs.map(({ key, value }) => [key, value as Money]));
  return (key) => {
    const value = outputs.get(key);
    if (value === undefined) throw new Error(`no output ${key}`);
    return moneyText(value);
  };
};

const overtimeOf = (input: Record<string, string>): Outputs =>
  outputsOf(noTaxOnOvertime.run(input), 'overtime');
const tipsOf = (input: Record<string, string>): Outputs =>
  outputsOf(noTaxOnTips.run(input), 'tips');

const HEADING: Readonly<Record<Lang, string>> = {
  en: 'How the figures are worked out',
  es: 'Cómo se calculan las cifras',
};

const overtimeText = (lang: Lang): readonly string[] => {
  const start = overtimeOf({});
  const limit = overtimeOf({ magi: '165500', bracket: '24' });
  const big = overtimeOf({ rate: '40', overtimeHours: '700' });
  const joint = overtimeOf({ rate: '40', overtimeHours: '700', filing: 'joint' });
  // the half of time and a half, an hour: the premium of one overtime hour
  const half = overtimeOf({ overtimeHours: '1' })('premium');
  const bigHalf = overtimeOf({ rate: '40', overtimeHours: '1' })('premium');
  const premium = start('premium');
  return lang === 'en'
    ? [
        `The calculator starts at 300 overtime hours at $22.00. Only the half of time and a half counts, ${half} an hour: ${half} × 300 = ${premium}. With a MAGI of $60,000 on a single return nothing is lost to the limit, and in the 12% bracket the deduction saves about ${start('savings')}.`,
        `Past the income limit it shrinks: a MAGI of $165,500 is $15,500 over $150,000, so 15 full $1,000s take ${limit('reduction')} off and ${limit('deduction')} is left, about ${limit('savings')} in the 24% bracket.`,
        `At the cap: 700 overtime hours at $40.00 make ${bigHalf} × 700 = ${big('premium')} of qualified overtime, capped at ${big('deduction')} on a single return; a joint return, capped at $25,000, keeps all ${joint('deduction')}.`,
      ]
    : [
        `La calculadora empieza con 300 horas extra a $22.00. Solo cuenta la mitad del tiempo y medio, ${half} la hora: ${half} × 300 = ${premium}. Con un MAGI de $60,000 en una declaración individual no se pierde nada por el límite, y en la tasa del 12% la deducción ahorra unos ${start('savings')}.`,
        `Pasado el límite de ingresos se reduce: un MAGI de $165,500 pasa $150,000 por $15,500, así que 15 tramos completos de $1,000 restan ${limit('reduction')} y quedan ${limit('deduction')}, unos ${limit('savings')} de ahorro en la tasa del 24%.`,
        `En el tope: 700 horas extra a $40.00 dan ${bigHalf} × 700 = ${big('premium')} de horas extra calificadas, con tope de ${big('deduction')} en una declaración individual; una declaración conjunta, con tope de $25,000, conserva los ${joint('deduction')}.`,
      ];
};

const tipsText = (lang: Lang): readonly string[] => {
  const start = tipsOf({});
  const limit = tipsOf({ magi: '172300', bracket: '24' });
  const big = tipsOf({ tips: '30000' });
  const joint = tipsOf({ tips: '30000', filing: 'joint' });
  return lang === 'en'
    ? [
        `The calculator starts at ${start('deduction')} of qualified tips on a single return with a MAGI of $45,000, under the $150,000 where the limit begins: all of it is deducted, and in the 12% bracket that saves about ${start('savings')}.`,
        `Past the income limit it shrinks: a MAGI of $172,300 is $22,300 over $150,000, so 22 full $1,000s take ${limit('reduction')} off and ${limit('deduction')} is left, about ${limit('savings')} in the 24% bracket.`,
        `At the cap: $30,000 of tips deduct ${big('deduction')}, and a joint return deducts the same ${joint('deduction')}, since the tips cap does not double for a couple.`,
      ]
    : [
        `La calculadora empieza con ${start('deduction')} de propinas calificadas en una declaración individual con un MAGI de $45,000, por debajo de los $150,000 donde empieza el límite: se deduce todo, y en la tasa del 12% eso ahorra unos ${start('savings')}.`,
        `Pasado el límite de ingresos se reduce: un MAGI de $172,300 pasa $150,000 por $22,300, así que 22 tramos completos de $1,000 restan ${limit('reduction')} y quedan ${limit('deduction')}, unos ${limit('savings')} de ahorro en la tasa del 24%.`,
        `En el tope: $30,000 de propinas deducen ${big('deduction')}, y una declaración conjunta deduce los mismos ${joint('deduction')}, porque el tope de las propinas no se duplica para una pareja.`,
      ];
};

/** The worked section of one no-tax page. */
export const workedOf = (deduction: Deduction, lang: Lang): WorkedSection => ({
  heading: HEADING[lang],
  paragraphs: deduction === 'overtime' ? overtimeText(lang) : tipsText(lang),
});
