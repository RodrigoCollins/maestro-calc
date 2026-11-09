import { embedPathOf, embedSnippetOf } from '@maestro-calc/site-kit/embed';
import { DEDUCTION_TEXTS } from '../deductions/texts.ts';
import { DECIMAL_HOURS_TEXTS, HOURS_TEXTS } from '../hours/texts.ts';
import { converterOf } from '../military/converter.ts';
import { OVERTIME_TEXTS } from '../overtime/texts.ts';
import { PAY_CONVERTER_TEXTS } from '../pay-converter/texts.ts';
import { PTO_TEXTS } from '../pto/texts.ts';
import { isPaired, ROUTES } from '../routes.ts';
import { SHIFT_TEXTS } from '../shift/texts.ts';
import { TIPPED_TEXTS } from '../tipped/texts.ts';
import { SITE } from '../site.config.ts';
import type { Lang } from '../time-card/receipt.ts';
import { TIME_CARD_TEXTS } from '../time-card/texts.ts';
import { EMBED_TEXTS } from './texts.ts';

/*
 * The embeds of Cuenta Horas (plans/growth/PLAN.md › lever 2), as Maestro Calc's `/embed`: every
 * calculator page in both languages at `/embed` + its path, a page other sites may frame. They are
 * not routes: the route table and the sitemap never list them.
 */

/** Each calculator's name (its page heading) and the height of its frame, by route id. */
const CALCULATORS: Readonly<
  Record<string, { readonly name: (lang: Lang) => string; readonly height: number }>
> = {
  'time-card': { name: (lang) => TIME_CARD_TEXTS[lang].h1, height: 1500 },
  overtime: { name: (lang) => OVERTIME_TEXTS[lang].h1, height: 1200 },
  hours: { name: (lang) => HOURS_TEXTS[lang].h1, height: 1000 },
  'decimal-hours': { name: (lang) => DECIMAL_HOURS_TEXTS[lang].h1, height: 1900 },
  'hourly-to-salary': {
    name: (lang) => PAY_CONVERTER_TEXTS[lang].variants.hourly.h1,
    height: 1100,
  },
  'salary-to-hourly': {
    name: (lang) => PAY_CONVERTER_TEXTS[lang].variants.salary.h1,
    height: 1100,
  },
  'pto-accrual': { name: (lang) => PTO_TEXTS[lang].h1, height: 1100 },
  'shift-differential': { name: (lang) => SHIFT_TEXTS[lang].h1, height: 1300 },
  'tipped-wage': { name: (lang) => TIPPED_TEXTS[lang].h1, height: 1300 },
  'no-tax-on-overtime': { name: (lang) => DEDUCTION_TEXTS[lang].overtime.h1, height: 1200 },
  'no-tax-on-tips': { name: (lang) => DEDUCTION_TEXTS[lang].tips.h1, height: 1200 },
  'military-time-converter': { name: (lang) => converterOf(lang).h1, height: 900 },
};

export interface Embed {
  readonly id: string;
  readonly lang: Lang;
  /** Where the embed is served. */
  readonly path: string;
  /** The full page it embeds: its canonical. */
  readonly page: string;
  /** The same calculator's embed in the other language: the target of its language switch. */
  readonly other: string;
  readonly name: string;
  readonly height: number;
}

const OTHER: Readonly<Record<Lang, Lang>> = { en: 'es', es: 'en' };

export const EMBEDS: readonly Embed[] = ROUTES.filter(isPaired)
  .filter(({ kind }) => kind === 'calculator')
  .flatMap((route) => {
    const calculator = CALCULATORS[route.id];
    if (calculator === undefined) throw new Error(`no embed for the calculator ${route.id}`);
    return (['en', 'es'] as const).map((lang) => ({
      id: route.id,
      lang,
      path: embedPathOf(route[lang]),
      page: route[lang],
      other: embedPathOf(route[OTHER[lang]]),
      name: calculator.name(lang),
      height: calculator.height,
    }));
  });

export interface Snippet {
  readonly id: string;
  readonly name: string;
  readonly code: string;
}

/** Every calculator's snippet in `lang`, in the order of the route table. */
export const snippetsFor = (lang: Lang): Snippet[] =>
  EMBEDS.filter((embed) => embed.lang === lang).map(({ id, name, page, height }) => ({
    id,
    name,
    code: embedSnippetOf({
      origin: SITE.origin,
      page,
      name,
      credit: `${name} ${EMBED_TEXTS[lang].by} ${SITE.name}`,
      height,
    }),
  }));
