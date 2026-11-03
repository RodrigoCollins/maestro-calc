import type { Lang } from '../time-card/receipt.ts';

export interface PrivacySection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

export interface PrivacyTexts {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly sections: readonly PrivacySection[];
  readonly reviewed: string;
}

/** The address readers write to; the same team runs Maestro Calc and Cuenta Horas. */
export const CONTACT_EMAIL = 'contacto@maestrocalc.com';

/** What Cuenta Horas does with information today, in each language (the privacy page). */
export const PRIVACY_TEXTS: Readonly<Record<Lang, PrivacyTexts>> = {
  en: {
    title: 'Privacy | Cuenta Horas',
    description:
      'What Cuenta Horas does with information: hosting logs, Google Analytics without the values you type, and calculators that run in your browser.',
    h1: 'Privacy',
    lead: 'This page describes what Cuenta Horas does with information today. It covers only what the site does now.',
    sections: [
      {
        id: 'hosting',
        heading: 'Hosting',
        paragraphs: [
          'Cuenta Horas is hosted on Cloudflare. When you load a page, Cloudflare processes standard request logs, which can include your IP address, the page you asked for and your browser type.',
        ],
      },
      {
        id: 'analytics',
        heading: 'Analytics and cookies',
        paragraphs: [
          'Cuenta Horas uses Google Analytics to count visits and see which pages people use. It starts after the page has loaded. The site has no advertising and no accounts.',
          'Google Analytics receives the page you visit without the values you typed, your browser and device type, your screen size and an approximate location that Google derives from your IP address. Outside the European Economic Area, the United Kingdom and Switzerland, it can set first-party cookies, such as _ga, to tell one visit from another.',
          'In the European Economic Area, the United Kingdom and Switzerland, Google Analytics sets no cookie: it only receives a signal that a page was viewed. The same applies anywhere when your browser sends a Global Privacy Control signal. Advertising storage and ad personalization are off everywhere.',
          "You can also block cookies in your browser or install Google's opt-out add-on for Google Analytics.",
        ],
      },
      {
        id: 'calculators',
        heading: 'Calculators',
        paragraphs: [
          'Calculators run in your browser. Nothing you type, such as your hours, your pay rate or your tips, is sent to us or to Google Analytics. The values you enter sit in the page address, so you can copy the link and share it. Opening or sharing that address sends it like any page request, so it can appear in Cloudflare request logs. The address with your values also stays in your browser history, like any page you visit.',
        ],
      },
      {
        id: 'email',
        heading: 'Email',
        paragraphs: [
          `If you write to ${CONTACT_EMAIL}, we use your message and your address only to reply to you. The same team runs Cuenta Horas and Maestro Calc.`,
        ],
      },
      {
        id: 'changes',
        heading: 'Changes',
        paragraphs: ['We will update this page before we add advertising.'],
      },
    ],
    reviewed: 'Last updated November 3, 2026.',
  },
  es: {
    title: 'Privacidad | Cuenta Horas',
    description:
      'Qué hace Cuenta Horas con la información: registros del hosting, Google Analytics sin los valores que escribes y calculadoras que funcionan en tu navegador.',
    h1: 'Privacidad',
    lead: 'Esta página describe qué hace Cuenta Horas con la información hoy. Cubre solo lo que el sitio hace ahora.',
    sections: [
      {
        id: 'hosting',
        heading: 'Hosting',
        paragraphs: [
          'Cuenta Horas está alojado en Cloudflare. Cuando cargas una página, Cloudflare procesa registros estándar de las solicitudes, que pueden incluir tu dirección IP, la página que pediste y tu tipo de navegador.',
        ],
      },
      {
        id: 'analitica',
        heading: 'Analítica y cookies',
        paragraphs: [
          'Cuenta Horas usa Google Analytics para contar visitas y ver qué páginas usa la gente. Empieza después de que la página terminó de cargar. El sitio no tiene publicidad ni cuentas de usuario.',
          'Google Analytics recibe la página que visitas sin los valores que escribiste, tu tipo de navegador y de dispositivo, el tamaño de tu pantalla y una ubicación aproximada que Google deduce de tu dirección IP. Fuera del Espacio Económico Europeo, el Reino Unido y Suiza, puede guardar cookies propias, como _ga, para distinguir una visita de otra.',
          'En el Espacio Económico Europeo, el Reino Unido y Suiza, Google Analytics no guarda ninguna cookie: solo recibe una señal de que se vio una página. Lo mismo pasa en cualquier lugar cuando tu navegador envía una señal Global Privacy Control. El almacenamiento publicitario y la personalización de anuncios están desactivados en todas partes.',
          'También puedes bloquear las cookies en tu navegador o instalar el complemento de inhabilitación de Google Analytics.',
        ],
      },
      {
        id: 'calculadoras',
        heading: 'Calculadoras',
        paragraphs: [
          'Las calculadoras funcionan en tu navegador. Nada de lo que escribes, como tus horas, tu pago por hora o tus propinas, se nos envía ni se envía a Google Analytics. Los valores que ingresas quedan en la dirección de la página, para que puedas copiar el enlace y compartirlo. Abrir o compartir esa dirección la envía como cualquier solicitud de página, así que puede aparecer en los registros de Cloudflare. La dirección con tus valores también queda en el historial de tu navegador, como cualquier página que visitas.',
        ],
      },
      {
        id: 'correo',
        heading: 'Correo',
        paragraphs: [
          `Si escribes a ${CONTACT_EMAIL}, usamos tu mensaje y tu dirección solo para responderte. El mismo equipo hace Cuenta Horas y Maestro Calc.`,
        ],
      },
      {
        id: 'cambios',
        heading: 'Cambios',
        paragraphs: ['Vamos a actualizar esta página antes de agregar publicidad.'],
      },
    ],
    reviewed: 'Última actualización: 3 de noviembre de 2026.',
  },
};
