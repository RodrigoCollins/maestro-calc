import { describe, expect, it } from 'vitest';
import { budgetProblems, budgetSummary, CALCULATOR_LIMITS, LIMITS } from './budgets.ts';
import type { Sizes } from './budgets.ts';
import { pagesOf } from './files.ts';
import {
  CALC_ROUTES,
  calculatorSite,
  CHUNK_FILE,
  ENTRY_FILE,
  FIXTURE_ROUTES,
  fixtureSite,
  VALID_CSS,
  validDist,
} from './__testing__/page-fixture.ts';

const FONTS = ['a', 'b', 'c', 'd'].map((name) => `_astro/fonts/${name}.woff2`);
const INLINE_CSS = new TextEncoder().encode(VALID_CSS).length;

/** A valid dist, its byte sizes (text files by length, each font 20,000 B) and the parsed pages. */
const build = (
  edit: (dist: Map<string, string>, sizes: Map<string, number>) => void = () => undefined,
) => {
  const dist = validDist(fixtureSite());
  const sizes = new Map<string, number>(
    [...dist].map(([file, text]) => [file, new TextEncoder().encode(text).length]),
  );
  for (const font of FONTS) sizes.set(font, 20_000);
  edit(dist, sizes);
  const site = fixtureSite();
  return { pages: pagesOf(dist, FIXTURE_ROUTES), sizes: sizes as Sizes, dist, site };
};

const problemsAfter = (edit?: Parameters<typeof build>[0]) => {
  return budgetProblems(build(edit));
};

const withLinkedCss =
  (file: string, bytes: number) => (dist: Map<string, string>, sizes: Map<string, number>) => {
    dist.set(
      'about.html',
      (dist.get('about.html') ?? '').replace(
        '</head>',
        `<link rel="stylesheet" href="/${file}"></head>`,
      ),
    );
    sizes.set(file, bytes);
  };

describe('byte budgets over a valid dist (site-quality › [SQ6])', () => {
  it('has none, and the limits are the design values', () => {
    expect(problemsAfter()).toEqual([]);
    expect(LIMITS).toEqual({
      html: 49_152,
      css: 20_480,
      font: 30_720,
      fonts: 92_160,
      js: 0,
      weight: 172_032,
    });
  });
});

describe('HTML budget (site-quality › [SQ7])', () => {
  it('passes a page of 49,152 bytes', () => {
    expect(problemsAfter((_dist, sizes) => sizes.set('about.html', 49_152))).toEqual([]);
  });

  it('fails a page of 49,153 bytes, naming the file and the limit', () => {
    expect(problemsAfter((_dist, sizes) => sizes.set('about.html', 49_153))).toEqual([
      {
        file: 'about.html',
        rule: 'html-budget',
        message: '49,153 B exceeds the limit of 49,152 B',
      },
    ]);
  });
});

describe('CSS budget, inline plus linked (site-quality › [SQ6])', () => {
  it('passes 20,480 bytes in total', () => {
    expect(problemsAfter(withLinkedCss('_astro/a.css', 20_480 - INLINE_CSS))).toEqual([]);
  });

  it('fails 20,481 bytes in total, naming the page and the limit', () => {
    expect(problemsAfter(withLinkedCss('_astro/a.css', 20_481 - INLINE_CSS))).toEqual([
      {
        file: 'about.html',
        rule: 'css-budget',
        message: '20,481 B of CSS exceeds the limit of 20,480 B',
      },
    ]);
  });

  // The inline style is measured in bytes, not characters: 'é' is two bytes in UTF-8.
  const withInlineAccents = (count: number) => (dist: Map<string, string>) => {
    const html = dist.get('about.html') ?? '';
    dist.set(
      'about.html',
      html.replace(/<style>.*?<\/style>/s, `<style>/*${'é'.repeat(count)}*/</style>`),
    );
  };

  it('counts the bytes of non-ASCII inline CSS: 20,480 bytes pass', () => {
    // 10,238 accents are 20,476 bytes plus the four bytes of `/**/`
    expect(problemsAfter(withInlineAccents(10_238))).toEqual([]);
  });

  it('fails non-ASCII inline CSS whose bytes, not whose characters, pass the limit', () => {
    // 10,239 accents are 10,243 characters but 20,482 bytes
    expect(problemsAfter(withInlineAccents(10_239))).toEqual([
      {
        file: 'about.html',
        rule: 'css-budget',
        message: '20,482 B of CSS exceeds the limit of 20,480 B',
      },
    ]);
  });

  it('counts a stylesheet that is not in the build as empty (another rule names it)', () => {
    expect(
      problemsAfter((dist) => {
        dist.set(
          'about.html',
          (dist.get('about.html') ?? '').replace(
            '</head>',
            '<link rel="stylesheet" href="/_astro/missing.css"><link rel="stylesheet" href="https://cdn.example.com/x.css"></head>',
          ),
        );
      }),
    ).toEqual([]);
  });
});

describe('font budgets (site-shell › [SS8])', () => {
  it('passes a font of 30,720 bytes', () => {
    expect(problemsAfter((_dist, sizes) => sizes.set(FONTS[0] ?? '', 30_720))).toEqual([]);
  });

  it('fails a font of 30,721 bytes, naming the file and the limit', () => {
    expect(problemsAfter((_dist, sizes) => sizes.set(FONTS[0] ?? '', 30_721))).toEqual([
      { file: FONTS[0], rule: 'font-budget', message: '30,721 B exceeds the limit of 30,720 B' },
    ]);
  });

  it('passes four fonts that together are 92,160 bytes', () => {
    expect(
      problemsAfter((_dist, sizes) => {
        for (const font of FONTS) sizes.set(font, 23_040);
      }),
    ).toEqual([]);
  });

  it('fails four fonts of 23,041 bytes, naming the total and the limit', () => {
    expect(
      problemsAfter((_dist, sizes) => {
        for (const font of FONTS) sizes.set(font, 23_041);
      }),
    ).toEqual([
      {
        file: '(dist)',
        rule: 'fonts-budget',
        message: '92,164 B of fonts exceeds the limit of 92,160 B',
      },
    ]);
  });
});

describe('JavaScript budget (site-quality › [SQ8])', () => {
  it.each([
    ['a script element', '<script src="/_astro/x.js"></script>'],
    ['a module preload', '<link rel="modulepreload" href="/_astro/x.js">'],
  ])('fails a page that references %s, naming the file', (_name, markup) => {
    expect(
      problemsAfter((dist, sizes) => {
        dist.set(
          'index.html',
          (dist.get('index.html') ?? '').replace('</head>', `${markup}</head>`),
        );
        sizes.set('_astro/x.js', 1);
      }),
    ).toEqual([
      {
        file: 'index.html',
        rule: 'js-budget',
        message: '/_astro/x.js (1 B) is JavaScript, and the budget is 0 B',
      },
    ]);
  });

  it('counts a referenced script that has no size as zero bytes and still names it', () => {
    const problems = problemsAfter((dist) => {
      dist.set(
        'index.html',
        (dist.get('index.html') ?? '').replace(
          '</head>',
          '<script src="/_astro/y.js"></script></head>',
        ),
      );
    });
    expect(problems.map(({ rule }) => rule)).toEqual(['js-budget']);
  });
});

// The inline CSS is part of the HTML bytes, so only the linked CSS adds to the weight: the favicon
// must make up the rest of 172,032 (153,600 from the other limits, minus the inline CSS).
describe('page weight (site-quality › [SQ6])', () => {
  const atLimit = (favicon: number) => (dist: Map<string, string>, sizes: Map<string, number>) => {
    sizes.set('about.html', LIMITS.html);
    withLinkedCss('_astro/a.css', LIMITS.css - INLINE_CSS)(dist, sizes);
    for (const font of FONTS) sizes.set(font, LIMITS.fonts / 4);
    sizes.set('favicon.svg', favicon);
  };

  it('passes 172,032 bytes: HTML, linked CSS, referenced fonts and the favicon', () => {
    expect(problemsAfter(atLimit(10_240 + INLINE_CSS))).toEqual([]);
  });

  it('fails 172,033 bytes, naming the page and the limit', () => {
    expect(problemsAfter(atLimit(10_241 + INLINE_CSS))).toEqual([
      {
        file: 'about.html',
        rule: 'weight-budget',
        message: '172,033 B exceeds the limit of 172,032 B',
      },
    ]);
  });
});

// A font that only a preload names is still downloaded, so its bytes are part of the weight.
describe('page weight of a preloaded font that no CSS names (site-quality › [SQ6])', () => {
  const PRELOADED = '_astro/fonts/e.woff2';
  const withPreload =
    (favicon: number) => (dist: Map<string, string>, sizes: Map<string, number>) => {
      sizes.set('about.html', LIMITS.html);
      withLinkedCss('_astro/a.css', LIMITS.css - INLINE_CSS)(dist, sizes);
      dist.set(
        'about.html',
        (dist.get('about.html') ?? '').replace(
          '</head>',
          `<link rel="preload" as="font" type="font/woff2" href="/${PRELOADED}"></head>`,
        ),
      );
      for (const font of FONTS) sizes.set(font, 10_000);
      sizes.set(PRELOADED, 30_000);
      sizes.set('favicon.svg', favicon);
    };

  it('passes 172,032 bytes when the preloaded font is counted', () => {
    expect(problemsAfter(withPreload(32_400 + INLINE_CSS))).toEqual([]);
  });

  it('fails 172,033 bytes, which only the preloaded font can bring over the limit', () => {
    expect(problemsAfter(withPreload(32_401 + INLINE_CSS))).toEqual([
      {
        file: 'about.html',
        rule: 'weight-budget',
        message: '172,033 B exceeds the limit of 172,032 B',
      },
    ]);
  });
});

describe('budget summary (site-quality › [SQ6])', () => {
  it('prints the largest page and its size per category', () => {
    const context = build((_dist, mutable) => {
      mutable.set('about.html', 12_345);
      mutable.set(FONTS[1] ?? '', 23_040);
    });
    expect(budgetSummary(context)).toEqual([
      'budget html: largest /about.html 12,345 B (limit 49,152)',
      `budget css: largest /index.html ${INLINE_CSS.toLocaleString('en-US')} B (limit 20,480)`,
      'budget font: largest /_astro/fonts/b.woff2 23,040 B (limit 30,720)',
      'budget fonts: total 83,040 B in 4 files (limit 92,160)',
      'budget js: 0 B referenced (limit 0)',
      expect.stringMatching(/^budget weight: largest \/about\.html [\d,]+ B \(limit 172,032\)$/),
    ]);
  });

  it('adds up the referenced JavaScript, which has no budget', () => {
    const context = build((mutable, bytes) => {
      mutable.set(
        'index.html',
        (mutable.get('index.html') ?? '').replace(
          '</head>',
          '<script src="/_astro/x.js"></script></head>',
        ),
      );
      bytes.set('_astro/x.js', 1_234);
    });
    expect(budgetSummary(context)[4]).toBe('budget js: 1,234 B referenced (limit 0)');
  });
});

// ---- the calculator template: the JavaScript of the page is the entry and its static graph ----

const PAGE = 'concrete-calculator.html';

/** A valid dist with a calculator page: text sizes by length, fonts of 20,000 B, JS sizes given. */
const calcBuild = (
  entry: number,
  chunk: number,
  edit: (dist: Map<string, string>, sizes: Map<string, number>) => void = () => undefined,
) => {
  const site = calculatorSite();
  const dist = validDist(site);
  const sizes = new Map<string, number>(
    [...dist].map(([file, text]) => [file, new TextEncoder().encode(text).length]),
  );
  for (const font of FONTS) sizes.set(font, 20_000);
  sizes.set(ENTRY_FILE, entry);
  sizes.set(CHUNK_FILE, chunk);
  edit(dist, sizes);
  return { pages: pagesOf(dist, CALC_ROUTES), sizes: sizes as Sizes, dist, site };
};

const calcProblems = (...args: Parameters<typeof calcBuild>) => {
  return budgetProblems(calcBuild(...args));
};

describe('calculator JavaScript budget (site-quality › [SQ22], [SQ23])', () => {
  it('has the calculator limits of the design: 49,152 B of JavaScript, 204,800 B of weight', () => {
    expect(CALCULATOR_LIMITS).toEqual({ js: 49_152, weight: 204_800 });
  });

  it('passes a page whose entry and import add up to 49,152 bytes', () => {
    expect(calcProblems(30_000, 19_152)).toEqual([]);
    expect(calcProblems(49_152, 0)).toEqual([]);
  });

  // spec: site-quality › [SQ22] 49,153 fails, naming the page, the file and the limit
  it.each([
    ['the entry alone', 49_153, 0],
    ['the entry and its import', 30_000, 19_153],
  ])(
    'fails %s at 49,153 bytes, once per page, naming the entry and the limit',
    (_name, entry, chunk) => {
      const found = calcProblems(entry, chunk);
      expect(found.map((entry_) => entry_.file)).toEqual([PAGE, 'es/calculadora-de-concreto.html']);
      expect(found[0]).toEqual({
        file: PAGE,
        rule: 'js-budget',
        message: `/${ENTRY_FILE} and its imports weigh 49,153 B, and the budget is 49,152 B`,
      });
    },
  );

  // spec: site-quality › [SQ23] the static imports are counted
  it('counts an import of 20,000 bytes next to an entry of 30,000', () => {
    expect(calcProblems(30_000, 20_000).map((entry) => entry.rule)).toEqual([
      'js-budget',
      'js-budget',
    ]);
  });

  it('counts a module preload target once, and a file both preloaded and imported once', () => {
    const preload = (dist: Map<string, string>) =>
      dist.set(
        PAGE,
        (dist.get(PAGE) ?? '').replace(
          '</head>',
          `<link rel="modulepreload" href="/${CHUNK_FILE}"></head>`,
        ),
      );
    expect(calcProblems(30_000, 19_152, preload)).toEqual([]);
    expect(calcProblems(30_000, 19_153, preload)).toHaveLength(2);
    const extra = (dist: Map<string, string>, sizes: Map<string, number>) => {
      dist.set(
        PAGE,
        (dist.get(PAGE) ?? '').replace(
          '</head>',
          '<link rel="modulepreload" href="/_astro/extra.js"></head>',
        ),
      );
      sizes.set('_astro/extra.js', 10_000);
    };
    expect(calcProblems(30_000, 9_152, extra)).toEqual([]);
    expect(calcProblems(30_000, 9_153, extra)).toHaveLength(1);
  });

  it('counts a missing file as empty, since the file-set rules name it', () => {
    expect(
      calcProblems(10, 10, (dist) => {
        dist.set(ENTRY_FILE, 'import"./chunks/gone.js";');
      }),
    ).toEqual([]);
  });

  it('still allows no JavaScript on a static page of the same site', () => {
    const found = calcProblems(10, 10, (dist, sizes) => {
      dist.set(
        'privacy.html',
        (dist.get('privacy.html') ?? '').replace(
          '</head>',
          '<script src="/_astro/x.js"></script></head>',
        ),
      );
      sizes.set('_astro/x.js', 1);
    });
    expect(found).toEqual([
      {
        file: 'privacy.html',
        rule: 'js-budget',
        message: '/_astro/x.js (1 B) is JavaScript, and the budget is 0 B',
      },
    ]);
  });
});

// spec: site-quality › [SQ24] each template has its own weight ceiling, the JavaScript included
describe('page weight per template (site-quality › [SQ24])', () => {
  const JS = 20_000;
  const atLimit = (favicon: number) => (dist: Map<string, string>, sizes: Map<string, number>) => {
    sizes.set(PAGE, LIMITS.html);
    dist.set(
      PAGE,
      (dist.get(PAGE) ?? '').replace(
        '</head>',
        '<link rel="stylesheet" href="/_astro/a.css"></head>',
      ),
    );
    sizes.set('_astro/a.css', LIMITS.css - INLINE_CSS);
    for (const font of FONTS) sizes.set(font, LIMITS.fonts / 4);
    sizes.set('favicon.svg', favicon);
  };
  // 204,800 = html + linked CSS + fonts + the 20,000 B of JavaScript + the favicon
  const FAVICON =
    CALCULATOR_LIMITS.weight - LIMITS.html - (LIMITS.css - INLINE_CSS) - LIMITS.fonts - JS;

  it('passes a calculator page of 204,800 bytes, JavaScript included', () => {
    expect(calcProblems(JS / 2, JS / 2, atLimit(FAVICON))).toEqual([]);
  });

  it('fails a calculator page of 204,801 bytes with its own limit, not the trust limit', () => {
    expect(calcProblems(JS / 2, JS / 2, atLimit(FAVICON + 1))).toEqual([
      { file: PAGE, rule: 'weight-budget', message: '204,801 B exceeds the limit of 204,800 B' },
    ]);
  });

  it('fails a trust page of 172,033 bytes with the trust limit, in the same site', () => {
    const found = calcProblems(10, 10, (dist, sizes) => {
      sizes.set('privacy.html', LIMITS.html);
      dist.set(
        'privacy.html',
        (dist.get('privacy.html') ?? '').replace(
          '</head>',
          '<link rel="stylesheet" href="/_astro/p.css"></head>',
        ),
      );
      sizes.set('_astro/p.css', LIMITS.css - INLINE_CSS);
      for (const font of FONTS) sizes.set(font, LIMITS.fonts / 4);
      sizes.set('favicon.svg', 10_241 + INLINE_CSS);
    });
    expect(found).toEqual([
      {
        file: 'privacy.html',
        rule: 'weight-budget',
        message: '172,033 B exceeds the limit of 172,032 B',
      },
    ]);
  });
});

// spec: site-quality › [SQ6] the summary names the largest page per category, calculator JavaScript included
describe('budget summary with a calculator page (site-quality › [SQ6])', () => {
  it('adds the calculator lines and keeps the static ones for the static pages', () => {
    const lines = budgetSummary(calcBuild(28_457, 3_000));
    expect(lines.slice(0, 5)).toEqual([
      expect.stringMatching(/^budget html: largest \/.+\.html [\d,]+ B \(limit 49,152\)$/),
      expect.stringMatching(/^budget css: /),
      expect.stringMatching(/^budget font: /),
      'budget fonts: total 80,000 B in 4 files (limit 92,160)',
      'budget js: 0 B referenced (limit 0)',
    ]);
    expect(lines.at(-2)).toBe(
      'budget js (calculator): largest /concrete-calculator.html 31,457 B (limit 49,152)',
    );
    expect(lines.at(-1)).toMatch(
      /^budget weight \(calculator\): largest \/[\w/-]+\.html [\d,]+ B \(limit 204,800\)$/,
    );
    expect(lines.filter((line) => line.startsWith('budget weight:'))).toHaveLength(1);
  });
});
