import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { topsoil } from '@maestro-calc/core/calculators/topsoil';
import { describe, expect, it } from 'vitest';
import { concrete } from '../lib/concrete.ts';
import { drywall } from '../lib/drywall.ts';
import { gravel } from '../lib/gravel.ts';
import { paint } from '../lib/paint.ts';
import { roofing } from '../lib/roofing.ts';
import { HUBS, hubOfCalculator } from './hubs.ts';
import {
  ACRE_FT2,
  isChartJob,
  isJobPage,
  isLandJob,
  JOB_IDS,
  JOBS,
  jobsOf,
  LAND_ACRES,
} from './jobs.ts';
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
  topsoil,
  roofing,
  'feet-inches': feetInches,
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
      'roof-pitch-7-5-12',
      'roof-pitch-8-12',
      'roof-pitch-9-12',
      'roof-pitch-10-12',
      'roof-pitch-12-12',
      'roof-pitch-chart',
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
      'square-feet-in-an-acre',
      'square-feet-in-a-half-acre',
      'square-feet-in-a-quarter-acre',
      'square-feet-to-square-meters-chart',
    ]);
    expect(jobsOf('mulch')).toEqual(['mulch-bags-per-yard']);
    expect(jobsOf('gravel')).toEqual([
      'gravel-driveway-10x20',
      'gravel-driveway-12x50',
      'gravel-driveway-12x100',
      'cubic-yard-weight-chart',
    ]);
    expect(jobsOf('paint')).toEqual([
      'paint-room-10x10',
      'paint-room-10x12',
      'paint-room-12x12',
      'paint-room-12x14',
      'paint-room-12x16',
    ]);
    expect(jobsOf('drywall')).toEqual([
      'drywall-room-10x10',
      'drywall-room-10x12',
      'drywall-room-12x12',
      'drywall-room-12x14',
      'drywall-room-12x16',
    ]);
    expect(jobsOf('topsoil')).toEqual([
      'topsoil-raised-bed-4x4',
      'topsoil-raised-bed-4x8',
      'topsoil-10x10',
      'topsoil-20x20',
    ]);
    expect(jobsOf('roofing')).toEqual([
      'roofing-12x16',
      'roofing-24x24',
      'roofing-30x40',
      'roofing-30x50',
    ]);
    expect([
      ...jobsOf('concrete'),
      ...jobsOf('roof-pitch'),
      ...jobsOf('rectangle-area'),
      ...jobsOf('mulch'),
      ...jobsOf('gravel'),
      ...jobsOf('paint'),
      ...jobsOf('drywall'),
      ...jobsOf('topsoil'),
      ...jobsOf('roofing'),
      ...jobsOf('feet-inches'),
    ]).toEqual(JOB_IDS);
    expect(jobsOf('feet-inches')).toEqual([
      'divide-29-1-4-in-by-2',
      'divide-23-5-8-in-by-2',
      'divide-35-5-in-by-2',
      'divide-22-in-by-10',
      'divide-9-ft-6-in-by-2',
      'divide-3-ft-9-in-by-2',
      'decimal-feet-chart',
    ]);
    expect(isJobPage('concrete-slab-10x10')).toBe(true);
    expect(isJobPage('roof-pitch-6-12')).toBe(true);
    expect(isJobPage('square-feet-12x14')).toBe(true);
    expect(isJobPage('concrete-slab-650-sq-ft')).toBe(true);
    expect(isJobPage('mulch-bags-per-yard')).toBe(true);
    expect(isJobPage('hub-concrete')).toBe(false);
    expect(templateOf('hub-concrete')).toBe('trust');
  });

  it('names each square footage job after the length and the width of its first case', () => {
    const rooms = jobsOf('rectangle-area').filter((each) => !isChartJob(each) && !isLandJob(each));
    for (const id of rooms) {
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

  // queries: "how many bags of concrete for a 10x20 slab 4 inches", "12x24 slab": the size in the
  // id is the length by the width of every case, 4, 5 and 6 in thick, in table order by size
  it('names each concrete slab by its sides after the length and the width of its cases', () => {
    const bySides = JOB_IDS.filter((id) => /^concrete-slab-\d+x\d+$/.test(id));
    expect(bySides).toEqual([
      'concrete-slab-10x10',
      'concrete-slab-10x12',
      'concrete-slab-10x20',
      'concrete-slab-12x12',
      'concrete-slab-12x20',
      'concrete-slab-12x24',
      'concrete-slab-20x20',
      'concrete-slab-24x24',
    ]);
    for (const id of bySides) {
      const size = id.replace('concrete-slab-', '');
      const [length, width] = size.split('x');
      expect(JOBS[id].cases, id).toEqual(
        ['4in', '5in', '6in'].map((thickness) => ({
          length: `${length ?? ''}ft`,
          width: `${width ?? ''}ft`,
          thickness,
        })),
      );
      expect(ROUTES[id].en, id).toBe(`/concrete/${size}-slab`);
      expect(ROUTES[id].es, id).toBe(`/es/concreto/losa-de-${size}`);
    }
  });

  // a reference chart (growth plan, links): every slab size of the slab jobs and the common sizes
  // around them, smallest first, each at 4, 5 and 6 in thick, in one table a site can link to
  it('charts every slab size by area, smallest first, at 4, 5 and 6 in thick', () => {
    const { calculator, cases } = JOBS['concrete-slab-chart'];
    expect(calculator).toBe('concrete');
    const sizes = [
      ...new Set(cases.map((each) => `${each['length'] ?? ''}x${each['width'] ?? ''}`)),
    ];
    const sides = (size: string): number[] => size.split('x').map((side) => Number.parseInt(side));
    const area = (size: string): number => (sides(size)[0] ?? 0) * (sides(size)[1] ?? 0);
    expect(sizes.map(area)).toEqual(sizes.map(area).toSorted((a, b) => a - b));
    expect(cases).toEqual(
      sizes.flatMap((size) =>
        ['4in', '5in', '6in'].map((thickness) => {
          const [length, width] = size.split('x');
          return { length: length ?? '', width: width ?? '', thickness };
        }),
      ),
    );
    const bySides = JOB_IDS.filter((id) => /^concrete-slab-\d+x\d+$/.test(id)).map((id) =>
      id.replace('concrete-slab-', ''),
    );
    for (const size of [...bySides, '4x4']) {
      expect(sizes, size).toContain(size.replace(/(\d+)/g, '$1ft'));
    }
    expect(sizes.length).toBeGreaterThanOrEqual(12);
    expect(isChartJob('concrete-slab-chart')).toBe(true);
    expect(JOB_IDS.filter(isChartJob)).toEqual([
      'concrete-slab-chart',
      'roof-pitch-chart',
      'square-feet-to-square-meters-chart',
      'cubic-yard-weight-chart',
      'decimal-feet-chart',
    ]);
    expect(ROUTES['concrete-slab-chart']).toEqual({
      en: '/concrete/slab-chart',
      es: '/es/concreto/tabla-de-losas',
    });
  });

  // queries: "60 degree pitch", "7.5/12 pitch": a reference chart of every whole pitch from 1 to 24
  // in 12 and every half pitch that has a job page, smallest first, each a rise over a 12 in run
  it('charts every pitch from 1 to 24 in 12 and each half pitch of a job, smallest first', () => {
    const { calculator, cases } = JOBS['roof-pitch-chart'];
    expect(calculator).toBe('roof-pitch');
    const rises = cases.map((each) => Number.parseFloat(each['rise'] ?? ''));
    expect(rises).toEqual(rises.toSorted((a, b) => a - b));
    expect(cases).toEqual(rises.map((rise) => ({ rise: `${String(rise)}in`, run: '12in' })));
    const whole = Array.from({ length: 24 }, (_, index) => index + 1);
    const halves = jobsOf('roof-pitch')
      .filter((id) => !isChartJob(id))
      .map((id) =>
        Number.parseFloat(id.replace('roof-pitch-', '').replace(/-12$/, '').replace('-', '.')),
      )
      .filter((rise) => !Number.isInteger(rise));
    expect(halves).toEqual([7.5]);
    expect(rises).toEqual([...whole, ...halves].toSorted((a, b) => a - b));
    expect(isChartJob('roof-pitch-chart')).toBe(true);
    expect(ROUTES['roof-pitch-chart']).toEqual({
      en: '/roofing/roof-pitch-chart',
      es: '/es/techos/tabla-de-pendientes-de-techo',
    });
  });

  // queries: "how much does a yard of gravel weigh", "weight of a cubic yard of dirt": the chart
  // opens the gravel calculator on one cubic yard (9 ft × 9 ft × 4 in = 27 ft³, no extra), compacted
  // then loose
  it('opens the cubic yard weight chart on one cubic yard of gravel, compacted then loose', () => {
    const { calculator, cases } = JOBS['cubic-yard-weight-chart'];
    expect(calculator).toBe('gravel');
    expect(cases).toEqual(
      ['compacted', 'loose'].map((placement) => ({
        length: '9ft',
        width: '9ft',
        depth: '4in',
        placement,
        waste: '0',
      })),
    );
    expect(isChartJob('cubic-yard-weight-chart')).toBe(true);
  });

  // query: "how many bags of concrete for a footing": a continuous footing of the calculator, its
  // width by its depth in inches in the id, 20, 50 and 100 ft long (one wall, a shed, a garage)
  it('names each concrete footing after its width and its depth in inches', () => {
    const footings = JOB_IDS.filter((id) => id.startsWith('concrete-footing-'));
    expect(footings).toEqual(['concrete-footing-16x8', 'concrete-footing-20x10']);
    for (const id of footings) {
      const size = id.replace('concrete-footing-', '');
      const [footingWidth, footingDepth] = size.split('x');
      expect(JOBS[id].cases, id).toEqual(
        ['20ft', '50ft', '100ft'].map((length) => ({
          shape: 'footing',
          length,
          footingWidth: `${footingWidth ?? ''}in`,
          footingDepth: `${footingDepth ?? ''}in`,
        })),
      );
      expect(ROUTES[id].en, id).toBe(`/concrete/${size}-footing`);
      expect(ROUTES[id].es, id).toBe(`/es/concreto/zapata-de-${size}`);
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
      for (const id of jobsOf(calculator).filter((each) => !isChartJob(each))) {
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
    for (const id of jobsOf('gravel').filter((each) => !isChartJob(each))) {
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

  // queries: "how much soil for a 4x8 raised bed", "how much topsoil for a 10x10 area", "how many
  // bundles of shingles for a 24x24 roof": the size in the id is the length by the width of every
  // case, and the cases differ only in the depth (topsoil) or the pitch (roofing), the calculator's
  // default first
  it.each([
    ['topsoil-raised-bed-', 'depth', ['12in', '18in', '24in']],
    ['topsoil-', 'depth', ['4in', '6in', '8in']],
    ['roofing-', 'pitch', ['6', '8', '10']],
  ] as const)(
    'names each %s job after the length and the width of its cases',
    (prefix, varying, values) => {
      const ids = JOB_IDS.filter((id) => /^\d+x\d+$/.test(id.replace(prefix, '')));
      expect(ids.length, prefix).toBeGreaterThan(0);
      for (const id of ids) {
        const [length, width] = id.replace(prefix, '').split('x');
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

  it('routes the topsoil and roofing jobs by their size', () => {
    for (const id of jobsOf('topsoil')) {
      const size = id.replace('topsoil-raised-bed-', '').replace('topsoil-', '');
      const bed = id.startsWith('topsoil-raised-bed-');
      expect(ROUTES[id].en, id).toBe(
        bed ? `/landscaping/soil-for-${size}-raised-bed` : `/landscaping/topsoil-for-${size}-area`,
      );
      expect(ROUTES[id].es, id).toBe(
        bed
          ? `/es/jardineria/tierra-para-cama-elevada-de-${size}`
          : `/es/jardineria/tierra-para-area-de-${size}`,
      );
    }
    for (const id of jobsOf('roofing')) {
      const size = id.replace('roofing-', '');
      expect(ROUTES[id].en, id).toBe(`/roofing/shingles-for-${size}-roof`);
      expect(ROUTES[id].es, id).toBe(`/es/techos/tejas-para-techo-de-${size}`);
    }
  });

  // query: "7.5/12 roof pitch": a rise of 7 1/2 in, written 7-5 in the id and the URL
  it('names each roof pitch job after its rise in 12', () => {
    for (const id of jobsOf('roof-pitch').filter((each) => !isChartJob(each))) {
      const rise = id.replace('roof-pitch-', '').replace(/-12$/, '');
      for (const each of JOBS[id].cases) {
        expect(each['rise'], id).toBe(`${rise.replace('-', '.')}in`);
        expect(each['run'], id).toBe('12in');
      }
      expect(ROUTES[id].en, id).toBe(`/roofing/${rise}-12-roof-pitch`);
      expect(ROUTES[id].es, id).toBe(`/es/techos/pendiente-de-techo-${rise}-12`);
    }
  });

  // queries: "29 1/4 divided by 2 on a tape measure", "what is half of 23 5/8 on a tape measure",
  // "35.5 inches divided by 2", "22 inches divided by 10", "9 feet 6 inches divided by 2", "3 feet 9
  // inches divided by 2": the length and the number of the id first, then the same length by the
  // other numbers of 2, 3 and 4
  it('divides the length of each feet and inches job by its number, then by 2, 3 and 4', () => {
    const LENGTHS = {
      'divide-29-1-4-in-by-2': ['29 1/4 in', '29-1-4-inches', '29-1-4-pulgadas'],
      'divide-23-5-8-in-by-2': ['23 5/8 in', '23-5-8-inches', '23-5-8-pulgadas'],
      'divide-35-5-in-by-2': ['35.5 in', '35-5-inches', '35-5-pulgadas'],
      'divide-22-in-by-10': ['22 in', '22-inches', '22-pulgadas'],
      'divide-9-ft-6-in-by-2': ['9 ft 6 in', '9-feet-6-inches', '9-pies-6-pulgadas'],
      'divide-3-ft-9-in-by-2': ['3 ft 9 in', '3-feet-9-inches', '3-pies-9-pulgadas'],
    } as const;
    for (const id of jobsOf('feet-inches').filter((each) => !isChartJob(each))) {
      expect(Object.hasOwn(LENGTHS, id), id).toBe(true);
      if (!Object.hasOwn(LENGTHS, id)) continue;
      const [first, en, es] = LENGTHS[id as keyof typeof LENGTHS];
      const factor = id.replace(/^.*-by-/, '');
      const factors = [factor, ...['2', '3', '4'].filter((each) => each !== factor)];
      expect(JOBS[id].cases, id).toEqual(
        factors.map((each) => ({ first, operation: 'divide', factor: each })),
      );
      expect(ROUTES[id].en, id).toBe(`/measurement/${en}-divided-by-${factor}`);
      expect(ROUTES[id].es, id).toBe(`/es/medidas/${es}-entre-${factor}`);
    }
  });

  // queries: "decimal to feet and inches calculator" (4.9), "convert 11.65 feet to feet and inches
  // round to the nearest 1 16" (3.0): a chart that opens the feet and inches calculator on each
  // decimal length times 1, which it writes back in feet and inches
  it('routes the decimal feet chart under measurement', () => {
    expect(JOBS['decimal-feet-chart'].calculator).toBe('feet-inches');
    expect(isChartJob('decimal-feet-chart')).toBe(true);
    expect(ROUTES['decimal-feet-chart']).toEqual({
      en: '/measurement/decimal-feet-to-feet-and-inches-chart',
      es: '/es/medidas/tabla-de-pies-decimales-a-pies-y-pulgadas',
    });
  });

  // query: "the area of a large rug is 188 ft2. what is this area in units of m2?" (11.0): a chart
  // the square footage engine works out, each area as a strip that long and 1 ft wide
  it('routes the square feet to square meters chart under measurement', () => {
    expect(JOBS['square-feet-to-square-meters-chart'].calculator).toBe('rectangle-area');
    expect(isChartJob('square-feet-to-square-meters-chart')).toBe(true);
    expect(ROUTES['square-feet-to-square-meters-chart']).toEqual({
      en: '/measurement/square-feet-to-square-meters-chart',
      es: '/es/medidas/tabla-de-pies-cuadrados-a-metros-cuadrados',
    });
  });

  it('lists every job under a hub that holds its calculator', () => {
    const hubbed = Object.values(HUBS).flatMap(({ calculators }) => calculators);
    for (const id of JOB_IDS) expect(hubbed, id).toContain(JOBS[id].calculator);
  });

  // queries: "how many square feet in an acre" (57K), "in a quarter acre", "in half an acre"
  // (Ahrefs US, 2026-11-08). NIST Handbook 44, Appendix C: 1 acre = 43,560 ft², 1 chain = 66 ft,
  // 1 furlong = 660 ft; an acre is 1 chain by 1 furlong, so every lot below is exact
  it('tables each lot of land as rectangles of exactly its acres, measured in whole chains first', () => {
    expect(ACRE_FT2).toBe(43_560);
    expect(JOB_IDS.filter(isLandJob)).toEqual([
      'square-feet-in-an-acre',
      'square-feet-in-a-half-acre',
      'square-feet-in-a-quarter-acre',
    ]);
    expect(LAND_ACRES).toEqual({
      'square-feet-in-an-acre': 1,
      'square-feet-in-a-half-acre': 0.5,
      'square-feet-in-a-quarter-acre': 0.25,
    });
    for (const id of JOB_IDS.filter(isLandJob)) {
      expect(JOBS[id].calculator, id).toBe('rectangle-area');
      const feet = JOBS[id].cases.map(
        (raw) => Number.parseFloat(raw['length'] ?? '') * Number.parseFloat(raw['width'] ?? ''),
      );
      for (const area of feet) expect(area, id).toBeCloseTo(LAND_ACRES[id] * ACRE_FT2, 6);
      // the first lot is one chain (66 ft) deep
      expect(JOBS[id].cases[0]['length'], id).toBe('66ft');
      expect(JOBS[id].cases.length, id).toBeGreaterThanOrEqual(4);
    }
    expect(isLandJob('square-feet-12x12')).toBe(false);
    expect(ROUTES['square-feet-in-an-acre']).toEqual({
      en: '/measurement/square-feet-in-an-acre',
      es: '/es/medidas/pies-cuadrados-en-un-acre',
    });
  });
});
