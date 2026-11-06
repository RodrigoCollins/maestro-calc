import { SITE } from '../site.config.ts';
import { TIPPED_PATHS } from '../tipped/texts.ts';
import type { Lang } from '../time-card/receipt.ts';
import {
  MINIMUM_WAGE_STATES_GUIDE_PATHS,
  TIP_CREDIT_GUIDE_PATHS,
  TIPPED_STATES_GUIDE_PATHS,
} from './paths.ts';
import type { GuideSection, GuideSource } from './texts.ts';

export { TIPPED_STATES_GUIDE_PATHS } from './paths.ts';

/** The primary source of each row. */
export const TIPPED_STATES_SOURCES = {
  dol: {
    label:
      'U.S. Department of Labor, Minimum Wages for Tipped Employees (last revised July 1, 2026)',
    href: 'https://www.dol.gov/agencies/whd/state/minimum-wage/tipped',
  },
  ny: {
    label: 'New York State Department of Labor, Minimum Wage',
    href: 'https://dol.ny.gov/minimum-wage-0',
  },
  fl: {
    label:
      'Florida Constitution, Article X, Section 24 (Florida minimum wage: $15.00 from September 30, 2026)',
    href: 'https://www.flsenate.gov/Laws/Constitution',
  },
} as const satisfies Readonly<Record<string, GuideSource>>;

type Words = Readonly<Record<Lang, string>>;

/** One state's tipped minimum wage, in cents an hour. */
export interface TippedState {
  readonly name: Words;
  /** The minimum cash wage the employer pays. */
  readonly cash: number;
  /** The most of the tips the employer may count toward the minimum (0: no tip credit). */
  readonly credit: number;
  /** The full minimum wage: the cash wage plus the tip credit. */
  readonly minimum: number;
  readonly notes?: Words;
  readonly source: keyof typeof TIPPED_STATES_SOURCES;
}

const row = (
  en: string,
  es: string,
  [cash, credit, minimum]: readonly [number, number, number],
  notes?: Words,
  source: TippedState['source'] = 'dol',
): TippedState => ({
  name: { en, es },
  cash,
  credit,
  minimum,
  ...(notes === undefined ? {} : { notes }),
  source,
});

const NO_STATE_LAW: Words = {
  en: 'No state minimum wage law; the federal rates apply.',
  es: 'No hay ley estatal de salario mínimo; se aplican las tarifas federales.',
};
const FLSA_EXCLUDED: Words = {
  en: 'State law excludes employment covered by the federal FLSA.',
  es: 'La ley estatal excluye el empleo cubierto por la FLSA federal.',
};
const percent = (share: number): Words => ({
  en: `Tip credit of ${String(share)}% of the minimum wage.`,
  es: `Crédito por propinas del ${String(share)}% del salario mínimo.`,
});

/**
 * The 50 states and DC, copied from the DOL table "Minimum Wages for Tipped Employees" (last
 * revised July 1, 2026); New York, which the DOL table sends to the state, from the New York State
 * Department of Labor (food service workers); Florida, whose $15.00 of September 30, 2026 the DOL
 * table only footnotes, from Article X, Section 24 of the Florida Constitution. The notes restate the table's own notes.
 */
export const TIPPED_STATES: readonly TippedState[] = [
  row('Alabama', 'Alabama', [213, 512, 725], NO_STATE_LAW),
  row('Alaska', 'Alaska', [1400, 0, 1400]),
  row('Arizona', 'Arizona', [1215, 300, 1515]),
  row('Arkansas', 'Arkansas', [263, 837, 1100]),
  row('California', 'California', [1690, 0, 1690]),
  row('Colorado', 'Colorado', [1214, 302, 1516]),
  row('Connecticut', 'Connecticut', [638, 1056, 1694], {
    en: 'Hotel and restaurant workers. Bartenders who customarily receive tips: $8.23 cash wage, $8.71 tip credit.',
    es: 'Hoteles y restaurantes. Bartenders que reciben propinas de forma habitual: $8.23 en efectivo, $8.71 de crédito por propinas.',
  }),
  row('Delaware', 'Delaware', [223, 1277, 1500]),
  row('District of Columbia', 'Distrito de Columbia', [1030, 810, 1840], {
    en: 'The cash wage is at least 56% of the standard minimum wage.',
    es: 'El salario en efectivo es al menos el 56% del salario mínimo estándar.',
  }),
  row(
    'Florida',
    'Florida',
    [1198, 302, 1500],
    {
      en: 'Since September 30, 2026, under the state constitution; the tip credit stays at the 2003 federal amount, $3.02. The DOL table still shows the earlier $14.00.',
      es: 'Desde el 30 de septiembre de 2026, según la constitución del estado; el crédito por propinas sigue en el monto federal de 2003, $3.02. La tabla del DOL aún muestra los $14.00 anteriores.',
    },
    'fl',
  ),
  row('Georgia', 'Georgia', [213, 512, 725], {
    en: 'The state minimum wage law does not apply to tipped employees; the federal rates apply.',
    es: 'La ley estatal de salario mínimo no se aplica a quien recibe propinas; se aplican las tarifas federales.',
  }),
  row('Hawaii', 'Hawái', [1475, 125, 1600], {
    en: 'The tip credit is allowed only if wages and tips together are at least $7.00 above the minimum wage.',
    es: 'El crédito por propinas solo se permite si el salario y las propinas suman al menos $7.00 más que el salario mínimo.',
  }),
  row('Idaho', 'Idaho', [335, 390, 725]),
  row('Illinois', 'Illinois', [900, 600, 1500], percent(40)),
  row('Indiana', 'Indiana', [213, 512, 725]),
  row('Iowa', 'Iowa', [435, 290, 725], percent(40)),
  row('Kansas', 'Kansas', [213, 512, 725], FLSA_EXCLUDED),
  row('Kentucky', 'Kentucky', [213, 512, 725]),
  row('Louisiana', 'Luisiana', [213, 512, 725], NO_STATE_LAW),
  row('Maine', 'Maine', [755, 755, 1510], percent(50)),
  row('Maryland', 'Maryland', [363, 1137, 1500]),
  row('Massachusetts', 'Massachusetts', [675, 825, 1500]),
  row('Michigan', 'Míchigan', [549, 824, 1373], {
    en: 'The cash wage rises each year until it reaches 50% of the minimum wage in 2031; the minimum wage rises to $15.00 on January 1, 2027.',
    es: 'El salario en efectivo sube cada año hasta llegar al 50% del salario mínimo en 2031; el salario mínimo sube a $15.00 el 1 de enero de 2027.',
  }),
  row('Minnesota', 'Minnesota', [1141, 0, 1141]),
  row('Mississippi', 'Misisipi', [213, 512, 725], NO_STATE_LAW),
  row('Missouri', 'Misuri', [750, 750, 1500], percent(50)),
  row('Montana', 'Montana', [1085, 0, 1085], {
    en: 'Businesses with gross annual sales over $110,000. Businesses not covered by the FLSA with sales of $110,000 or less: $4.00.',
    es: 'Negocios con ventas brutas anuales de más de $110,000. Negocios no cubiertos por la FLSA con ventas de $110,000 o menos: $4.00.',
  }),
  row('Nebraska', 'Nebraska', [213, 1287, 1500]),
  row('Nevada', 'Nevada', [1200, 0, 1200]),
  row('New Hampshire', 'Nuevo Hampshire', [327, 398, 725]),
  row('New Jersey', 'Nueva Jersey', [605, 987, 1592], {
    en: 'Employers with fewer than 6 employees and seasonal employment: a $15.23 minimum wage.',
    es: 'Empleadores con menos de 6 empleados y empleo de temporada: salario mínimo de $15.23.',
  }),
  row('New Mexico', 'Nuevo México', [300, 900, 1200]),
  row(
    'New York',
    'Nueva York',
    [1135, 565, 1700],
    {
      en: 'Food service workers in New York City, Long Island and Westchester. Rest of the state: $10.70 cash wage, $5.30 tip credit, $16.00 minimum. Other tipped workers have other rates.',
      es: 'Trabajadores de servicio de comida en la ciudad de Nueva York, Long Island y Westchester. Resto del estado: $10.70 en efectivo, $5.30 de crédito, mínimo de $16.00. Otros trabajadores con propinas tienen otras tarifas.',
    },
    'ny',
  ),
  row('North Carolina', 'Carolina del Norte', [213, 512, 725], {
    en: 'No tip credit unless the employee signs a certification of the tips received, monthly or each pay period.',
    es: 'Sin crédito por propinas salvo que el empleado firme cada mes o cada período de pago cuántas propinas recibió.',
  }),
  row('North Dakota', 'Dakota del Norte', [486, 239, 725], percent(33)),
  row('Ohio', 'Ohio', [550, 550, 1100], {
    en: 'Employers with annual gross receipts of $405,000 or more; for smaller employers the minimum wage is $7.25.',
    es: 'Empleadores con ingresos brutos anuales de $405,000 o más; para empleadores más pequeños el salario mínimo es $7.25.',
  }),
  row('Oklahoma', 'Oklahoma', [213, 512, 725], {
    en: 'State law excludes employment covered by the federal FLSA; some small employers have other rates.',
    es: 'La ley estatal excluye el empleo cubierto por la FLSA federal; algunos empleadores pequeños tienen otras tarifas.',
  }),
  row('Oregon', 'Oregón', [1555, 0, 1555], {
    en: 'Standard rate. Portland metro: $16.80; nonurban counties: $14.55.',
    es: 'Tarifa estándar. Área metropolitana de Portland: $16.80; condados no urbanos: $14.55.',
  }),
  row('Pennsylvania', 'Pensilvania', [283, 442, 725]),
  row('Rhode Island', 'Rhode Island', [389, 1211, 1600]),
  row('South Carolina', 'Carolina del Sur', [213, 512, 725], NO_STATE_LAW),
  row('South Dakota', 'Dakota del Sur', [593, 592, 1185], percent(50)),
  row('Tennessee', 'Tennessee', [213, 512, 725], NO_STATE_LAW),
  row('Texas', 'Texas', [213, 512, 725], FLSA_EXCLUDED),
  row('Utah', 'Utah', [213, 512, 725], FLSA_EXCLUDED),
  row('Vermont', 'Vermont', [721, 721, 1442], percent(50)),
  row('Virginia', 'Virginia', [213, 1064, 1277]),
  row('Washington', 'Washington', [1713, 0, 1713]),
  row('West Virginia', 'Virginia Occidental', [262, 613, 875], {
    en: 'Tip credit of 70% of the minimum wage; the state law applies to employers with six or more employees.',
    es: 'Crédito por propinas del 70% del salario mínimo; la ley estatal se aplica a empleadores con seis o más empleados.',
  }),
  row('Wisconsin', 'Wisconsin', [233, 492, 725], {
    en: 'Opportunity employees (under 20, in their first 90 days) may be paid a $2.13 cash wage.',
    es: 'A los empleados de oportunidad (menores de 20, en sus primeros 90 días) se les puede pagar $2.13 en efectivo.',
  }),
  row('Wyoming', 'Wyoming', [213, 512, 725], {
    en: 'The state minimum wage is $5.15; employers covered by the FLSA pay the federal rates.',
    es: 'El salario mínimo estatal es $5.15; los empleadores cubiertos por la FLSA pagan las tarifas federales.',
  }),
];

/** Cents as dollars, the way the table prints them: `$2.13`. */
export const centsText = (cents: number): string =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** The rows of the table in `lang`, sorted by the state's name in that language. */
export const rowsOf = (
  lang: Lang,
): readonly {
  readonly name: string;
  readonly cash: string;
  readonly credit: string | undefined;
  readonly minimum: string;
  readonly notes: string | undefined;
  readonly source: TippedState['source'];
}[] =>
  [...TIPPED_STATES]
    .sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang))
    .map((state) => ({
      name: state.name[lang],
      cash: centsText(state.cash),
      credit: state.credit === 0 ? undefined : centsText(state.credit),
      minimum: centsText(state.minimum),
      notes: state.notes?.[lang],
      source: state.source,
    }));

const noCredit = TIPPED_STATES.filter(({ credit }) => credit === 0).length;
const federal = TIPPED_STATES.filter(({ cash }) => cash === 213).length;
const highest = TIPPED_STATES.reduce((top, state) => (state.cash > top.cash ? state : top));

export interface TippedStatesTexts {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  /** The answer, first: the federal figures and what the states do, from the table. */
  readonly lead: string;
  /** Where the figures come from and the date they are current as of. */
  readonly asOf: string;
  readonly table: {
    readonly caption: string;
    readonly state: string;
    readonly cash: string;
    readonly credit: string;
    readonly minimum: string;
    readonly notes: string;
    /** The tip credit cell of a state that allows none. */
    readonly noCredit: string;
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

const url = (lang: Lang): string => `${SITE.origin}${TIPPED_STATES_GUIDE_PATHS[lang]}`;
const FACT_SHEET_15: GuideSource = {
  label: 'U.S. Department of Labor, Fact Sheet #15: Tipped Employees Under the FLSA',
  href: 'https://www.dol.gov/agencies/whd/fact-sheets/15-tipped-employees-flsa',
};

export const TIPPED_STATES_GUIDE: Readonly<Record<Lang, TippedStatesTexts>> = {
  en: {
    title: 'Tipped Minimum Wage by State, 2026 | Cuenta Horas',
    description:
      'The minimum cash wage, maximum tip credit and full minimum wage for tipped workers in all 50 states and DC, from the U.S. Department of Labor table.',
    kicker: 'Tipped pay · data',
    h1: 'Tipped minimum wage by state, 2026',
    lead: `The federal tipped minimum wage is $2.13 an hour in cash, with a tip credit of up to $5.12 toward the $7.25 minimum wage. ${String(noCredit)} states allow no tip credit, ${String(federal)} states use the federal $2.13 cash wage, and the highest cash wage is ${centsText(highest.cash)} in ${highest.name.en}.`,
    asOf: 'Figures from the U.S. Department of Labor table “Minimum Wages for Tipped Employees”, last revised July 1, 2026; New York from the New York State Department of Labor; Florida from Article X, Section 24 of the Florida Constitution ($15.00 since September 30, 2026). Checked November 5, 2026. Many states change their rates on January 1.',
    table: {
      caption: 'Tipped minimum wage by state, per hour',
      state: 'State',
      cash: 'Minimum cash wage',
      credit: 'Max tip credit',
      minimum: 'Full minimum wage',
      notes: 'Notes',
      noCredit: 'None',
    },
    sections: [
      {
        id: 'how-to-read',
        heading: 'How to read the table',
        paragraphs: [
          'The minimum cash wage is what the employer must pay you per hour. The tip credit is the most of your tips it may count toward the full minimum wage; the cash wage plus the tip credit is the full minimum. Where the tip credit is none, the employer pays the full state minimum wage before tips.',
          'When federal and state law differ, the employer must follow the standard that protects the employee most (Fact Sheet #15). If your tips and cash wage do not reach the full minimum for the week, the employer makes up the difference.',
        ],
        sources: [TIPPED_STATES_SOURCES.dol, FACT_SHEET_15],
      },
    ],
    cite: {
      heading: 'Cite this table',
      text: `Cuenta Horas, “Tipped minimum wage by state, 2026”, ${url('en')} (data: U.S. Department of Labor, as of July 1, 2026).`,
    },
    sourcesLabel: 'Sources',
    disclaimer:
      'A summary of what these agencies publish, not legal advice. Rates change, often on January 1: check your state’s labor department.',
    reviewed:
      'Checked against the Department of Labor pages and the Florida Constitution on November 5, 2026.',
    ctas: [
      { label: 'Open the tipped wage calculator', href: TIPPED_PATHS.en },
      { label: 'How the tip credit works', href: TIP_CREDIT_GUIDE_PATHS.en },
      { label: 'Minimum wage by state, 2026', href: MINIMUM_WAGE_STATES_GUIDE_PATHS.en },
    ],
    linkLabel: 'Tipped minimum wage by state, 2026',
  },
  es: {
    title: 'Salario mínimo con propinas por estado, 2026 | Cuenta Horas',
    description:
      'El salario mínimo en efectivo, el crédito máximo por propinas y el salario mínimo completo en los 50 estados y DC, según el Departamento de Trabajo.',
    kicker: 'Pago con propinas · datos',
    h1: 'Salario mínimo con propinas por estado, 2026',
    lead: `El salario mínimo federal con propinas es $2.13 la hora en efectivo, con un crédito por propinas de hasta $5.12 para llegar al mínimo de $7.25. ${String(noCredit)} estados no permiten crédito por propinas, ${String(federal)} estados usan el salario federal en efectivo de $2.13, y el salario en efectivo más alto es ${centsText(highest.cash)} en ${highest.name.es}.`,
    asOf: 'Cifras de la tabla del Departamento de Trabajo de EE. UU. “Minimum Wages for Tipped Employees”, revisada el 1 de julio de 2026; Nueva York, del Departamento de Trabajo del Estado de Nueva York; Florida, del artículo X, sección 24 de la Constitución de Florida ($15.00 desde el 30 de septiembre de 2026). Revisado el 5 de noviembre de 2026. Muchos estados cambian sus tarifas el 1 de enero.',
    table: {
      caption: 'Salario mínimo con propinas por estado, por hora',
      state: 'Estado',
      cash: 'Salario mínimo en efectivo',
      credit: 'Crédito máximo por propinas',
      minimum: 'Salario mínimo completo',
      notes: 'Notas',
      noCredit: 'Ninguno',
    },
    sections: [
      {
        id: 'como-leer',
        heading: 'Cómo leer la tabla',
        paragraphs: [
          'El salario mínimo en efectivo es lo que el empleador debe pagarte por hora. El crédito por propinas es lo máximo de tus propinas que puede contar para el salario mínimo completo; el salario en efectivo más el crédito es el mínimo completo. Donde el crédito es ninguno, el empleador paga el salario mínimo estatal completo antes de las propinas.',
          'Cuando la ley federal y la del estado son distintas, el empleador debe cumplir la norma que más protege al empleado (Fact Sheet #15). Si tus propinas y tu salario en efectivo no llegan al mínimo completo en la semana, el empleador completa la diferencia.',
        ],
        sources: [TIPPED_STATES_SOURCES.dol, FACT_SHEET_15],
      },
    ],
    cite: {
      heading: 'Cita esta tabla',
      text: `Cuenta Horas, “Salario mínimo con propinas por estado, 2026”, ${url('es')} (datos: Departamento de Trabajo de EE. UU., al 1 de julio de 2026).`,
    },
    sourcesLabel: 'Fuentes',
    disclaimer:
      'Un resumen de lo que publican estas agencias, no asesoría legal. Las tarifas cambian, a menudo el 1 de enero: consulta al departamento de trabajo de tu estado.',
    reviewed:
      'Revisado con las páginas del Departamento de Trabajo y la Constitución de Florida el 5 de noviembre de 2026.',
    ctas: [
      { label: 'Abrir la calculadora de propinas por hora', href: TIPPED_PATHS.es },
      { label: 'Cómo funciona el crédito por propinas', href: TIP_CREDIT_GUIDE_PATHS.es },
      { label: 'Salario mínimo por estado, 2026', href: MINIMUM_WAGE_STATES_GUIDE_PATHS.es },
    ],
    linkLabel: 'Salario mínimo con propinas por estado, 2026',
  },
};
