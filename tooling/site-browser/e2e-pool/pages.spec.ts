import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { formatViolations } from '../e2e/axe-report.ts';
import { PAGES } from './pages.ts';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const { path, lang } of PAGES) {
  test.describe(path, () => {
    test('serves the page in its language with one heading and no console error', async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(errors).toEqual([]);
    });

    test('fits a phone with no horizontal scroll', async ({ page }) => {
      await page.goto(path);
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(width).toBeLessThanOrEqual(390);
    });

    test('has no WCAG A or AA violation', async ({ page }) => {
      await page.goto(path);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations, formatViolations(path, violations)).toEqual([]);
    });

    // The loader runs on poolfigures.com only, so the browser tests send nothing to Google.
    // One load per page and its own test: a loop over every page in one test outgrows the timeout.
    test('carries the analytics loader, with the measurement id and the host', async ({ page }) => {
      await page.goto(path);
      const loader = page.locator('script[src="/analytics.js"]');
      await expect(loader).toHaveAttribute('data-ga', 'G-VE973PXMS4');
      await expect(loader).toHaveAttribute('data-host', 'poolfigures.com');
    });

    test('is open to search engines, with its canonical URL', async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `https://poolfigures.com${path}`,
      );
    });
  });
}

// The volume, dose, pH, calcium, heater and fill time calculators link the job pages they work out
// ("Common pool sizes").
for (const calculator of [
  '/pool-volume-calculator',
  '/pool-salt-calculator',
  '/pool-chlorine-calculator',
  '/pool-ph-calculator',
  '/pool-alkalinity-calculator',
  '/pool-stabilizer-calculator',
  '/pool-heater-size-calculator',
  '/pool-fill-time-calculator',
  '/pool-calcium-hardness-calculator',
]) {
  test(`links the job pages of ${calculator}, each one answering with no WCAG violation`, async ({
    page,
  }) => {
    await page.goto(calculator);
    const links = await page.locator('.pool-jobs .link-list a').evaluateAll((anchors) =>
      anchors.map((anchor) => ({
        href: anchor.getAttribute('href') ?? '',
        text: anchor.textContent.trim(),
      })),
    );
    expect(links.length).toBeGreaterThan(1);
    for (const { href, text } of links) {
      const response = await page.goto(href);
      expect(response?.status(), href).toBe(200);
      await expect(page.locator('h1')).toHaveText(text);
      // and each job page links its nearest sizes, every one of them a job page of this calculator
      const near = await page
        .locator('.pool-jobs .link-list a')
        .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''));
      expect(near.length, href).toBeGreaterThan(0);
      for (const neighbor of near) expect(links.map((link) => link.href)).toContain(neighbor);
      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      expect(violations, formatViolations(href, violations)).toEqual([]);
    }
  });
}

test('answers an unknown path with the 404 page, which links both homes', async ({ page }) => {
  const response = await page.goto('/no-such-page');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('main a[href="/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/es"]')).toHaveCount(1);
});

// the pages that have their Spanish twin: the switch in the header and the hreflang pair agree
for (const [english, spanish] of [
  ['/', '/es'],
  ['/about', '/es/acerca'],
  ['/privacy', '/es/privacidad'],
  ['/embed-calculators', '/es/calculadoras-para-tu-sitio'],
] as const) {
  test(`switches between ${english} and ${spanish}, each naming the other`, async ({ page }) => {
    await page.goto(english);
    await page.locator('header a[hreflang="es"]').click();
    await expect(page).toHaveURL(new RegExp(`${spanish}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.locator('link[rel="alternate"][hreflang="es-US"]')).toHaveAttribute(
      'href',
      `https://poolfigures.com${spanish}`,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      `https://poolfigures.com${english}`,
    );
    await page.locator('header a[hreflang="en"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://poolfigures.com${english}`,
    );
  });
}

// a page with no twin yet carries no alternate and no switch
test('gives a page with no Spanish twin no alternate and no switch', async ({ page }) => {
  await page.goto('/how-much-salt-for-a-15000-gallon-pool');
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  await expect(page.locator('header a[hreflang]')).toHaveCount(0);
});

test('links every calculator from the home and the header to a page that answers', async ({
  page,
}) => {
  await page.goto('/');
  // the header keeps the first four calculators and a link to every card of the home
  for (const [selector, count] of [
    ['[aria-labelledby="pool-tools"] .pool-tools a', 10],
    ['header nav a', 5],
  ] as const) {
    const hrefs = await page
      .locator(selector)
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    expect(hrefs, selector).toHaveLength(count);
    for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
  }
  await expect(page.locator('header nav a').last()).toHaveAttribute('href', '/#pool-tools');
});

test('links the methodology from the footer, and it shows the worked examples', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('footer a[href="/methodology"]').click();
  await expect(page).toHaveURL(/\/methodology$/);
  await expect(page.locator('.pool-method li strong')).toHaveCount(23);
  await expect(page.locator('.pool-method li strong').first()).toHaveText('22,023 gallons');
});

test('shows the same worked examples on the Spanish methodology, linked from its footer', async ({
  page,
}) => {
  await page.goto('/es');
  await page.locator('footer a[href="/es/metodologia"]').click();
  await expect(page).toHaveURL(/\/es\/metodologia$/);
  await expect(page.locator('.pool-method li strong')).toHaveCount(23);
  await expect(page.locator('.pool-method li strong').first()).toHaveText('22,023 galones');
});

test('links the privacy page from the footer, and it describes Google Analytics', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('footer a[href="/privacy"]').click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.locator('#analytics')).toHaveText('Analytics and cookies');
});

test('sends the security headers with every page', async ({ request }) => {
  for (const { path } of PAGES) {
    const response = await request.get(path);
    expect(response.headers()['content-security-policy'], path).toContain("script-src 'self'");
    expect(response.headers()['x-content-type-options'], path).toBe('nosniff');
  }
});

// The job pages are built from their table, so the home's list of them is the reference.
test('serves a sitemap with every page and job page, and robots that point to it', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const jobs = await page
    .locator('[aria-labelledby="pool-jobs"] a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(jobs.length).toBeGreaterThan(0);
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml.match(/<loc>/g)).toHaveLength(PAGES.length + jobs.length);
  for (const path of [...PAGES.map(({ path: at }) => at), ...jobs])
    expect(xml, path).toContain(`<loc>https://poolfigures.com${path}</loc>`);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Sitemap: https://poolfigures.com/sitemap.xml');
});

test('leads from the home to the spring guide, whose calculator links all answer', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.pool-band a').click();
  await expect(page).toHaveURL(/\/opening-your-pool$/);
  await expect(page.locator('.pool-steps > li')).toHaveCount(12);
  const hrefs = await page
    .locator('.pool-steps a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toHaveLength(6);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('lists every guide on the home, each one answering', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('[aria-labelledby="pool-guides"] a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toEqual([
    '/opening-your-pool',
    '/closing-your-pool',
    '/pool-water-chemistry-chart',
    '/pool-chemical-dosing-chart',
    '/pool-volume-chart',
    '/how-many-gallons-is-my-pool',
    '/how-many-gallons-in-an-olympic-pool',
    '/how-long-to-run-pool-pump',
    '/salt-water-pool-vs-chlorine-pool',
    '/how-much-salt-for-a-pool',
    '/how-to-shock-a-pool',
    '/how-often-to-shock-a-pool',
    '/how-to-fix-a-green-pool',
    '/why-is-my-pool-cloudy',
    '/how-to-lower-ph-in-a-pool',
    '/how-to-raise-calcium-hardness-in-a-pool',
    '/how-long-after-adding-chemicals-can-you-swim',
  ]);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('tables when to swim after nine chemicals, each with its section, and every link answers', async ({
  page,
}) => {
  await page.goto('/how-long-after-adding-chemicals-can-you-swim');
  await expect(page.locator('.pool-chart tbody tr')).toHaveCount(9);
  await expect(page.locator('.pool-level')).toHaveCount(9);
  await expect(page.locator('.pool-chart tbody tr').first()).toContainText('4 ppm or less');
  const hrefs = await page
    .locator('main a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  // the editorial policy of the byline, the two charts, each chemical's calculator and, for five
  // of them, its guide, then the data index
  expect(hrefs).toHaveLength(18);
  for (const href of new Set(hrefs))
    expect((await page.request.get(href)).status(), href).toBe(200);
});

test('lists the four data pages, each dated and sourced, and gives the press address', async ({
  page,
}) => {
  await page.goto('/charts');
  const hrefs = await page
    .locator('.pool-data h2 a')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toEqual([
    '/pool-chemical-dosing-chart',
    '/pool-volume-chart',
    '/pool-water-chemistry-chart',
    '/how-long-after-adding-chemicals-can-you-swim',
  ]);
  await expect(page.locator('.pool-data time')).toHaveCount(4);
  await expect(page.locator('a[href="mailto:press@maestrocalc.com"]')).toBeVisible();
  for (const href of hrefs) {
    expect((await page.request.get(href)).status(), href).toBe(200);
    await page.goto(href);
    await expect(page.locator('main a[href="/charts"]'), href).toHaveCount(1);
  }
});

test('numbers the winter steps, whose calculator links all answer', async ({ page }) => {
  await page.goto('/closing-your-pool');
  await expect(page.locator('.pool-steps > li')).toHaveCount(9);
  const hrefs = await page
    .locator('.pool-steps a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toHaveLength(3);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('charts six levels, each with its section, and every calculator link answers', async ({
  page,
}) => {
  await page.goto('/pool-water-chemistry-chart');
  await expect(page.locator('.pool-chart tbody tr')).toHaveCount(6);
  await expect(page.locator('.pool-level')).toHaveCount(6);
  const hrefs = await page
    .locator('main a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  // the editorial policy of the byline, the gallons, the dosing chart, chlorine, pH, alkalinity,
  // stabilizer, calcium, salt, the data index
  expect(hrefs).toHaveLength(10);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('charts the doses of eight pool sizes in three tables, each one cited', async ({ page }) => {
  await page.goto('/pool-chemical-dosing-chart');
  await expect(page.locator('.pool-chart')).toHaveCount(3);
  await expect(page.locator('.pool-chart tbody tr')).toHaveCount(24);
  // 10,000 gallons: 10.24 fl oz of 12.5% liquid chlorine per ppm (10,000 x 3.785 L x 1 mg / 0.125)
  await expect(page.locator('.pool-chart').first().locator('tbody tr').nth(1)).toContainText(
    '10.2',
  );
  await expect(page.locator('.pool-cite a')).toHaveAttribute(
    'href',
    'https://poolfigures.com/pool-chemical-dosing-chart',
  );
  const hrefs = await page
    .locator('main a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('charts the gallons of 23 pool sizes in three tables, each one cited', async ({ page }) => {
  await page.goto('/pool-volume-chart');
  await expect(page.locator('.pool-chart')).toHaveCount(3);
  await expect(page.locator('.pool-chart tbody tr')).toHaveCount(23);
  // 24 ft round, 4 ft deep: pi x 24^2 / 4 x 4 ft = 1,809.6 cubic feet, x 1,728 / 231 = 13,536 gallons
  await expect(page.locator('.pool-chart').first().locator('tbody tr').nth(4)).toContainText(
    '13,536',
  );
  await expect(page.locator('.pool-cite a')).toHaveAttribute(
    'href',
    'https://poolfigures.com/pool-volume-chart',
  );
  const hrefs = await page
    .locator('main a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  for (const href of new Set(hrefs))
    expect((await page.request.get(href)).status(), href).toBe(200);
});

test('serves llms.txt with the site, its calculators and its guides', async ({ request }) => {
  const response = await request.get('/llms.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');
  const text = await response.text();
  expect(text.startsWith('# Pool Figures\n')).toBe(true);
  expect(text).toContain('(https://poolfigures.com/pool-chemical-dosing-chart)');
});

test('numbers the pump run time steps, whose calculator links all answer', async ({ page }) => {
  await page.goto('/how-long-to-run-pool-pump');
  await expect(page.locator('.pool-steps > li')).toHaveCount(9);
  const hrefs = await page
    .locator('.pool-steps a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toEqual([
    '/pool-volume-calculator',
    '/pool-pump-size-calculator',
    '/pool-heater-size-calculator',
  ]);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('numbers the salt water vs chlorine steps, whose links all answer', async ({ page }) => {
  await page.goto('/salt-water-pool-vs-chlorine-pool');
  await expect(page.locator('.pool-steps > li')).toHaveCount(12);
  const hrefs = await page
    .locator('.pool-steps a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toEqual([
    '/pool-water-chemistry-chart',
    '/pool-volume-calculator',
    '/pool-chlorine-calculator',
    '/pool-salt-calculator',
  ]);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('numbers the pool shock steps, whose links all answer', async ({ page }) => {
  await page.goto('/how-to-shock-a-pool');
  await expect(page.locator('.pool-steps > li')).toHaveCount(10);
  const hrefs = await page
    .locator('.pool-steps a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toEqual([
    '/pool-volume-calculator',
    '/pool-ph-calculator',
    '/pool-water-chemistry-chart',
    '/pool-chlorine-calculator',
  ]);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('numbers the pool pH steps, whose links all answer', async ({ page }) => {
  await page.goto('/how-to-lower-ph-in-a-pool');
  await expect(page.locator('.pool-steps > li')).toHaveCount(10);
  const hrefs = await page
    .locator('.pool-steps a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toEqual([
    '/pool-volume-calculator',
    '/pool-water-chemistry-chart',
    '/pool-alkalinity-calculator',
    '/pool-ph-calculator',
    '/pool-ph-calculator',
  ]);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('numbers the calcium hardness steps, whose links all answer', async ({ page }) => {
  await page.goto('/how-to-raise-calcium-hardness-in-a-pool');
  await expect(page.locator('.pool-steps > li')).toHaveCount(9);
  const hrefs = await page
    .locator('.pool-steps a[href^="/"]')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs).toEqual([
    '/pool-volume-calculator',
    '/pool-water-chemistry-chart',
    '/pool-calcium-hardness-calculator',
    '/pool-calcium-hardness-calculator',
    '/pool-fill-time-calculator',
    '/pool-water-chemistry-chart',
  ]);
  for (const href of hrefs) expect((await page.request.get(href)).status(), href).toBe(200);
});
