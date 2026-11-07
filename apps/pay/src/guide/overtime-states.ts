import { OVERTIME_PATHS } from '../overtime/texts.ts';
import { SITE } from '../site.config.ts';
import type { Lang } from '../time-card/receipt.ts';
import { OVERTIME_STATES_GUIDE_PATHS, UNPAID_WAGES_GUIDE_PATHS } from './paths.ts';
import type { GuideSection, GuideSource } from './texts.ts';

export { OVERTIME_STATES_GUIDE_PATHS } from './paths.ts';

/** The government source of each row. */
export const OVERTIME_STATES_SOURCES = {
  dol: {
    label:
      'U.S. Department of Labor, State Minimum Wage Laws: premium pay after designated hours (updated July 1, 2026)',
    href: 'https://www.dol.gov/agencies/whd/minimum-wage/state',
  },
  ca: {
    label: 'California Labor Commissioner (DLSE), Overtime FAQ',
    href: 'https://www.dir.ca.gov/dlse/faq_overtime.htm',
  },
  ak: {
    label: 'Alaska Department of Labor and Workforce Development, Alaska Wage and Hour Act',
    href: 'https://labor.alaska.gov/lss/whact.htm',
  },
  mn: {
    label: 'Minnesota Statutes, section 177.25 (overtime after 48 hours)',
    href: 'https://www.revisor.mn.gov/statutes/cite/177.25',
  },
  ks: {
    label: 'Kansas Statutes, K.S.A. 44-1204 (overtime after 46 hours)',
    href: 'https://www.kslegislature.gov/li/b2025_26/statute/044_000_0000_chapter/044_012_0000_article/044_012_0004_section/044_012_0004_k/',
  },
  or: {
    label:
      'Oregon Bureau of Labor and Industries (BOLI), Daily overtime: manufacturing and canneries (ORS 652.020, ORS 653.265; checked November 5, 2026)',
    href: 'https://www.oregon.gov/boli/employers/pages/overtime-manufacturing-and-canneries.aspx',
  },
  co: {
    label: 'Colorado Department of Labor and Employment (CDLE), Overtime (COMPS Order #39)',
    href: 'https://cdle.colorado.gov/dlss-home-page/wage-and-hour-law/overtime',
  },
} as const satisfies Readonly<Record<string, GuideSource>>;

type Words = Readonly<Record<Lang, string>>;

/** One state's overtime rule: the hours after which time and a half is owed. */
export interface OvertimeState {
  readonly name: Words;
  /** Hours in a workday after which overtime is owed (none: no daily rule). */
  readonly daily?: number;
  /** Hours in a workweek after which overtime is owed. */
  readonly weekly: number;
  /** False when the state has no overtime rule of its own and the federal FLSA applies. */
  readonly stateRule: boolean;
  readonly doubleTime?: Words;
  readonly seventhDay?: Words;
  readonly notes?: Words;
  /** The source of the note when it is not the row's own source. */
  readonly notesSource?: keyof typeof OVERTIME_STATES_SOURCES;
  readonly source: keyof typeof OVERTIME_STATES_SOURCES;
}

interface Extra {
  readonly daily?: number;
  readonly weekly?: number;
  readonly doubleTime?: Words;
  readonly seventhDay?: Words;
  readonly notes?: Words;
  readonly notesSource?: keyof typeof OVERTIME_STATES_SOURCES;
  readonly source?: OvertimeState['source'];
}

/** A state with its own overtime rule, after 40 hours a week unless `extra` says otherwise. */
const state = (en: string, es: string, extra: Extra = {}): OvertimeState => ({
  name: { en, es },
  weekly: 40,
  stateRule: true,
  source: 'dol',
  ...extra,
});

const FLSA_NOTE: Words = {
  en: 'The DOL lists no state overtime rule; the federal FLSA applies.',
  es: 'El DOL no registra una regla estatal de horas extra; se aplica la FLSA federal.',
};

/** A state for which the DOL table lists no premium pay: the FLSA's 40 hours a week applies. */
const flsa = (en: string, es: string): OvertimeState => ({
  name: { en, es },
  weekly: 40,
  stateRule: false,
  notes: FLSA_NOTE,
  source: 'dol',
});

const NOT_FLSA = (hours: number): Words => ({
  en: `Only for work the FLSA does not cover; most workers are covered and get overtime after 40 hours (the federal rule). The state rule is ${String(hours)} hours.`,
  es: `Solo para el trabajo que la FLSA no cubre; la mayoría está cubierta y cobra horas extra después de 40 horas (la regla federal). La regla estatal es de ${String(hours)} horas.`,
});

/**
 * The 50 states and DC, from the DOL table "State Minimum Wage Laws" (updated July 1, 2026), its
 * "Premium Pay After Designated Hours" line and the notes it gives Kentucky, Missouri and Nevada;
 * California from the Labor Commissioner, Alaska from its Department of Labor, and Kansas and
 * Minnesota, whose own weekly thresholds the DOL table leaves out, from their statutes. Overtime is
 * one and a half times the regular rate everywhere unless the row says double time.
 */
export const OVERTIME_STATES: readonly OvertimeState[] = [
  flsa('Alabama', 'Alabama'),
  state('Alaska', 'Alaska', {
    daily: 8,
    notes: {
      en: 'Employers with 4 or more employees.',
      es: 'Empleadores con 4 o más empleados.',
    },
    source: 'ak',
  }),
  flsa('Arizona', 'Arizona'),
  state('Arkansas', 'Arkansas'),
  state('California', 'California', {
    daily: 8,
    doubleTime: {
      en: 'Over 12 h in a workday, and over 8 h on the seventh consecutive day.',
      es: 'Más de 12 h en un día de trabajo, y más de 8 h el séptimo día seguido.',
    },
    seventhDay: {
      en: 'Time and a half for the first 8 h of the seventh consecutive day of the workweek.',
      es: 'Tiempo y medio por las primeras 8 h del séptimo día seguido de la semana laboral.',
    },
    source: 'ca',
  }),
  state('Colorado', 'Colorado', {
    daily: 12,
    notes: {
      en: 'COMPS Order #39 also owes overtime for a long run of consecutive hours, even one that crosses into the next workday; see the Colorado Department of Labor and Employment (CDLE) for that threshold.',
      es: 'La COMPS Order #39 también exige horas extra por una racha larga de horas seguidas, aunque pase al siguiente día de trabajo; consulta el umbral en el Departamento de Trabajo y Empleo de Colorado (CDLE).',
    },
    notesSource: 'co',
  }),
  state('Connecticut', 'Connecticut'),
  flsa('Delaware', 'Delaware'),
  state('District of Columbia', 'Distrito de Columbia'),
  flsa('Florida', 'Florida'),
  flsa('Georgia', 'Georgia'),
  state('Hawaii', 'Hawái'),
  flsa('Idaho', 'Idaho'),
  state('Illinois', 'Illinois'),
  state('Indiana', 'Indiana'),
  flsa('Iowa', 'Iowa'),
  state('Kansas', 'Kansas', { weekly: 46, notes: NOT_FLSA(46), source: 'ks' }),
  state('Kentucky', 'Kentucky', {
    seventhDay: {
      en: 'Time and a half for the hours of the seventh day when all seven days of the workweek are worked; not when the week is capped at 40 h.',
      es: 'Tiempo y medio por las horas del séptimo día cuando se trabajan los siete días de la semana laboral; no si la semana se limita a 40 h.',
    },
  }),
  flsa('Louisiana', 'Luisiana'),
  state('Maine', 'Maine'),
  state('Maryland', 'Maryland'),
  state('Massachusetts', 'Massachusetts'),
  state('Michigan', 'Míchigan'),
  state('Minnesota', 'Minnesota', { weekly: 48, notes: NOT_FLSA(48), source: 'mn' }),
  flsa('Mississippi', 'Misisipi'),
  state('Missouri', 'Misuri', {
    notes: {
      en: 'After 52 h a week in seasonal amusement or recreation businesses.',
      es: 'Después de 52 h a la semana en negocios de temporada de diversión o recreación.',
    },
  }),
  state('Montana', 'Montana'),
  flsa('Nebraska', 'Nebraska'),
  state('Nevada', 'Nevada', {
    daily: 8,
    notes: {
      en: 'Daily overtime only for employees paid less than 1.5 times the state minimum wage ($18.00 at the $12.00 minimum).',
      es: 'Horas extra por día solo para quien gana menos de 1.5 veces el salario mínimo estatal ($18.00 con el mínimo de $12.00).',
    },
  }),
  state('New Hampshire', 'Nuevo Hampshire'),
  state('New Jersey', 'Nueva Jersey'),
  state('New Mexico', 'Nuevo México'),
  state('New York', 'Nueva York'),
  state('North Carolina', 'Carolina del Norte'),
  state('North Dakota', 'Dakota del Norte'),
  state('Ohio', 'Ohio'),
  flsa('Oklahoma', 'Oklahoma'),
  state('Oregon', 'Oregón', {
    notes: {
      en: 'Daily overtime in some industries, per BOLI: over 10 h a day in manufacturing establishments (ORS 652.020) and in canneries, driers and packing plants, except those on a farm processing its own crops (ORS 653.265).',
      es: 'Horas extra por día en algunas industrias, según BOLI: más de 10 h al día en establecimientos de manufactura (ORS 652.020) y en enlatadoras, secaderos y empacadoras, salvo las que están en una granja y procesan sus propios cultivos (ORS 653.265).',
    },
    notesSource: 'or',
  }),
  state('Pennsylvania', 'Pensilvania'),
  state('Rhode Island', 'Rhode Island'),
  flsa('South Carolina', 'Carolina del Sur'),
  flsa('South Dakota', 'Dakota del Sur'),
  flsa('Tennessee', 'Tennessee'),
  flsa('Texas', 'Texas'),
  flsa('Utah', 'Utah'),
  state('Vermont', 'Vermont'),
  flsa('Virginia', 'Virginia'),
  state('Washington', 'Washington'),
  state('West Virginia', 'Virginia Occidental'),
  state('Wisconsin', 'Wisconsin'),
  flsa('Wyoming', 'Wyoming'),
];

/** The states and DC the table leaves out, with the reason (none: all 51 are listed). */
export const OVERTIME_STATES_OMITTED: readonly { readonly name: Words; readonly reason: Words }[] =
  [];

const hoursText = (hours: number): string => `${String(hours)} h`;

/** The rows of the table in `lang`, sorted by the state's name in that language. */
export const overtimeRowsOf = (
  lang: Lang,
): readonly {
  readonly name: string;
  readonly daily: string | undefined;
  readonly weekly: string;
  readonly doubleTime: string | undefined;
  readonly seventhDay: string | undefined;
  readonly notes: string | undefined;
}[] =>
  [...OVERTIME_STATES]
    .sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang))
    .map((row) => ({
      name: row.name[lang],
      daily: row.daily === undefined ? undefined : hoursText(row.daily),
      weekly: hoursText(row.weekly),
      doubleTime: row.doubleTime?.[lang],
      seventhDay: row.seventhDay?.[lang],
      notes: row.notes?.[lang],
    }));

const dailyStates = OVERTIME_STATES.filter(({ daily }) => daily !== undefined);
const flsaOnly = OVERTIME_STATES.filter(({ stateRule }) => !stateRule).length;
const listOf = (lang: Lang): string => {
  const names = dailyStates.map(({ name }) => name[lang]);
  const last = names.pop() ?? '';
  return `${names.join(', ')} ${lang === 'en' ? 'and' : 'y'} ${last}`;
};

export interface OvertimeStatesTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  /** The answer, first: the federal rule and what the states add, counted from the table. */
  readonly lead: string;
  /** Where the figures come from and the date they were checked. */
  readonly asOf: string;
  readonly table: {
    readonly caption: string;
    readonly state: string;
    readonly daily: string;
    readonly weekly: string;
    readonly doubleTime: string;
    readonly seventhDay: string;
    readonly notes: string;
    /** The cell of a rule the state does not have. */
    readonly none: string;
  };
  readonly sections: readonly GuideSection[];
  readonly cite: { readonly heading: string; readonly text: string };
  readonly sourcesLabel: string;
  readonly disclaimer: string;
  readonly ctas: readonly { readonly label: string; readonly href: string }[];
  /** The text of the link other pages give to this page. */
  readonly linkLabel: string;
}

const url = (lang: Lang): string => `${SITE.origin}${OVERTIME_STATES_GUIDE_PATHS[lang]}`;
const FACT_SHEET_23: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #23: Overtime Pay Requirements of the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay',
};

export const OVERTIME_STATES_GUIDE: Readonly<Record<Lang, OvertimeStatesTexts>> = {
  en: {
    title: 'Overtime Laws by State, 2026 | Cuenta Horas',
    description:
      'Daily and weekly overtime thresholds, double time and seventh-day rules in all 50 states and DC, from the Department of Labor and state sources.',
    kicker: 'Overtime · data',
    h1: 'Overtime laws by state, 2026',
    lead: `Federal law (the FLSA) requires overtime at 1.5 times the regular rate after 40 hours in a workweek, in every state. ${String(dailyStates.length)} states also pay overtime by the day (${listOf('en')}), only California requires double time, and for ${String(flsaOnly)} states the Department of Labor lists no state overtime rule, so the FLSA applies.`,
    asOf: 'Figures from the U.S. Department of Labor table “State Minimum Wage Laws” (premium pay after designated hours), updated July 1, 2026; California from the Labor Commissioner; Alaska from its Department of Labor; Kansas and Minnesota from their statutes; the Oregon and Colorado notes from BOLI and CDLE. Checked November 5, 2026. Territories are not listed.',
    table: {
      caption: 'Overtime rules by state: time and a half after',
      state: 'State',
      daily: 'Daily',
      weekly: 'Weekly',
      doubleTime: 'Double time',
      seventhDay: 'Seventh day',
      notes: 'Notes',
      none: 'No',
    },
    sections: [
      {
        id: 'how-to-read',
        heading: 'How to read the table',
        paragraphs: [
          'Daily is the hours in a workday after which overtime is owed; weekly, the hours in a workweek. Overtime is one and a half times your regular rate unless the row says double time. A long day is overtime only in a state with a daily rule.',
          'The FLSA covers most workers whatever their state. Where a state rule and the federal rule differ, you are owed the one that pays you more, so a 48-hour state threshold does not take away federal overtime after 40.',
        ],
        sources: [OVERTIME_STATES_SOURCES.dol, FACT_SHEET_23],
      },
    ],
    cite: {
      heading: 'Cite this table',
      text: `Cuenta Horas, “Overtime laws by state, 2026”, ${url('en')} (data: U.S. Department of Labor, as of July 1, 2026, and state sources).`,
    },
    sourcesLabel: 'Sources',
    disclaimer:
      'A summary of what these agencies and statutes say, not legal advice. Exemptions, industry rules and alternative schedules can change what you are owed: check your state’s labor department.',
    ctas: [
      { label: 'Open the overtime calculator', href: OVERTIME_PATHS.en },
      { label: 'If your overtime was not paid', href: UNPAID_WAGES_GUIDE_PATHS.en },
    ],
    linkLabel: 'Overtime laws by state, 2026',
  },
  es: {
    title: 'Leyes de horas extra por estado, 2026 | Cuenta Horas',
    description:
      'Las horas extra por día y por semana, el tiempo doble y el séptimo día en los 50 estados y DC, según el Departamento de Trabajo y fuentes estatales.',
    kicker: 'Horas extra · datos',
    h1: 'Leyes de horas extra por estado, 2026',
    lead: `La ley federal (la FLSA) exige pagar horas extra a 1.5 veces la tarifa regular después de 40 horas en la semana laboral, en todos los estados. ${String(dailyStates.length)} estados también pagan horas extra por día (${listOf('es')}), solo California exige tiempo doble, y para ${String(flsaOnly)} estados el Departamento de Trabajo no registra una regla estatal, así que se aplica la FLSA.`,
    asOf: 'Cifras de la tabla del Departamento de Trabajo de EE. UU. “State Minimum Wage Laws” (pago adicional después de ciertas horas), actualizada el 1 de julio de 2026; California, del Comisionado Laboral; Alaska, de su Departamento de Trabajo; Kansas y Minnesota, de sus leyes; las notas de Oregón y Colorado, de BOLI y el CDLE. Revisado el 5 de noviembre de 2026. No incluye los territorios.',
    table: {
      caption: 'Reglas de horas extra por estado: tiempo y medio después de',
      state: 'Estado',
      daily: 'Por día',
      weekly: 'Por semana',
      doubleTime: 'Tiempo doble',
      seventhDay: 'Séptimo día',
      notes: 'Notas',
      none: 'No',
    },
    sections: [
      {
        id: 'como-leer',
        heading: 'Cómo leer la tabla',
        paragraphs: [
          'Por día son las horas en un día de trabajo después de las cuales se deben horas extra; por semana, las horas en la semana laboral. La hora extra es una vez y media tu tarifa regular salvo que la fila diga tiempo doble. Un día largo es hora extra solo en un estado con regla por día.',
          'La FLSA cubre a la mayoría de los trabajadores sin importar su estado. Si la regla estatal y la federal son distintas, te deben la que más te paga, así que un umbral estatal de 48 horas no te quita las horas extra federales después de 40.',
        ],
        sources: [OVERTIME_STATES_SOURCES.dol, FACT_SHEET_23],
      },
    ],
    cite: {
      heading: 'Cita esta tabla',
      text: `Cuenta Horas, “Leyes de horas extra por estado, 2026”, ${url('es')} (datos: Departamento de Trabajo de EE. UU., al 1 de julio de 2026, y fuentes estatales).`,
    },
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Un resumen de lo que dicen estas agencias y leyes, no asesoría legal. Las exenciones, las reglas de cada industria y los horarios alternativos pueden cambiar lo que te deben: consulta al departamento de trabajo de tu estado.',
    ctas: [
      { label: 'Abrir la calculadora de horas extra', href: OVERTIME_PATHS.es },
      { label: 'Si no te pagaron las horas extra', href: UNPAID_WAGES_GUIDE_PATHS.es },
    ],
    linkLabel: 'Leyes de horas extra por estado, 2026',
  },
};
