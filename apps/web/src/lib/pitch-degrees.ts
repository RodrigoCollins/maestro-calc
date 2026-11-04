import type { OutputDescriptor } from '@maestro-calc/core';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import type { Locale } from '@maestro-calc/i18n';
import { createTranslator } from '@maestro-calc/i18n';
import { enRoofPitch } from '@maestro-calc/i18n/catalogs/en/roof-pitch';
import { esRoofPitch } from '@maestro-calc/i18n/catalogs/es/roof-pitch';
import { outputText } from '../calculator/present.ts';
import { isJobPage } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import { siteText } from './site-text.ts';

/*
 * The roof pitch to degrees table of the roofing hub (growth plan, lever 1): every whole pitch from
 * 1/12 to 12/12 with its angle, worked out at build time by the engine the roof pitch calculator
 * runs. A pitch that has a job page links to it.
 */

export interface PitchDegreesRow {
  /** The pitch as a roofer writes it: `6/12`. */
  readonly pitch: string;
  /** The angle as the calculator shows it: `26.57°`. */
  readonly angle: string;
  /** The job page of the pitch, when it has one. */
  readonly href: string | undefined;
}

export interface PitchDegreesView {
  readonly heading: string;
  readonly note: string;
  readonly columns: readonly [string, string];
  readonly rows: readonly PitchDegreesRow[];
}

/** The rises of the table, in inches per 12 in of run. */
const RISES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

const catalogs = { en: createTranslator(enRoofPitch), es: createTranslator(esRoofPitch) };

const angleOutput = (): OutputDescriptor => {
  const output = roofPitch.outputs.find(({ key }) => key === 'angle');
  if (output === undefined) throw new Error('the roof pitch engine has no angle output');
  return output;
};

/** The angle of `rise` in 12, from the engine: a rise it rejects is a programming error. */
const angleOf = (rise: number): string => {
  const result = roofPitch.validate({ rise: `${String(rise)}in`, run: '12in' });
  if (!result.ok) throw new Error(`invalid pitch: ${String(rise)}/12`);
  return outputText(angleOutput(), roofPitch.compute(result.value).outputs.angle);
};

export const pitchDegreesView = (locale: Locale): PitchDegreesView => {
  const text = siteText(locale);
  const calc = catalogs[locale];
  return {
    heading: text('site.pitchDegrees.heading'),
    note: text('site.pitchDegrees.note'),
    columns: [text('site.pitchDegrees.pitch'), calc('calc.roof-pitch.outputs.angle')],
    rows: RISES.map((rise) => {
      const job = `roof-pitch-${String(rise)}-12`;
      return {
        pitch: `${String(rise)}/12`,
        angle: calc('calc.roof-pitch.page.angle', { value: angleOf(rise) }),
        href: isJobPage(job) ? pathOf(job, locale) : undefined,
      };
    }),
  };
};
