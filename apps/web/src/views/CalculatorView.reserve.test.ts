import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { drawingCss, reserveCss, type Reserve } from '../lib/reserve.ts';
import CalculatorView from './CalculatorView.astro';

/** A reserve the concrete row does not have: the view must emit it, byte for byte, in the head. */
const FIXTURE: Reserve = { answer: [5, [30, 4]], notice: [6, [20, 5]] };

const row = vi.hoisted(() => ({ reserve: undefined as Reserve | undefined }));

// The page table with a reserve on the concrete row while a case sets one.
vi.mock('../lib/pages.ts', async (importOriginal) => {
  const original = await importOriginal<typeof import('../lib/pages.ts')>();
  return {
    ...original,
    get PAGES() {
      return row.reserve === undefined
        ? original.PAGES
        : { ...original.PAGES, concrete: { ...original.PAGES.concrete, reserve: row.reserve } };
    },
  };
});

const render = () =>
  renderComponent(CalculatorView, { id: 'concrete', locale: 'en' }, { partial: false });

const reserveStyles = (document: Awaited<ReturnType<typeof render>>): string[] =>
  document
    .querySelectorAll('head style')
    .filter((style) => style.text.includes('-lines'))
    .map((style) => style.text);

afterEach(() => {
  row.reserve = undefined;
});

describe('CalculatorView head reserve (calculator-page › [CP65], design K6)', () => {
  // spec: calculator-page › [CP65] a row without a reserve adds nothing to the head
  it('emits no reserve style for a row that declares none, and none on the body', async () => {
    const document = await render();
    expect(reserveStyles(document)).toEqual([]);
    expect(document.querySelector('[data-calculator]')?.getAttribute('style')).toBeUndefined();
    expect(document.querySelectorAll('body style')).toHaveLength(0);
  });

  // spec: calculator-page › [CP65] a row with a reserve yields one head style equal to the builder output
  it('emits the builder output of the row reserve as one head style', async () => {
    row.reserve = FIXTURE;
    const document = await render();
    // the concrete row draws, so its one head style is the reserve, then the drawing rule
    expect(reserveStyles(document)).toEqual([
      `${String(reserveCss(FIXTURE))}${drawingCss({ width: 300, height: 200 })}`,
    ]);
    expect(document.querySelectorAll('body style')).toHaveLength(0);
    expect(document.querySelector('[data-calculator]')?.getAttribute('style')).toBeUndefined();
  });
});
