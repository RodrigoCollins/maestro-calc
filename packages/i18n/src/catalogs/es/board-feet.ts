import type { CatalogOf } from '../../translate.ts';
import type { enBoardFeet } from '../en/board-feet.ts';

/** Copy of the `board-feet` calculator, Spanish: the same keys as English. */
export const esBoardFeet = {
  'calc.board-feet.title': 'Calculadora de pies tablares',
  'calc.board-feet.inputs.thickness': 'Grosor',
  'calc.board-feet.inputs.width': 'Ancho',
  'calc.board-feet.inputs.length': 'Largo',
  'calc.board-feet.inputs.pieces': 'Piezas',
  'calc.board-feet.inputs.price': 'Precio por pie tablar ($)',
  'calc.board-feet.outputs.boardFeet': 'Pies tablares (todas las piezas)',
  'calc.board-feet.outputs.boardFeetEach': 'Pies tablares por pieza',
  'calc.board-feet.outputs.volumeFt3': 'Volumen (pies cúbicos)',
  'calc.board-feet.outputs.volumeM3': 'Volumen (metros cúbicos)',
  'calc.board-feet.outputs.cost': 'Costo de la madera',
  'calc.board-feet.page.example': 'Ejemplo: un 2x4x8 tiene 5.33 pies tablares.',
  'calc.board-feet.page.boardFeet': '{value} pies tablares',
  'calc.board-feet.page.priceHint': 'Agrega tu precio para ver el costo',
  'calc.board-feet.page.answer.one':
    'Una pieza de {thickness} por {width} y {length} de largo tiene {total}.',
  'calc.board-feet.page.answer.many':
    '{pieces} piezas de {thickness} por {width} y {length} de largo tienen {total}: {each} pies tablares cada una.',
  'calc.board-feet.page.drawing.note': '{thickness} de grosor',
} as const satisfies CatalogOf<typeof enBoardFeet>;
