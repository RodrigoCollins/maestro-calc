import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { describe, expect, it } from 'vitest';
import { concretePage } from '../../calculator/concrete/page.ts';
import { definePage } from '../../calculator/page-module.ts';
import { shownFigures } from './shown-figures.ts';

// the real page module of rectangle-area arrives with its page change; the figures need none of it
const area = definePage({ calculator: rectangleArea });

describe('shownFigures (calculator-page › [CP9]): the figures the controller panel shows for a link', () => {
  // spec: calculator-page › [CP9] the example state runs through the page's own controller
  it.each([
    ['v=1&l=144', ['120.00', '13.33', '11.15']],
    ['v=1', ['100.00', '11.11', '9.29']],
    ['?v=1&l=144', ['120.00', '13.33', '11.15']],
  ])('gives the three areas of rectangle-area for %s', (query, expected) => {
    const { figures, shopping } = shownFigures(area, query);
    expect([figures['areaFt2'], figures['areaYd2'], figures['areaM2']]).toEqual(expected);
    expect(shopping).toEqual([]);
  });

  it('gives the volumes and the bags of concrete in its default state', () => {
    const { figures, shopping } = shownFigures(concretePage, '');
    expect([figures['netVolume'], figures['volumeFt3'], figures['volumeYd3']]).toEqual([
      '40.00',
      '44.00',
      '1.63',
    ]);
    expect(shopping).toEqual(['74']);
  });

  it('shows what the controller shows, not what the engine returns for the same link', () => {
    // the metric toggle is a display choice: the panel still lists every area, in order
    expect(Object.keys(shownFigures(area, 'v=1&u=m').figures)).toEqual([
      'areaFt2',
      'areaYd2',
      'areaM2',
    ]);
  });
});
