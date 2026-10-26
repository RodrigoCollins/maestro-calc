import { describe, expect, it } from 'vitest';
import { errorId, helpId, hintId, inputId, labelId } from './ids.ts';

describe('field ids (calculator-page › [CP46])', () => {
  // spec: calculator-page › [CP46] an input, its hint, its help and its message have ids
  it('names the input, hint, help and error elements of a field', () => {
    expect(inputId('length')).toBe('calc-length');
    expect(hintId('length')).toBe('calc-length-hint');
    expect(helpId('waste')).toBe('calc-waste-help');
    expect(errorId('length')).toBe('calc-length-error');
  });

  // spec: calculator-web-core › [CWC2] the choice group label id follows the select key
  it('names the label element of a choice group', () => {
    expect(labelId('shape')).toBe('calc-shape-label');
  });
});
