import { describe, expect, it } from 'vitest';
import { contrast, DARK, declarationsOf, LIGHT, type Tokens } from './tokens.ts';

/** Every pair a page draws text on, as [text token, background token]. */
const TEXT_PAIRS: readonly (readonly [keyof Tokens, keyof Tokens])[] = [
  ['ink', 'ground'],
  ['ink', 'card'],
  ['link', 'ground'],
  ['link', 'card'],
  ['muted', 'ground'],
  ['muted', 'card'],
  ['onStripe', 'stripeA'],
  ['onStripe', 'stripeB'],
  ['onYellow', 'yellow'],
  ['onDeep', 'deep'],
  ['onStripe', 'deep'],
  ['warn', 'ground'],
  ['warn', 'card'],
];

describe('contrast', () => {
  it('measures the WCAG ratio: black on white is 21, a colour on itself is 1', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrast('#FFFFFF', '#000000')).toBeCloseTo(21, 5);
    expect(contrast('#336699', '#336699')).toBeCloseTo(1, 5);
  });
});

describe.each([
  ['light', LIGHT],
  ['dark', DARK],
] as const)('%s tokens', (_name, tokens) => {
  it.each(TEXT_PAIRS)('puts %s text on %s at 4.5:1 or more', (text, background) => {
    expect(contrast(tokens[text], tokens[background])).toBeGreaterThanOrEqual(4.5);
  });
});

describe('declarationsOf', () => {
  it('writes each token as a kebab-case custom property', () => {
    expect(declarationsOf(LIGHT)).toContain('--on-stripe: #F6F1E4;');
    expect(declarationsOf(LIGHT)).toContain('--stripe-a: #2E6B34;');
  });
});
