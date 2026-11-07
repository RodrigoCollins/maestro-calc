/** A page of Pool Figures and the language it is written in (`<html lang>`). */
export interface Page {
  readonly path: string;
  readonly lang: 'en' | 'es';
}

const en = (path: string): Page => ({ path, lang: 'en' });
const es = (path: string): Page => ({ path, lang: 'es' });

/** Every page of Pool Figures, Spanish ones as they are built; the e2e suites run over all of them. */
export const PAGES: readonly Page[] = [
  en('/'),
  en('/methodology'),
  en('/opening-your-pool'),
  en('/closing-your-pool'),
  en('/pool-water-chemistry-chart'),
  en('/pool-chemical-dosing-chart'),
  en('/pool-volume-chart'),
  en('/charts'),
  en('/how-long-to-run-pool-pump'),
  en('/salt-water-pool-vs-chlorine-pool'),
  en('/how-to-shock-a-pool'),
  en('/how-to-lower-ph-in-a-pool'),
  en('/how-to-raise-calcium-hardness-in-a-pool'),
  en('/how-long-after-adding-chemicals-can-you-swim'),
  en('/privacy'),
  en('/about'),
  en('/editorial-policy'),
  en('/embed-calculators'),
  en('/pool-volume-calculator'),
  en('/pool-salt-calculator'),
  en('/pool-chlorine-calculator'),
  en('/pool-pump-size-calculator'),
  en('/pool-ph-calculator'),
  en('/pool-alkalinity-calculator'),
  en('/pool-stabilizer-calculator'),
  en('/pool-calcium-hardness-calculator'),
  en('/pool-heater-size-calculator'),
  en('/pool-fill-time-calculator'),
  es('/es'),
  es('/es/acerca'),
  es('/es/politica-editorial'),
  es('/es/privacidad'),
  es('/es/calculadoras-para-tu-sitio'),
  es('/es/metodologia'),
  es('/es/calculadora-de-volumen-de-piscina'),
  es('/es/calculadora-de-sal-para-piscina'),
  es('/es/calculadora-de-cloro-para-piscina'),
  es('/es/calculadora-de-ph-para-piscina'),
  es('/es/calculadora-de-alcalinidad-para-piscina'),
  es('/es/calculadora-de-bomba-para-piscina'),
  es('/es/calculadora-de-estabilizador-para-piscina'),
  es('/es/calculadora-de-dureza-de-calcio-para-piscina'),
  es('/es/calculadora-de-calentador-para-piscina'),
  es('/es/calculadora-de-tiempo-de-llenado-de-piscina'),
  es('/es/tabla-de-quimica-del-agua-de-piscina'),
  es('/es/tabla-de-dosis-de-quimicos-para-piscina'),
  es('/es/tabla-de-volumen-de-piscina'),
  es('/es/datos-y-tablas'),
  es('/es/cuanto-esperar-para-nadar-despues-de-agregar-quimicos'),
  es('/es/como-abrir-tu-piscina'),
  es('/es/como-cerrar-tu-piscina'),
  es('/es/cuantas-horas-prender-la-bomba-de-la-piscina'),
  es('/es/piscina-de-agua-salada-o-de-cloro'),
  es('/es/como-hacer-un-tratamiento-de-choque-a-la-piscina'),
  es('/es/como-bajar-el-ph-de-la-piscina'),
  es('/es/como-subir-la-dureza-de-calcio-de-la-piscina'),
];

/**
 * Each calculator: the figure it shows at its defaults (worked out at build time, so it reads with no
 * script), and one edit worked out by hand with the figure it must show after it.
 */
const ENGLISH = [
  {
    path: '/pool-volume-calculator',
    out: 'gallons',
    initial: '22,023',
    // 40 x 16 ft x 5.75 ft = 3,680 ft³, x 1,728 / 231
    edit: { field: 'length', value: '40 ft' },
    edited: '27,528',
  },
  {
    path: '/pool-salt-calculator',
    out: 'pounds',
    initial: '133.4',
    // 20,000 gal x (3,200 - 3,000) ppm x 8.34 / 1,000,000
    edit: { field: 'current', value: '3000' },
    edited: '33.4',
  },
  {
    path: '/pool-chlorine-calculator',
    out: 'liquid',
    initial: '41.0',
    // 10.24 fl oz x (5 - 1) ppm x 2 (20,000 gal)
    edit: { field: 'target', value: '5' },
    edited: '81.9',
  },
  {
    path: '/pool-pump-size-calculator',
    out: 'flow',
    initial: '55.6',
    // 36,000 gal / 360 min
    edit: { field: 'gallons', value: '36000' },
    edited: '100.0',
  },
  {
    path: '/pool-ph-calculator',
    out: 'liquid',
    initial: '36.6',
    // Taylor: 9.16 fl oz a drop per 10,000 gal, x 3 drops x 2 (20,000 gal) = 54.96 fl oz
    edit: { field: 'drops', value: '3' },
    edited: '55.0',
  },
  {
    path: '/pool-alkalinity-calculator',
    out: 'pounds',
    initial: '8.4',
    // 20,000 gal x 3.785411784 L x (100 - 90) ppm x 84.007 / 50.04 mg = 1.271 kg = 2.80 lb
    edit: { field: 'current', value: '90' },
    edited: '2.8',
  },
  {
    path: '/pool-stabilizer-calculator',
    out: 'pounds',
    initial: '5.0',
    // 20,000 gal x 3.785411784 L x (50 - 0) mg = 3.785 kg = 8.35 lb
    edit: { field: 'target', value: '50' },
    edited: '8.3',
  },
  {
    path: '/pool-calcium-hardness-calculator',
    out: 'pounds',
    initial: '5.0',
    // label: 1.25 lb per 10 ppm per 10,000 gal; 20,000 gal x (220 - 180) ppm / 80,000 = 10 lb
    edit: { field: 'target', value: '220' },
    edited: '10.0',
  },
  {
    path: '/pool-heater-size-calculator',
    out: 'btuPerHour',
    initial: '69,500',
    // 20,000 gal x 8.34 lb x 10 °F = 1,668,000 BTU over 12 hours = 139,000 BTU an hour
    edit: { field: 'hours', value: '12' },
    edited: '139,000',
  },
  {
    path: '/pool-fill-time-calculator',
    out: 'time',
    initial: '33 h 20 min',
    // 20,000 gal / 20 gpm = 1,000 minutes = 16 h 40 min
    edit: { field: 'flow', value: '20' },
    edited: '16 h 40 min',
  },
] as const;

/** The Spanish page of each calculator that has one (`apps/pool/src/routes.ts`). */
const SPANISH: Readonly<Partial<Record<(typeof ENGLISH)[number]['path'], string>>> = {
  '/pool-volume-calculator': '/es/calculadora-de-volumen-de-piscina',
  '/pool-salt-calculator': '/es/calculadora-de-sal-para-piscina',
  '/pool-chlorine-calculator': '/es/calculadora-de-cloro-para-piscina',
  '/pool-pump-size-calculator': '/es/calculadora-de-bomba-para-piscina',
  '/pool-ph-calculator': '/es/calculadora-de-ph-para-piscina',
  '/pool-alkalinity-calculator': '/es/calculadora-de-alcalinidad-para-piscina',
  '/pool-stabilizer-calculator': '/es/calculadora-de-estabilizador-para-piscina',
  '/pool-calcium-hardness-calculator': '/es/calculadora-de-dureza-de-calcio-para-piscina',
  '/pool-heater-size-calculator': '/es/calculadora-de-calentador-para-piscina',
  '/pool-fill-time-calculator': '/es/calculadora-de-tiempo-de-llenado-de-piscina',
};

/**
 * Every calculator page in each language it has. A Spanish page runs the same engine and writes its
 * numbers as the English one does (en-US, as Cuenta Horas keeps), so it shows the same figures and
 * takes the same hand-worked edit.
 */
export const CALCULATORS = [
  ...ENGLISH.map((calculator) => ({ ...calculator, lang: 'en' as const })),
  ...ENGLISH.flatMap((calculator) => {
    const path = SPANISH[calculator.path];
    return path === undefined ? [] : [{ ...calculator, path, lang: 'es' as const }];
  }),
];

/** Each calculator page is embedded at `/embed` + its path (`apps/pool/src/embed.ts`). */
export const EMBEDS = CALCULATORS.map(({ path: page, lang }) => ({
  embed: `/embed${page}`,
  page,
  lang,
}));
