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
  'site.job.note.gravel':
    'Cada cifra es grava compactada, como se coloca la base de una entrada, con un 5% extra, los valores iniciales de la calculadora de grava. El proveedor vende la grava por su volumen suelto, así que las yardas cúbicas a pedir son más que el espacio que llena. Cada profundidad abre la calculadora con sus valores ya cargados.',
  'site.job.note.paint':
    'Las cifras pintan las cuatro paredes, sin una puerta de 20 pies cuadrados ni dos ventanas de 15 cada una, en dos manos a 350 pies cuadrados por galón, los valores iniciales de la calculadora de pintura, y se redondean a latas de un galón enteras. Cada altura abre la calculadora con sus valores ya cargados.',
  'site.job.note.drywall':
    'Las cifras cubren las cuatro paredes y el techo, sin una puerta de 20 pies cuadrados ni dos ventanas de 15 cada una, con un 10% extra por cortes, los valores iniciales de la calculadora de drywall, y se redondean a placas enteras. Cada altura abre la calculadora con sus valores ya cargados.',
  'site.job.sheetsOf': 'placas de',
  'site.job.note.topsoil':
    'Las cifras suman un 10% por asentamiento, el valor inicial de la calculadora de tierra para jardín, y se redondean a bolsas enteras de 0.75 o 1.5 cu ft. Una yarda cúbica son 27 pies cúbicos. Cada profundidad abre la calculadora con sus valores ya cargados.',
  'site.job.note.roofing':
    'Las medidas son la planta del techo con sus aleros. Las cifras suman un 10% extra, el valor inicial de la calculadora de tejas, y se redondean a paquetes enteros, tres por cuadrado de 100 pies cuadrados, y a rollos enteros de fieltro sintético. Cada pendiente abre la calculadora con sus valores ya cargados.',
  'site.job.note.feet-inches':
    'Cada medida se divide de forma exacta y solo se redondea lo que la página muestra: la cinta y los pies y pulgadas al 1/16 in más cercano, las pulgadas a dos decimales y los metros a tres. Cada número abre la calculadora con la medida ya cargada.',
  'site.job.tape': 'En la cinta (pulgadas, a 1/16)',
  'site.job.cubicFeet': 'pies cúbicos',
  'site.job.bagsFor': 'Bolsas para',
  'site.job.area': 'Área',
  'site.pitchDegrees.heading': 'Pendiente de techo en grados',
  'site.pitchDegrees.note':
    'Cada ángulo es la arcotangente de la subida sobre 12 in de recorrido, calculada por la calculadora de pendiente de techo.',
  'site.pitchDegrees.pitch': 'Pendiente',
  'site.job.multiplier': 'Multiplicador del cabio (pies de cabio por pie de recorrido)',
  'site.job.methodology': 'Cómo calculamos las cifras',
  'site.job.chart.sources': 'Fuentes y supuestos',
  'site.job.chart.retrieved': 'consultado el',
  'site.job.chart.cite': 'Cita esta tabla',
  'site.job.chart.citeLead': 'Para enlazar esta tabla o citar sus cifras, usa su dirección:',
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
    'Cómo calcular pies cuadrados: multiplica el largo por el ancho. Saca los pies cuadrados de un cuarto, una pared o un área en L, y pásalos a yardas y metros.',
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
  'page.guide-concrete-bag-coverage.title': '¿Cuánto cubre una bolsa de concreto? | Maestro Calc',
  'page.guide-concrete-bag-coverage.description':
    'Pies cuadrados por bolsa de mezcla para concreto de 40, 60 y 80 lb con 4 y 6 in de espesor, y las bolsas para una losa de 10x10 con el extra.',
  'page.guide-paint-coverage.title': '¿Cuánto cubre un galón de pintura? | Maestro Calc',
  'page.guide-paint-coverage.description':
    'Un galón de pintura látex de interior cubre de 350 a 400 pies cuadrados por mano: el rendimiento según las manos y las latas para un cuarto de 12x12.',
  'page.guide-gravel-coverage.title': '¿Cuánto cubre una tonelada de grava? | Maestro Calc',
  'page.guide-gravel-coverage.description':
    'Una tonelada de grava compactada cubre unos 88 pies cuadrados con 2 in, 59 con 3 in y 44 con 4 in: el rendimiento por profundidad, suelta también.',
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
  'page.concrete-slab-10x10.label': 'Losa de 10x10',
  'page.concrete-slab-10x12.title': 'Bolsas de concreto para una losa de 10x12 | Maestro Calc',
  'page.concrete-slab-10x12.description':
    'Cuántas bolsas de concreto lleva una losa de 10 x 12 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-10x12.heading': '¿Cuántas bolsas de concreto para una losa de 10x12?',
  'page.concrete-slab-10x12.label': 'Losa de 10x12',
  'page.concrete-slab-12x12.title': 'Bolsas de concreto para una losa de 12x12 | Maestro Calc',
  'page.concrete-slab-12x12.description':
    'Cuántas bolsas de concreto lleva una losa de 12 x 12 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-12x12.heading': '¿Cuántas bolsas de concreto para una losa de 12x12?',
  'page.concrete-slab-12x12.label': 'Losa de 12x12',
  'page.concrete-slab-10x20.title': 'Bolsas de concreto para una losa de 10x20 | Maestro Calc',
  'page.concrete-slab-10x20.description':
    'Cuántas bolsas de concreto lleva una losa de 10 x 20 ft (un auto o un patio) de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas.',
  'page.concrete-slab-10x20.heading': '¿Cuántas bolsas de concreto para una losa de 10x20?',
  'page.concrete-slab-10x20.label': 'Losa de 10x20',
  'page.concrete-slab-12x20.title': 'Bolsas de concreto para una losa de 12x20 | Maestro Calc',
  'page.concrete-slab-12x20.description':
    'Cuántas bolsas de concreto lleva una losa de 12 x 20 ft (una cochera o el piso de un cobertizo) de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-slab-12x20.heading': '¿Cuántas bolsas de concreto para una losa de 12x20?',
  'page.concrete-slab-12x20.label': 'Losa de 12x20',
  'page.concrete-slab-12x24.title': 'Bolsas de concreto para una losa de 12x24 | Maestro Calc',
  'page.concrete-slab-12x24.description':
    'Cuántas bolsas de concreto lleva una losa de 12 x 24 ft (un garaje para un auto) de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas.',
  'page.concrete-slab-12x24.heading': '¿Cuántas bolsas de concreto para una losa de 12x24?',
  'page.concrete-slab-12x24.label': 'Losa de 12x24',
  'page.concrete-slab-20x20.title': 'Bolsas de concreto para una losa de 20x20 | Maestro Calc',
  'page.concrete-slab-20x20.description':
    'Cuántas bolsas de concreto lleva una losa de 20 x 20 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-20x20.heading': '¿Cuántas bolsas de concreto para una losa de 20x20?',
  'page.concrete-slab-20x20.label': 'Losa de 20x20',
  'page.concrete-slab-24x24.title': 'Bolsas de concreto para una losa de 24x24 | Maestro Calc',
  'page.concrete-slab-24x24.description':
    'Cuántas bolsas de concreto lleva una losa de 24 x 24 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-24x24.heading': '¿Cuántas bolsas de concreto para una losa de 24x24?',
  'page.concrete-slab-24x24.label': 'Losa de 24x24',
  'page.concrete-slab-500-sq-ft.title': 'Concreto para losa de 500 ft²: 6.79 yardas | Maestro Calc',
  'page.concrete-slab-500-sq-ft.description':
    'Una losa de 500 pies cuadrados y 4 in de espesor lleva 6.17 yardas cúbicas de concreto, 6.79 con 10% de extra: las bolsas de 40, 60 u 80 lb, y a 5 o 6 in.',
  'page.concrete-slab-500-sq-ft.heading': '¿Cuánto concreto lleva una losa de 500 pies cuadrados?',
  'page.concrete-slab-500-sq-ft.label': 'Losa de 500 pies²',
  'page.concrete-slab-500-sq-ft.intro':
    'Aquí la losa de 500 pies cuadrados se calcula como 25 por 20 ft. Cualquier largo y ancho que multiplicados den 500 pies cuadrados llevan el mismo concreto con el mismo espesor, así que escribe tus medidas en la calculadora si son otras.',
  'page.concrete-slab-650-sq-ft.title': 'Concreto para losa de 650 ft²: 8.83 yardas | Maestro Calc',
  'page.concrete-slab-650-sq-ft.description':
    'Una losa de 650 pies cuadrados y 4 in de espesor lleva 8.02 yardas cúbicas de concreto, 8.83 con 10% de extra: las bolsas de 40, 60 u 80 lb, y a 5 o 6 in.',
  'page.concrete-slab-650-sq-ft.heading': '¿Cuánto concreto lleva una losa de 650 pies cuadrados?',
  'page.concrete-slab-650-sq-ft.label': 'Losa de 650 pies²',
  'page.concrete-slab-650-sq-ft.intro':
    'Aquí la losa de 650 pies cuadrados se calcula como 26 por 25 ft. Cualquier largo y ancho que multiplicados den 650 pies cuadrados llevan el mismo concreto con el mismo espesor, así que escribe tus medidas en la calculadora si son otras.',
  'page.concrete-slab-1000-sq-ft.title':
    'Concreto para losa de 1000 ft²: 13.58 yardas | Maestro Calc',
  'page.concrete-slab-1000-sq-ft.description':
    'Una losa de 1000 pies cuadrados y 4 in de espesor lleva 12.35 yardas cúbicas de concreto, 13.58 con 10% de extra: las bolsas de 40, 60 u 80 lb, y a 5 o 6 in.',
  'page.concrete-slab-1000-sq-ft.heading':
    '¿Cuánto concreto lleva una losa de 1000 pies cuadrados?',
  'page.concrete-slab-1000-sq-ft.label': 'Losa de 1000 pies²',
  'page.concrete-slab-1000-sq-ft.intro':
    'Aquí la losa de 1000 pies cuadrados se calcula como 40 por 25 ft. Cualquier largo y ancho que multiplicados den 1000 pies cuadrados llevan el mismo concreto con el mismo espesor, así que escribe tus medidas en la calculadora si son otras.',
  'page.concrete-slab-chart.title': 'Tabla de losas de concreto: bolsas y yardas | Maestro Calc',
  'page.concrete-slab-chart.description':
    'Yardas cúbicas y bolsas de concreto de 40, 60 u 80 lb para losas comunes de 4x4 a 30x30 ft, de 4, 5 y 6 in de espesor, con 10% extra. Fuentes y cita.',
  'page.concrete-slab-chart.heading':
    'Tabla de losas de concreto: yardas cúbicas y bolsas por tamaño',
  'page.concrete-slab-chart.label': 'Tabla de losas por tamaño',
  'page.concrete-slab-chart.intro':
    'Busca en la tabla el tamaño y el espesor de tu losa: cada fila da las yardas cúbicas de concreto que hay que pedir y las bolsas de 80, 60 o 40 lb que hay que comprar, calculadas por la calculadora de concreto con un 10% extra por desperdicio.',
  'page.concrete-slab-chart.table': 'Yardas cúbicas y bolsas por tamaño de losa',
  'page.concrete-slab-chart.source': 'Rendimiento de las bolsas',
  'page.concrete-slab-chart.basis': 'Lo que rinde una bolsa',
  'page.concrete-pad-4x4.title': 'Bolsas de concreto para una base de 4x4 | Maestro Calc',
  'page.concrete-pad-4x4.description':
    'Cuántas bolsas de concreto lleva una base de 4 x 4 ft (para un aire acondicionado o un generador) de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-pad-4x4.heading': '¿Cuántas bolsas de concreto para una base de 4x4?',
  'page.concrete-pad-4x4.label': 'Base de 4x4',
  'page.concrete-tube-8.title': 'Bolsas de concreto para un Sonotube de 8 in | Maestro Calc',
  'page.concrete-tube-8.description':
    'Cuántas bolsas de concreto llenan un Sonotube (tubo de cartón para columnas) de 8 in y 2, 3 o 4 ft de profundidad, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-tube-8.heading': '¿Cuántas bolsas de concreto para un Sonotube de 8 in?',
  'page.concrete-tube-8.label': 'Sonotube de 8 in',
  'page.concrete-tube-10.title': 'Bolsas de concreto para un Sonotube de 10 in | Maestro Calc',
  'page.concrete-tube-10.description':
    'Cuántas bolsas de concreto llenan un Sonotube (tubo de cartón para columnas) de 10 in y 2, 3 o 4 ft de profundidad, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-tube-10.heading': '¿Cuántas bolsas de concreto para un Sonotube de 10 in?',
  'page.concrete-tube-10.label': 'Sonotube de 10 in',
  'page.concrete-tube-12.title': 'Bolsas de concreto para un Sonotube de 12 in | Maestro Calc',
  'page.concrete-tube-12.description':
    'Cuántas bolsas de concreto llenan un Sonotube (tubo de cartón para columnas) de 12 in y 2, 3 o 4 ft de profundidad, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-tube-12.heading': '¿Cuántas bolsas de concreto para un Sonotube de 12 in?',
  'page.concrete-tube-12.label': 'Sonotube de 12 in',
  'page.concrete-footing-16x8.title': 'Bolsas de concreto para zapata de 16x8 in | Maestro Calc',
  'page.concrete-footing-16x8.description':
    'Cuántas bolsas de concreto lleva una zapata corrida de 16 in de ancho y 8 in de profundidad para 20, 50 o 100 ft de muro, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-footing-16x8.heading': '¿Cuántas bolsas de concreto para una zapata de 16x8 in?',
  'page.concrete-footing-16x8.label': 'Zapata de 16x8 in',
  'page.concrete-footing-20x10.title': 'Bolsas de concreto para zapata de 20x10 in | Maestro Calc',
  'page.concrete-footing-20x10.description':
    'Cuántas bolsas de concreto lleva una zapata corrida de 20 in de ancho y 10 in de profundidad para 20, 50 o 100 ft de muro, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-footing-20x10.heading': '¿Cuántas bolsas de concreto para una zapata de 20x10 in?',
  'page.concrete-footing-20x10.label': 'Zapata de 20x10 in',
  'page.roof-pitch-3-12.title': 'Pendiente de techo 3/12 en grados: 14.04° | Maestro Calc',
  'page.roof-pitch-3-12.description':
    'Una pendiente de techo 3/12 mide 14.04 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-3-12.heading': 'Pendiente de techo 3/12: 14.04° y el largo del cabio',
  'page.roof-pitch-3-12.label': 'Pendiente 3/12',
  'page.roof-pitch-4-12.title': 'Pendiente de techo 4/12 en grados: 18.43° | Maestro Calc',
  'page.roof-pitch-4-12.description':
    'Una pendiente de techo 4/12 mide 18.43 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-4-12.heading': 'Pendiente de techo 4/12: 18.43° y el largo del cabio',
  'page.roof-pitch-4-12.label': 'Pendiente 4/12',
  'page.roof-pitch-5-12.title': 'Pendiente de techo 5/12 en grados: 22.62° | Maestro Calc',
  'page.roof-pitch-5-12.description':
    'Una pendiente de techo 5/12 mide 22.62 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-5-12.heading': 'Pendiente de techo 5/12: 22.62° y el largo del cabio',
  'page.roof-pitch-5-12.label': 'Pendiente 5/12',
  'page.roof-pitch-6-12.title': 'Pendiente de techo 6/12 en grados: 26.57° | Maestro Calc',
  'page.roof-pitch-6-12.description':
    'Una pendiente de techo 6/12 mide 26.57 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-6-12.heading': 'Pendiente de techo 6/12: 26.57° y el largo del cabio',
  'page.roof-pitch-6-12.label': 'Pendiente 6/12',
  'page.roof-pitch-7-12.title': 'Pendiente de techo 7/12 en grados: 30.26° | Maestro Calc',
  'page.roof-pitch-7-12.description':
    'Una pendiente de techo 7/12 mide 30.26 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-7-12.heading': 'Pendiente de techo 7/12: 30.26° y el largo del cabio',
  'page.roof-pitch-7-12.label': 'Pendiente 7/12',
  'page.roof-pitch-7-5-12.title': 'Pendiente de techo 7.5/12 en grados: 32.01° | Maestro Calc',
  'page.roof-pitch-7-5-12.description':
    'Una pendiente de techo 7.5/12 mide 32.01 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-7-5-12.heading': 'Pendiente de techo 7.5/12: 32.01° y el largo del cabio',
  'page.roof-pitch-7-5-12.label': 'Pendiente 7.5/12',
  'page.roof-pitch-8-12.title': 'Pendiente de techo 8/12 en grados: 33.69° | Maestro Calc',
  'page.roof-pitch-8-12.description':
    'Una pendiente de techo 8/12 mide 33.69 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-8-12.heading': 'Pendiente de techo 8/12: 33.69° y el largo del cabio',
  'page.roof-pitch-8-12.label': 'Pendiente 8/12',
  'page.roof-pitch-9-12.title': 'Pendiente de techo 9/12 en grados: 36.87° | Maestro Calc',
  'page.roof-pitch-9-12.description':
    'Una pendiente de techo 9/12 mide 36.87 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-9-12.heading': 'Pendiente de techo 9/12: 36.87° y el largo del cabio',
  'page.roof-pitch-9-12.label': 'Pendiente 9/12',
  'page.roof-pitch-10-12.title': 'Pendiente de techo 10/12 en grados: 39.81° | Maestro Calc',
  'page.roof-pitch-10-12.description':
    'Una pendiente de techo 10/12 mide 39.81 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-10-12.heading': 'Pendiente de techo 10/12: 39.81° y el largo del cabio',
  'page.roof-pitch-10-12.label': 'Pendiente 10/12',
  'page.roof-pitch-12-12.title': 'Pendiente de techo 12/12 en grados: 45.00° | Maestro Calc',
  'page.roof-pitch-12-12.description':
    'Una pendiente de techo 12/12 mide 45.00 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-12-12.heading': 'Pendiente de techo 12/12: 45.00° y el largo del cabio',
  'page.roof-pitch-12-12.label': 'Pendiente 12/12',
  'page.roof-pitch-chart.title': 'Tabla de pendientes de techo en grados | Maestro Calc',
  'page.roof-pitch-chart.description':
    'Cada pendiente de techo de 1/12 a 24/12 en grados, en porcentaje y con su multiplicador de cabio, la pendiente mínima del IRC y de grados a pendiente.',
  'page.roof-pitch-chart.heading':
    'Tabla de pendientes de techo: grados, porcentaje y multiplicador del cabio',
  'page.roof-pitch-chart.label': 'Pendientes en grados',
  'page.roof-pitch-chart.intro':
    'Una pendiente de techo 6/12 mide 26.57° y un 50%, y una 12/12 mide 45°. Busca tu pendiente en la tabla: cada fila da su ángulo, su porcentaje, su multiplicador de cabio y las cubiertas que el IRC permite, calculados por la calculadora de pendiente de techo.',
  'page.roof-pitch-chart.note':
    'El ángulo es el arcotangente de la subida sobre el recorrido, el porcentaje es la subida sobre el recorrido por 100 y el multiplicador del cabio son los pies de cabio por pie de recorrido, √(1 + (subida ÷ 12)²), sin alero. Cada pendiente abre la calculadora con su subida y su recorrido ya cargados.',
  'page.roof-pitch-chart.table':
    'Pendiente de techo en grados, porcentaje y multiplicador del cabio',
  'page.roof-pitch-chart.source': 'Pendientes mínimas de techo',
  'page.roof-pitch-chart.basis': 'La pendiente mínima del IRC para cada cubierta',
  'page.roof-pitch-chart.pitch': 'Pendiente',
  'page.roof-pitch-chart.angle': 'Ángulo',
  'page.roof-pitch-chart.grade': 'Porcentaje',
  'page.roof-pitch-chart.multiplier': 'Multiplicador del cabio',
  'page.roof-pitch-chart.coverings': 'Cubiertas que permite el IRC',
  'page.roof-pitch-chart.twoLayers': '(2 capas)',
  'page.roof-pitch-chart.all': 'Las seis',
  'page.roof-pitch-chart.double': 'dos capas de fieltro debajo de',
  'page.roof-pitch-chart.reverse': 'De grados a pendiente',
  'page.roof-pitch-chart.reverseLead':
    'Un ángulo de techo en grados como subida sobre un recorrido de 12 in: subida = 12 × tan(ángulo), al centésimo de pulgada, y el porcentaje que da.',
  'page.square-feet-5x5.title': '5x5 en pies cuadrados: 25 pies cuadrados | Maestro Calc',
  'page.square-feet-5x5.description':
    'Un área de 5 por 5 ft mide 25 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-5x5.heading': '¿Cuántos pies cuadrados son 5x5?',
  'page.square-feet-5x5.label': '5x5 pies',
  'page.square-feet-5x5.intro':
    'Un cuadrado de 5 por 5 ft es un clóset chico, el piso de una ducha o un descanso de escalera.',
  'page.square-feet-5x10.title': '5x10 en pies cuadrados: 50 pies cuadrados | Maestro Calc',
  'page.square-feet-5x10.description':
    'Un área de 5 por 10 ft mide 50 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-5x10.heading': '¿Cuántos pies cuadrados son 5x10?',
  'page.square-feet-5x10.label': '5x10 pies',
  'page.square-feet-5x10.intro':
    'Un área de 5 por 10 ft es un baño común, un vestidor o una bodega chica.',
  'page.square-feet-7x12.title': '7x12 en pies cuadrados: 84 pies cuadrados | Maestro Calc',
  'page.square-feet-7x12.description':
    'Un área de 7 por 12 ft (12 por 7) mide 84 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-7x12.heading': '¿Cuántos pies cuadrados son 7x12 (12x7)?',
  'page.square-feet-7x12.label': '7x12 pies',
  'page.square-feet-7x12.intro':
    'Un área de 7 por 12 ft, también escrita 12x7, es un baño angosto, un cuarto de lavado o un pasillo.',
  'page.square-feet-10x10.title': '10x10 en pies cuadrados: 100 pies cuadrados | Maestro Calc',
  'page.square-feet-10x10.description':
    'Un área de 10 por 10 ft mide 100 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-10x10.heading': '¿Cuántos pies cuadrados son 10x10?',
  'page.square-feet-10x10.label': '10x10 pies',
  'page.square-feet-10x10.intro':
    'Un cuarto de 10 por 10 ft es un dormitorio chico, una oficina en casa o el piso de un cobertizo de jardín.',
  'page.square-feet-10x12.title': '10x12 en pies cuadrados: 120 pies cuadrados | Maestro Calc',
  'page.square-feet-10x12.description':
    'Un área de 10 por 12 ft mide 120 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-10x12.heading': '¿Cuántos pies cuadrados son 10x12?',
  'page.square-feet-10x12.label': '10x12 pies',
  'page.square-feet-10x12.intro':
    'Un cuarto de 10 por 12 ft es un segundo dormitorio típico, y una medida común para un cobertizo o un patio.',
  'page.square-feet-11x14.title': '11x14 en pies cuadrados: 154 pies cuadrados | Maestro Calc',
  'page.square-feet-11x14.description':
    'Un área de 11 por 14 ft (14 por 11) mide 154 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-11x14.heading': '¿Cuántos pies cuadrados son 11x14 (14x11)?',
  'page.square-feet-11x14.label': '11x14 pies',
  'page.square-feet-11x14.intro':
    'Un cuarto de 11 por 14 ft, también escrito 14x11, es un dormitorio mediano o un comedor.',
  'page.square-feet-11x16.title': '11x16 en pies cuadrados: 176 pies cuadrados | Maestro Calc',
  'page.square-feet-11x16.description':
    'Un área de 11 por 16 ft (16 por 11) mide 176 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-11x16.heading': '¿Cuántos pies cuadrados son 11x16 (16x11)?',
  'page.square-feet-11x16.label': '11x16 pies',
  'page.square-feet-11x16.intro':
    'Un cuarto de 11 por 16 ft, también escrito 16x11, es un dormitorio largo, un estudio o una sala familiar.',
  'page.square-feet-12x12.title': '12x12 en pies cuadrados: 144 pies cuadrados | Maestro Calc',
  'page.square-feet-12x12.description':
    'Un área de 12 por 12 ft mide 144 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-12x12.heading': '¿Cuántos pies cuadrados son 12x12?',
  'page.square-feet-12x12.label': '12x12 pies',
  'page.square-feet-12x12.intro':
    'Un cuarto de 12 por 12 ft es un dormitorio estándar, y una medida común para una terraza o una losa de patio.',
  'page.square-feet-12x14.title': '12x14 en pies cuadrados: 168 pies cuadrados | Maestro Calc',
  'page.square-feet-12x14.description':
    'Un área de 12 por 14 ft mide 168 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-12x14.heading': '¿Cuántos pies cuadrados son 12x14?',
  'page.square-feet-12x14.label': '12x14 pies',
  'page.square-feet-12x14.intro':
    'Un cuarto de 12 por 14 ft es una medida común para un dormitorio principal o una sala.',
  'page.square-feet-12x30.title': '12x30 en pies cuadrados: 360 pies cuadrados | Maestro Calc',
  'page.square-feet-12x30.description':
    'Un área de 12 por 30 ft (30 por 12) mide 360 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-12x30.heading': '¿Cuántos pies cuadrados son 12x30 (30x12)?',
  'page.square-feet-12x30.label': '12x30 pies',
  'page.square-feet-12x30.intro':
    'Un área de 12 por 30 ft, también escrita 30 por 12, es un porche largo, una terraza a lo largo de la casa o una entrada para un auto.',
  'page.square-feet-20x20.title': '20x20 en pies cuadrados: 400 pies cuadrados | Maestro Calc',
  'page.square-feet-20x20.description':
    'Un área de 20 por 20 ft mide 400 pies cuadrados: lo mismo en metros y yardas cuadradas, la fórmula y las medidas uno o dos pies más anchas. Gratis.',
  'page.square-feet-20x20.heading': '¿Cuántos pies cuadrados son 20x20?',
  'page.square-feet-20x20.label': '20x20 pies',
  'page.square-feet-20x20.intro':
    'Un área de 20 por 20 ft es el piso de un garaje para dos autos o un patio grande.',
  'page.contact.title': 'Contacto | Maestro Calc',
  'page.contact.description':
    'Escribe a Maestro Calc a contacto@maestrocalc.com. ¿Encontraste un error en un cálculo o en una página? Cuéntanos y lo revisaremos.',
  'page.concrete.title': 'Calculadora de concreto en yardas y bolsas | Maestro Calc',
  'page.concrete.description':
    'Calcula las yardas cúbicas y las bolsas de concreto para una losa, zapata, columna o escalones. Gratis, al instante, en pies, pulgadas o metros.',
  'page.rectangle-area.title': 'Calculadora para calcular pies cuadrados | Maestro Calc',
  'page.rectangle-area.description':
    'Calcula los pies cuadrados de un cuarto, piso o pared: multiplica el largo por el ancho. Con yardas y metros cuadrados, en pies, pulgadas o metros. Gratis.',
  'page.gravel.title': 'Calculadora de grava en toneladas y yardas | Maestro Calc',
  'page.gravel.description':
    'Calcula cuántas toneladas de grava pedir para una entrada, camino o base, compactada o suelta, con las yardas cúbicas y el costo. Gratis y al instante.',
  'page.mulch-bags-per-yard.title': 'Bolsas de mulch en una yarda cúbica | Maestro Calc',
  'page.mulch-bags-per-yard.description':
    'Una yarda cúbica de mulch son 27 pies cúbicos: 18 bolsas de 1.5 cu ft, 14 bolsas de 2 cu ft o 9 bolsas de 3 cu ft, y las bolsas para 2 o 3 yardas cúbicas.',
  'page.mulch-bags-per-yard.heading': '¿Cuántas bolsas de mulch hay en una yarda cúbica?',
  'page.mulch-bags-per-yard.label': 'Bolsas por yarda cúbica',
  'page.mulch-bags-per-yard.intro':
    'El mulch se vende en bolsas de 1.5, 2 o 3 pies cúbicos, y a granel por yarda cúbica. Divide 27 entre el tamaño de la bolsa y redondea hacia arriba: una yarda cúbica lleva 18 bolsas de 1.5 cu ft, 14 de 2 cu ft o 9 de 3 cu ft.',
  'page.gravel-driveway-10x20.title': 'Grava para entrada de 10x20: 4.74 toneladas | Maestro Calc',
  'page.gravel-driveway-10x20.description':
    'Una entrada de 10 por 20 ft y 4 in de profundidad lleva 4.74 toneladas de grava compactada, 3.68 yardas cúbicas a pedir con 5% de extra, y a 6 u 8 in.',
  'page.gravel-driveway-10x20.heading': '¿Cuánta grava para una entrada de 10x20?',
  'page.gravel-driveway-10x20.label': 'Entrada de 10x20',
  'page.gravel-driveway-10x20.intro':
    'Un área de 10 por 20 ft da lugar para un auto, o amplía la entrada junto al garaje. La base de una entrada se compacta por capas, así que la grava se calcula con su peso compactado.',
  'page.gravel-driveway-12x50.title': 'Grava para entrada de 12x50: 14.23 toneladas | Maestro Calc',
  'page.gravel-driveway-12x50.description':
    'Una entrada de 12 por 50 ft y 4 in de profundidad lleva 14.23 toneladas de grava compactada, 11.03 yardas cúbicas a pedir con 5% de extra, y a 6 u 8 in.',
  'page.gravel-driveway-12x50.heading': '¿Cuánta grava para una entrada de 12x50?',
  'page.gravel-driveway-12x50.label': 'Entrada de 12x50',
  'page.gravel-driveway-12x50.intro':
    'Una entrada de 12 por 50 ft es un carril desde la calle hasta un garaje alejado de ella. Una entrada nueva suele llevar primero una base más profunda y después una capa de acabado.',
  'page.gravel-driveway-12x100.title':
    'Grava para entrada de 12x100: 28.47 toneladas | Maestro Calc',
  'page.gravel-driveway-12x100.description':
    'Una entrada de 12 por 100 ft y 4 in de profundidad lleva 28.47 toneladas de grava compactada, 22.07 yardas cúbicas a pedir con 5% de extra, y a 6 u 8 in.',
  'page.gravel-driveway-12x100.heading': '¿Cuánta grava para una entrada de 12x100?',
  'page.gravel-driveway-12x100.label': 'Entrada de 12x100',
  'page.gravel-driveway-12x100.intro':
    'Una entrada de 12 por 100 ft es un camino largo hasta una casa o un granero alejado de la calle. A este largo la grava llega por camión, así que pídela en toneladas al proveedor.',
  'page.cubic-yard-weight-chart.title':
    'Peso de una yarda cúbica: tabla de materiales | Maestro Calc',
  'page.cubic-yard-weight-chart.description':
    'Cuánto pesa una yarda cúbica en libras y toneladas: grava, concreto, arena, tierra para jardín, tierra de relleno y mulch, también por pie cúbico y por m³.',
  'page.cubic-yard-weight-chart.heading': '¿Cuánto pesa una yarda cúbica? Tabla de materiales',
  'page.cubic-yard-weight-chart.label': 'Peso por yarda cúbica',
  'page.cubic-yard-weight-chart.intro':
    'Una yarda cúbica de grava pesa aproximadamente 1.29 toneladas suelta y 1.83 toneladas compactada, las cifras de la calculadora de grava. Una yarda cúbica de concreto pesa aproximadamente de 3,915 a 4,050 lb, la arena aproximadamente 1.45 toneladas, la tierra para jardín y la tierra de relleno aproximadamente 0.80 toneladas, y el mulch de astillas de madera de 243 lb seco a 473 lb fresco. La tabla da cada material en libras y toneladas por yarda cúbica, libras por pie cúbico y kilogramos por metro cúbico, con la fuente publicada de cada cifra.',
  'page.cubic-yard-weight-chart.note':
    'Cada peso es aproximado. El agua agrega peso: la arena mojada, la tierra mojada y las astillas frescas pesan más que secas, y la grava y la tierra pesan más una vez compactadas. Cada cifra es la que publica su fuente, convertida con exactitud: una tonelada son 2,000 lb, una yarda cúbica son 27 pies cúbicos y una libra por yarda cúbica son 0.593 kilogramos por metro cúbico. Pregúntale a tu proveedor cuánto pesa su material. La grava compactada y la suelta abren la calculadora de grava con una yarda cúbica.',
  'page.cubic-yard-weight-chart.table': 'Peso de una yarda cúbica, por material',
  'page.cubic-yard-weight-chart.basis': 'Qué supone cada cifra',
  'page.cubic-yard-weight-chart.material': 'Material',
  'page.cubic-yard-weight-chart.lbYd3': 'Libras por yarda cúbica',
  'page.cubic-yard-weight-chart.tonYd3': 'Toneladas por yarda cúbica',
  'page.cubic-yard-weight-chart.lbFt3': 'Libras por pie cúbico',
  'page.cubic-yard-weight-chart.kgM3': 'Kilogramos por metro cúbico',
  'page.cubic-yard-weight-chart.materials.gravel-compacted': 'Base de grava, compactada',
  'page.cubic-yard-weight-chart.materials.gravel-loose': 'Base de grava, suelta',
  'page.cubic-yard-weight-chart.materials.gravel': 'Grava de 1/4 a 2 in',
  'page.cubic-yard-weight-chart.materials.pit-run-gravel': 'Grava de banco (sin cribar)',
  'page.cubic-yard-weight-chart.materials.concrete': 'Concreto',
  'page.cubic-yard-weight-chart.materials.sand': 'Arena',
  'page.cubic-yard-weight-chart.materials.topsoil': 'Tierra para jardín',
  'page.cubic-yard-weight-chart.materials.fill-dirt': 'Tierra de relleno',
  'page.cubic-yard-weight-chart.materials.soil-in-place': 'Suelo en el terreno, seco',
  'page.cubic-yard-weight-chart.materials.wood-chips-green': 'Mulch de astillas, fresco',
  'page.cubic-yard-weight-chart.materials.wood-chips-dry': 'Mulch de astillas, seco',
  'page.cubic-yard-weight-chart.conditions.gravel-compacted':
    'Base densa de 3/4 in, compactada en su lugar: de 1.80 a 1.86 toneladas (WisDOT)',
  'page.cubic-yard-weight-chart.conditions.gravel-loose':
    'La misma base suelta, repartida sobre su expansión de compactada a suelta de 36 a 47 por ciento (punto medio)',
  'page.cubic-yard-weight-chart.conditions.gravel':
    'Un factor de volumen a toneladas; la fuente no indica humedad ni compactación',
  'page.cubic-yard-weight-chart.conditions.pit-run-gravel':
    'Un factor de volumen a toneladas; la fuente no indica humedad ni compactación',
  'page.cubic-yard-weight-chart.conditions.concrete':
    'Concreto endurecido de peso normal sin varilla: de 145 lb por pie cúbico (FHWA, resistencia de hasta 5,000 psi) a 150 (WSDOT); la varilla agrega unas 5 (WSDOT)',
  'page.cubic-yard-weight-chart.conditions.sand':
    'Un factor de volumen a toneladas; la fuente no indica humedad, y la arena mojada pesa más',
  'page.cubic-yard-weight-chart.conditions.topsoil':
    'Un factor de volumen a toneladas; la fuente no indica humedad, y la tierra mojada pesa más',
  'page.cubic-yard-weight-chart.conditions.fill-dirt':
    'Un factor de volumen a toneladas; la fuente no indica humedad, y la tierra mojada pesa más',
  'page.cubic-yard-weight-chart.conditions.soil-in-place':
    'Densidad aparente seca (peso seco sobre volumen) de un suelo de textura media con cerca de 50 por ciento de poros (NRCS)',
  'page.cubic-yard-weight-chart.conditions.wood-chips-green':
    'Astillas de madera verdes (frescas), como factor de volumen a peso',
  'page.cubic-yard-weight-chart.conditions.wood-chips-dry':
    'Astillas de madera secas, como factor de volumen a peso',
  'page.paint-room-10x10.title': 'Pintura para un cuarto de 10x10: 1.54 galones | Maestro Calc',
  'page.paint-room-10x10.description':
    'Un cuarto de 10 por 10 ft con paredes de 8 ft, una puerta y dos ventanas lleva 1.54 galones de pintura en dos manos: 2 latas, y con paredes de 9 o 10 ft.',
  'page.paint-room-10x10.heading': '¿Cuánta pintura para un cuarto de 10x10?',
  'page.paint-room-10x10.label': 'Cuarto de 10x10',
  'page.paint-room-10x10.intro':
    'Un cuarto de 10 por 10 ft es un dormitorio pequeño o una oficina en casa. La tabla pinta solo las paredes; el techo y los marcos llevan su propia pintura.',
  'page.paint-room-10x12.title': 'Pintura para un cuarto de 10x12: 1.73 galones | Maestro Calc',
  'page.paint-room-10x12.description':
    'Un cuarto de 10 por 12 ft con paredes de 8 ft, una puerta y dos ventanas lleva 1.73 galones de pintura en dos manos: 2 latas, y con paredes de 9 o 10 ft.',
  'page.paint-room-10x12.heading': '¿Cuánta pintura para un cuarto de 10x12?',
  'page.paint-room-10x12.label': 'Cuarto de 10x12',
  'page.paint-room-10x12.intro':
    'Un cuarto de 10 por 12 ft es una medida común para un dormitorio o el cuarto de un bebé. La tabla pinta solo las paredes; el techo y los marcos llevan su propia pintura.',
  'page.paint-room-12x12.title': 'Pintura para un cuarto de 12x12: 1.91 galones | Maestro Calc',
  'page.paint-room-12x12.description':
    'Un cuarto de 12 por 12 ft con paredes de 8 ft, una puerta y dos ventanas lleva 1.91 galones de pintura en dos manos: 2 latas, y con paredes de 9 o 10 ft.',
  'page.paint-room-12x12.heading': '¿Cuánta pintura para un cuarto de 12x12?',
  'page.paint-room-12x12.label': 'Cuarto de 12x12',
  'page.paint-room-12x12.intro':
    'Un cuarto de 12 por 12 ft es un dormitorio principal típico o una sala pequeña. La tabla pinta solo las paredes; el techo y los marcos llevan su propia pintura.',
  'page.paint-room-12x14.title': 'Pintura para un cuarto de 12x14: 2.09 galones | Maestro Calc',
  'page.paint-room-12x14.description':
    'Un cuarto de 12 por 14 ft con paredes de 8 ft, una puerta y dos ventanas lleva 2.09 galones de pintura en dos manos: 3 latas, y con paredes de 9 o 10 ft.',
  'page.paint-room-12x14.heading': '¿Cuánta pintura para un cuarto de 12x14?',
  'page.paint-room-12x14.label': 'Cuarto de 12x14',
  'page.paint-room-12x14.intro':
    'Un cuarto de 12 por 14 ft es un dormitorio principal amplio o una sala familiar. Algo más de dos galones redondea a una tercera lata, que también sirve para retoques después.',
  'page.paint-room-12x16.title': 'Pintura para un cuarto de 12x16: 2.27 galones | Maestro Calc',
  'page.paint-room-12x16.description':
    'Un cuarto de 12 por 16 ft con paredes de 8 ft, una puerta y dos ventanas lleva 2.27 galones de pintura en dos manos: 3 latas, y con paredes de 9 o 10 ft.',
  'page.paint-room-12x16.heading': '¿Cuánta pintura para un cuarto de 12x16?',
  'page.paint-room-12x16.label': 'Cuarto de 12x16',
  'page.paint-room-12x16.intro':
    'Un cuarto de 12 por 16 ft es un dormitorio grande, una sala o un cuarto sobre el garaje. La tabla pinta solo las paredes; el techo y los marcos llevan su propia pintura.',
  'page.drywall-room-10x10.title': 'Drywall para cuarto de 10x10: 13 placas | Maestro Calc',
  'page.drywall-room-10x10.description':
    'Un cuarto de 10 por 10 ft con paredes de 8 ft lleva 13 placas de drywall de 4x8 o 9 de 4x12 para paredes y techo, con 10% de extra, y a 9 o 10 ft.',
  'page.drywall-room-10x10.heading': '¿Cuántas placas de drywall para un cuarto de 10x10?',
  'page.drywall-room-10x10.label': 'Cuarto de 10x10',
  'page.drywall-room-10x10.intro':
    'Un cuarto de 10 por 10 ft es un dormitorio pequeño o una oficina en casa. Las placas largas de 4 por 12 ft dejan menos juntas que encintar, pero se levantan entre dos personas.',
  'page.drywall-room-10x12.title': 'Drywall para cuarto de 10x12: 15 placas | Maestro Calc',
  'page.drywall-room-10x12.description':
    'Un cuarto de 10 por 12 ft con paredes de 8 ft lleva 15 placas de drywall de 4x8 o 10 de 4x12 para paredes y techo, con 10% de extra, y a 9 o 10 ft.',
  'page.drywall-room-10x12.heading': '¿Cuántas placas de drywall para un cuarto de 10x12?',
  'page.drywall-room-10x12.label': 'Cuarto de 10x12',
  'page.drywall-room-10x12.intro':
    'Un cuarto de 10 por 12 ft es una medida común para un dormitorio o el cuarto de un bebé. Las placas largas de 4 por 12 ft dejan menos juntas que encintar, pero se levantan entre dos personas.',
  'page.drywall-room-12x12.title': 'Drywall para cuarto de 12x12: 17 placas | Maestro Calc',
  'page.drywall-room-12x12.description':
    'Un cuarto de 12 por 12 ft con paredes de 8 ft lleva 17 placas de drywall de 4x8 u 11 de 4x12 para paredes y techo, con 10% de extra, y a 9 o 10 ft.',
  'page.drywall-room-12x12.heading': '¿Cuántas placas de drywall para un cuarto de 12x12?',
  'page.drywall-room-12x12.label': 'Cuarto de 12x12',
  'page.drywall-room-12x12.intro':
    'Un cuarto de 12 por 12 ft es un dormitorio principal típico o una sala pequeña. Las placas largas de 4 por 12 ft dejan menos juntas que encintar, pero se levantan entre dos personas.',
  'page.drywall-room-12x14.title': 'Drywall para cuarto de 12x14: 19 placas | Maestro Calc',
  'page.drywall-room-12x14.description':
    'Un cuarto de 12 por 14 ft con paredes de 8 ft lleva 19 placas de drywall de 4x8 o 13 de 4x12 para paredes y techo, con 10% de extra, y a 9 o 10 ft.',
  'page.drywall-room-12x14.heading': '¿Cuántas placas de drywall para un cuarto de 12x14?',
  'page.drywall-room-12x14.label': 'Cuarto de 12x14',
  'page.drywall-room-12x14.intro':
    'Un cuarto de 12 por 14 ft es un dormitorio principal amplio o una sala familiar. El techo es lo más difícil de colocar, así que planea sus placas primero y usa los recortes en las paredes.',
  'page.drywall-room-12x16.title': 'Drywall para cuarto de 12x16: 21 placas | Maestro Calc',
  'page.drywall-room-12x16.description':
    'Un cuarto de 12 por 16 ft con paredes de 8 ft lleva 21 placas de drywall de 4x8 o 14 de 4x12 para paredes y techo, con 10% de extra, y a 9 o 10 ft.',
  'page.drywall-room-12x16.heading': '¿Cuántas placas de drywall para un cuarto de 12x16?',
  'page.drywall-room-12x16.label': 'Cuarto de 12x16',
  'page.drywall-room-12x16.intro':
    'Un cuarto de 12 por 16 ft es un dormitorio grande, una sala o un cuarto sobre el garaje. Las placas largas de 4 por 12 ft dejan menos juntas que encintar, pero se levantan entre dos personas.',
  'page.topsoil-raised-bed-4x4.title': 'Tierra para cama elevada de 4x4: 0.65 yd³ | Maestro Calc',
  'page.topsoil-raised-bed-4x4.description':
    'Una cama elevada de 4 por 4 ft con 12 in de tierra lleva 0.65 yardas cúbicas con 10% por asentamiento: 24 bolsas de 0.75 cu ft o 12 de 1.5, y a 18 o 24 in.',
  'page.topsoil-raised-bed-4x4.heading': '¿Cuánta tierra para una cama elevada de 4x4?',
  'page.topsoil-raised-bed-4x4.label': 'Cama elevada de 4x4',
  'page.topsoil-raised-bed-4x4.intro':
    'Una cama de 4 por 4 ft es una medida común de kit, y llegas a su centro desde cualquier lado. La mayoría de las hortalizas crecen bien en 12 in de tierra; una cama más honda sirve para raíces y te ahorra agacharte.',
  'page.topsoil-raised-bed-4x8.title': 'Tierra para cama elevada de 4x8: 1.30 yd³ | Maestro Calc',
  'page.topsoil-raised-bed-4x8.description':
    'Una cama elevada de 4 por 8 ft con 12 in de tierra lleva 1.30 yardas cúbicas con 10% por asentamiento: 47 bolsas de 0.75 cu ft o 24 de 1.5, y a 18 o 24 in.',
  'page.topsoil-raised-bed-4x8.heading': '¿Cuánta tierra para una cama elevada de 4x8?',
  'page.topsoil-raised-bed-4x8.label': 'Cama elevada de 4x8',
  'page.topsoil-raised-bed-4x8.intro':
    'Una cama de 4 por 8 ft es la cama elevada más común: cada lado largo es una tabla de 8 ft. La mayoría de las hortalizas crecen bien en 12 in de tierra; una cama más honda sirve para raíces y te ahorra agacharte.',
  'page.topsoil-10x10.title': 'Tierra para un área de 10x10: 1.36 yd³ | Maestro Calc',
  'page.topsoil-10x10.description':
    'Un área de 10 por 10 ft con 4 in de tierra lleva 1.36 yardas cúbicas con 10% por asentamiento: 49 bolsas de 0.75 cu ft o 25 de 1.5, y a 6 u 8 in.',
  'page.topsoil-10x10.heading': '¿Cuánta tierra para un área de 10x10?',
  'page.topsoil-10x10.label': 'Área de 10x10',
  'page.topsoil-10x10.intro':
    'Un área de 10 por 10 ft son 100 pies cuadrados: un trozo de césped o una huerta. Cuatro pulgadas de tierra son una base común para sembrar césped; una huerta crece mejor con 6 a 8 in.',
  'page.topsoil-20x20.title': 'Tierra para un área de 20x20: 5.43 yd³ | Maestro Calc',
  'page.topsoil-20x20.description':
    'Un área de 20 por 20 ft con 4 in de tierra lleva 5.43 yardas cúbicas con 10% por asentamiento: 196 bolsas de 0.75 cu ft o 98 de 1.5, y a 6 u 8 in.',
  'page.topsoil-20x20.heading': '¿Cuánta tierra para un área de 20x20?',
  'page.topsoil-20x20.label': 'Área de 20x20',
  'page.topsoil-20x20.intro':
    'Un área de 20 por 20 ft son 400 pies cuadrados: un césped pequeño o una huerta en el patio. A esta medida, compara el precio a granel por yarda cúbica con el de las bolsas.',
  'page.roofing-12x16.title': 'Tejas para techo de 12x16: 8 paquetes | Maestro Calc',
  'page.roofing-12x16.description':
    'Un techo con planta de 12 por 16 ft y pendiente de 6 en 12 tiene 2.15 cuadrados: 8 paquetes de tejas y 1 rollo de fieltro con 10% extra, y a 8 o 10 en 12.',
  'page.roofing-12x16.heading': '¿Cuántos paquetes de tejas para un techo de 12x16?',
  'page.roofing-12x16.label': 'Techo de 12x16',
  'page.roofing-12x16.intro':
    'Una planta de 12 por 16 ft es un cobertizo grande o un taller pequeño. Mide la planta hasta el borde de los aleros, no hasta las paredes.',
  'page.roofing-24x24.title': 'Tejas para techo de 24x24: 22 paquetes | Maestro Calc',
  'page.roofing-24x24.description':
    'Un techo con planta de 24 por 24 ft y pendiente de 6 en 12 tiene 6.44 cuadrados: 22 paquetes de tejas y 1 rollo de fieltro con 10% extra, y a 8 o 10 en 12.',
  'page.roofing-24x24.heading': '¿Cuántos paquetes de tejas para un techo de 24x24?',
  'page.roofing-24x24.label': 'Techo de 24x24',
  'page.roofing-24x24.intro':
    'Una planta de 24 por 24 ft es un garaje típico para dos autos. Mide la planta hasta el borde de los aleros, no hasta las paredes.',
  'page.roofing-30x40.title': 'Tejas para techo de 30x40: 45 paquetes | Maestro Calc',
  'page.roofing-30x40.description':
    'Un techo con planta de 30 por 40 ft y pendiente de 6 en 12 tiene 13.42 cuadrados: 45 paquetes de tejas y 2 rollos de fieltro con 10% extra, y a 8 o 10 en 12.',
  'page.roofing-30x40.heading': '¿Cuántos paquetes de tejas para un techo de 30x40?',
  'page.roofing-30x40.label': 'Techo de 30x40',
  'page.roofing-30x40.intro':
    'Una planta de 30 por 40 ft cubre una casa pequeña de un piso o un taller grande. Mide la planta hasta el borde de los aleros, no hasta las paredes.',
  'page.roofing-30x50.title': 'Tejas para techo de 30x50: 56 paquetes | Maestro Calc',
  'page.roofing-30x50.description':
    'Un techo con planta de 30 por 50 ft y pendiente de 6 en 12 tiene 16.77 cuadrados: 56 paquetes de tejas y 2 rollos de fieltro con 10% extra, y a 8 o 10 en 12.',
  'page.roofing-30x50.heading': '¿Cuántos paquetes de tejas para un techo de 30x50?',
  'page.roofing-30x50.label': 'Techo de 30x50',
  'page.roofing-30x50.intro':
    'Una planta de 30 por 50 ft cubre una casa de un piso de estilo rancho. Mide la planta hasta el borde de los aleros, no hasta las paredes.',
  'page.divide-29-1-4-in-by-2.title':
    '29 1/4 entre 2 en la cinta métrica: 14 5/8 in | Maestro Calc',
  'page.divide-29-1-4-in-by-2.description':
    '29 1/4 in entre 2 da 14 5/8 in en la cinta métrica (14.63 in, 1 ft 2 5/8 in), redondeado al 1/16 in. También 29 1/4 in entre 3 y entre 4.',
  'page.divide-29-1-4-in-by-2.heading': '¿Cuánto es 29 1/4 in entre 2 en la cinta métrica?',
  'page.divide-29-1-4-in-by-2.label': '29 1/4 in ÷ 2',
  'page.divide-23-5-8-in-by-2.title': 'Mitad de 23 5/8 in en la cinta: 11 13/16 in | Maestro Calc',
  'page.divide-23-5-8-in-by-2.description':
    'La mitad de 23 5/8 in, o 23 5/8 in entre 2, da 11 13/16 in en la cinta métrica (11.81 in), redondeado al 1/16 in. También entre 3 y entre 4.',
  'page.divide-23-5-8-in-by-2.heading': '¿Cuál es la mitad de 23 5/8 in (entre 2) en la cinta?',
  'page.divide-23-5-8-in-by-2.label': '23 5/8 in ÷ 2',
  'page.divide-35-5-in-by-2.title': '35.5 pulgadas entre 2: 17 3/4 in | Maestro Calc',
  'page.divide-35-5-in-by-2.description':
    '35.5 pulgadas entre 2 da 17 3/4 in en la cinta métrica (17.75 in, 1 ft 5 3/4 in). También 35.5 in entre 3 y entre 4, redondeado al 1/16 in.',
  'page.divide-35-5-in-by-2.heading': '¿Cuánto es 35.5 pulgadas entre 2?',
  'page.divide-35-5-in-by-2.label': '35.5 in ÷ 2',
  'page.divide-22-in-by-10.title': '22 pulgadas entre 10: 2 3/16 in | Maestro Calc',
  'page.divide-22-in-by-10.description':
    '22 pulgadas entre 10 da 2.20 in, o 2 3/16 in en la cinta métrica redondeado al 1/16 in. También 22 in entre 2, 3 y 4.',
  'page.divide-22-in-by-10.heading': '¿Cuánto es 22 pulgadas entre 10?',
  'page.divide-22-in-by-10.label': '22 in ÷ 10',
  'page.divide-9-ft-6-in-by-2.title': '9 pies 6 pulgadas entre 2: 4 ft 9 in | Maestro Calc',
  'page.divide-9-ft-6-in-by-2.description':
    'La mitad de 9 pies 6 pulgadas: 9 ft 6 in entre 2 da 4 ft 9 in, o 57 in en la cinta métrica (57.00 in, 1.448 m). También entre 3 y entre 4.',
  'page.divide-9-ft-6-in-by-2.heading': '¿Cuánto es 9 pies 6 pulgadas entre 2?',
  'page.divide-9-ft-6-in-by-2.label': '9 ft 6 in ÷ 2',
  'page.divide-3-ft-9-in-by-2.title': '3 pies 9 pulgadas entre 2: 1 ft 10 1/2 in | Maestro Calc',
  'page.divide-3-ft-9-in-by-2.description':
    'La mitad de 3 pies 9 pulgadas: 3 ft 9 in entre 2 da 1 ft 10 1/2 in, o 22 1/2 in en la cinta métrica (22.50 in, 0.572 m). También entre 3 y entre 4.',
  'page.divide-3-ft-9-in-by-2.heading': '¿Cuánto es 3 pies 9 pulgadas entre 2?',
  'page.divide-3-ft-9-in-by-2.label': '3 ft 9 in ÷ 2',
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
  'page.roof-pitch.title': 'Calculadora de pendiente de techo en grados | Maestro Calc',
  'page.roof-pitch.description':
    'Ingresa la subida y el recorrido, como 6 en 12, y obtén el ángulo en grados y el largo del cabio, con el mínimo del IRC para tejas o metal. Gratis.',
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
