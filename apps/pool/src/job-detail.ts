import { PI, Rational, gal, isQuantityOf, liter, valueIn } from '@maestro-calc/core';
import { poolAlkalinity } from '@maestro-calc/pool-core/pool-alkalinity';
import { poolCalcium } from '@maestro-calc/pool-core/pool-calcium';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolFillTime } from '@maestro-calc/pool-core/pool-fill-time';
import { poolHeater } from '@maestro-calc/pool-core/pool-heater';
import { poolPh } from '@maestro-calc/pool-core/pool-ph';
import { poolPump } from '@maestro-calc/pool-core/pool-pump';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolStabilizer } from '@maestro-calc/pool-core/pool-stabilizer';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { CHEMISTRY_CHART } from './chemistry.ts';
import {
  ALKALINITY,
  CALCIUM,
  CHLORINE,
  FILL_TIME,
  HEATER,
  PH,
  PUMP,
  SALT,
  STABILIZER,
} from './doses.ts';
import { volumeText } from './format.ts';
import { SHOCK_GUIDE } from './guide.ts';
import { JOB_PAGES, type JobKind, type JobPage } from './jobs.ts';
import { METHOD_SECTIONS, type MethodSource } from './methodology.ts';
import { SWIM_GUIDE } from './swim.ts';
import {
  BICARBONATE_PER_PPM,
  GRAMS_PER_OUNCE,
  GRAMS_PER_POUND,
  is,
  linkTo,
  LITERS_PER_GALLON,
  ML_PER_FLUID_OUNCE,
  n,
  out,
  POUNDS_PER_GALLON,
  r,
  run,
  shown,
} from './worked-math.ts';

/*
 * What a job page adds under its table (AdSense audit 2026-11-08): its own large figure worked out
 * step by step, the label and safety notes of the sources the methodology already cites, scaled
 * to the page's gallons, and what to test next, each with that pool's dose and a link. Every figure
 * is an engine run or a sourced constant times the page's own numbers; a step whose result is
 * rounded says `≈`, so a reader who checks it by hand never finds a wrong sum.
 */

type Raw = Readonly<Record<string, string>>;

export interface JobLink {
  readonly href: string;
  readonly label: string;
}

export interface JobDetail {
  /** The large figure worked out, one step a sentence, under "How the figures are worked out". */
  readonly worked: readonly string[];
  /** The label and safety notes, scaled to this pool; a volume page has none. */
  readonly label?: { readonly heading: string; readonly items: readonly string[] };
  readonly next: {
    readonly heading: string;
    readonly items: readonly { readonly text: string; readonly link?: JobLink }[];
  };
  /** The sources the notes and the next tests cite beyond the methodology's own. */
  readonly sources: readonly MethodSource[];
}

/** The job page of `kind` for `gallons`, when the site has one. */
const jobOf = (kind: JobKind, gallons: number): JobPage | undefined =>
  JOB_PAGES.find((page) => page.kind === kind && page.gallons === gallons);

/** The job page of `kind` for `gallons`, or the calculator opened on that pool. */
const linkOf = (kind: JobKind, gallons: number, fallback: () => JobLink): JobLink => {
  const page = jobOf(kind, gallons);
  return page === undefined ? fallback() : { href: page.path, label: page.h1 };
};

/** The runs the next tests share, at `gallons`: each gives the dose and its link. */
const nextRuns = (gallons: number) => {
  const g = String(gallons);
  const chlorine = { gallons: g, current: '1', target: '3', product: 'liquid-12-5' };
  const shock = { gallons: g, current: '0', target: '10', product: 'cal-hypo-65' };
  const stabilizer = { gallons: g, current: '0', target: '30' };
  const acid = { gallons: g, product: 'muriatic-31-45', drops: '1' };
  const soda = { gallons: g, product: 'soda-ash', drops: '1' };
  const alkalinity = { gallons: g, current: '90', target: '100' };
  const calcium = { gallons: g, current: '200', target: '250' };
  const salt = { gallons: g, current: '0', target: '3200' };
  const pump = { gallons: g };
  const fill = { gallons: g, flow: '10' };
  const heater = { gallons: g, rise: '10', hours: '24' };
  return {
    chlorine: {
      dose: out(poolChlorine, chlorine, 'liquid'),
      link: linkOf('chlorine', gallons, () => ({
        href: linkTo(poolChlorine, CHLORINE.path, chlorine),
        label: 'Work out the chlorine for this pool',
      })),
    },
    shock: {
      dose: out(poolChlorine, shock, 'dry'),
      link: linkOf('shock', gallons, () => ({
        href: linkTo(poolChlorine, CHLORINE.path, shock),
        label: 'Work out the shock for this pool',
      })),
    },
    stabilizer: {
      dose: out(poolStabilizer, stabilizer, 'pounds'),
      link: linkOf('stabilizer', gallons, () => ({
        href: linkTo(poolStabilizer, STABILIZER.path, stabilizer),
        label: 'Work out the stabilizer for this pool',
      })),
    },
    acid: {
      dose: out(poolPh, acid, 'liquid'),
      soda: out(poolPh, soda, 'dry'),
      link: linkOf('ph', gallons, () => ({
        href: linkTo(poolPh, PH.path, acid),
        label: 'Work out the pH dose for this pool',
      })),
    },
    alkalinity: {
      dose: out(poolAlkalinity, alkalinity, 'pounds'),
      link: linkOf('alkalinity', gallons, () => ({
        href: linkTo(poolAlkalinity, ALKALINITY.path, alkalinity),
        label: 'Work out the baking soda for this pool',
      })),
    },
    calcium: {
      dose: out(poolCalcium, calcium, 'pounds'),
      link: linkOf('calcium', gallons, () => ({
        href: linkTo(poolCalcium, CALCIUM.path, calcium),
        label: 'Work out the calcium chloride for this pool',
      })),
    },
    salt: {
      dose: out(poolSalt, salt, 'pounds'),
      bags: String(run(poolSalt, salt).get('bags')),
      link: linkOf('salt', gallons, () => ({
        href: linkTo(poolSalt, SALT.path, salt),
        label: 'Work out the salt for this pool',
      })),
    },
    pump: {
      dose: out(poolPump, pump, 'flow'),
      /** The flow as a sentence: a 6-hour turnover, or the standard's 36 gpm floor when that is more. */
      says: (size: string): string =>
        gallons < 360 * 36
          ? `${size} gallons ÷ 360 minutes is under the 36 gpm floor of ANSI/APSP/ICC-15, so the pump moves 36.0 gpm and turns the water over in less than 6 hours`
          : `${size} gallons turn over in 6 hours at ${out(poolPump, pump, 'flow')} gpm, the residential rate of ANSI/APSP/ICC-15`,
      link: { href: linkTo(poolPump, PUMP.path, pump), label: 'Work out the pump for this pool' },
    },
    fill: {
      dose: out(poolFillTime, fill, 'time'),
      link: linkOf('fill', gallons, () => ({
        href: linkTo(poolFillTime, FILL_TIME.path, fill),
        label: 'Work out the fill time for this pool',
      })),
    },
    heater: {
      dose: out(poolHeater, heater, 'btuPerHour'),
      link: linkOf('heater', gallons, () => ({
        href: linkTo(poolHeater, HEATER.path, heater),
        label: 'Work out the heater for this pool',
      })),
    },
  };
};

const SOURCES = {
  stabilizer: SWIM_GUIDE.sources.stabilizer,
  hayward: SWIM_GUIDE.sources.hayward,
  liquid: SWIM_GUIDE.sources.liquid,
  alkalinity: SWIM_GUIDE.sources.alkalinity,
  alkalinitySds: SWIM_GUIDE.sources.alkalinitySds,
  cdc: CHEMISTRY_CHART.sources.cdc,
  calHypo: SHOCK_GUIDE.sources.calHypo,
  dichlor: SHOCK_GUIDE.sources.dichlor,
} as const satisfies Record<string, MethodSource>;

const pumpSources = (): readonly MethodSource[] =>
  METHOD_SECTIONS.find(({ href }) => href === PUMP.path)?.sources ?? [];

const NEXT = 'What to test next';

/** The main row's inputs and cells, and the gallons of a dose page as a figure and its text. */
const mainOf = (page: JobPage) => {
  const row = page.rows[page.main];
  if (row === undefined) throw new Error(`${page.path} has no main row`);
  const gallons = r(row.raw['gallons'] ?? '0');
  return { raw: row.raw, cells: row.cells, gallons, size: n(gallons) };
};

const cellOf = (page: JobPage, index: number, cell: number): string =>
  page.rows[index]?.cells[cell] ?? '';

/** The liters the dose dissolves in, said for what it does, so no two families share the step. */
const litersStep = (gallons: Rational, purpose: string): string =>
  `${n(gallons)} gallons × 3.785411784 liters a gallon ${is(gallons.mul(LITERS_PER_GALLON), 1)} liters of water ${purpose}.`;

const stabilizerDetail = (page: JobPage): JobDetail => {
  const { raw, gallons, size } = mainOf(page);
  const raise = r(raw['target'] ?? '0').sub(r(raw['current'] ?? '0'));
  const liters = gallons.mul(LITERS_PER_GALLON);
  const grams = shown(liters, 1).mul(raise).div(Rational.of(1000));
  const pounds = shown(grams, 2).div(GRAMS_PER_POUND);
  const ounces = shown(grams, 2).div(GRAMS_PER_OUNCE);
  const primo = Rational.of(100, 99);
  const g = page.gallons;
  const next = nextRuns(g);
  return {
    worked: [
      litersStep(gallons, 'to stabilize'),
      `From ${raw['current'] ?? ''} to ${raw['target'] ?? ''} ppm is a raise of ${n(raise)} ppm, and 1 ppm is 1 mg per liter: ${n(liters, 1)} L × ${n(raise)} mg per liter ÷ 1,000 mg a gram ${is(grams, 2)} g of cyanuric acid.`,
      `${n(grams, 2)} g ÷ 453.59237 g a pound ${is(pounds, 1)} lb, the large figure; ÷ 28.349523125 g an ounce it is ${n(ounces, 1)} oz.`,
      `From 10 ppm the raise is 20 ppm, ${cellOf(page, 1, 1)} lb; from 20 ppm it is 10 ppm, ${cellOf(page, 2, 1)} lb: in ${size} gallons the dose falls in step with the raise.`,
    ],
    label: {
      heading: 'On the stabilizer label',
      items: [
        `The ${n(pounds, 1)} lb are for 100% cyanuric acid. ClearView Primo Powder is 99% isocyanuric acid, so its dose is ${n(ounces, 2)} oz ÷ 99 × 100 ${is(shown(ounces, 2).mul(primo), 1)} oz.`,
        `The Primo directions keep 30 to 50 ppm. Topping ${size} gallons up from 30 to 50 ppm takes ${out(poolStabilizer, { gallons: String(g), current: '30', target: '50' }, 'pounds')} lb more.`,
        `The CDC’s Model Aquatic Health Code caps a public pool at 90 ppm, ${out(poolStabilizer, { gallons: String(g), current: '30', target: '90' }, 'pounds')} lb of cyanuric acid above 30 ppm in ${size} gallons. Stabilizer does not wear off, so too much stays until you drain part of the water.`,
        `Primo goes in through the skimmer with a clean filter, and the ${size} gallons recirculate for 24 hours to dissolve it, at a pH of 7.2 to 7.6.`,
      ],
    },
    next: {
      heading: NEXT,
      items: [
        {
          text: `After those 24 hours, test CYA again: a reading under 30 ppm means a second, smaller dose for the ${size} gallons, worked out from your reading.`,
          link: { href: page.calculator.href, label: page.calculator.label },
        },
        {
          text: `With stabilizer in the water, CDC’s floor for free chlorine is 2 ppm. Raising ${size} gallons from 1 to 3 ppm takes ${next.chlorine.dose} fl oz of 12.5% liquid chlorine.`,
          link: next.chlorine.link,
        },
        {
          text: `Test the pH. When the acid demand test of a Taylor kit takes 1 drop, ${size} gallons need ${next.acid.dose} fl oz of 31.45% muriatic acid.`,
          link: next.acid.link,
        },
      ],
    },
    sources: [SOURCES.stabilizer, SOURCES.cdc],
  };
};

const saltDetail = (page: JobPage): JobDetail => {
  const { raw, gallons, size } = mainOf(page);
  const target = r(raw['target'] ?? '0');
  const water = gallons.mul(POUNDS_PER_GALLON);
  const pounds = water.mul(target).div(Rational.of(1_000_000));
  const bags = String(run(poolSalt, raw).get('bags'));
  const first = out(poolSalt, raw, 'firstAddition');
  const g = String(page.gallons);
  const next = nextRuns(page.gallons);
  return {
    worked: [
      `${size} gallons × 8.34 lb a gallon ${is(water)} lb of water.`,
      `${n(target)} ppm is ${n(target)} lb of salt in every million lb of water: ${n(water)} × ${n(target)} ÷ 1,000,000 ${is(pounds, 1)} lb.`,
      `${n(pounds, 2)} lb ÷ 40 lb a bag ${is(pounds.div(Rational.of(40)), 2)} bags, rounded up to ${bags} bags.`,
      `In kilograms: ${n(pounds, 2)} lb × 0.45359237 ${is(pounds.mul(Rational.of(45_359_237, 100_000_000)), 1)} kg.`,
      `At a reading of 2,400 ppm, only 800 ppm is missing: ${cellOf(page, 3, 1)} lb, ${cellOf(page, 3, 2)} bags.`,
    ],
    label: {
      heading: 'On the salt and the cell',
      items: [
        `Hayward’s AquaRite manual runs the cell at 2,700 to 3,400 ppm. From fresh water, ${size} gallons need ${out(poolSalt, { gallons: g, current: '0', target: '2700' }, 'pounds')} lb for 2,700 ppm and ${out(poolSalt, { gallons: g, current: '0', target: '3400' }, 'pounds')} lb for 3,400.`,
        `The calculator adds ${first} lb first, three quarters of the ${n(pounds, 1)} lb, and tests after 24 hours before the rest.`,
        `The manual adds the salt with the pump on and brushes it around so it does not pile up on the bottom; the ${bags} bags dissolve while the filter pump runs 24 hours with the suction from the main drain, and the salt display may take 24 hours to respond.`,
      ],
    },
    next: {
      heading: NEXT,
      items: [
        {
          text: `Test the salt after those 24 hours; under 3,200 ppm, the calculator works out the rest for ${size} gallons from your reading.`,
          link: { href: page.calculator.href, label: page.calculator.label },
        },
        {
          text: `Test stabilizer: from 0 ppm, ${size} gallons take ${next.stabilizer.dose} lb of cyanuric acid to reach 30 ppm.`,
          link: next.stabilizer.link,
        },
        {
          text: `Test free chlorine once the cell runs: CDC’s floor is 1 ppm, 2 ppm with stabilizer. By hand, 1 to 3 ppm in ${size} gallons takes ${next.chlorine.dose} fl oz of 12.5% liquid chlorine.`,
          link: next.chlorine.link,
        },
      ],
    },
    sources: [SOURCES.hayward, SOURCES.cdc],
  };
};

const chlorineDetail = (page: JobPage): JobDetail => {
  const { raw, gallons, size } = mainOf(page);
  const raise = r(raw['target'] ?? '0').sub(r(raw['current'] ?? '0'));
  const liters = gallons.mul(LITERS_PER_GALLON);
  const grams = shown(liters, 1).mul(raise).div(Rational.of(1000));
  const ml = shown(grams, 3).mul(Rational.of(8));
  const same = (product: string, key: string): string =>
    out(poolChlorine, { ...raw, product }, key);
  const next = nextRuns(page.gallons);
  return {
    worked: [
      litersStep(gallons, 'to chlorinate'),
      `From ${raw['current'] ?? ''} to ${raw['target'] ?? ''} ppm is ${n(raise)} mg of available chlorine per liter: ${n(liters, 1)} × ${n(raise)} ÷ 1,000 ${is(grams, 3)} g.`,
      `12.5% liquid chlorine holds 12.5 g of available chlorine in 100 mL, so ${n(grams, 3)} g × 100 ÷ 12.5 ${is(ml, 1)} mL.`,
      `${n(ml, 1)} mL ÷ 29.5735295625 mL a fluid ounce ${is(shown(ml, 1).div(ML_PER_FLUID_OUNCE), 1)} fl oz, or ${n(ml.div(Rational.of(1000)), 2)} L, the large figure.`,
      `The other rows: 1 to 2 ppm takes ${cellOf(page, 0, 1)} fl oz and 1 to 4 ppm ${cellOf(page, 2, 1)} fl oz, in step with the raise.`,
      `Checked with the shortcut of the method, 10.24 fl oz per ppm per 10,000 gallons: ${size} ÷ 10,000 × ${n(raise)} × 10.24 ${is(gallons.div(Rational.of(10_000)).mul(raise).mul(r('10.24')), 1)} fl oz.`,
    ],
    label: {
      heading: 'On the label of each product',
      items: [
        `The same ${n(raise)} ppm in ${size} gallons takes ${same('liquid-10', 'liquid')} fl oz of 10% liquid, ${same('cal-hypo-65', 'dry')} oz of 65% cal-hypo or ${same('dichlor-56', 'dry')} oz of 56% dichlor: the weaker the product, the more of it.`,
        `The 12.5% liquid label (EPA Reg. No. 55487-20001) super-chlorinates with 52 to 104 fl oz per 10,000 gallons for 5 to 10 ppm: ${n(gallons.mul(Rational.of(52, 10_000)))} to ${n(gallons.mul(Rational.of(104, 10_000)))} fl oz for ${size} gallons.`,
        `The same label says not to enter the pool above 4 ppm, so after the ${cellOf(page, 2, 1)} fl oz of the 1 to 4 ppm row, test before anyone swims.`,
      ],
    },
    next: {
      heading: NEXT,
      items: [
        {
          text: `Test the pH too: CDC keeps a home pool at 7.0 to 7.8. When the acid demand test takes 1 drop, ${size} gallons need ${next.acid.dose} fl oz of 31.45% muriatic acid.`,
          link: next.acid.link,
        },
        {
          text: `Green or cloudy water needs a shock instead: from 0 ppm, ${size} gallons take ${next.shock.dose} oz of 65% cal-hypo to reach 10 ppm.`,
          link: next.shock.link,
        },
        {
          text: `Liquid chlorine adds no stabilizer, and CDC’s floor is 2 ppm with it: from 0 to 30 ppm, ${size} gallons take ${next.stabilizer.dose} lb of cyanuric acid.`,
          link: next.stabilizer.link,
        },
      ],
    },
    sources: [SOURCES.liquid, SOURCES.cdc],
  };
};

const shockDetail = (page: JobPage): JobDetail => {
  const { raw, gallons, size } = mainOf(page);
  const target = r(raw['target'] ?? '0');
  const liters = gallons.mul(LITERS_PER_GALLON);
  const grams = shown(liters, 1).mul(target).div(Rational.of(1000));
  const product = shown(grams, 2).mul(Rational.of(100, 65));
  const ounces = shown(product, 2).div(GRAMS_PER_OUNCE);
  const [low, high] = [cellOf(page, 0, 1), cellOf(page, 1, 1)];
  const next = nextRuns(page.gallons);
  return {
    worked: [
      litersStep(gallons, 'to shock'),
      `From 0 to ${n(target)} ppm is ${n(target)} mg per liter: ${n(liters, 1)} × ${n(target)} ÷ 1,000 ${is(grams, 2)} g of available chlorine.`,
      `Cal-hypo is 65% available chlorine: ${n(grams, 2)} × 100 ÷ 65 ${is(product, 2)} g of the granules.`,
      `${n(product, 2)} g ÷ 28.349523125 g an ounce ${is(ounces, 1)} oz, the large figure, and ÷ 16 ${is(ounces.div(Rational.of(16)), 2)} lb.`,
      `For 5 ppm it is half, ${low} oz. Dichlor is 56%, so its 8.7 ppm takes ${cellOf(page, 2, 1)} oz in ${size} gallons.`,
    ],
    label: {
      heading: 'On the shock labels',
      items: [
        `The cal-hypo label shocks with 10 to 20 oz per 10,000 gallons for 5 to 10 ppm: ${n(gallons.div(Rational.of(1000)))} to ${n(gallons.div(Rational.of(500)))} oz for ${size} gallons, against the ${low} and ${high} oz worked out here.`,
        `The dichlor label shocks with 2 oz per 1,000 gallons, which it says gives 8.7 ppm on a new pool: ${n(gallons.div(Rational.of(500)))} oz for ${size} gallons.`,
        `The cal-hypo label prohibits reentry above 4 ppm, the dichlor label above 3 ppm: after ${high} oz of cal-hypo the water stays closed until a test reads 4 ppm or less.`,
      ],
    },
    next: {
      heading: NEXT,
      items: [
        {
          text: `Balance the pH first: both labels ask for 7.2 to 7.6. When the acid demand test takes 1 drop, ${size} gallons need ${next.acid.dose} fl oz of 31.45% muriatic acid.`,
          link: next.acid.link,
        },
        {
          text: `Once a test reads 4 ppm or less, hold free chlorine at your target: 1 to 3 ppm in ${size} gallons takes ${next.chlorine.dose} fl oz of 12.5% liquid chlorine.`,
          link: next.chlorine.link,
        },
        {
          text: `Dichlor adds stabilizer, so test CYA before the next dichlor shock: from 0 to 30 ppm, ${size} gallons take ${next.stabilizer.dose} lb of cyanuric acid.`,
          link: next.stabilizer.link,
        },
      ],
    },
    sources: [SOURCES.calHypo, SOURCES.dichlor],
  };
};

const alkalinityDetail = (page: JobPage): JobDetail => {
  const { raw, gallons, size } = mainOf(page);
  const raise = r(raw['target'] ?? '0').sub(r(raw['current'] ?? '0'));
  const liters = gallons.mul(LITERS_PER_GALLON);
  const grams = shown(liters, 1).mul(raise).mul(r('1.6788')).div(Rational.of(1000));
  const g = String(page.gallons);
  const next = nextRuns(page.gallons);
  return {
    worked: [
      litersStep(gallons, 'to buffer'),
      `Alkalinity is read as calcium carbonate, so each ppm takes 84.007 ÷ 50.04 ${is(BICARBONATE_PER_PPM, 4)} mg of sodium bicarbonate per liter: ${n(liters, 1)} × ${n(raise)} × 1.6788 ÷ 1,000 ${is(grams, 1)} g for the ${n(raise)} ppm from ${raw['current'] ?? ''} to ${raw['target'] ?? ''}.`,
      `${n(grams, 1)} g ÷ 453.59237 ${is(shown(grams, 1).div(GRAMS_PER_POUND), 1)} lb, the large figure, or ÷ 28.349523125 ${is(shown(grams, 1).div(GRAMS_PER_OUNCE), 1)} oz.`,
      `From 80 ppm, 20 ppm short, it is ${cellOf(page, 1, 1)} lb; from 70 ppm, ${cellOf(page, 2, 1)} lb, in ${size} gallons.`,
      `In kilograms: ${n(grams, 1)} g ÷ 1,000 ${is(grams.div(Rational.of(1000)), 2)} kg of baking soda.`,
    ],
    label: {
      heading: 'On the baking soda label',
      items: [
        `ClearView Total Alkalinity is 100% sodium bicarbonate by its safety data sheet. Its directions add it in the evening with the filter running, broadcast over the deepest part of the pool: ${cellOf(page, 0, 2)} oz for this 10 ppm.`,
        `For a public pool, the CDC’s code keeps total alkalinity at 60 to 180 ppm. From 60 ppm, the bottom of that range, ${size} gallons take ${out(poolAlkalinity, { gallons: g, current: '60', target: '100' }, 'pounds')} lb to reach 100.`,
      ],
    },
    next: {
      heading: NEXT,
      items: [
        {
          text: `Test the pH: in ${size} gallons, 1 drop of acid demand reagent means ${next.acid.dose} fl oz of 31.45% muriatic acid, and 1 drop of base demand reagent ${next.acid.soda} oz of soda ash.`,
          link: next.acid.link,
        },
        {
          text: `Test calcium hardness: from 200 to 250 ppm, ${size} gallons take ${next.calcium.dose} lb of calcium chloride.`,
          link: next.calcium.link,
        },
        {
          text: `Test free chlorine before anyone gets in: 1 to 3 ppm in ${size} gallons takes ${next.chlorine.dose} fl oz of 12.5% liquid chlorine.`,
          link: next.chlorine.link,
        },
      ],
    },
    sources: [SOURCES.alkalinity, SOURCES.alkalinitySds],
  };
};

const calciumDetail = (page: JobPage): JobDetail => {
  const { raw, gallons, size } = mainOf(page);
  const current = r(raw['current'] ?? '0');
  const raise = r(raw['target'] ?? '0').sub(current);
  const perTen = gallons.div(Rational.of(1000)).mul(Rational.of(2));
  const ounces = perTen.mul(raise.div(Rational.of(10)));
  const pounds = ounces.div(Rational.of(16));
  const first = gallons.div(Rational.of(10_000)).mul(Rational.of(3));
  const additions = pounds.div(first).ceil();
  const g = String(page.gallons);
  const next = nextRuns(page.gallons);
  return {
    worked: [
      `The ClearView label raises calcium hardness 10 ppm with 2 oz of calcium chloride per 1,000 gallons: ${size} ÷ 1,000 × 2 oz ${is(perTen, 1)} oz for each 10 ppm.`,
      `From ${n(current)} to ${raw['target'] ?? ''} ppm is ${n(raise)} ppm, ${n(raise.div(Rational.of(10)))} steps of 10: ${n(perTen, 1)} × ${n(raise.div(Rational.of(10)))} ${is(ounces, 1)} oz, ÷ 16 ${is(pounds, 1)} lb.`,
      `Over 3 lb per 10,000 gallons the label splits the dose: ${size} ÷ 10,000 × 3 lb ${is(first, 1)} lb at a time.`,
      `So the ${n(pounds, 1)} lb go in as ${String(additions)} additions of at most ${n(first, 1)} lb, each at least 12 hours after the last: ${String(12n * (additions - 1n))} hours from the first to the last.`,
      `The last of the ${String(additions)} additions is what is left: ${n(pounds, 1)} − ${String(additions - 1n)} × ${n(first, 1)} ${is(pounds.sub(first.mul(Rational.of(additions - 1n))), 1)} lb.`,
    ],
    label: {
      heading: 'On the calcium label',
      items: [
        `Dissolve each addition first, about ½ lb to a gallon of water: the ${n(first, 1)} lb of one addition take about ${n(first.mul(Rational.of(2)), 1)} gallons, poured into the deep end with the pump running.`,
        `The label’s dose is for flake, 74 to 100% calcium chloride by its safety data sheet; pure calcium chloride takes 0.925 lb per 10 ppm per 10,000 gallons, ${n(
          gallons
            .div(Rational.of(10_000))
            .mul(raise.div(Rational.of(10)))
            .mul(Rational.of(925, 1000)),
          2,
        )} lb for this raise.`,
        `Hayward’s AquaRite manual keeps 200 to 400 ppm; from ${n(current)} ppm, 400 would take ${out(poolCalcium, { gallons: g, current: String(current.toNumber()), target: '400' }, 'pounds')} lb. The CDC’s code caps a public pool at 2,500 ppm.`,
      ],
    },
    next: {
      heading: NEXT,
      items: [
        {
          text: `Test calcium hardness 12 hours after each of the ${String(additions)} additions, before the next one; the calculator reworks the rest for ${size} gallons from your reading.`,
          link: { href: page.calculator.href, label: page.calculator.label },
        },
        {
          text: `Test the pH: when the acid demand test takes 1 drop, ${size} gallons need ${next.acid.dose} fl oz of 31.45% muriatic acid.`,
          link: next.acid.link,
        },
        {
          text: `Test total alkalinity: from 90 to 100 ppm, ${size} gallons take ${next.alkalinity.dose} lb of baking soda.`,
          link: next.alkalinity.link,
        },
      ],
    },
    sources: [],
  };
};

const phDetail = (page: JobPage): JobDetail => {
  const { raw, gallons, size } = mainOf(page);
  const drops = r(raw['drops'] ?? '0');
  const ratio = gallons.div(Rational.of(10_000));
  const ounces = ratio.mul(drops).mul(Rational.of(916, 100));
  const perDay = gallons.mul(Rational.of(32)).div(Rational.of(20_000));
  const days = out(poolPh, raw, 'days');
  const g = String(page.gallons);
  const soda = { gallons: g, product: 'soda-ash', drops: raw['drops'] ?? '' };
  const next = nextRuns(page.gallons);
  return {
    worked: [
      `Taylor’s chart gives 9.16 fl oz of 31.45% muriatic acid for each drop of acid demand reagent per 10,000 gallons, and ${size} ÷ 10,000 ${is(ratio, 1)} times that.`,
      `${n(ratio, 1)} × ${n(drops)} drops × 9.16 fl oz ${is(ounces, 1)} fl oz, the large figure, or ${volumeText(liquidOf(raw), liter, 2)} L.`,
      `HASA’s label adds at most one quart, 32 fl oz, per 20,000 gallons in 24 hours: ${size} × 32 ÷ 20,000 ${is(perDay, 1)} fl oz a day.`,
      `${n(ounces, 2)} ÷ ${n(perDay, 1)} ${is(ounces.div(perDay), 2)} days of that most, rounded up to ${days}.`,
      `1 drop is ${cellOf(page, 0, 1)} fl oz over ${cellOf(page, 0, 3)} ${cellOf(page, 0, 3) === '1' ? 'day' : 'days'}; 3 drops, where the chart stops, ${cellOf(page, 2, 1)} fl oz over ${cellOf(page, 2, 3)} days.`,
    ],
    label: {
      heading: 'Safety and the acid label',
      items: [
        `Add acid to water, never water to acid: pour each day’s ${n(perDay, 1)} fl oz slowly into the deep end with the pump running, wearing gloves and eye protection, and never mix it with chlorine.`,
        `HASA’s directions run the filter and the pump while you add it and for at least 1 hour after, then retest the pH of the ${size} gallons.`,
        `To raise pH instead, the base demand test counts drops for soda ash: ${n(drops)} drops in ${size} gallons is ${out(poolPh, soda, 'dry')} oz, at most ${out(poolPh, soda, 'dryPerAddition')} oz at a time on the pH Up label, 2 to 3 hours apart.`,
      ],
    },
    next: {
      heading: NEXT,
      items: [
        {
          text: `Retest the pH once the pump has run an hour after each day’s ${n(perDay, 1)} fl oz; HASA keeps it at 7.2 to 7.6.`,
          link: { href: page.calculator.href, label: page.calculator.label },
        },
        {
          text: `Test total alkalinity: from 90 to 100 ppm, ${size} gallons take ${next.alkalinity.dose} lb of baking soda.`,
          link: next.alkalinity.link,
        },
        {
          text: `Then free chlorine: 1 to 3 ppm in ${size} gallons takes ${next.chlorine.dose} fl oz of 12.5% liquid chlorine.`,
          link: next.chlorine.link,
        },
      ],
    },
    sources: [],
  };
};

const liquidOf = (raw: Raw) => {
  const liquid = run(poolPh, raw).get('liquid');
  if (!isQuantityOf(liquid, 'volume')) throw new Error('liquid must be a volume');
  return liquid;
};

const heaterDetail = (page: JobPage): JobDetail => {
  const { raw, gallons, size } = mainOf(page);
  const rise = r(raw['rise'] ?? '0');
  const hours = r(raw['hours'] ?? '1');
  const water = gallons.mul(POUNDS_PER_GALLON);
  const btu = water.mul(rise);
  const g = String(page.gallons);
  const next = nextRuns(page.gallons);
  return {
    worked: [
      `A gallon of water weighs about 8.34 lb, so ${size} gallons weigh ${size} × 8.34 ${is(water)} lb.`,
      `One BTU warms 1 lb of water by 1 °F: ${n(water)} lb × ${n(rise)} °F ${is(btu)} BTU.`,
      `Spread over ${n(hours)} hours: ${n(btu)} ÷ ${n(hours)} ${is(btu.div(hours))} BTU an hour, the large figure.`,
      `15 °F takes ${cellOf(page, 1, 1)} BTU an hour and 20 °F ${cellOf(page, 2, 1)}, in step with the rise.`,
      `In 12 hours instead of 24, the same ${n(rise)} °F takes ${out(poolHeater, { gallons: g, rise: String(rise.toNumber()), hours: '12' }, 'btuPerHour')} BTU an hour.`,
    ],
    label: {
      heading: 'What the figure leaves out',
      items: [
        `Each 1 °F of ${size} gallons is ${n(water)} BTU, so over 24 hours each degree asks ${n(water.div(Rational.of(24)))} BTU an hour of the heater, before any heat is lost.`,
        `The ${n(btu)} BTU are the heat the water keeps; a pool also loses heat to the air while it warms, and the Department of Energy sizes a gas heater by the surface area of the pool instead.`,
      ],
    },
    next: {
      heading: 'What to work out next',
      items: [
        {
          text: `A heater warms only the water the pump sends through it: ${next.pump.says(size)}.`,
          link: next.pump.link,
        },
        {
          text: `Filling ${size} gallons with a 10 gallon a minute hose takes ${next.fill.dose}.`,
          link: next.fill.link,
        },
        {
          text: `Fresh water needs stabilizer: from 0 to 30 ppm, ${size} gallons take ${next.stabilizer.dose} lb of cyanuric acid.`,
          link: next.stabilizer.link,
        },
      ],
    },
    sources: pumpSources(),
  };
};

const fillDetail = (page: JobPage): JobDetail => {
  const { raw, gallons, size } = mainOf(page);
  const flow = r(raw['flow'] ?? '1');
  const minutes = gallons.div(flow);
  const next = nextRuns(page.gallons);
  return {
    worked: [
      `${size} gallons ÷ ${n(flow)} gallons a minute ${is(minutes)} minutes.`,
      `${n(minutes)} ÷ 60 ${is(minutes.div(Rational.of(60)), 2)} hours, ${cellOf(page, page.main, 1)}, the large figure.`,
      `In days: ${n(minutes)} ÷ 1,440 minutes a day ${is(minutes.div(Rational.of(1440)), 2)} days of running water.`,
      `At 5 gallons a minute it takes ${cellOf(page, 0, 1)}; at 20, ${cellOf(page, 2, 1)}.`,
    ],
    label: {
      heading: 'Measure your hose',
      items: [
        `Time a 5-gallon bucket at the hose: gallons a minute = 300 ÷ the seconds, so the 10 gallons a minute of the large figure is a 30-second bucket, 5 a 60-second bucket and 20 a 15-second bucket.`,
        `Every second your bucket takes adds ${size} ÷ 300 ${is(gallons.div(Rational.of(300)), 1)} minutes to the fill of ${size} gallons.`,
      ],
    },
    next: {
      heading: 'What to work out next',
      items: [
        {
          text: `Once it is full, the pump runs: ${next.pump.says(size)}.`,
          link: next.pump.link,
        },
        {
          text: `New water has no stabilizer: from 0 to 30 ppm, ${size} gallons take ${next.stabilizer.dose} lb of cyanuric acid.`,
          link: next.stabilizer.link,
        },
        {
          text: `For a salt cell, ${size} gallons of fresh water take ${next.salt.dose} lb of salt, ${next.salt.bags} bags of 40 lb, to reach 3,200 ppm.`,
          link: next.salt.link,
        },
        {
          text: `Warming the new water 10 °F in 24 hours takes ${next.heater.dose} BTU an hour.`,
          link: next.heater.link,
        },
      ],
    },
    sources: pumpSources(),
  };
};

/** A field length, `3 ft 6 in`, in feet. */
const feetOf = (text: string): Rational => {
  const match = /^(\d+) ft(?: (\d+) in)?$/.exec(text);
  if (match === null) throw new Error(`not a length: ${text}`);
  return r(match[1] ?? '0').add(r(match[2] ?? '0').div(Rational.of(12)));
};

const feetText = (feet: Rational): string => n(feet, feet.isInteger() ? 0 : 1);

const volumeDetail = (page: JobPage): JobDetail => {
  const row = page.rows[page.main];
  if (row === undefined) throw new Error(`${page.path} has no main row`);
  const { raw } = row;
  const shape = raw['shape'] ?? 'rectangle';
  const length = feetOf(raw['length'] ?? '');
  const shallow = feetOf(raw['shallow'] ?? '');
  const deep = feetOf(raw['deep'] ?? '');
  const width = shape === 'round' ? length : feetOf(raw['width'] ?? '');
  const area =
    shape === 'rectangle' ? length.mul(width) : length.mul(width).mul(PI).div(Rational.of(4));
  const depth = shallow.add(deep).div(Rational.of(2));
  // an exact surface keeps its volume exact at one place; a curved one carries three
  const cubicPlaces = area.isInteger() ? 1 : 3;
  const cubic = (area.isInteger() ? area : shown(area, 4)).mul(depth);
  const gallons = shown(cubic, cubicPlaces).mul(Rational.of(1728)).div(Rational.of(231));
  const volume = run(poolVolume, raw).get('gallons');
  if (!isQuantityOf(volume, 'volume')) throw new Error('gallons must be a volume');
  const whole = Number(valueIn(volume, gal).toNumber().toFixed(0));
  const size = n(Rational.of(whole));
  const next = nextRuns(whole);
  const surface =
    shape === 'rectangle'
      ? `The surface: ${feetText(length)} ft × ${feetText(width)} ft ${is(area)} ft².`
      : shape === 'round'
        ? `The surface of a circle ${feetText(length)} ft across: π × ${feetText(length)}² ÷ 4 ${is(area, 4)} ft².`
        : `The surface of an oval ${feetText(length)} by ${feetText(width)} ft: π × ${feetText(length)} × ${feetText(width)} ÷ 4 ${is(area, 4)} ft².`;
  const pool =
    shape === 'round'
      ? `${feetText(length)} ft round`
      : `${feetText(length)} × ${feetText(width)} ft ${shape === 'oval' ? 'oval' : 'rectangular'}`;
  const average = shallow.equals(deep)
    ? `The water of this ${pool} pool is ${feetText(depth)} ft deep all over, so that is the depth to use.`
    : `The average depth of this ${pool} pool: (${feetText(shallow)} + ${feetText(deep)}) ÷ 2 ${is(depth, 2)} ft, since the floor slopes straight from end to end.`;
  return {
    worked: [
      surface,
      average,
      `${n(area, area.isInteger() ? 0 : 4)} ft² × ${n(depth, 2).replace(/\.?0+$/, '')} ft ${is(cubic, cubicPlaces)} ft³.`,
      `A US gallon is 231 cubic inches and a cubic foot 1,728, so ${n(cubic, cubicPlaces)} × 1,728 ÷ 231 ${is(gallons)} gallons.`,
      `In liters: ${n(gallons, 3)} gallons × 3.785411784 ${is(shown(gallons, 3).mul(LITERS_PER_GALLON))} liters.`,
      `Every 6 inches of average depth in this ${pool} pool holds ${n(area, area.isInteger() ? 0 : 4)} × 0.5 × 1,728 ÷ 231 ${is(area.mul(Rational.of(864, 231)))} gallons.`,
    ],
    next: {
      heading: 'What this pool needs next',
      items: [
        {
          text: `For a salt cell, ${size} gallons of fresh water take ${next.salt.dose} lb of salt, ${next.salt.bags} bags of 40 lb, to reach 3,200 ppm.`,
          link: next.salt.link,
        },
        {
          text: `Stabilizer from 0 to 30 ppm: ${next.stabilizer.dose} lb of cyanuric acid for ${size} gallons.`,
          link: next.stabilizer.link,
        },
        {
          text: `Free chlorine from 1 to 3 ppm: ${next.chlorine.dose} fl oz of 12.5% liquid chlorine.`,
          link: next.chlorine.link,
        },
        {
          text: `Its pump: ${next.pump.says(size)}.`,
          link: next.pump.link,
        },
        {
          text: `A 10 gallon a minute hose fills it in ${next.fill.dose}.`,
          link: next.fill.link,
        },
      ],
    },
    sources: [],
  };
};

const DETAILS: Readonly<Record<JobKind, (page: JobPage) => JobDetail>> = {
  volume: volumeDetail,
  salt: saltDetail,
  chlorine: chlorineDetail,
  shock: shockDetail,
  alkalinity: alkalinityDetail,
  stabilizer: stabilizerDetail,
  heater: heaterDetail,
  fill: fillDetail,
  ph: phDetail,
  calcium: calciumDetail,
};

/** The worked figures, the label notes and the next tests of a job page. */
export const jobDetailOf = (page: JobPage): JobDetail => DETAILS[page.kind](page);
