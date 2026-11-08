import { Rational } from '@maestro-calc/core';
import { amountText } from '../format.ts';
import { rulerPercent } from '../strips.ts';
import type { FieldCopy } from './dog.ts';
import { figureOf, type Patch, type View } from './view.ts';

/**
 * The poison line of the ASPCA Animal Poison Control Center, read on
 * https://www.aspca.org/pet-care/animal-poison-control on 2026-11-07: open 24 hours a day, 365 days
 * a year, and a consultation fee may apply. Every chocolate page and result carries it.
 */
export const POISON_LINE = {
  name: 'ASPCA Animal Poison Control Center',
  phone: '(888) 426-4435',
  href: 'tel:+18884264435',
  source: 'https://www.aspca.org/pet-care/animal-poison-control',
  checked: '2026-11-07',
} as const;

/** The always-on call to action: shown above the form and again in every result. */
export const CALL_NOW = `Call your veterinarian or the ${POISON_LINE.name} at ${POISON_LINE.phone} now, even when the figure below looks low. It answers 24 hours a day (a consultation fee may apply). Have the dog’s weight, the kind of chocolate and the amount ready.`;

/** The copy of the chocolate calculator page. */
export interface ChocolatePage {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly fields: Readonly<Record<string, FieldCopy>>;
  readonly initial: Readonly<Record<string, string>>;
  readonly notes: readonly string[];
}

export const CHOCOLATE_PAGE: ChocolatePage = {
  path: '/dog-chocolate-toxicity-calculator',
  title: 'Dog Chocolate Toxicity Calculator | Bowl Figures',
  description:
    'Your dog’s weight, the kind of chocolate and how much it ate, as mg/kg against the Merck bands of 20, 40 and 60. Always call a veterinarian or a poison line.',
  kicker: 'Dogs · chocolate · free',
  h1: 'Dog chocolate toxicity calculator',
  lead: 'Enter your dog’s weight, the kind of chocolate and how much it ate. You get the dose in mg/kg of theobromine and caffeine, and the band it falls in.',
  fields: {
    weight: { label: 'Your dog’s weight' },
    weightUnit: { label: 'Unit', options: { lb: 'pounds', kg: 'kilograms' } },
    type: {
      label: 'Kind of chocolate',
      options: {
        white: 'White chocolate',
        milk: 'Milk chocolate',
        dark: 'Dark or semisweet chocolate',
        baking: 'Unsweetened baking chocolate',
        'cocoa-powder': 'Cocoa powder',
        hulls: 'Cocoa bean hulls (mulch)',
      },
    },
    amount: { label: 'Amount eaten' },
    amountUnit: { label: 'Unit', options: { oz: 'ounces', g: 'grams' } },
  },
  initial: { weight: '20', weightUnit: 'lb', type: 'milk', amount: '1', amountUnit: 'oz' },
  notes: [
    'The figure is a dose for a healthy adult dog: the sources do not account for a dog’s heart disease, other medicines, or chocolate with raisins, nuts or xylitol. For dark chocolate it uses the top of Merck’s range (5.6 mg per gram).',
    'A low figure is never an all clear. Your veterinarian or the poison line can tell you whether to watch at home or to come in.',
  ],
};

/** What each band means, from the Merck Veterinary Manual: the doses are in mg/kg. */
export const BANDS = [
  'Below 20 mg/kg, the dose where Merck lists the first signs. Still call now: the figure is an estimate from what you entered.',
  '20 mg/kg and up: mild signs are possible (vomiting, diarrhea, thirst).',
  '40 mg/kg and up: heart effects are possible. This needs a veterinarian now.',
  '60 mg/kg and up: seizures are possible. This is an emergency.',
] as const;

const GRAMS_PER_OUNCE = Rational.of(28_349_523_125, 1_000_000_000);

const gramsAndOunces = (grams: Rational): string =>
  `${amountText(grams, 0)} g (${amountText(grams.div(GRAMS_PER_OUNCE), 1)} oz)`;

/** The result of the chocolate calculator: the dose on the ruler, its band and the grams to each band. */
export const chocolateView: View = (figures): Patch => {
  const dose = figureOf(figures, 'dose');
  const band = Number(figureOf(figures, 'band').num);
  return {
    text: {
      figure: amountText(dose, 1),
      unit: 'mg/kg',
      total: `${amountText(figureOf(figures, 'totalMg'), 0)} mg`,
      band: BANDS[band] ?? '',
      reach20: gramsAndOunces(figureOf(figures, 'reach20')),
      reach40: gramsAndOunces(figureOf(figures, 'reach40')),
      reach60: gramsAndOunces(figureOf(figures, 'reach60')),
    },
    html: {},
    show: {},
    vars: { pos: `${rulerPercent(dose.toNumber()).toFixed(1)}%` },
    flags: { band: String(band) },
  };
};
