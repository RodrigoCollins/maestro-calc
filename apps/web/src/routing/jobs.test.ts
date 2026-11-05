import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { drywall } from '../lib/drywall.ts';
import { gravel } from '../lib/gravel.ts';
import { paint } from '../lib/paint.ts';
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
  gravel,
  paint,
  drywall,
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
    expect(jobsOf('gravel')).toEqual(['gravel-driveway-10x20', 'gravel-driveway-12x50']);
    expect(jobsOf('paint')).toEqual(['paint-room-10x10', 'paint-room-10x12', 'paint-room-12x12']);
    expect(jobsOf('drywall')).toEqual([
      'drywall-room-10x10',
      'drywall-room-10x12',
      'drywall-room-12x12',
    ]);
    expect([
      ...jobsOf('concrete'),
      ...jobsOf('roof-pitch'),
      ...jobsOf('rectangle-area'),
      ...jobsOf('mulch'),
      ...jobsOf('gravel'),
      ...jobsOf('paint'),
      ...jobsOf('drywall'),
    ]).toEqual(JOB_IDS);
    expect(jobsOf('roofing')).toEqual([]);
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

  // queries: "how much gravel for a 10x20 driveway", "how much paint for a 12x12 room", "how many
  // sheets of drywall for a 12x12 room": the size in the id is the length by the width of every
  // case, and the cases differ only in the depth (gravel) or the wall height (paint, drywall)
  it.each([
    ['gravel', 'gravel-driveway-', 'depth', ['4in', '6in', '8in']],
    ['paint', 'paint-room-', 'height', ['8ft', '9ft', '10ft']],
    ['drywall', 'drywall-room-', 'height', ['8ft', '9ft', '10ft']],
  ] as const)(
    'names each %s job after the length and the width of its cases',
    (calculator, prefix, varying, values) => {
      for (const id of jobsOf(calculator)) {
        const size = id.replace(prefix, '');
        const [length, width] = size.split('x');
        for (const each of JOBS[id].cases) {
          expect(each, id).toEqual({
            length: `${length ?? ''}ft`,
            width: `${width ?? ''}ft`,
            [varying]: each[varying],
          });
        }
        expect(
          JOBS[id].cases.map((each) => each[varying]),
          id,
        ).toEqual(values);
      }
    },
  );

  it('routes the gravel, paint and drywall jobs by their size', () => {
    for (const id of jobsOf('gravel')) {
      const size = id.replace('gravel-driveway-', '');
      expect(ROUTES[id].en, id).toBe(`/landscaping/gravel-for-${size}-driveway`);
      expect(ROUTES[id].es, id).toBe(`/es/jardineria/grava-para-entrada-de-${size}`);
    }
    for (const id of jobsOf('paint')) {
      const size = id.replace('paint-room-', '');
      expect(ROUTES[id].en, id).toBe(`/painting/paint-for-${size}-room`);
      expect(ROUTES[id].es, id).toBe(`/es/pintura/pintura-para-cuarto-de-${size}`);
    }
    for (const id of jobsOf('drywall')) {
      const size = id.replace('drywall-room-', '');
      expect(ROUTES[id].en, id).toBe(`/drywall/drywall-for-${size}-room`);
      expect(ROUTES[id].es, id).toBe(`/es/drywall/drywall-para-cuarto-de-${size}`);
    }
  });

  it('lists every job under a hub that holds its calculator', () => {
    const hubbed = Object.values(HUBS).flatMap(({ calculators }) => calculators);
    for (const id of JOB_IDS) expect(hubbed, id).toContain(JOBS[id].calculator);
  });
});
