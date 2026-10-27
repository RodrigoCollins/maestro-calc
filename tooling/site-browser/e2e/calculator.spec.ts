import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { calculatorPages, pressSelector, typedQuery } from './calculator-pages.ts';
import type { E2ePage, Figures } from './calculator-pages.ts';

const ORANGE = 'rgb(240, 106, 29)';

const input = (page: Page, key: string): Locator => page.locator(`#calc-${key}`);
const output = (page: Page, key: string): Locator => page.locator(`[data-output="${key}"]`);
const choiceButton = (page: Page, key: string, value: string): Locator =>
  page.locator(pressSelector({ hook: 'choice', key, value }));
const stepButton = (page: Page, key: string, value: string): Locator =>
  page.locator(pressSelector({ hook: 'step', key, value }));

/** A figure of the record: a `data-output` key, or `shopping:<i>` for the i-th shopping line. */
const figureAt = (page: Page, key: string): Locator =>
  key.startsWith('shopping:')
    ? page.locator('[data-shopping]').nth(Number(key.slice('shopping:'.length)))
    : output(page, key);

/** The text of a figure list at a position. */
const figure = (figures: Figures, index: number): string => figures[index] ?? '';

/** Opens the page and waits for the script: the controls are enabled and the note is gone. */
const open = async (page: Page, calculator: E2ePage, query = ''): Promise<void> => {
  await page.goto(`${calculator.path}${query}`);
  await expect(page.locator('[data-not-running]')).toBeHidden();
  await expect(input(page, calculator.spec.ready)).toBeEnabled();
};

/** The figures of the panel, in the order of the record. */
const figuresOf = async (page: Page, calculator: E2ePage): Promise<string[]> => {
  const found: string[] = [];
  for (const key of calculator.spec.figures) {
    found.push((await figureAt(page, key).textContent()) ?? '');
  }
  return found;
};

const expectFigures = async (page: Page, calculator: E2ePage, figures: Figures): Promise<void> => {
  await expect.poll(() => figuresOf(page, calculator)).toEqual([...figures]);
};

const visibleFields = (page: Page): Promise<string[]> =>
  page
    .locator('.calc-choice-area .calc-field:visible input')
    .evaluateAll((inputs) => inputs.map((field) => field.getAttribute('name') ?? ''));

const query = (page: Page): string => new URL(page.url()).search;

/** The link the copy tests write: one step up of the first stepper, else the typed value. */
const copyQuery = (calculator: E2ePage): string =>
  calculator.spec.steppers?.[0]?.upQuery ?? typedQuery(calculator.spec);

/** Brings the page to the state `copyQuery` names. */
const driveCopyState = async (page: Page, calculator: E2ePage): Promise<void> => {
  const [stepper] = calculator.spec.steppers ?? [];
  if (stepper === undefined) {
    await input(page, calculator.spec.typed.key).fill(calculator.spec.typed.text);
  } else {
    await stepButton(page, stepper.key, 'more').click();
  }
};

for (const calculator of calculatorPages) {
  const { spec } = calculator;
  const { typed } = spec;
  const shoppingKeys = spec.figures.filter((key) => key.startsWith('shopping:'));
  const headline = spec.figures[0] ?? '';

  test.describe(`${calculator.path} with scripts (calculator-page, ${calculator.locale})`, () => {
    // spec: calculator-page › [CP41] after the mount nothing is disabled and the note is gone
    test('enables every control, reveals "Copy link" and hides the "not running" note', async ({
      page,
    }) => {
      await open(page, calculator);
      await expect(page.locator('form :disabled')).toHaveCount(0);
      await expect(page.locator('[data-copy]')).toBeVisible();
      for (const stepper of spec.steppers ?? []) {
        const buttons = page.locator(`[data-step="${stepper.key}"] button`);
        await expect(buttons).toHaveCount(2);
        await expect(buttons.first()).toBeVisible();
      }
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
      await expect(input(page, spec.ready)).toBeDisabled();
      await expect(page.locator('[data-copy]')).toBeHidden();
      await expect(figureAt(page, headline)).toHaveText(figure(spec.defaults, 0));
      for (const key of shoppingKeys) {
        await expect(figureAt(page, key)).toHaveText(
          figure(spec.defaults, spec.figures.indexOf(key)),
        );
      }
    });

    // spec: calculator-page › [CP11] the visible fields of each option, in order, and aria-pressed
    if (spec.choices !== undefined) {
      test('shows the fields of each shape in order and marks the pressed shape', async ({
        page,
      }) => {
        await open(page, calculator);
        for (const choice of spec.choices ?? []) {
          for (const option of choice.options) {
            await choiceButton(page, choice.key, option.value).click();
            expect(await visibleFields(page), option.value).toEqual([...option.fields]);
            for (const other of choice.options) {
              await expect(choiceButton(page, choice.key, other.value)).toHaveAttribute(
                'aria-pressed',
                other.value === option.value ? 'true' : 'false',
              );
            }
          }
        }
      });
    }

    // spec: calculator-page › [CP12] labels from the catalog, keyboards, no submit button
    test('labels every input from the catalog, with the right keyboard and no submit', async ({
      page,
    }) => {
      await open(page, calculator);
      const inputs = await page.locator('form input').all();
      expect(inputs).toHaveLength(spec.inputs);
      for (const field of inputs) {
        const name = (await field.getAttribute('name')) ?? '';
        const label = page.locator(`label[for="calc-${name}"]`);
        await expect(label, name).toHaveText(
          calculator.catalog[`calc.${calculator.id}.inputs.${name}`] ?? '',
        );
        await expect(field, name).toHaveAttribute(
          'inputmode',
          spec.numeric.includes(name) ? 'numeric' : 'decimal',
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

    // spec: calculator-page › [CP14] the option area has one height for every option
    if (spec.choices !== undefined) {
      test('keeps one height for the shape area whatever the shape', async ({ page }) => {
        await open(page, calculator);
        const heights = new Set<number>();
        for (const choice of spec.choices ?? []) {
          for (const option of choice.options) {
            await choiceButton(page, choice.key, option.value).click();
            const box = await page.locator('.calc-choice-area').boundingBox();
            heights.add(Math.round(box?.height ?? 0));
          }
        }
        expect([...heights]).toHaveLength(1);
      });
    }

    // spec: calculator-page › [CP19], [CP20] typing and options reproduce the live table
    test('recalculates while typing and when the shape changes', async ({ page }) => {
      await open(page, calculator);
      await input(page, typed.key).fill(typed.text);
      if (calculator.typedAnswer !== undefined) {
        await expect(page.locator('[data-answer]')).toHaveText(calculator.typedAnswer);
      }
      await expectFigures(page, calculator, typed.figures);
      await input(page, typed.key).fill(typed.back);
      for (const choice of spec.choices ?? []) {
        for (const option of choice.options) {
          if (option.figures === undefined) continue;
          await choiceButton(page, choice.key, option.value).click();
          await expectFigures(page, calculator, option.figures);
          expect(await page.locator('[data-answer]').textContent()).toMatch(
            new RegExp(`^${option.starts?.[calculator.locale]?.replace('(', '\\(') ?? ''}`),
          );
        }
      }
    });

    // spec: calculator-page › [CP21] the size on a shopping line
    if (spec.shopping?.some((line) => line.sizes !== undefined) === true) {
      test('changes the bags and the yield line with the bag size, not the volumes', async ({
        page,
      }) => {
        await open(page, calculator);
        for (const [index, line] of (spec.shopping ?? []).entries()) {
          for (const option of line.sizes?.options ?? []) {
            await choiceButton(page, line.sizes?.key ?? '', option.value).click();
            await expectFigures(page, calculator, option.figures);
            await expect(page.locator(`[data-line-note="${String(index)}"]`)).toHaveText(
              option.note[calculator.locale],
            );
            expect(await page.locator('[data-answer]').textContent()).toMatch(
              new RegExp(`${option.end[calculator.locale].replace('.', '\\.')}$`),
            );
          }
        }
      });
    }

    // spec: calculator-page › [CP22] the stepped field and its steppers
    if (spec.steppers !== undefined) {
      test('takes the waste from the field and the steppers and stops at 0 and 50', async ({
        page,
      }) => {
        await open(page, calculator);
        for (const stepper of spec.steppers ?? []) {
          await input(page, stepper.key).fill(stepper.min);
          await expectFigures(page, calculator, stepper.minFigures);
          await input(page, stepper.key).fill(stepper.base);
          await stepButton(page, stepper.key, 'more').click();
          await expect(input(page, stepper.key)).toHaveValue(stepper.up);
          await expectFigures(page, calculator, stepper.upFigures);
          await input(page, stepper.key).fill(stepper.min);
          await stepButton(page, stepper.key, 'less').click();
          await expect(input(page, stepper.key)).toHaveValue(stepper.min);
          await input(page, stepper.key).fill(stepper.max);
          await stepButton(page, stepper.key, 'more').click();
          await expect(input(page, stepper.key)).toHaveValue(stepper.max);
        }
      });
    }

    // spec: calculator-page › [CP16], [CP18] costs
    if (spec.prices !== undefined) {
      test('shows the costs once a price is typed and does not round the ready-mix volume', async ({
        page,
      }) => {
        await open(page, calculator);
        for (const price of spec.prices ?? []) {
          await expect(page.locator(`[data-cost-row="${price.output}"]`)).toBeHidden();
          if (price.hinted === true) {
            await expect(page.locator(`[data-price-hint="${price.output}"]`)).toBeVisible();
          }
          await input(page, price.input).fill(price.text);
          await expect(output(page, price.output)).toHaveText(price.value);
          if (price.hinted === true) {
            await expect(page.locator(`[data-price-hint="${price.output}"]`)).toBeHidden();
          }
        }
        await input(page, typed.key).fill(typed.text);
        await expect(figureAt(page, headline)).toHaveText(figure(typed.figures, 0));
        for (const price of spec.prices ?? []) {
          if (price.afterTyped !== undefined) {
            await expect(output(page, price.output)).toHaveText(price.afterTyped);
          }
        }
      });
    }

    // spec: calculator-page › [CP23] Enter changes neither the address nor the page and requests nothing
    test('ignores Enter in a field: same address, same page, no request', async ({ page }) => {
      await open(page, calculator);
      await input(page, typed.key).fill(typed.text);
      await expect.poll(() => query(page)).toBe(typedQuery(spec));
      const before = page.url();
      const requests: string[] = [];
      page.on('request', (request) => requests.push(request.url()));
      await input(page, typed.key).press('Enter');
      await page.waitForTimeout(200);
      expect(page.url()).toBe(before);
      expect(requests).toEqual([]);
      await expect(input(page, typed.key)).toHaveValue(typed.text);
    });

    // spec: calculator-page › [CP23] Enter does not navigate, and still presses the button it is on
    if (spec.choices !== undefined) {
      test('activates a focused button with Enter, like Space', async ({ page }) => {
        await open(page, calculator);
        const [choice] = spec.choices ?? [];
        const [first, second] = (choice?.options ?? []).filter(
          ({ value }) => value !== choice?.initial,
        );
        if (choice === undefined || first === undefined) return;
        await choiceButton(page, choice.key, first.value).focus();
        await page.keyboard.press('Enter');
        await expect(choiceButton(page, choice.key, first.value)).toHaveAttribute(
          'aria-pressed',
          'true',
        );
        await expect.poll(() => query(page)).toBe(`?v=1&${first.param ?? ''}`);
        if (second === undefined) return;
        await choiceButton(page, choice.key, second.value).focus();
        await page.keyboard.press('Space');
        await expect(choiceButton(page, choice.key, second.value)).toHaveAttribute(
          'aria-pressed',
          'true',
        );
      });
    }

    // spec: calculator-page › [CP24] every state, loaded through its link, shows the figures of the engine
    for (const state of spec.states) {
      test(`loads the state "${state.name}" from its link with the engine's figures`, async ({
        page,
      }) => {
        await open(page, calculator, state.query);
        await expectFigures(page, calculator, state.figures);
      });
    }

    // spec: calculator-page › [CP25], [CP28] restoring from a shared link and reloading
    if (spec.restored !== undefined) {
      test('restores a footing from its link and keeps its state on reload', async ({ page }) => {
        const restored = spec.restored;
        if (restored === undefined) return;
        const [first] = Object.entries(restored.values);
        await open(page, calculator, restored.query);
        await expect(
          choiceButton(page, restored.pressed.key, restored.pressed.value),
        ).toHaveAttribute('aria-pressed', 'true');
        for (const [key, text] of Object.entries(restored.values)) {
          await expect(input(page, key)).toHaveValue(text);
        }
        await expectFigures(page, calculator, restored.figures);
        await page.reload();
        await expect(input(page, spec.ready)).toBeEnabled();
        await expect(input(page, first?.[0] ?? '')).toHaveValue(first?.[1] ?? '');
        await expectFigures(page, calculator, restored.figures);
        expect(query(page)).toBe(restored.query);
      });
    }

    // spec: calculator-page › [CP26], [CP27], [CP28] the query writes and the history
    if (spec.variant !== undefined) {
      test('writes the query after each valid change, without adding to the history', async ({
        page,
      }) => {
        const variant = spec.variant;
        if (variant === undefined) return;
        const withPress = `${typedQuery(spec)}${variant.suffix}`;
        const withPrice = `${withPress}${variant.price.suffix}`;
        await open(page, calculator);
        const history = await page.evaluate(() => window.history.length);
        await input(page, typed.key).fill(typed.text);
        await expect.poll(() => query(page)).toBe(typedQuery(spec));
        await page.locator(pressSelector(variant.press)).click();
        await expect.poll(() => query(page)).toBe(withPress);
        await input(page, variant.price.input).fill(variant.price.text);
        await expect.poll(() => query(page)).toBe(withPrice);
        expect(await page.evaluate(() => window.history.length)).toBe(history);
        await page.reload();
        await expect(input(page, typed.key)).toHaveValue(typed.shown);
        await expect(output(page, variant.price.output)).toHaveText(variant.price.value);
        expect(query(page)).toBe(withPrice);
        await input(page, variant.price.input).fill('');
        await input(page, variant.price.input).blur();
        await expect.poll(() => query(page)).toBe(withPress);
      });
    }

    test('returns the query to v=1 when the value is the default again', async ({ page }) => {
      await open(page, calculator, typedQuery(spec));
      await input(page, typed.key).fill(typed.back);
      await expect.poll(() => query(page)).toBe('?v=1');
    });

    // spec: calculator-page › [CP29] bad and noisy links
    if (spec.invalidLink !== undefined) {
      test('replaces a bad value by the default and says so, and keeps a noisy query until the first edit', async ({
        page,
      }) => {
        await open(page, calculator, spec.invalidLink);
        await expect(page.locator('#calc-notice')).toHaveText(
          calculator.common['errors.INVALID_VALUE'] ?? '',
        );
        await expectFigures(page, calculator, spec.defaults);
        await open(page, calculator, `?v=2&${typed.param}`);
        await expect(page.locator('#calc-notice')).toHaveText(
          calculator.common['errors.UNSUPPORTED_VERSION'] ?? '',
        );
        await open(page, calculator, `?utm_source=x&${typed.param}`);
        await expect(input(page, typed.key)).toHaveValue(typed.shown);
        await expect(page.locator('#calc-notice')).toBeHidden();
        await open(page, calculator, '?utm_source=x');
        expect(query(page)).toBe('?utm_source=x');
        await input(page, typed.key).fill(typed.text);
        await expect.poll(() => query(page)).toBe(typedQuery(spec));
      });
    }

    // spec: calculator-page › [CP30], [CP31], [CP32], [CP46] errors without a button
    test('marks an invalid field, dashes the result, leaves the address and recovers', async ({
      page,
    }) => {
      await open(page, calculator, typedQuery(spec));
      await input(page, typed.key).fill('abc');
      const message = calculator.common['errors.MALFORMED'] ?? '';
      await expect(page.locator(`#calc-${typed.key}-error`)).toHaveText(message);
      await expect(input(page, typed.key)).toHaveAttribute('aria-invalid', 'true');
      await expect(input(page, typed.key)).toHaveAttribute(
        'aria-describedby',
        `calc-${typed.key}-error`,
      );
      await expect(page.locator('[data-answer]')).toHaveText('—');
      await expect(figureAt(page, headline)).toHaveText('—');
      expect(query(page)).toBe(typedQuery(spec));
      await input(page, typed.key).fill(typed.text);
      await expect(page.locator(`#calc-${typed.key}-error`)).toHaveCount(0);
      await expect(input(page, typed.key)).not.toHaveAttribute('aria-invalid', 'true');
      await expectFigures(page, calculator, typed.figures);
    });

    test('words the bounds in the unit of the field', async ({ page }) => {
      await open(page, calculator);
      for (const bound of spec.bounds) {
        if (bound.press !== undefined) await page.locator(pressSelector(bound.press)).click();
        await input(page, bound.key).fill(bound.text);
        const template = calculator.common[`errors.${bound.code}`] ?? '';
        await expect(page.locator(`#calc-${bound.key}-error`)).toHaveText(
          template.replace(bound.code === 'ABOVE_MAX' ? '{max}' : '{min}', bound.bound),
        );
        if (bound.restore !== undefined) await input(page, bound.key).fill(bound.restore);
      }
    });

    if (spec.rejects !== undefined) {
      test('names the decimal comma and the unknown unit', async ({ page }) => {
        await open(page, calculator);
        for (const reject of spec.rejects ?? []) {
          await input(page, reject.key).fill(reject.text);
          await expect(page.locator(`#calc-${reject.key}-error`)).toHaveText(
            calculator.common[`errors.${reject.code}`] ?? '',
          );
        }
        await expect(figureAt(page, headline)).toHaveText('—');
      });
    }

    // spec: calculator-page › [CP33], [CP34], [CP35], [CP50] the unit system
    test('toggles to metric and back without changing the state', async ({ page }) => {
      await open(page, calculator);
      await page.locator('[data-unit="metric"]').click();
      for (const [key, text] of Object.entries(spec.metric.shown)) {
        await expect(input(page, key)).toHaveValue(text);
      }
      await expect.poll(() => query(page)).toBe(spec.metric.query);
      await expect(page.locator('[data-primary]')).toHaveText(spec.metric.primary);
      if (calculator.metricAnswer !== undefined) {
        await expect(page.locator('[data-answer]')).toHaveText(calculator.metricAnswer);
      }
      for (const key of shoppingKeys) {
        await expect(figureAt(page, key)).toHaveText(
          figure(spec.defaults, spec.figures.indexOf(key)),
        );
      }
      await expect(page.locator(`#calc-${spec.metric.hint.key}-hint`)).toHaveText(
        calculator.site[spec.metric.hint.site] ?? '',
      );
      await page.locator('[data-unit="imperial"]').click();
      for (const [key, text] of Object.entries(spec.metric.back)) {
        await expect(input(page, key)).toHaveValue(text);
      }
      await expect.poll(() => query(page)).toBe('?v=1');
    });

    test('reads bare numbers as meters and centimeters in metric, and explicit units win', async ({
      page,
    }) => {
      await open(page, calculator);
      await page.locator('[data-unit="metric"]').click();
      for (const [key, text] of Object.entries(spec.metric.bare.texts)) {
        await input(page, key).fill(text);
      }
      await expect.poll(() => query(page)).toBe(spec.metric.bare.query);
      await expectFigures(page, calculator, spec.metric.bare.figures);
      await input(page, typed.key).fill(`${typed.text} ft`);
      await expect.poll(() => query(page)).toContain(typed.param);
    });

    test('goes from metric entry back to US with the exact inches', async ({ page }) => {
      await open(page, calculator);
      const { back, texts } = spec.metric.bare;
      await page.locator('[data-unit="metric"]').click();
      await input(page, back.key).fill(texts[back.key] ?? '');
      await page.locator('[data-unit="imperial"]').click();
      await expect(input(page, back.key)).toHaveValue(back.shown);
      expect(query(page)).toContain(back.param);
    });

    // spec: calculator-page › [CP36], [CP37]; site-routing-i18n › [SR20], [SR21], [SR22]
    test('keeps the language switch pointing at the other page with the current query', async ({
      page,
    }) => {
      await open(page, calculator, typedQuery(spec));
      const toggle = page.locator('header a[hreflang]');
      await expect(toggle).toHaveAttribute('href', `${calculator.other}${typedQuery(spec)}`);
      if (spec.variant !== undefined) {
        await page.locator(pressSelector(spec.variant.press)).click();
        await expect(toggle).toHaveAttribute(
          'href',
          `${calculator.other}${typedQuery(spec)}${spec.variant.suffix}`,
        );
      }
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
        'href',
        `https://maestrocalc.com${calculator.path}`,
      );
      expect(await page.locator('link[rel=alternate][hreflang]').count()).toBe(3);
      await open(page, calculator);
      await expect(toggle).toHaveAttribute('href', calculator.other);
    });

    test('opens the other language with the same numbers', async ({ page }) => {
      await open(page, calculator, typedQuery(spec));
      await page.locator('header a[hreflang]').click();
      await expect(page).toHaveURL(
        new RegExp(`${calculator.other}\\?${typedQuery(spec).slice(1)}$`),
      );
      await expect(page.locator('[data-not-running]')).toBeHidden();
      await expectFigures(page, calculator, typed.figures);
      await expect(input(page, typed.key)).toHaveValue(typed.shown);
    });

    // spec: calculator-page › [CP38], [CP39] copy link
    test('copies the address with the query and says so', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await open(page, calculator);
      await driveCopyState(page, calculator);
      await page.locator('[data-copy]').click();
      await expect(page.locator('[data-copy-status]')).toHaveText(
        calculator.site['site.calculator.linkCopied'] ?? '',
      );
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        `${new URL(page.url()).origin}${calculator.path}${copyQuery(calculator)}`,
      );
    });

    test('shows a read-only field with the address when the copy is rejected', async ({ page }) => {
      await open(page, calculator, copyQuery(calculator));
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
        `${new URL(page.url()).origin}${calculator.path}${copyQuery(calculator)}`,
      );
      await expect(fallback).toBeFocused();
    });

    // spec: calculator-page › [CP45] the keyboard path, in the visual order, with the orange ring
    test('tabs through the controls in visual order and rings each in safety orange', async ({
      page,
    }) => {
      await open(page, calculator);
      await page.locator(spec.tabOrder[0] ?? 'body').focus();
      for (const [index, selector] of spec.tabOrder.entries()) {
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
      await input(page, typed.key).fill('abc');
      const message = calculator.common['errors.MALFORMED'] ?? '';
      const description = await input(page, typed.key).evaluate((element) => {
        const ids = (element.getAttribute('aria-describedby') ?? '').split(' ');
        return ids
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' ')
          .trim();
      });
      expect(description).toBe(message);
      await expect(input(page, typed.key)).toHaveAttribute('aria-invalid', 'true');
    });

    // spec: calculator-page › Form controls: the unit hint is tied to the input
    if (spec.hints !== undefined) {
      test('shows the unit hint beside every length field and describes the input by it', async ({
        page,
      }) => {
        await open(page, calculator);
        for (const hint of spec.hints ?? []) {
          if (hint.site === undefined) continue;
          await expect(page.locator(`#calc-${hint.key}-hint`)).toHaveText(
            calculator.site[hint.site] ?? '',
          );
        }
        for (const hint of spec.hints ?? []) {
          await expect(input(page, hint.key)).toHaveAttribute('aria-describedby', hint.describedBy);
        }
      });
    }

    // spec: site-shell › [SS21] the only script requests are the entry and its imports, same origin, no fetch
    test('loads one module script and makes no fetch or XHR request', async ({ page, baseURL }) => {
      const origin = new URL(baseURL ?? '').origin;
      const found: { type: string; url: string }[] = [];
      page.on('request', (request) => {
        found.push({ type: request.resourceType(), url: request.url() });
      });
      await open(page, calculator);
      await input(page, typed.key).fill(typed.text);
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
