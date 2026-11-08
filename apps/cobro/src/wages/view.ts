import { fill } from '../receipt/details.ts';
import { wageAreasOf, wagePathOf, WAGE_STEMS, type Lang, type TradeId } from '../routes.ts';
import { OCCUPATION_TEXTS, WAGE_TEXTS } from '../texts/wages.ts';
import { AREAS } from './areas.ts';
import { OEWS, OEWS_RELEASE, type Wage } from './oews-2025.ts';
import { occupationOf, OCCUPATIONS } from './occupations.ts';

/** Dollars an hour to the cent: `$22.13`. */
export const wageText = (value: number): string =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const upper = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** The national `[mean, median]` of a trade. */
export const nationalOf = (trade: TradeId): Wage => {
  const wage = OEWS[trade]?.['US'];
  if (wage === undefined) throw new Error(`no national wage for ${trade}`);
  return wage;
};

const wageOf = (trade: TradeId, fips: string): Wage => {
  const wage = OEWS[trade]?.[fips];
  if (wage === undefined) throw new Error(`no wage for ${trade} in ${fips}`);
  return wage;
};

export interface StateWageView {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly stats: readonly { readonly label: string; readonly value: string }[];
  readonly rankH2: string;
  readonly rank: string;
  readonly rateH2: string;
  readonly others: readonly { readonly label: string; readonly href: string }[];
  readonly source: string;
  /** The rank of the state by average wage, 1 the highest. */
  readonly position: number;
  readonly total: number;
}

/** The page of one trade in one state, from the data and the words of `lang`. */
export const stateWageViewOf = (trade: TradeId, fips: string, lang: Lang): StateWageView => {
  const text = WAGE_TEXTS[lang];
  const occupation = OCCUPATION_TEXTS[lang][trade];
  const area = AREAS.find((each) => each.fips === fips);
  if (area === undefined) throw new Error(`no area ${fips}`);
  const state = area.name[lang];
  const [mean, median] = wageOf(trade, fips);
  const [nationalMean, nationalMedian] = nationalOf(trade);
  const ranked = wageAreasOf(trade)
    .map(({ fips: each }) => [each, wageOf(trade, each)[0]] as const)
    .sort(([, a], [, b]) => b - a);
  const position = ranked.findIndex(([each]) => each === fips) + 1;
  const diff = Math.round((mean - nationalMean) * 100) / 100;
  const versus =
    diff === 0
      ? text.same
      : fill(diff > 0 ? text.above : text.below, { diff: wageText(Math.abs(diff)) });
  const vars = {
    noun: occupation.noun,
    state,
    plural: occupation.plural,
    Plural: upper(occupation.plural),
    mean: wageText(mean),
    median: wageText(median),
  };
  const title = fill(text.stateTitle, vars);
  return {
    title,
    description: fill(text.stateDescription, vars),
    h1: title,
    lead: fill(text.stateLead, vars),
    stats: [
      { label: text.stats.mean, value: wageText(mean) },
      { label: text.stats.median, value: wageText(median) },
      { label: text.stats.national, value: wageText(nationalMean) },
      { label: text.stats.versus, value: versus },
    ],
    rankH2: fill(text.rankH2, { state }),
    rank: fill(text.rank, {
      state,
      rank: String(position),
      total: String(ranked.length),
      nationalMedian: wageText(nationalMedian),
    }),
    rateH2: text.rateH2,
    others: OCCUPATIONS.filter(({ id }) => id !== trade && OEWS[id]?.[fips] !== undefined).map(
      ({ id }) => ({
        label: fill(text.stateTitle, {
          ...vars,
          noun: OCCUPATION_TEXTS[lang][id].noun,
        }),
        href: wagePathOf(id, fips, lang),
      }),
    ),
    source: fill(text.source, {
      code: occupationOf(trade).code,
      accessed: OEWS_RELEASE.accessed,
    }),
    position,
    total: ranked.length,
  };
};

export interface IndexRow {
  readonly state: string;
  readonly href: string;
  readonly mean: string;
  readonly median: string;
}

export interface TradeIndexView {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly rows: readonly IndexRow[];
  readonly national: IndexRow;
  readonly source: string;
}

/** The index of one trade: every state with data, in the alphabetical order of its name in `lang`. */
export const tradeIndexViewOf = (trade: TradeId, lang: Lang): TradeIndexView => {
  const text = WAGE_TEXTS[lang];
  const occupation = OCCUPATION_TEXTS[lang][trade];
  const [nationalMean, nationalMedian] = nationalOf(trade);
  const vars = {
    noun: occupation.noun,
    plural: occupation.plural,
    mean: wageText(nationalMean),
    median: wageText(nationalMedian),
  };
  const title = fill(text.indexTitle, vars);
  return {
    title,
    description: fill(text.indexDescription, vars),
    h1: title,
    lead: fill(text.indexLead, vars),
    rows: wageAreasOf(trade)
      .map(({ fips, name }) => {
        const [mean, median] = wageOf(trade, fips);
        return {
          state: name[lang],
          href: wagePathOf(trade, fips, lang),
          mean: wageText(mean),
          median: wageText(median),
        };
      })
      .sort((a, b) => a.state.localeCompare(b.state, lang)),
    national: {
      state: text.nationalLine,
      href: WAGE_STEMS[trade][lang],
      mean: wageText(nationalMean),
      median: wageText(nationalMedian),
    },
    source: fill(text.source, {
      code: occupationOf(trade).code,
      accessed: OEWS_RELEASE.accessed,
    }),
  };
};
