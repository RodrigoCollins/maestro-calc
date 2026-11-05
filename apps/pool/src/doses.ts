import { STRIP, type Pad } from './strip.ts';

/** One result row of a dose page: the output, its label, its unit and the product forms it shows for. */
export interface ResultRow {
  readonly key: string;
  readonly label: string;
  readonly unit: string;
  readonly forms?: readonly string[];
}

export interface DosePage {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly fields: Readonly<
    Record<string, { readonly label: string; readonly options?: Readonly<Record<string, string>> }>
  >;
  readonly results: readonly ResultRow[];
  readonly bags?: string;
  /** The test strip picker that sets the reading of `field` (strip.ts). */
  readonly strip?: {
    readonly field: string;
    readonly legend: string;
    readonly note: string;
    readonly pads: readonly Pad[];
  };
  readonly warnings?: Readonly<Record<string, string>>;
  readonly method: string;
  readonly note: string;
}

const gallons = { label: 'Pool volume (gallons)' };

export const SALT: DosePage = {
  path: '/pool-salt-calculator',
  title: 'Pool Salt Calculator: How Many Bags? | Pool Figures',
  description:
    'How many pounds and 40 lb bags of salt to raise your pool from its reading to the target, 3,200 ppm by default.',
  kicker: 'Saltwater pools · free',
  h1: 'Pool salt calculator',
  lead: 'Type your pool gallons, today’s salt reading and the level your cell asks for. You get the pounds and the bags.',
  fields: { gallons, current: { label: 'Salt now (ppm)' }, target: { label: 'Target (ppm)' } },
  results: [
    { key: 'pounds', label: 'Salt to add', unit: 'LB' },
    { key: 'kilograms', label: 'Kilograms', unit: 'kg' },
    { key: 'firstAddition', label: 'Add this first, then test after 24 hours', unit: 'lb' },
  ],
  bags: 'bags of 40 lb',
  warnings: {
    drainToLower:
      'Your salt is over the target. Salt does not wear off: the only way to lower it is to drain part of the water and refill.',
  },
  method:
    'Pounds = gallons × (target − reading) × 8.34 ÷ 1,000,000, since a gallon of water weighs about 8.34 lb. Hayward’s AquaRite manual gives 2,700 to 3,400 ppm, 3,200 the best.',
  note: 'Use pool salt over 99% sodium chloride. Wait 10 to 14 days before adding salt to new plaster.',
};

export const CHLORINE: DosePage = {
  path: '/pool-chlorine-calculator',
  title: 'Pool Chlorine Calculator: How Much to Add | Pool Figures',
  description:
    'How much liquid chlorine, cal-hypo or dichlor raises your pool’s free chlorine from its reading to the target.',
  kicker: 'Chlorine · free',
  h1: 'Pool chlorine calculator',
  lead: 'Type your pool gallons, today’s free chlorine and the level you want. You get the dose of the product you have.',
  fields: {
    gallons,
    current: { label: 'Free chlorine now (ppm)' },
    target: { label: 'Target (ppm)' },
    product: {
      label: 'Product',
      options: {
        'liquid-12-5': 'Liquid chlorine, 12.5%',
        'liquid-10': 'Liquid chlorine, 10%',
        'cal-hypo-65': 'Cal-hypo shock, 65%',
        'dichlor-56': 'Dichlor, 56%',
      },
    },
  },
  results: [
    {
      key: 'liquid',
      label: 'Liquid chlorine to add',
      unit: 'FL OZ',
      forms: ['liquid-12-5', 'liquid-10'],
    },
    {
      key: 'dry',
      label: 'Granular product to add',
      unit: 'OZ BY WEIGHT',
      forms: ['cal-hypo-65', 'dichlor-56'],
    },
  ],
  strip: { field: 'current', ...STRIP },
  method:
    '1 ppm is 1 mg per liter. The grams of available chlorine = gallons × 3.785 × (target − reading) ÷ 1,000, then divided by the strength on the label: 10.24 fl oz of 12.5% liquid per ppm per 10,000 gallons.',
  note: 'Strengths from the labels: cal-hypo at least 65% and dichlor 56% available chlorine (EPA-registered labels). Follow the label of your product.',
};

export const PUMP: DosePage = {
  path: '/pool-pump-size-calculator',
  title: 'Pool Pump Size Calculator: Flow in GPM | Pool Figures',
  description:
    'The pump flow your pool needs to turn its water over in 6 hours, as the residential pool standard asks, and in 8.',
  kicker: 'Pump size · free',
  h1: 'Pool pump size calculator',
  lead: 'Type your pool gallons. You get the flow, in gallons a minute, that filters all the water in 6 hours.',
  fields: { gallons },
  results: [
    { key: 'flow', label: 'Pump flow for a 6-hour turnover', unit: 'GPM' },
    { key: 'eightHour', label: 'Gentler 8-hour turnover', unit: 'gpm' },
  ],
  method:
    'Flow = gallons ÷ 360 minutes, never below 36 gpm: the residential filtration rate of ANSI/APSP/ICC-15, which the 2021 ISPSC references.',
  note: 'Size the pipes for that flow too: the standard keeps water under 8 ft per second in the return and 6 in the suction.',
};

export const PH: DosePage = {
  path: '/pool-ph-calculator',
  title: 'Pool pH Calculator: How Much Muriatic Acid? | Pool Figures',
  description:
    'How much muriatic acid lowers your pool’s pH, or soda ash raises it, from the drops of the acid or base demand test of a Taylor kit.',
  kicker: 'pH · free',
  h1: 'Pool pH calculator',
  lead: 'Run the acid demand test of your kit to lower pH, or the base demand test to raise it, and count the drops it takes. Type your pool gallons and those drops. You get the muriatic acid or soda ash to add.',
  fields: {
    gallons,
    product: {
      label: 'What you need',
      options: {
        'muriatic-31-45': 'Lower pH: muriatic acid, 31.45%',
        'soda-ash': 'Raise pH: soda ash',
      },
    },
    drops: { label: 'Drops of demand reagent' },
  },
  results: [
    {
      key: 'liquid',
      label: 'Muriatic acid to add',
      unit: 'FL OZ',
      forms: ['muriatic-31-45'],
    },
    { key: 'dry', label: 'Soda ash to add', unit: 'OZ BY WEIGHT', forms: ['soda-ash'] },
  ],
  warnings: {
    pastChart:
      'Taylor’s chart stops at 3 drops. Add no more than the 3-drop dose at a time, let the pump run, then test again before you add the rest.',
  },
  method:
    'From Taylor Technologies’ pH dosage chart: each drop of acid demand reagent is 9.16 fl oz of muriatic acid per 10,000 gallons, and each drop of base demand reagent is 5.13 oz of soda ash. Dose = gallons ÷ 10,000 × drops × that amount. The test runs on your own water, so its alkalinity is already in the count. The result is approximate.',
  note: 'The acid dose is for muriatic acid of 31.45% (20° Baumé); for another strength, follow the label of your product. Add acid to water, never water to acid: pour it slowly into the deep end with the pump running, wearing gloves and eye protection, and never mix it with chlorine. Test the pH again after the wait time on the label.',
};

/** The CDC's Model Aquatic Health Code, the one source of the public-pool limits these pages cite. */
const CODE = 'the CDC’s Model Aquatic Health Code';

export const ALKALINITY: DosePage = {
  path: '/pool-alkalinity-calculator',
  title: 'Pool Alkalinity Calculator: How Much Baking Soda? | Pool Figures',
  description:
    'How many pounds of sodium bicarbonate (baking soda) raise your pool’s total alkalinity from its reading to the target, 100 ppm by default.',
  kicker: 'Alkalinity · free',
  h1: 'Pool alkalinity calculator',
  lead: 'Type your pool gallons, today’s total alkalinity and the level you want. You get the pounds of baking soda to add.',
  fields: {
    gallons,
    current: { label: 'Alkalinity now (ppm)' },
    target: { label: 'Target (ppm)' },
  },
  results: [
    { key: 'pounds', label: 'Baking soda to add', unit: 'LB' },
    { key: 'ounces', label: 'Ounces', unit: 'oz' },
  ],
  warnings: {
    acidToLower:
      'Your alkalinity is over the target. Baking soda only raises it: lowering alkalinity takes acid, which this calculator does not dose.',
  },
  method:
    'Total alkalinity is read as calcium carbonate, so 1 ppm of it takes 84.007 ÷ 50.04 = 1.6788 mg per liter of sodium bicarbonate. Milligrams = gallons × 3.785 × (target − reading) × 1.6788: 1.4 lb per 10 ppm per 10,000 gallons.',
  note: `Use pure sodium bicarbonate, which is baking soda: check that the label of an alkalinity increaser says so. For public pools, ${CODE} keeps total alkalinity at 60 to 180 ppm.`,
};

export const STABILIZER: DosePage = {
  path: '/pool-stabilizer-calculator',
  title: 'Pool Stabilizer Calculator: Cyanuric Acid Dose | Pool Figures',
  description:
    'How many pounds and ounces of cyanuric acid (stabilizer or conditioner) raise your pool’s CYA from its reading to the target.',
  kicker: 'Stabilizer · free',
  h1: 'Pool stabilizer calculator',
  lead: 'Type your pool gallons, today’s cyanuric acid (CYA) reading and the level you want. You get the pounds of stabilizer to add.',
  fields: { gallons, current: { label: 'CYA now (ppm)' }, target: { label: 'Target (ppm)' } },
  results: [
    { key: 'pounds', label: 'Stabilizer to add', unit: 'LB' },
    { key: 'ounces', label: 'Ounces', unit: 'oz' },
  ],
  warnings: {
    drainToLower:
      'Your CYA is over the target. Cyanuric acid does not wear off: the only way to lower it is to drain part of the water and refill.',
    overCodeLimit: `Your target is over 90 ppm, the most ${CODE} allows in a public pool.`,
  },
  method: `1 ppm is 1 mg per liter, so the grams of cyanuric acid = gallons × 3.785 × (target − reading) ÷ 1,000: 13.35 oz per 10 ppm per 10,000 gallons. For public pools, ${CODE} keeps CYA at or below 90 ppm.`,
  note: 'The dose is for a product of 100% cyanuric acid. Read the label of yours: for a liquid or blended stabilizer, divide the dose by its percent and multiply by 100. Dichlor and trichlor add CYA too.',
};

export const HEATER: DosePage = {
  path: '/pool-heater-size-calculator',
  title: 'Pool Heater Size Calculator: BTU per Hour | Pool Figures',
  description:
    'The BTU per hour a heater must put out to warm your pool by the degrees you want in the hours you give it, from the weight of the water.',
  kicker: 'Heater size · free',
  h1: 'Pool heater size calculator',
  lead: 'Type your pool gallons, how many degrees to warm it and in how many hours. You get the BTU per hour a heater must put out.',
  fields: {
    gallons,
    rise: { label: 'Temperature rise (°F)' },
    hours: { label: 'Hours to heat' },
  },
  results: [
    { key: 'btuPerHour', label: 'Heater output', unit: 'BTU/H' },
    { key: 'btu', label: 'Heat to warm the water', unit: 'BTU' },
  ],
  method:
    'One BTU warms 1 lb of water by 1 °F, and a gallon of water weighs about 8.34 lb. BTU = gallons × 8.34 × rise, and BTU per hour = that heat ÷ the hours: 20,000 gallons warmed 10 °F take 1,668,000 BTU, 69,500 an hour over 24 hours.',
  note: 'That is the heat the water holds, with nothing lost. Wind, evaporation and cool nights take heat away while it warms, so a real heater is sized larger, and a cover keeps more of it in. The U.S. Department of Energy sizes a gas heater by surface area: square feet × (pool temperature − average air temperature of the coldest month) × 12 BTU per hour, for a rise of 1 to 1¼ °F an hour in a 3½ mph wind.',
};

export const FILL_TIME: DosePage = {
  path: '/pool-fill-time-calculator',
  title: 'Pool Fill Time Calculator: How Long to Fill a Pool | Pool Figures',
  description:
    'How many hours and minutes a hose takes to fill your pool, from its gallons and the flow in gallons a minute.',
  kicker: 'Fill time · free',
  h1: 'Pool fill time calculator',
  lead: 'Type your pool gallons and the flow of your hose in gallons a minute. You get the hours and minutes it takes to fill.',
  fields: { gallons, flow: { label: 'Flow (gallons a minute)' } },
  results: [
    { key: 'time', label: 'Time to fill', unit: 'HOURS AND MINUTES' },
    { key: 'minutes', label: 'In minutes', unit: 'min' },
  ],
  method:
    'Minutes = gallons ÷ gallons a minute, and hours = minutes ÷ 60: 20,000 gallons at 10 gallons a minute take 2,000 minutes, 33 h 20 min.',
  note: 'Measure your own flow: time in seconds how long a 5-gallon bucket takes to fill at the hose, then gallons a minute = 300 ÷ those seconds (30 seconds is 10 gallons a minute). The 10 gallons a minute already filled in is only a starting figure.',
};
