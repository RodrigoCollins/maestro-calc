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
  'page.home.heading': 'Maestro Calc',
  'page.home.intro':
    'Calcula tu obra y sabe qué comprar. Estamos preparando las primeras calculadoras y explicaremos cómo sale cada número.',
  'page.home.links.methodology': 'Cómo calculamos',
  'page.home.links.about': 'Sobre Maestro Calc',
  'page.home.title': 'Maestro Calc: calculadoras para tu obra',
  'page.home.description':
    'Calculadoras de obra para constructores y dueños de casa en EE. UU. Ingresa tus medidas y sabe exactamente qué comprar.',
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
    'Los términos de uso de Maestro Calc: los resultados son estimaciones y debes verificarlos con un profesional calificado y el código local.',
  'page.contact.title': 'Contacto | Maestro Calc',
  'page.contact.description':
    'Escribe a Maestro Calc a contacto@maestrocalc.com. ¿Encontraste un error en un cálculo o en una página? Cuéntanos y lo revisaremos.',
  'page.notFound.heading': 'Página no encontrada',
  'page.notFound.body': 'La página que buscas no existe o cambió de lugar.',
  'page.notFound.homeLink': 'Ir a la página de inicio',
  'page.notFound.title': 'Página no encontrada | Maestro Calc',
  'page.notFound.description':
    'La página que buscas no existe o cambió de lugar. Vuelve a la página de inicio de Maestro Calc.',
} as const satisfies CatalogOf<typeof enSite>;
