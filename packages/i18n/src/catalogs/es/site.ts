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
  'site.footer.embed-calculators': 'Calculadoras para tu sitio',
  'site.embed.by': 'de',
  'site.guide.cta': 'Haz la cuenta para tu obra',
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
  'site.calculator.shareWhatsApp': 'Enviar por WhatsApp',
  'site.calculator.shareText': 'Mira este cálculo:',
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
  'page.home.cards.gravel.title': 'Calculadora de grava',
  'page.home.cards.gravel.summary':
    'Toneladas y yardas cúbicas de grava para una entrada, camino o base.',
  'page.home.cards.mulch.title': 'Calculadora de mulch',
  'page.home.cards.mulch.summary': 'Yardas cúbicas y bolsas de mulch para un área de jardín.',
  'page.home.cards.topsoil.title': 'Calculadora de tierra para jardín',
  'page.home.cards.topsoil.summary':
    'Yardas cúbicas y bolsas de tierra para un césped, una jardinera o un relleno.',
  'page.home.cards.paint.title': 'Calculadora de pintura',
  'page.home.cards.paint.summary':
    'Galones de pintura y latas a comprar para las paredes de un cuarto.',
  'page.home.cards.drywall.title': 'Calculadora de drywall',
  'page.home.cards.drywall.summary':
    'Placas, compuesto y cinta para las paredes y el techo de un cuarto.',
  'page.home.cards.roof-pitch.title': 'Calculadora de pendiente de techo',
  'page.home.cards.roof-pitch.summary':
    'Pendiente, ángulo y largo del cabio, con el mínimo del IRC.',
  'page.home.cards.roofing.title': 'Calculadora de tejas para techo',
  'page.home.cards.roofing.summary':
    'Cuadrados de techo según la planta y la pendiente, con los paquetes de tejas y rollos de fieltro.',
  'page.home.cards.feet-inches.title': 'Calculadora de pies y pulgadas',
  'page.home.cards.feet-inches.summary':
    'Suma, resta, multiplica o divide medidas de cinta, al 1/16 de pulgada.',
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
  'page.embed-calculators.title': 'Calculadoras para tu sitio | Maestro Calc',
  'page.embed-calculators.description':
    'Pon gratis cualquier calculadora de Maestro Calc en tu sitio web: copia el código, pégalo en tu página y deja el enlace de crédito.',
  'page.guide-concrete-bags-or-truck.title': '¿Concreto en bolsas o en camión? | Maestro Calc',
  'page.guide-concrete-bags-or-truck.description':
    'Cuándo conviene comprar bolsas de mezcla para concreto y cuándo un camión de premezclado: una yarda cúbica en bolsas, cargos por carga chica y cómo comparar.',
  'page.contact.title': 'Contacto | Maestro Calc',
  'page.contact.description':
    'Escribe a Maestro Calc a contacto@maestrocalc.com. ¿Encontraste un error en un cálculo o en una página? Cuéntanos y lo revisaremos.',
  'page.concrete.title': 'Calculadora de concreto en yardas y bolsas | Maestro Calc',
  'page.concrete.description':
    'Calcula las yardas cúbicas y las bolsas de concreto para una losa, zapata, columna o escalones. Gratis, al instante, en pies, pulgadas o metros.',
  'page.rectangle-area.title': 'Calculadora de pies cuadrados de un cuarto | Maestro Calc',
  'page.rectangle-area.description':
    'Calcula los pies cuadrados de un cuarto, piso o losa con su largo y ancho, más yardas y metros cuadrados. Gratis, al instante, en pies, pulgadas o metros.',
  'page.gravel.title': 'Calculadora de grava en toneladas y yardas | Maestro Calc',
  'page.gravel.description':
    'Calcula cuántas toneladas de grava pedir para una entrada, camino o base, compactada o suelta, con las yardas cúbicas y el costo. Gratis y al instante.',
  'page.mulch.title': 'Calculadora de mulch en yardas y bolsas | Maestro Calc',
  'page.mulch.description':
    'Calcula cuánto mulch lleva un área de jardín en yardas cúbicas y bolsas de 2 o 3 cu ft, con el costo en bolsas y a granel. Gratis y al instante.',
  'page.topsoil.title': 'Calculadora de tierra para jardín en yardas | Maestro Calc',
  'page.topsoil.description':
    'Calcula cuánta tierra lleva un césped, una jardinera o un relleno en yardas cúbicas y bolsas, con extra por asentamiento y el costo en bolsas y a granel.',
  'page.paint.title': 'Calculadora de pintura: galones por cuarto | Maestro Calc',
  'page.paint.description':
    'Calcula cuántos galones de pintura llevan las paredes de un cuarto, sin puertas ni ventanas, para una a cinco manos, con las latas y el costo. Gratis.',
  'page.drywall.title': 'Calculadora de drywall: placas y compuesto | Maestro Calc',
  'page.drywall.description':
    'Calcula cuántas placas de drywall lleva un cuarto, paredes y techo, sin puertas ni ventanas, con el compuesto, la cinta y el costo. Gratis y al instante.',
  'page.roof-pitch.title': 'Calculadora de pendiente de techo | Maestro Calc',
  'page.roof-pitch.description':
    'Calcula la pendiente de un techo en 12, su ángulo y el largo del cabio, y compárala con el mínimo del IRC para tejas, metal o pizarra. Gratis.',
  'page.roofing.title': 'Calculadora de tejas para techo | Maestro Calc',
  'page.roofing.description':
    'Calcula el área de un techo en cuadrados según su planta y pendiente, los paquetes de tejas asfálticas y los rollos de fieltro, con las reglas del IRC. Gratis.',
  'page.feet-inches.title': 'Calculadora de pies y pulgadas | Maestro Calc',
  'page.feet-inches.description':
    'Suma, resta, multiplica o divide pies, pulgadas y fracciones como en la cinta métrica, al 1/16 de pulgada, también en pulgadas y metros. Gratis.',
  'page.notFound.heading': 'Página no encontrada',
  'page.notFound.body': 'La página que buscas no existe o cambió de lugar.',
  'page.notFound.homeLink': 'Ir a la página de inicio',
  'page.notFound.title': 'Página no encontrada | Maestro Calc',
  'page.notFound.description':
    'La página que buscas no existe o cambió de lugar. Vuelve a la página de inicio de Maestro Calc.',
} as const satisfies CatalogOf<typeof enSite>;
