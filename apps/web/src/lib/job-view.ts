import { encode, yd3, type OutputDescriptor } from '@maestro-calc/core';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { mulch } from '@maestro-calc/core/calculators/mulch';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import { topsoil } from '@maestro-calc/core/calculators/topsoil';
import type { Locale } from '@maestro-calc/i18n';
import { createTranslator } from '@maestro-calc/i18n';
import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { enDrywall } from '@maestro-calc/i18n/catalogs/en/drywall';
import { enFeetInches } from '@maestro-calc/i18n/catalogs/en/feet-inches';
import { enGravel } from '@maestro-calc/i18n/catalogs/en/gravel';
import { enMulch } from '@maestro-calc/i18n/catalogs/en/mulch';
import { enPaint } from '@maestro-calc/i18n/catalogs/en/paint';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enRoofPitch } from '@maestro-calc/i18n/catalogs/en/roof-pitch';
import { enRoofing } from '@maestro-calc/i18n/catalogs/en/roofing';
import { enTopsoil } from '@maestro-calc/i18n/catalogs/en/topsoil';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { esDrywall } from '@maestro-calc/i18n/catalogs/es/drywall';
import { esFeetInches } from '@maestro-calc/i18n/catalogs/es/feet-inches';
import { esGravel } from '@maestro-calc/i18n/catalogs/es/gravel';
import { esMulch } from '@maestro-calc/i18n/catalogs/es/mulch';
import { esPaint } from '@maestro-calc/i18n/catalogs/es/paint';
import { esRectangleArea } from '@maestro-calc/i18n/catalogs/es/rectangle-area';
import { esRoofPitch } from '@maestro-calc/i18n/catalogs/es/roof-pitch';
import { esRoofing } from '@maestro-calc/i18n/catalogs/es/roofing';
import { esTopsoil } from '@maestro-calc/i18n/catalogs/es/topsoil';
import { sizeOf as mulchSize } from '../calculator/mulch/present.ts';
import { groupedInteger, outputText, volumeText } from '../calculator/present.ts';
import { JOBS, type Job, type JobCase, type JobId } from '../routing/jobs.ts';
import { pathOf } from '../routing/routes.ts';
import { concrete } from './concrete.ts';
import { drywall } from './drywall.ts';
import { gravel } from './gravel.ts';
import { paint } from './paint.ts';
import { jobLinks } from './job-links.ts';
import { roofing } from './roofing.ts';
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
  /** The sentence that opens a job with an intro (see `hasIntro`): `page.<id>.intro`. */
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
  gravel: { en: 'gravel', es: 'grava' },
  paint: { en: 'paint', es: 'pintura' },
  drywall: { en: 'drywall', es: 'drywall' },
  topsoil: { en: 'topsoil', es: 'tierra-para-jardin' },
  roofing: { en: 'roofing', es: 'tejas' },
  'feet-inches': { en: 'feet-and-inches', es: 'pies-y-pulgadas' },
} as const satisfies Record<JobCalculator, Record<Locale, string>>;

/** `10ft` as `10 ft`, `7.5in` as `7.5 in`: the sizes read the same in both languages. */
const sizeText = (value: string): string => value.replace(/^(\d+(?:\.\d+)?)(ft|in)$/, '$1 $2');

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

/** An output of an engine by its key: a key the engine does not declare is a programming error. */
const outputOf = (
  outputs: readonly OutputDescriptor[],
  key: string,
  name: string,
): OutputDescriptor => {
  const output = outputs.find((each) => each.key === key);
  if (output === undefined) throw new Error(`the ${name} engine has no ${key} output`);
  return output;
};

/** The sizes of a case, `12 ft × 12 ft × 8 ft`, in the order `keys` names them. */
const sizesOf = (raw: JobCase, keys: readonly string[]): string =>
  keys.map((key) => sizeText(raw[key] ?? '')).join(' × ');

/* Gravel: the tons, the cubic yards to order and the metric tonnes of a driveway at each depth. */

const gravelCatalogs = { en: createTranslator(enGravel), es: createTranslator(esGravel) };

/** The figures of a gravel row, in the order of its columns: the tons first, as the page answers. */
const GRAVEL = ['tons', 'orderYd3', 'tonnes'] as const;

const GRAVEL_SIZES = ['length', 'width', 'depth'] as const;

const gravelState = (raw: JobCase) => {
  const result = gravel.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

const gravelTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = gravelCatalogs[locale];
  const rows = mapCases(cases, (raw): JobRow => {
    const state = gravelState(raw);
    const { outputs } = gravel.compute(state);
    return {
      label: sizesOf(raw, GRAVEL_SIZES),
      href: `${pathOf('gravel', locale)}?${encode(gravel, state, { unitSystem: 'imperial' })}`,
      cells: GRAVEL.map((key) => outputText(outputOf(gravel.outputs, key, 'gravel'), outputs[key])),
    };
  });
  const [first] = rows;
  const sizeLabel = GRAVEL_SIZES.map((key) => calc(`calc.gravel.inputs.${key}`)).join(' × ');
  const [tons = '', ...others] = first.cells;
  const [, ...otherKeys] = GRAVEL;
  return {
    lead: `${sizeLabel}: ${first.label}`,
    answer: calc('calc.gravel.page.tons', { value: tons }),
    facts: otherKeys.map((key, index) => ({
      label: calc(`calc.gravel.outputs.${key}`),
      value: others[index] ?? '',
    })),
    columns: [sizeLabel, ...GRAVEL.map((key) => calc(`calc.gravel.outputs.${key}`))],
    rows,
    calculatorName: calc('calc.gravel.title'),
  };
};

/* Paint and drywall: a room by its length, its width and the height of its walls. */

const ROOM_SIZES = ['length', 'width', 'height'] as const;

/** The whole units of a shopping line of `materialId`: a line the engine omits is an error. */
const shoppingQty = (
  shopping: readonly { readonly materialId: string; readonly qty: bigint }[],
  materialId: string,
): string => {
  const line = shopping.find((each) => each.materialId === materialId);
  if (line === undefined) throw new Error(`the engine returned no ${materialId} line`);
  return groupedInteger(line.qty);
};

const paintCatalogs = { en: createTranslator(enPaint), es: createTranslator(esPaint) };

const paintState = (raw: JobCase) => {
  const result = paint.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

const paintTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = paintCatalogs[locale];
  const gallons = outputOf(paint.outputs, 'gallons', 'paint');
  const area = outputOf(paint.outputs, 'paintArea', 'paint');
  const rows = mapCases(cases, (raw): JobRow => {
    const state = paintState(raw);
    const { outputs, shopping } = paint.compute(state);
    return {
      label: sizesOf(raw, ROOM_SIZES),
      href: `${pathOf('paint', locale)}?${encode(paint, state, { unitSystem: 'imperial' })}`,
      cells: [
        outputText(gallons, outputs.gallons),
        shoppingQty(shopping, 'paint'),
        outputText(area, outputs.paintArea),
      ],
    };
  });
  const [first] = rows;
  const sizeLabel = ROOM_SIZES.map((key) => calc(`calc.paint.inputs.${key}`)).join(' × ');
  const [value = '', cans = '', painted = ''] = first.cells;
  return {
    lead: `${sizeLabel}: ${first.label}`,
    answer: calc('calc.paint.page.gallons', { value }),
    facts: [
      { label: calc('calc.paint.page.shoppingLine'), value: cans },
      { label: calc('calc.paint.outputs.paintArea'), value: painted },
    ],
    columns: [
      sizeLabel,
      calc('calc.paint.outputs.gallons'),
      calc('calc.paint.page.shoppingLine'),
      calc('calc.paint.outputs.paintArea'),
    ],
    rows,
    calculatorName: calc('calc.paint.title'),
  };
};

const drywallCatalogs = { en: createTranslator(enDrywall), es: createTranslator(esDrywall) };

/** The panel sizes of the table, the calculator's default first. */
const SHEETS = ['4x8', '4x12'] as const;

const drywallState = (raw: JobCase) => {
  const result = drywall.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

const drywallTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = drywallCatalogs[locale];
  const area = outputOf(drywall.outputs, 'areaFt2', 'drywall');
  const sheetsOf = (raw: JobCase): string[] =>
    SHEETS.map((sheet) =>
      shoppingQty(drywall.compute(drywallState({ ...raw, sheet })).shopping, 'drywall'),
    );
  const rows = mapCases(cases, (raw): JobRow => {
    const state = drywallState(raw);
    return {
      label: sizesOf(raw, ROOM_SIZES),
      href: `${pathOf('drywall', locale)}?${encode(drywall, state, { unitSystem: 'imperial' })}`,
      cells: [outputText(area, drywall.compute(state).outputs.areaFt2), ...sheetsOf(raw)],
    };
  });
  const [first] = rows;
  const [raw] = cases;
  const { shopping } = drywall.compute(drywallState(raw));
  const sizeLabel = ROOM_SIZES.map((key) => calc(`calc.drywall.inputs.${key}`)).join(' × ');
  const sheetLabels = SHEETS.map((sheet) =>
    calc('calc.drywall.page.shoppingSheets', { size: calc(`calc.drywall.options.sheet.${sheet}`) }),
  );
  const [covered = '', small = '', large = ''] = first.cells;
  return {
    lead: `${sizeLabel}: ${first.label}`,
    // the site catalog holds no placeholder: the count, the words, then the size of the sheet
    answer: `${small} ${siteText(locale)('site.job.sheetsOf')} ${calc('calc.drywall.options.sheet.4x8')}`,
    facts: [
      { label: sheetLabels[1] ?? '', value: large },
      { label: calc('calc.drywall.outputs.areaFt2'), value: covered },
      {
        label: calc('calc.drywall.page.shoppingCompound'),
        value: shoppingQty(shopping, 'joint-compound'),
      },
      { label: calc('calc.drywall.page.shoppingTape'), value: shoppingQty(shopping, 'joint-tape') },
    ],
    columns: [sizeLabel, calc('calc.drywall.outputs.areaFt2'), ...sheetLabels],
    rows,
    calculatorName: calc('calc.drywall.title'),
  };
};

/* Topsoil: the cubic yards, the cubic feet and the bags of a bed or an area at each depth. */

const topsoilCatalogs = { en: createTranslator(enTopsoil), es: createTranslator(esTopsoil) };

/** The bag sizes of the table (the select's option ids), the calculator's default first. */
const SOIL_BAGS = ['0-75', '1-5'] as const;

const SOIL_SIZES = ['length', 'width', 'depth'] as const;

const topsoilState = (raw: JobCase) => {
  const result = topsoil.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

const topsoilTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = topsoilCatalogs[locale];
  const yards = outputOf(topsoil.outputs, 'volumeYd3', 'topsoil');
  const feet = outputOf(topsoil.outputs, 'volumeFt3', 'topsoil');
  const rows = mapCases(cases, (raw): JobRow => {
    const state = topsoilState(raw);
    const { outputs } = topsoil.compute(state);
    return {
      label: sizesOf(raw, SOIL_SIZES),
      href: `${pathOf('topsoil', locale)}?${encode(topsoil, state, { unitSystem: 'imperial' })}`,
      cells: [
        outputText(yards, outputs.volumeYd3),
        outputText(feet, outputs.volumeFt3),
        ...SOIL_BAGS.map((bag) =>
          shoppingQty(topsoil.compute(topsoilState({ ...raw, bag })).shopping, 'topsoil'),
        ),
      ],
    };
  });
  const [first] = rows;
  const sizeLabel = SOIL_SIZES.map((key) => calc(`calc.topsoil.inputs.${key}`)).join(' × ');
  // `0-75` is 0.75 cu ft: the option id with its dot
  const bagLabels = SOIL_BAGS.map((bag) =>
    calc('calc.topsoil.page.shoppingLine', { size: bag.replace('-', '.') }),
  );
  const [volume = '', cubicFeet = '', ...bags] = first.cells;
  return {
    lead: `${sizeLabel}: ${first.label}`,
    answer: calc('calc.topsoil.page.volumeYd3', { value: volume }),
    facts: [
      { label: calc('calc.topsoil.outputs.volumeFt3'), value: cubicFeet },
      ...bagLabels.map((label, index) => ({ label, value: bags[index] ?? '' })),
    ],
    columns: [
      sizeLabel,
      calc('calc.topsoil.outputs.volumeYd3'),
      calc('calc.topsoil.outputs.volumeFt3'),
      ...bagLabels,
    ],
    rows,
    calculatorName: calc('calc.topsoil.title'),
  };
};

/* Roofing: the squares, the square feet, the bundles and the rolls of a footprint at each pitch. */

const roofingCatalogs = { en: createTranslator(enRoofing), es: createTranslator(esRoofing) };

const roofingState = (raw: JobCase) => {
  const result = roofing.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

const roofingTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = roofingCatalogs[locale];
  const squares = outputOf(roofing.outputs, 'squares', 'roofing');
  const area = outputOf(roofing.outputs, 'areaFt2', 'roofing');
  const rows = mapCases(cases, (raw): JobRow => {
    const state = roofingState(raw);
    const { outputs, shopping } = roofing.compute(state);
    return {
      label: calc('calc.roofing.page.drawing.note', { pitch: raw['pitch'] ?? '' }),
      href: `${pathOf('roofing', locale)}?${encode(roofing, state, { unitSystem: 'imperial' })}`,
      cells: [
        outputText(squares, outputs.squares),
        outputText(area, outputs.areaFt2),
        shoppingQty(shopping, 'shingles'),
        shoppingQty(shopping, 'underlayment'),
      ],
    };
  });
  const [first] = rows;
  const [raw] = cases;
  const [value = '', feet = '', bundles = '', rolls = ''] = first.cells;
  return {
    lead: (['length', 'width', 'pitch'] as const)
      .map((key) => `${calc(`calc.roofing.inputs.${key}`)}: ${sizeText(raw[key] ?? '')}`)
      .join(', '),
    answer: calc('calc.roofing.page.squares', { value }),
    facts: [
      { label: calc('calc.roofing.page.shoppingShingles'), value: bundles },
      { label: calc('calc.roofing.page.shoppingUnderlayment'), value: rolls },
      { label: calc('calc.roofing.outputs.areaFt2'), value: feet },
    ],
    columns: [
      calc('calc.roofing.inputs.pitch'),
      calc('calc.roofing.outputs.squares'),
      calc('calc.roofing.outputs.areaFt2'),
      calc('calc.roofing.page.shoppingShingles'),
      calc('calc.roofing.page.shoppingUnderlayment'),
    ],
    rows,
    calculatorName: calc('calc.roofing.title'),
  };
};

/* Feet and inches: a tape measurement divided into equal parts, on the tape and in feet and inches. */

const feetInchesCatalogs = {
  en: createTranslator(enFeetInches),
  es: createTranslator(esFeetInches),
};

const feetInchesState = (raw: JobCase) => {
  const result = feetInches.validate(raw);
  if (!result.ok) throw new Error(`invalid job case: ${JSON.stringify(raw)}`);
  return result.value;
};

/**
 * The figures of a division, in the order of its columns: the result on the tape (inches alone, to
 * the nearest 1/16 in, the result output shown in inches), then the outputs as the calculator shows
 * them.
 */
const divisionCells = (raw: JobCase): string[] => {
  const { outputs } = feetInches.compute(feetInchesState(raw));
  const result = outputOf(feetInches.outputs, 'result', 'feet and inches');
  return [
    outputText(
      { ...result, display: { unit: 'in', format: 'fraction', denominator: 16 } },
      outputs.result,
    ),
    outputText(result, outputs.result),
    outputText(outputOf(feetInches.outputs, 'resultIn', 'feet and inches'), outputs.resultIn),
    outputText(outputOf(feetInches.outputs, 'resultM', 'feet and inches'), outputs.resultM),
  ];
};

const feetInchesTable = (cases: Job['cases'], locale: Locale): JobTable => {
  const calc = feetInchesCatalogs[locale];
  const rows = mapCases(cases, (raw): JobRow => {
    const state = feetInchesState(raw);
    return {
      label: `÷ ${String(state.factor)}`,
      href: `${pathOf('feet-inches', locale)}?${encode(feetInches, state, { unitSystem: 'imperial' })}`,
      cells: divisionCells(raw),
    };
  });
  const [raw] = cases;
  const first = raw['first'] ?? '';
  const factor = raw['factor'] ?? '';
  const [tape = '', feetAndInches = '', inches = '', meters = ''] = rows[0].cells;
  // a length typed in feet is answered in feet and inches, one typed in inches on the tape
  const inFeet = first.includes('ft');
  const tapeLabel = siteText(locale)('site.job.tape');
  return {
    lead: `${calc('calc.feet-inches.inputs.first')}: ${first} ÷ ${factor}`,
    answer: calc('calc.feet-inches.page.answer.divide', {
      first,
      factor,
      result: inFeet ? feetAndInches : tape,
    }),
    facts: [
      inFeet
        ? { label: tapeLabel, value: tape }
        : { label: calc('calc.feet-inches.outputs.result'), value: feetAndInches },
      { label: calc('calc.feet-inches.outputs.resultIn'), value: inches },
      { label: calc('calc.feet-inches.outputs.resultM'), value: meters },
    ],
    columns: [
      calc('calc.feet-inches.inputs.factor'),
      tapeLabel,
      calc('calc.feet-inches.outputs.result'),
      calc('calc.feet-inches.outputs.resultIn'),
      calc('calc.feet-inches.outputs.resultM'),
    ],
    rows,
    calculatorName: calc('calc.feet-inches.title'),
  };
};

const TABLES = {
  concrete: concreteTable,
  'roof-pitch': roofPitchTable,
  'rectangle-area': areaTable,
  mulch: mulchTable,
  gravel: gravelTable,
  paint: paintTable,
  drywall: drywallTable,
  topsoil: topsoilTable,
  roofing: roofingTable,
  'feet-inches': feetInchesTable,
} as const satisfies Record<JobCalculator, (cases: Job['cases'], locale: Locale) => JobTable>;

/**
 * The jobs whose page opens with a sentence of its own: square footage, slab by area, mulch, and
 * the gravel, paint, drywall, topsoil and roofing jobs.
 */
type IntroJobId = Extract<
  JobId,
  | `square-feet-${string}`
  | `${string}-sq-ft`
  | `mulch-${string}`
  | `gravel-${string}`
  | `paint-${string}`
  | `drywall-${string}`
  | `topsoil-${string}`
  | `roofing-${string}`
>;

/** The calculators whose every job opens with its own sentence. */
const INTRO_CALCULATORS: readonly JobCalculator[] = [
  'rectangle-area',
  'mulch',
  'gravel',
  'paint',
  'drywall',
  'topsoil',
  'roofing',
];

const hasIntro = (id: JobId): id is IntroJobId =>
  INTRO_CALCULATORS.includes(JOBS[id].calculator) || id.endsWith('-sq-ft');

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
    others: jobLinks(calculator, locale, id),
  };
};
