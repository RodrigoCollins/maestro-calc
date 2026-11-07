import { expect, test, type Page } from '@playwright/test';
import { CALCULATOR_PATHS, PAGES } from './pages.ts';

/** The message the page's WhatsApp link sends, decoded. */
const messageOf = async (page: Page): Promise<string> => {
  const href = (await page.locator('a[href^="https://wa.me/?text="]').getAttribute('href')) ?? '';
  return decodeURIComponent(href.slice('https://wa.me/?text='.length));
};

const STATES: readonly string[] = PAGES.map(({ path }) => path).filter((path) =>
  /^\/(states|es\/estados)\//.test(path),
);

// one link per page: the calculators (the time card's is its receipt) and every state page
for (const path of [...CALCULATOR_PATHS, ...STATES]) {
  test(`${path} has one labelled WhatsApp link to itself`, async ({ page, baseURL }) => {
    await page.goto(path);
    const link = page.locator('a[href^="https://wa.me/?text="]');
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('rel', /\bnoopener\b/);
    await expect(link).toHaveAccessibleName(/WhatsApp/);
    await expect(link).toBeVisible();
    // the script swaps in the address it was opened at; the page as built links its canonical
    expect(await messageOf(page)).toMatch(
      new RegExp(`\\n(https://cuentahoras\\.com|${new URL(baseURL ?? '').origin})${path}$`),
    );
  });
}

test('the overtime calculator shares the week typed, and the link reopens it', async ({ page }) => {
  await page.goto('/overtime-calculator');
  await page.locator('input[name="mon"]').fill('12');
  await expect(page).toHaveURL(/\?/);
  const message = await messageOf(page);
  expect(message.startsWith('Overtime Calculator')).toBe(true);
  const shared = message.split('\n').at(-1) ?? '';
  expect(new URL(shared).search).toBe(new URL(page.url()).search);
  await page.goto(shared.replace(new URL(shared).origin, ''));
  await expect(page.locator('input[name="mon"]')).toHaveValue('12');
});

test('the Spanish salary converter shares its state in Spanish', async ({ page }) => {
  await page.goto('/es/de-sueldo-anual-a-pago-por-hora');
  await page.locator('input[name="amount"]').fill('52000');
  await expect(page).toHaveURL(/\?/);
  await expect(page.locator('a[data-share]')).toHaveText('Compartir por WhatsApp');
  const shared = (await messageOf(page)).split('\n').at(-1) ?? '';
  expect(new URL(shared).search).toBe(new URL(page.url()).search);
});
