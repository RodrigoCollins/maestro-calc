import { inch, m, quantity, Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { lengthFieldText } from '../format.ts';
import { depthText, sideViewOf } from './side-view.ts';
import { VOLUME_TEXTS, VOLUME_TEXTS_ES } from './texts.ts';

// The pool volume page in metric: core's own unit system (`u=m`), so a bare number is metres and a
// URL keeps its lengths in inches; the large figure becomes litres.
describe('the pool volume page in metric', () => {
  it('reads a depth in metres, as an Australian depth marker does', () => {
    expect(depthText(42, 'metric')).toBe('1.07 M');
    expect(depthText(96, 'metric')).toBe('2.44 M');
    expect(depthText(quantityInches(2), 'metric')).toBe('2 M');
    expect(depthText(quantityInches(1.5), 'metric')).toBe('1.5 M');
  });

  it('writes a length field in metres to the centimetre', () => {
    expect(lengthFieldText(quantity(10, m), 'metric')).toBe('10 m');
    expect(lengthFieldText(quantity(Rational.of(5, 2), m), 'metric')).toBe('2.5 m');
    expect(lengthFieldText(quantity(42, inch), 'metric')).toBe('1.07 m');
    expect(lengthFieldText(quantity(42, inch))).toBe('3 ft 6 in');
  });

  it('draws the side view with metre markers and names it in metres', () => {
    const view = sideViewOf({ length: 384, shallow: 42, deep: 96 }, 'en', 'metric');
    expect(view.markers.map(({ text }) => text)).toEqual(['1.07 M', '2.44 M']);
    expect(view.length).toBe('9.75 M');
    expect(view.name).toContain('9.75 m long, 1.07 m deep at the shallow end and 2.44 m');
  });

  it('labels the units choice and the metric figures in both languages', () => {
    expect(VOLUME_TEXTS.units).toEqual({
      label: 'Units',
      options: { us: 'US: feet, gallons', metric: 'Metric: metres, litres' },
    });
    expect(VOLUME_TEXTS.metric).toEqual({
      unit: 'LITRES',
      rows: { liters: 'Gallons', cubicFeet: 'Cubic metres' },
    });
    expect(VOLUME_TEXTS_ES.units).toEqual({
      label: 'Unidades',
      options: { us: 'EE. UU.: pies, galones', metric: 'Métrico: metros, litros' },
    });
    expect(VOLUME_TEXTS_ES.metric).toEqual({
      unit: 'LITROS',
      rows: { liters: 'Galones', cubicFeet: 'Metros cúbicos' },
    });
  });
});

/** Metres as inches, the unit the drawing takes. */
function quantityInches(metres: number): number {
  return (metres * 5000) / 127;
}
