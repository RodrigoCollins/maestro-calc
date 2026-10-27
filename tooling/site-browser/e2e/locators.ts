import type { Locator, Page } from '@playwright/test';
import { pressSelector } from './calculator-pages.ts';

/** The input of a field, by its key. */
export const input = (page: Page, key: string): Locator => page.locator(`#calc-${key}`);

/** The element that shows one output, by its key. */
export const output = (page: Page, key: string): Locator => page.locator(`[data-output="${key}"]`);

/** The button of a choice group, by the group key and the option value. */
export const choiceButton = (page: Page, key: string, value: string): Locator =>
  page.locator(pressSelector({ hook: 'choice', key, value }));

/** The button of a stepper, by the group key and the direction. */
export const stepButton = (page: Page, key: string, value: string): Locator =>
  page.locator(pressSelector({ hook: 'step', key, value }));

/** A figure of the record: a `data-output` key, or `shopping:<i>` for the i-th shopping line. */
export const figureAt = (page: Page, key: string): Locator =>
  key.startsWith('shopping:')
    ? page.locator('[data-shopping]').nth(Number(key.slice('shopping:'.length)))
    : output(page, key);
