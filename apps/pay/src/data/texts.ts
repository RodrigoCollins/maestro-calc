import type { Lang } from '../time-card/receipt.ts';

/** The data index: every citable table of the site in one page. */
export const DATA_PATHS: Readonly<Record<Lang, string>> = { en: '/data', es: '/es/datos' };

/** The press address the note for journalists gives. */
export const PRESS_EMAIL = 'press@maestrocalc.com';

export interface DataTexts {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly checkedLabel: string;
  readonly sourcesLabel: string;
  readonly press: { readonly heading: string; readonly text: string };
  /** The text of the link the footer and every table give to this page. */
  readonly linkLabel: string;
  /** The line a table ends with, linking this page. */
  readonly indexLabel: string;
}

export const DATA_TEXTS: Readonly<Record<Lang, DataTexts>> = {
  en: {
    title: 'Pay Data by State You Can Cite | Cuenta Horas',
    description:
      'Every Cuenta Horas table: tipped minimum wage, overtime laws and minimum wage by state, each with its sources, the day it was checked and how to cite it.',
    h1: 'Data and tables',
    lead: 'The citable tables of Cuenta Horas, in one place. Each one covers all 50 states and DC, rests on the U.S. Department of Labor and the state sources it names and links, and shows the day we last checked it.',
    checkedLabel: 'Checked',
    sourcesLabel: 'Sources:',
    press: {
      heading: 'For journalists and bloggers',
      text: `The figures in these tables are free to cite and republish with a link to the table they come from. Each table ends with the line to cite it by. For a question about a figure, a source or the method, write to ${PRESS_EMAIL}.`,
    },
    linkLabel: 'Data and tables',
    indexLabel: 'Every table and its sources: data and tables',
  },
  es: {
    title: 'Datos de pago por estado para citar | Cuenta Horas',
    description:
      'Todas las tablas de Cuenta Horas: salario mínimo con propinas, leyes de horas extra y salario mínimo por estado, con sus fuentes, su fecha y cómo citarlas.',
    h1: 'Datos y tablas',
    lead: 'Las tablas para citar de Cuenta Horas, en un solo lugar. Cada una cubre los 50 estados y DC, se basa en el Departamento de Trabajo de EE. UU. y en las fuentes estatales que nombra y enlaza, y muestra el día en que la revisamos por última vez.',
    checkedLabel: 'Revisada el',
    sourcesLabel: 'Fuentes:',
    press: {
      heading: 'Para periodistas y blogueros',
      text: `Puedes citar y reproducir las cifras de estas tablas gratis, con un enlace a la tabla de donde salen. Cada tabla termina con la línea para citarla. Si tienes una pregunta sobre una cifra, una fuente o el método, escribe a ${PRESS_EMAIL}.`,
    },
    linkLabel: 'Datos y tablas',
    indexLabel: 'Todas las tablas y sus fuentes: datos y tablas',
  },
};
