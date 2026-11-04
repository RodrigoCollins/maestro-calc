import { CONTACT_EMAIL } from '../legal/texts.ts';
import type { Lang } from '../time-card/receipt.ts';

export interface EmbedTexts {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly howHeading: string;
  readonly steps: readonly string[];
  readonly notes: readonly string[];
  readonly calculatorsHeading: string;
  /** The word between the calculator and the site in the credit link: `by`, `de`. */
  readonly by: string;
  /** The footer link to this page. */
  readonly footerLabel: string;
}

export const EMBED_PATHS: Readonly<Record<Lang, string>> = {
  en: '/embed-calculators',
  es: '/es/calculadoras-para-tu-sitio',
};

/** The page that offers every calculator to other sites (plans/growth/PLAN.md › lever 2). */
export const EMBED_TEXTS: Readonly<Record<Lang, EmbedTexts>> = {
  en: {
    title: 'Embed Our Pay Calculators on Your Site | Cuenta Horas',
    description:
      'Put the Cuenta Horas time card, pay and no tax on tips or overtime calculators on your own website for free: copy the code, paste it.',
    h1: 'Embed our calculators',
    lead: 'You can put any Cuenta Horas calculator on your own website for free. It works the same as on our site: the same rules, the same figures and the link your visitors can share.',
    howHeading: 'How to embed a calculator',
    steps: [
      'Find the calculator below and select its whole code.',
      'Paste the code into your page where you want the calculator to show. Most site builders call this an HTML or embed block.',
      'Keep the link under the calculator. It tells your visitors where the figures come from, and it is the only thing we ask in return.',
    ],
    notes: [
      'The calculator opens at the width of your page. If it looks too short or too tall, change the number after height in the code.',
      'The embedded calculator does not track your visitors and loads no ads. Its figures come from the same rules as our own pages, described in our methodology.',
      `Questions, or a calculator you need? Write to us at ${CONTACT_EMAIL}.`,
    ],
    calculatorsHeading: 'The calculators',
    by: 'by',
    footerLabel: 'Embed',
  },
  es: {
    title: 'Calculadoras de Pago para tu Sitio Web | Cuenta Horas',
    description:
      'Pon gratis en tu sitio web las calculadoras de Cuenta Horas: horas trabajadas, pago y propinas u horas extra sin impuestos. Copia el código y pégalo.',
    h1: 'Calculadoras para tu sitio',
    lead: 'Puedes poner cualquier calculadora de Cuenta Horas en tu propio sitio web, gratis. Funciona igual que en nuestro sitio: las mismas reglas, los mismos resultados y el enlace que tus visitantes pueden compartir.',
    howHeading: 'Cómo poner una calculadora',
    steps: [
      'Busca la calculadora abajo y selecciona todo su código.',
      'Pega el código en tu página donde quieras que aparezca la calculadora. La mayoría de los creadores de sitios lo llaman bloque HTML o bloque para insertar.',
      'Deja el enlace debajo de la calculadora. Les dice a tus visitantes de dónde salen los resultados, y es lo único que te pedimos a cambio.',
    ],
    notes: [
      'La calculadora se abre al ancho de tu página. Si se ve muy baja o muy alta, cambia el número después de height en el código.',
      'La calculadora insertada no rastrea a tus visitantes y no carga anuncios. Sus resultados salen de las mismas reglas que nuestras páginas, descritas en nuestra metodología.',
      `¿Tienes preguntas o necesitas otra calculadora? Escríbenos a ${CONTACT_EMAIL}.`,
    ],
    calculatorsHeading: 'Las calculadoras',
    by: 'de',
    footerLabel: 'Para tu sitio',
  },
};
