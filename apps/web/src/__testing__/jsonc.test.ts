import { describe, expect, it } from 'vitest';
import { parseJsonc, readJsonc } from './jsonc.ts';

describe('JSONC reader', () => {
  it('reads comments and trailing commas, which wrangler.jsonc uses', () => {
    expect(
      parseJsonc('// leading\n{ "a": 1, /* inline */ "b": [1, 2,], "c": { "d": "x", }, }'),
    ).toEqual({ a: 1, b: [1, 2], c: { d: 'x' } });
  });

  it('reads plain JSON the same way', () => {
    expect(parseJsonc('{"a":{"b":true}}')).toEqual({ a: { b: true } });
  });

  it('throws on text that is not JSONC, naming the problem', () => {
    expect(() => parseJsonc('{ "a": }')).toThrow(/Expression expected/);
  });

  it('reads the repository wrangler.jsonc relative to the repository root', () => {
    expect(readJsonc('wrangler.jsonc')).toMatchObject({ name: 'maestro-calc' });
  });
});
