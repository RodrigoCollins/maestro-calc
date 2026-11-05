import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { HUBS, hubOfCalculator } from './hubs.ts';
import { isJobPage, JOB_IDS, JOBS, jobsOf } from './jobs.ts';
import { ROUTES } from './routes.ts';
import { CALCULATOR_PAGES, templateOf } from './templates.ts';

/** The engine of each calculator a job can belong to. */
const ENGINES = {
  concrete,
  'roof-pitch': roofPitch,
  'rectangle-area': rectangleArea,
  mulch,
} as const;

describe('job pages (growth plan › lever 1)', () => {
  it('gives every job a route under the hub of its calculator, in both locales', () => {
    expect(JOB_IDS.length).toBeGreaterThan(0);
    for (const id of JOB_IDS) {
      const { calculator } = JOBS[id];
      expect(CALCULATOR_PAGES, id).toContain(calculator);
      const hub = hubOfCalculator(calculator);
      expect(hub, id).toBeDefined();
      if (hub === undefined) continue;
      expect(ROUTES[id].en.startsWith(`${ROUTES[hub].en}/`), id).toBe(true);
      expect(ROUTES[id].es.startsWith(`${ROUTES[hub].es}/`), id).toBe(true);
      expect(ROUTES[id].en, id).toMatch(/^(\/[a-z0-9-]+){2}$/);
      expect(ROUTES[id].es, id).toMatch(/^\/es(\/[a-z0-9-]+){2}$/);
      expect(templateOf(id), id).toBe('job');
    }
  });

  it('holds cases of one shape per job, each a state its engine accepts', () => {
    for (const id of JOB_IDS) {
      const [first, ...rest] = JOBS[id].cases;
      for (const each of rest) expect(Object.keys(each), id).toEqual(Object.keys(first));
      for (const each of JOBS[id].cases) {
        expect(ENGINES[JOBS[id].calculator].validate(each).ok, id).toBe(true);
      }
    }
  });

  it('lists the jobs of a calculator in table order, and tells a job id apart', () => {
    expect(jobsOf('concrete')).toEqual(JOB_IDS.filter((id) => id.startsWith('concrete-')));
    expect(jobsOf('roof-pitch')).toEqual([
      'roof-pitch-3-12',
      'roof-pitch-4-12',
      'roof-pitch-5-12',
      'roof-pitch-6-12',
      'roof-pitch-7-12',
      'roof-pitch-8-12',
      'roof-pitch-9-12',
      'roof-pitch-10-12',
      'roof-pitch-12-12',
    ]);
    expect(jobsOf('rectangle-area')).toEqual([
      'square-feet-5x5',
      'square-feet-5x10',
      'square-feet-7x12',
      'square-feet-10x10',
      'square-feet-10x12',
      'square-feet-11x14',
      'square-feet-11x16',
      'square-feet-12x12',
      'square-feet-12x14',
      'square-feet-12x30',
      'square-feet-20x20',
    ]);
    expect(jobsOf('mulch')).toEqual(['mulch-bags-per-yard']);
    expect([
      ...jobsOf('concrete'),
      ...jobsOf('roof-pitch'),
      ...jobsOf('rectangle-area'),
      ...jobsOf('mulch'),
    ]).toEqual(JOB_IDS);
    expect(jobsOf('paint')).toEqual([]);
    expect(isJobPage('concrete-slab-10x10')).toBe(true);
    expect(isJobPage('roof-pitch-6-12')).toBe(true);
    expect(isJobPage('square-feet-12x14')).toBe(true);
    expect(isJobPage('concrete-slab-650-sq-ft')).toBe(true);
    expect(isJobPage('mulch-bags-per-yard')).toBe(true);
    expect(isJobPage('hub-concrete')).toBe(false);
    expect(templateOf('hub-concrete')).toBe('trust');
  });

  it('names each square footage job after the length and the width of its first case', () => {
    for (const id of jobsOf('rectangle-area')) {
      const [first] = JOBS[id].cases;
      expect(
        `square-feet-${first['length'] ?? ''}x${first['width'] ?? ''}`.replaceAll('ft', ''),
        id,
      ).toBe(id);
      expect(ROUTES[id].en, id).toBe(`/measurement/${id.replace('square-feet-', '')}-square-feet`);
      expect(ROUTES[id].es, id).toBe(
        `/es/medidas/${id.replace('square-feet-', '')}-pies-cuadrados`,
      );
    }
  });

  // query: "how much concrete for 650 sf slab": the calculator takes a length and a width, so each
  // area is a rectangle of that many square feet, 4 in thick first
  it('names each concrete slab by area after the area of its first case', () => {
    const byArea = JOB_IDS.filter((id) => /^concrete-slab-\d+-sq-ft$/.test(id));
    expect(byArea).toEqual([
      'concrete-slab-500-sq-ft',
      'concrete-slab-650-sq-ft',
      'concrete-slab-1000-sq-ft',
    ]);
    for (const id of byArea) {
      const area = id.replace('concrete-slab-', '').replace('-sq-ft', '');
      const [first] = JOBS[id].cases;
      const feet = (key: string): number => Number((first[key] ?? '').replace('ft', ''));
      expect(feet('length') * feet('width'), id).toBe(Number(area));
      expect(
        JOBS[id].cases.map((each) => each['thickness']),
        id,
      ).toEqual(['4in', '5in', '6in']);
      expect(ROUTES[id].en, id).toBe(`/concrete/${area}-sq-ft-slab`);
      expect(ROUTES[id].es, id).toBe(`/es/concreto/losa-de-${area}-pies-cuadrados`);
    }
  });

  // query: "how many bags of 1.5 cubic feet in a yard": a 9 × 9 ft bed, 4 in deep, is 27 ft³
  it('fills one cubic yard with each bag size of the mulch calculator, with no extra', () => {
    const { cases } = JOBS['mulch-bags-per-yard'];
    expect(cases.map((each) => each['bag'])).toEqual(['1-5', '2', '3']);
    for (const each of cases) {
      expect(each).toMatchObject({ length: '9ft', width: '9ft', depth: '4in', waste: '0' });
    }
    expect(ROUTES['mulch-bags-per-yard']).toEqual({
      en: '/landscaping/bags-of-mulch-per-yard',
      es: '/es/jardineria/bolsas-de-mulch-por-yarda',
    });
  });

  it('lists every job under a hub that holds its calculator', () => {
    const hubbed = Object.values(HUBS).flatMap(({ calculators }) => calculators);
    for (const id of JOB_IDS) expect(hubbed, id).toContain(JOBS[id].calculator);
  });
});
