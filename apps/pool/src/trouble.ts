import { CHEMISTRY_CHART } from './chemistry.ts';
import { doseOf } from './dosing.ts';
import { CALCIUM, CHLORINE, PH, PUMP } from './doses.ts';
import type { GuideSource, GuideStep, StepGuide } from './guide.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/*
 * The three water trouble guides: how to fix a green pool, why a pool is cloudy and how to clear
 * it, and how often to shock. The causes and the fixes are Taylor's trouble prevention chart, the
 * shock and the algae directions are the EPA-registered labels', the clarity rule is the CDC's
 * code; every dose is the chlorine or the pH calculator's own, run at build time. `guide.ts` lists
 * these guides, so this module imports no value of it (the guide paths it links are written out).
 */

type Product = 'liquid-12-5' | 'cal-hypo-65' | 'dichlor-56';

/** The chlorine calculator's dose for `gallons` from `current` to `target` ppm: fl oz or oz. */
const chlorine = (gallons: number, current: number, target: number, product: Product): string =>
  doseOf(
    CHLORINE.path,
    { gallons: String(gallons), current: String(current), target: String(target), product },
    product === 'liquid-12-5' ? 'liquid' : 'dry',
  );

/** A figure of fluid ounces in gallons of the jug (128 fl oz), to a tenth: `614.4` is `4.8`. */
const jugs = (flOz: string): string => (Number(flOz) / 128).toFixed(1);

/** A figure of ounces in pounds (16 oz), to a tenth: `123.3` is `7.7`. */
const pounds = (oz: string): string => (Number(oz) / 16).toFixed(1);

/** Thousands grouped as the calculators print them: `20000` is `20,000`. */
const grouped = (gallons: number): string => gallons.toLocaleString('en-US');

const SIZES = [10_000, 15_000, 20_000, 30_000] as const;

/** One shock of `gallons` from 0 ppm to `target`, in liquid, cal-hypo and dichlor. */
const shockOf = (gallons: number, target: number) => {
  const liquid = chlorine(gallons, 0, target, 'liquid-12-5');
  const calHypo = chlorine(gallons, 0, target, 'cal-hypo-65');
  return {
    gallons: grouped(gallons),
    liquid,
    liquidGallons: jugs(liquid),
    calHypo,
    calHypoPounds: pounds(calHypo),
    dichlor: chlorine(gallons, 0, target, 'dichlor-56'),
  };
};

const LITRES = [20_000, 30_000, 40_000, 50_000, 60_000, 80_000] as const;

/** The 30 ppm shock of `litres` from 0 ppm, as the metric chlorine calculator writes it. */
const metricShockOf = (litres: number): readonly string[] => {
  const raw = { gallons: String(litres), current: '0', target: '30' };
  return [
    `${grouped(litres)} L`,
    `${doseOf(CHLORINE.path, { ...raw, product: 'liquid-12-5' }, 'liquid', 'metric')} L`,
    `${doseOf(CHLORINE.path, { ...raw, product: 'cal-hypo-65' }, 'dry', 'metric')} g`,
  ];
};

/** The figures both languages write, worked out once (`trouble-es.ts` writes the same). */
export const FIGURES = {
  algae: SIZES.map((gallons) => shockOf(gallons, 30)),
  algae20: shockOf(20_000, 30),
  algaeMetric: LITRES.map(metricShockOf),
  shock10: shockOf(10_000, 10),
  weekly: SIZES.map((gallons) => shockOf(gallons, 10)),
  cloudy: [10_000, 20_000].map((gallons) => ({
    gallons: grouped(gallons),
    liquid: chlorine(gallons, 1, 10, 'liquid-12-5'),
    calHypo: chlorine(gallons, 1, 10, 'cal-hypo-65'),
  })),
  acid: doseOf(PH.path, { gallons: '10000', product: 'muriatic-31-45', drops: '1' }, 'liquid'),
  perPpm: chlorine(10_000, 0, 1, 'cal-hypo-65'),
  breakpoint: {
    liquid: chlorine(20_000, 2, 7, 'liquid-12-5'),
    calHypo: chlorine(20_000, 2, 7, 'cal-hypo-65'),
  },
} as const;

const { algae, algae20, shock10, weekly, cloudy, acid, perPpm, breakpoint } = FIGURES;

/** The 30 ppm doses of every size, as one sentence of the guide writes them. */
const algaeList = algae
  .map(
    ({ gallons, liquid, liquidGallons, calHypo, calHypoPounds }) =>
      `${gallons} gallons, ${liquid} fl oz (${liquidGallons} gallons) of liquid or ${calHypo} oz (${calHypoPounds} lb) of cal-hypo`,
  )
  .join('; ');

// The guides this module links, by path: `guide.ts` lists these guides (`trouble.test.ts`).
const SHOCK_PATH = '/how-to-shock-a-pool';
const SWIM_PATH = '/how-long-after-adding-chemicals-can-you-swim';
const PH_GUIDE_PATH = '/how-to-lower-ph-in-a-pool';
const PUMP_GUIDE_PATH = '/how-long-to-run-pool-pump';
const GREEN_PATH = '/how-to-fix-a-green-pool';
const CLOUDY_PATH = '/why-is-my-pool-cloudy';
const SHOCK_OFTEN_PATH = '/how-often-to-shock-a-pool';

const gallonsLink = { href: VOLUME_TEXTS.path, label: 'Work out your gallons' } as const;

/** Every source the three guides cite, each under one name (`trouble.test.ts`). */
const SOURCES = {
  taylor: {
    name: 'Taylor Technologies, K-1003 test kit instructions (Instr. #5816): recommended ranges, trouble prevention chart and chlorine dosage chart',
    url: 'https://www.novatech-usa.com/pdf/Taylor%20K-1003%20Instruction%20Manual.pdf',
  },
  calHypo: {
    name: 'Clor Mor Calcium Hypochlorite Granules label, EPA Reg. No. 69681-6 (accepted September 18, 2014)',
    url: 'https://www3.epa.gov/pesticides/chem_search/ppls/069681-00006-20140918.pdf',
  },
  liquid: {
    name: 'B’s Pool Supply Sodium Hypochlorite Solution (12.5%) label, EPA Reg. No. 55487-20001 (accepted November 16, 2017)',
    url: 'https://www3.epa.gov/pesticides/chem_search/ppls/055487-20001-20171116.pdf',
  },
  dichlor: {
    name: 'Nu-Clo Concentrated Pool Chlorinating Granules (dichlor) label, EPA Reg. No. 7124-31 (accepted January 5, 2012)',
    url: 'https://www3.epa.gov/pesticides/chem_search/ppls/007124-00031-20120105.pdf',
  },
  cdc: {
    name: 'CDC: Home Pool and Hot Tub Water Treatment and Testing',
    url: 'https://www.cdc.gov/healthy-swimming/about/home-pool-and-hot-tub-water-treatment-and-testing.html',
  },
  mahc: {
    name: 'CDC, 2024 Model Aquatic Health Code, 5th Edition: 2.0 Glossary (Superchlorination), 5.7.4.4 and 5.7.6 Water Clarity',
    url: 'https://www.cdc.gov/model-aquatic-health-code/media/pdfs/2024/11/5th-Ed-MAHC-Code-508.pdf',
  },
  hayward: {
    name: 'Hayward: Opening Your Pool',
    url: 'https://www.hayward.com/maintenance/opening-your-pool',
  },
  haywardPump: {
    name: 'Hayward VS Omni pump owner’s manual, 092708 Rev B: Energy Efficiency Overview',
    url: 'https://hayward.com/media/akeneo_connector/asset_files/0/9/092708_RevB_9fbf.pdf',
  },
  hasaSds: {
    name: 'HASA Muriatic Acid Safety Data Sheet, section 7: handling',
    url: 'https://hasa.com/hubfs/Safety%20Data%20Sheets/SDS%20-%20Safety%20Data%20Sheets/HASA%20Muriatic%20Acid_2026.pdf',
  },
  clearView: {
    name: 'ClearView Calcium Increaser, Critical Usage Information (Oreq Corporation): directions',
    url: 'https://cdn.shopify.com/s/files/1/0100/9998/2432/files/Calcium_Increaser.pdf',
  },
} as const satisfies Record<string, GuideSource>;

const pick = <const K extends keyof typeof SOURCES>(...keys: K[]): Pick<typeof SOURCES, K> =>
  Object.fromEntries(keys.map((key) => [key, SOURCES[key]])) as Pick<typeof SOURCES, K>;

const GREEN_SOURCES = pick('taylor', 'calHypo', 'liquid', 'hayward', 'hasaSds', 'mahc');

/** From the gallons to the clear water: Taylor's chart, sized by the chlorine calculator. */
const GREEN_STEPS: readonly GuideStep[] = [
  {
    title: 'Know your gallons',
    text: 'Every shock dose depends on how much water the pool holds. Work it out once from the length, the width and the depth at each end, and keep the number.',
    link: gallonsLink,
  },
  {
    title: 'Test the free chlorine and the pH',
    text: 'Taylor’s kit keeps chlorine at 2.0 to 4.0 ppm and the pH at 7.2 to 7.8, tested daily. Too little chlorine, it says, means inadequate sanitation and bacteria and algae growth.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
    sources: ['taylor'],
  },
  {
    title: 'Rule out metals first',
    text: 'Not every green is algae. Taylor’s trouble chart reads blue-green water as copper, red-brown water as iron and purple-black water as manganese, and for each it says: “Seek expert advice on source of metals & treatment solution.” Algae comes with green, slippery walls and cloudy or green water.',
    sources: ['taylor'],
  },
  {
    title: 'Balance the pH before you shock',
    text: 'Taylor’s chart treats algae by adjusting the pH to 7.2 to 7.8 first, and bringing total alkalinity into range before the pH. The cal-hypo label says to always adjust the pH to 7.2 to 7.6 before you add the product.',
    link: { href: PH.path, label: 'Work out the pH dose' },
    sources: ['taylor', 'calHypo'],
  },
  {
    title: 'Work out the shock to 30 ppm',
    text: `For algae, Taylor’s chart says to superchlorinate to 30 ppm, three times the 10 ppm a label shock reaches. From 0 ppm the chlorine calculator gives, for 12.5% liquid chlorine or 65% cal-hypo: ${algaeList}. A reading above 0 takes less: enter your own.`,
    link: { href: CHLORINE.path, label: 'Work out the shock dose' },
    sources: ['taylor'],
  },
  {
    title: 'Add it as the label says, in parts',
    text: 'The cal-hypo label shocks with 10 to 20 oz per 10,000 gallons for 5 to 10 ppm, and the liquid chlorine label with 52 to 104 fl oz per 10,000 gallons, each every 7 days or as necessary. For algae, the cal-hypo label follows its shock directions and adds the product as close as possible to any algae on the sides or bottom of the pool, repeating the treatment if necessary. Add it in the evening, with the pump running, and test between parts.',
    sources: ['calHypo', 'liquid'],
  },
  {
    title: 'Brush, vacuum and run the filter',
    text: 'To prevent staining or bleaching, the cal-hypo label says to thoroughly clean pool by brushing surface of algae growth, vacuum and cycle through filter, right after the treatment. Taylor brushes concrete with a stainless steel brush and a vinyl liner with a soft nylon brush. Hayward says you will likely need to backwash or clean the filter to remove sediment build-up.',
    sources: ['calHypo', 'taylor', 'hayward'],
  },
  {
    title: 'Never mix chemicals',
    text: 'Add the acid and the chlorine separately, never mixed. The cal-hypo label says not to pre-mix it, and warns that contamination may cause an explosion or the release of toxic gases. Mixing liquid chlorine with ammonia, acids or detergents releases chlorine gas, its label says, and HASA’s safety data sheet keeps muriatic acid away from chlorine bleaches.',
    sources: ['calHypo', 'liquid', 'hasaSds'],
  },
  {
    title: 'Swim only when it is clear and back down',
    text: 'Both labels prohibit swimming above 4 ppm of chlorine. The CDC’s code for public pools adds a rule worth keeping at home: the water must be clear enough that the bottom is visible (5.7.6.1). Superchlorination, the code says, is the large dose of chlorine that kills algae.',
    link: { href: SWIM_PATH, label: 'When to swim after a shock' },
    sources: ['calHypo', 'liquid', 'mahc'],
  },
  {
    title: 'Keep it from coming back',
    text: 'Test daily, keep chlorine at 2.0 to 4.0 ppm, and shock every 7 days or as necessary. For preventative algae control, the cal-hypo label uses an algaecide regularly, following its label; the CDC’s code allows one in a public pool only when it is EPA registered and used in strict compliance with its label.',
    link: { href: SHOCK_OFTEN_PATH, label: 'How often to shock a pool' },
    sources: ['taylor', 'calHypo', 'mahc'],
  },
];

/**
 * How to fix a green pool: metals ruled out, the pH balanced, then Taylor's 30 ppm superchlorination
 * sized by the chlorine calculator and added as the cal-hypo and liquid chlorine labels direct.
 */
export const GREEN_GUIDE = {
  path: GREEN_PATH,
  checked: '2026-11-08',
  kicker: 'Guide · green pool',
  card: {
    title: 'How to fix a green pool',
    summary: 'Rule out metals, balance the pH, then shock to 30 ppm and brush.',
  },
  title: 'How to Fix a Green Pool: Shock Dose by Gallons | Pool Figures',
  description:
    'Why a pool turns green and how to fix it: rule out copper and iron, balance the pH, shock to 30 ppm, brush and filter, with the dose in gallons or litres.',
  h1: 'How to fix a green pool',
  lead: `A green pool is algae, Taylor’s trouble chart says: adjust the pH to 7.2 to 7.8, superchlorinate to 30 ppm, brush the walls and the floor, and repeat if necessary. From 0 ppm, 20,000 gallons take ${algae20.liquid} fl oz (${algae20.liquidGallons} gallons) of 12.5% liquid chlorine or ${algae20.calHypo} oz of 65% cal-hypo to reach 30 ppm. Blue-green water without slimy walls can be copper instead, for which the chart says to seek expert advice.`,
  note: 'Follow the label of your own product where it differs from this guide: its strength, its shock dose and its reentry level all vary by product. Never mix two chemicals.',
  table: {
    caption: 'What a green pool tells you (ppm is parts per million)',
    region: 'Green pool causes and fixes',
    head: ['What you see', 'Cause', 'Test', 'Fix'],
    rows: [
      [
        'Green, slippery walls; cloudy or green water',
        'Algae',
        'Free chlorine under 2.0 ppm',
        'pH to 7.2 to 7.8, superchlorinate to 30 ppm, brush; repeat if necessary',
      ],
      [
        'Black spots or yellow powder on the shady side',
        'Algae',
        'Free chlorine under 2.0 ppm',
        'Brush, superchlorinate, then an algaecide',
      ],
      ['Hazy water, no sparkle', 'Early algae growth', 'Free chlorine', 'Superchlorinate or shock'],
      ['Blue-green water', 'Copper', 'A metals test', 'Seek expert advice'],
      ['Red-brown water', 'Iron', 'A metals test', 'Seek expert advice'],
    ],
    sources: ['taylor'],
  },
  moreTables: [
    {
      caption:
        'The 30 ppm shock in litres, from 0 ppm: liquid chlorine in litres, cal-hypo in grams',
      region: 'Green pool shock by litres',
      head: ['Pool', '12.5% liquid chlorine', '65% cal-hypo'],
      rows: FIGURES.algaeMetric,
      sources: ['taylor'],
    },
  ],
  sources: GREEN_SOURCES,
  steps: GREEN_STEPS,
} as const satisfies StepGuide;

const CLOUDY_SOURCES = pick(
  'taylor',
  'cdc',
  'calHypo',
  'hayward',
  'haywardPump',
  'clearView',
  'hasaSds',
  'mahc',
);

const [cloudy10, cloudy20] = cloudy;

/** From the reading to the clear water: one cause of Taylor's chart at a time. */
const CLOUDY_STEPS: readonly GuideStep[] = [
  {
    title: 'Know your gallons',
    text: 'Every dose that clears the water depends on how much water the pool holds. Work it out once from the length, the width and the depth at each end, and keep the number.',
    link: gallonsLink,
  },
  {
    title: 'Test chlorine, pH and alkalinity',
    text: 'Taylor’s kit keeps chlorine at 2.0 to 4.0 ppm, the pH at 7.2 to 7.8 and total alkalinity at 80 to 120 ppm; it tests chlorine and pH daily, alkalinity weekly. CDC tests chlorine and pH at least twice a day. The reading tells you which cause of the chart is yours.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
    sources: ['taylor', 'cdc'],
  },
  {
    title: 'Low chlorine: shock',
    text: `Hazy, cloudy water with no sparkle is early algae growth in Taylor’s chart, and the fix is to superchlorinate or shock. The cal-hypo label shocks to 5 to 10 ppm. From a reading of 1 ppm to 10, ${cloudy10?.gallons ?? ''} gallons take ${cloudy10?.liquid ?? ''} fl oz of 12.5% liquid chlorine or ${cloudy10?.calHypo ?? ''} oz of 65% cal-hypo, and ${cloudy20?.gallons ?? ''} gallons take ${cloudy20?.liquid ?? ''} fl oz or ${cloudy20?.calHypo ?? ''} oz.`,
    link: { href: CHLORINE.path, label: 'Work out the shock dose' },
    sources: ['taylor', 'calHypo'],
  },
  {
    title: 'High pH: lower it',
    text: `A pH that is too high brings scale deposits, cloudy water and poor sanitizer efficiency, Taylor says, and above 7.8 chlorine’s ability to disinfect is significantly reduced. Lower it to 7.2 to 7.8: each drop of the acid demand test is ${acid} fl oz of 31.45% muriatic acid per 10,000 gallons.`,
    link: { href: PH.path, label: 'Work out the muriatic acid' },
    sources: ['taylor'],
  },
  {
    title: 'High alkalinity: bring it down first',
    text: 'Above 120 ppm, Taylor’s chart lowers total alkalinity to 80 to 120 ppm, and it always brings the alkalinity into range before it adjusts the pH. To lower total alkalinity, Taylor adds dry acid or muriatic acid; an adjustment in total alkalinity can change the pH, it says, so test both again after each addition.',
    link: { href: PH_GUIDE_PATH, label: 'How to lower pool pH' },
    sources: ['taylor'],
  },
  {
    title: 'Water in range: check the filter',
    text: 'With the chemistry in range, the chart’s cause is poor filtration, and its fix: “Check filter for proper operation.” Hayward says you will likely need to backwash or clean the filter elements to remove sediment build-up, and its pump manual filters all the water in the pool at least once every 24 hours.',
    link: { href: PUMP_GUIDE_PATH, label: 'How long to run your pump' },
    sources: ['taylor', 'hayward', 'haywardPump'],
  },
  {
    title: 'A pump too small for the pool',
    text: 'If the pump cannot move all the water through the filter in a day, the filter cannot clear it. Work out the flow your gallons need from the turnover, and compare it with your pump.',
    link: { href: PUMP.path, label: 'Work out the pump flow' },
  },
  {
    title: 'Cloudy right after calcium',
    text: 'Calcium chloride added all at once can cloud the water. The ClearView label separates doses of more than 3 pounds per 10,000 gallons and applies them at least 12 hours apart, to let the water adjust and avoid clouding.',
    link: { href: CALCIUM.path, label: 'Work out the calcium chloride' },
    sources: ['clearView'],
  },
  {
    title: 'Never mix chemicals',
    text: 'Fix one cause at a time, add each product on its own, and never mix two products. The cal-hypo label says not to pre-mix it, and warns that contamination may cause an explosion or the release of toxic gases; HASA’s safety data sheet keeps muriatic acid away from chlorine bleaches.',
    sources: ['calHypo', 'hasaSds'],
  },
  {
    title: 'Swim when you can see the bottom',
    text: 'The CDC’s code closes a public pool unless the water is clear enough that the bottom is visible (5.7.6.1), from any point on the deck up to 30 feet away (5.7.6.2): a fair test at home, so a swimmer in trouble can be seen. After a shock, the label prohibits swimming above 4 ppm of chlorine.',
    link: { href: SWIM_PATH, label: 'When to swim after chemicals' },
    sources: ['mahc', 'calHypo'],
  },
  {
    title: 'Cloudy and green: algae',
    text: 'Green, slippery walls with cloudy or green water are algae in Taylor’s chart, and need the larger shock of a green pool, to 30 ppm.',
    link: { href: GREEN_PATH, label: 'How to fix a green pool' },
    sources: ['taylor'],
  },
];

/**
 * Why a pool is cloudy and how to clear it: the four causes of Taylor's trouble chart in the order
 * a test finds them, the filter run of Hayward, the calcium split of the ClearView label and the
 * clarity rule of the CDC's code.
 */
export const CLOUDY_GUIDE = {
  path: CLOUDY_PATH,
  checked: '2026-11-08',
  kicker: 'Guide · cloudy pool',
  card: {
    title: 'Why is my pool cloudy',
    summary: 'The four causes a test tells apart, and how to clear each one.',
  },
  title: 'Why Is My Pool Cloudy? How to Clear It | Pool Figures',
  description:
    'Why pool water turns cloudy and how to clear it: low chlorine, a high pH, high alkalinity or poor filtration, the reading of each and the fix.',
  h1: 'Why is my pool cloudy, and how do I clear it?',
  lead: `Cloudy pool water has four causes in Taylor’s trouble chart: early algae growth, poor filtration, a high pH or high total alkalinity. Test first: under 2.0 ppm of chlorine, shock (from 1 to 10 ppm, ${cloudy20?.gallons ?? ''} gallons take ${cloudy20?.liquid ?? ''} fl oz of 12.5% liquid chlorine); a pH over 7.8 or alkalinity over 120 ppm, lower them; with the water in range, check the filter. Do not swim until you can see the bottom.`,
  note: 'Follow the label of your own product where it differs from this guide, and add one chemical at a time, never two mixed together.',
  table: {
    caption: 'What makes a pool cloudy (ppm is parts per million)',
    region: 'Cloudy pool causes and fixes',
    head: ['Cause', 'Test reading', 'Fix'],
    rows: [
      ['Early algae growth', 'Free chlorine under 2.0 ppm', 'Superchlorinate or shock'],
      ['High pH', 'pH over 7.8', 'Lower the pH to 7.2 to 7.8'],
      [
        'High total alkalinity',
        'Total alkalinity over 120 ppm',
        'Lower it to 80 to 120 ppm, before the pH',
      ],
      [
        'Poor filtration',
        'Chlorine, pH and alkalinity in range',
        'Check the filter; backwash or clean it',
      ],
      [
        'Calcium added at once',
        'Over 3 lb per 10,000 gallons in one go',
        'Split it, 12 hours apart',
      ],
    ],
    sources: ['taylor', 'hayward', 'clearView'],
  },
  sources: CLOUDY_SOURCES,
  steps: CLOUDY_STEPS,
} as const satisfies StepGuide;

const SHOCK_OFTEN_SOURCES = pick(
  'calHypo',
  'liquid',
  'dichlor',
  'taylor',
  'cdc',
  'mahc',
  'hayward',
);

/** The weekly shock, the extra one and the reading that calls for it, each dose the calculator's. */
const SHOCK_OFTEN_STEPS: readonly GuideStep[] = [
  {
    title: 'Know your gallons',
    text: 'Every shock dose depends on how much water the pool holds. Work it out once from the length, the width and the depth at each end, and keep the number.',
    link: gallonsLink,
  },
  {
    title: 'Once a week',
    text: 'The cal-hypo label shocks every 7 days or as necessary, with 10 to 20 oz per 10,000 gallons for 5 to 10 ppm, and the liquid chlorine label super-chlorinates every 7 days or as necessary with 52 to 104 fl oz per 10,000 gallons. The dichlor label shocks every week in hot weather or after heavy rains, and less often in cool weather.',
    sources: ['calHypo', 'liquid', 'dichlor'],
  },
  {
    title: 'And again when the pool needs it',
    text: 'The cal-hypo label adds a shock after rain and heavy winds, a high number of swimmers, warmer water or more frequent use, and to correct visible algae, unpleasant odors and eye irritation.',
    sources: ['calHypo'],
  },
  {
    title: 'Test daily to know when',
    text: 'Taylor’s kit tests chlorine daily, or as bather load demands, and keeps it at 2.0 to 4.0 ppm; CDC tests chlorine and pH at least twice a day. Shock when the reading calls for it, not only on the day of the week.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
    sources: ['taylor', 'cdc'],
  },
  {
    title: 'Shock when combined chlorine builds up',
    text: `Chlorine that has done its work becomes combined chlorine, the chloramines behind the eye irritation and the smell. Taylor’s kit says to periodically superchlorinate to eliminate it: the breakpoint dosage equals 10 times the amount of combined chlorine. A 20,000-gallon pool reading 2 ppm free and 0.5 ppm combined goes up 5 ppm, to 7: ${breakpoint.liquid} fl oz of 12.5% liquid chlorine or ${breakpoint.calHypo} oz of 65% cal-hypo. The CDC’s code acts in a public pool once combined chlorine passes 0.4 ppm.`,
    link: { href: CHLORINE.path, label: 'Work out the breakpoint dose' },
    sources: ['taylor', 'mahc'],
  },
  {
    title: 'Work out one shock for your pool',
    text: `The table above is one shock from 0 to 10 ppm, the top of the label’s 5 to 10 ppm: ${shock10.calHypo} oz of 65% cal-hypo for 10,000 gallons, ${shock10.calHypoPounds} lb. The cal-hypo label adds that 2 oz per 10,000 gallons raises a reading by about 1 ppm, and the calculator gives ${perPpm} oz. From your own reading, the dose is smaller.`,
    link: { href: CHLORINE.path, label: 'Work out the shock dose' },
    sources: ['calHypo'],
  },
  {
    title: 'Shock in the evening, with the pump running',
    text: 'The cal-hypo label adds it during evening hours while the filter pump is running, broadcast over the deep end. Hayward waits to shock until the sun starts to go down.',
    link: { href: SHOCK_PATH, label: 'How to shock a pool, step by step' },
    sources: ['calHypo', 'hayward'],
  },
  {
    title: 'Never mix chemicals',
    text: 'The dichlor label says not to mix it with any other chemicals, and the cal-hypo label not to pre-mix it: contamination may cause an explosion or release toxic gases, both warn. Add one product, let the pump run, then the next: never mix them.',
    sources: ['dichlor', 'calHypo'],
  },
  {
    title: 'Swim once the reading is back down',
    text: 'The cal-hypo and the liquid chlorine labels prohibit swimming above 4 ppm, the dichlor label above 3 ppm. The labels give a reading, not a number of hours: the test decides, not the clock.',
    link: { href: SWIM_PATH, label: 'When to swim after a shock' },
    sources: ['calHypo', 'liquid', 'dichlor'],
  },
  {
    title: 'A green pool needs more',
    text: 'One weekly shock keeps algae from starting; it does not clear a green pool. For algae, Taylor’s chart superchlorinates to 30 ppm, three of these shocks.',
    link: { href: GREEN_PATH, label: 'How to fix a green pool' },
    sources: ['taylor'],
  },
];

/**
 * How often to shock a pool: the weekly schedule of the cal-hypo, liquid chlorine and dichlor
 * labels, the extra shocks the cal-hypo label calls for, and Taylor's breakpoint rule; the table of
 * one shock for 10,000 to 30,000 gallons and every dose of the steps are the chlorine calculator's.
 */
export const SHOCK_OFTEN_GUIDE = {
  path: SHOCK_OFTEN_PATH,
  checked: '2026-11-08',
  kicker: 'Guide · shock',
  card: {
    title: 'How often to shock a pool',
    summary: 'Once a week, and when rain, swimmers or algae call for it, with the dose.',
  },
  title: 'How Often to Shock a Pool, and How Much Shock | Pool Figures',
  description:
    'How often to shock a pool: once a week by the labels, and after rain, heavy use or algae, with one shock worked out for 10,000 to 30,000 gallons.',
  h1: 'How often should you shock a pool?',
  lead: `Shock a pool once a week, every 7 days, as the cal-hypo and liquid chlorine labels say, and again after rain and heavy winds, many swimmers or warmer water, and whenever you see algae or smell chlorine odors. One shock from 0 to 10 ppm is ${shock10.calHypo} oz of 65% cal-hypo or ${shock10.liquid} fl oz of 12.5% liquid chlorine per 10,000 gallons. Test daily: when combined chlorine builds up, shock to 10 times it.`,
  note: 'Follow the label of your own product where it differs from this guide: its strength, its schedule and its reentry level vary by product.',
  table: {
    caption: 'One shock, 0 to 10 ppm free chlorine (ppm is parts per million)',
    region: 'One shock by pool size',
    head: ['Pool', '12.5% liquid chlorine', '65% cal-hypo', '56% dichlor'],
    rows: weekly.map(({ gallons, liquid, liquidGallons, calHypo, calHypoPounds, dichlor }) => [
      `${gallons} gallons`,
      `${liquid} fl oz (${liquidGallons} gallons)`,
      `${calHypo} oz (${calHypoPounds} lb)`,
      `${dichlor} oz`,
    ]),
    sources: ['calHypo', 'liquid', 'dichlor'],
  },
  sources: SHOCK_OFTEN_SOURCES,
  steps: SHOCK_OFTEN_STEPS,
} as const satisfies StepGuide;
