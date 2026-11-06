import { CHEMISTRY_CHART } from './chemistry.ts';
import { DOSING_CHART, doseOf } from './dosing.ts';
import { ALKALINITY, CALCIUM, CHLORINE, PH, SALT, STABILIZER } from './doses.ts';
import type { GuideSource } from './guide.ts';

/** One chemical of the guide: when to swim again, the time its source gives, and what it says. */
export interface SwimRow {
  readonly id: string;
  readonly chemical: string;
  /** The reading to wait for before anyone swims. */
  readonly when: string;
  /** The only time the source gives, or that it gives none before swimming. */
  readonly time: string;
  readonly text: string;
  readonly sources: readonly string[];
  /** The calculator that sizes the dose. */
  readonly link: { readonly href: string; readonly label: string };
  /** The guide of this site that explains the chemical, where there is one. */
  readonly guide?: { readonly href: string; readonly label: string };
}

// The guides of `guide.ts` by path: `guide.ts` lists this guide, so importing its values here would
// be a cycle (`swim.test.ts` holds each path equal to its guide's).
const SHOCK = { href: '/how-to-shock-a-pool', label: 'How to shock a pool' };
const PH_LOWER = { href: '/how-to-lower-ph-in-a-pool', label: 'How to lower pool pH' };
const CALCIUM_RAISE = {
  href: '/how-to-raise-calcium-hardness-in-a-pool',
  label: 'How to raise calcium hardness',
};

const SOURCES = {
  cdc: CHEMISTRY_CHART.sources.cdc,
  mahc: CHEMISTRY_CHART.sources.mahc,
  calHypo: DOSING_CHART.sources.calHypo,
  dichlor: {
    name: 'Nu-Clo Concentrated Pool Chlorinating Granules (dichlor) label, EPA Reg. No. 7124-31 (accepted January 5, 2012)',
    url: 'https://www3.epa.gov/pesticides/chem_search/ppls/007124-00031-20120105.pdf',
  },
  liquid: {
    name: 'B’s Pool Supply Sodium Hypochlorite Solution (12.5%) label, EPA Reg. No. 55487-20001 (accepted November 16, 2017)',
    url: 'https://www3.epa.gov/pesticides/chem_search/ppls/055487-20001-20171116.pdf',
  },
  hasa: DOSING_CHART.sources.hasa,
  sodaAsh: {
    name: 'pH Up (sodium carbonate 100%) label, manufactured for Alliance Trading, Inc. (label 01616483, REV050824)',
    url: 'https://www.propools.com/Manuals/66872_20248714245.pdf',
  },
  alkalinity: {
    name: 'ClearView Total Alkalinity, Critical Usage Information (Oreq Corporation): directions',
    url: 'https://cdn.shopify.com/s/files/1/0100/9998/2432/files/Total_Alkalinity.pdf',
  },
  alkalinitySds: {
    name: 'ClearView Total Alkalinity safety data sheet (Oreq Corporation): section 3',
    url: 'https://cdn.shopify.com/s/files/1/0100/9998/2432/files/SDS_Total_Alkalinity.pdf',
  },
  hayward: {
    name: 'Hayward AquaRite owner’s manual, 092538 Rev D: How to Add or Remove Salt',
    url: 'https://hayward.com/media/akeneo_connector/asset_files/0/9/092538_RevD_b778.pdf',
  },
  calcium: DOSING_CHART.sources.clearView,
  stabilizer: {
    name: 'ClearView Primo Powder (isocyanuric acid 99%), Critical Usage Information (Oreq Corporation): directions',
    url: 'https://www.poolsupplyunlimited.com/Products/Manuals/141843_2023131114222.pdf',
  },
} as const satisfies Record<string, GuideSource>;

/** The 12.5% liquid chlorine of 10,000 gallons from 0 ppm to its label's 5 and 10 ppm. */
const liquid = (target: string): string =>
  doseOf(
    CHLORINE.path,
    { gallons: '10000', current: '0', target, product: 'liquid-12-5' },
    'liquid',
  );

const NO_TIME = 'no time before swimming';

/** The chemicals, in the order of the question: shock and chlorine, then each balancer. */
const ROWS: readonly SwimRow[] = [
  {
    id: 'cal-hypo',
    chemical: 'Shock: 65% cal-hypo',
    when: 'Free chlorine at 4 ppm or less',
    time: 'The label gives no hours: a test reading',
    text: 'The cal-hypo label shocks to 5 to 10 ppm and prohibits reentry above 4 ppm. The water stays closed until a test reads 4 ppm or less, however long that takes, and the pH sits at the label’s 7.2 to 7.6.',
    sources: ['calHypo'],
    link: { href: CHLORINE.path, label: 'Work out the shock dose' },
    guide: SHOCK,
  },
  {
    id: 'dichlor',
    chemical: 'Shock: 56% dichlor',
    when: 'Free chlorine at 3 ppm or less',
    time: 'The label gives no hours: a test reading',
    text: 'The dichlor label shocks with 2 oz per 1,000 gallons, 8.7 ppm on a new pool, and prohibits reentry above 3 ppm. Test again before anyone swims. Dichlor adds stabilizer too, so the chlorine floor is CDC’s 2 ppm.',
    sources: ['dichlor', 'cdc'],
    link: { href: CHLORINE.path, label: 'Work out the dichlor dose' },
    guide: SHOCK,
  },
  {
    id: 'liquid-chlorine',
    chemical: 'Liquid chlorine, 12.5%',
    when: 'Free chlorine at 4 ppm or less',
    time: 'The label gives no hours: a test reading',
    text: `The label super-chlorinates with 52 to 104 fl. oz. per 10,000 gallons to yield 5 to 10 ppm, and says: “Do not enter treated pool above 4 ppm chlorine level due to risk of bodily harm.” In 10,000 gallons from 0 ppm, the calculator gives ${liquid('5')} fl oz for 5 ppm and ${liquid('10')} fl oz for 10.`,
    sources: ['liquid'],
    link: { href: CHLORINE.path, label: 'Work out the liquid chlorine' },
  },
  {
    id: 'muriatic-acid',
    chemical: 'Muriatic acid (pH down)',
    when: 'pH back in range: 7.2 to 7.6 on the label',
    time: `Pump on for at least 1 hour after; ${NO_TIME}`,
    text: 'HASA’s directions keep the pH at 7.2-7.6, add at most one quart per 20,000 gallons per 24 hours, and run the filter and the pump while you add it and for at least one (1) hour after the addition. They give no time before swimming: retest the pH once the pump has run, and swim when it reads in range.',
    sources: ['hasa'],
    link: { href: PH.path, label: 'Work out the muriatic acid' },
    guide: PH_LOWER,
  },
  {
    id: 'soda-ash',
    chemical: 'Soda ash (pH up)',
    when: 'pH back in range',
    time: `2 to 3 hours of circulation, then a retest; ${NO_TIME}`,
    text: 'The pH Up label adds at most 1 pound per 10,000 gallons at a time, then says to allow water to recirculate two to three hours, recheck pH, and repeat if needed. It gives no time before swimming: the recheck is when you know.',
    sources: ['sodaAsh'],
    link: { href: PH.path, label: 'Work out the soda ash' },
    guide: PH_LOWER,
  },
  {
    id: 'baking-soda',
    chemical: 'Baking soda (alkalinity up)',
    when: 'Free chlorine and pH in range',
    time: `Add it in the evening, filter running; ${NO_TIME}`,
    text: 'ClearView Total Alkalinity, 100% Sodium Bicarbonate by its safety data sheet, goes in during evening hours while filter is running, broadcast over the deepest part of the pool. Its directions give no time before swimming: test the chlorine and the pH before anyone gets in.',
    sources: ['alkalinity', 'alkalinitySds'],
    link: { href: ALKALINITY.path, label: 'Work out the baking soda' },
  },
  {
    id: 'salt',
    chemical: 'Salt, for a salt cell',
    when: 'Salt dissolved, free chlorine and pH in range',
    time: `24 hours of filtering to spread it; ${NO_TIME}`,
    text: 'Hayward’s AquaRite manual adds salt with the pump on, brushed around: do not allow salt to pile up on the bottom of the pool. Run the filter pump for 24 hours with the suction from the main drain to spread it; the salt display may take 24 hours to respond. The manual gives no time before swimming.',
    sources: ['hayward'],
    link: { href: SALT.path, label: 'Work out the salt' },
  },
  {
    id: 'calcium',
    chemical: 'Calcium chloride (hardness up)',
    when: 'Dissolved, free chlorine and pH in range',
    time: `Large doses at least 12 hours apart; ${NO_TIME}`,
    text: 'The ClearView label dissolves it in a pail first and pours it into the deep end with the pump running. Over 3 pounds per 10,000 gallons, it separates the doses at least 12 hours apart, to let the water adjust and avoid clouding. It gives no time before swimming.',
    sources: ['calcium'],
    link: { href: CALCIUM.path, label: 'Work out the calcium chloride' },
    guide: CALCIUM_RAISE,
  },
  {
    id: 'stabilizer',
    chemical: 'Stabilizer (cyanuric acid)',
    when: 'Dissolved, free chlorine at least 2 ppm, pH in range',
    time: `24 hours of circulation to dissolve it; ${NO_TIME}`,
    text: 'The ClearView Primo directions add it to the skimmer with a clean filter and recirculate water continuously for 24 hours to dissolve properly, at a pH of 7.2 to 7.6, keeping 30 to 50 ppm of cyanuric acid. They give no time before swimming. With stabilizer in the water, CDC’s chlorine floor is 2 ppm; a public pool keeps it at 90 ppm at most, by the CDC’s code.',
    sources: ['stabilizer', 'cdc', 'mahc'],
    link: { href: STABILIZER.path, label: 'Work out the stabilizer' },
  },
];

/**
 * How long after adding chemicals you can swim. The rule is the test reading, never a clock time:
 * the reentry level of each EPA-registered chlorine label, CDC's home-pool floor and pH range, and
 * the public-pool limits of the CDC's code. Each balancer row gives only the time its own directions
 * give (the pump, the spread, the split), and says so where they give none before swimming.
 */
export const SWIM_GUIDE = {
  path: '/how-long-after-adding-chemicals-can-you-swim',
  /** The day every reading was last checked against its label or source. */
  checked: '2026-11-05',
  kicker: 'Guide · swimming',
  card: {
    title: 'When to swim after chemicals',
    summary: 'The reading to wait for after shock, acid, salt and every balancer.',
  },
  title: 'How Long After Adding Chemicals Can You Swim? | Pool Figures',
  description:
    'When to swim after shock, chlorine, acid, baking soda, salt, calcium or stabilizer: the test reading each label sets, and the only times the labels give.',
  h1: 'How long after adding chemicals can you swim?',
  lead: 'Swim again when a test says the water is back in range, not after a set number of hours: free chlorine at or below the reentry level on your product’s label, 4 ppm for 65% cal-hypo and 12.5% liquid chlorine and 3 ppm for dichlor, yet at least CDC’s 1 ppm, 2 ppm with stabilizer, and pH 7.0 to 7.8. None of the labels below gives a number of hours before swimming: the times they give are for the pump, for spreading the product, or between two doses. Test free chlorine and pH before anyone gets in.',
  rules: {
    text: 'CDC’s floor for a home pool is free chlorine of at least 1 ppm, at least 2 ppm if you use cyanuric acid or a stabilized chlorine such as dichlor or trichlor, and pH 7.0 to 7.8, tested with a DPD kit. For a public pool, the CDC’s Model Aquatic Health Code keeps the pH at 7.0 to 7.8 too.',
    sources: ['cdc', 'mahc'],
  },
  charts: [
    { href: DOSING_CHART.path, label: 'See the dose of each chemical by pool size' },
    { href: CHEMISTRY_CHART.path, label: 'See the target range of every level' },
  ],
  sources: SOURCES,
  rows: ROWS,
} as const satisfies {
  path: string;
  checked: string;
  kicker: string;
  card: { title: string; summary: string };
  title: string;
  description: string;
  h1: string;
  lead: string;
  rules: { text: string; sources: readonly string[] };
  charts: readonly { href: string; label: string }[];
  sources: Record<string, GuideSource>;
  rows: readonly SwimRow[];
};
