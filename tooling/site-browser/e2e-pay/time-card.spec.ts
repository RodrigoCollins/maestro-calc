import { expect, test, type Page } from '@playwright/test';
import { DEFAULT_PAY, TIME_CARD } from './pages.ts';

/** What the page's words say, by language: the saved week and the copy and share button. */
const WORDS = {
  en: {
    clear: 'Clear my week',
    copy: 'Copy result',
    share: 'Share result',
    restored: 'Here is the week you saved on this device.',
    cleared: /^Cleared/,
    copied: /^Copied/,
    shared: 'Shared.',
    note: /on this device only/,
    total: 'Total: 50.5 h (10.5 h overtime)',
    pay: 'Gross pay: $1,226.50',
  },
  es: {
    clear: 'Borrar mi semana',
    copy: 'Copiar resultado',
    share: 'Compartir resultado',
    restored: 'Aquí está la semana que guardaste en este dispositivo.',
    cleared: /^Listo/,
    copied: /^Copiado/,
    shared: 'Compartido.',
    note: /solo en este dispositivo/,
    total: 'Total: 50.5 h (10.5 h extra)',
    pay: 'Pago bruto: $1,226.50',
  },
} as const;

/**
 * Records, in the page, what the clipboard, the share sheet and gtag receive: no real share sheet
 * opens, and the usage events can be read back. `share: false` is a browser without a share sheet.
 */
const stubSending = async (page: Page, share: boolean): Promise<void> => {
  await page.addInitScript((withShare) => {
    const record = window as unknown as Record<string, unknown[]>;
    record['copied'] = [];
    record['shared'] = [];
    record['events'] = [];
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: (text: string) => (record['copied']?.push(text), Promise.resolve()) },
    });
    Object.defineProperty(navigator, 'share', {
      value: withShare
        ? (data: { text: string }) => (record['shared']?.push(data.text), Promise.resolve())
        : undefined,
    });
    (window as unknown as { gtag: unknown }).gtag = (...args: unknown[]) =>
      record['events']?.push(args[2]);
  }, share);
};

const recorded = (page: Page, key: 'copied' | 'shared' | 'events'): Promise<unknown[]> =>
  page.evaluate((name) => (window as unknown as Record<string, unknown[]>)[name] ?? [], key);

for (const { path, lang } of TIME_CARD) {
  const words = WORDS[lang];
  test.describe(path, () => {
    test('keeps the week in this browser, restores it on return, and clears it', async ({
      page,
    }) => {
      await stubSending(page, false);
      await page.goto(path);
      const saved = page.locator('[data-saved]');
      await expect(saved).toBeVisible();
      await expect(saved).toContainText(words.note);
      await page.locator('input[name="monOut"]').fill('5:30 pm');
      await expect(page.locator('[data-out="pay"]')).toHaveText('$1,226.50');

      // back on the clean address: the saved week, said in the status region
      await page.goto(path);
      await expect(page.locator('input[name="monOut"]')).toHaveValue('5:30 pm');
      await expect(page.locator('[data-out="pay"]')).toHaveText('$1,226.50');
      const status = page.locator('[data-status]');
      await expect(status).toHaveAttribute('role', 'status');
      await expect(status).toHaveText(words.restored);
      expect(await recorded(page, 'events')).toContainEqual({
        calc_action: 'restore',
        calc_id: 'time-card',
      });

      await page.getByRole('button', { name: words.clear }).click();
      await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
      await expect(status).toHaveText(words.cleared);
      expect(new URL(page.url()).search).toBe('');
      await page.goto(path);
      await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
      await expect(status).toHaveText('');
    });

    test('opens a shared link on its own week, keeping the saved one', async ({ page }) => {
      await page.goto(path);
      await page.locator('input[name="monOut"]').fill('5:30 pm');
      await expect(page.locator('[data-out="pay"]')).toHaveText('$1,226.50');
      await page.goto(`${path}?v=1`);
      await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
      await page.goto(path);
      await expect(page.locator('[data-out="pay"]')).toHaveText('$1,226.50');
    });

    test('works the same where the browser blocks storage', async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          get: () => {
            throw new DOMException('blocked', 'SecurityError');
          },
        });
      });
      await page.goto(path);
      await expect(page.locator('[data-saved]')).toBeHidden();
      await page.locator('input[name="monOut"]').fill('5:30 pm');
      await expect(page.locator('[data-out="pay"]')).toHaveText('$1,226.50');
      await page.goto(path);
      await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
    });

    test('copies the week as text where there is no share sheet', async ({ page }) => {
      await stubSending(page, false);
      await page.goto(path);
      await page.locator('input[name="monOut"]').fill('5:30 pm');
      const button = page.getByRole('button', { name: words.copy });
      await button.click();
      await expect(page.locator('[data-status]')).toHaveText(words.copied);
      const [text = ''] = (await recorded(page, 'copied')) as string[];
      expect(text).toContain(`\n${words.total}\n${words.pay}\n`);
      // the last line is the link that reopens the same week
      expect(new URL(text.split('\n').at(-1) ?? '').search).toBe(new URL(page.url()).search);
      expect(await recorded(page, 'shared')).toEqual([]);
      expect(await recorded(page, 'events')).toContainEqual({
        calc_action: 'copy',
        calc_id: 'time-card',
      });
    });

    test('opens the share sheet where there is one, and copies too', async ({ page }) => {
      await stubSending(page, true);
      await page.goto(path);
      await page.getByRole('button', { name: words.share }).click();
      await expect(page.locator('[data-status]')).toHaveText(words.copied);
      const [shared = ''] = (await recorded(page, 'shared')) as string[];
      expect(
        shared.startsWith(lang === 'en' ? 'My hours this week\n' : 'Mis horas de la semana\n'),
      ).toBe(true);
      expect(await recorded(page, 'copied')).toEqual([shared]);
      const events = await recorded(page, 'events');
      expect(events).toContainEqual({ calc_action: 'share', calc_id: 'time-card' });
      expect(events).toContainEqual({ calc_action: 'copy', calc_id: 'time-card' });
    });
    test('reruns the week as the hours change and keeps it in the link', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
      // Monday out at 5:30 pm instead of 4:30 pm: one more overtime hour at $33.
      await page.locator('input[name="monOut"]').fill('5:30 pm');
      await expect(page.locator('[data-out="totalHours"]')).toHaveText('50.5');
      await expect(page.locator('[data-out="pay"]')).toHaveText('$1,226.50');
      expect(new URL(page.url()).search).not.toBe('');
      await expect(page.locator('[data-whatsapp]')).toHaveAttribute('href', /1%2C226\.50/);

      // the link reopens the same week
      await page.goto(page.url());
      await expect(page.locator('[data-out="pay"]')).toHaveText('$1,226.50');
    });

    test('marks a time it cannot read and keeps the last figures', async ({ page }) => {
      await page.goto(path);
      const field = page.locator('input[name="tue"]');
      await field.fill('banana');
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('[data-out="pay"]')).toHaveText(DEFAULT_PAY);
    });

    test('switches to the California rule and shows daily overtime', async ({ page }) => {
      await page.goto(path);
      await page.locator('select[name="rule"]').selectOption('california');
      await expect(page.locator('[data-row="overtime"]')).toBeVisible();
    });
  });
}
