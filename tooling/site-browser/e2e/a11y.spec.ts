import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { formatViolations } from './axe-report.ts';
import { calculatorPages } from './calculator-pages.ts';
import type { E2ePage } from './calculator-pages.ts';
import { choiceButton, copyButton, denyClipboard, input, open } from './locators.ts';
import { notFoundSamples, routable } from './urls.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.describe('axe (site-quality › [SQ1], [SQ2])', () => {
  for (const path of [...routable, ...notFoundSamples]) {
    test(`has no WCAG A or AA violation on ${path}`, async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations, formatViolations(path, violations)).toEqual([]);
    });
  }

  test('reports a seeded violation and names the page and the rule', async ({ page }) => {
    await page.setContent('<html lang="en"><title>t</title><img src="x.png">');
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(violations.map(({ id }) => id)).toContain('image-alt');
    const message = formatViolations('seeded page', violations);
    expect(message).toContain('seeded page');
    expect(message).toContain('image-alt');
  });
});

/** One interactive state of a calculator page and how to reach it. */
interface AxeState {
  readonly name: string;
  readonly drive: (page: Page) => Promise<void>;
}

/**
 * The interactive states of a calculator page that axe scans (site-quality › [SQ17]): the default
 * state, one state per option of each choice group the record declares, an invalid field, the
 * metric system, the cost rows when the page has prices, and the failed copy.
 */
const statesOf = (calculator: E2ePage): readonly AxeState[] => {
  const { spec } = calculator;
  return [
    { name: 'default', drive: async () => undefined },
    ...(spec.choices ?? []).flatMap((choice) =>
      choice.options
        .filter((option) => option.value !== choice.initial)
        .map((option) => ({
          name: option.value,
          drive: (page: Page) => choiceButton(page, choice.key, option.value).click(),
        })),
    ),
    { name: 'error', drive: (page) => input(page, spec.typed.key).fill('abc') },
    { name: 'metric', drive: (page) => page.locator('[data-unit="metric"]').click() },
    ...(spec.prices === undefined
      ? []
      : [
          {
            name: 'cost rows visible',
            drive: async (page: Page) => {
              for (const price of spec.prices ?? []) {
                await input(page, price.input).fill(price.text);
              }
            },
          },
        ]),
    {
      name: 'copy failed',
      drive: async (page) => {
        await denyClipboard(page);
        await copyButton(page).click();
        await expect(page.locator('#calc-fallback')).toBeVisible();
      },
    },
  ];
};

/** The invalid inputs whose accessible description is not the text of their message (calculator-page › [CP46]). */
const associationProblems = (page: Page): Promise<string[]> =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('input[aria-invalid="true"]')).flatMap((field) => {
      const ids = (field.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
      const description = ids
        .map((id) => document.getElementById(id)?.textContent ?? '')
        .join(' ')
        .trim();
      const message = document.getElementById(`${field.id}-error`)?.textContent ?? '';
      return description !== '' && description === message
        ? []
        : [`error-association: ${field.id} is described by "${description}", not by its message`];
    }),
  );

/** One line per problem of the current state: the axe violations and the association of the messages. */
const stateProblems = async (page: Page, name: string, state: string): Promise<string[]> => {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return [
    ...formatViolations(`${name} (${state})`, violations).split('\n').filter(Boolean),
    ...(await associationProblems(page)).map((line) => `${name} (${state}): ${line}`),
  ];
};

test.describe('axe on the interactive calculator states (site-quality › [SQ17], [SQ20])', () => {
  for (const calculator of calculatorPages) {
    for (const state of statesOf(calculator)) {
      test(`has no violation on ${calculator.path} in the ${state.name} state`, async ({
        page,
      }) => {
        await open(page, calculator);
        await state.drive(page);
        expect(await stateProblems(page, calculator.path, state.name)).toEqual([]);
      });
    }
  }

  // spec: site-quality › [SQ20] a built copy where the message lost its association fails, naming page, state and rule
  test('fails a copy whose error message lost its association, naming the page, the state and the rule', async ({
    page,
  }) => {
    const [calculator] = calculatorPages;
    await page.route('**/_astro/*.js', async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replaceAll('aria-describedby', 'data-lost-association');
      await route.fulfill({ response, body });
    });
    if (calculator === undefined) throw new Error('the record has no calculator page');
    const { ready, typed } = calculator.spec;
    await page.goto(calculator.path);
    await expect(input(page, ready)).toBeEnabled();
    await input(page, typed.key).fill('abc');
    const problems = await stateProblems(page, calculator.path, 'error');
    expect(problems.join('\n')).toContain(
      `${calculator.path} (error): error-association: calc-${typed.key}`,
    );
  });
});
