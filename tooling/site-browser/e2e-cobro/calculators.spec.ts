import { expect, test, type Page } from '@playwright/test';
import { CALCULATORS } from './pages.ts';

/** Types the fields of an edit: a select by option, every other field by text. */
const apply = async (page: Page, edit: Readonly<Record<string, string>>): Promise<void> => {
  for (const [name, value] of Object.entries(edit)) {
    const field = page.locator(`form [name="${name}"]`);
    if ((await field.evaluate((node) => node.tagName)) === 'SELECT')
      await field.selectOption(value);
    else await field.fill(value);
  }
};

const total = (page: Page) => page.locator('[data-out="total"]');

for (const { trade, lang, path, initial, edit, edited } of CALCULATORS) {
  test.describe(path, () => {
    test(`shows the quote of its starting values: ${initial}`, async ({ page }) => {
      await page.goto(path);
      await expect(total(page)).toHaveText(initial);
      await expect(page.locator('[data-line]:not([hidden])').first()).toBeVisible();
    });

    test(`totals ${edited} after a hand-verified edit, and keeps it in the address`, async ({
      page,
    }) => {
      await page.goto(path);
      await apply(page, edit);
      await expect(total(page)).toHaveText(edited);
      await expect(page).toHaveURL(/\?v=1/);
      await page.reload();
      await expect(total(page)).toHaveText(edited);
    });

    test('sends the itemized quote on WhatsApp, the total and the address of the page in it', async ({
      page,
    }) => {
      await page.goto(path);
      await apply(page, edit);
      await expect(total(page)).toHaveText(edited);
      const link = page.locator('a[data-share]');
      await expect(link).toHaveAttribute('rel', 'noopener');
      const href = (await link.getAttribute('href')) ?? '';
      expect(href.startsWith('https://wa.me/?text=')).toBe(true);
      const message = decodeURIComponent(href.slice('https://wa.me/?text='.length));
      expect(message.split('\n')[0]).toContain(lang === 'es' ? 'PRESUPUESTO' : 'QUOTE');
      expect(message).toContain(`${lang === 'es' ? 'TOTAL' : 'TOTAL'}: ${edited}`);
      expect(message.split('\n').at(-1)).toContain(path);
      expect(message).toContain(`${lang === 'es' ? 'Mano de obra' : 'Labor'}`);
    });

    test('marks a field it cannot read and recovers when it is fixed', async ({ page }) => {
      await page.goto(path);
      const rate = page.locator('form [name="rate"]');
      await rate.fill('-1');
      await expect(rate).toHaveAttribute('aria-invalid', 'true');
      await rate.fill('30');
      await expect(rate).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  if (lang === 'es') {
    test(`${path} charges by the square foot when asked, showing its own price field`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator('form [name="hours"]')).toBeVisible();
      await expect(page.locator('form [name="areaRate"]')).toBeHidden();
      await page.locator('form [name="laborBy"]').selectOption('area');
      await expect(page.locator('form [name="areaRate"]')).toBeVisible();
      await expect(page.locator('form [name="hours"]')).toBeHidden();
      await page.locator('form [name="areaRate"]').fill('0');
      await page.locator('form [name="overhead"]').fill('0');
      await page.locator('form [name="profit"]').fill('0');
      await expect(page.locator('[data-out="labor"]')).toHaveText('$0.00');
      // the lines that are zero leave the receipt
      await expect(page.locator('li[data-line="overhead"]')).toBeHidden();
      await expect(page.locator('li[data-line="profit"]')).toBeHidden();
      expect(trade.length).toBeGreaterThan(0);
    });

    test(`${path} prints through the browser`, async ({ page }) => {
      await page.addInitScript(() => {
        (window as unknown as { printed: number }).printed = 0;
        window.print = () => {
          (window as unknown as { printed: number }).printed += 1;
        };
      });
      await page.goto(path);
      await page.locator('button[data-print]').click();
      expect(await page.evaluate(() => (window as unknown as { printed: number }).printed)).toBe(1);
    });
  }
}
