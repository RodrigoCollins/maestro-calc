/** Copy of the `roofing` calculator, English: the keys core derives from its descriptors and the page copy. */
export const enRoofing = {
  'calc.roofing.title': 'Roofing Calculator',
  'calc.roofing.inputs.length': 'Footprint length (with overhangs)',
  'calc.roofing.inputs.width': 'Footprint width (with overhangs)',
  'calc.roofing.inputs.pitch': 'Pitch (rise in 12)',
  'calc.roofing.inputs.waste': 'Extra (%)',
  'calc.roofing.inputs.bundlePrice': 'Price per bundle ($)',
  'calc.roofing.inputs.rollPrice': 'Price per underlayment roll ($)',
  'calc.roofing.outputs.squares': 'Roof area (squares)',
  'calc.roofing.outputs.areaFt2': 'Roof area (square feet)',
  'calc.roofing.outputs.areaM2': 'Roof area (square meters)',
  'calc.roofing.outputs.cost': 'Shingles and underlayment cost',
  'calc.roofing.warnings.belowMinimum':
    'Below the IRC minimum slope for asphalt shingles ({minimum} in 12).',
  'calc.roofing.warnings.doubleUnderlayment':
    'The IRC asks for two layers of underlayment below 4 in 12; the rolls count both.',
} as const;
