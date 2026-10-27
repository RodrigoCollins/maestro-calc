import { expect, test } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import { calculatorPages, typedQuery } from './calculator-pages.ts';
import { answer, notRunning, open } from './locators.ts';

// The seven widths of calculator-page › [CP59] plus both edges of every breakpoint of calculator.css
// (the first width where a rule applies and the one before it). `styles.contract.test.ts` reads this
// literal and fails when a breakpoint has an edge missing here.
const WIDTHS = [
  320, 355, 356, 385, 386, 390, 463, 464, 480, 481, 640, 666, 667, 729, 730, 768, 1024, 1280,
] as const;

type Block = 'answer' | 'notice' | 'copy';
interface Probe {
  readonly natural: number;
  readonly reserved: number;
  /** The computed line height of the block's text: its own unit (Terms of calculator-page). */
  readonly line: number;
}
type Probes = Partial<Record<Block, Probe>>;
interface Variants {
  readonly answers: readonly string[];
  readonly notices: readonly string[];
  readonly copied: string;
}

/** A page of its own in a fresh desktop context, so the width is the one the test sets. */
const pageOf = async (browser: Browser, javaScriptEnabled = true): Promise<Page> =>
  (await browser.newContext({ javaScriptEnabled })).newPage();

/**
 * The natural height of each reserved block at the current width: the tallest content it takes
 * (each variant set in turn), read with `min-height: 0` and `display: flow-root` so the note's
 * paragraph margin counts, then restored (design K13; the probe of calculator-page › [CP59]-[CP61]).
 */
const probeBlocks = async (page: Page, variants: Variants): Promise<Probes> =>
  page.evaluate(
    ([v, note]) => {
      const natural = (element: HTMLElement): number => {
        const { minHeight, display } = element.style;
        element.style.minHeight = '0px';
        element.style.display = 'flow-root';
        const height = element.getBoundingClientRect().height;
        element.style.minHeight = minHeight;
        element.style.display = display;
        return height;
      };
      const find = (block: string): HTMLElement | null =>
        document.querySelector<HTMLElement>(`[data-reserved="${block}"]`);
      const probe = (element: HTMLElement, heights: number[]): Probe => ({
        natural: Math.max(...heights),
        reserved: element.getBoundingClientRect().height,
        line: Number.parseFloat(getComputedStyle(element).lineHeight),
      });
      const result: Probes = {};
      const answerBlock = find('answer');
      if (answerBlock !== null) {
        const text = answerBlock.textContent;
        const heights = v.answers.map((sentence) => {
          answerBlock.textContent = sentence;
          return natural(answerBlock);
        });
        answerBlock.textContent = text;
        result.answer = probe(answerBlock, heights);
      }
      const noticeBlock = find('notice');
      const link = document.getElementById('calc-notice');
      if (noticeBlock && note instanceof HTMLElement && link) {
        const state = [note.hidden, link.hidden, link.textContent] as const;
        note.hidden = false;
        link.hidden = true;
        const heights = [natural(noticeBlock)];
        note.hidden = true;
        link.hidden = false;
        for (const text of v.notices) {
          link.textContent = text;
          heights.push(natural(noticeBlock));
        }
        [note.hidden, link.hidden, link.textContent] = state;
        result.notice = probe(noticeBlock, heights);
      }
      const copyBlock = find('copy');
      const status = copyBlock?.querySelector('[data-copy-status]');
      if (copyBlock && status) {
        const text = status.textContent;
        status.textContent = v.copied;
        const heights = [natural(copyBlock)];
        status.textContent = text;
        result.copy = probe(copyBlock, heights);
      }
      return result;
    },
    [variants, await notRunning(page).elementHandle()] as const,
  );

/** The inert message of the page template, by id. */
const messageOf = (page: Page, id: string): Promise<string> =>
  page.evaluate(
    (key) =>
      document
        .querySelector<HTMLTemplateElement>('template[data-messages]')
        ?.content.getElementById(key)?.textContent ?? '',
    id,
  );

/** The reserved block and the top of the element right below it, by block. */
const boxesOf = (page: Page): Promise<Record<string, [number, number]>> =>
  page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll<HTMLElement>('[data-reserved]')].flatMap((block) => {
        const below = block.nextElementSibling?.getBoundingClientRect();
        return [
          [
            block.dataset['reserved'] ?? '',
            [block.getBoundingClientRect().height, (below?.top ?? 0) + scrollY],
          ],
        ];
      }),
    ),
  );

/** Sums the layout-shift entries that no input caused, from the start of the load. */
const shiftOf = (page: Page): Promise<number> =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        const entries = performance.getEntriesByType('layout-shift') as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[];
        resolve(
          entries.filter((entry) => !entry.hadRecentInput).reduce((sum, e) => sum + e.value, 0),
        );
      }),
  );

for (const calculator of calculatorPages) {
  test.describe(`${calculator.path} layout (calculator-page › Layout stability, ${calculator.locale})`, () => {
    // spec: calculator-page › [CP44], site-quality › [SQ19] the load shifts nothing, with and without a state
    for (const query of ['', calculator.spec.restored?.query ?? typedQuery(calculator.spec)]) {
      test(`shifts the layout by at most 0.01 on load at every width${query === '' ? '' : ' with a state in the link'}`, async ({
        page,
      }) => {
        await page.addInitScript(() => {
          new PerformanceObserver(() => undefined).observe({
            type: 'layout-shift',
            buffered: true,
          });
        });
        for (const width of WIDTHS) {
          await page.setViewportSize({ width, height: 844 });
          await open(page, calculator, query);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(250);
          expect(await shiftOf(page), `${String(width)} px`).toBeLessThanOrEqual(0.01);
        }
      });
    }

    // spec: calculator-page › [CP44], [CP62] with the notice showing nothing moves, at every width
    for (const width of WIDTHS) {
      test(`keeps the notice, shape and copy areas at their reserved size at ${String(width)} px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 844 });
        await open(page, calculator);
        const before = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.goto(`${calculator.path}?v=2&${calculator.spec.typed.param}`);
        await expect(page.locator('#calc-notice')).toBeVisible();
        const withNotice = await page.evaluate(() => document.documentElement.scrollHeight);
        expect(withNotice).toBe(before);
      });
    }
  });
}

const ids = [...new Set(calculatorPages.map(({ id }) => id))];
for (const id of ids) {
  const pages = calculatorPages.filter((calculator) => calculator.id === id);

  test.describe(`${id} reserved blocks (calculator-page › Layout stability, both locales)`, () => {
    // spec: calculator-page › [CP59], [CP60], [CP61] the content fits and under one line of its own unit is unused
    test('fits every reserved block at every width with less than one line unused', async ({
      browser,
    }) => {
      const page = await pageOf(browser);
      const measured = new Map<number, [string, Probes][]>();
      for (const calculator of pages) {
        await open(page, calculator);
        const sentences: string[] = ['—'];
        if (calculator.spec.answer !== undefined) {
          for (const query of calculator.spec.layoutQueries) {
            await open(page, calculator, query);
            sentences.push((await answer(page).textContent()) ?? '');
          }
        }
        const variants: Variants = {
          answers: sentences,
          notices: [
            await messageOf(page, 'errors.INVALID_VALUE'),
            await messageOf(page, 'errors.UNSUPPORTED_VERSION'),
          ],
          copied: await messageOf(page, 'copy.copied'),
        };
        for (const width of WIDTHS) {
          await page.setViewportSize({ width, height: 900 });
          measured.set(width, [
            ...(measured.get(width) ?? []),
            [calculator.locale, await probeBlocks(page, variants)],
          ]);
        }
      }
      for (const [width, rows] of measured) {
        for (const block of ['answer', 'notice', 'copy'] as const) {
          const probes = rows.flatMap(([locale, probes]) =>
            probes[block] === undefined ? [] : [{ locale, ...probes[block] }],
          );
          const tallest = Math.max(...probes.map(({ natural }) => natural));
          for (const { locale, reserved, line, natural } of probes) {
            const label = `${block} ${locale} at ${String(width)} px`;
            expect(natural, `${label}: content fits`).toBeLessThanOrEqual(reserved + 0.05);
            expect(reserved - tallest, `${label}: unused reserve`).toBeLessThan(line);
          }
        }
      }
    });

    // spec: calculator-page › [CP62], [CP63] the server HTML and the mounted page have the same boxes at every width
    const [first] = pages;
    const stated =
      first === undefined ? [] : [first.spec.restored?.query ?? typedQuery(first.spec)];
    for (const query of ['', ...stated]) {
      test(`puts the reserved blocks and what follows them where the script-free page puts them${query === '' ? '' : ' with a state in the link'}`, async ({
        browser,
      }) => {
        for (const calculator of pages) {
          const mounted = await pageOf(browser);
          const plain = await pageOf(browser, false);
          await open(mounted, calculator, query);
          await plain.goto(calculator.path);
          for (const width of WIDTHS) {
            await mounted.setViewportSize({ width, height: 900 });
            await plain.setViewportSize({ width, height: 900 });
            expect(await boxesOf(mounted), `${calculator.locale} at ${String(width)} px`).toEqual(
              await boxesOf(plain),
            );
          }
        }
      });
    }
  });
}
