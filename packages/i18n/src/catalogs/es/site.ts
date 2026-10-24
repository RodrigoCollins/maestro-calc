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
  'page.home.heading': 'Maestro Calc',
  'page.home.intro':
    'Calcula tu obra y sabe qué comprar. Estamos preparando las primeras calculadoras y explicaremos cómo sale cada número.',
  'page.home.title': 'Maestro Calc: calculadoras para tu obra',
  'page.home.description':
    'Calculadoras de obra para constructores y dueños de casa en EE. UU. Ingresa tus medidas y sabe exactamente qué comprar.',
  'page.notFound.heading': 'Página no encontrada',
  'page.notFound.body': 'La página que buscas no existe o cambió de lugar.',
  'page.notFound.homeLink': 'Ir a la página de inicio',
  'page.notFound.title': 'Página no encontrada | Maestro Calc',
  'page.notFound.description':
    'La página que buscas no existe o cambió de lugar. Vuelve a la página de inicio de Maestro Calc.',
} as const satisfies CatalogOf<typeof enSite>;
