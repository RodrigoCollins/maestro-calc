import type { Size } from '@maestro-calc/pets-core/dog-age';
import { figureOf, type Patch, type View } from '../calc/view.ts';
import { amountDe } from './format.ts';

/**
 * Each size as the German page names it, with its weight in kilograms: AVMA's 20 lb (9 kg), 50 lb
 * (23 kg) and 100 lb (45 kg) lines, rounded to the kilogram. The adjective comes declined for "einen
 * … Hund" (accusative) and "einem … Hund" (dative).
 */
export const SIZE_DE: Readonly<
  Record<
    Size,
    { readonly name: string; readonly acc: string; readonly dat: string; readonly weight: string }
  >
> = {
  small: { name: 'Klein', acc: 'kleinen', dat: 'kleinen', weight: 'bis 9 kg' },
  medium: { name: 'Mittel', acc: 'mittelgroßen', dat: 'mittelgroßen', weight: '10 bis 23 kg' },
  large: { name: 'Groß', acc: 'großen', dat: 'großen', weight: '23 bis 45 kg' },
  giant: { name: 'Sehr groß', acc: 'sehr großen', dat: 'sehr großen', weight: 'über 45 kg' },
};

/** The life stages of the 2019 AAHA Canine Life Stage Guidelines, in German, by stage number. */
export const STAGES_DE = ['Welpe', 'junger Erwachsener', 'reifer Erwachsener', 'Senior'] as const;

/** An age as typed, to the hundredth, German style: `3`, `3,5`. */
const ageText = (value: number): string => String(Math.round(value * 100) / 100).replace('.', ',');

/** The result of the German dog age calculator, the same figures as the English one. */
export const dogAgeViewDe: View = (figures, raw, warnings): Patch => {
  const fromDog = raw['from'] !== 'human';
  const size = (raw['size'] ?? 'medium') as Size;
  const { acc, dat, weight } = SIZE_DE[size];
  const age = ageText(Number(raw['age'] ?? ''));
  const unit = fromDog ? 'Menschenjahre' : 'Hundejahre';
  const places = fromDog ? 0 : 1;
  const stage = Number(figureOf(figures, 'stage').num);
  const answer = figureOf(figures, 'answer');
  return {
    text: {
      figure: amountDe(answer, fromDog && answer.isInteger() ? 0 : 1),
      unit,
      exact: fromDog
        ? `für einen ${age} ${age === '1' ? 'Jahr' : 'Jahre'} alten ${acc} Hund (${weight})`
        : `für ${age} Menschenjahre bei einem ${dat} Hund (${weight})`,
      wang: `${amountDe(figureOf(figures, 'wang'), 1)} ${unit}`,
      seven: `${amountDe(figureOf(figures, 'seven'), places)} ${unit}`,
      stage: STAGES_DE[stage] ?? '',
      seniorAt: `${amountDe(figureOf(figures, 'seniorAt'), 0)} Jahren`,
    },
    html: {},
    show: { outside: warnings.has('outside'), wangOutside: warnings.has('wangOutside') },
    vars: {},
    flags: {},
  };
};
