/** Copy of the `feet-inches` calculator, English: the keys core derives from its descriptors and the page copy. */
export const enFeetInches = {
  'calc.feet-inches.title': 'Feet and Inches Calculator',
  'calc.feet-inches.inputs.first': 'First length',
  'calc.feet-inches.inputs.operation': 'Operation',
  'calc.feet-inches.inputs.second': 'Second length',
  'calc.feet-inches.inputs.factor': 'Number',
  'calc.feet-inches.options.operation.add': 'Add +',
  'calc.feet-inches.options.operation.subtract': 'Subtract −',
  'calc.feet-inches.options.operation.multiply': 'Multiply ×',
  'calc.feet-inches.options.operation.divide': 'Divide ÷',
  'calc.feet-inches.options.operation.fit': 'How many fit',
  'calc.feet-inches.outputs.result': 'Result (feet and inches)',
  'calc.feet-inches.outputs.resultIn': 'Result (inches)',
  'calc.feet-inches.outputs.resultM': 'Result (meters)',
  'calc.feet-inches.outputs.pieces': 'Whole pieces',
  'calc.feet-inches.outputs.ratio': 'First length divided by the second',
  'calc.feet-inches.warnings.secondLonger':
    'The second length is longer than the first: the result is the difference.',
  'calc.feet-inches.warnings.zeroPiece':
    'A second length of zero fits any number of times: enter one above 0.',
  'calc.feet-inches.page.example': 'Example: 12 ft 6 in plus 3 ft 8 1/4 in is 16 ft 2 1/4 in.',
  'calc.feet-inches.page.result': '{value}',
  'calc.feet-inches.page.resultM': '{value} m',
  'calc.feet-inches.page.pieces': '{value} pieces',
  'calc.feet-inches.page.piecesOne': '{value} piece',
  'calc.feet-inches.page.answer.add': '{first} plus {second} is {result}.',
  'calc.feet-inches.page.answer.subtract': '{first} minus {second} is {result}.',
  'calc.feet-inches.page.answer.longer': '{second} is longer than {first} by {result}.',
  'calc.feet-inches.page.answer.multiply': '{first} times {factor} is {result}.',
  'calc.feet-inches.page.answer.divide':
    '{first} divided into {factor} equal parts is {result} each.',
  'calc.feet-inches.page.answer.fit':
    '{first} ÷ {second} = {ratio}: {pieces} whole pieces and {result} left over.',
  'calc.feet-inches.page.answer.fitOne':
    '{first} ÷ {second} = {ratio}: 1 whole piece and {result} left over.',
  'calc.feet-inches.page.answer.zeroPiece':
    'Enter a second length above 0 to see how many fit in {first}.',
} as const;
