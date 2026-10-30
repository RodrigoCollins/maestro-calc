import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import ConcreteScript from '../islands/ConcreteScript.astro';
import DrywallScript from '../islands/DrywallScript.astro';
import GravelScript from '../islands/GravelScript.astro';
import MulchScript from '../islands/MulchScript.astro';
import PaintScript from '../islands/PaintScript.astro';
import RectangleAreaScript from '../islands/RectangleAreaScript.astro';
import RoofPitchScript from '../islands/RoofPitchScript.astro';
import TopsoilScript from '../islands/TopsoilScript.astro';
import type { CalculatorPageId } from '../routing/templates.ts';

/**
 * The one script component of each calculator page (design C10, K7). A calculator page without a
 * row here is a type error, and the `pages` test checks that the keys are the page ids.
 */
export const SCRIPTS = {
  concrete: ConcreteScript,
  'rectangle-area': RectangleAreaScript,
  gravel: GravelScript,
  mulch: MulchScript,
  topsoil: TopsoilScript,
  paint: PaintScript,
  drywall: DrywallScript,
  'roof-pitch': RoofPitchScript,
} as const satisfies Record<CalculatorPageId, AstroComponentFactory>;
