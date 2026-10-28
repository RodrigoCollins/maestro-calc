import { expect, test } from '@playwright/test';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { edgesOf } from '../../../apps/web/src/__testing__/css-media.ts';
import { calculatorPages, typedQuery } from './calculator-pages.ts';
import { answer, notRunning, open } from './locators.ts';

// The seven widths of calculator-page › [CP59] plus both edges of every breakpoint of calculator.css
// and of every `reserve` of the page table (the first width where a rule applies and the one before
// it). `styles.contract.test.ts` reads this literal and fails when a breakpoint has an edge missing.
const WIDTHS = [
  320, 355, 356, 385, 386, 390, 463, 464, 480, 481, 640, 666, 667, 729, 730, 768, 1024, 1280,
] as const;

type Block = 'answer' | 'notice' | 'copy';

/**
 * The last width before each breakpoint of a block, for the page that is open. Text wraps a few
 * pixels earlier on some platforms (Linux Chromium) than where the breakpoints were measured
 * (macOS), so there the block may hold one line less than its reserve: up to one line more is
 * allowed at these widths only. The fit check stays strict at every width, and the breakpoints
 * follow the latest drop, so the content fits everywhere. The edges are read from the CSS the page
 * ships (its head `<style>` and its stylesheets) through `edgesOf`, so one page's breakpoints never
 * loosen another page's check; the copy block, whose height does not step, takes both.
 */
type BeforeEdges = Readonly<Record<Block, ReadonlySet<number>>>;

const cssOf = (page: Page): Promise<string> =>
  page.evaluate(async () => {
    const inline = [...document.querySelectorAll('style')].map((style) => style.textContent ?? '');
    const linked = await Promise.all(
      [...document.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')].map(async (link) =>
        (await fetch(link.href)).text(),
      ),
    );
    return [...inline, ...linked].join('\n');
  });

const beforeEdgesOf = (css: string): BeforeEdges => {
  const before = (property: string): Set<number> =>
    new Set(edgesOf(css, property).map((rem) => Math.ceil(rem * 16) - 1));
  const answer = before('--answer-lines');
  const notice = before('--notice-lines');
  return { answer, notice, copy: new Set([...answer, ...notice]) };
};
interface Probe {
  readonly natural: number;
  /** The computed `min-height` of the block (border box), in px. */
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

/**
 * Runs `use` with pages of their own, each in a fresh context (the project's phone options, with
 * JavaScript on or off as asked), and closes every context it opened, whatever `use` does.
 */
const withPages = async (
  browser: Browser,
  scripts: readonly boolean[],
  use: (pages: Page[]) => Promise<void>,
): Promise<void> => {
  const contexts: BrowserContext[] = [];
  try {
    const pages: Page[] = [];
    for (const javaScriptEnabled of scripts) {
      const context = await browser.newContext({ javaScriptEnabled });
      contexts.push(context);
      pages.push(await context.newPage());
    }
    await use(pages);
  } finally {
    await Promise.all(contexts.map((context) => context.close()));
  }
};

/**
 * The natural height of each reserved block at the current width: the tallest content it takes
 * (each variant set in turn), read with `min-height: 0` and `display: flow-root` so the note's
 * paragraph margin counts, then restored (design K13; the probe of calculator-page › [CP59]-[CP61]).
 */
const probeBlocks = async (page: Page, variants: Variants): Promise<Probes> => {
  const note = await notRunning(page).elementHandle();
  try {
    return await page.evaluate(
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
          // the computed min-height, not the box: the box grows with the content it holds now, so
          // reading it would let a reserve smaller than the current text pass the fit check
          reserved: Number.parseFloat(getComputedStyle(element).minHeight),
          line: Number.parseFloat(getComputedStyle(element).lineHeight),
        });
        const result: Probes = {};
        const answerBlock = find('answer');
        if (answerBlock !== null) {
          const children = [...answerBlock.childNodes];
          const heights = v.answers.map((sentence) => {
            answerBlock.textContent = sentence;
            return natural(answerBlock);
          });
          answerBlock.replaceChildren(...children);
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
      [variants, note] as const,
    );
  } finally {
    await note?.dispose();
  }
};

/** The inert message of the page template, by id. */
const messageOf = (page: Page, id: string): Promise<string> =>
  page.evaluate(
    (key) =>
      document
        .querySelector<HTMLTemplateElement>('template[data-messages]')
        ?.content.getElementById(key)?.textContent ?? '',
    id,
  );

/**
 * The reserved block and the top of the element that follows it in the document, by block. Fails
 * when the page has no reserved block or a block has nothing after it, so a missed lookup never
 * compares as equal.
 */
const boxesOf = async (page: Page): Promise<Record<string, [number, number]>> => {
  const boxes = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-reserved]')].map(
      (block): [string, number, number | null] => {
        // the next sibling of the block or, for a last child, of its nearest ancestor that has one
        let from: Element | null = block;
        while (from !== null && from.nextElementSibling === null) from = from.parentElement;
        const below = from?.nextElementSibling?.getBoundingClientRect();
        return [
          block.dataset['reserved'] ?? '',
          block.getBoundingClientRect().height,
          below === undefined ? null : below.top + scrollY,
        ];
      },
    ),
  );
  expect(boxes.length, 'reserved blocks').toBeGreaterThan(0);
  return Object.fromEntries(
    boxes.map(([name, height, below]) => {
      expect(below, `the element below the ${name} block`).not.toBeNull();
      return [name, [height, below ?? Number.NaN]];
    }),
  );
};

/** The layout shifts the init script collects: the observer reports them, the timeline does not. */
type ShiftWindow = Window & { layoutShifts?: number[] };

/**
 * Collects, from the start of each load, the value of every layout shift. The test makes no input,
 * so none is excluded: Chromium flags the shifts of the first moments after a navigation with
 * `hadRecentInput` (a shift forced 50 ms after `load` came back flagged), so dropping the flagged
 * entries would drop the very shifts of the load this test is about.
 */
const collectShifts = (): void => {
  const target = window as ShiftWindow;
  target.layoutShifts = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as unknown as { value: number }[]) {
      target.layoutShifts?.push(entry.value);
    }
  }).observe({ type: 'layout-shift', buffered: true });
};

/** The sum of the shifts the init script collected on the current load. */
const shiftOf = async (page: Page): Promise<number> => {
  const shifts = await page.evaluate(() => (window as ShiftWindow).layoutShifts);
  expect(shifts, 'the layout-shift observer ran').toBeDefined();
  return (shifts ?? []).reduce((sum, value) => sum + value, 0);
};

for (const calculator of calculatorPages) {
  test.describe(`${calculator.path} layout (calculator-page › Layout stability, ${calculator.locale})`, () => {
    // spec: calculator-page › [CP44], site-quality › [SQ19] the load shifts nothing, with and without a state
    for (const query of ['', calculator.spec.restored?.query ?? typedQuery(calculator.spec)]) {
      test(`shifts the layout by at most 0.01 on load at every width${query === '' ? '' : ' with a state in the link'}`, async ({
        page,
      }) => {
        // 18 loads, each waiting for the network to idle (500 ms) and 250 ms more: about 15 s
        // locally, so the default 30 s leaves no margin on a slower runner; slow() gives 90 s.
        test.slow();
        await page.addInitScript(collectShifts);
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
      await withPages(browser, [true], async ([page]) => {
        if (page === undefined) throw new Error('no page');
        const measured = new Map<number, [string, Probes, BeforeEdges][]>();
        for (const calculator of pages) {
          await open(page, calculator);
          const sentences: string[] = ['—'];
          if (calculator.spec.answer !== undefined) {
            for (const query of calculator.spec.layoutQueries) {
              await open(page, calculator, query);
              sentences.push((await answer(page).textContent()) ?? '');
            }
          }
          const before = beforeEdgesOf(await cssOf(page));
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
              [calculator.locale, await probeBlocks(page, variants), before],
            ]);
          }
        }
        for (const [width, rows] of measured) {
          for (const block of ['answer', 'notice', 'copy'] as const) {
            const probes = rows.flatMap(([locale, probes, before]) =>
              probes[block] === undefined
                ? []
                : [{ locale, before: before[block], ...probes[block] }],
            );
            const expected = pages.filter(
              ({ spec }) => block !== 'answer' || spec.answer !== undefined,
            ).length;
            expect(probes, `${block} probes at ${String(width)} px`).toHaveLength(expected);
            const tallest = Math.max(...probes.map(({ natural }) => natural));
            for (const { locale, before, reserved, line, natural } of probes) {
              const label = `${block} ${locale} at ${String(width)} px`;
              // soft: one run reports every width and block that misses, not the first one
              expect.soft(natural, `${label}: content fits`).toBeLessThanOrEqual(reserved + 0.05);
              expect
                .soft(reserved - tallest, `${label}: unused reserve`)
                .toBeLessThan(before.has(width) ? 2 * line : line);
            }
          }
        }
      });
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
          await withPages(browser, [true, false], async ([mounted, plain]) => {
            if (mounted === undefined || plain === undefined) throw new Error('no page');
            await open(mounted, calculator, query);
            await plain.goto(calculator.path);
            for (const width of WIDTHS) {
              await mounted.setViewportSize({ width, height: 900 });
              await plain.setViewportSize({ width, height: 900 });
              expect(await boxesOf(mounted), `${calculator.locale} at ${String(width)} px`).toEqual(
                await boxesOf(plain),
              );
            }
          });
        }
      });
    }
  });
}
