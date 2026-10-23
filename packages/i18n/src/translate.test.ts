import { describe, expect, it } from 'vitest';
import {
  createTranslator,
  hasStrayBraces,
  I18N_ERROR_CODES,
  I18nError,
  placeholdersOf,
} from './translate.ts';

const catalog = {
  'test.max': 'Max {max} items',
  'test.range': 'From {low} to {high}, then {low} again',
  'test.plain': 'Hello',
} as const;

/** The code of the error thrown by `action`, or `undefined` when nothing is thrown. */
const codeThrownBy = (action: () => unknown): unknown => {
  try {
    action();
  } catch (error) {
    return error instanceof I18nError ? error.code : error;
  }
  return undefined;
};

/** A translator seen through the type system's back door, the way a cast caller would use it. */
const loose = (source: Readonly<Record<string, string>>) =>
  createTranslator(source) as unknown as (key: string, params?: object) => string;

describe('createTranslator (i18n-catalog › Message resolution)', () => {
  const t = createTranslator(catalog);

  // spec: Interpolation [IN8]
  it('replaces a placeholder with the string form of the same-named param', () => {
    expect(t('test.max', { max: '100' })).toBe('Max 100 items');
    expect(t('test.max', { max: 7 })).toBe('Max 7 items');
    expect(t('test.range', { low: '1', high: '9' })).toBe('From 1 to 9, then 1 again');
    expect(t('test.plain')).toBe('Hello');
  });

  // spec: Interpolation [IN8]: a missing param is a programming error
  it('throws MISSING_PARAM when a param is absent, naming the key and the param', () => {
    const untyped = loose(catalog);
    expect(codeThrownBy(() => untyped('test.max', {}))).toBe('MISSING_PARAM');
    expect(codeThrownBy(() => untyped('test.max'))).toBe('MISSING_PARAM');
    expect(codeThrownBy(() => untyped('test.range', { low: '1' }))).toBe('MISSING_PARAM');
    expect(() => untyped('test.max', {})).toThrow('MISSING_PARAM: test.max needs {max}');
  });

  it('does not take a param from the prototype of the params object', () => {
    const inherited = createTranslator({ 'test.proto': 'Value {toString}' });
    expect(codeThrownBy(() => inherited('test.proto', {} as never))).toBe('MISSING_PARAM');
  });

  // spec: Interpolation [IN8]: extra params are ignored, values are inserted verbatim
  it('ignores extra params and never rescans an inserted value', () => {
    const params = { max: '{x}', extra: 1 };
    expect(t('test.max', params)).toBe('Max {x} items');
    expect(t('test.max', { max: '$& $1 {max}' })).toBe('Max $& $1 {max} items');
  });

  // spec: Unknown key at runtime [IN7]
  it('throws MISSING_MESSAGE for a key absent from the catalog, with no locale fallback', () => {
    const en = createTranslator({ 'test.only': 'Only in English' });
    const es = loose({});
    expect(en('test.only')).toBe('Only in English');
    expect(codeThrownBy(() => es('test.only'))).toBe('MISSING_MESSAGE');
    expect(() => es('test.only')).toThrow('MISSING_MESSAGE: test.only');
  });

  it('does not resolve a key through the prototype of the catalog', () => {
    const untyped = loose(catalog);
    expect(codeThrownBy(() => untyped('toString'))).toBe('MISSING_MESSAGE');
    expect(codeThrownBy(() => untyped('constructor'))).toBe('MISSING_MESSAGE');
  });
});

describe('I18nError and the error codes', () => {
  it('lists the two programming-error codes', () => {
    expect(I18N_ERROR_CODES).toEqual(['MISSING_MESSAGE', 'MISSING_PARAM']);
  });

  it('is an Error carrying its code', () => {
    const error = new I18nError('MISSING_MESSAGE', 'detail');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('I18nError');
    expect(error.code).toBe('MISSING_MESSAGE');
    expect(error.message).toBe('MISSING_MESSAGE: detail');
  });
});

describe('placeholders (i18n-catalog › Catalog completeness and hygiene)', () => {
  it('lists the distinct placeholder names of a message, sorted', () => {
    expect(placeholdersOf('From {low} to {high}, then {low} again')).toEqual(['high', 'low']);
    expect(placeholdersOf('Hello')).toEqual([]);
    expect(placeholdersOf('{a1}{B}')).toEqual(['B', 'a1']);
  });

  it('ignores braces that are not placeholders', () => {
    expect(placeholdersOf('{1x} {a-b} {} { a }')).toEqual([]);
  });

  it('finds a brace that is not part of a placeholder', () => {
    expect(hasStrayBraces('Max {max}')).toBe(false);
    expect(hasStrayBraces('Hello')).toBe(false);
    expect(hasStrayBraces('Max {max')).toBe(true);
    expect(hasStrayBraces('Max max}')).toBe(true);
    expect(hasStrayBraces('{1x}')).toBe(true);
    expect(hasStrayBraces('{}')).toBe(true);
  });
});
