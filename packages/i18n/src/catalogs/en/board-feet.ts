/** Copy of the `board-feet` calculator, English: the keys core derives from its descriptors and the page copy. */
export const enBoardFeet = {
  'calc.board-feet.title': 'Board Feet Calculator',
  'calc.board-feet.inputs.thickness': 'Thickness',
  'calc.board-feet.inputs.width': 'Width',
  'calc.board-feet.inputs.length': 'Length',
  'calc.board-feet.inputs.pieces': 'Pieces',
  'calc.board-feet.inputs.price': 'Price per board foot ($)',
  'calc.board-feet.outputs.boardFeet': 'Board feet (all pieces)',
  'calc.board-feet.outputs.boardFeetEach': 'Board feet per piece',
  'calc.board-feet.outputs.volumeFt3': 'Volume (cubic feet)',
  'calc.board-feet.outputs.volumeM3': 'Volume (cubic meters)',
  'calc.board-feet.outputs.cost': 'Cost of the lumber',
  'calc.board-feet.page.example': 'Example: a 2x4x8 is 5.33 board feet.',
  'calc.board-feet.page.boardFeet': '{value} board feet',
  'calc.board-feet.page.priceHint': 'Add your price to see the cost',
  'calc.board-feet.page.answer.one': 'A {thickness} by {width} board {length} long is {total}.',
  'calc.board-feet.page.answer.many':
    '{pieces} boards of {thickness} by {width}, {length} long, are {total}: {each} board feet each.',
  'calc.board-feet.page.drawing.note': '{thickness} thick',
} as const;
