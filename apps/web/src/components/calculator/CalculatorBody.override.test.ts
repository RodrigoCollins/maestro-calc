import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import { rectangleAreaPage } from '../../calculator/rectangle-area/page.ts';
import { pageViewOf } from '../../lib/page-view.ts';
import { pageView } from '../../lib/pages.ts';
import CalculatorBody from './CalculatorBody.astro';
import type { CalculatorContent } from './model.ts';

const CONTENT: CalculatorContent = {
  updatedLabel: 'Last updated',
  updated: '2026-10-25',
  updatedText: 'October 25, 2026',
  sources: [],
};

describe('CalculatorBody line-count override (calculator-page › [CP65])', () => {
  // spec: calculator-page › [CP65] a page sets the line count on the body, the shared formula resolves it
  it('carries an inline --answer-lines on the calculator body and keeps the answer block unchanged', async () => {
    const root = await renderComponent(CalculatorBody, {
      view: pageView('concrete', 'en'),
      content: CONTENT,
      style: '--answer-lines:3',
    });
    const body = root.querySelector('[data-calculator]');
    expect(body?.getAttribute('class')).toBe('calculator');
    expect(body?.getAttribute('style')).toBe('--answer-lines:3');
    const answer = root.querySelector('[data-reserved="answer"]');
    expect(answer?.getAttribute('class')).toBe('calc-answer');
    expect(answer?.getAttribute('style')).toBeUndefined();
  });

  it('sets no inline style when the page gives none', async () => {
    const root = await renderComponent(CalculatorBody, {
      view: pageView('concrete', 'en'),
      content: CONTENT,
    });
    expect(root.querySelector('[data-calculator]')?.getAttribute('style')).toBeUndefined();
  });

  // spec: calculator-page › [CP65] a module with no answer slot reserves nothing for it
  it('renders no answer block, and so no answer reserve, for rectangle-area', async () => {
    const view = pageViewOf(rectangleAreaPage, 'en', {
      ...enCommon,
      ...enRectangleArea,
      ...enSite,
    });
    const root = await renderComponent(CalculatorBody, {
      view,
      content: CONTENT,
      style: '--answer-lines:3',
    });
    expect(root.querySelector('[data-calculator]')?.getAttribute('style')).toBe('--answer-lines:3');
    expect(root.querySelectorAll('[data-reserved="answer"], [data-answer]')).toHaveLength(0);
  });
});
