import { describe, expect, it } from 'vitest';
import { handProblems } from './__testing__/hand-check.ts';
import { calculatorWorkedOf, DEFAULTS, ENGINES, type CalculatorId } from './calculator-worked.ts';
import { jobDetailOf } from './job-detail.ts';
import { JOB_PAGES } from './jobs.ts';
import { langOf, pathsOf, routeOf, ROUTES } from './routes.ts';

const CALCULATORS = ROUTES.filter(({ kind }) => kind === 'calculator');
const PATHS = CALCULATORS.flatMap(pathsOf);

/** The figure each page shows before anyone types, worked out by hand. */
const SHOWN: Readonly<Record<CalculatorId, string>> = {
  volume: '22,023',
  salt: '133.4',
  chlorine: '41.0',
  pump: '55.6',
  ph: '36.64',
  alkalinity: '8.4',
  stabilizer: '5.0',
  calcium: '5.0',
  heater: '69,500',
  'fill-time': '33 h 20 min',
};

describe('the worked example of a calculator page', () => {
  it('starts from the very inputs each calculator opens on', () => {
    for (const [id, raw] of Object.entries(DEFAULTS)) {
      const engine = ENGINES[id as CalculatorId];
      const opened = engine.run({});
      const given = engine.run(raw);
      if (!opened.ok || !given.ok) throw new Error(`${id} must run`);
      expect(given.value.outputs, id).toEqual(opened.value.outputs);
    }
  });

  it('works every page out to the figure it shows, in both languages', () => {
    expect(PATHS).toHaveLength(20);
    for (const path of PATHS) {
      const id = routeOf(path)?.id as CalculatorId;
      const { steps, next } = calculatorWorkedOf(path);
      expect(steps.length, path).toBeGreaterThanOrEqual(4);
      expect(steps.join(' '), path).toContain(SHOWN[id]);
      expect(next.items.length, path).toBeGreaterThanOrEqual(2);
    }
  });

  it('writes every sum so a reader who works it by hand gets the same result', () => {
    const problems = PATHS.flatMap((path) => {
      const { steps, next } = calculatorWorkedOf(path);
      return [...steps, ...next.items.map(({ text }) => text)].flatMap(handProblems);
    });
    expect(problems).toEqual([]);
  });

  it('links pages of its own language only', () => {
    for (const path of PATHS) {
      for (const { link } of calculatorWorkedOf(path).next.items) {
        expect(routeOf(link.href), link.href).toBeDefined();
        expect(langOf(link.href), `${path} → ${link.href}`).toBe(langOf(path));
      }
    }
  });

  it('reads in Spanish on a Spanish page, with the tú of the site', () => {
    for (const path of PATHS.filter((each) => langOf(each) === 'es')) {
      const { heading, steps, next } = calculatorWorkedOf(path);
      const text = [heading, ...steps, ...next.items.map(({ text: item }) => item)].join(' ');
      expect(text, path).not.toMatch(/\b(the|and|of|with|gallons|takes?|into)\b/);
      expect(text, path).not.toMatch(/\busted\b/i);
    }
  });

  it('shares no step with another calculator page or with a job page', () => {
    const jobSteps = new Set(JOB_PAGES.flatMap((page) => jobDetailOf(page).worked));
    const seen = new Set<string>();
    for (const path of PATHS) {
      for (const step of calculatorWorkedOf(path).steps) {
        expect(jobSteps.has(step), step).toBe(false);
        expect(seen.has(step), step).toBe(false);
        seen.add(step);
      }
    }
  });

  it('works every page with a units choice out in metric too, in both languages', () => {
    const metric = ['salt', 'chlorine', 'ph', 'alkalinity', 'stabilizer', 'calcium', 'volume'];
    for (const path of PATHS.filter((each) => metric.includes(routeOf(each)?.id ?? ''))) {
      const step = calculatorWorkedOf(path).steps.at(-1) ?? '';
      expect(step, path).toMatch(langOf(path) === 'en' ? /metric/ : /métrico/);
    }
    const salt = calculatorWorkedOf('/pool-salt-calculator').steps.join(' ');
    expect(salt).toContain('75,708 × 800 ÷ 1,000,000 ≈ 60.6 kg');
    expect(salt).toContain('4 bags of 20 kg');
    const chlorine = calculatorWorkedOf('/es/calculadora-de-cloro-para-piscina').steps.join(' ');
    expect(chlorine).toContain('75,708 × 2 ÷ 1,000 ≈ 151.4 g de cloro disponible, 1.21 L');
    const volume = calculatorWorkedOf('/pool-volume-calculator').steps.join(' ');
    expect(volume).toContain('9.75 m by 4.88 m, 1.07 m to 2.44 m deep');
    expect(volume).toContain('83,365 liters, 83.4 m³');
  });

  it('works the salt and the pump at their defaults as by hand', () => {
    const salt = calculatorWorkedOf('/pool-salt-calculator').steps.join(' ');
    expect(salt).toContain('Water: 20,000 gal × 8.34 lb = 166,800 lb.');
    expect(salt).toContain('166,800 × 800 ÷ 1,000,000 = 133.44, shown as 133.4 lb');
    expect(salt).toContain('133.44 ÷ 40 ≈ 3.34, rounded up to 4');
    expect(salt).toContain('133.44 × 3 ÷ 4 ≈ 100.1 lb');
    const pump = calculatorWorkedOf('/es/calculadora-de-bomba-para-piscina').steps.join(' ');
    expect(pump).toContain('Caudal: 20,000 gal ÷ 360 min ≈ 55.6 gpm');
    expect(pump).toContain('20,000 ÷ 480 ≈ 41.7 gpm');
    expect(pump).toContain('80,000 galones');
  });
});
