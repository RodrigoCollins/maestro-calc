/** Copy of the `roofing` calculator, English: the keys core derives from its descriptors and the page copy. */
export const enRoofing = {
  'calc.roofing.title': 'Roofing Calculator',
  'calc.roofing.inputs.length': 'Length (with overhangs)',
  'calc.roofing.inputs.width': 'Width (with overhangs)',
  'calc.roofing.inputs.pitch': 'Pitch (rise in 12)',
  'calc.roofing.inputs.waste': 'Extra (%)',
  'calc.roofing.inputs.bundlePrice': 'Price per bundle ($)',
  'calc.roofing.inputs.rollPrice': 'Price per underlayment roll ($)',
  'calc.roofing.outputs.squares': 'Roof area (squares)',
  'calc.roofing.outputs.areaFt2': 'Roof area (square feet)',
  'calc.roofing.outputs.areaM2': 'Roof area (square meters)',
  'calc.roofing.outputs.shinglesCost': 'Cost of the shingles',
  'calc.roofing.outputs.underlaymentCost': 'Cost of the underlayment',
  'calc.roofing.warnings.belowMinimum':
    'Below the IRC minimum slope for asphalt shingles ({minimum} in 12).',
  'calc.roofing.warnings.doubleUnderlayment':
    'The IRC asks for two layers of underlayment below 4 in 12; the rolls count both.',
  'calc.roofing.page.example':
    'Example: a 40 ft by 30 ft footprint at 6 in 12 has 13.42 squares of roof: 45 bundles of shingles and 2 rolls of underlayment.',
  'calc.roofing.page.squares': '{value} squares',
  'calc.roofing.page.areaM2': '{value} m²',
  'calc.roofing.page.shoppingShingles': 'Asphalt shingles, bundles (3 a square)',
  'calc.roofing.page.shoppingUnderlayment': 'Synthetic underlayment, 10-square rolls',
  'calc.roofing.page.priceHint': 'Add your price to see the cost',
  'calc.roofing.page.answer.meets':
    'A {length} by {width} footprint at {pitch} in 12 has {area} of roof. Bundles of shingles: {bundles}. Rolls of underlayment: {rolls}.',
  'calc.roofing.page.answer.double':
    'A {length} by {width} footprint at {pitch} in 12 has {area} of roof. Bundles of shingles: {bundles}. Rolls of underlayment in two layers, as the IRC asks below 4 in 12: {rolls}.',
  'calc.roofing.page.answer.below':
    'A {length} by {width} footprint at {pitch} in 12 has {area} of roof. That is below the IRC minimum of {minimum} in 12 for asphalt shingles: choose another covering.',
  'calc.roofing.page.drawing.note': '{pitch} in 12 pitch',
} as const;
