import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enRoofPitch } from '@maestro-calc/i18n/catalogs/en/roof-pitch';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esRoofPitch } from '@maestro-calc/i18n/catalogs/es/roof-pitch';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { roofPitchPage } from './page.ts';

const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enRoofPitch, ...enSite }
      : { ...esCommon, ...esRoofPitch, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(roofPitchPage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/roof-pitch-calculator',
    switchPath: '/es/calculadora-de-pendiente-de-techo',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(roofPitchPage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-roof-pitch › [RP2]–[RP5]): 6 in over 12 in is 6 in 12, atan(1/2) = 26.57°,
 * and meets every covering but slate; 3 in 12 (14.04°) is above asphalt's 2 in 12 but below 4 in 12,
 * so two layers of underlayment; 1 in 12 (4.76°) is below asphalt's 2 in 12. The rafter over 12 ft
 * plus a 12 in overhang is 156 in × √1.25 = 14.53 ft.
 */
describe('roof pitch page: the answer through the controller (calc-roof-pitch)', () => {
  it.each([
    [
      'en',
      '?v=1',
      'A 6 in rise over a 1 ft run is a 6.00 in 12 pitch, 26.57°. It meets the IRC minimum slope for the chosen covering.',
    ],
    [
      'es',
      '?v=1',
      'Una subida de 6 in sobre un recorrido de 1 ft es una pendiente de 6.00 en 12, 26.57°. Cumple la pendiente mínima del IRC para la cubierta elegida.',
    ],
    [
      'en',
      '?v=1&r=3',
      'A 3 in rise over a 1 ft run is a 3.00 in 12 pitch, 14.04°. The IRC asks for two layers of underlayment for the chosen covering.',
    ],
    [
      'es',
      '?v=1&r=1',
      'Una subida de 1 in sobre un recorrido de 1 ft es una pendiente de 1.00 en 12, 4.76°. Está por debajo del mínimo del IRC de 2 en 12 para la cubierta elegida.',
    ],
    [
      'en',
      '?v=1&r=3&c=slate',
      'A 3 in rise over a 1 ft run is a 3.00 in 12 pitch, 14.04°. It is below the IRC minimum of 4 in 12 for the chosen covering.',
    ],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the pitch as the large figure, the angle in metric, and the rafter', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'pitch', value: '6.00' });
    expect(view.panel.figures).toMatchObject({ angle: '26.57', rafter: '14.53', rafterM: '4.43' });
    expect(viewOf('en', '?v=1&u=m').panel.primary).toMatchObject({ key: 'angle', value: '26.57' });
  });
});
