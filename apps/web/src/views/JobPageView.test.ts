import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { CHART_SOURCES_ID, calculatorSourcesHref } from '../lib/byline.ts';
import { jobGuide } from '../lib/job-guide.ts';
import { jobLand, NIST_HB44_C } from '../lib/job-land.ts';
import { jobSlope, OSHA_1926_500, OSHA_1926_501 } from '../lib/job-slope.ts';
import { jobWorked } from '../lib/job-worked.ts';
import { JOBS } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import JobPageView from './JobPageView.astro';

const render = (id: keyof typeof JOBS, locale: 'en' | 'es') =>
  renderComponent(JobPageView, { id, locale }, { partial: false });

// editorial policy: a job page or chart is signed under its h1, with its day and its sources
describe('JobPageView byline (editorial policy)', () => {
  it.each(['en', 'es'] as const)(
    'signs a chart and points at its own sources in %s',
    async (locale) => {
      const document = await render('concrete-slab-chart', locale);
      const byline = document.querySelector('main h1 + .byline');
      expect(byline?.querySelectorAll('a').map((a) => a.getAttribute('href'))).toEqual([
        pathOf('editorial-policy', locale),
        `#${CHART_SOURCES_ID}`,
      ]);
      expect(document.querySelector(`main h2#${CHART_SOURCES_ID}`)).not.toBeNull();
      const times = document.querySelectorAll('main time');
      expect(times).toHaveLength(1);
      expect(times[0]?.getAttribute('datetime')).toBe(JOBS['concrete-slab-chart'].updated);
    },
  );

  it('points a job page without a chart at the sources of its calculator', async () => {
    const document = await render('concrete-slab-10x10', 'es');
    const links = document.querySelectorAll('main .byline a').map((a) => a.getAttribute('href'));
    expect(links).toEqual([
      pathOf('editorial-policy', 'es'),
      calculatorSourcesHref(JOBS['concrete-slab-10x10'].calculator, 'es'),
    ]);
    expect(document.querySelectorAll('main time')).toHaveLength(1);
  });
});

// AdSense audit 2026-11-08: a job page also says how to measure and buy for the job
describe('JobPageView buying advice', () => {
  it.each(['en', 'es'] as const)(
    'lists the tips and links the guide by its h1 in %s',
    async (locale) => {
      const document = await render('concrete-tube-10', locale);
      const guide = jobGuide('concrete-tube-10', locale);
      const heading = document
        .querySelectorAll('main h2')
        .find((h2) => h2.textContent === guide?.heading);
      const list = heading?.nextElementSibling;
      expect(list?.querySelectorAll('li').map((li) => li.textContent)).toEqual(guide?.tips);
      const link = list?.nextElementSibling?.querySelector('a');
      expect(link?.getAttribute('href')).toBe(pathOf('guide-fence-post-concrete', locale));
      expect(link?.textContent).toMatch(/\S/);
    },
  );

  it('tables the IRC check of every covering on a roof pitch page, and on no other', async () => {
    const pitch = await render('roof-pitch-3-12', 'en');
    const rows = pitch.querySelectorAll('main table').at(1)?.querySelectorAll('tbody tr') ?? [];
    expect(rows.map((row) => row.textContent)).toContain('Slate4 in 12Below the minimum');
    const slab = await render('concrete-slab-10x10', 'en');
    expect(slab.querySelectorAll('main table')).toHaveLength(1);
  });

  it('works the first size out step by step under its own heading', async () => {
    const document = await render('paint-room-10x12', 'es');
    const worked = jobWorked('paint-room-10x12', 'es');
    const heading = document
      .querySelectorAll('main h2')
      .find((h2) => h2.textContent === worked?.heading);
    const steps = heading?.nextElementSibling?.querySelectorAll('li');
    expect(steps?.map((li) => li.textContent.replace(/\s+/g, ' ').trim())).toEqual(
      worked?.steps.map(({ label, math }) => `${label}: ${math}`),
    );
  });
});

// Ahrefs US 2026-11-08: "how many square feet in an acre" is answered by law, by shape and by use
describe('JobPageView acre pages', () => {
  it.each(['en', 'es'] as const)(
    'says what an acre is with its source, its shapes, a glance and the cover in %s',
    async (locale) => {
      const document = await render('square-feet-in-a-quarter-acre', locale);
      const land = jobLand('square-feet-in-a-quarter-acre', locale);
      const headings = document.querySelectorAll('main h2').map((h2) => h2.textContent);
      for (const heading of [
        land?.heading,
        land?.shape.heading,
        land?.glance.heading,
        land?.cover.heading,
      ]) {
        expect(headings).toContain(heading);
      }
      const text = document.querySelector('main')?.textContent ?? '';
      for (const paragraph of land?.shape.paragraphs ?? []) expect(text).toContain(paragraph);
      expect(text).toContain(land?.definition);
      expect(text).toContain(land?.surveyFoot);
      // nothing but a calculator page leaves the site (check:site): the source is cited, not linked
      expect(document.querySelector('main code')?.textContent).toBe(NIST_HB44_C.url);
      expect(
        document.querySelector(`main a[href="${pathOf('square-feet-12x12', locale)}"]`),
      ).not.toBeNull();
      // the lot table, then the cover table
      expect(document.querySelectorAll('main table')).toHaveLength(2);
      expect(document.querySelector('main h1')?.textContent).toBe(
        locale === 'en'
          ? 'A quarter acre is 10,890 square feet'
          : 'Un cuarto de acre tiene 10,890 pies cuadrados',
      );
    },
  );

  it('adds no acre section to a room', async () => {
    const document = await render('square-feet-12x12', 'en');
    expect(document.querySelectorAll('main table')).toHaveLength(1);
    expect(document.querySelector('main')?.textContent).not.toContain(NIST_HB44_C.url);
  });
});

// Ahrefs US 2026-11-08: "6/12 roof pitch" and "roof pitch multiplier" are answered by the OSHA
// class of the pitch, the ridge of a gable and the roof over a footprint
describe('JobPageView exact pitch pages', () => {
  it.each(['en', 'es'] as const)(
    'says how OSHA classes the pitch with its sources, the ridge and the roof surface in %s',
    async (locale) => {
      const document = await render('roof-pitch-6-12', locale);
      const slope = jobSlope('roof-pitch-6-12', locale);
      const headings = document.querySelectorAll('main h2').map((h2) => h2.textContent);
      for (const heading of [slope?.heading, slope?.ridge.heading, slope?.area.heading]) {
        expect(headings).toContain(heading);
      }
      const text = document.querySelector('main')?.textContent ?? '';
      expect(text).toContain(slope?.osha);
      expect(text).toContain(slope?.note);
      for (const { value } of slope?.ridge.facts ?? []) expect(text).toContain(value);
      // nothing but a calculator page leaves the site (check:site): the sources are cited, not linked
      const cited = document.querySelectorAll('main code').map((code) => code.textContent);
      expect(cited).toEqual([OSHA_1926_500.url, OSHA_1926_501.url]);
      expect(document.querySelector(`main a[href="${pathOf('roofing', locale)}"]`)).not.toBeNull();
      // the rafter table, the coverings table, then the roof surface table
      expect(document.querySelectorAll('main table')).toHaveLength(3);
      expect(document.querySelector('main h1')?.textContent).toBe(
        locale === 'en'
          ? 'A 6/12 roof pitch is 26.57 degrees'
          : 'Una pendiente de techo 6/12 mide 26.57 grados',
      );
    },
  );

  it('adds no pitch section to the pitch chart', async () => {
    const document = await render('roof-pitch-chart', 'en');
    expect(document.querySelector('main')?.textContent).not.toContain(OSHA_1926_500.url);
  });
});
