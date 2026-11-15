import type { Size } from '@maestro-calc/pets-core/dog-age';
import { figureOf, type Patch, type View } from '../calc/view.ts';
import { amountFr } from './format.ts';

/**
 * Each size as the French page names it, with its weight in kilograms: AVMA's 20 lb (9 kg), 50 lb
 * (23 kg) and 100 lb (45 kg) lines, rounded to the kilogram. `of` follows "un chien" (`de petite
 * taille`), `plural` follows "les chiens".
 */
export const SIZE_FR: Readonly<
  Record<
    Size,
    { readonly name: string; readonly of: string; readonly plural: string; readonly weight: string }
  >
> = {
  small: { name: 'Petit', of: 'de petite taille', plural: 'petits', weight: 'jusqu’à 9 kg' },
  medium: { name: 'Moyen', of: 'de taille moyenne', plural: 'moyens', weight: '10 à 23 kg' },
  large: { name: 'Grand', of: 'de grande taille', plural: 'grands', weight: '23 à 45 kg' },
  giant: {
    name: 'Très grand',
    of: 'de très grande taille',
    plural: 'très grands',
    weight: 'plus de 45 kg',
  },
};

/** The life stages of the 2019 AAHA Canine Life Stage Guidelines, in French, by stage number. */
export const STAGES_FR = ['chiot', 'jeune adulte', 'adulte mûr', 'senior'] as const;

/** An age as typed, to the hundredth, French style: `3`, `3,5`. */
const ageText = (value: number): string => String(Math.round(value * 100) / 100).replace('.', ',');

/** `1 an`, `3 ans`, `1,5 an`: French keeps the singular below 2. */
const yearsOf = (age: string): string =>
  `${age} ${Number(age.replace(',', '.')) < 2 ? 'an' : 'ans'}`;

/** The result of the French dog age calculator, the same figures as the English one. */
export const dogAgeViewFr: View = (figures, raw, warnings): Patch => {
  const fromDog = raw['from'] !== 'human';
  const size = (raw['size'] ?? 'medium') as Size;
  const { of, weight } = SIZE_FR[size];
  const age = ageText(Number(raw['age'] ?? ''));
  const unit = fromDog ? 'ans en âge humain' : 'ans en âge de chien';
  const places = fromDog ? 0 : 1;
  const stage = Number(figureOf(figures, 'stage').num);
  const answer = figureOf(figures, 'answer');
  return {
    text: {
      figure: amountFr(answer, fromDog && answer.isInteger() ? 0 : 1),
      unit,
      exact: fromDog
        ? `pour un chien ${of} de ${yearsOf(age)} (${weight})`
        : `pour ${yearsOf(age)} d’âge humain chez un chien ${of} (${weight})`,
      wang: `${amountFr(figureOf(figures, 'wang'), 1)} ${unit}`,
      seven: `${amountFr(figureOf(figures, 'seven'), places)} ${unit}`,
      stage: STAGES_FR[stage] ?? '',
      seniorAt: `${amountFr(figureOf(figures, 'seniorAt'), 0)} ans`,
    },
    html: {},
    show: { outside: warnings.has('outside'), wangOutside: warnings.has('wangOutside') },
    vars: {},
    flags: {},
  };
};
