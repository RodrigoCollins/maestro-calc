import { STRIP, type Pad } from './strip.ts';

/** One result row of a dose page: the output, its label, its unit and the product forms it shows for. */
export interface ResultRow {
  readonly key: string;
  readonly label: string;
  readonly unit: string;
  readonly forms?: readonly string[];
  /** The unit, and the label when it changes, of the row when the units choice is metric. */
  readonly metricUnit?: string;
  readonly metricLabel?: string;
  /** A row under the large figure of its forms (a label's most per addition), not a figure of its own. */
  readonly detail?: true;
  /** The output in its larger unit (`format.ts`): pounds or gallons, kilograms or millilitres. */
  readonly as?: 'large';
}

export interface DosePage {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly fields: Readonly<
    Record<
      string,
      {
        readonly label: string;
        /** The label of the field when the units choice is metric. */
        readonly metric?: string;
        readonly options?: Readonly<Record<string, string>>;
      }
    >
  >;
  readonly results: readonly ResultRow[];
  readonly bags?: string;
  /** The bags line in metric: the engine counts 20 kg bags there. */
  readonly metricBags?: string;
  /** The test strip picker that sets the reading of `field` (strip.ts). */
  readonly strip?: {
    readonly field: string;
    readonly legend: string;
    readonly note: string;
    readonly pads: readonly Pad[];
  };
  readonly warnings?: Readonly<Record<string, string>>;
  readonly method: string;
  /**
   * The method in litres, for a page with the units choice: the dose page shows it after `method`,
   * and the gallon job pages, which quote `method` and `note`, leave it out.
   */
  readonly metricMethod?: string;
  readonly note: string;
  /** The section of the methodology with its hand-worked cases (the Spanish pages link it). */
  readonly methodLink?: { readonly href: string; readonly label: string };
}

const gallons = { label: 'Pool volume (gallons)' };
/** The volume of a calculator with the units choice: litres in metric. */
const volume = { ...gallons, metric: 'Pool volume (litres)' };
/** The units choice, the last input of those calculators (`@maestro-calc/pool-core/units`). */
const units = {
  label: 'Units',
  options: { us: 'US: gallons, pounds', metric: 'Metric: litres, kilograms' },
};

export const SALT: DosePage = {
  path: '/pool-salt-calculator',
  title: 'Pool Salt Calculator: How Many Pounds and Bags | Pool Figures',
  description:
    'How many pounds and 40 lb bags, or kilograms and 20 kg bags, of salt raise your pool to the target, with a table by pool size and when to swim and retest.',
  kicker: 'Saltwater pools · free',
  h1: 'Pool salt calculator',
  lead: 'Choose US or metric units, then type your pool volume, today’s salt reading and the level your cell asks for. You get the pounds or kilograms, and the bags.',
  fields: {
    gallons: volume,
    current: { label: 'Salt now (ppm)' },
    target: { label: 'Target (ppm)' },
    units,
  },
  results: [
    { key: 'pounds', label: 'Salt to add', unit: 'LB', metricUnit: 'KG' },
    { key: 'kilograms', label: 'Kilograms', unit: 'kg', metricUnit: 'lb', metricLabel: 'Pounds' },
    {
      key: 'firstAddition',
      label: 'Add this first, then test after 24 hours',
      unit: 'lb',
      metricUnit: 'kg',
    },
  ],
  bags: 'bags of 40 lb',
  metricBags: 'bags of 20 kg',
  warnings: {
    drainToLower:
      'Your salt is over the target. Salt does not wear off: the only way to lower it is to drain part of the water and refill.',
  },
  method:
    'Pounds = gallons × (target − reading) × 8.34 ÷ 1,000,000, since a gallon of water weighs about 8.34 lb. Hayward’s AquaRite manual gives 2,700 to 3,400 ppm, 3,200 the best.',
  metricMethod:
    'In metric, 1 ppm is 1 mg per litre: kilograms = litres × (target − reading) ÷ 1,000,000, the 4 kg per 1,000 L at 4,000 ppm of AstralPool’s VX manual, whose cells and Zodiac’s TRi-XO run at 4,000 ppm. Where pool salt comes in 25 kg bags, divide the kilograms by 25.',
  note: 'Use pool salt over 99% sodium chloride. Wait 10 to 14 days before adding salt to new plaster.',
};

export const CHLORINE: DosePage = {
  path: '/pool-chlorine-calculator',
  title: 'Pool Chlorine Calculator: How Much Chlorine to Add | Pool Figures',
  description:
    'How much liquid chlorine, cal-hypo or dichlor raises your free chlorine to the target or shocks the pool, with a dose table by pool size and when to swim.',
  kicker: 'Chlorine · free',
  h1: 'Pool chlorine calculator',
  lead: 'Type your pool volume, in gallons or litres, today’s free chlorine and the level you want. You get the dose of the product you have.',
  fields: {
    gallons: volume,
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
    units,
  },
  results: [
    {
      key: 'liquid',
      label: 'Liquid chlorine to add',
      unit: 'FL OZ',
      metricUnit: 'LITRES',
      forms: ['liquid-12-5', 'liquid-10'],
    },
    {
      key: 'dry',
      label: 'Granular product to add',
      unit: 'OZ BY WEIGHT',
      metricUnit: 'GRAMS',
      forms: ['cal-hypo-65', 'dichlor-56'],
    },
    {
      key: 'liquid',
      as: 'large',
      label: 'In gallons',
      unit: 'gal',
      metricLabel: 'In millilitres',
      metricUnit: 'mL',
      forms: ['liquid-12-5', 'liquid-10'],
      detail: true,
    },
    {
      key: 'dry',
      as: 'large',
      label: 'In pounds',
      unit: 'lb',
      metricLabel: 'In kilograms',
      metricUnit: 'kg',
      forms: ['cal-hypo-65', 'dichlor-56'],
      detail: true,
    },
    {
      key: 'cya',
      label: 'Stabilizer (CYA) it adds',
      unit: 'ppm',
      forms: ['dichlor-56'],
      detail: true,
    },
    {
      key: 'hardness',
      label: 'Calcium hardness it adds',
      unit: 'ppm',
      forms: ['cal-hypo-65'],
      detail: true,
    },
  ],
  strip: { field: 'current', ...STRIP },
  method:
    '1 ppm is 1 mg per liter. The grams of available chlorine = gallons × 3.785 × (target − reading) ÷ 1,000, then divided by the strength on the label: 10.24 fl oz of 12.5% liquid per ppm per 10,000 gallons.',
  metricMethod: 'In metric the litres go in as they are: 8 mL of 12.5% liquid per ppm per 1,000 L.',
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
  title: 'Pool pH Calculator: How Much pH Up or Down to Add | Pool Figures',
  description:
    'How much muriatic acid or dry acid lowers your pool’s pH, or soda ash raises it, in oz and lb, from the drops of your test kit’s demand test.',
  kicker: 'pH · free',
  h1: 'Pool pH calculator',
  lead: 'Run the acid demand test of your kit to lower pH, or the base demand test to raise it, and count the drops it takes. Type your pool volume, in gallons or litres, and those drops. You get the muriatic acid, dry acid or soda ash to add, in ounces and pounds.',
  fields: {
    gallons: volume,
    product: {
      label: 'What you need',
      options: {
        'muriatic-31-45': 'Lower pH: muriatic acid, 31.45%',
        'soda-ash': 'Raise pH: soda ash',
        'dry-acid': 'Lower pH: dry acid (sodium bisulfate)',
      },
    },
    drops: { label: 'Drops of demand reagent' },
    units,
  },
  results: [
    {
      key: 'liquid',
      label: 'Muriatic acid to add',
      unit: 'FL OZ',
      metricUnit: 'LITRES',
      forms: ['muriatic-31-45'],
    },
    {
      key: 'dry',
      label: 'Soda ash to add',
      unit: 'OZ BY WEIGHT',
      metricUnit: 'GRAMS',
      forms: ['soda-ash'],
    },
    {
      key: 'dry',
      label: 'Dry acid to add',
      unit: 'OZ BY WEIGHT',
      metricUnit: 'GRAMS',
      forms: ['dry-acid'],
    },
    {
      key: 'liquid',
      as: 'large',
      label: 'In gallons',
      unit: 'gal',
      metricLabel: 'In millilitres',
      metricUnit: 'mL',
      forms: ['muriatic-31-45'],
      detail: true,
    },
    {
      key: 'dry',
      as: 'large',
      label: 'In pounds',
      unit: 'lb',
      metricLabel: 'In kilograms',
      metricUnit: 'kg',
      forms: ['soda-ash', 'dry-acid'],
      detail: true,
    },
    {
      key: 'liquidPerDay',
      label: 'Most to add in 24 hours',
      unit: 'fl oz',
      metricUnit: 'L',
      forms: ['muriatic-31-45'],
      detail: true,
    },
    { key: 'days', label: 'Days it takes', unit: '', forms: ['muriatic-31-45'], detail: true },
    {
      key: 'dryPerAddition',
      label: 'Most to add at a time',
      unit: 'oz',
      metricUnit: 'g',
      forms: ['soda-ash', 'dry-acid'],
      detail: true,
    },
    {
      key: 'additions',
      label: 'Additions, 2 to 3 hours apart',
      unit: '',
      forms: ['soda-ash'],
      detail: true,
    },
    {
      key: 'additions',
      label: 'Additions, 2 hours apart',
      unit: '',
      forms: ['dry-acid'],
      detail: true,
    },
  ],
  warnings: {
    pastChart:
      'Taylor’s chart stops at 3 drops. Add no more than the 3-drop dose at a time, let the pump run, then test again before you add the rest.',
    splitDays:
      'That is more than the label adds in one day, so split it: add at most the amount above, run the pump, test the pH again after 24 hours, and add the rest the same way.',
    splitAdditions:
      'That is more than the label adds at a time, so split it: add at most the amount above, let the water circulate (2 hours for dry acid, 2 to 3 hours for soda ash), test the pH again, and add the rest the same way.',
  },
  method:
    'From Taylor Technologies’ pH dosage chart: each drop of acid demand reagent is 9.16 fl oz of muriatic acid per 10,000 gallons, each drop of base demand reagent is 5.13 oz of soda ash, and each drop of acid demand reagent is 12.32 oz of dry acid. Dose = gallons ÷ 10,000 × drops × that amount. The test runs on your own water, so its alkalinity is already in the count. The result is approximate. HASA’s muriatic acid label adds at most one quart per 20,000 gallons in 24 hours, gallons × 32 ÷ 20,000 fl oz a day, and repeats it 24 hours apart; the pH Up soda ash label adds at most 1 lb per 10,000 gallons at a time, then lets the water circulate 2 to 3 hours; the pH Down dry acid label at most 1.5 lb per 10,000 gallons at any one time, then 2 hours. Days or additions = the dose ÷ that most, rounded up.',
  metricMethod:
    'In metric the litres are read as gallons, 3.785 L each, since the chart and the labels are written per gallon.',
  note: 'The acid dose is for muriatic acid of 31.45% (20° Baumé) and dry acid of 93.2% sodium bisulfate; for another strength, follow the label of your product. Add acid to water, never water to acid: pour it slowly into the deep end with the pump running, wearing gloves and eye protection, and never mix it with chlorine. Test the pH again after the wait time on the label.',
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
  lead: 'Type your pool volume, in gallons or litres, today’s total alkalinity and the level you want. You get the pounds of baking soda to add.',
  fields: {
    gallons: volume,
    current: { label: 'Alkalinity now (ppm)' },
    target: { label: 'Target (ppm)' },
    units,
  },
  results: [
    { key: 'pounds', label: 'Baking soda to add', unit: 'LB', metricUnit: 'KG' },
    { key: 'ounces', label: 'Ounces', unit: 'oz', metricUnit: 'g', metricLabel: 'Grams' },
  ],
  warnings: {
    acidToLower:
      'Your alkalinity is over the target. Baking soda only raises it: lowering alkalinity takes acid, which this calculator does not dose.',
  },
  method:
    'Total alkalinity is read as calcium carbonate, so 1 ppm of it takes 84.007 ÷ 50.04 = 1.6788 mg per liter of sodium bicarbonate. Milligrams = gallons × 3.785 × (target − reading) × 1.6788: 1.4 lb per 10 ppm per 10,000 gallons.',
  metricMethod: 'In metric: 16.8 g of baking soda per 10 ppm per 1,000 L.',
  note: `Use pure sodium bicarbonate, which is baking soda: check that the label of an alkalinity increaser says so. For public pools, ${CODE} keeps total alkalinity at 60 to 180 ppm.`,
};

export const STABILIZER: DosePage = {
  path: '/pool-stabilizer-calculator',
  title: 'Pool Stabilizer Calculator: Cyanuric Acid Dose | Pool Figures',
  description:
    'How many pounds and ounces of cyanuric acid (stabilizer or conditioner) raise your pool’s CYA from its reading to the target.',
  kicker: 'Stabilizer · free',
  h1: 'Pool stabilizer calculator',
  lead: 'Type your pool volume, in gallons or litres, today’s cyanuric acid (CYA) reading and the level you want. You get the pounds of stabilizer to add.',
  fields: {
    gallons: volume,
    current: { label: 'CYA now (ppm)' },
    target: { label: 'Target (ppm)' },
    units,
  },
  results: [
    { key: 'pounds', label: 'Stabilizer to add', unit: 'LB', metricUnit: 'KG' },
    { key: 'ounces', label: 'Ounces', unit: 'oz', metricUnit: 'g', metricLabel: 'Grams' },
  ],
  warnings: {
    drainToLower:
      'Your CYA is over the target. Cyanuric acid does not wear off: the only way to lower it is to drain part of the water and refill.',
    overCodeLimit: `Your target is over 90 ppm, the most ${CODE} allows in a public pool.`,
  },
  method: `1 ppm is 1 mg per liter, so the grams of cyanuric acid = gallons × 3.785 × (target − reading) ÷ 1,000: 13.35 oz per 10 ppm per 10,000 gallons. For public pools, ${CODE} keeps CYA at or below 90 ppm.`,
  metricMethod: 'In metric: 10 g of cyanuric acid per 10 ppm per 1,000 L.',
  note: 'The dose is for a product of 100% cyanuric acid. Read the label of yours: for a liquid or blended stabilizer, divide the dose by its percent and multiply by 100. Dichlor and trichlor add CYA too.',
};

export const CALCIUM: DosePage = {
  path: '/pool-calcium-hardness-calculator',
  title: 'Calcium Hardness Calculator: Calcium Chloride Dose | Pool Figures',
  description:
    'How many pounds of calcium chloride raise your pool’s calcium hardness from its reading to the target, at the dose of an increaser label.',
  kicker: 'Calcium hardness · free',
  h1: 'Pool calcium hardness calculator',
  lead: 'Type your pool volume, in gallons or litres, today’s calcium hardness and the level you want. You get the pounds of calcium chloride to add, and how much of it to add first.',
  fields: {
    gallons: volume,
    current: { label: 'Calcium hardness now (ppm)' },
    target: { label: 'Target (ppm)' },
    units,
  },
  results: [
    { key: 'pounds', label: 'Calcium chloride to add', unit: 'LB', metricUnit: 'KG' },
    { key: 'ounces', label: 'Ounces', unit: 'oz', metricUnit: 'g', metricLabel: 'Grams' },
    {
      key: 'firstAddition',
      label: 'Add this first, then wait 12 hours',
      unit: 'lb',
      metricUnit: 'kg',
    },
  ],
  warnings: {
    dilutionToLower:
      'Your calcium hardness is over the target. Calcium does not wear off and no product takes it out: the only way to lower it is to drain part of the water and refill with softer water.',
    splitDose:
      'That is more than 3 lb per 10,000 gallons, so the label splits it: add the first amount, let the pump run at least 12 hours, test again, then add the rest the same way.',
  },
  method:
    'From the label of a calcium hardness increaser (ClearView, Oreq Corporation): 2 oz of calcium chloride flake per 1,000 gallons raises calcium hardness 10 ppm, which is 1.25 lb per 10 ppm per 10,000 gallons. Pounds = gallons × (target − reading) ÷ 80,000. Checked against the chemistry: 10 ppm as calcium carbonate in 10,000 gallons takes 0.925 lb of pure calcium chloride, 1.25 lb of a 74% flake.',
  metricMethod:
    'In metric the litres are read as gallons, 3.785 L each, since the label is written per gallon.',
  note: `Hayward’s AquaRite manual keeps calcium hardness at 200 to 400 ppm; for public pools, ${CODE} caps it at 2,500 ppm. The dose is for calcium chloride flake, the usual calcium hardness increaser; an anhydrous product (94% or more) is stronger, so follow the label of yours. Dissolve it first, about ½ lb to a gallon of water, and pour it into the deep end with the pump running.`,
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
