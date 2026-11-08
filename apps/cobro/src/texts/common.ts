import type { Lang } from '../routes.ts';

/** The words every page of Cuánto Le Cobro shares, in each language. */
export interface CommonText {
  readonly nav: { readonly calculators: string; readonly menuLabel: string };
  readonly lang: { readonly label: string; readonly name: string };
  readonly skip: string;
  readonly footerWarning: string;
  readonly footerGroups: { readonly guides: string; readonly site: string; readonly more: string };
  readonly byline: {
    readonly by: string;
    readonly team: string;
    readonly reviewed: string;
    readonly sources: string;
  };
  readonly groups: {
    readonly job: string;
    readonly labor: string;
    readonly materials: string;
    readonly markup: string;
  };
  /** The label and hint of each field the five quotes share. */
  readonly fields: Readonly<Record<string, { readonly label: string; readonly hint?: string }>>;
  readonly laborByOptions: { readonly hour: string; readonly area: string };
  readonly receipt: {
    readonly title: string;
    readonly labor: string;
    readonly subtotal: string;
    readonly total: string;
    readonly example: string;
    readonly detail: {
      readonly hour: string;
      readonly hourCrew: string;
      readonly area: string;
      readonly overhead: string;
      readonly profit: string;
    };
  };
  readonly actions: { readonly share: string; readonly print: string };
  readonly rateCard: {
    readonly title: string;
    readonly body: string;
    readonly national: string;
    readonly link: string;
  };
  readonly chips: { readonly label: string };
  readonly related: { readonly guides: string; readonly wages: string; readonly other: string };
  readonly faq: string;
  readonly method: { readonly title: string; readonly link: string };
  readonly notFound: { readonly title: string; readonly body: string; readonly home: string };
}

export const COMMON: Readonly<Record<Lang, CommonText>> = {
  es: {
    nav: { calculators: 'Calculadoras', menuLabel: 'Oficios' },
    lang: { label: 'English', name: 'English' },
    skip: 'Saltar al contenido',
    footerWarning:
      'Cada cifra sale de los números que tú escribes. Las cifras de ejemplo no son precios de mercado.',
    footerGroups: { guides: 'Guías', site: 'Cuánto Le Cobro', more: 'Más' },
    byline: {
      by: 'Por',
      team: 'el equipo editorial de Cuánto Le Cobro',
      reviewed: 'Revisado el',
      sources: 'Fuentes',
    },
    groups: {
      job: 'El trabajo',
      labor: 'Mano de obra',
      materials: 'Materiales',
      markup: 'Costos generales y ganancia',
    },
    fields: {
      laborBy: { label: 'Cobrar la mano de obra por' },
      hours: { label: 'Horas de cada trabajador' },
      crew: { label: 'Trabajadores' },
      rate: { label: 'Tu tarifa por hora (US$)' },
      areaRate: { label: 'Tu precio por pie cuadrado (US$)' },
      overhead: {
        label: 'Costos generales (%)',
        hint: 'Lo que cuesta mantener tu negocio y no es mano de obra ni material, como vehículo, seguro y herramientas. Escribe tu propio porcentaje.',
      },
      profit: {
        label: 'Ganancia (%)',
        hint: 'Lo que quieres ganar sobre el costo, ya con los costos generales.',
      },
      doors: { label: 'Puertas' },
      windows: { label: 'Ventanas' },
    },
    laborByOptions: { hour: 'Hora', area: 'Pie cuadrado' },
    receipt: {
      title: 'PRESUPUESTO',
      labor: 'Mano de obra',
      subtotal: 'Subtotal',
      total: 'TOTAL',
      example: 'Cifras de ejemplo: cámbialas por las tuyas.',
      detail: {
        hour: '{hours} h × {rate}/h',
        hourCrew: '{hours} h × {crew} × {rate}/h',
        area: '{area} pies² × {areaRate}/pie²',
        overhead: 'Costos generales ({pct}%)',
        profit: 'Ganancia ({pct}%)',
      },
    },
    actions: { share: 'Enviar presupuesto por WhatsApp', print: 'Imprimir o guardar PDF' },
    rateCard: {
      title: '¿Tu tarifa está bien?',
      body: 'El Departamento de Trabajo de EE. UU. (BLS) publica cuánto pagan los empleadores por hora en este oficio. Un salario no es una tarifa: tu tarifa también tiene que cubrir tus costos generales y tu ganancia.',
      national: 'Promedio nacional (mayo de 2025): {mean} por hora; mediana: {median} por hora.',
      link: 'Ver el salario de este oficio en cada estado',
    },
    chips: { label: 'Elige tu oficio' },
    related: {
      guides: 'Guías para cotizar',
      wages: 'Salarios por estado',
      other: 'Otros oficios',
    },
    faq: 'Preguntas frecuentes',
    method: { title: 'Cómo se calcula', link: 'Ver la metodología con las fuentes' },
    notFound: {
      title: 'No encontramos esta página',
      body: 'La dirección no existe o cambió. Vuelve al inicio y elige tu oficio.',
      home: 'Ir al inicio',
    },
  },
  en: {
    nav: { calculators: 'Calculators', menuLabel: 'Trades' },
    lang: { label: 'Español', name: 'Español' },
    skip: 'Skip to content',
    footerWarning:
      'Every figure comes from the numbers you type. The example numbers are not market prices.',
    footerGroups: { guides: 'Guides', site: 'Cuánto Le Cobro', more: 'More' },
    byline: {
      by: 'By',
      team: 'the Cuánto Le Cobro editorial team',
      reviewed: 'Reviewed',
      sources: 'Sources',
    },
    groups: {
      job: 'The job',
      labor: 'Labor',
      materials: 'Materials',
      markup: 'Overhead and profit',
    },
    fields: {
      laborBy: { label: 'Charge the labor by' },
      hours: { label: 'Hours of each worker' },
      crew: { label: 'Workers' },
      rate: { label: 'Your hourly rate (US$)' },
      areaRate: { label: 'Your price per square foot (US$)' },
      overhead: {
        label: 'Overhead (%)',
        hint: 'What it costs to keep your business running that is not labor or material, such as vehicle, insurance and tools. Type your own percentage.',
      },
      profit: {
        label: 'Profit (%)',
        hint: 'What you want to earn on top of the cost, overhead included.',
      },
      doors: { label: 'Doors' },
      windows: { label: 'Windows' },
    },
    laborByOptions: { hour: 'Hour', area: 'Square foot' },
    receipt: {
      title: 'QUOTE',
      labor: 'Labor',
      subtotal: 'Subtotal',
      total: 'TOTAL',
      example: 'Example numbers: replace them with yours.',
      detail: {
        hour: '{hours} h × {rate}/h',
        hourCrew: '{hours} h × {crew} × {rate}/h',
        area: '{area} sq ft × {areaRate}/sq ft',
        overhead: 'Overhead ({pct}%)',
        profit: 'Profit ({pct}%)',
      },
    },
    actions: { share: 'Send quote on WhatsApp', print: 'Print or save as PDF' },
    rateCard: {
      title: 'Is your rate right?',
      body: 'The U.S. Bureau of Labor Statistics (BLS) publishes what employers pay per hour in this trade. A wage is not a rate: your rate also has to cover your overhead and your profit.',
      national: 'National average (May 2025): {mean} an hour; median: {median} an hour.',
      link: 'See this trade’s wage in every state',
    },
    chips: { label: 'Choose your trade' },
    related: { guides: 'Guides to quoting', wages: 'Wages by state', other: 'Other trades' },
    faq: 'Frequently asked questions',
    method: { title: 'How it is worked out', link: 'See the methodology and sources' },
    notFound: {
      title: 'We could not find this page',
      body: 'The address does not exist or it moved. Go back home and pick your trade.',
      home: 'Go home',
    },
  },
};
