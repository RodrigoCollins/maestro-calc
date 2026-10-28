import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { pressSelector } from './calculator-pages.ts';
import type { E2ePage } from './calculator-pages.ts';

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

/** The "Copy link" button. */
export const copyButton = (page: Page): Locator => page.locator('[data-copy]');

/** The WhatsApp share link of the copy area: hidden until the script writes its href. */
export const shareLink = (page: Page): Locator => page.locator('[data-share]');

/** The link to the same page in the other language, in the header. */
export const languageSwitch = (page: Page): Locator => page.locator('header a[hreflang]');

/** The note that says the script is not running: visible on the static page, hidden once mounted. */
export const notRunning = (page: Page): Locator => page.locator('[data-not-running]');

/** The drawing box of the result panel: present only when the record declares `drawing`. */
export const drawing = (page: Page): Locator => page.locator('svg[data-drawing]');

/** The short answer of the page: present only when the record declares `answer`. */
export const answer = (page: Page): Locator => page.locator('[data-answer]');

/** Opens a page of the record and waits for the script: the note is gone and the ready input is enabled. */
export const open = async (page: Page, calculator: E2ePage, query = ''): Promise<void> => {
  await page.goto(`${calculator.path}${query}`);
  await expect(notRunning(page)).toBeHidden();
  await expect(input(page, calculator.spec.ready)).toBeEnabled();
};

/** Makes the next clipboard write fail, as a browser that denies the permission does. */
export const denyClipboard = (page: Page): Promise<void> =>
  page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error('denied')) },
    });
  });
