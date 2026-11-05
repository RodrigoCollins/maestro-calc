import type { CatalogOf } from '../../translate.ts';
import type { enSite } from '../en/site.ts';

/** Site shell and page metadata, Spanish (neutral, tú): the same keys as English. */
export const esSite = {
  'site.tagline': 'Calcula tu obra y sabe qué comprar',
  'site.skipLink': 'Saltar al contenido principal',
  'site.nav.label': 'Navegación principal',
  'site.nav.guides': 'Guías',
  'site.nav.methodology': 'Metodología',
  'site.nav.about': 'Sobre nosotros',
  'site.switch.label': 'English',
  'site.footer.privacy': 'Privacidad',
  'site.footer.terms': 'Términos',
  'site.footer.contact': 'Contacto',
  'site.footer.embed-calculators': 'Calculadoras para tu sitio',
  'site.footer.glossary': 'Glosario de obra',
  'site.footer.guides': 'Todas las guías',
  'site.glossary.term': 'Español',
  'site.glossary.other': 'Inglés',
  'site.glossary.definition': 'Qué significa',
  'site.glossary.groups.concrete': 'Concreto',
  'site.glossary.groups.landscaping': 'Jardinería',
  'site.glossary.groups.drywall': 'Drywall',
  'site.glossary.groups.roofing': 'Techos',
  'site.glossary.groups.paint': 'Pintura',
  'site.glossary.groups.measuring': 'Medidas y la obra',
  'site.glossary.groups.business': 'El negocio',
  'site.embed.by': 'de',
  'site.guide.cta': 'Haz la cuenta para tu obra',
  'site.guide.allCalculators': 'Todas nuestras calculadoras',
  'site.hub.calculators': 'Calculadoras',
  'site.hub.guides': 'Guías',
  'site.hub.jobs': 'Trabajos comunes',
  'site.job.cases': 'El mismo trabajo en otras medidas',
  'site.job.note.concrete':
    'Cada cifra suma un 10% extra por desperdicio, el valor inicial de la calculadora de concreto, y se redondea hacia arriba a bolsas enteras. Cada medida abre la calculadora con sus valores ya cargados.',
  'site.job.note.roof-pitch':
    'Cada largo de cabio se mide sobre la pendiente a lo largo del recorrido, sin alero y sin descontar la cumbrera. Cada recorrido abre la calculadora con sus valores ya cargados, donde puedes sumar el alero.',
  'site.job.note.rectangle-area':
    'El área de un rectángulo es su largo por su ancho. Una yarda cuadrada son 9 pies cuadrados, y un pie cuadrado es exactamente 0.09290304 metros cuadrados. Cada medida abre la calculadora con sus valores ya cargados.',
  'site.job.note.mulch':
    'Una yarda cúbica es exactamente 27 pies cúbicos, y una bolsa contiene el volumen impreso en ella. Las cantidades no suman extra y se redondean hacia arriba a bolsas enteras: 27 ÷ 2 = 13.5, así que 14 bolsas de 2 cu ft. Cada tamaño abre la calculadora de mulch con un área de 9 por 9 ft y 4 in de profundidad: una yarda cúbica.',
  'site.job.cubicFeet': 'pies cúbicos',
  'site.job.bagsFor': 'Bolsas para',
  'site.job.area': 'Área',
  'site.pitchDegrees.heading': 'Pendiente de techo en grados',
  'site.pitchDegrees.note':
    'Cada ángulo es la arcotangente de la subida sobre 12 in de recorrido, calculada por la calculadora de pendiente de techo.',
  'site.pitchDegrees.pitch': 'Pendiente',
  'site.job.multiplier': 'Multiplicador del cabio (pies de cabio por pie de recorrido)',
  'site.job.methodology': 'Cómo calculamos las cifras',
  'site.job.more': 'Más trabajos',
  'site.hub.more': 'Más herramientas:',
  'site.guides.business': 'El negocio',
  'site.guide.links': 'Aprende más en nuestras guías',
  'site.footer.contactLabel': 'Escríbenos a',
  'site.footer.hubs': 'Calculadoras por oficio',
  'site.footer.more': 'Recursos',
  'site.footer.note':
    'Cada cifra es una estimación. Confirma las cantidades con tu proveedor y el código de construcción local.',
  'site.footer.hub-concrete': 'Concreto',
  'site.footer.hub-roofing': 'Techos',
  'site.footer.hub-drywall': 'Drywall',
  'site.footer.hub-landscaping': 'Jardinería',
  'site.footer.hub-measurement': 'Medidas',
  'site.footer.hub-paint': 'Pintura',
  'site.guide.kicker': 'Guía',
  'site.guide.toc': 'En esta guía',
  'site.guide.readingTime': 'min de lectura',
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
  'site.calculator.print': 'Imprimir',
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
  'page.home.hubs': 'Por oficio',
  'page.home.links.methodology': 'Cómo calculamos',
  'page.home.links.about': 'Sobre Maestro Calc',
  'page.home.kicker': 'Calculadoras gratis para tu obra, en inglés y español',
  'page.home.cta': 'Calcula tu concreto',
  'page.home.ctaAll': 'Ver todas las calculadoras',
  'page.home.share.title': 'Manda la lista a tu equipo',
  'page.home.share.text':
    'Cada resultado tiene un enlace con tus números, un botón de WhatsApp y una vista para imprimir.',
  'page.home.sample': 'Losa de concreto',
  'page.home.calculators': 'Calculadoras',
  'page.home.guides': 'Guías para la obra',
  'page.home.trust': 'Cómo sacamos los números',
  'page.home.trust.sources.title': 'Fuentes en cada página',
  'page.home.trust.sources.text':
    'Los rendimientos de las bolsas salen de las hojas técnicas de los fabricantes, y las pendientes de techo, del IRC.',
  'page.home.trust.math.title': 'Cuentas exactas',
  'page.home.trust.math.text':
    'Las fracciones se mantienen exactas hasta el último paso; solo se redondea hacia arriba lo que compras.',
  'page.home.trust.languages.title': 'Inglés y español',
  'page.home.trust.languages.text':
    'Los mismos números en los dos idiomas, con los términos que se usan en las obras de EE. UU.',
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
  'page.glossary.title': 'Glosario de construcción inglés-español | Maestro Calc',
  'page.glossary.description':
    'Términos de obra en inglés y español, por oficio, con lo que significa cada uno: concreto, jardinería, drywall, techos, pintura y el negocio.',
  'page.guides.title': 'Guías para la obra, por oficio | Maestro Calc',
  'page.guides.description':
    'Todas las guías de Maestro Calc por oficio: concreto, techos, drywall, jardinería, medidas, pintura y el negocio, cada una con su calculadora.',
  'page.guide-concrete-bags-or-truck.title': '¿Concreto en bolsas o en camión? | Maestro Calc',
  'page.guide-concrete-bags-or-truck.description':
    'Cuándo conviene comprar bolsas de mezcla para concreto y cuándo un camión de premezclado: una yarda cúbica en bolsas, cargos por carga chica y cómo comparar.',
  'page.guide-tape-measure-fractions.title':
    'Cómo leer la cinta métrica y sumar fracciones | Maestro Calc',
  'page.guide-tape-measure-fractions.description':
    'Qué significa cada marca de la cinta métrica, hasta 1/16 de pulgada, y cómo sumar, restar y dividir pies, pulgadas y fracciones sin errores.',
  'page.guide-square-footage.title': 'Cómo calcular pies cuadrados | Maestro Calc',
  'page.guide-square-footage.description':
    'Cómo sacar los pies cuadrados de un cuarto o de un área en forma de L, y cómo pasar de pies cuadrados a yardas cuadradas y metros cuadrados, y al revés.',
  'page.guide-drywall-estimate.title':
    'Cómo calcular y cotizar un trabajo de drywall | Maestro Calc',
  'page.guide-drywall-estimate.description':
    'Mide el cuarto, calcula placas, compuesto y cinta, elige el nivel de terminación y arma una cotización de drywall que tu cliente entienda.',
  'page.guide-roof-pitch.title': 'Cómo medir un techo y su pendiente | Maestro Calc',
  'page.guide-roof-pitch.description':
    'Mide la pendiente de un techo con un nivel, pásala a ángulo y a largo de cabio, saca el área en cuadrados y revisa la pendiente mínima del IRC.',
  'page.guide-concrete-quote.title': 'Cómo cotizar un trabajo de concreto | Maestro Calc',
  'page.guide-concrete-quote.description':
    'Calcula el concreto del colado, anota la cimbra, la base, el refuerzo y el flete, divide el trabajo y arma una cotización que tu cliente pueda revisar.',
  'page.guide-contractor-license.title': 'Cómo sacar la licencia de contratista | Maestro Calc',
  'page.guide-contractor-license.description':
    'Encuentra la junta de tu estado, revisa si tu trabajo necesita licencia, documenta tu experiencia, aprueba los exámenes y consigue la fianza.',
  'page.guide-paint-quote.title': 'Cómo cotizar un trabajo de pintura | Maestro Calc',
  'page.guide-paint-quote.description':
    'Mide las paredes, calcula los galones y las latas, anota los materiales y la preparación, divide el trabajo y arma una cotización de pintura clara.',
  'page.guide-gravel-driveway.title': '¿Cuánta grava lleva una entrada de autos? | Maestro Calc',
  'page.guide-gravel-driveway.description':
    'Planea una entrada de grava: las capas y su espesor, el bombeo que saca el agua, la grava de la superficie, y las toneladas y yardas cúbicas a pedir.',
  'page.guide-raised-bed-soil.title': '¿Cuánta tierra lleva una cama elevada? | Maestro Calc',
  'page.guide-raised-bed-soil.description':
    'Qué tan honda llenar una cama elevada según el cultivo, con qué llenarla, y cuántas yardas cúbicas o bolsas de tierra y composta comprar.',
  'page.guide-roofing-quote.title': 'Cómo cotizar un trabajo de techo | Maestro Calc',
  'page.guide-roofing-quote.description':
    'Mide el techo en cuadrados, cuenta los paquetes y el fieltro, anota todo lo que rodea a las tejas y el trabajo, y arma una cotización de techo clara.',
  'page.guide-fence-post-concrete.title':
    '¿Cuánto concreto lleva un poste de cerca? | Maestro Calc',
  'page.guide-fence-post-concrete.description':
    'Define el hoyo de un poste de cerca, calcula el concreto y las bolsas para un poste o para toda la cerca, y coloca el poste paso a paso.',
  'page.guide-mulch.title': '¿Cuánto mulch necesito? | Maestro Calc',
  'page.guide-mulch.description':
    'Mide el cantero, elige la profundidad y convierte largo × ancho × profundidad en pies cúbicos, yardas cúbicas y bolsas de mulch de 2 o 3 pies cúbicos.',
  'page.guide-cubic-yards.title': 'Cómo calcular yardas cúbicas | Maestro Calc',
  'page.guide-cubic-yards.description':
    'Largo × ancho × profundidad en pies, entre 27: yardas cúbicas de concreto, grava, tierra para jardín y mulch, con pulgadas a pies, círculos y ejemplos.',
  'page.hub-concrete.title': 'Calculadoras y guías de concreto | Maestro Calc',
  'page.hub-concrete.description':
    'Calculadoras y guías de concreto para losas, zapatas, columnas y escalones: yardas cúbicas, bolsas o camión, y cómo cotizar un trabajo.',
  'page.hub-roofing.title': 'Calculadoras y guías de techos | Maestro Calc',
  'page.hub-roofing.description':
    'Calculadoras de pendiente de techo y de tejas con su guía: mide la pendiente, saca el área en cuadrados, los paquetes y las pendientes mínimas del IRC.',
  'page.hub-drywall.title': 'Calculadoras y guías de drywall | Maestro Calc',
  'page.hub-drywall.description':
    'Calculadora y guía de drywall: placas, compuesto y cinta para un cuarto, los niveles de terminación y cómo cotizar un trabajo de drywall.',
  'page.hub-landscaping.title': 'Calculadoras de jardinería | Maestro Calc',
  'page.hub-landscaping.description':
    'Calculadoras de grava, mulch y tierra para jardín: yardas cúbicas, toneladas y bolsas para canteros, caminos y bases, también en métrico.',
  'page.hub-measurement.title': 'Calculadoras y guías de medidas | Maestro Calc',
  'page.hub-measurement.description':
    'Calculadoras de pies cuadrados y de pies y pulgadas con guías: lee la cinta métrica, suma fracciones y pasa de pies cuadrados a metros cuadrados.',
  'page.hub-paint.title': 'Calculadoras y guías de pintura | Maestro Calc',
  'page.hub-paint.description':
    'Calculadora y guía de pintura: galones y latas para las paredes de un cuarto, restando puertas y ventanas, y cómo cotizar un trabajo de pintura.',
  'page.concrete-slab-10x10.title': 'Bolsas de concreto para una losa de 10x10 | Maestro Calc',
  'page.concrete-slab-10x10.description':
    'Cuántas bolsas de concreto lleva una losa de 10 x 10 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-10x10.heading': '¿Cuántas bolsas de concreto para una losa de 10x10?',
  'page.concrete-slab-10x12.title': 'Bolsas de concreto para una losa de 10x12 | Maestro Calc',
  'page.concrete-slab-10x12.description':
    'Cuántas bolsas de concreto lleva una losa de 10 x 12 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-10x12.heading': '¿Cuántas bolsas de concreto para una losa de 10x12?',
  'page.concrete-slab-12x12.title': 'Bolsas de concreto para una losa de 12x12 | Maestro Calc',
  'page.concrete-slab-12x12.description':
    'Cuántas bolsas de concreto lleva una losa de 12 x 12 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-12x12.heading': '¿Cuántas bolsas de concreto para una losa de 12x12?',
  'page.concrete-slab-20x20.title': 'Bolsas de concreto para una losa de 20x20 | Maestro Calc',
  'page.concrete-slab-20x20.description':
    'Cuántas bolsas de concreto lleva una losa de 20 x 20 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-20x20.heading': '¿Cuántas bolsas de concreto para una losa de 20x20?',
  'page.concrete-slab-24x24.title': 'Bolsas de concreto para una losa de 24x24 | Maestro Calc',
  'page.concrete-slab-24x24.description':
    'Cuántas bolsas de concreto lleva una losa de 24 x 24 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-24x24.heading': '¿Cuántas bolsas de concreto para una losa de 24x24?',
  'page.concrete-slab-500-sq-ft.title': 'Concreto para losa de 500 ft²: 6.79 yardas | Maestro Calc',
  'page.concrete-slab-500-sq-ft.description':
    'Una losa de 500 pies cuadrados y 4 in de espesor lleva 6.17 yardas cúbicas de concreto, 6.79 con 10% de extra: las bolsas de 40, 60 u 80 lb, y a 5 o 6 in.',
  'page.concrete-slab-500-sq-ft.heading': '¿Cuánto concreto lleva una losa de 500 pies cuadrados?',
  'page.concrete-slab-500-sq-ft.intro':
    'Aquí la losa de 500 pies cuadrados se calcula como 25 por 20 ft. Cualquier largo y ancho que multiplicados den 500 pies cuadrados llevan el mismo concreto con el mismo espesor, así que escribe tus medidas en la calculadora si son otras.',
  'page.concrete-slab-650-sq-ft.title': 'Concreto para losa de 650 ft²: 8.83 yardas | Maestro Calc',
  'page.concrete-slab-650-sq-ft.description':
    'Una losa de 650 pies cuadrados y 4 in de espesor lleva 8.02 yardas cúbicas de concreto, 8.83 con 10% de extra: las bolsas de 40, 60 u 80 lb, y a 5 o 6 in.',
  'page.concrete-slab-650-sq-ft.heading': '¿Cuánto concreto lleva una losa de 650 pies cuadrados?',
  'page.concrete-slab-650-sq-ft.intro':
    'Aquí la losa de 650 pies cuadrados se calcula como 26 por 25 ft. Cualquier largo y ancho que multiplicados den 650 pies cuadrados llevan el mismo concreto con el mismo espesor, así que escribe tus medidas en la calculadora si son otras.',
  'page.concrete-slab-1000-sq-ft.title':
    'Concreto para losa de 1000 ft²: 13.58 yardas | Maestro Calc',
  'page.concrete-slab-1000-sq-ft.description':
    'Una losa de 1000 pies cuadrados y 4 in de espesor lleva 12.35 yardas cúbicas de concreto, 13.58 con 10% de extra: las bolsas de 40, 60 u 80 lb, y a 5 o 6 in.',
  'page.concrete-slab-1000-sq-ft.heading':
    '¿Cuánto concreto lleva una losa de 1000 pies cuadrados?',
  'page.concrete-slab-1000-sq-ft.intro':
    'Aquí la losa de 1000 pies cuadrados se calcula como 40 por 25 ft. Cualquier largo y ancho que multiplicados den 1000 pies cuadrados llevan el mismo concreto con el mismo espesor, así que escribe tus medidas en la calculadora si son otras.',
  'page.concrete-pad-4x4.title': 'Bolsas de concreto para una base de 4x4 | Maestro Calc',
  'page.concrete-pad-4x4.description':
    'Cuántas bolsas de concreto lleva una base de 4 x 4 ft (para un aire acondicionado o un generador) de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-pad-4x4.heading': '¿Cuántas bolsas de concreto para una base de 4x4?',
  'page.concrete-tube-8.title': 'Bolsas de concreto para un Sonotube de 8 in | Maestro Calc',
  'page.concrete-tube-8.description':
    'Cuántas bolsas de concreto llenan un Sonotube (tubo de cartón para columnas) de 8 in y 2, 3 o 4 ft de profundidad, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-tube-8.heading': '¿Cuántas bolsas de concreto para un Sonotube de 8 in?',
  'page.concrete-tube-10.title': 'Bolsas de concreto para un Sonotube de 10 in | Maestro Calc',
  'page.concrete-tube-10.description':
    'Cuántas bolsas de concreto llenan un Sonotube (tubo de cartón para columnas) de 10 in y 2, 3 o 4 ft de profundidad, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-tube-10.heading': '¿Cuántas bolsas de concreto para un Sonotube de 10 in?',
  'page.concrete-tube-12.title': 'Bolsas de concreto para un Sonotube de 12 in | Maestro Calc',
  'page.concrete-tube-12.description':
    'Cuántas bolsas de concreto llenan un Sonotube (tubo de cartón para columnas) de 12 in y 2, 3 o 4 ft de profundidad, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-tube-12.heading': '¿Cuántas bolsas de concreto para un Sonotube de 12 in?',
  'page.roof-pitch-3-12.title': 'Pendiente de techo 3/12 en grados: 14.04° | Maestro Calc',
  'page.roof-pitch-3-12.description':
    'Una pendiente de techo 3/12 mide 14.04 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-3-12.heading': 'Pendiente de techo 3/12: 14.04° y el largo del cabio',
  'page.roof-pitch-4-12.title': 'Pendiente de techo 4/12 en grados: 18.43° | Maestro Calc',
  'page.roof-pitch-4-12.description':
    'Una pendiente de techo 4/12 mide 18.43 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-4-12.heading': 'Pendiente de techo 4/12: 18.43° y el largo del cabio',
  'page.roof-pitch-5-12.title': 'Pendiente de techo 5/12 en grados: 22.62° | Maestro Calc',
  'page.roof-pitch-5-12.description':
    'Una pendiente de techo 5/12 mide 22.62 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-5-12.heading': 'Pendiente de techo 5/12: 22.62° y el largo del cabio',
  'page.roof-pitch-6-12.title': 'Pendiente de techo 6/12 en grados: 26.57° | Maestro Calc',
  'page.roof-pitch-6-12.description':
    'Una pendiente de techo 6/12 mide 26.57 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-6-12.heading': 'Pendiente de techo 6/12: 26.57° y el largo del cabio',
  'page.roof-pitch-7-12.title': 'Pendiente de techo 7/12 en grados: 30.26° | Maestro Calc',
  'page.roof-pitch-7-12.description':
    'Una pendiente de techo 7/12 mide 30.26 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-7-12.heading': 'Pendiente de techo 7/12: 30.26° y el largo del cabio',
  'page.roof-pitch-8-12.title': 'Pendiente de techo 8/12 en grados: 33.69° | Maestro Calc',
  'page.roof-pitch-8-12.description':
    'Una pendiente de techo 8/12 mide 33.69 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-8-12.heading': 'Pendiente de techo 8/12: 33.69° y el largo del cabio',
  'page.roof-pitch-9-12.title': 'Pendiente de techo 9/12 en grados: 36.87° | Maestro Calc',
  'page.roof-pitch-9-12.description':
    'Una pendiente de techo 9/12 mide 36.87 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-9-12.heading': 'Pendiente de techo 9/12: 36.87° y el largo del cabio',
  'page.roof-pitch-10-12.title': 'Pendiente de techo 10/12 en grados: 39.81° | Maestro Calc',
  'page.roof-pitch-10-12.description':
    'Una pendiente de techo 10/12 mide 39.81 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-10-12.heading': 'Pendiente de techo 10/12: 39.81° y el largo del cabio',
  'page.roof-pitch-12-12.title': 'Pendiente de techo 12/12 en grados: 45.00° | Maestro Calc',
  'page.roof-pitch-12-12.description':
    'Una pendiente de techo 12/12 mide 45.00 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-12-12.heading': 'Pendiente de techo 12/12: 45.00° y el largo del cabio',
  'page.square-feet-5x5.title': '5x5 en pies cuadrados: 25 pies cuadrados | Maestro Calc',
  'page.square-feet-5x5.description':
    'Un área de 5 por 5 ft mide 25 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-5x5.heading': '¿Cuántos pies cuadrados son 5x5?',
  'page.square-feet-5x5.intro':
    'Un cuadrado de 5 por 5 ft es un clóset chico, el piso de una ducha o un descanso de escalera.',
  'page.square-feet-5x10.title': '5x10 en pies cuadrados: 50 pies cuadrados | Maestro Calc',
  'page.square-feet-5x10.description':
    'Un área de 5 por 10 ft mide 50 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-5x10.heading': '¿Cuántos pies cuadrados son 5x10?',
  'page.square-feet-5x10.intro':
    'Un área de 5 por 10 ft es un baño común, un vestidor o una bodega chica.',
  'page.square-feet-7x12.title': '7x12 en pies cuadrados: 84 pies cuadrados | Maestro Calc',
  'page.square-feet-7x12.description':
    'Un área de 7 por 12 ft (12 por 7) mide 84 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-7x12.heading': '¿Cuántos pies cuadrados son 7x12 (12x7)?',
  'page.square-feet-7x12.intro':
    'Un área de 7 por 12 ft, también escrita 12x7, es un baño angosto, un cuarto de lavado o un pasillo.',
  'page.square-feet-10x10.title': '10x10 en pies cuadrados: 100 pies cuadrados | Maestro Calc',
  'page.square-feet-10x10.description':
    'Un área de 10 por 10 ft mide 100 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-10x10.heading': '¿Cuántos pies cuadrados son 10x10?',
  'page.square-feet-10x10.intro':
    'Un cuarto de 10 por 10 ft es un dormitorio chico, una oficina en casa o el piso de un cobertizo de jardín.',
  'page.square-feet-10x12.title': '10x12 en pies cuadrados: 120 pies cuadrados | Maestro Calc',
  'page.square-feet-10x12.description':
    'Un área de 10 por 12 ft mide 120 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-10x12.heading': '¿Cuántos pies cuadrados son 10x12?',
  'page.square-feet-10x12.intro':
    'Un cuarto de 10 por 12 ft es un segundo dormitorio típico, y una medida común para un cobertizo o un patio.',
  'page.square-feet-11x14.title': '11x14 en pies cuadrados: 154 pies cuadrados | Maestro Calc',
  'page.square-feet-11x14.description':
    'Un área de 11 por 14 ft (14 por 11) mide 154 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-11x14.heading': '¿Cuántos pies cuadrados son 11x14 (14x11)?',
  'page.square-feet-11x14.intro':
    'Un cuarto de 11 por 14 ft, también escrito 14x11, es un dormitorio mediano o un comedor.',
  'page.square-feet-11x16.title': '11x16 en pies cuadrados: 176 pies cuadrados | Maestro Calc',
  'page.square-feet-11x16.description':
    'Un área de 11 por 16 ft (16 por 11) mide 176 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-11x16.heading': '¿Cuántos pies cuadrados son 11x16 (16x11)?',
  'page.square-feet-11x16.intro':
    'Un cuarto de 11 por 16 ft, también escrito 16x11, es un dormitorio largo, un estudio o una sala familiar.',
  'page.square-feet-12x12.title': '12x12 en pies cuadrados: 144 pies cuadrados | Maestro Calc',
  'page.square-feet-12x12.description':
    'Un área de 12 por 12 ft mide 144 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-12x12.heading': '¿Cuántos pies cuadrados son 12x12?',
  'page.square-feet-12x12.intro':
    'Un cuarto de 12 por 12 ft es un dormitorio estándar, y una medida común para una terraza o una losa de patio.',
  'page.square-feet-12x14.title': '12x14 en pies cuadrados: 168 pies cuadrados | Maestro Calc',
  'page.square-feet-12x14.description':
    'Un área de 12 por 14 ft mide 168 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-12x14.heading': '¿Cuántos pies cuadrados son 12x14?',
  'page.square-feet-12x14.intro':
    'Un cuarto de 12 por 14 ft es una medida común para un dormitorio principal o una sala.',
  'page.square-feet-12x30.title': '12x30 en pies cuadrados: 360 pies cuadrados | Maestro Calc',
  'page.square-feet-12x30.description':
    'Un área de 12 por 30 ft (30 por 12) mide 360 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-12x30.heading': '¿Cuántos pies cuadrados son 12x30 (30x12)?',
  'page.square-feet-12x30.intro':
    'Un área de 12 por 30 ft, también escrita 30 por 12, es un porche largo, una terraza a lo largo de la casa o una entrada para un auto.',
  'page.square-feet-20x20.title': '20x20 en pies cuadrados: 400 pies cuadrados | Maestro Calc',
  'page.square-feet-20x20.description':
    'Un área de 20 por 20 ft mide 400 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-20x20.heading': '¿Cuántos pies cuadrados son 20x20?',
  'page.square-feet-20x20.intro':
    'Un área de 20 por 20 ft es el piso de un garaje para dos autos o un patio grande.',
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
  'page.mulch-bags-per-yard.title': 'Bolsas de mulch en una yarda cúbica | Maestro Calc',
  'page.mulch-bags-per-yard.description':
    'Una yarda cúbica de mulch son 27 pies cúbicos: 18 bolsas de 1.5 cu ft, 14 bolsas de 2 cu ft o 9 bolsas de 3 cu ft, y las bolsas para 2 o 3 yardas cúbicas.',
  'page.mulch-bags-per-yard.heading': '¿Cuántas bolsas de mulch hay en una yarda cúbica?',
  'page.mulch-bags-per-yard.intro':
    'El mulch se vende en bolsas de 1.5, 2 o 3 pies cúbicos, y a granel por yarda cúbica. Divide 27 entre el tamaño de la bolsa y redondea hacia arriba: una yarda cúbica lleva 18 bolsas de 1.5 cu ft, 14 de 2 cu ft o 9 de 3 cu ft.',
  'page.mulch.title': 'Calculadora de mulch en yardas y bolsas | Maestro Calc',
  'page.mulch.description':
    'Calcula cuánto mulch lleva un área de jardín en yardas cúbicas y bolsas de 1.5, 2 o 3 cu ft, con el costo en bolsas y a granel. Gratis y al instante.',
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
  'page.feet-inches.title': 'Calculadora de decimales a pies y pulgadas | Maestro Calc',
  'page.feet-inches.description':
    'Convierte medidas de decimales a pies y pulgadas con fracciones al 1/16 de pulgada, y suma, resta, multiplica o divide pies y pulgadas como en la cinta. Gratis.',
  'page.notFound.heading': 'Página no encontrada',
  'page.notFound.body': 'La página que buscas no existe o cambió de lugar.',
  'page.notFound.homeLink': 'Ir a la página de inicio',
  'page.notFound.title': 'Página no encontrada | Maestro Calc',
  'page.notFound.description':
    'La página que buscas no existe o cambió de lugar. Vuelve a la página de inicio de Maestro Calc.',
} as const satisfies CatalogOf<typeof enSite>;
