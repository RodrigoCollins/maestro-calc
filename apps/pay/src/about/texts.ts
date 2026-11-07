import { EDITORIAL_PATHS } from '../editorial/paths.ts';
import { CONTACT_EMAIL } from '../legal/texts.ts';
import type { Lang } from '../time-card/receipt.ts';

export interface AboutSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  /** A page of the site the section points to, in its language. */
  readonly link?: { readonly href: string; readonly label: string };
}

export interface AboutTexts {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly AboutSection[];
  readonly reviewed: string;
}

export const ABOUT_PATHS: Readonly<Record<Lang, string>> = { en: '/about', es: '/es/acerca' };

/** The hosts of the sources the methodology cites; the about page names these and no others. */
export const PRIMARY_SOURCE_HOSTS = [
  'www.dol.gov',
  'www.ecfr.gov',
  'www.dir.ca.gov',
  'www.irs.gov',
] as const;

/** Who runs Cuenta Horas and how it works, in each language (the about page). */
export const ABOUT_TEXTS: Readonly<Record<Lang, AboutTexts>> = {
  en: {
    title: 'About Cuenta Horas',
    description:
      'Who runs Cuenta Horas, what its free pay calculators do, where the rules come from and how to reach us.',
    h1: 'About Cuenta Horas',
    lead: `Cuenta Horas is an independent site with free calculators for hours and pay in the US, in English and Spanish. The team behind Maestro Calc runs it. You can write to us at ${CONTACT_EMAIL}.`,
    sections: [
      {
        id: 'what',
        heading: 'What the site does',
        paragraphs: [
          'Cuenta Horas adds up the hours on a time card, applies federal overtime and the daily rules of California, Alaska, Nevada and Colorado, converts hourly pay to a yearly salary and back, and estimates the federal deductions for tips and overtime. Each calculator shows the figure and how it got there.',
        ],
      },
      {
        id: 'method',
        heading: 'How the figures are worked out',
        paragraphs: [
          'Every calculator follows written rules, and every rule is tested against examples worked out by hand. The methodology page shows the rules and runs its worked examples through the same calculator you use. We use AI tools to help write text and code; the formulas are checked against those examples before a page goes live.',
        ],
        link: { href: '/methodology', label: 'How we calculate' },
      },
      {
        id: 'editorial',
        heading: 'Who writes the pages',
        paragraphs: [
          'Every guide, table and state page is written and reviewed by the Cuenta Horas editorial team, and shows under its title the day its figures were last checked. The editorial policy says where the numbers come from, how they are checked and when pages are reviewed.',
        ],
        link: { href: EDITORIAL_PATHS.en, label: 'Editorial policy' },
      },
      {
        id: 'sources',
        heading: 'Sources',
        paragraphs: [
          'We cite primary sources only: the U.S. Department of Labor (dol.gov) for federal overtime and its regulations in the Code of Federal Regulations (ecfr.gov), the California Labor Commissioner (dir.ca.gov) for California overtime, and the IRS (irs.gov) for the deductions for tips and overtime. Each page names the source it uses.',
        ],
      },
      {
        id: 'estimates',
        heading: 'Estimates, not advice',
        paragraphs: [
          'The figures are estimates for planning. They are not legal, tax or payroll advice, and your employer, a union contract or a state rule we do not cover can change what you are owed. When the amount matters, check it with your employer, your state labor office or a tax professional.',
        ],
      },
      {
        id: 'data',
        heading: 'Your data',
        paragraphs: [
          'The site has no accounts, and the calculators run in your browser: the values you type are not sent to us. We do not sell data. The site has no advertising today. The privacy page describes the hosting logs and the analytics we use.',
        ],
        link: { href: '/privacy', label: 'Privacy' },
      },
      {
        id: 'contact',
        heading: 'Contact and corrections',
        paragraphs: [
          `Found an error, or a rule we should cover? Write to ${CONTACT_EMAIL}. We read every message and fix confirmed errors.`,
        ],
      },
    ],
    reviewed: 'Last updated November 4, 2026.',
  },
  es: {
    title: 'Acerca de Cuenta Horas',
    description:
      'Quién hace Cuenta Horas, qué hacen sus calculadoras gratis de horas y pago, de dónde salen las reglas y cómo escribirnos.',
    h1: 'Acerca de Cuenta Horas',
    lead: `Cuenta Horas es un sitio independiente con calculadoras gratis de horas y pago en EE. UU., en inglés y en español. Lo hace el mismo equipo de Maestro Calc. Puedes escribirnos a ${CONTACT_EMAIL}.`,
    sections: [
      {
        id: 'que-hace',
        heading: 'Qué hace el sitio',
        paragraphs: [
          'Cuenta Horas suma las horas de una tarjeta de tiempo, aplica las horas extra federales y las reglas por día de California, Alaska, Nevada y Colorado, convierte el pago por hora en sueldo anual y al revés, y estima las deducciones federales por propinas y horas extra. Cada calculadora muestra el resultado y cómo se llegó a él.',
        ],
      },
      {
        id: 'metodo',
        heading: 'Cómo se calculan los resultados',
        paragraphs: [
          'Cada calculadora sigue reglas escritas, y cada regla se prueba con ejemplos calculados a mano. La página de metodología muestra las reglas y pasa sus ejemplos por la misma calculadora que usas. Usamos herramientas de IA para ayudar a escribir textos y código; las fórmulas se comprueban con esos ejemplos antes de publicar una página.',
        ],
        link: { href: '/es/metodologia', label: 'Cómo calculamos' },
      },
      {
        id: 'editorial',
        heading: 'Quién escribe las páginas',
        paragraphs: [
          'Cada guía, tabla y página de estado la escribe y revisa el equipo editorial de Cuenta Horas, y muestra bajo su título el día en que se revisaron sus cifras por última vez. La política editorial explica de dónde salen las cifras, cómo se comprueban y cuándo se revisan las páginas.',
        ],
        link: { href: EDITORIAL_PATHS.es, label: 'Política editorial' },
      },
      {
        id: 'fuentes',
        heading: 'Fuentes',
        paragraphs: [
          'Citamos solo fuentes primarias: el Departamento de Trabajo de EE. UU. (dol.gov) para las horas extra federales y sus reglamentos en el Código de Regulaciones Federales (ecfr.gov), el Comisionado Laboral de California (dir.ca.gov) para las horas extra de California, y el IRS (irs.gov) para las deducciones por propinas y horas extra. Cada página nombra la fuente que usa.',
        ],
      },
      {
        id: 'estimaciones',
        heading: 'Estimaciones, no asesoría',
        paragraphs: [
          'Los resultados son estimaciones para planificar. No son asesoría legal, fiscal ni de nómina, y tu empleador, un contrato sindical o una regla estatal que no cubrimos pueden cambiar lo que te corresponde. Cuando el monto importa, confírmalo con tu empleador, la oficina laboral de tu estado o un profesional de impuestos.',
        ],
      },
      {
        id: 'datos',
        heading: 'Tus datos',
        paragraphs: [
          'El sitio no tiene cuentas de usuario, y las calculadoras funcionan en tu navegador: los valores que escribes no se nos envían. No vendemos datos. Hoy el sitio no tiene publicidad. La página de privacidad describe los registros del hosting y la analítica que usamos.',
        ],
        link: { href: '/es/privacidad', label: 'Privacidad' },
      },
      {
        id: 'contacto',
        heading: 'Contacto y correcciones',
        paragraphs: [
          `¿Encontraste un error o una regla que deberíamos cubrir? Escribe a ${CONTACT_EMAIL}. Leemos cada mensaje y corregimos los errores confirmados.`,
        ],
      },
    ],
    reviewed: 'Última actualización: 4 de noviembre de 2026.',
  },
};
