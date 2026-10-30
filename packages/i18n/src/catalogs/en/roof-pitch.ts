/** Copy of the `roof-pitch` calculator, English: the keys core derives from its descriptors and the page copy. */
export const enRoofPitch = {
  'calc.roof-pitch.title': 'Roof Pitch Calculator',
  'calc.roof-pitch.inputs.rise': 'Rise',
  'calc.roof-pitch.inputs.run': 'Run',
  'calc.roof-pitch.inputs.rafterRun': 'Rafter run (half the span)',
  'calc.roof-pitch.inputs.overhang': 'Overhang',
  'calc.roof-pitch.inputs.covering': 'Roof covering',
  'calc.roof-pitch.options.covering.asphalt': 'Asphalt',
  'calc.roof-pitch.options.covering.tile': 'Tile',
  'calc.roof-pitch.options.covering.metal': 'Metal',
  'calc.roof-pitch.options.covering.roll': 'Roll',
  'calc.roof-pitch.options.covering.slate': 'Slate',
  'calc.roof-pitch.options.covering.wood': 'Wood',
  'calc.roof-pitch.outputs.pitch': 'Pitch (rise in inches per 12 in of run)',
  'calc.roof-pitch.outputs.angle': 'Angle (degrees)',
  'calc.roof-pitch.outputs.rafter': 'Rafter length (feet)',
  'calc.roof-pitch.outputs.rafterM': 'Rafter length (meters)',
  'calc.roof-pitch.page.example':
    'Example: a rise of 6 in over a run of 12 in is a pitch of 6 in 12, 26.57°, and a 14.53 ft rafter over 13 ft of run.',
  'calc.roof-pitch.page.pitch': '{value} in 12',
  'calc.roof-pitch.page.angle': '{value}°',
  'calc.roof-pitch.page.answer.meets':
    'A rise of {rise} over a run of {run} gives a pitch of {pitch} in 12, {angle}. It meets the IRC minimum slope for the chosen covering.',
  'calc.roof-pitch.page.answer.double':
    'A rise of {rise} over a run of {run} gives a pitch of {pitch} in 12, {angle}. The IRC asks for two layers of underlayment for the chosen covering.',
  'calc.roof-pitch.page.answer.below':
    'A rise of {rise} over a run of {run} gives a pitch of {pitch} in 12, {angle}. It is below the IRC minimum of {minimum} in 12 for the chosen covering.',
  'calc.roof-pitch.warnings.belowMinimum':
    'Below the IRC minimum slope for this covering ({minimum} in 12).',
  'calc.roof-pitch.warnings.doubleUnderlayment':
    'The IRC asks for two layers of underlayment below 4 in 12 for this covering.',
} as const;
