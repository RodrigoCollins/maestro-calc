import type { Lang, TradeId } from '../routes.ts';

export interface HomeText {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly tradesH2: string;
  readonly summaries: Readonly<Record<TradeId, string>>;
  readonly stepsH2: string;
  readonly steps: readonly { readonly title: string; readonly body: string }[];
  readonly rateH2: string;
  readonly rateBody: string;
  readonly rateLink: string;
  readonly guidesH2: string;
  readonly guideSummaries: Readonly<Record<'quote-guide' | 'markup-guide' | 'rate-guide', string>>;
  readonly trustH2: string;
  readonly trustBody: string;
}

/** The pages the home links in its closing section, so none is reached from the footer alone. */
export const TRUST_PAGES = ['about', 'editorial', 'privacy', 'embed'] as const;

export const HOME_TEXTS: Readonly<Record<Lang, HomeText>> = {
  es: {
    title: 'Cuánto Le Cobro: presupuestos para limpieza, pintura y más',
    description:
      'Calculadoras de presupuesto para limpieza, pintura, drywall, concreto y jardinería: tus horas, tu tarifa y tus materiales, listos para WhatsApp.',
    h1: 'Cuánto le cobro al cliente',
    lead: 'Elige tu oficio, pon tus horas, tu tarifa y tus materiales, y manda el presupuesto detallado por WhatsApp. Sin adivinar y con tus propios números.',
    tradesH2: 'Elige tu oficio',
    summaries: {
      cleaning: 'Horas, personas y productos de una limpieza.',
      painting: 'Mide el cuarto y sacamos los galones.',
      drywall: 'Hojas de drywall para paredes y techo.',
      concrete: 'Bolsas de mezcla para una losa.',
      landscaping: 'Bolsas de mantillo para un área.',
    },
    stepsH2: 'Así funciona',
    steps: [
      {
        title: 'Pon tus números',
        body: 'Horas, tarifa, medidas y precio de los materiales. Las cifras de arranque son un ejemplo: cámbialas por las tuyas.',
      },
      {
        title: 'Mira el presupuesto',
        body: 'Mano de obra, materiales, costos generales, ganancia y total, cada línea redondeada al centavo.',
      },
      {
        title: 'Mándalo o imprímelo',
        body: 'Un botón lo manda por WhatsApp con el detalle; otro lo imprime o lo guarda en PDF.',
      },
    ],
    rateH2: '¿Tu tarifa está bien?',
    rateBody:
      'Compara tu tarifa con lo que pagan los empleadores en tu estado, según el Departamento de Trabajo de EE. UU. Un salario no es una tarifa, pero sirve de referencia.',
    rateLink: 'Ver salarios por oficio y estado',
    guidesH2: 'Guías para cotizar',
    guideSummaries: {
      'quote-guide': 'Las cuatro partes de un presupuesto, con un ejemplo con números.',
      'markup-guide': 'Por qué sumar 20 % al costo no deja 20 % de ganancia.',
      'rate-guide': 'Cuánto necesitas ganar y cuántas horas puedes cobrar de verdad.',
    },
    trustH2: 'Quién hace este sitio',
    trustBody:
      'Quién escribe y revisa estas páginas, cómo elegimos las fuentes, qué datos guarda el sitio y cómo poner una calculadora en tu propia página:',
  },
  en: {
    title: 'Cuánto Le Cobro: quotes for cleaning, painting and more',
    description:
      'Quote calculators for cleaning, painting, drywall, concrete and landscaping: your hours, your rate and your materials, ready for WhatsApp.',
    h1: 'What do I charge the client',
    lead: 'Pick your trade, enter your hours, your rate and your materials, and send the itemized quote on WhatsApp. No guessing, and with your own numbers.',
    tradesH2: 'Pick your trade',
    summaries: {
      cleaning: 'Hours, people and supplies of a cleaning.',
      painting: 'Measure the room and we work out the gallons.',
      drywall: 'Drywall sheets for walls and ceiling.',
      concrete: 'Bags of mix for a slab.',
      landscaping: 'Bags of mulch for an area.',
    },
    stepsH2: 'How it works',
    steps: [
      {
        title: 'Enter your numbers',
        body: 'Hours, rate, measurements and the price of materials. The starting numbers are an example: replace them with yours.',
      },
      {
        title: 'See the quote',
        body: 'Labor, materials, overhead, profit and total, each line rounded to the cent.',
      },
      {
        title: 'Send it or print it',
        body: 'One button sends it on WhatsApp with the detail; another prints it or saves it as a PDF.',
      },
    ],
    rateH2: 'Is your rate right?',
    rateBody:
      'Compare your rate with what employers pay in your state, per the U.S. Department of Labor. A wage is not a rate, but it is a reference.',
    rateLink: 'See wages by trade and state',
    guidesH2: 'Guides to quoting',
    guideSummaries: {
      'quote-guide': 'The four parts of a quote, with a worked example.',
      'markup-guide': 'Why adding 20% to the cost does not leave 20% profit.',
      'rate-guide': 'What you need to earn and how many hours you can really bill.',
    },
    trustH2: 'Who makes this site',
    trustBody:
      'Who writes and checks these pages, how we choose the sources, what the site keeps and how to put a calculator on your own page:',
  },
};
