import { PATHS } from '../pay-converter/texts.ts';
import { SITE } from '../site.config.ts';
import type { Lang } from '../time-card/receipt.ts';
import {
  MINIMUM_WAGE_2027_GUIDE_PATHS,
  MINIMUM_WAGE_STATES_GUIDE_PATHS,
  TIPPED_STATES_GUIDE_PATHS,
} from './paths.ts';
import type { GuideSection, GuideSource } from './texts.ts';
import { centsText, TIPPED_STATES, TIPPED_STATES_SOURCES } from './tipped-states.ts';

export { MINIMUM_WAGE_STATES_GUIDE_PATHS } from './paths.ts';

/** The federal minimum wage under the FLSA, in cents an hour. */
export const FEDERAL_MINIMUM_WAGE = 725;

/** A source with the short name a table cell links it by. */
interface ShortSource extends GuideSource {
  readonly short: string;
}

/** The government source of each row and of each rate of January 1, 2027. */
export const MINIMUM_WAGE_STATES_SOURCES = {
  dol: {
    label:
      'U.S. Department of Labor, State Minimum Wage Laws (updated July 1, 2026; Michigan: $15.00 scheduled for January 1, 2027)',
    href: 'https://www.dol.gov/agencies/whd/minimum-wage/state',
    short: 'U.S. DOL',
  },
  fl: { ...TIPPED_STATES_SOURCES.fl, short: 'Florida Constitution' },
  ca: {
    label:
      'California Department of Industrial Relations, minimum wage set to increase to $17.40 on January 1, 2027',
    href: 'https://www.dir.ca.gov/DIRNews/2026/2026-66.html',
    short: 'California DIR',
  },
  ct: {
    label:
      'Connecticut Department of Labor, press room 2026: minimum wage of $17.48 on January 1, 2027',
    href: 'https://portal.ct.gov/dol/communications/press-room/2026',
    short: 'Connecticut DOL',
  },
  mn: {
    label:
      'Minnesota Department of Labor and Industry, minimum wage adjusted for inflation as of January 1, 2027',
    href: 'https://www.dli.mn.gov/business/employment-practices/minimum-wage-minnesota',
    short: 'Minnesota DLI',
  },
  mt: {
    label: 'Montana Department of Labor and Industry, State minimum wage (effective 1/1/2027)',
    href: 'https://erd.dli.mt.gov/labor-standards/state-minimum-wage',
    short: 'Montana DLI',
  },
  ny: {
    label:
      'New York State Department of Labor, Minimum Wage: on January 1, 2027, the minimum wage will stay the same',
    href: 'https://dol.ny.gov/minimum-wage-0',
    short: 'New York DOL',
  },
  oh: {
    label: 'Ohio Department of Commerce, State of Ohio 2027 Minimum Wage poster (rev. 9/30/26)',
    href: 'https://dam.assets.ohio.gov/image/upload/com.ohio.gov/DICO/WageAndHour/2027_Minumum_Wage_Poster.pdf',
    short: 'Ohio Commerce',
  },
  nj: {
    label:
      'New Jersey Department of Labor and Workforce Development, minimum wage on January 1, 2027 (September 29, 2026)',
    href: 'https://www.nj.gov/labor/lwdhome/press/2026/20260929_min_wage.shtml',
    short: 'New Jersey LWD',
  },
  sd: {
    label: 'South Dakota Department of Labor and Regulation, minimum wage effective Jan. 1, 2027',
    href: 'https://dlr.sd.gov/employment_laws/minimum_wage.aspx',
    short: 'South Dakota DLR',
  },
  va: {
    label:
      'Virginia Department of Labor and Industry, Payment of Wage: minimum wage beginning January 1, 2027',
    href: 'https://doli.virginia.gov/programs/labor-law/payment-of-wage/',
    short: 'Virginia DOLI',
  },
  wa: {
    label: 'Washington State Department of Labor & Industries, minimum wage for 2027',
    href: 'https://lni.wa.gov/workers-rights/wages/minimum-wage/',
    short: 'Washington L&I',
  },
} as const satisfies Readonly<Record<string, ShortSource>>;

type SourceKey = keyof typeof MINIMUM_WAGE_STATES_SOURCES;
type Words = Readonly<Record<Lang, string>>;

/** One state's minimum wage, in cents an hour. */
export interface MinimumWageState {
  readonly name: Words;
  /** The minimum the employer pays: the state's rate, or the federal one where it is higher. */
  readonly wage: number;
  /** True when the federal $7.25 applies: the state has no minimum wage law or a lower one. */
  readonly federal: boolean;
  /** The state's own rate where it is lower than the federal one. */
  readonly stateRate?: number;
  readonly notes?: Words;
  readonly source: SourceKey;
  /** The rate of January 1, 2027, where the DOL table or the state's own page states it. */
  readonly scheduled?: {
    readonly wage: number;
    readonly notes?: Words;
    readonly source: SourceKey;
  };
}

/** What this table adds to a row of the tipped table; `notes: 'tipped'` keeps that table's note. */
interface Extra {
  readonly federal?: true;
  readonly stateRate?: number;
  readonly notes?: Words | 'tipped';
  readonly source?: SourceKey;
  readonly scheduled?: MinimumWageState['scheduled'];
}

const NO_STATE_LAW: Words = {
  en: 'No state minimum wage law: employers covered by the FLSA pay the federal $7.25.',
  es: 'No hay ley estatal de salario mínimo: los empleadores cubiertos por la FLSA pagan el salario mínimo federal de $7.25.',
};
const employers = (count: number, rest: Words = { en: '', es: '' }): Words => ({
  en: `Employers of ${String(count)} or more employees${rest.en}.`,
  es: `Empleadores de ${String(count)} o más empleados${rest.es}.`,
});
const lower = (rate: number, scope: Words): Words => ({
  en: `The state rate, ${centsText(rate)}, ${scope.en}; employers covered by the FLSA pay the federal $7.25.`,
  es: `La tarifa estatal, ${centsText(rate)}, ${scope.es}; los empleadores cubiertos por la FLSA pagan el salario mínimo federal de $7.25.`,
});
const scheduled = (wage: number, source: SourceKey, notes?: Words): Extra['scheduled'] => ({
  wage,
  source,
  ...(notes === undefined ? {} : { notes }),
});

/**
 * What a minimum wage reader needs beyond the tipped table, from the DOL table "State Minimum Wage
 * Laws" (updated July 1, 2026): where the federal rate applies, the regional and employer-size
 * rates it names, and the rates of January 1, 2027 that the DOL table or the state's labor
 * department states. A state with no entry is a state law rate with no note.
 */
const EXTRA: Readonly<Record<string, Extra>> = {
  Alabama: { federal: true, notes: NO_STATE_LAW },
  Arkansas: { notes: employers(4) },
  California: { scheduled: scheduled(1740, 'ca') },
  Connecticut: { scheduled: scheduled(1748, 'ct') },
  Florida: {
    notes: {
      en: 'Since September 30, 2026, under the state constitution; the DOL table still shows the earlier $14.00.',
      es: 'Desde el 30 de septiembre de 2026, según la constitución del estado; la tabla del DOL aún muestra los $14.00 anteriores.',
    },
    source: 'fl',
  },
  Georgia: {
    federal: true,
    stateRate: 515,
    notes: lower(515, {
      en: 'applies to employers of 6 or more employees',
      es: 'se aplica a empleadores de 6 o más empleados',
    }),
  },
  Illinois: {
    notes: employers(4, { en: ', excluding family members', es: ', sin contar familiares' }),
  },
  Indiana: { notes: employers(2) },
  Kansas: { notes: 'tipped' },
  Louisiana: { federal: true, notes: NO_STATE_LAW },
  Michigan: { notes: employers(2), scheduled: scheduled(1500, 'dol') },
  Minnesota: { scheduled: scheduled(1187, 'mn') },
  Mississippi: { federal: true, notes: NO_STATE_LAW },
  Missouri: {
    notes: {
      en: 'Retail and service businesses with gross annual sales under $500,000 are exempt.',
      es: 'Los negocios de comercio y servicios con ventas brutas anuales de menos de $500,000 están exentos.',
    },
  },
  Montana: { notes: 'tipped', scheduled: scheduled(1120, 'mt') },
  Nebraska: { notes: employers(4) },
  'New Jersey': {
    notes: 'tipped',
    scheduled: scheduled(1648, 'nj', {
      en: 'Seasonal and small employers (fewer than 6 employees): $16.25.',
      es: 'Empleadores de temporada y pequeños (menos de 6 empleados): $16.25.',
    }),
  },
  'New York': {
    notes: {
      en: 'New York City, Long Island and Westchester. Rest of the state: $16.00.',
      es: 'Ciudad de Nueva York, Long Island y Westchester. Resto del estado: $16.00.',
    },
  },
  Ohio: {
    notes: 'tipped',
    scheduled: scheduled(1140, 'oh', {
      en: 'Employers grossing $419,000 or more a year; smaller employers and employees under 16: the federal $7.25.',
      es: 'Empleadores con ingresos brutos de $419,000 o más al año; empleadores más pequeños y empleados menores de 16 años: el federal de $7.25.',
    }),
  },
  Oklahoma: {
    notes: {
      en: 'Employers with 10 or more full-time employees at one location or gross sales over $100,000; other employers: $2.00. State law excludes employment covered by the FLSA.',
      es: 'Empleadores con 10 o más empleados de tiempo completo en un lugar o ventas brutas de más de $100,000; otros empleadores: $2.00. La ley estatal excluye el empleo cubierto por la FLSA.',
    },
  },
  Oregon: { notes: 'tipped' },
  'South Carolina': { federal: true, notes: NO_STATE_LAW },
  'South Dakota': { scheduled: scheduled(1230, 'sd') },
  Tennessee: { federal: true, notes: NO_STATE_LAW },
  Texas: { notes: 'tipped' },
  Utah: { notes: 'tipped' },
  Vermont: { notes: employers(2) },
  Virginia: { scheduled: scheduled(1375, 'va') },
  Washington: { scheduled: scheduled(1773, 'wa') },
  'West Virginia': {
    notes: employers(6, { en: ' at one location', es: ' en un mismo lugar' }),
  },
  Wyoming: {
    federal: true,
    stateRate: 515,
    notes: lower(515, { en: 'is below the federal rate', es: 'es menor que la federal' }),
  },
};

const unknown = Object.keys(EXTRA).filter(
  (name) => !TIPPED_STATES.some((state) => state.name.en === name),
);
if (unknown.length > 0) throw new Error(`no tipped row for ${unknown.join(', ')}`);

/**
 * The 50 states and DC. The names and the rates are the tipped table's full minimum wage
 * (`TIPPED_STATES`), the one copy of the figures: it already gives the federal $7.25 where the
 * state has no law or a lower rate.
 */
export const MINIMUM_WAGE_STATES: readonly MinimumWageState[] = TIPPED_STATES.map((state) => {
  const {
    federal = false,
    stateRate,
    notes,
    source = 'dol',
    scheduled: next,
  } = EXTRA[state.name.en] ?? {};
  const words = notes === 'tipped' ? state.notes : notes;
  return {
    name: state.name,
    wage: state.minimum,
    federal,
    ...(stateRate === undefined ? {} : { stateRate }),
    ...(words === undefined ? {} : { notes: words }),
    source,
    ...(next === undefined ? {} : { scheduled: next }),
  };
});

/**
 * States whose rate adjusts on January 1 by a formula and whose labor department says it stays the
 * same in 2027: New York, where an off-ramp of the indexing law was met.
 */
export const UNCHANGED_2027: readonly { readonly state: string; readonly source: SourceKey }[] = [
  { state: 'New York', source: 'ny' },
];

/** Why a state is on the unconfirmed list: the state's own pages refused our request. */
const refused = (agency: Words): Words => ({
  en: `The pages of ${agency.en} refused our request, so we could not read the 2027 rate.`,
  es: `Las páginas ${agency.es} rechazaron nuestra consulta, así que no pudimos leer la tarifa de 2027.`,
});

/**
 * States whose rate changes on January 1, 2027 under a law, `law` naming it, but whose 2027 rate
 * no primary source we could read gives: `unread` says why. Each names the agency to check; a rate
 * moves to `scheduled` once one is read.
 */
export const UNCONFIRMED_2027: readonly {
  readonly state: string;
  readonly law: Words;
  readonly unread: Words;
  readonly check: { readonly label: string; readonly href: string };
}[] = [
  {
    state: 'Arizona',
    law: {
      en: 'Rises each January 1 by inflation (A.R.S. § 23-363).',
      es: 'Sube cada 1 de enero según la inflación (A.R.S. § 23-363).',
    },
    unread: refused({
      en: 'the Industrial Commission of Arizona',
      es: 'de la Industrial Commission of Arizona',
    }),
    check: { label: 'Industrial Commission of Arizona', href: 'https://www.azica.gov/' },
  },
  {
    state: 'Colorado',
    law: {
      en: 'Adjusted each January 1 for inflation (Colorado Constitution, art. XVIII, § 15).',
      es: 'Se ajusta cada 1 de enero por inflación (Constitución de Colorado, art. XVIII, § 15).',
    },
    unread: {
      en: 'Colorado sets the new rate each year in a PAY CALC Order; the Code of Colorado Regulations, read on November 6, 2026, still holds the 2026 PAY CALC Order (7 CCR 1103-14), and the pages of the Colorado Department of Labor and Employment refused our request.',
      es: 'Colorado fija la nueva tarifa cada año en una PAY CALC Order; el Code of Colorado Regulations, que leímos el 6 de noviembre de 2026, aún tiene la 2026 PAY CALC Order (7 CCR 1103-14), y las páginas del Departamento de Trabajo y Empleo de Colorado rechazaron nuestra consulta.',
    },
    check: {
      label: 'Colorado Department of Labor and Employment',
      href: 'https://cdle.colorado.gov/',
    },
  },
  {
    state: 'Maine',
    law: {
      en: 'Rises each January 1 by inflation (26 M.R.S. § 664).',
      es: 'Sube cada 1 de enero según la inflación (26 M.R.S. § 664).',
    },
    unread: refused({
      en: 'the Maine Department of Labor',
      es: 'del Departamento de Trabajo de Maine',
    }),
    check: { label: 'Maine Department of Labor', href: 'https://www.maine.gov/labor/' },
  },
  {
    state: 'Nebraska',
    law: {
      en: 'Rises each January 1 from 2027 under state law (Neb. Rev. Stat. § 48-1203).',
      es: 'Sube cada 1 de enero desde 2027 según la ley del estado (Neb. Rev. Stat. § 48-1203).',
    },
    unread: refused({
      en: 'the Nebraska Legislature and Department of Labor',
      es: 'de la Legislatura y del Departamento de Trabajo de Nebraska',
    }),
    check: { label: 'Nebraska Department of Labor', href: 'https://dol.nebraska.gov/' },
  },
  {
    state: 'Rhode Island',
    law: {
      en: 'A state law signed in 2025 raises it on January 1, 2027 (R.I. Gen. Laws § 28-12-3).',
      es: 'Una ley del estado firmada en 2025 la sube el 1 de enero de 2027 (R.I. Gen. Laws § 28-12-3).',
    },
    unread: refused({
      en: 'the Rhode Island General Assembly and Department of Labor and Training',
      es: 'de la Asamblea General y del Departamento de Trabajo y Capacitación de Rhode Island',
    }),
    check: { label: 'Rhode Island Department of Labor and Training', href: 'https://dlt.ri.gov/' },
  },
  {
    state: 'Vermont',
    law: {
      en: 'Rises each January 1 by inflation or 5%, whichever is smaller (21 V.S.A. § 384).',
      es: 'Sube cada 1 de enero según la inflación o 5%, lo que sea menor (21 V.S.A. § 384).',
    },
    unread: {
      en: 'The minimum wage page of the Vermont Department of Labor, read on November 6, 2026, gives the $14.42 of January 1, 2026 and no 2027 rate.',
      es: 'La página de salario mínimo del Departamento de Trabajo de Vermont, que leímos el 6 de noviembre de 2026, da los $14.42 del 1 de enero de 2026 y ninguna tarifa de 2027.',
    },
    check: {
      label: 'Vermont Department of Labor, Rights and Wages',
      href: 'https://labor.vermont.gov/rights-and-wages',
    },
  },
];

const BASIS: Readonly<
  Record<Lang, { state: string; same: string; noLaw: string; lower: (rate: string) => string }>
> = {
  en: {
    state: 'State law',
    same: 'State law, same as federal',
    noLaw: 'Federal: no state law',
    lower: (rate) => `Federal: the state’s ${rate} is lower`,
  },
  es: {
    state: 'Ley estatal',
    same: 'Ley estatal, igual a la federal',
    noLaw: 'Federal: no hay ley estatal',
    lower: (rate) => `Federal: el estatal de ${rate} es menor`,
  },
};

const basisOf = (row: MinimumWageState, lang: Lang): string => {
  const words = BASIS[lang];
  if (row.federal) {
    return row.stateRate === undefined ? words.noLaw : words.lower(centsText(row.stateRate));
  }
  return row.wage === FEDERAL_MINIMUM_WAGE ? words.same : words.state;
};

/** The rows of the table in `lang`, sorted by the state's name in that language. */
export const minimumWageRowsOf = (
  lang: Lang,
): readonly {
  readonly name: string;
  readonly wage: string;
  readonly basis: string;
  readonly scheduled:
    | {
        readonly wage: string;
        readonly notes: string | undefined;
        readonly source: ShortSource;
      }
    | undefined;
  readonly notes: string | undefined;
}[] =>
  [...MINIMUM_WAGE_STATES]
    .sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang))
    .map((row) => ({
      name: row.name[lang],
      wage: centsText(row.wage),
      basis: basisOf(row, lang),
      scheduled:
        row.scheduled === undefined
          ? undefined
          : {
              wage: centsText(row.scheduled.wage),
              notes: row.scheduled.notes?.[lang],
              source: MINIMUM_WAGE_STATES_SOURCES[row.scheduled.source],
            },
      notes: row.notes?.[lang],
    }));

const above = MINIMUM_WAGE_STATES.filter(({ wage }) => wage > FEDERAL_MINIMUM_WAGE).length;
const federalOnly = MINIMUM_WAGE_STATES.filter(({ federal }) => federal).length;
const changing = MINIMUM_WAGE_STATES.filter(({ scheduled: next }) => next !== undefined).length;
const highest = MINIMUM_WAGE_STATES.reduce((top, row) => (row.wage > top.wage ? row : top));

export interface MinimumWageStatesTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  /** The answer, first: the federal rate and what the states do, counted from the table. */
  readonly lead: string;
  /** Where the figures come from and the date they were checked. */
  readonly asOf: string;
  readonly table: {
    readonly caption: string;
    readonly state: string;
    readonly wage: string;
    readonly basis: string;
    readonly scheduled: string;
    /** The word after a rate of January 1, 2027. */
    readonly scheduledTag: string;
    readonly notes: string;
    /** The January 1, 2027 cell of a state for which no primary source read gives a new rate. */
    readonly none: string;
  };
  readonly sections: readonly GuideSection[];
  readonly cite: { readonly heading: string; readonly text: string };
  readonly sourcesLabel: string;
  readonly disclaimer: string;
  readonly reviewed: string;
  readonly ctas: readonly { readonly label: string; readonly href: string }[];
  /** The text of the link other pages give to this page. */
  readonly linkLabel: string;
}

const url = (lang: Lang): string => `${SITE.origin}${MINIMUM_WAGE_STATES_GUIDE_PATHS[lang]}`;
const DOL_MINIMUM_WAGE: GuideSource = {
  label: 'U.S. Department of Labor, Minimum Wage',
  href: 'https://www.dol.gov/general/topic/wages/minimumwage',
};
const DOL_TABLE: GuideSource = {
  label: MINIMUM_WAGE_STATES_SOURCES.dol.label,
  href: MINIMUM_WAGE_STATES_SOURCES.dol.href,
};

export const MINIMUM_WAGE_STATES_GUIDE: Readonly<Record<Lang, MinimumWageStatesTexts>> = {
  en: {
    title: 'Minimum Wage by State, 2026 | Cuenta Horas',
    description:
      'The minimum wage in all 50 states and DC, where the federal $7.25 applies, and the January 1, 2027 rates states announced, from the Department of Labor.',
    kicker: 'Hourly pay · data',
    h1: 'Minimum wage by state, 2026',
    lead: `The federal minimum wage is $7.25 an hour. ${String(above)} of the 50 states and DC set a higher rate, ${String(federalOnly)} states pay the federal $7.25 because they have no minimum wage law or a lower one, and the highest rate is ${centsText(highest.wage)} in the ${highest.name.en}.`,
    asOf: `Rates from the U.S. Department of Labor table “State Minimum Wage Laws”, updated July 1, 2026; Florida from Article X, Section 24 of the Florida Constitution ($15.00 since September 30, 2026). The January 1, 2027 rate is shown for ${String(changing)} states, only where the DOL table or the state’s own agency states it. Some cities and counties set higher minimum wages; the DOL table does not list them, and neither does this one. Checked November 6, 2026.`,
    table: {
      caption: 'Minimum wage by state, per hour',
      state: 'State',
      wage: 'Minimum wage',
      basis: 'Set by',
      scheduled: 'January 1, 2027',
      scheduledTag: 'scheduled',
      notes: 'Notes',
      none: 'Not listed',
    },
    sections: [
      {
        id: 'how-to-read',
        heading: 'How to read the table',
        paragraphs: [
          'The minimum wage is the least the employer may pay you for each hour. When both the state and the federal law cover you, you are entitled to the higher of the two; where the state has no minimum wage law, or one below $7.25, the table shows the federal $7.25 and says why.',
          'Some states set other rates by region or by the size of the employer: the notes give the ones the DOL table names. A rate under January 1, 2027 is scheduled, not yet in force; a state with no rate there may still change on that date, so check its labor department.',
        ],
        sources: [DOL_MINIMUM_WAGE, DOL_TABLE],
      },
    ],
    cite: {
      heading: 'Cite this table',
      text: `Cuenta Horas, “Minimum wage by state, 2026”, ${url('en')} (data: U.S. Department of Labor, as of July 1, 2026; January 1, 2027 rates from the state labor departments).`,
    },
    sourcesLabel: 'Sources',
    disclaimer:
      'A summary of what these agencies publish, not legal advice. Rates change, often on January 1 or July 1: check your state’s labor department and your city.',
    reviewed: 'Checked against the Department of Labor and state pages on November 6, 2026.',
    ctas: [
      { label: 'Turn an hourly wage into a salary', href: PATHS.hourly.en },
      { label: 'Turn a salary into an hourly rate', href: PATHS.salary.en },
      { label: 'Tipped minimum wage by state, 2026', href: TIPPED_STATES_GUIDE_PATHS.en },
      {
        label: 'Minimum wage increases on January 1, 2027',
        href: MINIMUM_WAGE_2027_GUIDE_PATHS.en,
      },
    ],
    linkLabel: 'Minimum wage by state, 2026',
  },
  es: {
    title: 'Salario mínimo por estado, 2026 | Cuenta Horas',
    description:
      'El salario mínimo en los 50 estados y DC, dónde rige el federal de $7.25 y las tarifas anunciadas para el 1 de enero de 2027, según el Departamento de Trabajo.',
    kicker: 'Pago por hora · datos',
    h1: 'Salario mínimo por estado, 2026',
    lead: `El salario mínimo federal es $7.25 la hora. ${String(above)} de los 50 estados y DC fijan una tarifa más alta, en ${String(federalOnly)} estados rige el federal de $7.25 porque no tienen ley de salario mínimo o la suya es menor, y la tarifa más alta es ${centsText(highest.wage)} en el ${highest.name.es}.`,
    asOf: `Tarifas de la tabla del Departamento de Trabajo de EE. UU. “State Minimum Wage Laws”, actualizada el 1 de julio de 2026; Florida, del artículo X, sección 24 de la Constitución de Florida ($15.00 desde el 30 de septiembre de 2026). La tarifa del 1 de enero de 2027 aparece en ${String(changing)} estados, solo donde la indica la tabla del DOL o la agencia del propio estado. Algunas ciudades y condados fijan salarios mínimos más altos; la tabla del DOL no los muestra, y esta tampoco. Revisado el 6 de noviembre de 2026.`,
    table: {
      caption: 'Salario mínimo por estado, por hora',
      state: 'Estado',
      wage: 'Salario mínimo',
      basis: 'Lo fija',
      scheduled: '1 de enero de 2027',
      scheduledTag: 'programado',
      notes: 'Notas',
      none: 'Sin dato',
    },
    sections: [
      {
        id: 'como-leer',
        heading: 'Cómo leer la tabla',
        paragraphs: [
          'El salario mínimo es lo menos que el empleador puede pagarte por cada hora. Cuando te cubren la ley del estado y la federal, te corresponde el más alto de los dos; donde el estado no tiene ley de salario mínimo, o la suya es menor que $7.25, la tabla muestra el federal de $7.25 y dice por qué.',
          'Algunos estados fijan otras tarifas por región o por el tamaño del empleador: las notas dan las que nombra la tabla del DOL. Una tarifa en la columna del 1 de enero de 2027 está programada, todavía no rige; un estado sin tarifa ahí puede cambiar igual en esa fecha, así que consulta a su departamento de trabajo.',
        ],
        sources: [DOL_MINIMUM_WAGE, DOL_TABLE],
      },
    ],
    cite: {
      heading: 'Cita esta tabla',
      text: `Cuenta Horas, “Salario mínimo por estado, 2026”, ${url('es')} (datos: Departamento de Trabajo de EE. UU., al 1 de julio de 2026; tarifas del 1 de enero de 2027 de los departamentos de trabajo de los estados).`,
    },
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Un resumen de lo que publican estas agencias, no asesoría legal. Las tarifas cambian, a menudo el 1 de enero o el 1 de julio: consulta al departamento de trabajo de tu estado y a tu ciudad.',
    reviewed:
      'Revisado con las páginas del Departamento de Trabajo y de los estados el 6 de noviembre de 2026.',
    ctas: [
      { label: 'Convierte tu pago por hora en sueldo anual', href: PATHS.hourly.es },
      { label: 'Convierte un sueldo anual en pago por hora', href: PATHS.salary.es },
      { label: 'Salario mínimo con propinas por estado, 2026', href: TIPPED_STATES_GUIDE_PATHS.es },
      {
        label: 'Aumentos del salario mínimo el 1 de enero de 2027',
        href: MINIMUM_WAGE_2027_GUIDE_PATHS.es,
      },
    ],
    linkLabel: 'Salario mínimo por estado, 2026',
  },
};
