import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { collectStrings } from '../../__testing__/collect-strings.ts';
import { isLanguageFree } from '../../__testing__/language-free.ts';
import { createConcrete } from './index.ts';

const concrete = createConcrete(CONCRETE_YIELDS);

describe('concrete result shape (calc-concrete › Language-free result)', () => {
  // spec: calc-concrete › [CC26] Language-free
  it.each([
    ['S1', {}],
    ['C2', { shape: 'column', count: '4' }],
    ['T1', { shape: 'steps', bagPrice: '6.50', readyMixPrice: '150' }],
  ])('holds only identifiers, canonical Rationals and USD in the case %s', (_name, raw) => {
    const result = concrete.run(raw);
    if (!result.ok) throw new Error('run failed');
    const strings = collectStrings(result.value);
    expect(strings.length).toBeGreaterThan(10);
    expect(strings).toContain('concrete-mix');
    expect(strings).toContain('bag-80');
    expect(strings).toContain('USD');
    expect(strings.filter((text) => !isLanguageFree(text))).toEqual([]);
  });
});
