import type { GuideSource } from '../guide/texts.ts';
import { CONTACT_EMAIL } from '../legal/texts.ts';
import { METHODOLOGY_TEXTS } from '../methodology/texts.ts';
import type { Lang } from '../time-card/receipt.ts';
import { BYLINE_PAGES } from './bylines.ts';

export { EDITORIAL_PATHS } from './paths.ts';

/** The words of the byline under the h1 of a guide, a table and a state page. */
export const BYLINE_TEXTS: Readonly<
  Record<
    Lang,
    {
      readonly by: string;
      readonly team: string;
      readonly reviewed: string;
      readonly sources: string;
    }
  >
> = {
  en: {
    by: 'By the',
    team: 'Cuenta Horas editorial team',
    reviewed: 'Reviewed',
    sources: 'Sources',
  },
  es: {
    by: 'Por el',
    team: 'equipo editorial de Cuenta Horas',
    reviewed: 'Revisado el',
    sources: 'Fuentes',
  },
};

/**
 * The kinds of official source the policy names, each found by a part of its address (`mark`)
 * among the sources the site already cites, so the page links no address the site does not cite.
 */
const OFFICIAL_SOURCES: readonly {
  readonly mark: string;
  readonly en: string;
  readonly es: string;
}[] = [
  {
    mark: '/whd/fact-sheets/23-flsa-overtime-pay',
    en: 'U.S. Department of Labor, Fact Sheet #23: overtime pay under the Fair Labor Standards Act (FLSA)',
    es: 'Departamento de Trabajo de EE. UU., hoja informativa n.º 23: las horas extra según la Ley de Normas Justas de Trabajo (FLSA)',
  },
  {
    mark: '/whd/minimum-wage/state',
    en: 'U.S. Department of Labor, Wage and Hour Division: state minimum wage laws',
    es: 'Departamento de Trabajo de EE. UU., División de Horas y Salarios: leyes estatales de salario mínimo',
  },
  {
    mark: '/whd/state/minimum-wage/tipped',
    en: 'U.S. Department of Labor, Wage and Hour Division: minimum wages for tipped employees by state',
    es: 'Departamento de Trabajo de EE. UU., División de Horas y Salarios: salario mínimo con propinas por estado',
  },
  {
    mark: 'ecfr.gov/current/title-29/part-778',
    en: 'Code of Federal Regulations, 29 CFR Part 778: overtime pay',
    es: 'Código de Regulaciones Federales, 29 CFR parte 778: pago de horas extra',
  },
  {
    mark: 'dir.ca.gov/dlse/faq_overtime',
    en: 'California Labor Commissioner, overtime FAQ (one of the state labor departments we cite)',
    es: 'Comisionado Laboral de California, preguntas frecuentes sobre horas extra (uno de los departamentos laborales estatales que citamos)',
  },
  {
    mark: 'irs.gov/instructions/iw2w3',
    en: 'IRS, General Instructions for Forms W-2 and W-3',
    es: 'IRS, instrucciones generales de los formularios W-2 y W-3',
  },
  {
    mark: 'irs.gov/newsroom/what-to-know-about-the-no-tax-on-overtime-deduction',
    en: 'IRS, what to know about the no tax on overtime deduction',
    es: 'IRS, lo que debes saber sobre la deducción por horas extra',
  },
];

/** Where to take a wage claim, among the sources the site cites. */
const WHD_COMPLAINTS = {
  mark: '/whd/contact/complaints',
  en: 'U.S. Department of Labor, Wage and Hour Division: how to file a complaint',
  es: 'Departamento de Trabajo de EE. UU., División de Horas y Salarios: cómo presentar una queja',
};

/** Every address the site cites: the sources of its byline pages and of its methodology. */
const CITED: readonly string[] = [
  ...BYLINE_PAGES.flatMap(({ sources }) => sources),
  ...Object.values(METHODOLOGY_TEXTS).flatMap(({ sections }) =>
    sections.flatMap(({ sources }) => sources.map(({ href }) => href)),
  ),
];

const sourceOf = (
  official: { readonly mark: string; readonly en: string; readonly es: string },
  lang: Lang,
): GuideSource => {
  const href = CITED.find((cited) => cited.includes(official.mark));
  if (href === undefined) throw new Error(`the site cites no source at ${official.mark}`);
  return { label: official[lang], href };
};

export interface EditorialSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  /** The sources the section lists, each linked. */
  readonly sources?: readonly GuideSource[];
  /** A page of the site the section points to, in its language. */
  readonly link?: { readonly href: string; readonly label: string };
}

export interface EditorialTexts {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly EditorialSection[];
  readonly reviewed: string;
}

/** The editorial policy in each language, Spanish in the neutral tú register. */
export const EDITORIAL_TEXTS: Readonly<Record<Lang, EditorialTexts>> = {
  en: {
    title: 'Editorial Policy | Cuenta Horas',
    description:
      'Who writes Cuenta Horas, where its pay and hours figures come from, how each one is checked and reviewed, and how to report an error.',
    h1: 'Editorial policy',
    lead: 'Every calculator, guide, table and state page of Cuenta Horas is written by the Cuenta Horas editorial team. This page says how we work.',
    sections: [
      {
        id: 'who',
        heading: 'Who we are',
        paragraphs: [
          'The Cuenta Horas editorial team is a small independent team that builds free pay and hours calculators for hourly workers in the US, in English and Spanish. We are not lawyers, CPAs or payroll providers, and we claim no credential we do not hold. That is why every rule and every rate on the site comes from an official source, named and linked on its page.',
        ],
      },
      {
        id: 'sources',
        heading: 'Where the numbers come from',
        paragraphs: [
          'We work from official sources: the U.S. Department of Labor for federal overtime and the state tables of its Wage and Hour Division, the federal regulations, the labor department or the statute of each state for its own rates, and IRS publications for the tax deductions. Each page links the exact documents it uses; these are some of them:',
        ],
        sources: OFFICIAL_SOURCES.map((official) => sourceOf(official, 'en')),
      },
      {
        id: 'checks',
        heading: 'How figures are checked',
        paragraphs: [
          'Every calculator does exact arithmetic and rounds only the figure you read. Each rule is tested against cases worked out by hand before a page goes live, and the tests run again on every change. The methodology page shows the rules, their sources and those cases, run through the same calculators you use.',
        ],
        link: { href: '/methodology', label: 'How we calculate' },
      },
      {
        id: 'reviews',
        heading: 'When pages are reviewed',
        paragraphs: [
          'Each guide, table and state page shows under its title the day its figures were last checked against their sources. Most state minimum wage changes take effect on January 1 or July 1, so we recheck the state minimum wage and overtime tables before every January 1 and July 1, and whenever a state announces a change.',
        ],
      },
      {
        id: 'errors',
        heading: 'How to report an error',
        paragraphs: [
          `Found a wrong figure, an outdated rate or a broken source? Write to ${CONTACT_EMAIL} with the page and what you found. We read every message and fix confirmed errors on the page.`,
        ],
      },
      {
        id: 'advice',
        heading: 'Estimates, not advice',
        paragraphs: [
          'The figures are estimates for planning: they are not legal or tax advice. Your employer, a union contract or a local rule can change what you are owed. For a wage claim, contact the labor department of your state or the Wage and Hour Division of the U.S. Department of Labor.',
        ],
        sources: [sourceOf(WHD_COMPLAINTS, 'en')],
      },
    ],
    reviewed: 'Last updated November 6, 2026.',
  },
  es: {
    title: 'Política editorial | Cuenta Horas',
    description:
      'Quién escribe Cuenta Horas, de dónde salen sus cifras de horas y pago, cómo se comprueba y revisa cada una y cómo avisarnos de un error.',
    h1: 'Política editorial',
    lead: 'Cada calculadora, guía, tabla y página de estado de Cuenta Horas la escribe el equipo editorial de Cuenta Horas. Esta página explica cómo trabajamos.',
    sections: [
      {
        id: 'who',
        heading: 'Quiénes somos',
        paragraphs: [
          'El equipo editorial de Cuenta Horas es un equipo pequeño e independiente que hace calculadoras gratis de horas y pago para trabajadores por hora en EE. UU., en inglés y en español. Como no somos abogados, contadores ni proveedores de nómina, no decimos tener credenciales que no tenemos. Cada regla y cada tarifa del sitio sale de una fuente oficial, que su página nombra y enlaza.',
        ],
      },
      {
        id: 'sources',
        heading: 'De dónde salen las cifras',
        paragraphs: [
          'Trabajamos con fuentes oficiales: el Departamento de Trabajo de EE. UU. para las horas extra federales y las tablas estatales de su División de Horas y Salarios, los reglamentos federales, el departamento laboral o la ley de cada estado para sus propias tarifas, y las publicaciones del IRS para las deducciones fiscales. Cada página enlaza los documentos exactos que usa; estos son algunos:',
        ],
        sources: OFFICIAL_SOURCES.map((official) => sourceOf(official, 'es')),
      },
      {
        id: 'checks',
        heading: 'Cómo se comprueban las cifras',
        paragraphs: [
          'Cada calculadora hace aritmética exacta y solo redondea la cifra que lees. Cada regla se prueba con casos resueltos a mano antes de publicar una página, y las pruebas se repiten con cada cambio. La página de metodología muestra las reglas, sus fuentes y esos casos, calculados con las mismas calculadoras que usas.',
        ],
        link: { href: '/es/metodologia', label: 'Cómo calculamos' },
      },
      {
        id: 'reviews',
        heading: 'Cuándo se revisan las páginas',
        paragraphs: [
          'Cada guía, tabla y página de estado muestra bajo su título el día en que se revisaron sus cifras con sus fuentes por última vez. La mayoría de los cambios del salario mínimo estatal entran en vigor el 1 de enero o el 1 de julio, así que revisamos las tablas estatales de salario mínimo y de horas extra antes de cada 1 de enero y 1 de julio, y cada vez que un estado anuncia un cambio.',
        ],
      },
      {
        id: 'errors',
        heading: 'Cómo avisarnos de un error',
        paragraphs: [
          `¿Encontraste una cifra equivocada, una tarifa vieja o una fuente rota? Escribe a ${CONTACT_EMAIL} con la página y lo que encontraste. Leemos cada mensaje y corregimos en la página los errores confirmados.`,
        ],
      },
      {
        id: 'advice',
        heading: 'Estimaciones, no asesoría',
        paragraphs: [
          'Las cifras son estimaciones para planificar: no son asesoría legal ni fiscal. Tu empleador, un contrato sindical o una regla local pueden cambiar lo que te corresponde. Para reclamar un salario, comunícate con el departamento laboral de tu estado o con la División de Horas y Salarios del Departamento de Trabajo de EE. UU.',
        ],
        sources: [sourceOf(WHD_COMPLAINTS, 'es')],
      },
    ],
    reviewed: 'Última actualización: 6 de noviembre de 2026.',
  },
};
