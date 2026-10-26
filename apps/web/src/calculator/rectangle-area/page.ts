import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { definePage } from '../page-module.ts';

/** The rectangle-area page module: only its definition and no slot. Not routed yet (headless proof). */
export const rectangleAreaPage = definePage({ calculator: rectangleArea });
