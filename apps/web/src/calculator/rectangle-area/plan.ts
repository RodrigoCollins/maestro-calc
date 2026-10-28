import { inch, valueIn, type UnitSystem } from '@maestro-calc/core';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { required } from '../controller.ts';
import type { Frame, Ready } from '../page-module.ts';
import { dimensionText, outputText } from '../present.ts';
import { rectanglePlan, type Plan } from '../slots/drawing.ts';

/*
 * The plan of the square footage page (blueprint-drawing › [BD1]): the rectangle of the last valid
 * length and width, the length along the top, the width on the left and the area inside. Pure and
 * language-free: the labels are the language-free texts of the answer, the area is the panel figure
 * with its unit symbol, and the name is the page message `drawing`.
 */

/** The viewBox of the drawing, the same in every state. */
export const FRAME: Frame = { width: 300, height: 200 };

const SYSTEMS: readonly UnitSystem[] = ['imperial', 'metric'];

/** The output the area label shows, and its unit symbol, per unit system. */
const AREAS = {
  imperial: { key: 'areaFt2', symbol: 'ft²' },
  metric: { key: 'areaM2', symbol: 'm²' },
} as const;

/** The panel figure of the area in the unit system of the moment: `100.00 ft²`. */
const areaText = ({ system, result }: Ready<typeof rectangleArea>): string => {
  const { key, symbol } = AREAS[system];
  const descriptor = required(
    rectangleArea.outputs.find((output) => output.key === key),
    key,
  );
  const output = required(
    result.outputs.find((found) => found.key === key),
    key,
  );
  return `${outputText(descriptor, output.value)} ${symbol}`;
};

/** The plan of a ready moment. */
export const planOf = (moment: Ready<typeof rectangleArea>): Plan => {
  const { valid, system } = moment;
  const texts = {
    length: dimensionText(valid.length, system),
    width: dimensionText(valid.width, system),
    area: areaText(moment),
  };
  return rectanglePlan(FRAME, {
    length: valueIn(valid.length, inch).toNumber(),
    width: valueIn(valid.width, inch).toNumber(),
    texts,
    // the gutter holds the width label of either system, so the unit toggle moves nothing ([BD11])
    widest: SYSTEMS.map((each) => dimensionText(valid.width, each)),
    name: { message: 'drawing', fills: texts },
  });
};
