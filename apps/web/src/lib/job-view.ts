import { encode, yd3, type OutputDescriptor } from '@maestro-calc/core';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import type { Locale } from '@maestro-calc/i18n';
import { createTranslator } from '@maestro-calc/i18n';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { enMulch } from '@maestro-calc/i18n/catalogs/en/mulch';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enRoofPitch } from '@maestro-calc/i18n/catalogs/en/roof-pitch';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { esMulch } from '@maestro-calc/i18n/catalogs/es/mulch';
import { esRectangleArea } from '@maestro-calc/i18n/catalogs/es/rectangle-area';
import { esRoofPitch } from '@maestro-calc/i18n/catalogs/es/roof-pitch';
import { sizeOf as mulchSize } from '../calculator/mulch/present.ts';
import { groupedInteger, outputText, volumeText } from '../calculator/present.ts';
import { JOBS, jobsOf, type Job, type JobCase, type JobId } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import { concrete } from './concrete.ts';
import { siteText } from './site-text.ts';

/** One case of a job page: its sizes, the calculator link that loads it, and what the engine gives. */
export interface JobRow {
  /** The sizes of the case, language-free: `10 ft × 10 ft × 4 in`. */
  readonly label: string;
  /** The calculator page with the case in its URL state. */
  readonly href: string;
  /** The figures of the case, one per column after the first, as the calculator shows them. */
  readonly cells: readonly string[];
}

/** One figure of the first case, under the answer: a bag count, the pitch in 12. */
export interface JobFact {
  readonly label: string;
  readonly value: string;
}

/** What a calculator's engine makes of the cases of a job, in one language. */
interface JobTable {
  /** The sizes of the first case with their names: `Length × Width × Thickness: 10 ft × …`. */
  readonly lead: string;
  /** The answer of the first case: `1.36 cubic yards`, `26.57°`. */
  readonly answer: string;
  readonly facts: readonly JobFact[];
  /** The heading of each column, the sizes first. */
  readonly columns: readonly [string, ...string[]];
  readonly rows: readonly [JobRow, ...JobRow[]];
  readonly calculatorName: string;
}

export interface JobView extends JobTable {
  readonly heading: string;
  /** The sentence that opens a square footage, slab-by-area or mulch job: `page.<id>.intro`. */
  readonly intro: string | undefined;
  /** What the figures assume, from the `site.job.note.<calculator>` key. */
  readonly note: string;
  /** The calculator page, prefilled with the first case. */
  readonly cta: string;
  readonly methodology: string;
  readonly others: readonly { readonly href: string; readonly title: string }[];
}

type JobCalculator = Job['calculator'];

/** The section of each job calculator on the methodology page, by locale. */
export const METHODOLOGY_ANCHOR = {
  concrete: { en: 'concrete', es: 'concreto' },
  'roof-pitch': { en: 'roof-pitch', es: 'pendiente-de-techo' },
  'rectangle-area': { en: 'square-footage', es: 'pies-cuadrados' },
  mulch: { en: 'mulch', es: 'mulch' },
} as const satisfies Record<JobCalculator, Record<Locale, string>>;

/** `10ft` as `10 ft`: the sizes read the same in both languages. */
const sizeText = (value: string): string => value.replace(/^(\d+)(ft|in)$/, '$1 $2');

/** The first item and the rest mapped, keeping the list non-empty for the type. */
const mapCases = <T>(
  [first, ...rest]: readonly [JobCase, ...JobCase[]],
  each: (raw: JobCase) => T,
): readonly [T, ...T[]] => [each(first), ...rest.map(each)];

/* Concrete: the cubic yards and the bags of each size, the default bag first. */

/** The bag sizes of the table, the calculator's default first. */
const BAGS = ['80', '60', '40'] as const;

const concreteCatalogs = { en: createTranslator(enConcrete), es: createTranslator(esConcrete) };

/** The validated state of a case: a case the engine rejects is a programming error. */
const concreteState = (raw: JobCase) => {
  const result = concrete.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

/** The length fields of a case, in the order the calculator declares them (`shape` is not one). */
type LengthInput = Extract<(typeof concrete.inputs)[number], { readonly kind: 'length' }>;

const isLength = (input: (typeof concrete.inputs)[number]): input is LengthInput =>
  input.kind === 'length';

const sizeKeysOf = (raw: JobCase): LengthInput['key'][] =>
  concrete.inputs
    .filter(isLength)
    .filter(({ key }) => Object.hasOwn(raw, key))
    .map(({ key }) => key);

const concreteTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = concreteCatalogs[locale];
  const bagsOf = (raw: JobCase): string[] =>
    BAGS.map((bag) => {
      const [line] = concrete.compute(concreteState({ ...raw, bag })).shopping;
      if (line === undefined) throw new Error('the concrete engine returned no bag line');
      return groupedInteger(line.qty);
    });
  const rows = mapCases(cases, (raw): JobRow => {
    const state = concreteState(raw);
    return {
      label: sizeKeysOf(raw)
        .map((key) => sizeText(raw[key] ?? ''))
        .join(' × '),
      href: `${pathOf('concrete', locale)}?${encode(concrete, state, { unitSystem: 'imperial' })}`,
      cells: [volumeText(concrete.compute(state).outputs.volumeYd3, yd3), ...bagsOf(raw)],
    };
  });
  const [first] = rows;
  const sizeLabel = sizeKeysOf(cases[0])
    .map((key) => calc(`calc.concrete.inputs.${key}`))
    .join(' × ');
  const bagLabels = BAGS.map((bagLb) => calc('calc.concrete.page.shoppingLine', { bagLb }));
  const [yards = '', ...bags] = first.cells;
  return {
    lead: `${sizeLabel}: ${first.label}`,
    answer: calc('calc.concrete.page.volumeYd3', { value: yards }),
    facts: bagLabels.map((label, index) => ({ label, value: bags[index] ?? '' })),
    columns: [sizeLabel, calc('calc.concrete.outputs.volumeYd3'), ...bagLabels],
    rows,
    calculatorName: calc('calc.concrete.title'),
  };
};

/* Roof pitch: the pitch in 12, the angle, the rafter multiplier and the rafter of each run. */

const roofPitchCatalogs = { en: createTranslator(enRoofPitch), es: createTranslator(esRoofPitch) };

type RoofPitchOutput = (typeof roofPitch.outputs)[number];

const roofPitchOutput = (key: RoofPitchOutput['key']): OutputDescriptor => {
  const output = roofPitch.outputs.find((each) => each.key === key);
  if (output === undefined) throw new Error(`the roof pitch engine has no ${key} output`);
  return output;
};

const roofPitchState = (raw: JobCase) => {
  const result = roofPitch.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

const roofPitchTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = roofPitchCatalogs[locale];
  const rafter = roofPitchOutput('rafter');
  const rafterM = roofPitchOutput('rafterM');
  const rows = mapCases(cases, (raw): JobRow => {
    const state = roofPitchState(raw);
    const { outputs } = roofPitch.compute(state);
    return {
      label: sizeText(raw['rafterRun'] ?? ''),
      href: `${pathOf('roof-pitch', locale)}?${encode(roofPitch, state, { unitSystem: 'imperial' })}`,
      cells: [outputText(rafter, outputs.rafter), outputText(rafterM, outputs.rafterM)],
    };
  });
  const [raw] = cases;
  const { outputs } = roofPitch.compute(roofPitchState(raw));
  // the rafter of one foot of run with no overhang is the multiplier √(1 + t²), to the thousandth
  const perFoot = roofPitch.compute(roofPitchState({ ...raw, rafterRun: '1ft', overhang: '0in' }));
  const multiplier = outputText(
    { ...rafter, display: { unit: 'ft', format: 'decimal', places: 3 } },
    perFoot.outputs.rafter,
  );
  return {
    lead: (['rise', 'run'] as const)
      .map((key) => `${calc(`calc.roof-pitch.inputs.${key}`)}: ${sizeText(raw[key] ?? '')}`)
      .join(', '),
    answer: calc('calc.roof-pitch.page.angle', {
      value: outputText(roofPitchOutput('angle'), outputs.angle),
    }),
    facts: [
      {
        label: calc('calc.roof-pitch.outputs.pitch'),
        value: calc('calc.roof-pitch.page.pitch', {
          value: outputText(roofPitchOutput('pitch'), outputs.pitch),
        }),
      },
      { label: siteText(locale)('site.job.multiplier'), value: multiplier },
    ],
    columns: [
      calc('calc.roof-pitch.inputs.rafterRun'),
      calc('calc.roof-pitch.outputs.rafter'),
      calc('calc.roof-pitch.outputs.rafterM'),
    ],
    rows,
    calculatorName: calc('calc.roof-pitch.title'),
  };
};

/* Square footage: the square feet, square meters and square yards of each rectangle. */

const areaCatalogs = {
  en: createTranslator(enRectangleArea),
  es: createTranslator(esRectangleArea),
};

type AreaOutput = (typeof rectangleArea.outputs)[number];

/** The areas of a row, in the order of its columns: the square feet first, as the page answers. */
const AREAS = ['areaFt2', 'areaM2', 'areaYd2'] as const satisfies readonly AreaOutput['key'][];

const areaOutput = (key: AreaOutput['key']): OutputDescriptor => {
  const output = rectangleArea.outputs.find((each) => each.key === key);
  if (output === undefined) throw new Error(`the square footage engine has no ${key} output`);
  return output;
};

const areaState = (raw: JobCase) => {
  const result = rectangleArea.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

const areaTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = areaCatalogs[locale];
  const rows = mapCases(cases, (raw): JobRow => {
    const state = areaState(raw);
    const { outputs } = rectangleArea.compute(state);
    return {
      label: `${sizeText(raw['length'] ?? '')} × ${sizeText(raw['width'] ?? '')}`,
      href: `${pathOf('rectangle-area', locale)}?${encode(rectangleArea, state, { unitSystem: 'imperial' })}`,
      cells: AREAS.map((key) => outputText(areaOutput(key), outputs[key])),
    };
  });
  const [first] = rows;
  const sizeLabel = (['length', 'width'] as const)
    .map((key) => calc(`calc.rectangle-area.inputs.${key}`))
    .join(' × ');
  const [feet = '', ...others] = first.cells;
  const [, ...otherKeys] = AREAS;
  return {
    // the formula of the first case, `Area = Length × Width = 12 ft × 14 ft`, answered below it
    lead: `${siteText(locale)('site.job.area')} = ${sizeLabel} = ${first.label}`,
    answer: calc('calc.rectangle-area.page.areaFt2', { value: feet }),
    facts: otherKeys.map((key, index) => ({
      label: calc(`calc.rectangle-area.outputs.${key}`),
      value: others[index] ?? '',
    })),
    columns: [sizeLabel, ...AREAS.map((key) => calc(`calc.rectangle-area.outputs.${key}`))],
    rows,
    calculatorName: calc('calc.rectangle-area.title'),
  };
};

/* Mulch: the bags of each size in one, two and three cubic yards. */

const mulchCatalogs = { en: createTranslator(enMulch), es: createTranslator(esMulch) };

/** The depths of the 9 × 9 ft bed of a case that hold one, two and three cubic yards. */
const YARD_DEPTHS = ['4in', '8in', '12in'] as const;

const mulchState = (raw: JobCase) => {
  const result = mulch.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

/** The whole bags of a case: the engine writes one bag line. */
const mulchBags = (raw: JobCase): string => {
  const [line] = mulch.compute(mulchState(raw)).shopping;
  if (line === undefined) throw new Error('the mulch engine returned no bag line');
  return groupedInteger(line.qty);
};

/** The volume outputs of the mulch engine, for its cubic yards and cubic feet. */
const mulchOutput = (key: 'volumeYd3' | 'volumeFt3'): OutputDescriptor => {
  const output = mulch.outputs.find((each) => each.key === key);
  if (output === undefined) throw new Error(`the mulch engine has no ${key} output`);
  return output;
};

/** The lengths of the bed of a case, in the order the calculator declares them. */
const BED = ['length', 'width', 'depth'] as const;

const mulchTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = mulchCatalogs[locale];
  const site = siteText(locale);
  const rows = mapCases(cases, (raw): JobRow => {
    const state = mulchState(raw);
    return {
      label: calc(`calc.mulch.options.bag.${state.bag}`),
      href: `${pathOf('mulch', locale)}?${encode(mulch, state, { unitSystem: 'imperial' })}`,
      cells: YARD_DEPTHS.map((depth) => mulchBags({ ...raw, depth })),
    };
  });
  const [raw] = cases;
  // the cubic yards of each column as the engine works them out, in whole yards
  const yards = {
    ...mulchOutput('volumeYd3'),
    display: { unit: 'yd3', format: 'decimal', places: 0 },
  } as const;
  const columns = YARD_DEPTHS.map(
    (depth) =>
      // the site catalog holds no placeholder: the label, then the whole cubic yards
      `${site('site.job.bagsFor')} ${outputText(yards, mulch.compute(mulchState({ ...raw, depth })).outputs.volumeYd3)} yd³`,
  );
  const { outputs } = mulch.compute(mulchState(raw));
  return {
    lead: `${BED.map((key) => calc(`calc.mulch.inputs.${key}`)).join(' × ')}: ${BED.map((key) =>
      sizeText(raw[key] ?? ''),
    ).join(' × ')}`,
    answer: `${outputText(mulchOutput('volumeFt3'), outputs.volumeFt3)} ${site('site.job.cubicFeet')}`,
    // the bags of one cubic yard, one fact per bag size
    facts: mapCases(cases, (each) => mulchState(each).bag).map((bag, index) => ({
      label: calc('calc.mulch.page.shoppingLine', { size: mulchSize(bag) }),
      value: rows[index]?.cells[0] ?? '',
    })),
    columns: [calc('calc.mulch.inputs.bag'), ...columns],
    rows,
    calculatorName: calc('calc.mulch.title'),
  };
};

const TABLES = {
  concrete: concreteTable,
  'roof-pitch': roofPitchTable,
  'rectangle-area': areaTable,
  mulch: mulchTable,
} as const satisfies Record<JobCalculator, (cases: Job['cases'], locale: Locale) => JobTable>;

/** The jobs whose page opens with a sentence of its own: square footage, slab by area, mulch. */
type IntroJobId = Extract<JobId, `square-feet-${string}` | `${string}-sq-ft` | `mulch-${string}`>;

const hasIntro = (id: JobId): id is IntroJobId =>
  JOBS[id].calculator === 'rectangle-area' ||
  JOBS[id].calculator === 'mulch' ||
  id.endsWith('-sq-ft');

/** The page of job `id` in `locale`: every figure worked out by the engine of its calculator. */
export const jobView = (id: JobId, locale: Locale): JobView => {
  const text = siteText(locale);
  const { calculator, cases } = JOBS[id];
  const table = TABLES[calculator](cases, locale);
  return {
    ...table,
    heading: text(`page.${id}.heading`),
    intro: hasIntro(id) ? text(`page.${id}.intro`) : undefined,
    note: text(`site.job.note.${calculator}`),
    cta: table.rows[0].href,
    methodology: `${pathOf('methodology', locale)}#${METHODOLOGY_ANCHOR[calculator][locale]}`,
    others: jobsOf(calculator)
      .filter((other) => other !== id)
      .map((other) => ({ href: pathOf(other, locale), title: text(`page.${other}.heading`) })),
  };
};
