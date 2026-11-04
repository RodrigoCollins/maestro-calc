import { ALKALINITY, CHLORINE, PUMP, SALT, STABILIZER } from './doses.ts';
import { VOLUME_TEXTS } from './volume/texts.ts';

/** One calculator card of the home: its page, a short title and what it works out. */
export interface HomeTool {
  readonly href: string;
  readonly title: string;
  readonly summary: string;
}

/** The calculators the home lists, volume first: the gallons every other dose starts from. */
export const HOME_TOOLS: readonly HomeTool[] = [
  {
    href: VOLUME_TEXTS.path,
    title: 'Pool volume',
    summary: 'Gallons for a rectangle, round or oval pool.',
  },
  {
    href: SALT.path,
    title: 'Pool salt',
    summary: 'Pounds and 40 lb bags to reach your generator’s level.',
  },
  {
    href: CHLORINE.path,
    title: 'Chlorine',
    summary: 'The dose of liquid chlorine, cal-hypo or dichlor.',
  },
  {
    href: PUMP.path,
    title: 'Pump size',
    summary: 'The flow to turn your pool over in six hours, as the pool standard sizes it.',
  },
  {
    href: ALKALINITY.path,
    title: 'Alkalinity',
    summary: 'Pounds of baking soda to raise total alkalinity.',
  },
  {
    href: STABILIZER.path,
    title: 'Stabilizer',
    summary: 'Pounds of cyanuric acid to raise your CYA.',
  },
];
