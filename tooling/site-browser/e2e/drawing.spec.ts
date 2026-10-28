import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
// the character width the geometry estimates a label with, in font sizes (design B5)
import { CHAR } from '../../../apps/web/src/calculator/slots/drawing.ts';
import { formatViolations } from './axe-report.ts';
import { calculatorPages } from './calculator-pages.ts';
import { answer, drawing, input, open } from './locators.ts';

/*
 * The live plan of the result panel (blueprint-drawing), for every page whose record declares the
 * `drawing` group: the box keeps its size, the labels follow the last valid state, the name follows
 * them without a live region, the labels fit and never collide, and nothing breaks the CSP or axe.
 * Linux CI is the final word on the measured widths and sizes.
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** The widths of blueprint-drawing › [BD20], those of calculator-page › [CP59], with 767 px below the 48rem two-column edge. */
const WIDTHS = [320, 390, 480, 640, 767, 768, 1024, 1280] as const;

const drawn = calculatorPages.flatMap((calculator) =>
  calculator.spec.drawing === undefined ? [] : [{ calculator, group: calculator.spec.drawing }],
);

/** The texts of the labels of the plan, in drawing order. */
const labelsOf = (page: Page): Promise<string[]> => drawing(page).locator('text').allTextContents();

/** The size of the box and the top of the element after it, in CSS px. */
const boxOf = (page: Page) =>
  drawing(page).evaluate((box) => {
    const { width, height, bottom } = box.getBoundingClientRect();
    const next = box.nextElementSibling?.getBoundingClientRect().top ?? Number.NaN;
    return { width, height, next: next - bottom };
  });

/** The width over the height of the drawn outline. */
const ratioOf = (page: Page): Promise<number> =>
  drawing(page)
    .locator('rect')
    .evaluate((rect) => Number(rect.getAttribute('width')) / Number(rect.getAttribute('height')));

/** The outline and line coordinates of the plan, to compare two states. */
const shapeOf = (page: Page): Promise<string[]> =>
  drawing(page)
    .locator('rect, path')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('d') ?? node.outerHTML));

/** Each label's measured box and estimated width, in viewBox units, and the viewBox itself. */
const measure = (page: Page) =>
  drawing(page).evaluate((box, char) => {
    const view = (box as SVGSVGElement).viewBox.baseVal;
    const labels = [...box.querySelectorAll('text')].map((text) => {
      const { x, y, width, height } = text.getBBox();
      const size = Number(text.getAttribute('font-size'));
      return {
        text: text.textContent ?? '',
        box: { x, y, width, height },
        estimate: (text.textContent ?? '').length * size * char,
      };
    });
    return { view: { width: view.width, height: view.height }, labels };
  }, CHAR);

type Measured = Awaited<ReturnType<typeof measure>>;

/** What breaks blueprint-drawing › [BD14] in one measured plan: a label wider than estimated, out of the box, or on another. */
const labelProblems = ({ view, labels }: Measured): string[] => [
  ...labels
    .filter(({ box, estimate }) => box.width > estimate)
    .map(
      ({ text, box, estimate }) =>
        `"${text}" is ${String(box.width)} wide, over ${String(estimate)}`,
    ),
  ...labels
    .filter(
      ({ box }) =>
        box.x < 0 ||
        box.y < 0 ||
        box.x + box.width > view.width ||
        box.y + box.height > view.height,
    )
    .map(({ text }) => `"${text}" leaves the drawing`),
  ...labels.flatMap((a, index) =>
    labels
      .slice(index + 1)
      .filter(
        (b) =>
          a.box.x < b.box.x + b.box.width &&
          b.box.x < a.box.x + a.box.width &&
          a.box.y < b.box.y + b.box.height &&
          b.box.y < a.box.y + a.box.height,
      )
      .map((b) => `"${a.text}" overlaps "${b.text}"`),
  ),
];

/** Opens the page with or without its script, at a width, in a context of its own. */
const withPage = async (
  browser: Browser,
  options: { readonly javaScriptEnabled: boolean; readonly fonts?: boolean },
  use: (page: Page) => Promise<void>,
): Promise<void> => {
  const context = await browser.newContext({ javaScriptEnabled: options.javaScriptEnabled });
  try {
    const page = await context.newPage();
    if (options.fonts === false) await page.route('**/_astro/fonts/**', (route) => route.abort());
    await use(page);
  } finally {
    await context.close();
  }
};

/** The labels of the typed state, once the plan shows them. */
const typeAndWait = async (page: Page, key: string, text: string, labels: readonly string[]) => {
  await input(page, key).fill(text);
  await expect(drawing(page).locator('text')).toHaveText([...labels]);
};

test.describe('every page that renders a drawing box declares the drawing group (site-quality › [SQ42])', () => {
  for (const calculator of calculatorPages) {
    test(`${calculator.path} has a box exactly when its record has the group`, async ({ page }) => {
      await page.goto(calculator.path);
      await expect(drawing(page)).toHaveCount(calculator.spec.drawing === undefined ? 0 : 1);
    });
  }
});

for (const { calculator, group } of drawn) {
  const { path, locale } = calculator;
  const drive = (key: string, text: string, labels: readonly string[]) => (page: Page) =>
    typeAndWait(page, key, text, labels);

  test.describe(`${path} drawing (blueprint-drawing, ${locale})`, () => {
    // spec: blueprint-drawing › [BD19] drawn and named once the script runs; [BD1] the default labels
    test('draws the default plan, named, with role img and no aria-hidden', async ({ page }) => {
      await open(page, calculator);
      await expect(drawing(page).locator('text')).toHaveText([...group.labels]);
      await expect(drawing(page)).toHaveAttribute('role', 'img');
      await expect(drawing(page)).toHaveAttribute('aria-label', group.name[locale]);
      await expect(drawing(page)).not.toHaveAttribute('aria-hidden', /.*/);
    });

    // spec: blueprint-drawing › [BD9], [BD15] typing relabels, redraws and renames
    test('follows a typed value: labels, outline ratio and name', async ({ page }) => {
      await open(page, calculator);
      await typeAndWait(page, group.typed.key, group.typed.text, group.typed.labels);
      expect(await ratioOf(page)).toBeCloseTo(group.typed.ratio, 2);
      await expect(drawing(page)).toHaveAttribute('aria-label', group.typed.name[locale]);
    });

    // spec: blueprint-drawing › [BD10] an invalid value keeps the last valid plan
    test('keeps the last valid plan while a field is invalid', async ({ page }) => {
      await open(page, calculator);
      await typeAndWait(page, group.kept.key, group.kept.text, group.kept.labels);
      const before = await shapeOf(page);
      await input(page, group.kept.key).fill('abc');
      await expect(input(page, group.kept.key)).toHaveAttribute('aria-invalid', 'true');
      if (calculator.spec.answer !== undefined) await expect(answer(page)).toHaveText('—');
      expect(await labelsOf(page)).toEqual(group.kept.labels);
      expect(await shapeOf(page)).toEqual(before);
    });

    // spec: blueprint-drawing › [BD11] the unit toggle relabels and moves nothing
    test('relabels on the unit toggle and keeps every coordinate', async ({ page }) => {
      await open(page, calculator);
      const before = await shapeOf(page);
      await page.locator('[data-unit="metric"]').click();
      await expect(drawing(page).locator('text')).toHaveText([...group.metric]);
      expect(await shapeOf(page)).toEqual(before);
    });

    // spec: blueprint-drawing › [BD16], [BD17] no live region; the name changes once per valid change
    test('is no live region and renames only on a valid change while typing', async ({ page }) => {
      await open(page, calculator);
      expect(
        await drawing(page).evaluate(
          (box) => box.closest('[aria-live], [role="status"], [role="alert"]') === null,
        ),
      ).toBe(true);
      await drawing(page).evaluate((box) => {
        const names: string[] = [];
        (window as Window & { names?: string[] }).names = names;
        new MutationObserver(() => names.push(box.getAttribute('aria-label') ?? '')).observe(box, {
          attributeFilter: ['aria-label'],
        });
      });
      const field = input(page, group.typed.key);
      await field.fill('');
      await field.pressSequentially('15');
      await expect(field).toHaveValue('15');
      // '' is invalid (no plan), then '1' and '15' are two valid states: two renames, no other
      await expect
        .poll(() => page.evaluate(() => (window as Window & { names?: string[] }).names?.length))
        .toBe(2);
    });

    // spec: blueprint-drawing › [BD25] no CSP violation and no inline style while drawing
    test('draws with no CSP violation and no inline style', async ({ page }) => {
      const violations: string[] = [];
      page.on('console', (message) => {
        if (/content security policy/i.test(message.text())) violations.push(message.text());
      });
      await open(page, calculator);
      await typeAndWait(page, group.typed.key, group.typed.text, group.typed.labels);
      await page.locator('[data-unit="metric"]').click();
      await expect(drawing(page).locator('text').first()).not.toHaveText(
        group.typed.labels[0] ?? '',
      );
      expect(await drawing(page).locator('[style]').count()).toBe(0);
      expect(await drawing(page).getAttribute('style')).toBeNull();
      expect(violations).toEqual([]);
    });

    // spec: blueprint-drawing › [BD18] axe reports nothing in the drawn states, contrast included
    for (const [name, run] of [
      ['default', async () => undefined],
      ['typed', drive(group.typed.key, group.typed.text, group.typed.labels)],
    ] as const) {
      test(`has no axe violation with the ${name} plan drawn`, async ({ page }) => {
        await open(page, calculator);
        await run(page);
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        expect(violations, formatViolations(`${path} ${name}`, violations)).toEqual([]);
      });
    }

    // spec: blueprint-drawing › [BD20] the box is the same size with and without the script, and
    // nothing below it moves, at every width, for the default and each recorded state
    for (const query of ['', ...group.queries]) {
      test(`keeps the box size and what follows it with the script at every width${query === '' ? '' : ` (${query})`}`, async ({
        browser,
      }) => {
        test.slow();
        for (const width of WIDTHS) {
          const sizes: { width: number; height: number; next: number }[] = [];
          for (const javaScriptEnabled of [false, true]) {
            await withPage(browser, { javaScriptEnabled }, async (page) => {
              await page.setViewportSize({ width, height: 844 });
              if (javaScriptEnabled) {
                await open(page, calculator, query);
                await expect(drawing(page)).toHaveAttribute('role', 'img');
              } else {
                await page.goto(`${path}${query}`);
              }
              sizes.push(await boxOf(page));
            });
          }
          expect(sizes[1], `${String(width)} px`).toEqual(sizes[0]);
        }
      });
    }

    // spec: blueprint-drawing › [BD20] from 48rem the panel is two columns, the drawing on the
    // right and wider than the rows; below 48rem it sits between the large figure and the rows
    test('sits beside the figures from 48rem and under the large figure below it', async ({
      page,
    }) => {
      await open(page, calculator);
      for (const width of [767, 768, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        const { box, primary, rows } = await page.evaluate(() => {
          const rect = (selector: string) => {
            const found = document.querySelector(selector)?.getBoundingClientRect();
            if (found === undefined) throw new Error(`no ${selector}`);
            return found.toJSON() as {
              top: number;
              bottom: number;
              left: number;
              right: number;
              width: number;
            };
          };
          return {
            box: rect('[data-drawing]'),
            primary: rect('.calc-primary'),
            rows: rect('.calc-rows'),
          };
        });
        const at = `${String(width)} px`;
        if (width < 768) {
          expect(box.top, at).toBeGreaterThanOrEqual(primary.bottom);
          expect(rows.top, at).toBeGreaterThanOrEqual(box.bottom);
        } else {
          expect(box.left, at).toBeGreaterThanOrEqual(rows.right);
          expect(box.top, at).toBeLessThan(primary.bottom);
          expect(box.width, at).toBeGreaterThan(rows.width);
        }
      }
    });

    // spec: blueprint-drawing › [BD23] with no script: present, empty, plain ink, hidden from AT
    // (the page script is refused, as a browser that blocks it would; axe itself needs JavaScript)
    test('is an empty, plain, hidden box with no script', async ({ page }) => {
      await page.route('**/_astro/*.js', (route) => route.abort());
      await page.goto(path);
      await expect(drawing(page)).toHaveAttribute('aria-hidden', 'true');
      expect(await drawing(page).evaluate((box) => box.childElementCount)).toBe(0);
      expect(await drawing(page).evaluate((box) => getComputedStyle(box).backgroundImage)).toBe(
        'none',
      );
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations, formatViolations(`${path} no script`, violations)).toEqual([]);
    });

    // spec: blueprint-drawing › [BD14] at 320 px the longest labels fit their estimate, stay in the
    // box and never meet, with the web fonts and with the fallback font
    for (const fonts of [true, false]) {
      test(`fits the longest labels at 320 px with ${fonts ? 'the web fonts' : 'the fallback font'}`, async ({
        browser,
      }) => {
        await withPage(browser, { javaScriptEnabled: true, fonts }, async (page) => {
          await page.setViewportSize({ width: 320, height: 844 });
          for (const query of group.longest) {
            await open(page, calculator, query);
            await expect(drawing(page)).toHaveAttribute('role', 'img');
            await page.evaluate(() => document.fonts.ready);
            expect(labelProblems(await measure(page)), query).toEqual([]);
          }
        });
      });
    }
  });
}

test.describe('the label check finds what it forbids (seeded)', () => {
  const label = (text: string, x: number, width: number) => ({
    text,
    box: { x, y: 10, width, height: 20 },
    estimate: 50,
  });
  const view = { width: 300, height: 200 };

  test('names a label over its estimate, one out of the box and two that meet', () => {
    expect(labelProblems({ view, labels: [label('wide', 0, 60)] })).toEqual([
      '"wide" is 60 wide, over 50',
    ]);
    expect(labelProblems({ view, labels: [label('out', 280, 40)] })).toContain(
      '"out" leaves the drawing',
    );
    expect(labelProblems({ view, labels: [label('a', 0, 40), label('b', 30, 40)] })).toEqual([
      '"a" overlaps "b"',
    ]);
    expect(labelProblems({ view, labels: [label('a', 0, 40), label('b', 40, 40)] })).toEqual([]);
  });
});
