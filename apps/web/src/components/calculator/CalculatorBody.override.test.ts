import { readFileSync } from 'node:fs';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import { slotFreePage } from '../../contract/__testing__/slot-free-page.ts';
import { fromRoot } from '../../contract/root.ts';
import BaseLayout from '../../layouts/BaseLayout.astro';
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

const HEAD = {
  title: 'Title',
  description: 'Description',
  canonical: 'https://maestrocalc.com/',
  alternates: [],
};

/** The calculator body as HTML, to slot into the layout. */
const bodyHtml = async (view = pageView('concrete', 'en')): Promise<string> =>
  (await renderComponent(CalculatorBody, { view, content: CONTENT })).toString();

describe('line-count override through the head (calculator-page › [CP65])', () => {
  // spec: calculator-page › [CP65] the fixture rule sits in one head <style>; the body carries no style
  it('carries `.calculator{--answer-lines:3}` in one head style and no style on the body', async () => {
    const document = await renderComponent(
      BaseLayout,
      { locale: 'en', id: 'concrete', head: HEAD, style: '.calculator{--answer-lines:3}' },
      { partial: false, slots: { default: await bodyHtml() } },
    );
    expect(
      document.querySelectorAll('head style').filter((s) => s.text.includes('--answer-lines')),
    ).toHaveLength(1);
    expect(document.querySelector('head style:last-of-type')?.text).toBe(
      '.calculator{--answer-lines:3}',
    );
    expect(document.querySelectorAll('body style')).toHaveLength(0);
    const body = document.querySelector('[data-calculator]');
    expect(body?.getAttribute('class')).toBe('calculator');
    expect(body?.getAttribute('style')).toBeUndefined();
    expect(
      document.querySelector('[data-reserved="answer"]')?.getAttribute('style'),
    ).toBeUndefined();
  });

  // spec: calculator-page › [CP65] the shared formula resolves the count: no edit to the stylesheet
  it('keeps the shared min-height formula that reads the property', () => {
    const css = readFileSync(fromRoot('apps/web/src/styles/calculator.css'), 'utf8');
    expect(css).toMatch(/\.calc-answer\s*\{[^}]*min-height:\s*calc\(var\(--answer-lines,/);
  });

  // spec: calculator-page › [CP65] CalculatorBody takes no style: the prop is gone from its source
  it('has no style prop and ignores one', async () => {
    const source = readFileSync(
      fromRoot('apps/web/src/components/calculator/CalculatorBody.astro'),
      'utf8',
    );
    expect(source).not.toMatch(/\bstyle\b/);
    const root = await renderComponent(CalculatorBody, {
      view: pageView('concrete', 'en'),
      content: CONTENT,
      style: '--answer-lines:3',
    });
    expect(root.querySelector('[data-calculator]')?.getAttribute('style')).toBeUndefined();
  });

  // spec: calculator-page › [CP65] a module with no answer slot reserves nothing for it
  it('renders no answer block, and so no answer reserve, for a slot-free page', async () => {
    const copy = Object.fromEntries(
      Object.entries(enRectangleArea).filter(([key]) => !key.includes('.page.')),
    );
    const view = pageViewOf(slotFreePage, 'en', { ...enCommon, ...copy, ...enSite });
    const root = await renderComponent(CalculatorBody, { view, content: CONTENT });
    expect(root.querySelector('[data-calculator]')?.getAttribute('style')).toBeUndefined();
    expect(root.querySelectorAll('[data-reserved="answer"], [data-answer]')).toHaveLength(0);
  });
});
