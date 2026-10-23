import { describe, expect, it } from 'vitest';
import { catalogProblems as problemsOf } from './__testing__/catalog-problems.ts';

describe('catalog modules (i18n-catalog › Catalog completeness and hygiene)', () => {
  // spec: Missing Spanish key fails the build [IN9b]
  it('reports a key with no es counterpart, and an es key absent from en', () => {
    expect(problemsOf({ 'a.one': 'One', 'a.two': 'Two' }, { 'a.one': 'Uno' })).toEqual([
      'a.two: missing in es',
    ]);
    expect(problemsOf({ 'a.one': 'One' }, { 'a.one': 'Uno', 'a.two': 'Dos' })).toEqual([
      'a.two: only in es',
    ]);
  });

  // spec: Placeholder mismatch fails [IN10]
  it('reports a placeholder that es lacks', () => {
    expect(problemsOf({ 'a.max': 'Max {max}' }, { 'a.max': 'Máximo' })).toEqual([
      'a.max: placeholders differ',
    ]);
    expect(problemsOf({ 'a.max': 'Max {max}' }, { 'a.max': 'Máximo {max}' })).toEqual([]);
  });

  it('reports empty messages, surrounding whitespace, stray braces and bad keys', () => {
    expect(problemsOf({ 'a.b': 'x' }, { 'a.b': '' })).toEqual(['a.b: empty in es']);
    expect(problemsOf({ 'a.b': '' }, { 'a.b': 'x' })).toEqual(['a.b: empty in en']);
    expect(problemsOf({ 'a.b': ' x' }, { 'a.b': 'x ' })).toEqual([
      'a.b: surrounding whitespace in en',
      'a.b: surrounding whitespace in es',
    ]);
    expect(problemsOf({ 'a.b': 'x {y' }, { 'a.b': 'x y}' })).toEqual([
      'a.b: stray brace in en',
      'a.b: stray brace in es',
    ]);
    expect(
      problemsOf(
        { nodot: 'x', 'a..b': 'x', 'a.b c': 'x' },
        { nodot: 'y', 'a..b': 'y', 'a.b c': 'y' },
      ),
    ).toEqual(['nodot: not a valid key', 'a..b: not a valid key', 'a.b c: not a valid key']);
  });
});
