import { encode, inch, Rational, valueIn, type OutputDescriptor } from '@maestro-calc/core';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import type { MaterialSource } from '@maestro-calc/data';
import { createTranslator, type Locale } from '@maestro-calc/i18n';
import { enRoofPitch } from '@maestro-calc/i18n/catalogs/en/roof-pitch';
import { esRoofPitch } from '@maestro-calc/i18n/catalogs/es/roof-pitch';
import { decimalText, outputText } from '../calculator/present.ts';
import type { Job, JobCase } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import type { JobFact, JobRow, JobTable } from './job-view.ts';
import { siteText } from './site-text.ts';

/*
 * The roof pitch chart (growth plan, reference charts): every pitch of the chart worked out by the
 * roof pitch engine at build time (its angle, its grade, its rafter multiplier and the coverings the
 * IRC check of the engine accepts), and a degrees to pitch table from `pitchOfAngle`.
 */

/**
 * The source of the minimum slopes the engine checks: the one the roof pitch calculator page lists
 * first (a test holds it to the frontmatter of both entries).
 */
export const IRC_R905: Required<MaterialSource> = {
  name: '2021 International Residential Code, Chapter 9, Section R905 (minimum roof slopes)',
  url: 'https://codes.iccsafe.org/content/IRC2021P2/chapter-9-roof-assemblies',
  retrieved: '2026-10-30',
};

/** The angles of the degrees to pitch table: the ones people ask for. */
export const REVERSE_ANGLES = [15, 20, 22.5, 30, 35, 40, 45, 60] as const;

/** The rise over a 12 in run of a roof at `degrees` (strictly between 0 and 90): 12 × tan(angle). */
export const pitchOfAngle = (degrees: number): number => {
  if (!(degrees > 0 && degrees < 90)) throw new RangeError(`no roof pitch at ${String(degrees)}°`);
  return 12 * Math.tan((degrees * Math.PI) / 180);
};

/** The degrees to pitch table: one row per angle, its rise in 12 and its grade. */
export interface ChartReverse {
  readonly heading: string;
  readonly lead: string;
  readonly columns: readonly [string, ...string[]];
  readonly rows: readonly { readonly label: string; readonly cells: readonly string[] }[];
}

const catalogs = { en: createTranslator(enRoofPitch), es: createTranslator(esRoofPitch) };

const outputOf = (key: (typeof roofPitch.outputs)[number]['key']): OutputDescriptor => {
  const output = roofPitch.outputs.find((each) => each.key === key);
  if (output === undefined) throw new Error(`the roof pitch engine has no ${key} output`);
  return output;
};

const stateOf = (raw: JobCase) => {
  const result = roofPitch.validate(raw);
  if (!result.ok) throw new Error(`invalid chart case: ${JSON.stringify(raw)}`);
  return result.value;
};

const run = (raw: JobCase) => roofPitch.compute(stateOf(raw));

/** The coverings of the engine's select (its one select), in the order it offers them. */
const COVERINGS = roofPitch.inputs.flatMap((input) =>
  input.kind === 'select' ? input.options : [],
);

/** A grade (rise over run, as a percentage) to the hundredth: `50.00%`. */
const gradeText = (grade: Rational): string => `${decimalText(grade, 2, false)}%`;

/** What the engine says of `covering` at the pitch of `raw`: allowed, two layers, or below. */
const checkOf = (raw: JobCase, covering: string): 'meets' | 'double' | 'below' => {
  const codes = run({ ...raw, covering }).warnings.map(({ code }) => code);
  if (codes.includes('belowMinimum')) return 'below';
  return codes.includes('doubleUnderlayment') ? 'double' : 'meets';
};

/** The coverings the IRC check accepts at the pitch of `raw`, as one cell. */
const coveringsText = (raw: JobCase, locale: Locale): string => {
  const calc = catalogs[locale];
  const text = siteText(locale);
  const checks = COVERINGS.map((covering) => [covering, checkOf(raw, covering)] as const);
  if (checks.every(([, check]) => check === 'meets')) return text('page.roof-pitch-chart.all');
  const allowed = checks.filter(([, check]) => check !== 'below');
  if (allowed.length === 0) return '—';
  return allowed
    .map(([covering, check]) => {
      const name = calc(`calc.roof-pitch.options.covering.${covering}`);
      return check === 'double' ? `${name} ${text('page.roof-pitch-chart.twoLayers')}` : name;
    })
    .join(', ');
};

/** The pitch of a case as roofers write it: `7.5/12`. */
const pitchLabel = (raw: JobCase): string => `${(raw['rise'] ?? '').replace(/in$/, '')}/12`;

/** Every pitch of the chart: its angle, its grade, its rafter multiplier and the IRC coverings. */
export const roofPitchChartTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = catalogs[locale];
  const text = siteText(locale);
  const angle = outputOf('angle');
  const rafter = outputOf('rafter');
  const toRow = (raw: JobCase): JobRow => {
    const { outputs } = run(raw);
    // the rafter of one foot of run with no overhang is the multiplier √(1 + t²), to the thousandth
    const perFoot = run({ ...raw, rafterRun: '1ft', overhang: '0in' });
    return {
      label: pitchLabel(raw),
      href: `${pathOf('roof-pitch', locale)}?${encode(roofPitch, stateOf(raw), { unitSystem: 'imperial' })}`,
      cells: [
        calc('calc.roof-pitch.page.angle', { value: outputText(angle, outputs.angle) }),
        gradeText(valueIn(outputs.pitch, inch).mul(Rational.of(100, 12))),
        outputText(
          { ...rafter, display: { unit: 'ft', format: 'decimal', places: 3 } },
          perFoot.outputs.rafter,
        ),
        coveringsText(raw, locale),
      ],
    };
  };
  const [first, ...rest] = cases;
  const rows = [toRow(first), ...rest.map(toRow)] as const;
  const [firstAngle = '', firstGrade = '', firstMultiplier = ''] = rows[0].cells;
  return {
    lead: `${text('page.roof-pitch-chart.pitch')}: ${rows[0].label}`,
    answer: firstAngle,
    facts: [
      { label: text('page.roof-pitch-chart.grade'), value: firstGrade },
      { label: text('page.roof-pitch-chart.multiplier'), value: firstMultiplier },
    ],
    columns: [
      text('page.roof-pitch-chart.pitch'),
      text('page.roof-pitch-chart.angle'),
      text('page.roof-pitch-chart.grade'),
      text('page.roof-pitch-chart.multiplier'),
      text('page.roof-pitch-chart.coverings'),
    ],
    rows,
    calculatorName: calc('calc.roof-pitch.title'),
  };
};

/**
 * The IRC minimum slope of each covering, as the engine reports it for a flat roof, with the two
 * layers of underlayment below the first pitch of the chart at which the engine stops asking for
 * them.
 */
export const roofPitchChartBasis = (cases: Job['cases'], locale: Locale): JobFact[] => {
  const calc = catalogs[locale];
  const text = siteText(locale);
  return COVERINGS.map((covering) => {
    const below = run({ rise: '0in', covering }).warnings.find(
      ({ code }) => code === 'belowMinimum',
    );
    if (below === undefined) throw new Error(`the engine sets no minimum for ${covering}`);
    const minimum = String(below.params['minimum']);
    const doubled = cases.filter((raw) => checkOf(raw, covering) === 'double');
    const single = cases.find((raw) => doubled.length > 0 && checkOf(raw, covering) === 'meets');
    return {
      label: calc(`calc.roof-pitch.options.covering.${covering}`),
      value:
        single === undefined
          ? calc('calc.roof-pitch.page.pitch', { value: minimum })
          : [
              calc('calc.roof-pitch.page.pitch', { value: minimum }),
              `${text('page.roof-pitch-chart.double')} ${calc('calc.roof-pitch.page.pitch', { value: (single['rise'] ?? '').replace(/in$/, '') })}`,
            ].join(', '),
    };
  });
};

/** The degrees to pitch table: the rise in 12 of each common angle and its grade. */
export const roofPitchReverse = (locale: Locale): ChartReverse => {
  const calc = catalogs[locale];
  const text = siteText(locale);
  const hundredths = (value: number): string => (Math.round(value * 100) / 100).toFixed(2);
  return {
    heading: text('page.roof-pitch-chart.reverse'),
    lead: text('page.roof-pitch-chart.reverseLead'),
    columns: [
      text('page.roof-pitch-chart.angle'),
      text('page.roof-pitch-chart.pitch'),
      text('page.roof-pitch-chart.grade'),
    ],
    rows: REVERSE_ANGLES.map((angle) => {
      const rise = pitchOfAngle(angle);
      return {
        label: `${String(angle)}°`,
        cells: [
          calc('calc.roof-pitch.page.pitch', { value: hundredths(rise) }),
          `${hundredths((rise * 100) / 12)}%`,
        ],
      };
    }),
  };
};
