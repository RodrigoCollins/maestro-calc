import { describe, expect, it } from 'vitest';
import { edgesOf } from './css-media.ts';

/** The stylesheet `calculator.css` sets the counts on `:root`, in rem breakpoints. */
const ROOT =
  ':root{--answer-lines:5;--notice-lines:6}@media(min-width:24.125rem){:root{--answer-lines:4}}@media(min-width:22.25rem){:root{--notice-lines:5}}';

/** A page head style sets them on `.calculator`, at its own breakpoints. */
const CALCULATOR =
  '.calculator{--answer-lines:3}@media(min-width:40rem){.calculator{--answer-lines:2}}';

describe('edgesOf (calculator-page › [CP60], design K11)', () => {
  // spec: calculator-page › [CP60] a property set on `.calculator` takes only those breakpoints
  it('returns the breakpoints of the `.calculator` rules when the property is set there', () => {
    expect(edgesOf(`${ROOT}${CALCULATOR}`, '--answer-lines')).toEqual([40]);
  });

  // spec: calculator-page › [CP60] a property not set on `.calculator` falls back to the `:root` rules
  it('returns the `:root` breakpoints when the property is not set on `.calculator`', () => {
    expect(edgesOf(`${ROOT}${CALCULATOR}`, '--notice-lines')).toEqual([22.25]);
    expect(edgesOf(ROOT, '--answer-lines')).toEqual([24.125]);
  });

  it('sorts and de-duplicates, and reads both syntaxes of a condition', () => {
    const css =
      '@media (width>=30rem){.calculator{--answer-lines:2}}@media(min-width:20rem){.calculator{--answer-lines:3}}@media (min-width: 30rem){.calculator{--answer-lines:1}}';
    expect(edgesOf(css, '--answer-lines')).toEqual([20, 30]);
  });

  it('returns nothing for a property no rule sets', () => {
    expect(edgesOf(ROOT, '--other')).toEqual([]);
  });

  it('keeps a `.calculator` selector that is one of a list', () => {
    expect(
      edgesOf('@media(min-width:9rem){.a,.calculator{--answer-lines:2}}', '--answer-lines'),
    ).toEqual([9]);
  });
});
