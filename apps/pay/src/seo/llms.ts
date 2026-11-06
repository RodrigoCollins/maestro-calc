import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ABOUT_TEXTS } from '../about/texts.ts';
import { DEDUCTION_TEXTS } from '../deductions/texts.ts';
import { EMBED_TEXTS } from '../embed/texts.ts';
import { HOURS_WORKED_GUIDE } from '../guide/hours-worked.ts';
import { OVERTIME_GUIDES } from '../guide/overtime.ts';
import { OVERTIME_STATES_GUIDE } from '../guide/overtime-states.ts';
import { PAY_STUB_GUIDE } from '../guide/pay-stub.ts';
import { PTO_GUIDE } from '../guide/pto.ts';
import { SHIFT_GUIDE } from '../guide/shift-differential.ts';
import { GUIDE_TEXTS } from '../guide/texts.ts';
import { TIP_CREDIT_GUIDE } from '../guide/tip-credit.ts';
import { TIPPED_STATES_GUIDE } from '../guide/tipped-states.ts';
import { UNPAID_WAGES_GUIDE } from '../guide/unpaid-wages.ts';
import { DECIMAL_HOURS_TEXTS, HOURS_TEXTS } from '../hours/texts.ts';
import { METHODOLOGY_TEXTS } from '../methodology/texts.ts';
import { OVERTIME_TEXTS } from '../overtime/texts.ts';
import { PAY_CONVERTER_TEXTS } from '../pay-converter/texts.ts';
import { PTO_TEXTS } from '../pto/texts.ts';
import type { Route } from '../routes.ts';
import { SHIFT_TEXTS } from '../shift/texts.ts';
import type { Lang } from '../time-card/receipt.ts';
import { TIME_CARD_TEXTS } from '../time-card/texts.ts';
import { TIPPED_TEXTS } from '../tipped/texts.ts';

interface Head {
  readonly title: string;
  readonly description: string;
}

const both = (texts: Readonly<Record<Lang, Head>>): Readonly<Record<Lang, Head>> => texts;
const byLang = (of: (lang: Lang) => Head): Readonly<Record<Lang, Head>> => ({
  en: of('en'),
  es: of('es'),
});

/**
 * The title and description of every page `llms.txt` lists, by route id: the same texts the page
 * writes in its head, so the file never says something the page does not.
 */
export const LLMS_PAGES: Readonly<Record<string, Readonly<Record<Lang, Head>>>> = {
  'time-card': both(TIME_CARD_TEXTS),
  overtime: both(OVERTIME_TEXTS),
  hours: both(HOURS_TEXTS),
  'decimal-hours': both(DECIMAL_HOURS_TEXTS),
  'hourly-to-salary': byLang((lang) => PAY_CONVERTER_TEXTS[lang].variants.hourly),
  'salary-to-hourly': byLang((lang) => PAY_CONVERTER_TEXTS[lang].variants.salary),
  'pto-accrual': both(PTO_TEXTS),
  'shift-differential': both(SHIFT_TEXTS),
  'tipped-wage': both(TIPPED_TEXTS),
  'no-tax-on-overtime': byLang((lang) => DEDUCTION_TEXTS[lang].overtime),
  'no-tax-on-tips': byLang((lang) => DEDUCTION_TEXTS[lang].tips),
  'tax-guide': both(GUIDE_TEXTS),
  'overtime-guide': both(OVERTIME_GUIDES.federal),
  'california-overtime-guide': both(OVERTIME_GUIDES.california),
  'pay-stub-guide': both(PAY_STUB_GUIDE),
  'unpaid-wages-guide': both(UNPAID_WAGES_GUIDE),
  'pto-guide': both(PTO_GUIDE),
  'shift-differential-guide': both(SHIFT_GUIDE),
  'tip-credit-guide': both(TIP_CREDIT_GUIDE),
  'tipped-states-guide': both(TIPPED_STATES_GUIDE),
  'hours-worked-guide': both(HOURS_WORKED_GUIDE),
  'overtime-states-guide': both(OVERTIME_STATES_GUIDE),
  methodology: both(METHODOLOGY_TEXTS),
  about: both(ABOUT_TEXTS),
  embed: both(EMBED_TEXTS),
};

/** The page name without the ` | Cuenta Horas` suffix of its title. */
const nameOf = (title: string): string => title.replace(/\s*\|\s*Cuenta Horas$/, '');

const SUMMARY =
  '> Free English and Spanish calculators and guides for hourly workers in the United States: hours worked, overtime, tipped pay, PTO, shift differentials and pay conversions.';

const ABOUT_SITE =
  'Each guide cites its primary sources, such as the U.S. Department of Labor, the IRS, the eCFR and state labor departments, with the date it was checked. Spanish pages live under /es.';

/**
 * `llms.txt` (llmstxt.org): the site name, a one-line summary, then the calculators and the
 * guides of each language with their canonical URL and description, from the route table the
 * sitemap is built from. The long-tail pages and the privacy notice are left out.
 */
export const llmsTxt = (routes: readonly Route[], origin: string): string => {
  const listed = routes.filter(({ id }) => LLMS_PAGES[id] !== undefined);
  const linksOf = (lang: Lang, keep: (route: Route) => boolean): string[] =>
    listed.filter(keep).map((route) => {
      const head = LLMS_PAGES[route.id]?.[lang];
      if (head === undefined) throw new Error(`llms.txt has no texts for ${route.id}`);
      const url = canonicalUrl(route[lang], origin);
      return `- [${nameOf(head.title)}](${url}): ${head.description}`;
    });
  const calculator = (route: Route): boolean => route.kind === 'calculator';
  const guide = (route: Route): boolean => route.id.endsWith('-guide');
  const other = (route: Route): boolean => !calculator(route) && !guide(route);
  const section = (heading: string, items: readonly string[]): string[] => [
    '',
    `## ${heading}`,
    '',
    ...items,
  ];
  return [
    '# Cuenta Horas',
    '',
    SUMMARY,
    '',
    ABOUT_SITE,
    ...section('Calculators', linksOf('en', calculator)),
    ...section('Guides', linksOf('en', guide)),
    ...section('En español: calculadoras', linksOf('es', calculator)),
    ...section('En español: guías', linksOf('es', guide)),
    ...section('Optional', [...linksOf('en', other), ...linksOf('es', other)]),
    '',
  ].join('\n');
};
