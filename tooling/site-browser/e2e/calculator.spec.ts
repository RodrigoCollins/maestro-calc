import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { CONCRETE_PAGES, SHAPE_FIELDS, STATES } from './concrete-pages.ts';
import type { ConcretePage, Figures } from './concrete-pages.ts';

const ORANGE = 'rgb(240, 106, 29)';

const input = (page: Page, key: string): Locator => page.locator(`#calc-${key}`);
const output = (page: Page, key: string): Locator => page.locator(`[data-output="${key}"]`);
const shapeButton = (page: Page, shape: string): Locator =>
  page.locator(`[data-shape-button="${shape}"]`);

/** Opens the page and waits for the script: the controls are enabled and the note is gone. */
const open = async (page: Page, calculator: ConcretePage, query = ''): Promise<void> => {
  await page.goto(`${calculator.path}${query}`);
  await expect(page.locator('[data-not-running]')).toBeHidden();
  await expect(input(page, 'length')).toBeEnabled();
};

/** The five figures of the panel, in the order of `Figures`. */
const figuresOf = async (page: Page): Promise<string[]> => [
  (await output(page, 'volumeYd3').textContent()) ?? '',
  (await output(page, 'volumeFt3').textContent()) ?? '',
  (await output(page, 'volumeM3').textContent()) ?? '',
  (await output(page, 'netVolume').textContent()) ?? '',
  (await page.locator('[data-shopping]').textContent()) ?? '',
];

const expectFigures = async (page: Page, figures: Figures): Promise<void> => {
  await expect.poll(() => figuresOf(page)).toEqual([...figures]);
};

const visibleFields = (page: Page): Promise<string[]> =>
  page
    .locator('.calc-shape-area .calc-field:visible input')
    .evaluateAll((inputs) => inputs.map((field) => field.getAttribute('name') ?? ''));

const query = (page: Page): string => new URL(page.url()).search;

for (const calculator of CONCRETE_PAGES) {
  test.describe(`${calculator.path} with scripts (calculator-page, ${calculator.locale})`, () => {
    // spec: calculator-page › [CP41] after the mount nothing is disabled and the note is gone
    test('enables every control, reveals "Copy link" and hides the "not running" note', async ({
      page,
    }) => {
      await open(page, calculator);
      await expect(page.locator('form :disabled')).toHaveCount(0);
      await expect(page.locator('[data-copy]')).toBeVisible();
      await expect(page.locator('[data-waste-step]')).toHaveCount(2);
      await expect(page.locator('[data-waste-step]').first()).toBeVisible();
      await expect(page.locator('[data-not-running]')).toBeHidden();
    });

    // spec: calculator-page › [CP49] a module that fails to load leaves the static page
    test('keeps the note, the disabled controls and the default result when the module is aborted', async ({
      page,
    }) => {
      await page.route('**/_astro/*.js', (route) => route.abort());
      await page.goto(calculator.path);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('[data-not-running]')).toBeVisible();
      await expect(input(page, 'length')).toBeDisabled();
      await expect(page.locator('[data-copy]')).toBeHidden();
      await expect(output(page, 'volumeYd3')).toHaveText('1.63');
      await expect(page.locator('[data-shopping]')).toHaveText('74');
    });

    // spec: calculator-page › [CP11] the visible fields of each shape, in order, and aria-pressed
    test('shows the fields of each shape in order and marks the pressed shape', async ({
      page,
    }) => {
      await open(page, calculator);
      for (const [shape, fields] of Object.entries(SHAPE_FIELDS)) {
        await shapeButton(page, shape).click();
        expect(await visibleFields(page), shape).toEqual([...fields]);
        for (const other of Object.keys(SHAPE_FIELDS)) {
          await expect(shapeButton(page, other)).toHaveAttribute(
            'aria-pressed',
            other === shape ? 'true' : 'false',
          );
        }
      }
    });

    // spec: calculator-page › [CP12] labels from the catalog, keyboards, no submit button
    test('labels every input from the catalog, with the right keyboard and no submit', async ({
      page,
    }) => {
      await open(page, calculator);
      const inputs = await page.locator('form input').all();
      expect(inputs).toHaveLength(15);
      for (const field of inputs) {
        const name = (await field.getAttribute('name')) ?? '';
        const label = page.locator(`label[for="calc-${name}"]`);
        await expect(label, name).toHaveText(
          calculator.concrete[`calc.concrete.inputs.${name}`] ?? '',
        );
        await expect(field, name).toHaveAttribute(
          'inputmode',
          name === 'count' || name === 'stepCount' ? 'numeric' : 'decimal',
        );
        await expect(field, name).toHaveAttribute('autocomplete', 'off');
      }
      await expect(page.locator('form button[type=submit], form input[type=submit]')).toHaveCount(
        0,
      );
    });

    // spec: calculator-page › [CP13] touch targets on a phone
    test('gives every visible button 44 by 44 px and every visible input 56 px of height', async ({
      page,
    }) => {
      await open(page, calculator);
      for (const button of await page.locator('form button:visible').all()) {
        const box = await button.boundingBox();
        const name = await button.innerText();
        expect(box?.width, name).toBeGreaterThanOrEqual(44);
        expect(box?.height, name).toBeGreaterThanOrEqual(44);
      }
      for (const field of await page.locator('form input:visible').all()) {
        const box = await field.boundingBox();
        expect(box?.height, (await field.getAttribute('name')) ?? '').toBeGreaterThanOrEqual(56);
      }
    });

    // spec: calculator-page › [CP14] the shape area has one height for the four shapes
    test('keeps one height for the shape area whatever the shape', async ({ page }) => {
      await open(page, calculator);
      const heights = new Set<number>();
      for (const shape of Object.keys(SHAPE_FIELDS)) {
        await shapeButton(page, shape).click();
        const box = await page.locator('.calc-shape-area').boundingBox();
        heights.add(Math.round(box?.height ?? 0));
      }
      expect([...heights]).toHaveLength(1);
    });

    // spec: calculator-page › [CP19], [CP20] typing and shapes reproduce the live table
    test('recalculates while typing and when the shape changes', async ({ page }) => {
      await open(page, calculator);
      await input(page, 'length').fill('20');
      await expect(page.locator('[data-answer]')).toHaveText(calculator.slab20);
      await expectFigures(page, ['2.72', '73.33', '2.08', '66.67', '123']);
      await input(page, 'length').fill('12');
      for (const [shape, figures] of [
        ['footing', ['0.43', '11.73', '0.33', '10.67', '20']],
        ['column', ['0.26', '6.91', '0.20', '6.28', '12']],
        ['steps', ['0.52', '14.12', '0.40', '12.83', '24']],
      ] as const) {
        await shapeButton(page, shape).click();
        await expectFigures(page, figures);
        expect(await page.locator('[data-answer]').textContent()).toMatch(
          new RegExp(`^${calculator.starts[shape]?.replace('(', '\\(') ?? ''}`),
        );
      }
    });

    // spec: calculator-page › [CP21] bag size
    test('changes the bags and the yield line with the bag size, not the volumes', async ({
      page,
    }) => {
      await open(page, calculator);
      for (const [lb, bags, yieldValue] of [
        [60, 98, '0.45'],
        [40, 147, '0.30'],
      ] as const) {
        await page.locator(`[data-bag="${String(lb)}"]`).click();
        await expectFigures(page, ['1.63', '44.00', '1.25', '40.00', String(bags)]);
        await expect(page.locator('[data-bag-yield]')).toHaveText(calculator.yieldLine(yieldValue));
        expect(await page.locator('[data-answer]').textContent()).toMatch(
          new RegExp(`${calculator.bagEnd(lb, bags).replace('.', '\\.')}$`),
        );
      }
    });

    // spec: calculator-page › [CP22] the waste field and the steppers
    test('takes the waste from the field and the steppers and stops at 0 and 50', async ({
      page,
    }) => {
      await open(page, calculator);
      await input(page, 'waste').fill('0');
      await expectFigures(page, ['1.48', '40.00', '1.13', '40.00', '67']);
      await input(page, 'waste').fill('10');
      await page.locator('[data-waste-step="more"]').click();
      await expect(input(page, 'waste')).toHaveValue('15');
      await expectFigures(page, ['1.70', '46.00', '1.30', '40.00', '77']);
      await input(page, 'waste').fill('0');
      await page.locator('[data-waste-step="less"]').click();
      await expect(input(page, 'waste')).toHaveValue('0');
      await input(page, 'waste').fill('50');
      await page.locator('[data-waste-step="more"]').click();
      await expect(input(page, 'waste')).toHaveValue('50');
    });

    // spec: calculator-page › [CP16], [CP18] costs
    test('shows the costs once a price is typed and does not round the ready-mix volume', async ({
      page,
    }) => {
      await open(page, calculator);
      await expect(page.locator('[data-cost-row="bagCost"]')).toBeHidden();
      await expect(page.locator('[data-price-hint="bagCost"]')).toBeVisible();
      await input(page, 'bagPrice').fill('6.50');
      await expect(output(page, 'bagCost')).toHaveText('$481.00');
      await expect(page.locator('[data-price-hint="bagCost"]')).toBeHidden();
      await expect(page.locator('[data-cost-row="readyMixCost"]')).toBeHidden();
      await input(page, 'readyMixPrice').fill('150');
      await expect(output(page, 'readyMixCost')).toHaveText('$244.44');
      await input(page, 'length').fill('20');
      await expect(output(page, 'volumeYd3')).toHaveText('2.72');
      await expect(output(page, 'readyMixCost')).toHaveText('$407.41');
    });

    // spec: calculator-page › [CP23] Enter changes neither the address nor the page and requests nothing
    test('ignores Enter in a field: same address, same page, no request', async ({ page }) => {
      await open(page, calculator);
      await input(page, 'length').fill('20');
      await expect.poll(() => query(page)).toBe('?v=1&l=240');
      const before = page.url();
      const requests: string[] = [];
      page.on('request', (request) => requests.push(request.url()));
      await input(page, 'length').press('Enter');
      await page.waitForTimeout(200);
      expect(page.url()).toBe(before);
      expect(requests).toEqual([]);
      await expect(input(page, 'length')).toHaveValue('20');
    });

    // spec: calculator-page › [CP23] Enter does not navigate, and still presses the button it is on
    test('activates a focused button with Enter, like Space', async ({ page }) => {
      await open(page, calculator);
      await shapeButton(page, 'footing').focus();
      await page.keyboard.press('Enter');
      await expect(shapeButton(page, 'footing')).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(() => query(page)).toBe('?v=1&sh=footing');
      await shapeButton(page, 'column').focus();
      await page.keyboard.press('Space');
      await expect(shapeButton(page, 'column')).toHaveAttribute('aria-pressed', 'true');
    });

    // spec: calculator-page › [CP24] every state, loaded through its link, shows the figures of the engine
    for (const state of STATES) {
      test(`loads the state "${state.name}" from its link with the engine's figures`, async ({
        page,
      }) => {
        await open(page, calculator, state.query);
        await expectFigures(page, state.figures);
      });
    }

    // spec: calculator-page › [CP25], [CP28] restoring from a shared link and reloading
    test('restores a footing from its link and keeps its state on reload', async ({ page }) => {
      await open(page, calculator, '?v=1&sh=footing&l=216&n=3');
      await expect(shapeButton(page, 'footing')).toHaveAttribute('aria-pressed', 'true');
      await expect(input(page, 'length')).toHaveValue('18 ft');
      await expect(input(page, 'count')).toHaveValue('3');
      await expectFigures(page, ['1.96', '52.80', '1.50', '48.00', '88']);
      await page.reload();
      await expect(input(page, 'length')).toBeEnabled();
      await expect(input(page, 'length')).toHaveValue('18 ft');
      await expectFigures(page, ['1.96', '52.80', '1.50', '48.00', '88']);
      expect(query(page)).toBe('?v=1&sh=footing&l=216&n=3');
    });

    // spec: calculator-page › [CP26], [CP27], [CP28] the query writes and the history
    test('writes the query after each valid change, without adding to the history', async ({
      page,
    }) => {
      await open(page, calculator);
      const history = await page.evaluate(() => window.history.length);
      await input(page, 'length').fill('20');
      await expect.poll(() => query(page)).toBe('?v=1&l=240');
      await page.locator('[data-bag="60"]').click();
      await expect.poll(() => query(page)).toBe('?v=1&l=240&bg=60');
      await input(page, 'bagPrice').fill('6.50');
      await expect.poll(() => query(page)).toBe('?v=1&l=240&bg=60&bp=13/2');
      expect(await page.evaluate(() => window.history.length)).toBe(history);
      await page.reload();
      await expect(input(page, 'length')).toHaveValue('20 ft');
      // 163 bags of 60 lb at $6.50
      await expect(output(page, 'bagCost')).toHaveText('$1,059.50');
      expect(query(page)).toBe('?v=1&l=240&bg=60&bp=13/2');
      await input(page, 'bagPrice').fill('');
      await input(page, 'bagPrice').blur();
      await expect.poll(() => query(page)).toBe('?v=1&l=240&bg=60');
    });

    test('returns the query to v=1 when the value is the default again', async ({ page }) => {
      await open(page, calculator, '?v=1&l=240');
      await input(page, 'length').fill('12');
      await expect.poll(() => query(page)).toBe('?v=1');
    });

    // spec: calculator-page › [CP29] bad and noisy links
    test('replaces a bad value by the default and says so, and keeps a noisy query until the first edit', async ({
      page,
    }) => {
      await open(page, calculator, '?v=1&sh=Slab&bg=50&ws=51');
      await expect(page.locator('#calc-notice')).toHaveText(
        calculator.common['errors.INVALID_VALUE'] ?? '',
      );
      await expectFigures(page, ['1.63', '44.00', '1.25', '40.00', '74']);
      await open(page, calculator, '?v=2&l=240');
      await expect(page.locator('#calc-notice')).toHaveText(
        calculator.common['errors.UNSUPPORTED_VERSION'] ?? '',
      );
      await open(page, calculator, '?utm_source=x&l=240');
      await expect(input(page, 'length')).toHaveValue('20 ft');
      await expect(page.locator('#calc-notice')).toBeHidden();
      await open(page, calculator, '?utm_source=x');
      expect(query(page)).toBe('?utm_source=x');
      await input(page, 'length').fill('20');
      await expect.poll(() => query(page)).toBe('?v=1&l=240');
    });

    // spec: calculator-page › [CP30], [CP31], [CP32], [CP46] errors without a button
    test('marks an invalid field, dashes the result, leaves the address and recovers', async ({
      page,
    }) => {
      await open(page, calculator, '?v=1&l=240');
      await input(page, 'length').fill('abc');
      const message = calculator.common['errors.MALFORMED'] ?? '';
      await expect(page.locator('#calc-length-error')).toHaveText(message);
      await expect(input(page, 'length')).toHaveAttribute('aria-invalid', 'true');
      await expect(input(page, 'length')).toHaveAttribute('aria-describedby', 'calc-length-error');
      await expect(page.locator('[data-answer]')).toHaveText('—');
      await expect(output(page, 'volumeYd3')).toHaveText('—');
      expect(query(page)).toBe('?v=1&l=240');
      await input(page, 'length').fill('20');
      await expect(page.locator('#calc-length-error')).toHaveCount(0);
      await expect(input(page, 'length')).not.toHaveAttribute('aria-invalid', 'true');
      await expectFigures(page, ['2.72', '73.33', '2.08', '66.67', '123']);
    });

    test('words the bounds in the unit of the field', async ({ page }) => {
      await open(page, calculator);
      const max = calculator.common['errors.ABOVE_MAX'] ?? '';
      const min = calculator.common['errors.BELOW_MIN'] ?? '';
      await input(page, 'length').fill('1001 ft');
      await expect(page.locator('#calc-length-error')).toHaveText(max.replace('{max}', '1,000 ft'));
      await input(page, 'length').fill('12');
      await input(page, 'waste').fill('51');
      await expect(page.locator('#calc-waste-error')).toHaveText(max.replace('{max}', '50%'));
      await input(page, 'waste').fill('10');
      await shapeButton(page, 'footing').click();
      await input(page, 'count').fill('1001');
      await expect(page.locator('#calc-count-error')).toHaveText(max.replace('{max}', '1,000'));
      await input(page, 'count').fill('0');
      await expect(page.locator('#calc-count-error')).toHaveText(min.replace('{min}', '1'));
    });

    test('names the decimal comma and the unknown unit', async ({ page }) => {
      await open(page, calculator);
      await input(page, 'thickness').fill('1,5');
      await expect(page.locator('#calc-thickness-error')).toHaveText(
        calculator.common['errors.DECIMAL_COMMA'] ?? '',
      );
      await input(page, 'thickness').fill('5 furlongs');
      await expect(page.locator('#calc-thickness-error')).toHaveText(
        calculator.common['errors.UNKNOWN_UNIT'] ?? '',
      );
      await expect(output(page, 'volumeYd3')).toHaveText('—');
    });

    // spec: calculator-page › [CP33], [CP34], [CP35], [CP50] the unit system
    test('toggles to metric and back without changing the state', async ({ page }) => {
      await open(page, calculator);
      await page.locator('[data-unit="metric"]').click();
      await expect(input(page, 'length')).toHaveValue('3.6576 m');
      await expect(input(page, 'width')).toHaveValue('3.048 m');
      await expect(input(page, 'thickness')).toHaveValue('10.16 cm');
      await expect.poll(() => query(page)).toBe('?v=1&u=m');
      await expect(page.locator('[data-primary]')).toHaveText('1.25');
      await expect(page.locator('[data-answer]')).toHaveText(calculator.metric);
      await expect(page.locator('[data-shopping]')).toHaveText('74');
      await expect(page.locator('#calc-length-hint')).toHaveText(
        calculator.site['site.calculator.hintM'] ?? '',
      );
      await page.locator('[data-unit="imperial"]').click();
      await expect(input(page, 'length')).toHaveValue('12 ft');
      await expect(input(page, 'width')).toHaveValue('10 ft');
      await expect(input(page, 'thickness')).toHaveValue('4 in');
      await expect.poll(() => query(page)).toBe('?v=1');
    });

    test('reads bare numbers as meters and centimeters in metric, and explicit units win', async ({
      page,
    }) => {
      await open(page, calculator);
      await page.locator('[data-unit="metric"]').click();
      await input(page, 'length').fill('4');
      await input(page, 'width').fill('3');
      await input(page, 'thickness').fill('10');
      await expect.poll(() => query(page)).toBe('?v=1&u=m&l=20000/127&w=15000/127&t=500/127');
      await expectFigures(page, ['1.73', '46.62', '1.32', '42.38', '78']);
      await input(page, 'length').fill('20 ft');
      await expect.poll(() => query(page)).toContain('l=240');
    });

    test('goes from metric entry back to US with the exact inches', async ({ page }) => {
      await open(page, calculator);
      await page.locator('[data-unit="metric"]').click();
      await input(page, 'length').fill('4');
      await page.locator('[data-unit="imperial"]').click();
      await expect(input(page, 'length')).toHaveValue('20000/127 in');
      expect(query(page)).toContain('l=20000/127');
    });

    // spec: calculator-page › [CP36], [CP37]; site-routing-i18n › [SR20], [SR21], [SR22]
    test('keeps the language switch pointing at the other page with the current query', async ({
      page,
    }) => {
      await open(page, calculator, '?v=1&l=240');
      const toggle = page.locator('header a[hreflang]');
      await expect(toggle).toHaveAttribute('href', `${calculator.other}?v=1&l=240`);
      await page.locator('[data-bag="60"]').click();
      await expect(toggle).toHaveAttribute('href', `${calculator.other}?v=1&l=240&bg=60`);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
        'href',
        `https://maestrocalc.com${calculator.path}`,
      );
      expect(await page.locator('link[rel=alternate][hreflang]').count()).toBe(3);
      await open(page, calculator);
      await expect(toggle).toHaveAttribute('href', calculator.other);
    });

    test('opens the other language with the same numbers', async ({ page }) => {
      await open(page, calculator, '?v=1&l=240');
      await page.locator('header a[hreflang]').click();
      await expect(page).toHaveURL(new RegExp(`${calculator.other}\\?v=1&l=240$`));
      await expect(page.locator('[data-not-running]')).toBeHidden();
      await expectFigures(page, ['2.72', '73.33', '2.08', '66.67', '123']);
      await expect(input(page, 'length')).toHaveValue('20 ft');
    });

    // spec: calculator-page › [CP38], [CP39] copy link
    test('copies the address with the query and says so', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await open(page, calculator);
      await page.locator('[data-waste-step="more"]').click();
      await page.locator('[data-copy]').click();
      await expect(page.locator('[data-copy-status]')).toHaveText(
        calculator.site['site.calculator.linkCopied'] ?? '',
      );
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        `${new URL(page.url()).origin}${calculator.path}?v=1&ws=15`,
      );
    });

    test('shows a read-only field with the address when the copy is rejected', async ({ page }) => {
      await open(page, calculator, '?v=1&ws=15');
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText: () => Promise.reject(new Error('denied')) },
        });
      });
      await page.locator('[data-copy]').click();
      await expect(page.locator('[data-copy-status]')).toHaveText(
        calculator.site['site.calculator.copyFailed'] ?? '',
      );
      const fallback = page.locator('#calc-fallback');
      await expect(fallback).toHaveAttribute('readonly', '');
      await expect(fallback).toHaveValue(
        `${new URL(page.url()).origin}${calculator.path}?v=1&ws=15`,
      );
      await expect(fallback).toBeFocused();
    });

    // spec: calculator-page › [CP45] the keyboard path, in the visual order, with the orange ring
    test('tabs through the controls in visual order and rings each in safety orange', async ({
      page,
    }) => {
      await open(page, calculator);
      const order = [
        '[data-unit="imperial"]',
        '[data-unit="metric"]',
        '[data-shape-button="slab"]',
        '[data-shape-button="footing"]',
        '[data-shape-button="column"]',
        '[data-shape-button="steps"]',
        '#calc-length',
        '#calc-width',
        '#calc-thickness',
        '#calc-waste',
        '[data-waste-step="less"]',
        '[data-waste-step="more"]',
        '[data-bag="40"]',
        '[data-bag="60"]',
        '[data-bag="80"]',
        '#calc-bagPrice',
        '#calc-readyMixPrice',
        '[data-copy]',
      ];
      await page.locator('[data-unit="imperial"]').focus();
      for (const [index, selector] of order.entries()) {
        if (index > 0) await page.keyboard.press('Tab');
        await expect(page.locator(selector), selector).toBeFocused();
        const { color, width } = await page.evaluate(() => {
          const style = getComputedStyle(document.activeElement ?? document.body);
          return { color: style.outlineColor, width: Number.parseFloat(style.outlineWidth) };
        });
        expect({ selector, color }).toEqual({ selector, color: ORANGE });
        expect(width).toBeGreaterThanOrEqual(2);
      }
    });

    // spec: calculator-page › [CP46] the accessible description of an invalid field is its message
    test('describes an invalid field by its message', async ({ page }) => {
      await open(page, calculator);
      await input(page, 'length').fill('abc');
      const message = calculator.common['errors.MALFORMED'] ?? '';
      const description = await input(page, 'length').evaluate((element) => {
        const ids = (element.getAttribute('aria-describedby') ?? '').split(' ');
        return ids
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ')
          .trim();
      });
      expect(description).toBe(message);
      await expect(input(page, 'length')).toHaveAttribute('aria-invalid', 'true');
    });

    // spec: calculator-page › Form controls: the unit hint is tied to the input
    test('shows the unit hint beside every length field and describes the input by it', async ({
      page,
    }) => {
      await open(page, calculator);
      await expect(page.locator('#calc-length-hint')).toHaveText(
        calculator.site['site.calculator.hintFt'] ?? '',
      );
      await expect(page.locator('#calc-thickness-hint')).toHaveText(
        calculator.site['site.calculator.hintIn'] ?? '',
      );
      await expect(input(page, 'length')).toHaveAttribute('aria-describedby', 'calc-length-hint');
      await expect(input(page, 'waste')).toHaveAttribute('aria-describedby', 'calc-waste-help');
    });

    // spec: site-shell › [SS21] the only script requests are the entry and its imports, same origin, no fetch
    test('loads one module script and makes no fetch or XHR request', async ({ page, baseURL }) => {
      const origin = new URL(baseURL ?? '').origin;
      const found: { type: string; url: string }[] = [];
      page.on('request', (request) => {
        found.push({ type: request.resourceType(), url: request.url() });
      });
      await open(page, calculator);
      await input(page, 'length').fill('20');
      await page.locator('[data-unit="metric"]').click();
      await page.waitForLoadState('networkidle');
      expect(found.filter(({ type }) => type === 'fetch' || type === 'xhr')).toEqual([]);
      expect(found.filter(({ url }) => new URL(url).origin !== origin)).toEqual([]);
      const scripts = found.filter(({ type }) => type === 'script');
      expect(scripts.length).toBeGreaterThanOrEqual(1);
      for (const { url } of scripts) expect(new URL(url).pathname).toMatch(/^\/_astro\/.+\.js$/);
    });
  });
}

// spec: site-routing-i18n › [SR7] the language switch keeps working on a static page
test('switches language on /privacy and back (site-routing-i18n › [SR7])', async ({ page }) => {
  await page.goto('/privacy');
  await page.locator('header a[hreflang]').click();
  await expect(page).toHaveURL(/\/es\/privacidad$/);
  await page.locator('header a[hreflang]').click();
  await expect(page).toHaveURL(/\/privacy$/);
});
