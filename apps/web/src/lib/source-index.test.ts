import { describe, expect, it } from 'vitest';
import { sourceIndex } from './source-index.ts';

const nist = { name: 'NIST SP 811', url: 'https://www.nist.gov/pml/special-publication-811' };
const quikrete = { name: 'QUIKRETE 1101', url: 'https://www.quikrete.com/1101.pdf' };
const irc = { name: 'IRC 2021 R905', url: 'https://codes.iccsafe.org/r905' };

describe('source index of the editorial policy', () => {
  it('lists every source of the calculators once, in the order first met', () => {
    expect(
      sourceIndex([
        { sources: [quikrete, nist] },
        { sources: [{ ...nist, name: 'NIST SP 811, Appendix B' }, irc] },
      ]),
    ).toEqual([quikrete, nist, irc]);
  });

  it('is empty when no calculator has an entry', () => {
    expect(sourceIndex([])).toEqual([]);
  });
});
