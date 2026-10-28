import type { CatalogOf } from '../../translate.ts';
import type { enSite } from '../en/site.ts';

/** Site shell and page metadata, Spanish (neutral, tú): the same keys as English. */
export const esSite = {
  'site.tagline': 'Calcula tu obra y sabe qué comprar',
  'site.skipLink': 'Saltar al contenido principal',
  'site.nav.label': 'Navegación principal',
  'site.nav.methodology': 'Metodología',
  'site.nav.about': 'Sobre nosotros',
  'site.switch.label': 'English',
  'site.footer.privacy': 'Privacidad',
  'site.footer.terms': 'Términos',
  'site.footer.contact': 'Contacto',
  'site.footer.contactLabel': 'Escríbenos a',
  'site.trust.updated': 'Última actualización',
  'site.calculator.breadcrumb': 'Ruta de navegación',
  'site.calculator.breadcrumbHome': 'Inicio',
  'site.calculator.resultHeading': 'Resultado',
  'site.calculator.unitsLabel': 'Unidades',
  'site.calculator.unitsUs': 'EE. UU. (ft, in)',
  'site.calculator.unitsMetric': 'Métrico (m, cm)',
  'site.calculator.copyLink': 'Copiar enlace',
  'site.calculator.linkCopied': 'Enlace copiado',
  'site.calculator.copyFailed': 'No se pudo copiar. Selecciona el enlace y cópialo.',
  'site.calculator.noscript':
    'Esta página necesita JavaScript para recalcular. Si está desactivado o no cargó, el resultado de abajo es el ejemplo.',
  'site.calculator.estimateNote':
    'Son estimaciones. Confirma las cantidades con tu proveedor y el código de construcción local.',
  'site.calculator.hintFt': 'pies',
  'site.calculator.hintIn': 'pulgadas',
  'site.calculator.hintM': 'metros',
  'site.calculator.hintCm': 'centímetros',
  'page.home.heading': 'De tus medidas a la lista de compras',
  'page.home.intro': 'Calcula tu obra y sabe qué comprar. Explicamos cómo sale cada número.',
  'page.home.cards.concrete.title': 'Calculadora de concreto',
  'page.home.cards.concrete.summary':
    'Yardas cúbicas y bolsas para una losa, zapata, columna o escalones.',
  'page.home.cards.rectangle-area.title': 'Calculadora de pies cuadrados',
  'page.home.cards.rectangle-area.summary':
    'Pies, yardas y metros cuadrados para un cuarto, piso o losa.',
  'page.home.links.methodology': 'Cómo calculamos',
  'page.home.links.about': 'Sobre Maestro Calc',
  'page.home.title': 'Maestro Calc: calculadoras para tu obra',
  'page.home.description':
    'Calculadoras de obra para constructores y dueños de casa en EE. UU. Ingresa tus medidas y calcula qué comprar.',
  'page.methodology.title': 'Metodología | Maestro Calc',
  'page.methodology.description':
    'Cómo Maestro Calc calcula cada número: aritmética exacta, fórmulas probadas, fuentes citadas y un proceso de correcciones abierto.',
  'page.about.title': 'Sobre nosotros | Maestro Calc',
  'page.about.description':
    'Quién escribe Maestro Calc, cómo usamos la IA y cómo avisarnos de un error. Nuestra política editorial, en lenguaje claro.',
  'page.privacy.title': 'Privacidad | Maestro Calc',
  'page.privacy.description':
    'Qué recopila Maestro Calc y qué no: sin cookies, sin analítica, sin publicidad y sin cuentas. El sitio se aloja en Cloudflare.',
  'page.terms.title': 'Términos | Maestro Calc',
  'page.terms.description':
    'Los términos de uso de Maestro Calc: los resultados son estimaciones y debes verificarlos con un profesional calificado y el código de construcción local.',
  'page.contact.title': 'Contacto | Maestro Calc',
  'page.contact.description':
    'Escribe a Maestro Calc a contacto@maestrocalc.com. ¿Encontraste un error en un cálculo o en una página? Cuéntanos y lo revisaremos.',
  'page.concrete.title': 'Calculadora de concreto en yardas y bolsas | Maestro Calc',
  'page.concrete.description':
    'Calcula las yardas cúbicas y las bolsas de concreto para una losa, zapata, columna o escalones. Gratis, al instante, en pies, pulgadas o metros.',
  'page.rectangle-area.title': 'Calculadora de pies cuadrados de un cuarto | Maestro Calc',
  'page.rectangle-area.description':
    'Calcula los pies cuadrados de un cuarto, piso o losa con su largo y ancho, más yardas y metros cuadrados. Gratis, al instante, en pies, pulgadas o metros.',
  'page.notFound.heading': 'Página no encontrada',
  'page.notFound.body': 'La página que buscas no existe o cambió de lugar.',
  'page.notFound.homeLink': 'Ir a la página de inicio',
  'page.notFound.title': 'Página no encontrada | Maestro Calc',
  'page.notFound.description':
    'La página que buscas no existe o cambió de lugar. Vuelve a la página de inicio de Maestro Calc.',
} as const satisfies CatalogOf<typeof enSite>;
