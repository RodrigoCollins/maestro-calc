import { encode, type Money, type Rational } from '@maestro-calc/core';
import { moneyText, numberText } from '../format.ts';
import { CALCULATORS } from '../lib/calculators.ts';
import { fill } from '../receipt/details.ts';
import {
  TRADE_PATHS,
  wageAreasOf,
  wagePathOf,
  WAGE_STEMS,
  type Lang,
  type TradeId,
} from '../routes.ts';
import { OCCUPATION_TEXTS, WAGE_TEXTS, type WageText } from '../texts/wages.ts';
import { AREAS } from './areas.ts';
import { CENSUS_DIVISIONS_URL, divisionOf } from './divisions.ts';
import {
  FEDERAL_MINIMUM,
  MINIMUM_WAGE_CHECKED,
  MINIMUM_WAGE_SOURCES,
  minimumWageOf,
  NEW_YORK,
  NEW_YORK_UPSTATE,
} from './minimum-wage.ts';
import { OEWS, OEWS_RELEASE, type Wage } from './oews-2025.ts';
import { occupationOf, OCCUPATIONS } from './occupations.ts';

/** Dollars an hour to the cent: `$22.13`. */
export const wageText = (value: number): string =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const BLS_OEWS_URL = 'https://www.bls.gov/oes/';
/** "the annual rate for an occupation is calculated by multiplying the hourly wage rate by a typical work year of 2,080 hours" */
export const BLS_TECHNICAL_URL = 'https://www.bls.gov/oes/current/oes_tec.htm';

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
  readonly source: string;
  /** The rank of the state by average wage, 1 the highest. */
  readonly position: number;
  readonly total: number;
  /** The hourly figures over a week of 40 hours and a BLS year of 2,080, and the mean against the median. */
  readonly year: Section;
  /** The state against the nation. */
  readonly nation: Section;
  /** The state among the states of its Census division with data for the trade. */
  readonly region: Ranked & { readonly caption: string };
  /** The trade among the trades of the site in the same state. */
  readonly trades: Ranked;
  /** The median against the state minimum wage. */
  readonly minimum: Section;
  /** The starting job of the trade's quote calculator, priced by the engine at the state median. */
  readonly quote: { readonly paragraph: string; readonly href: string; readonly label: string };
  /** Every source the page reads, in the order it reads them. */
  readonly sources: readonly { readonly label: string; readonly href: string }[];
}

export interface Section {
  readonly h2: string;
  readonly paragraphs: readonly string[];
}

/** A ranked table: the row of the page itself has no link. */
export interface Ranked {
  readonly h2: string;
  readonly paragraph: string;
  /** The heading of the column that compares each row with the page's own. */
  readonly versus: string;
  readonly rows: readonly RankedRow[];
}

export interface RankedRow {
  readonly state: string;
  readonly href: string | undefined;
  readonly mean: string;
  readonly median: string;
  /** The mean against the page's own, signed: `-$1.85`, `+$0.28`. */
  readonly versus: string;
}

/** The year the BLS turns an hourly wage into an annual one with (OEWS technical notes). */
export const BLS_YEAR_HOURS = 2080;
const WEEK_HOURS = 40;

const cents = (value: number): number => Math.round(value * 100) / 100;

/** Whole dollars: `$46,030`. */
const dollarsText = (value: number): string =>
  `$${Math.round(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/** One decimal place, kept when it is zero: `16.9`, `3.0`. */
const oneDecimal = (value: number): string =>
  (Math.round(value * 10) / 10).toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

const signedText = (value: number): string =>
  value === 0 ? wageText(0) : `${value > 0 ? '+' : '-'}${wageText(Math.abs(value))}`;

/** `a`, `a and b`, `a, b and c`. */
const listText = (names: readonly string[], and: string): string =>
  names.length < 2
    ? names.join('')
    : `${names.slice(0, -1).join(', ')} ${and} ${names.at(-1) ?? ''}`;

/** The place of `mean` among `means`, 1 the highest: ties share a place. */
const placeOf = (mean: number, means: readonly number[]): number =>
  1 + means.filter((each) => each > mean).length;

interface Entry {
  readonly name: string;
  readonly href: string | undefined;
  readonly wage: Wage;
}

const rowsOf = (entries: readonly Entry[], own: number, lang: Lang): readonly RankedRow[] =>
  entries
    .toSorted((a, b) => b.wage[0] - a.wage[0] || a.name.localeCompare(b.name, lang))
    .map(({ name, href, wage: [mean, median] }) => ({
      state: name,
      href,
      mean: wageText(mean),
      median: wageText(median),
      versus: signedText(cents(mean - own)),
    }));

/** Where the state stands in its division: first, last, tied or in between. */
const regionSentence = (
  text: WageText,
  state: string,
  mean: number,
  rows: readonly Entry[],
  lang: Lang,
): string => {
  const means = rows.map(({ wage }) => wage[0]);
  const top = Math.max(...means);
  const bottom = Math.min(...means);
  const others = rows.filter(({ name }) => name !== state);
  const named = (value: number) =>
    listText(
      others.filter(({ wage }) => wage[0] === value).map(({ name }) => name),
      text.and,
    );
  const sorted = others.toSorted(
    (a, b) => b.wage[0] - a.wage[0] || a.name.localeCompare(b.name, lang),
  );
  const vars = { state, mean: wageText(mean), count: String(rows.length) };
  if (mean === top || mean === bottom) {
    const tied = named(mean);
    const highest = mean === top;
    if (tied !== '')
      return fill(highest ? text.regionTopTied : text.regionBottomTied, { ...vars, others: tied });
    const next = highest ? sorted[0] : sorted.at(-1);
    return fill(highest ? text.regionTop : text.regionBottom, {
      ...vars,
      next: next?.name ?? '',
      nextMean: wageText(next?.wage[0] ?? 0),
    });
  }
  const highest = sorted.filter(({ wage }) => wage[0] === top).map(({ name }) => name);
  const lowest = sorted.filter(({ wage }) => wage[0] === bottom).map(({ name }) => name);
  return fill(text.regionMiddle, {
    ...vars,
    place: String(placeOf(mean, means)),
    highest: listText(highest, text.and),
    highMean: wageText(top),
    lowest: listText(lowest, text.and),
    lowMean: wageText(bottom),
  });
};

/** The trade's quote calculator at its starting job, labor at `rate` dollars an hour. */
const startingQuote = (trade: TradeId, rate: number) => {
  const calculator = CALCULATORS[trade];
  const raw = { rate: String(rate) };
  const state = calculator.validate(raw);
  const ran = calculator.run(raw);
  if (!state.ok || !ran.ok) throw new Error(`${calculator.id} must run at ${raw.rate} an hour`);
  const out = Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
  const money = (key: string): string => moneyText(out[key] as Money);
  const starting = (key: string): Rational => {
    const input = calculator.inputs.find((each) => each.key === key);
    return input?.default as Rational;
  };
  return {
    labor: money('labor'),
    materials: money('materials'),
    total: money('total'),
    hours: numberText(starting('hours')),
    overhead: numberText(starting('overhead')),
    profit: numberText(starting('profit')),
    query: encode(calculator as Parameters<typeof encode>[0], state.value as never),
  };
};

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
  const rank = fill(text.rank, {
    state,
    rank: String(position),
    total: String(ranked.length),
    nationalMedian: wageText(nationalMedian),
  });
  const source = fill(text.source, {
    code: occupationOf(trade).code,
    accessed: OEWS_RELEASE.accessed,
  });
  const gap = cents(mean - median);
  const division = divisionOf(fips);
  const neighbours: readonly Entry[] = wageAreasOf(trade)
    .filter((each) => division.fips.includes(each.fips))
    .map((each) => ({
      name: each.name[lang],
      href: each.fips === fips ? undefined : wagePathOf(trade, each.fips, lang),
      wage: wageOf(trade, each.fips),
    }));
  const trades: readonly Entry[] = OCCUPATIONS.filter(
    ({ id }) => OEWS[id]?.[fips] !== undefined,
  ).map(({ id }) => ({
    name: OCCUPATION_TEXTS[lang][id].trade,
    href: id === trade ? undefined : wagePathOf(id, fips, lang),
    wage: wageOf(id, fips),
  }));
  const byMean = trades.toSorted((a, b) => b.wage[0] - a.wage[0]);
  const highTrade = byMean[0];
  const lowTrade = byMean.at(-1);
  const minimum = minimumWageOf(fips);
  const floor = minimum.cents / 100;
  const tradeName = occupation.trade.toLowerCase();
  const atMedian = startingQuote(trade, median);
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
      { label: text.yearStat, value: dollarsText(mean * BLS_YEAR_HOURS) },
    ],
    rankH2: fill(text.rankH2, { state }),
    rank,
    rateH2: text.rateH2,
    source,
    position,
    total: ranked.length,
    year: {
      h2: fill(text.yearH2, { state }),
      paragraphs: [
        fill(text.yearBody, {
          mean: wageText(mean),
          median: wageText(median),
          week: wageText(cents(mean * WEEK_HOURS)),
          year: dollarsText(mean * BLS_YEAR_HOURS),
          yearMedian: dollarsText(median * BLS_YEAR_HOURS),
        }),
        fill(gap === 0 ? text.gapSame : gap > 0 ? text.gapAbove : text.gapBelow, {
          ...vars,
          gap: wageText(Math.abs(gap)),
          percent: oneDecimal((100 * Math.abs(gap)) / median),
        }),
      ],
    },
    nation: {
      h2: fill(text.rankH2, { state }),
      paragraphs: [
        fill(diff === 0 ? text.nationSame : diff > 0 ? text.nationAbove : text.nationBelow, {
          state,
          diff: wageText(Math.abs(diff)),
          national: wageText(nationalMean),
          percent: oneDecimal((100 * Math.abs(diff)) / nationalMean),
          yearDiff: dollarsText(Math.abs(diff) * BLS_YEAR_HOURS),
        }),
        rank,
      ],
    },
    region: {
      h2: fill(text.regionH2, { state, division: division.name[lang] }),
      paragraph: regionSentence(text, state, mean, neighbours, lang),
      caption: fill(text.regionCaption, {
        plural: occupation.plural,
        division: division.name[lang],
      }),
      versus: fill(text.versus, { state }),
      rows: rowsOf(neighbours, mean, lang),
    },
    trades: {
      h2: fill(text.othersH2, { state }),
      paragraph: fill(text.tradesBody, {
        plural: occupation.plural,
        state,
        count: String(trades.length),
        place: String(
          placeOf(
            mean,
            trades.map(({ wage }) => wage[0]),
          ),
        ),
        lowMean: wageText(lowTrade?.wage[0] ?? 0),
        lowTrade: lowTrade?.name ?? '',
        highMean: wageText(highTrade?.wage[0] ?? 0),
        highTrade: highTrade?.name ?? '',
      }),
      versus: fill(text.versus, { state: tradeName }),
      rows: rowsOf(trades, mean, lang),
    },
    minimum: {
      h2: fill(text.minimumH2, { state }),
      paragraphs: [
        fill(minimum.cents === FEDERAL_MINIMUM ? text.minimumFederal : text.minimumState, {
          state,
          plural: occupation.plural,
          minimum: wageText(floor),
          median: wageText(median),
          diff: wageText(cents(median - floor)),
          comparison:
            median >= 2 * floor
              ? fill(text.minimumTimes, { ratio: oneDecimal(median / floor) })
              : fill(text.minimumPercent, {
                  percent: oneDecimal((100 * (median - floor)) / floor),
                }),
          yearMinimum: dollarsText(floor * BLS_YEAR_HOURS),
        }),
        ...(fips === NEW_YORK
          ? [fill(text.minimumUpstate, { upstate: wageText(NEW_YORK_UPSTATE / 100) })]
          : []),
      ],
    },
    quote: {
      paragraph: fill(text.quoteBody, {
        state,
        median: wageText(median),
        hours: atMedian.hours,
        trade: tradeName,
        labor: atMedian.labor,
        materials: atMedian.materials,
        overhead: atMedian.overhead,
        profit: atMedian.profit,
        total: atMedian.total,
        nationalMedian: wageText(nationalMedian),
        nationalTotal: startingQuote(trade, nationalMedian).total,
      }),
      href: `${TRADE_PATHS[trade][lang]}?${atMedian.query}`,
      label: fill(text.quoteLink, { trade: tradeName, median: wageText(median) }),
    },
    sources: [
      { label: source, href: BLS_OEWS_URL },
      { label: text.sourceNames.technical, href: BLS_TECHNICAL_URL },
      {
        label: fill(text.sourceNames[minimum.source], { checked: MINIMUM_WAGE_CHECKED }),
        href: MINIMUM_WAGE_SOURCES[minimum.source].url,
      },
      { label: text.sourceNames.census, href: CENSUS_DIVISIONS_URL },
    ],
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

export interface HubView {
  /** Per trade, the state that pays it the most and the one that pays it the least. */
  readonly spread: Section;
  readonly reading: Section;
  readonly sources: readonly { readonly label: string; readonly href: string }[];
}

/** What the wages hub says besides its cards: the spread of each trade and how to read the figures. */
export const hubViewOf = (lang: Lang): HubView => {
  const text = WAGE_TEXTS[lang];
  const nameOf = (fips: string): string =>
    AREAS.find((area) => area.fips === fips)?.name[lang] ?? '';
  return {
    spread: {
      h2: text.hubSpreadH2,
      paragraphs: OCCUPATIONS.map(({ id }) => {
        const ranked = wageAreasOf(id)
          .map(({ fips }) => ({ fips, mean: wageOf(id, fips)[0] }))
          .toSorted((a, b) => b.mean - a.mean);
        const top = ranked[0] ?? { fips: '', mean: 0 };
        const bottom = ranked.at(-1) ?? top;
        return fill(text.hubSpread, {
          trade: OCCUPATION_TEXTS[lang][id].trade,
          national: wageText(nationalOf(id)[0]),
          top: nameOf(top.fips),
          topMean: wageText(top.mean),
          bottom: nameOf(bottom.fips),
          bottomMean: wageText(bottom.mean),
          ratio: oneDecimal(top.mean / bottom.mean),
        });
      }),
    },
    reading: { h2: text.hubReadingH2, paragraphs: text.hubReading },
    sources: [
      { label: fill(text.hubSource, { accessed: OEWS_RELEASE.accessed }), href: BLS_OEWS_URL },
      { label: text.sourceNames.technical, href: BLS_TECHNICAL_URL },
    ],
  };
};
