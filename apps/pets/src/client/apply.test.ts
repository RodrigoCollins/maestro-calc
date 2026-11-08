import { describe, expect, it } from 'vitest';
import type { Patch } from '../calc/view.ts';
import { applyPatch, type Target } from './apply.ts';

interface Node {
  textContent: string | null;
  innerHTML: string;
  hidden: boolean;
  dataset: Record<string, string | undefined>;
  style: { vars: Record<string, string>; setProperty(name: string, value: string): void };
}

const node = (): Node => {
  const vars: Record<string, string> = {};
  return {
    textContent: null,
    innerHTML: '',
    hidden: false,
    dataset: {},
    style: {
      vars,
      setProperty: (name, value) => {
        vars[name] = value;
      },
    },
  };
};

const page = (): { target: Target; nodes: Record<string, Node[]> } => {
  const nodes: Record<string, Node[]> = {
    '[data-text="figure"]': [node(), node()],
    '[data-html="bowl"]': [node()],
    '[data-show="wet"]': [node()],
    '[data-result]': [node()],
  };
  return { nodes, target: { querySelectorAll: (selector) => nodes[selector] ?? [] } };
};

const patch: Patch = {
  text: { figure: '2 ¾', missing: 'x' },
  html: { bowl: '<svg></svg>' },
  show: { wet: false },
  vars: { pos: '9%' },
  flags: { band: '2' },
};

describe('applyPatch', () => {
  it('writes the text into every element that names it', () => {
    const { target, nodes } = page();
    applyPatch(target, patch);
    expect(nodes['[data-text="figure"]']?.map((n) => n.textContent)).toEqual(['2 ¾', '2 ¾']);
  });

  it('writes the markup of a drawing', () => {
    const { target, nodes } = page();
    applyPatch(target, patch);
    expect(nodes['[data-html="bowl"]']?.[0]?.innerHTML).toBe('<svg></svg>');
  });

  it('hides what is not shown, and shows what is', () => {
    const { target, nodes } = page();
    applyPatch(target, patch);
    expect(nodes['[data-show="wet"]']?.[0]?.hidden).toBe(true);
    applyPatch(target, { ...patch, show: { wet: true } });
    expect(nodes['[data-show="wet"]']?.[0]?.hidden).toBe(false);
  });

  it('sets the variables and flags on the result', () => {
    const { target, nodes } = page();
    applyPatch(target, patch);
    expect(nodes['[data-result]']?.[0]?.style.vars).toEqual({ '--pos': '9%' });
    expect(nodes['[data-result]']?.[0]?.dataset).toEqual({ band: '2' });
  });
});
