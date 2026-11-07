import { CHEMISTRY_CHART } from './chemistry.ts';
import { DOSING_CHART, doseOf } from './dosing.ts';
import { VOLUME_CHART } from './volume/chart.ts';
import { ALKALINITY, CALCIUM, CHLORINE, FILL_TIME, HEATER, PH, PUMP, SALT } from './doses.ts';
import { SWIM_GUIDE } from './swim.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/** A source the guide cites, by the key each step names it with. */
export interface GuideSource {
  readonly name: string;
  readonly url: string;
}

export interface GuideStep {
  readonly title: string;
  readonly text: string;
  readonly link?: { readonly href: string; readonly label: string };
  readonly sources?: readonly string[];
}

/** A guide of numbered steps (`components/StepGuide.astro`). */
export interface StepGuide {
  path: string;
  /**
   * The day its steps, figures and sources were last checked (`YYYY-MM-DD`): the last change to
   * the guide's own steps and sources in this module. Its Spanish twin carries the same day.
   */
  checked: string;
  kicker: string;
  card: { title: string; summary: string };
  title: string;
  description: string;
  h1: string;
  lead: string;
  /** The closing line of the page; the default asks to read each product label. */
  note?: string;
  sources: Record<string, GuideSource>;
  steps: readonly GuideStep[];
}

const SOURCES = {
  cdc: {
    name: 'CDC: Home Pool and Hot Tub Water Treatment and Testing',
    url: 'https://www.cdc.gov/healthy-swimming/about/home-pool-and-hot-tub-water-treatment-and-testing.html',
  },
  hayward: {
    name: 'Hayward: Opening Your Pool',
    url: 'https://www.hayward.com/maintenance/opening-your-pool',
  },
  // as the dosing chart, the pH and the shock guides cite them (`guide.test.ts`)
  manual: DOSING_CHART.sources.hayward,
  taylor: DOSING_CHART.sources.taylor,
  hasa: DOSING_CHART.sources.hasa,
  calHypo: DOSING_CHART.sources.calHypo,
} as const satisfies Record<string, GuideSource>;

/** The doses of a 10,000 gallon pool the opening quotes, each its calculator's own. */
export const OPENING = {
  soda: doseOf(ALKALINITY.path, { gallons: '10000', current: '80', target: '90' }, 'pounds'),
  acid: doseOf(PH.path, { gallons: '10000', product: 'muriatic-31-45', drops: '1' }, 'liquid'),
  salt: doseOf(SALT.path, { gallons: '10000', current: '3000', target: '3200' }, 'pounds'),
  shock: doseOf(
    CHLORINE.path,
    { gallons: '10000', current: '0', target: '10', product: 'cal-hypo-65' },
    'dry',
  ),
} as const;

/** The steps, in order; each names the sources its figures come from. */
const STEPS: readonly GuideStep[] = [
  {
    title: 'Check what you have',
    text: 'Before you open the cover, look at the chlorine, shock, algaecide and balancers you kept from last season, and throw out any product past its date.',
    sources: ['hayward'],
  },
  {
    title: 'Take the cover off',
    text: 'Pump off the standing water and clear the leaves first, so they do not fall in. Fold the cover back slowly, then clean and dry it before you store it.',
    sources: ['hayward'],
  },
  {
    title: 'Put the equipment back',
    text: 'Remove the winterizing plugs, put the skimmer baskets and return fittings back, and reconnect the pump and the filter. Bring the water up to the level the skimmer needs.',
    link: { href: FILL_TIME.path, label: 'Work out the time to top it up' },
    sources: ['hayward'],
  },
  {
    title: 'Know your gallons',
    text: 'Every dose below depends on how much water the pool holds. Work it out once from the length, the width and the depth at each end, and keep the number.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'Start the pump and look for leaks',
    text: 'Turn the circulation on, check the pump, the filter and the fittings for drips, and clean or backwash the filter if its pressure is high.',
    sources: ['hayward'],
  },
  {
    title: 'Test the water',
    text: 'Test free chlorine and pH with a DPD test kit, and total alkalinity too. For a home pool, CDC recommends free chlorine of at least 1 ppm, at least 2 ppm if you use cyanuric acid or a stabilized chlorine such as dichlor or trichlor, and pH 7.0 to 7.8. Hayward’s opening guide aims for 1 to 3 ppm and a pH of 7.2 to 7.8.',
    sources: ['cdc', 'hayward'],
  },
  {
    title: 'Bring the alkalinity into range first',
    text: `Taylor’s instructions say to bring total alkalinity into its range, 80 to 120 ppm, before you adjust the pH: it is the buffer that keeps the pH from bouncing. Each 10 ppm takes ${OPENING.soda} lb of baking soda (sodium bicarbonate) per 10,000 gallons.`,
    link: { href: ALKALINITY.path, label: 'Work out the baking soda' },
    sources: ['taylor'],
  },
  {
    title: 'Then correct the pH',
    text: `To lower it, run the acid demand test of your kit: each drop it takes is ${OPENING.acid} fl oz of 31.45% muriatic acid per 10,000 gallons, by Taylor’s chart. HASA’s label adds at most one quart per 20,000 gallons in 24 hours, poured into the deep end with the pump running, so a larger dose goes in over several days.`,
    link: { href: PH.path, label: 'Work out the pH dose' },
    sources: ['taylor', 'hasa'],
  },
  {
    title: 'Bring the salt up, if you have a salt cell',
    text: `Salt does not evaporate, but rain and the fresh water you add to top the pool up dilute it. Test it, then add the pounds to reach the level your cell asks for, three quarters first and the rest after a day of circulation. From 3,000 to the 3,200 ppm Hayward’s AquaRite manual calls the best, 10,000 gallons take ${OPENING.salt} lb.`,
    link: { href: SALT.path, label: 'Work out the salt' },
    sources: ['manual'],
  },
  {
    title: 'Shock, then raise the chlorine',
    text: `Shock the pool once the water is balanced, as the sun goes down so the sunlight does not burn the chlorine off. From 0 ppm, 10,000 gallons take ${OPENING.shock} oz of 65% cal-hypo to reach 10 ppm, the top of its label’s 5 to 10 ppm; swim again once free chlorine is back to 4 ppm or less, that label’s reentry level. Then keep free chlorine at your target with the product you have.`,
    link: { href: CHLORINE.path, label: 'Work out the chlorine' },
    sources: ['hayward', 'calHypo'],
  },
  {
    title: 'Vacuum the next day',
    text: 'Leave the pump running overnight, then vacuum what settled on the bottom and test again. Top the water up if the cleaning lowered it.',
    sources: ['hayward'],
  },
  {
    title: 'Keep testing',
    text: 'CDC advises testing chlorine and pH at least twice a day while the pool is in use, and more often when many people swim.',
    sources: ['cdc'],
  },
];

/**
 * Opening a pool in spring, in the order that saves a second trip to the store. The steps follow
 * Hayward's opening guide; the water targets are CDC's for home pools, with Hayward's where it
 * differs; every dose is sized by a calculator. No figure here that a source does not give.
 */
export const OPENING_GUIDE = {
  path: '/opening-your-pool',
  checked: '2026-11-05',
  kicker: 'Guide · spring',
  card: {
    title: 'Opening your pool',
    summary: 'The spring steps in order, from the cover to the chlorine.',
  },
  title: 'How to Open Your Pool in Spring, Step by Step | Pool Figures',
  description:
    'Open your pool in the order that saves a second trip to the store: cover, equipment, water level, salt, pH, then chlorine, each dose sized to your pool.',
  h1: 'Opening your pool this spring',
  lead: `Open a pool in this order: the cover and the equipment, the water level, a test, then alkalinity before pH, the salt, and the shock last. For 10,000 gallons, each 10 ppm of alkalinity takes ${OPENING.soda} lb of baking soda, each drop of the acid demand test ${OPENING.acid} fl oz of 31.45% muriatic acid, and a shock from 0 to 10 ppm ${OPENING.shock} oz of 65% cal-hypo. Each dose below is sized to your own pool by its calculator.`,
  sources: SOURCES,
  steps: STEPS,
} as const satisfies StepGuide;

const CLOSING_SOURCES = {
  hayward: {
    name: 'Hayward: Closing Your Pool',
    url: 'https://www.hayward.com/maintenance/closing-your-pool',
  },
} as const satisfies Record<string, GuideSource>;

/** The cold-climate steps of Hayward's closing guide, in its order, then its mild-climate ones. */
const CLOSING_STEPS: readonly GuideStep[] = [
  {
    title: 'Know your gallons',
    text: 'The shock and every balancer you add before closing depend on how much water the pool holds. Work it out once from the length, the width and the depth at each end.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'Balance the water',
    text: 'Bring the pH to 7.2 to 7.8, so the water does not stain, scale or grow algae while the pool is closed. The chart gives the range of every other level.',
    link: { href: CHEMISTRY_CHART.path, label: 'See the water chemistry chart' },
    sources: ['hayward'],
  },
  {
    title: 'Shock the pool',
    text: 'Shock the pool, then run the filter for 24 to 48 hours to clear the debris.',
    link: { href: CHLORINE.path, label: 'Work out the chlorine' },
    sources: ['hayward'],
  },
  {
    title: 'Clean and vacuum',
    text: 'Brush, skim and vacuum the pool thoroughly. It makes the spring opening easier.',
    sources: ['hayward'],
  },
  {
    title: 'Lower the water',
    text: 'Where the water freezes, drain it to below the skimmer, since water expands as it freezes.',
    sources: ['hayward'],
  },
  {
    title: 'Drain the equipment',
    text: 'Empty the water from the filter, the pump and the heater. Blow out the lines, then close the valves so no water gets back into them.',
    sources: ['hayward'],
  },
  {
    title: 'Turn off the power',
    text: 'Switch off the power to every piece of pool equipment.',
    sources: ['hayward'],
  },
  {
    title: 'Put the accessories away',
    text: 'Take off the ladders, slides and diving boards, and store them safely.',
    sources: ['hayward'],
  },
  {
    title: 'In a mild winter, keep it running',
    text: 'Where the water does not freeze, do not drain it. Cut the filter run time in half, keep the pH at 7.2 to 7.8 and free chlorine at 1.0 to 3.0 ppm, clean the skimmer every week, and shock the pool before you cover it.',
    sources: ['hayward'],
  },
];

/**
 * Closing a pool for winter. The steps and every figure follow Hayward's closing guide; each dose is
 * sized by a calculator and each level is on the chart. No figure here that a source does not give.
 */
export const CLOSING_GUIDE = {
  path: '/closing-your-pool',
  checked: '2026-11-04',
  kicker: 'Guide · winter',
  card: {
    title: 'Closing your pool',
    summary: 'Balance, shock, lower the water and drain the lines before the frost.',
  },
  title: 'How to Close Your Pool for Winter, Step by Step | Pool Figures',
  description:
    'Close your pool for winter in order: balance the pH, shock, clean, lower the water below the skimmer, drain the equipment, then the power.',
  h1: 'Closing your pool for winter',
  lead: 'Where the water freezes, close the pool in this order: the water first, then the level, the equipment and the power. Where it does not, keep it running at half the filter time.',
  sources: CLOSING_SOURCES,
  steps: CLOSING_STEPS,
} as const satisfies StepGuide;

const PUMP_RUN_SOURCES = {
  icc: {
    name: 'ICC CodeNotes: 2021 ISPSC circulation and velocity (ANSI/APSP/ICC-15)',
    url: 'https://www.iccsafe.org/wp-content/uploads/24-23329_CodeNotes_2021_ISPSC_Velocity_FINAL_MIDRES.pdf',
  },
  hayward: {
    name: 'Hayward VS Omni pump owner’s manual, 092708 Rev B: Energy Efficiency Overview',
    url: 'https://hayward.com/media/akeneo_connector/asset_files/0/9/092708_RevB_9fbf.pdf',
  },
  doe: {
    name: 'U.S. Department of Energy, Energy Saver: Choosing, Installing, and Operating an Efficient Swimming Pool Pump',
    url: 'https://web.archive.org/web/20260519025951/https://www.energy.gov/energysaver/choosing-installing-and-operating-efficient-swimming-pool-pump',
  },
  energyStar: {
    name: 'ENERGY STAR (U.S. EPA): Pool Pumps',
    url: 'https://www.energystar.gov/products/pool_pumps',
  },
  haywardClosing: {
    name: 'Hayward: Closing Your Pool',
    url: 'https://www.hayward.com/maintenance/closing-your-pool',
  },
} as const satisfies Record<string, GuideSource>;

/** From the gallons to the hours: the flow the standard sizes, one turnover a day, then trimmed. */
const PUMP_RUN_STEPS: readonly GuideStep[] = [
  {
    title: 'Know your gallons',
    text: 'The run time is the time the pump takes to move all the water through the filter, so it starts from how much water the pool holds. Work it out once from the length, the width and the depth at each end.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'Find the flow the standard sizes',
    text: 'ANSI/APSP/ICC-15, which the 2021 ISPSC references, sizes the filtration of a home pool at the 6-hour turnover or 36 gpm, whichever is greater: gallons ÷ 360 minutes. That is 55.6 gpm for 20,000 gallons, and 36.0 gpm for 10,000, where the floor applies. The pipes are sized for that flow too, under 8 ft per second in the return and 6 in the suction.',
    link: { href: PUMP.path, label: 'Work out the pump flow' },
    sources: ['icc'],
  },
  {
    title: 'Turn the water over once a day',
    text: 'Hayward’s variable-speed pump manual recommends filtering all the water in the pool at least once every 24 hours, and checking your local rules for the minimum. A pump that moves the 6-hour flow does that in 6 hours.',
    sources: ['hayward'],
  },
  {
    title: 'Work out your own hours',
    text: 'At the flow your pump moves, one turnover takes gallons ÷ gallons a minute: at 40 gpm, 20,000 gallons take 20,000 ÷ 40 = 500 minutes, 8 h 20 min. A slower speed needs a longer run, as the manual says. You will often hear 8 hours a day: that is an informal trade figure, not a rule of the standard or of these sources. Turning 20,000 gallons over in 8 hours takes 41.7 gpm.',
    sources: ['hayward'],
  },
  {
    title: 'Start at 6 hours, then adjust',
    text: 'The U.S. Department of Energy says pool pumps often run much longer than necessary. Its advice: cut filtration to 6 hours a day, and if the water does not look clean, add time in half-hour steps until it does. In the Florida study it cites, most owners who pumped less than 3 hours a day were still happy with the water, and saved 60% of their pumping bill on average.',
    sources: ['doe'],
  },
  {
    title: 'Split the hours with a timer',
    text: 'If debris is a problem, set a timer to run the pump for several short periods a day: one long run leaves the rest of the day for the pool to collect debris. Running the filter 6 hours a day instead of 24 cuts its energy use by 75%.',
    sources: ['doe', 'energyStar'],
  },
  {
    title: 'Run a variable-speed pump slower, for longer',
    text: 'Halving the speed of a pump lets it use just one-eighth as much energy, so a variable-speed pump saves by running slowly for more hours. Slower water also lets the filter catch smaller particles.',
    sources: ['energyStar', 'hayward'],
  },
  {
    title: 'Speed up for the heater',
    text: 'Heaters, skimmers and chlorinators each need a minimum flow, given in their own manuals. Run the pump faster for the shorter times a heater or a water feature needs, and at the slow daily speed check that water still flows over the skimmer.',
    link: { href: HEATER.path, label: 'Work out the heater size' },
    sources: ['hayward'],
  },
  {
    title: 'In a mild winter, halve it',
    text: 'Where the water does not freeze and the pool stays open, Hayward’s closing guide cuts the filter run time in half.',
    sources: ['haywardClosing'],
  },
];

/**
 * How long to run a pool pump. The flow is the residential standard's, the daily turnover is
 * Hayward's manual, the hours to start from and the timer are DOE's, the speed and energy figures
 * ENERGY STAR's; each flow is the pump calculator's own. No figure here that a source does not give,
 * and the trade's 8 hours is named as the informal figure it is.
 */
export const PUMP_RUN_GUIDE = {
  path: '/how-long-to-run-pool-pump',
  checked: '2026-11-05',
  kicker: 'Guide · pump',
  card: {
    title: 'How long to run your pump',
    summary: 'The hours a day from your gallons and your pump flow, then trimmed.',
  },
  title: 'How Long to Run a Pool Pump: Hours a Day | Pool Figures',
  description:
    'How many hours a day to run your pool pump: one turnover of all the water, the flow the standard sizes, DOE’s 6 hours to start from, and variable speed.',
  h1: 'How long to run your pool pump',
  lead: 'Run the pump long enough to move all the water through the filter once a day: 6 hours at the flow the pool standard sizes, which is 55.6 gpm for 20,000 gallons. Work out the hours from your gallons and the flow of your own pump, start at 6, and trim or add half an hour at a time.',
  note: 'Follow the manual of your pump and of each piece of equipment where it differs from this guide, and any local rule for the turnover.',
  sources: PUMP_RUN_SOURCES,
  steps: PUMP_RUN_STEPS,
} as const satisfies StepGuide;

const SALT_VS_CHLORINE_SOURCES = {
  hayward: {
    name: 'Hayward AquaRite owner’s manual, 092538 Rev D',
    url: 'https://hayward.com/media/akeneo_connector/asset_files/0/9/092538_RevD_b778.pdf',
  },
  pentair: {
    name: 'Pentair IntelliChlor installation and user’s guide, P/N 520589 Rev. R',
    url: 'https://flowandfiltrationsolutions.pentair.com/content/dam/extranet/nam/pentair-pool/residential/sanitizers/intellichlor/intellichlor-installation-users-guide-ic15-ic20-ic40-ic60.pdf',
  },
  jandy: {
    name: 'Jandy AquaPure installation and operation manual, H0567500G LI4011 Rev 7',
    url: 'https://www.zodiacpoolsystems.com/-/media/9DD79DFAE8A441AE8E80289ABB0216B4.ashx',
  },
  cdc: {
    name: 'CDC: Home Pool and Hot Tub Water Treatment and Testing',
    url: 'https://www.cdc.gov/healthy-swimming/about/home-pool-and-hot-tub-water-treatment-and-testing.html',
  },
} as const satisfies Record<string, GuideSource>;

/** What a salt cell changes and what it leaves as it is, each difference from a maker's manual. */
const SALT_VS_CHLORINE_STEPS: readonly GuideStep[] = [
  {
    title: 'A salt pool is a chlorine pool',
    text: 'The salt is not the sanitizer: a generator turns it into chlorine as the water passes through its cell. Hayward’s AquaRite manual says the cell converts the salt into free chlorine, which kills bacteria and algae and reverts back to salt. Pentair’s IntelliChlor makes hypochlorite and hypochlorous acid by electrolysis; Jandy’s AquaPure calls what it makes sodium hypochlorite, liquid chlorine.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'The water targets are the same',
    text: 'CDC gives one floor for every home pool, salt or not: free chlorine at least 1 ppm, at least 2 ppm if you use cyanuric acid, and pH 7.0 to 7.8, tested at least twice a day, and more often when many people swim. Hayward’s manual says the only special requirements of its generator are the salt level and the stabilizer.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
    sources: ['cdc', 'hayward'],
  },
  {
    title: 'Every dose starts from your gallons',
    text: 'The salt, the chlorine and every other dose depend on how much water the pool holds. Work it out once from the length, the width and the depth at each end.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'In a chlorine pool, you add the chlorine',
    text: 'Without a generator, the chlorine goes in by hand, dosed to the reading: liquid chlorine, cal-hypo or dichlor. In 20,000 gallons, raising free chlorine from 1 to 3 ppm takes 41.0 fl oz of 12.5% liquid chlorine.',
    link: { href: CHLORINE.path, label: 'Work out the chlorine' },
  },
  {
    title: 'In a salt pool, the cell makes it',
    text: 'Hayward says the cycle of salt to chlorine and back virtually eliminates adding sanitizing chemicals. You set the generator instead: its chlorine follows the filter hours each day, the output setting and the salt. Start the output at about 50% and test every few days; most owners turn it up at the peak of summer and down when it is colder, and below 50°F the AquaRite stops making chlorine. The cell does not measure the chlorine it makes, Pentair warns, so you still test the water.',
    sources: ['hayward', 'pentair'],
  },
  {
    title: 'Shock still comes from a product',
    text: 'Hayward’s AquaRite has a super chlorinate setting for a heavy swim day or a lot of rain. When a pool first starts up, Pentair advises shocking it with a product from the pool store rather than with the cell.',
    sources: ['hayward', 'pentair'],
  },
  {
    title: 'Hold the salt at the level your cell asks for',
    text: 'Each maker gives its own range. Hayward’s AquaRite: 2,700 to 3,400 ppm, 3,200 the best, and the water starts to taste salty at about 3,500 to 4,000. Pentair’s IntelliChlor: 3,600 ppm, off below 2,600, and above 4,500 a risk of corrosion. Jandy’s AquaPure: 3,000 to 3,500 ppm, and below 2,000 the cell fails early. Test before you add any: most pools already hold some salt. A 20,000-gallon pool reading 0 ppm takes 533.8 lb to reach 3,200.',
    link: { href: SALT.path, label: 'Work out the salt' },
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'Buy pure salt, and wait for new plaster',
    text: 'Hayward asks for sodium chloride over 99% pure; Pentair and Jandy for at least 99.8%. None wants rock salt or salt with anti-caking agents such as yellow prussiate of soda, and Hayward rules out iodized salt. On new plaster the wait differs too: 10 to 14 days for Hayward, at least 4 weeks for Jandy, at least one month for Pentair.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'The salt stays in the water',
    text: 'Salt does not evaporate: you add more only after fresh water replaces what splashing, backwashing or draining after rain took out. And the only way to lower it is to drain part of the water and refill with fresh.',
    sources: ['hayward'],
  },
  {
    title: 'Keep the stabilizer your maker asks for',
    text: 'Outdoors, stabilizer (cyanuric acid) shields the chlorine the cell makes from the sun, which destroys 90% of unstabilized chlorine within two hours, Pentair says. The makers differ: Hayward’s chart raises it to 40 ppm, Pentair keeps it at 30 to 50 ppm and none indoors, Jandy at 50 to 75. Test it whenever you test the salt, Hayward says: the two most likely drop together.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'Look after the cell',
    text: 'The cell is the part a chlorine pool does not have. It cleans itself by reversing, but hard water or water out of balance still leaves scale: Hayward says to open and inspect it every 3 months or after cleaning the filter, Pentair and Jandy every two months where it tends to scale. Rinse it with a garden hose, and soak it in 1 quart of muriatic acid to 1 gallon of water only when that fails. Pentair designs its cell for about 10,000 hours, roughly five years of average use, before it needs replacing.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'Mind the stone, the metal and the dry acid',
    text: 'Salt is corrosive. Pentair warns that any amount of it raises the likelihood of corrosion of the equipment and the surfaces in and around the pool, metal parts and steel pools above all, and Hayward advises asking a stone specialist before natural stone coping or decking. All three makers warn against dry acid (sodium bisulfate) for the pH where the water evaporates a lot and is rarely diluted: its by-products can damage the cell.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
];

/**
 * Salt water pool vs chlorine pool. A salt pool is a chlorine pool whose cell makes the chlorine,
 * so the water targets are CDC's for both; the differences (salt level, salt, plaster wait,
 * stabilizer, cell care, cell life, corrosion) are each maker's manual, side by side. No cost and
 * no lifespan that a source does not give; each dose is its calculator's own.
 */
export const SALT_VS_CHLORINE_GUIDE = {
  path: '/salt-water-pool-vs-chlorine-pool',
  checked: '2026-11-05',
  kicker: 'Guide · salt',
  card: {
    title: 'Salt water vs chlorine',
    summary: 'What a salt cell changes, and what stays the same as in a chlorine pool.',
  },
  title: 'Salt Water Pool vs Chlorine Pool: What Differs | Pool Figures',
  description:
    'A salt water pool is a chlorine pool whose cell makes the chlorine. What differs: the salt level, the salt, the stabilizer and the cell care, per maker.',
  h1: 'Salt water pool vs chlorine pool: what actually differs',
  lead: 'A salt water pool is a chlorine pool: its cell makes the chlorine from salt kept at 3,200 ppm for Hayward’s AquaRite, within its 2,700 to 3,400 ppm, so the water targets are the same. What differs is the equipment, the salt level your cell asks for, and the care the cell needs.',
  note: 'Follow the manual of your own generator where it differs from this guide: the salt level, the stabilizer and the wait on new plaster all vary by maker.',
  sources: SALT_VS_CHLORINE_SOURCES,
  steps: SALT_VS_CHLORINE_STEPS,
} as const satisfies StepGuide;

const SHOCK_SOURCES = {
  calHypo: {
    name: 'Clor Mor Calcium Hypochlorite Granules label, EPA Reg. No. 69681-6 (accepted September 18, 2014)',
    url: 'https://www3.epa.gov/pesticides/chem_search/ppls/069681-00006-20140918.pdf',
  },
  dichlor: {
    name: 'Nu-Clo Concentrated Pool Chlorinating Granules (dichlor) label, EPA Reg. No. 7124-31 (accepted January 5, 2012)',
    url: 'https://www3.epa.gov/pesticides/chem_search/ppls/007124-00031-20120105.pdf',
  },
  cdc: {
    name: 'CDC: Home Pool and Hot Tub Water Treatment and Testing',
    url: 'https://www.cdc.gov/healthy-swimming/about/home-pool-and-hot-tub-water-treatment-and-testing.html',
  },
  cdcFecal: {
    name: 'CDC: Fecal Incident Response Recommendations for Aquatic Staff (2018)',
    url: 'https://www.cdc.gov/healthy-swimming/media/pdfs/fecal-incident-response-guidelines.pdf',
  },
  hayward: {
    name: 'Hayward: Opening Your Pool',
    url: 'https://www.hayward.com/maintenance/opening-your-pool',
  },
} as const satisfies Record<string, GuideSource>;

/** From the gallons to the swim: the label's shock level, sized by the chlorine calculator. */
const SHOCK_STEPS: readonly GuideStep[] = [
  {
    title: 'Know your gallons',
    text: 'Every shock dose depends on how much water the pool holds. Work it out once from the length, the width and the depth at each end, and keep the number.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'Balance the pH first',
    text: 'Both labels ask for the pH at 7.2 to 7.6: the cal-hypo label says to always adjust it before you add the product, and the dichlor label keeps it there for every use.',
    link: { href: PH.path, label: 'Work out the pH dose' },
    sources: ['calHypo', 'dichlor'],
  },
  {
    title: 'Test the free chlorine',
    text: 'Test with a DPD test kit, as CDC advises. CDC’s floor for a home pool is free chlorine of at least 1 ppm, at least 2 ppm if you use cyanuric acid. Shock raises it well above that for a while, then you let it fall back.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
    sources: ['cdc'],
  },
  {
    title: 'Read the shock level on your label',
    text: 'A cal-hypo granule label of 65% available chlorine shocks every 7 days, or as needed, with 10 to 20 oz per 10,000 gallons to provide 5 to 10 ppm available chlorine. A dichlor label of 56% available chlorine shocks with 2 oz per 1,000 gallons; on a new pool, it says, that provides 8.7 ppm.',
    sources: ['calHypo', 'dichlor'],
  },
  {
    title: 'Work out your dose',
    text: 'The shock dose is the chlorine dose from your reading to the shock level, so the calculator gives it for the product you have. From 0 ppm, 10,000 gallons take 10.3 oz of 65% cal-hypo to reach 5 ppm and 20.5 oz to reach 10, the label’s 10 to 20 oz, and 1,000 gallons take 2.1 oz of dichlor to reach 8.7 ppm, the label’s 2 oz. A 20,000-gallon pool reading 1 ppm takes 37.0 oz of cal-hypo, or 184.3 fl oz of 12.5% liquid chlorine, to reach 10.',
    link: { href: CHLORINE.path, label: 'Work out the shock dose' },
    sources: ['calHypo', 'dichlor'],
  },
  {
    title: 'Add it in the evening, with the pump running',
    text: 'The cal-hypo label says to add it during evening hours while the filter pump is running, broadcast over a wide area of the deep end, and to brush any granules that settle. Hayward also waits until the sun starts to go down. To keep a vinyl liner or paint from bleaching, both labels pour it slowly into the skimmer instead, with the filter on and the skimmer emptied of any other chemical.',
    sources: ['calHypo', 'dichlor', 'hayward'],
  },
  {
    title: 'Never mix it with anything',
    text: 'The dichlor label: do not mix it with any other chemicals, do not add water to it, and do not add it to water in a pail. The cal-hypo label: do not pre-mix it, add it straight to the pool or the skimmer. Contamination may cause an explosion or release toxic gases, both warn.',
    sources: ['calHypo', 'dichlor'],
  },
  {
    title: 'Swim only when the chlorine is back down',
    text: 'The labels give a reading, not a number of hours. The cal-hypo label prohibits reentry above 4 ppm, the dichlor label above 3 ppm. Test again before anyone swims, and wait until free chlorine is at or below the level on your label.',
    sources: ['calHypo', 'dichlor'],
  },
  {
    title: 'Shock again when the pool needs it',
    text: 'The cal-hypo label adds a shock after rain and heavy winds, many swimmers, warmer water or heavier use, and to correct visible algae, odors or eye irritation. The dichlor label shocks every week in hot weather or after heavy rains, and less often in cool weather.',
    sources: ['calHypo', 'dichlor'],
  },
  {
    title: 'After diarrhea in the water, follow CDC',
    text: 'For aquatic staff, CDC raises free chlorine with unstabilized chlorine, such as sodium hypochlorite, and keeps the water at pH 7.5 or less. Without stabilizer: 20 ppm for 12.75 hours. With cyanuric acid at 1 to 15 ppm: 20 ppm for 28 hours; above 15 ppm, drain part of the water and refill first. For formed poop, 2 ppm for 25 to 30 minutes. In 20,000 gallons, 2 to 20 ppm takes 368.6 fl oz of 12.5% liquid chlorine. Many test kits cannot read that high, CDC warns, and no one swims until the level is back in range.',
    sources: ['cdcFecal'],
  },
];

/**
 * How to shock a pool. The shock level, the timing and the reentry reading are the EPA-registered
 * labels' (cal-hypo and dichlor, the strengths the chlorine calculator uses); the home pool floor
 * and the hyperchlorination after a fecal incident are CDC's; each dose is the chlorine
 * calculator's own, from the reading to the label's level. No rule that a source does not give.
 */
export const SHOCK_GUIDE = {
  path: '/how-to-shock-a-pool',
  checked: '2026-11-05',
  kicker: 'Guide · shock',
  card: {
    title: 'How to shock a pool',
    summary: 'How much shock to add, when, and when you can swim again.',
  },
  title: 'How to Shock a Pool: How Much Shock to Add | Pool Figures',
  description:
    'How to shock a pool and how much shock to add: the label’s shock level for cal-hypo or dichlor, the dose for your gallons, and when you can swim again.',
  h1: 'How to shock a pool',
  lead: 'To shock a pool, raise free chlorine to the shock level on your product’s label: from 0 ppm, 10,000 gallons take 20.5 oz of 65% cal-hypo to reach 10 ppm, the top of its label’s 5 to 10 ppm. Swim again once free chlorine is back to 4 ppm or less, that label’s reentry level. Balance the pH first, work out the dose from your own reading, and add it in the evening with the pump running.',
  note: 'Follow the label of your own product where it differs from this guide: its strength, its shock dose and its reentry level all vary by product.',
  sources: SHOCK_SOURCES,
  steps: SHOCK_STEPS,
} as const satisfies StepGuide;

const PH_SOURCES = {
  taylor: {
    name: 'Taylor Technologies, K-1003 test kit instructions (Instr. #5816): pH, acid demand and base demand tests, and the pH dosage charts',
    url: 'https://www.novatech-usa.com/pdf/Taylor%20K-1003%20Instruction%20Manual.pdf',
  },
  hasa: {
    name: 'HASA Muriatic Acid (31.45% hydrochloric acid), product page: directions for use',
    url: 'https://hasa.com/hubfs/Product%20Assets/Muriatic%20Acid/Muriatic%20Acid%20-%20Product%20Page.pdf',
  },
  hasaDosing: {
    name: 'HASA: Muriatic Acid, dosing instructions',
    url: 'https://hasa.com/product/muriatic-acid',
  },
  hasaSds: {
    name: 'HASA Muriatic Acid Safety Data Sheet, section 7: handling',
    url: 'https://hasa.com/hubfs/Safety%20Data%20Sheets/SDS%20-%20Safety%20Data%20Sheets/HASA%20Muriatic%20Acid_2026.pdf',
  },
  sodaAsh: {
    name: 'pH Up (sodium carbonate 100%) label, manufactured for Alliance Trading, Inc. (label 01616483, REV050824)',
    url: 'https://www.propools.com/Manuals/66872_20248714245.pdf',
  },
  cdc: {
    name: 'CDC: Home Pool and Hot Tub Water Treatment and Testing',
    url: 'https://www.cdc.gov/healthy-swimming/about/home-pool-and-hot-tub-water-treatment-and-testing.html',
  },
} as const satisfies Record<string, GuideSource>;

/** From the gallons to the retest: Taylor's demand test sizes the dose, the product's own directions add it. */
const PH_STEPS: readonly GuideStep[] = [
  {
    title: 'Know your gallons',
    text: 'Every acid and soda ash dose depends on how much water the pool holds. Work it out once from the length, the width and the depth at each end, and keep the number.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'Test the pH',
    text: 'CDC advises testing the pH at least twice a day, and more often when many people swim. Its range for a home pool is 7.0 to 7.8; Taylor’s kit recommends 7.2 to 7.8. As the pH goes up, chlorine kills germs less well, above 8.0 above all; below 7.0 it kills them better, but the pipes are more likely to corrode, CDC says.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
    sources: ['cdc', 'taylor'],
  },
  {
    title: 'Know what high and low pH do',
    text: 'Too high, Taylor says, the pH brings scale deposits, cloudy water and poor sanitizer efficiency. Too low, it corrodes surfaces and irritates eyes and skin. Some sanitizers move it, and so does the water you add.',
    sources: ['taylor'],
  },
  {
    title: 'Bring the alkalinity into range first',
    text: 'Taylor’s instructions say to always bring total alkalinity into its range, 80 to 120 ppm, before you adjust the pH. Alkalinity is the buffer that keeps the pH from bouncing.',
    link: { href: ALKALINITY.path, label: 'Work out the baking soda' },
    sources: ['taylor'],
  },
  {
    title: 'Run the acid demand test',
    text: 'Keep the treated sample from the pH test. To lower the pH, add acid demand reagent R-0015 a drop at a time; after each drop, count, mix and compare with the color standards until the sample matches the pH you want. The drops you counted size the dose. The test runs on your own water, so its alkalinity is already in the count.',
    sources: ['taylor'],
  },
  {
    title: 'Work out the muriatic acid',
    text: 'Taylor’s chart gives 9.16 fl oz of 31.45% muriatic acid a drop for each 10,000 gallons. In 10,000 gallons that is 9.2 fl oz for 1 drop, 18.3 fl oz for 2 and 27.5 fl oz for 3; a 20,000-gallon pool that takes 2 drops needs 36.6 fl oz. That is over HASA’s 32.0 fl oz a day, so it goes in over 2 days. In 10,000 gallons the label allows 16.0 fl oz a day: the 3-drop dose of 10,000 gallons takes 2 days. The chart stops at 3 drops: add no more than the 3-drop dose at a time, then test again.',
    link: { href: PH.path, label: 'Work out the muriatic acid' },
    sources: ['taylor', 'hasa'],
  },
  {
    title: 'Add it at the deep end, with the pump running',
    text: 'HASA’s directions for its 31.45% acid: add acid to water, never water to acid. Pour it cautiously at the deep end, at least one foot from the wall, slowly and over as large an area as you can. The filter and the pump run while you add it and for at least 1 hour after. Wear goggles, old clothing and rubber gloves, and never mix it with chlorine bleaches or other household chemicals, its safety data sheet says.',
    sources: ['hasaDosing', 'hasa', 'hasaSds'],
  },
  {
    title: 'Retest before you add more',
    text: 'HASA adds at most one quart per 20,000 gallons in 24 hours, 32 fl oz, and repeats at 24-hour intervals as needed, to hold the pH at 7.2 to 7.6; when in doubt, it says, use less. A larger dose goes in over more than one day, with a test before each part. An adjustment in pH can change total alkalinity, Taylor adds, so recheck total alkalinity after it.',
    sources: ['hasa', 'taylor'],
  },
  {
    title: 'To raise the pH, run the base demand test',
    text: 'The base demand test is the same test with base demand reagent R-0016, and it sizes the soda ash (sodium carbonate). Taylor’s chart gives 5.13 oz a drop for each 10,000 gallons: in 10,000 gallons, 5.1 oz for 1 drop and 15.4 oz for 3; in 20,000 gallons, 20.5 oz for 2.',
    link: { href: PH.path, label: 'Work out the soda ash' },
    sources: ['taylor'],
  },
  {
    title: 'Add the soda ash, then retest',
    text: 'A soda ash pH Up label puts in at most 1 pound per 10,000 gallons at a time, straight into the deep end: in 20,000 gallons, 32.0 oz, so the 2-drop dose goes in at once. Let the water recirculate 2 to 3 hours, recheck the pH and repeat if needed. Wear goggles or safety glasses and rubber gloves, and do not mix it with other chemicals, the label says.',
    sources: ['sodaAsh'],
  },
];

/**
 * How to lower pH in a pool, and when to raise it. The range and the testing are CDC's and the
 * Taylor kit's; each dose is the pH calculator's own, from the drops of Taylor's acid or base
 * demand test, never past the chart's 3 drops; how to add the acid is HASA's directions for its
 * 31.45% muriatic acid, and how to add soda ash a pH Up label's. No rule that a source does not give.
 */
export const PH_GUIDE = {
  path: '/how-to-lower-ph-in-a-pool',
  checked: '2026-11-05',
  kicker: 'Guide · pH',
  card: {
    title: 'How to lower pool pH',
    summary: 'How much muriatic acid lowers the pH, and how much soda ash raises it.',
  },
  title: 'How to Lower pH in a Pool: How Much Muriatic Acid | Pool Figures',
  description:
    'How to lower pH in a pool and how much muriatic acid to add, from the acid demand test of your kit, and how to raise pH with soda ash.',
  h1: 'How to lower pH in a pool (and when to raise it)',
  lead: 'To lower pH, add muriatic acid: each drop the acid demand test of your kit takes is 9.2 fl oz of 31.45% muriatic acid per 10,000 gallons, by Taylor’s chart. HASA’s label adds at most one quart per 20,000 gallons a day, poured into the deep end with the pump running, with a test before each part. Bring the alkalinity into range first; to raise the pH, the base demand test sizes the soda ash.',
  note: 'Follow the label of your own product where it differs from this guide: the strength of the acid, how much goes in at a time and the wait before you retest all vary by product.',
  sources: PH_SOURCES,
  steps: PH_STEPS,
} as const satisfies StepGuide;

const CALCIUM_SOURCES = {
  label: {
    name: 'ClearView Calcium Increaser, Critical Usage Information (Oreq Corporation): directions',
    url: 'https://cdn.shopify.com/s/files/1/0100/9998/2432/files/Calcium_Increaser.pdf',
  },
  sds: {
    name: 'ClearView Calcium Increaser safety data sheet (Oreq Corporation): sections 3, 7 and 8',
    url: 'https://cdn.shopify.com/s/files/1/0100/9998/2432/files/SDS_Calcium_Increaser.pdf',
  },
  hayward: {
    name: 'Hayward AquaRite owner’s manual, 092538 Rev D: Water Chemistry, saturation index and cell cleaning',
    url: 'https://hayward.com/media/akeneo_connector/asset_files/0/9/092538_RevD_b778.pdf',
  },
  mahc: {
    name: 'CDC, 2024 Model Aquatic Health Code, 5th Edition: 5.7.4.4.3 Calcium Hardness',
    url: 'https://www.cdc.gov/model-aquatic-health-code/media/pdfs/2024/11/5th-Ed-MAHC-Code-508.pdf',
  },
} as const satisfies Record<string, GuideSource>;

/** From the gallons to the retest: the label sizes and splits the dose; only dilution lowers it. */
const CALCIUM_STEPS: readonly GuideStep[] = [
  {
    title: 'Know your gallons',
    text: 'Every calcium chloride dose, and every drain to lower it, depends on how much water the pool holds. Work it out once from the length, the width and the depth at each end, and keep the number.',
    link: { href: VOLUME_TEXTS.path, label: 'Work out your gallons' },
  },
  {
    title: 'Test the calcium hardness',
    text: 'Hayward’s AquaRite manual keeps calcium hardness at 200 to 400 ppm, the level APSP recommends for a home pool. The ClearView label says it should be maintained between 150 and 350 ppm. For a public pool, the CDC’s Model Aquatic Health Code caps it at 2,500 ppm.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
    sources: ['hayward', 'label', 'mahc'],
  },
  {
    title: 'Know what low and high calcium do',
    text: 'The saturation index relates the calcium and the alkalinity to the balance of the water, Hayward’s manual says. With the index below -0.2, the water is corrosive and plaster pool walls will be dissolved into the water; above +0.2, scaling and staining will occur. A buildup on a salt cell indicates an unusually high calcium level, and old pool water is usually the cause.',
    sources: ['hayward'],
  },
  {
    title: 'Work out the calcium chloride',
    text: 'The ClearView label: to raise calcium hardness 10 ppm, use 2 ounces per 1,000 gallons, which is 1.25 lb per 10 ppm per 10,000 gallons. Its safety data sheet gives calcium chloride flake of 74 to 100% by weight. So 10,000 gallons from 200 to 220 ppm take 2.5 lb, and 20,000 gallons from 180 to 200 ppm take 5.0 lb. Avoid overtreating, the label says.',
    link: { href: CALCIUM.path, label: 'Work out the calcium chloride' },
    sources: ['label', 'sds'],
  },
  {
    title: 'Split a large dose, 12 hours apart',
    text: 'The label: “If more than 3 pounds of this product is needed per 10,000 gallons of pool water, separate doses and apply this product at least 12 hours apart”, so the water can adjust without clouding. Raising 20,000 gallons from 150 to 250 ppm takes 25.0 lb, more than 3 lb per 10,000 gallons, so add 6.0 lb first, let the pump run at least 12 hours, test again, then add the rest the same way. In 10,000 gallons, 12.5 lb starts with 3.0 lb.',
    link: { href: CALCIUM.path, label: 'Work out the first addition' },
    sources: ['label'],
  },
  {
    title: 'Dissolve it, then pour it in',
    text: 'Pre-dissolve it in a pail of water, adding 1/2 pound of product to one gallon of water, and pour the mixture into the deep end of the pool with the pump running, the label says; repeat until the whole amount is in. The safety data sheet says to always use cool water when dissolving calcium chloride: “Heat evolved is significant.” Wear safety glasses with side shields or chemical goggles, and PVC, neoprene or heavy nitrile gloves; leather does not protect.',
    sources: ['label', 'sds'],
  },
  {
    title: 'Know why no chemical lowers it',
    text: 'Calcium hardness only goes up: nothing you pour in takes the calcium back out, and it stays behind when water evaporates and you top the pool up. Give the calcium calculator a reading over the target and it adds nothing: for 20,000 gallons from 600 to 400 ppm, the calculator adds 0.0 lb and tells you to drain part of the water and refill with softer water.',
  },
  {
    title: 'Work out how much water to drain',
    text: 'Test the water you will refill with first: if it is not softer than your target, refilling cannot get you there. Draining and refilling is plain dilution, so gallons to drain = gallons × (reading − target) ÷ (reading − fill water). A 20,000-gallon pool at 600 ppm, brought down to 400 ppm with fill water at 100 ppm, drains 8,000 gallons: 12,000 gallons at 600 ppm and 8,000 gallons at 100 ppm make 20,000 gallons at 400 ppm.',
    link: { href: FILL_TIME.path, label: 'Work out the time to refill' },
  },
  {
    title: 'Rebalance after you refill',
    text: 'The fresh water dilutes the rest of the water too. Test free chlorine, pH, alkalinity, stabilizer and salt again, and bring each back into its range before you add more calcium.',
    link: { href: CHEMISTRY_CHART.path, label: 'See every target range' },
  },
];

/**
 * How to raise calcium hardness in a pool, and why no chemical lowers it. The ranges are Hayward's
 * manual, the ClearView label's and the CDC code's cap; each dose is the calcium calculator's own,
 * split as it splits it, at the label's 3 lb per 10,000 gallons with 12 hours between parts; how
 * to add it is the label's and its safety data sheet's. Lowering it is the plain dilution of a
 * partial drain and refill, worked out in the open. No rule that a source does not give.
 */
export const CALCIUM_GUIDE = {
  path: '/how-to-raise-calcium-hardness-in-a-pool',
  checked: '2026-11-05',
  kicker: 'Guide · Calcium hardness',
  card: {
    title: 'How to raise calcium hardness',
    summary: 'How much calcium chloride raises it, and how much water to drain to lower it.',
  },
  title: 'How to Raise Calcium Hardness in a Pool | Pool Figures',
  description:
    'How to raise calcium hardness in a pool with calcium chloride, how much to add and when to split it, and why only a partial drain and refill lowers it.',
  h1: 'How to raise calcium hardness in a pool (and why you can’t lower it with chemicals)',
  lead: 'To raise calcium hardness 10 ppm, add 20.0 oz of calcium chloride flake per 10,000 gallons, the label’s dose, dissolved first and at most 3 lb per 10,000 gallons at a time, 12 hours apart. No chemical lowers it: only draining part of the water and refilling with softer water does, and plain dilution says how much to drain.',
  note: 'Follow the label of your own calcium product where it differs from this guide, since strengths vary. Ask whoever built your pool before you drain a large share of it.',
  sources: CALCIUM_SOURCES,
  steps: CALCIUM_STEPS,
} as const satisfies StepGuide;

/** A guide as the home, the footer and the calculator pages list it. */
export interface GuideCard {
  readonly path: string;
  readonly card: { readonly title: string; readonly summary: string };
  /** The calculators the guide explains: the ones its links open, each once, in its order. */
  readonly calculators: readonly string[];
}

const cardOf = (
  { path, card }: { readonly path: string; readonly card: GuideCard['card'] },
  links: readonly (GuideStep['link'] | undefined)[],
): GuideCard => ({
  path,
  card,
  calculators: [
    ...new Set(
      links.flatMap((link) => (link?.href.endsWith('-calculator') === true ? [link.href] : [])),
    ),
  ],
});

const stepsCard = (guide: StepGuide): GuideCard =>
  cardOf(
    guide,
    guide.steps.map(({ link }) => link),
  );

/** Every guide, in the order the home and the footer list them. */
export const GUIDES: readonly GuideCard[] = [
  stepsCard(OPENING_GUIDE),
  stepsCard(CLOSING_GUIDE),
  cardOf(CHEMISTRY_CHART, [
    CHEMISTRY_CHART.gallons,
    ...CHEMISTRY_CHART.rows.map(({ link }) => link),
  ]),
  cardOf(DOSING_CHART, [
    DOSING_CHART.gallons,
    ...DOSING_CHART.tables.flatMap(({ columns }) =>
      columns.map(({ calculator, link }) => ({ href: calculator, label: link.label })),
    ),
  ]),
  cardOf(VOLUME_CHART, [VOLUME_CHART.calculator]),
  stepsCard(PUMP_RUN_GUIDE),
  stepsCard(SALT_VS_CHLORINE_GUIDE),
  stepsCard(SHOCK_GUIDE),
  stepsCard(PH_GUIDE),
  stepsCard(CALCIUM_GUIDE),
  cardOf(
    SWIM_GUIDE,
    SWIM_GUIDE.rows.flatMap(({ link, guide }) => [link, guide]),
  ),
];

/** The guides that explain the calculator at `path`, as links from its page, in `GUIDES` order. */
export const guidesOf = (path: string): readonly GuideCard[] =>
  GUIDES.filter(({ calculators }) => calculators.includes(path));
