/** The address readers write to, on the site's own domain (it forwards to the team's inbox). */
export const CONTACT_EMAIL = 'hola@poolfigures.com';

/** What Pool Figures does with information today (the privacy page, as Cuenta Horas' `/privacy`). */
export const PRIVACY = {
  title: 'Privacy | Pool Figures',
  description:
    'What Pool Figures does with information: hosting logs, Google Analytics without the values you type, and calculators that run in your browser.',
  h1: 'Privacy',
  lead: 'This page describes what Pool Figures does with information today. It covers only what the site does now.',
  sections: [
    {
      id: 'hosting',
      heading: 'Hosting',
      paragraphs: [
        'Pool Figures is hosted on Cloudflare. When you load a page, Cloudflare processes standard request logs, which can include your IP address, the page you asked for and your browser type.',
      ],
    },
    {
      id: 'analytics',
      heading: 'Analytics and cookies',
      paragraphs: [
        'Pool Figures uses Google Analytics to count visits and see which pages people use. It starts after the page has loaded. The site has no advertising and no accounts.',
        'Google Analytics receives the page you visit without the values you typed, your browser and device type, your screen size and an approximate location that Google derives from your IP address. Outside the European Economic Area, the United Kingdom and Switzerland, it can set first-party cookies, such as _ga, to tell one visit from another.',
        'In the European Economic Area, the United Kingdom and Switzerland, Google Analytics sets no cookie: it only receives a signal that a page was viewed. The same applies anywhere when your browser sends a Global Privacy Control signal. Advertising storage and ad personalization are off everywhere.',
        "You can also block cookies in your browser or install Google's opt-out add-on for Google Analytics.",
      ],
    },
    {
      id: 'calculators',
      heading: 'Calculators',
      paragraphs: [
        'Calculators run in your browser. Nothing you type, such as the size of your pool or your water readings, is sent to us or to Google Analytics. The values you enter sit in the page address, so you can copy the link and share it. Opening or sharing that address sends it like any page request, so it can appear in Cloudflare request logs. The address with your values also stays in your browser history, like any page you visit.',
      ],
    },
    {
      id: 'email',
      heading: 'Email',
      paragraphs: [
        `If you write to ${CONTACT_EMAIL}, we use your message and your address only to reply to you. The same team runs Pool Figures, Cuenta Horas and Maestro Calc.`,
      ],
    },
    {
      id: 'changes',
      heading: 'Changes',
      paragraphs: ['We will update this page before we add advertising.'],
    },
  ],
  reviewed: 'Last updated November 4, 2026.',
} as const;

/** The privacy page in Spanish: the same sections and paragraphs, the same promises. */
const PRIVACY_ES = {
  title: 'Privacidad | Pool Figures',
  description:
    'Qué hace Pool Figures con la información: registros del hosting, Google Analytics sin los valores que escribes y calculadoras que funcionan en tu navegador.',
  h1: 'Privacidad',
  lead: 'Esta página describe qué hace hoy Pool Figures con la información. Solo cubre lo que el sitio hace ahora.',
  sections: [
    {
      id: 'hosting',
      heading: 'Hosting',
      paragraphs: [
        'Pool Figures está alojado en Cloudflare. Cuando cargas una página, Cloudflare procesa los registros normales de cada solicitud, que pueden incluir tu dirección IP, la página que pediste y tu tipo de navegador.',
      ],
    },
    {
      id: 'analytics',
      heading: 'Analítica y cookies',
      paragraphs: [
        'Pool Figures usa Google Analytics para contar visitas y ver qué páginas se usan. Empieza después de que la página termina de cargar. El sitio no tiene publicidad ni cuentas.',
        'Google Analytics recibe la página que visitas sin los valores que escribiste, tu tipo de navegador y de dispositivo, el tamaño de tu pantalla y una ubicación aproximada que Google deduce de tu dirección IP. Fuera del Espacio Económico Europeo, el Reino Unido y Suiza, puede guardar cookies propias, como _ga, para distinguir una visita de otra.',
        'En el Espacio Económico Europeo, el Reino Unido y Suiza, Google Analytics no guarda ninguna cookie: solo recibe una señal de que se vio una página. Lo mismo pasa en cualquier lugar si tu navegador envía la señal Global Privacy Control. El almacenamiento para publicidad y la personalización de anuncios están apagados en todas partes.',
        'También puedes bloquear las cookies en tu navegador o instalar el complemento de Google para inhabilitar Google Analytics.',
      ],
    },
    {
      id: 'calculators',
      heading: 'Calculadoras',
      paragraphs: [
        'Las calculadoras funcionan en tu navegador. Nada de lo que escribes, como el tamaño de tu piscina o las lecturas de tu agua, se envía a nosotros ni a Google Analytics. Los valores que ingresas quedan en la dirección de la página, así que puedes copiar el enlace y compartirlo. Abrir o compartir esa dirección la envía como cualquier solicitud de página, así que puede aparecer en los registros de Cloudflare. La dirección con tus valores también queda en el historial de tu navegador, como cualquier página que visitas.',
      ],
    },
    {
      id: 'email',
      heading: 'Correo',
      paragraphs: [
        `Si escribes a ${CONTACT_EMAIL}, usamos tu mensaje y tu dirección solo para responderte. El mismo equipo hace Pool Figures, Cuenta Horas y Maestro Calc.`,
      ],
    },
    {
      id: 'changes',
      heading: 'Cambios',
      paragraphs: ['Actualizaremos esta página antes de agregar publicidad.'],
    },
  ],
  reviewed: 'Actualizado el 6 de noviembre de 2026.',
} as const;

/** The privacy page in each language. */
export const PRIVACY_TEXTS: {
  readonly en: typeof PRIVACY;
  readonly es: typeof PRIVACY_ES;
} = { en: PRIVACY, es: PRIVACY_ES };
