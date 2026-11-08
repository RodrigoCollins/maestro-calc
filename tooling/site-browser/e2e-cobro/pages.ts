import { CASES } from '../../../apps/cobro/src/cases.ts';
import { ROUTES, TRADE_PATHS, wagePathOf, type Lang } from '../../../apps/cobro/src/routes.ts';
import { OCCUPATIONS } from '../../../apps/cobro/src/wages/occupations.ts';

/** A page of Cuánto Le Cobro and the language it is written in (`<html lang>`). */
export interface Page {
  readonly path: string;
  readonly lang: Lang;
}

/** The state pages the suites open: one per trade in a state with a plain name, and a long one (DC, Nueva York). */
const SAMPLE_STATES = [
  ['painting', '48'],
  ['cleaning', '11'],
  ['concrete', '37'],
  ['drywall', '36'],
  ['landscaping', '06'],
] as const;

/**
 * Every page of the site the suites run over: each route that is one file (calculators, guides,
 * the wages hub and indexes, the legal pages), in both languages, and a sample of the 500 state
 * wage pages (every one is checked by `check:site` and by the unit tests of the wage view).
 */
export const PAGES: readonly Page[] = [
  ...ROUTES.filter(({ id }) => !id.startsWith('wage-')).flatMap(({ es, en }) => [
    { path: es, lang: 'es' as const },
    { path: en, lang: 'en' as const },
  ]),
  ...SAMPLE_STATES.flatMap(([trade, fips]) => [
    { path: wagePathOf(trade, fips, 'es'), lang: 'es' as const },
    { path: wagePathOf(trade, fips, 'en'), lang: 'en' as const },
  ]),
];

/** A calculator page in one language, with the figure it shows at its defaults and one hand-verified edit. */
export interface Calculator {
  readonly trade: (typeof OCCUPATIONS)[number]['id'];
  readonly lang: Lang;
  readonly path: string;
  /** The total at the starting values: worked out at build time, so it reads with no script. */
  readonly initial: string;
  /** What is typed over the starting values, by field name, and the total that must follow. */
  readonly edit: Readonly<Record<string, string>>;
  readonly edited: string;
}

/** The two cases of each trade (`apps/cobro/src/cases.ts`): its starting values, then its edit. */
export const CALCULATORS: readonly Calculator[] = OCCUPATIONS.flatMap(({ id }) => {
  const [start, change] = CASES.filter(({ trade }) => trade === id);
  if (start === undefined || change === undefined) throw new Error(`no cases for ${id}`);
  return (['es', 'en'] as const).map((lang) => ({
    trade: id,
    lang,
    path: TRADE_PATHS[id][lang],
    initial: `$${start.total}`,
    edit: change.raw,
    edited: `$${change.total}`,
  }));
});

/** The embed of each calculator page. */
export const EMBEDS: readonly {
  readonly embed: string;
  readonly page: string;
  readonly lang: Lang;
}[] = CALCULATORS.map(({ path, lang }) => ({ embed: `/embed${path}`, page: path, lang }));

/** The origin the pages name themselves at. */
export const ORIGIN = 'https://cuantolecobro.com';
