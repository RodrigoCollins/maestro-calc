import type { Size } from '@maestro-calc/pets-core/dog-age';
import { figureOf, type Patch, type View } from '../calc/view.ts';
import { amountEs } from './format.ts';

/**
 * Each size as the Spanish page names it, with its weight in kilograms: AVMA's 20 lb (9 kg), 50 lb
 * (23 kg) and 100 lb (45 kg) lines, rounded to the kilogram. `of` follows "un perro" (`pequeño`),
 * `plural` follows "los perros".
 */
export const SIZE_ES: Readonly<
  Record<
    Size,
    { readonly name: string; readonly of: string; readonly plural: string; readonly weight: string }
  >
> = {
  small: { name: 'Pequeño', of: 'pequeño', plural: 'pequeños', weight: 'hasta 9 kg' },
  medium: { name: 'Mediano', of: 'mediano', plural: 'medianos', weight: 'de 10 a 23 kg' },
  large: { name: 'Grande', of: 'grande', plural: 'grandes', weight: 'de 23 a 45 kg' },
  giant: { name: 'Gigante', of: 'gigante', plural: 'gigantes', weight: 'más de 45 kg' },
};

/** The life stages of the 2019 AAHA Canine Life Stage Guidelines, in Spanish, by stage number. */
export const STAGES_ES = ['cachorro', 'adulto joven', 'adulto maduro', 'senior'] as const;

/** An age as typed, to the hundredth, with a decimal comma: `3`, `3,5`. */
const ageText = (value: number): string => String(Math.round(value * 100) / 100).replace('.', ',');

/** `1 año`, `3 años`, `1,5 años`: Spanish keeps the singular for exactly one. */
const yearsOf = (age: string): string => `${age} ${age === '1' ? 'año' : 'años'}`;

/** The result of the Spanish dog age calculator, the same figures as the English one. */
export const dogAgeViewEs: View = (figures, raw, warnings): Patch => {
  const fromDog = raw['from'] !== 'human';
  const size = (raw['size'] ?? 'medium') as Size;
  const { of, weight } = SIZE_ES[size];
  const age = ageText(Number(raw['age'] ?? ''));
  const unit = fromDog ? 'años humanos' : 'años de perro';
  const places = fromDog ? 0 : 1;
  const stage = Number(figureOf(figures, 'stage').num);
  const answer = figureOf(figures, 'answer');
  return {
    text: {
      figure: amountEs(answer, fromDog && answer.isInteger() ? 0 : 1),
      unit,
      exact: fromDog
        ? `para un perro ${of} de ${yearsOf(age)} (${weight})`
        : `para ${yearsOf(age)} humanos en un perro ${of} (${weight})`,
      wang: `${amountEs(figureOf(figures, 'wang'), 1)} ${unit}`,
      seven: `${amountEs(figureOf(figures, 'seven'), places)} ${unit}`,
      stage: STAGES_ES[stage] ?? '',
      seniorAt: `${amountEs(figureOf(figures, 'seniorAt'), 0)} años`,
    },
    html: {},
    show: { outside: warnings.has('outside'), wangOutside: warnings.has('wangOutside') },
    vars: {},
    flags: {},
  };
};
