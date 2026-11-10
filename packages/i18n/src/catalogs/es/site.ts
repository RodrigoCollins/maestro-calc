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
  'site.footer.charts': 'Datos y tablas',
  'site.footer.editorial-policy': 'Política editorial',
  'site.byline.by': 'Por',
  'site.byline.team': 'el equipo editorial de Maestro Calc',
  'site.byline.reviewed': 'Revisado el',
  'site.byline.sources': 'Fuentes',
  'site.editorial.sources': 'Todas las fuentes que citan nuestras calculadoras',
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
  'site.job.guide.read': 'Para saber más:',
  'site.job.coverings.heading': 'Cubiertas de techo con esta pendiente',
  'site.job.coverings.lead':
    'La sección R905 del International Residential Code de 2021 fija una pendiente mínima para cada cubierta de techo. Así queda cada cubierta que revisa la calculadora con esta pendiente; tu código local o el fabricante del producto pueden pedir más.',
  'site.job.coverings.minimum': 'Mínimo del IRC',
  'site.job.coverings.status': 'Con esta pendiente',
  'site.job.coverings.meets': 'Cumple el mínimo',
  'site.job.coverings.double': 'Se permite con dos capas de fieltro',
  'site.job.coverings.below': 'Por debajo del mínimo',
  'site.job.slope.heading': 'Trabajar en un techo con esta pendiente',
  'site.job.slope.low':
    'La OSHA considera esta pendiente un techo de poca pendiente (low-slope roof), de 4 en 12 o menos (29 CFR 1926.500(b)). Quien trabaje a 6 ft o más sobre un nivel inferior necesita barandas, una red de seguridad, un sistema personal de detención de caídas, o una línea de advertencia combinada con uno de ellos o con un monitor de seguridad; en un techo de 50 ft de ancho o menos basta un monitor de seguridad (29 CFR 1926.501(b)(10)).',
  'site.job.slope.steep':
    'La OSHA considera esta pendiente un techo empinado (steep roof), de más de 4 en 12 (29 CFR 1926.500(b)). Quien trabaje a 6 ft o más sobre un nivel inferior debe estar protegido con barandas con rodapiés, una red de seguridad o un sistema personal de detención de caídas (29 CFR 1926.501(b)(11)); las líneas de advertencia y los monitores de seguridad que se permiten en un techo de poca pendiente no bastan.',
  'site.job.slope.sources': 'Fuentes',
  'site.job.slope.ridge.heading': 'Altura de la cumbrera de un hastial con esta pendiente',
  'site.job.slope.ridge.span24': 'Hastial de 24 ft de ancho (12 ft de recorrido)',
  'site.job.slope.ridge.span30': 'Hastial de 30 ft de ancho (15 ft de recorrido)',
  'site.job.slope.ridge.span36': 'Hastial de 36 ft de ancho (18 ft de recorrido)',
  'site.job.slope.area.heading': 'Superficie del techo sobre una planta con esta pendiente',
  'site.job.slope.area.lead':
    'En un techo a dos aguas, a un agua o a cuatro aguas cuyos planos tienen todos esta pendiente, la superficie del techo es la planta, con los aleros, por el multiplicador del cabio de arriba. Antes del desperdicio, el techo sobre tres plantas comunes es:',
  'site.job.slope.area.footprint': 'Planta',
  'site.job.slope.area.roof': 'Superficie del techo',
  'site.job.slope.area.squares': 'Cuadrados (100 sq ft)',
  'site.job.slope.area.more': 'El desperdicio, los paquetes y los rollos están en la',
  'site.job.floor.heading': 'Lo que cabe en este piso',
  'site.job.floor.perimeter': 'Borde del piso (zócalo)',
  'site.job.floor.carpet': 'Alfombra de un rollo de 12 ft de ancho',
  'site.job.floor.strips': 'tiras con una costura entre ellas',
  'site.job.floor.walls': 'Paredes de 8 ft de alto alrededor',
  'site.job.floor.paint': 'Pintura para esas paredes, dos manos',
  'site.job.floor.tile': 'Azulejo',
  'site.job.floor.perSide': 'Piezas a lo largo de cada lado',
  'site.job.floor.count': 'Piezas',
  'site.job.floor.extra': 'Con 10% extra',
  'site.job.room.paint.lead':
    'Las paredes no cuentan una puerta de 20 sq ft ni dos ventanas de 15 sq ft, el techo es el largo por el ancho, y el recorte es el borde que pintas con brocha antes del rodillo: junto al techo, junto al piso y en cada esquina.',
  'site.job.room.paint.sheet':
    'La ficha técnica de Quali-Kote detrás de estas cifras da de 350 a 400 sq ft por galón, seca al tacto en 1 hora y acepta otra mano a las 4 horas a 77 °F y 50% de humedad, así que las dos manos caben en un día. El drywall sin pintar lleva dos manos, o primero una de primer.',
  'site.job.room.paint.quarts': 'Paredes y techo, en latas de galón y de cuarto',
  'site.job.room.metricColumn': 'Área (m²)',
  'site.job.room.paint.litresColumn': 'Litros, dos manos',
  'site.job.room.drywall.lead':
    'Las paredes no cuentan una puerta ni dos ventanas, y el techo se cuenta aparte, cada uno con 10% por cortes. El manual de CGC (USG) coloca primero el techo; las placas atravesadas sobre los montantes reducen hasta un 25% las juntas que terminar.',
  'site.job.room.drywall.screws':
    'Tornillos a la separación máxima del manual sobre estructura de madera cada 16 in, 16 in en pared y 12 in en techo: una placa de 4 × 8 ft sobre 7 montantes lleva unos 28 en pared y 35 en techo. Una pared resistente al fuego sigue su propio listado.',
  'site.job.room.drywall.areaColumn': 'Paredes y techo (sq ft)',
  'site.job.room.drywall.compoundColumn': 'Compuesto (gal)',
  'site.job.floor.lead':
    'Calculado con los dos lados: el borde es el largo de zócalo, la alfombra sale de un rollo de 12 ft colocado en el sentido que gasta menos, y las paredes miden 8 ft de alto sin aberturas, a 350 sq ft por galón.',
  'site.job.floor.tiles':
    'Piezas enteras a lo largo de cada lado, una pieza cortada contada como entera y sin junta, más el 10% que los instaladores suelen dejar para cortes en una colocación recta; en diagonal se necesita más.',
  'site.job.floor.ceiling': 'Pintura para el techo, dos manos',
  'site.job.floor.drywall': 'Drywall para esas paredes y el techo',
  'site.job.floor.sheets': 'placas de 4 × 8 ft con 10% extra',
  'site.job.floor.slab': 'Concreto para una losa de 4 in de este tamaño, 10% extra',
  'site.job.floor.bags': 'bolsas de 80 lb',
  'site.job.concrete.slab.rebar':
    'Si tu plano pide una malla de varilla, estas son las varillas a cada separación: un juego corre a lo largo y otro a lo ancho, cada varilla del lado completo, sin traslapes ni recubrimiento del borde.',
  'site.job.concrete.slab.rebarLabel': 'Malla de varilla',
  'site.job.concrete.slab.spacing': 'Separación',
  'site.job.concrete.slab.alongLength': 'Varillas a lo largo',
  'site.job.concrete.slab.alongWidth': 'Varillas a lo ancho',
  'site.job.concrete.slab.total': 'Largo total',
  'site.job.concrete.column.summary.0': 'Un tubo de',
  'site.job.concrete.column.summary.1': 'in contiene',
  'site.job.concrete.column.summary.2': 'ft³ por pie y',
  'site.job.concrete.column.summary.3': 'L por metro, así que una bolsa de 80 lb llena',
  'site.job.concrete.column.summary.4': 'ft de tubo y una columna de 48 in pesa',
  'site.job.concrete.column.summary.5': 'lb. Doce columnas así llevan',
  'site.job.concrete.column.summary.6': 'bolsas de 80 lb con el extra,',
  'site.job.concrete.column.summary.7': 'yd³.',
  'site.job.rafter.summary.0': 'A',
  'site.job.rafter.summary.1': ', un recorrido de 12 ft lleva un cabio común de',
  'site.job.rafter.summary.2': 'ft y una lima de',
  'site.job.rafter.summary.3': 'ft; los cabios de relleno cambian',
  'site.job.rafter.summary.4': 'a 16 in entre centros y',
  'site.job.rafter.summary.5': 'a 24 in.',
  'site.job.concrete.slab.summary.0': 'A 4 in, esta losa de',
  'site.job.concrete.slab.summary.1': 'ft contiene',
  'site.job.concrete.slab.summary.2': 'ft³ de concreto y pesa',
  'site.job.concrete.slab.summary.3': 'lb,',
  'site.job.concrete.slab.summary.4': 'lb en cada pie cuadrado; a 6 in contiene',
  'site.job.concrete.slab.summary.5': 'ft³ y pesa',
  'site.job.concrete.slab.summary.6': 'lb. Su base de grava de 4 in es de',
  'site.job.concrete.slab.summary.7': 'yd³,',
  'site.job.concrete.slab.summary.8': 'toneladas.',
  'site.job.concrete.footing.summary.0': 'Una zapata de',
  'site.job.concrete.footing.summary.1': 'in contiene',
  'site.job.concrete.footing.summary.2': 'ft³ por pie y',
  'site.job.concrete.footing.summary.3': 'L por metro; una bolsa de 80 lb llena',
  'site.job.concrete.footing.summary.4': 'ft de zanja y cada pie pesa',
  'site.job.concrete.footing.summary.5': 'lb. Bajo una construcción de 24 × 36 ft,',
  'site.job.concrete.footing.summary.6': 'ft de zapata llevan',
  'site.job.concrete.footing.summary.7': 'bolsas de 80 lb con el extra.',
  'site.job.roof.summary.0': 'En esta planta de',
  'site.job.roof.summary.1': '×',
  'site.job.roof.summary.2': 'ft a',
  'site.job.roof.summary.3': '/12, los aleros corren',
  'site.job.roof.summary.4': 'ft, cada borde inclinado',
  'site.job.roof.summary.5': 'ft y la cumbrera',
  'site.job.roof.summary.6': 'ft,',
  'site.job.roof.summary.7': 'ft sobre los aleros; a 12/12 cada borde inclinado sería de',
  'site.job.roof.summary.8': 'ft.',
  'site.job.rafter.jacksLead':
    'Sobre un recorrido de 12 ft, los cabios de relleno junto a una lima bajan desde el cabio común, una separación a la vez hacia la esquina. Estos son sus largos hasta el eje de la lima, antes de restar la mitad de su grosor.',
  'site.job.rafter.jacksLabel': 'Cabios de relleno en un recorrido de 12 ft',
  'site.job.rafter.jack': 'Cabio',
  'site.job.rafter.jacks16': 'A 16 in entre centros',
  'site.job.rafter.jacks24': 'A 24 in entre centros',
  'site.job.floor.summary.0': 'Este piso de',
  'site.job.floor.summary.1': 'ft mide',
  'site.job.floor.summary.2': 'pies cuadrados,',
  'site.job.floor.summary.3': 'm²:',
  'site.job.floor.summary.4': 'ft de zócalo,',
  'site.job.floor.summary.5': 'yardas cuadradas de alfombra,',
  'site.job.floor.summary.6': 'azulejos de 12 in o',
  'site.job.floor.summary.7': 'de 24 in con el extra,',
  'site.job.floor.summary.8': 'placas de drywall para el cuarto a su alrededor y',
  'site.job.floor.summary.9': 'bolsas de 80 lb para una losa de 4 in.',
  'site.job.concrete.column.depthLead':
    'Un tubo a las profundidades que la tabla de tamaños no incluye, sin extra; las bolsas se redondean hacia arriba.',
  'site.job.concrete.column.depthLabel': 'Un tubo a otras profundidades',
  'site.job.concrete.column.depth': 'Profundidad',
  'site.job.concrete.column.net': 'Concreto sin extra',
  'site.job.concrete.column.bags': 'Bolsas de 80 / 60 / 40 lb',
  'site.job.concrete.tons': 'toneladas',
  'site.job.concrete.yards': 'Concreto con 10% extra (yd³)',
  'site.job.concrete.bags80': 'Bolsas de 80 lb',
  'site.job.concrete.bags60': 'Bolsas de 60 lb',
  'site.job.concrete.slab.heading': 'Esta losa, desde la base',
  'site.job.concrete.slab.lead':
    'Calculado a partir de los dos lados, sin extra: el borde es el largo de tablas de cimbra alrededor del colado, la base son 4 in de grava compactada, y los pesos usan los pesos unitarios citados del concreto y la grava.',
  'site.job.concrete.slab.area': 'Área de la losa',
  'site.job.concrete.slab.edge': 'Borde a cimbrar',
  'site.job.concrete.slab.base': 'Base de grava, 4 in compactada',
  'site.job.concrete.slab.thickness': 'Espesor',
  'site.job.concrete.slab.net': 'Concreto sin el extra',
  'site.job.concrete.slab.weight': 'Peso de la losa',
  'site.job.concrete.slab.perFoot': 'Peso por pie cuadrado',
  'site.job.concrete.column.heading': 'Este tubo, pie por pie',
  'site.job.concrete.column.lead':
    'Calculado con el motor de concreto sin extra; la tabla es una fila de tubos de 48 in de profundidad, como la de una terraza o un porche, con el 10% extra.',
  'site.job.concrete.column.after':
    'Cava cada hoyo a la profundidad que piden tu línea de congelamiento y tu código local, que puede ser más de 48 in.',
  'site.job.concrete.column.section': 'Sección del tubo',
  'site.job.concrete.column.perFoot': 'Concreto por pie de tubo',
  'site.job.concrete.column.fills': 'Tubo que llena una bolsa (80 / 60 / 40 lb)',
  'site.job.concrete.column.weight': 'Peso de una columna de 48 in',
  'site.job.concrete.column.tubes': 'Tubos',
  'site.job.concrete.footing.heading': 'Esta zapata, pie por pie',
  'site.job.concrete.footing.lead':
    'Calculado a partir de su sección sin extra; la tabla la lleva bajo cuatro construcciones comunes, medida por su eje, con el 10% extra.',
  'site.job.concrete.footing.after':
    'El tamaño de una zapata bajo un muro lo fijan el código local y el suelo.',
  'site.job.concrete.footing.section': 'Sección de la zapata',
  'site.job.concrete.footing.perFoot': 'Concreto por pie de zapata',
  'site.job.concrete.footing.fills': 'Zapata que llena una bolsa (80 / 60 / 40 lb)',
  'site.job.concrete.footing.weight': 'Peso de un pie de zapata',
  'site.job.concrete.footing.building': 'Construcción',
  'site.job.concrete.footing.run': 'Largo de la zapata',
  'site.job.soil.heading': 'Esta área, pulgada por pulgada',
  'site.job.soil.bedHeading': 'Este cantero, pulgada por pulgada',
  'site.job.soil.lead':
    'Calculado a partir de los dos lados: lo que contiene y pesa una pulgada de tierra sobre toda el área, y luego las profundidades a las que se suele llenar, en bolsas de 0.75, 1 y 1.5 pies cúbicos, sin extra.',
  'site.job.soil.after':
    'El peso usa 0.80 toneladas por yarda cúbica para la tierra vegetal, el factor de la hoja de conversión del EMNRD de Nuevo México. La tierra mojada pesa más, así que compara la carga útil de la camioneta o el remolque con la cifra que te dé tu proveedor. Las bolsas se redondean hacia arriba.',
  'site.job.soil.area': 'Área',
  'site.job.soil.inch': 'Tierra de una pulgada de profundidad',
  'site.job.soil.inchWeight': 'Peso de esa pulgada',
  'site.job.soil.tonPerYard': 'tonelada por yd³',
  'site.job.soil.tons': 'toneladas',
  'site.job.soil.depth': 'Profundidad',
  'site.job.soil.volume': 'Tierra',
  'site.job.soil.weight': 'Peso',
  'site.job.soil.bags': 'Bolsas de 0.75 / 1 / 1.5 pies cúbicos',
  'site.job.roof.heading': 'Este techo, borde por borde',
  'site.job.roof.lead':
    'Calculado con el motor de techos para un techo a dos aguas con la cumbrera a lo largo del lado más largo, con los aleros incluidos en la planta.',
  'site.job.roof.after':
    'Un techo a cuatro aguas no tiene bordes inclinados sino una lima en cada esquina: cuenta sus bordes en tu plano.',
  'site.job.roof.eaves': 'Aleros, los dos lados largos',
  'site.job.roof.rakes': 'Bordes inclinados, cuatro a esta pendiente',
  'site.job.roof.drip': 'Gotero por aleros y bordes inclinados',
  'site.job.roof.pieces': 'tramos de 10 ft',
  'site.job.roof.ridge': 'Cumbrera, para las tejas de cumbrera',
  'site.job.roof.rise': 'Altura de la cumbrera sobre los aleros',
  'site.job.roof.pitch': 'Pendiente',
  'site.job.roof.area': 'Área del techo (pies cuadrados)',
  'site.job.roof.squares': 'Cuadros',
  'site.job.roof.bundles': 'Paquetes con 10% extra',
  'site.job.roof.rake': 'Cada borde inclinado (ft)',
  'site.job.rafter.heading': 'La escuadra de carpintero a esta pendiente',
  'site.job.rafter.lead':
    'La tabla de cabios de una escuadra de carpintero de acero, calculada para esta subida: el brazo largo y el brazo corto son los de la escuadra, y cada largo es por pie de recorrido.',
  'site.job.rafter.after':
    'Los largos llegan al centro de la cumbrera, así que resta la mitad de su grosor antes de marcar; un corte lateral es la cifra que pones contra 12 en el otro brazo.',
  'site.job.rafter.commonSet': 'Cabio común, escuadra en',
  'site.job.rafter.body': 'in en el brazo largo',
  'site.job.rafter.tongue': 'in en el brazo corto',
  'site.job.rafter.commonAngle': 'Ángulo del corte a plomo, escala de grados de la escuadra rápida',
  'site.job.rafter.hipSet': 'Lima, escuadra en',
  'site.job.rafter.hipAngle': 'Ángulo de la lima',
  'site.job.rafter.line': 'Línea de la tabla de cabios',
  'site.job.rafter.inches': 'Pulgadas',
  'site.job.rafter.sixteenth': 'A 1/16 in',
  'site.job.rafter.common': 'Largo del cabio común por pie de recorrido',
  'site.job.rafter.hip': 'Largo de la lima por pie de recorrido',
  'site.job.rafter.jack16': 'Diferencia de largo de los cabios de relleno, a 16 in',
  'site.job.rafter.jack24': 'Diferencia de largo de los cabios de relleno, a 24 in',
  'site.job.rafter.jackSide': 'Corte lateral de los cabios de relleno',
  'site.job.rafter.hipSide': 'Corte lateral de la lima',
  'site.job.room.height': 'Altura de las paredes',
  'site.job.room.paint.heading': 'Este cuarto, superficie por superficie',
  'site.job.room.paint.long': 'Dos paredes, cada una',
  'site.job.room.paint.short': 'Las otras dos paredes, cada una',
  'site.job.room.paint.ceiling': 'Techo',
  'site.job.room.paint.oneCoat': 'Paredes, una mano',
  'site.job.room.paint.high': 'Paredes, dos manos con el rendimiento alto de la ficha',
  'site.job.room.paint.together': 'Paredes y techo, dos manos',
  'site.job.room.paint.cans': 'latas',
  'site.job.room.paint.cutIn': 'Bordes para recortar con brocha',
  'site.job.room.paint.areaColumn': 'Paredes y techo (sq ft)',
  'site.job.room.paint.gallonsColumn': 'Galones, dos manos',
  'site.job.room.paint.cansColumn': 'Latas de un galón',
  'site.job.room.drywall.heading': 'Este cuarto, placa por placa',
  'site.job.room.drywall.walls': 'Solo paredes, con el extra',
  'site.job.room.drywall.ceiling': 'Solo techo, con el extra',
  'site.job.room.drywall.sheets8': 'placas de 4 × 8 ft o',
  'site.job.room.drywall.sheets12': 'de 4 × 12 ft',
  'site.job.room.drywall.wallScrews': 'Tornillos para las paredes, unos',
  'site.job.room.drywall.ceilingScrews': 'Tornillos para el techo, unos',
  'site.job.room.drywall.compound': 'Compuesto para juntas, paredes y techo',
  'site.job.room.drywall.tape': 'Cinta de papel, paredes y techo',
  'site.job.room.drywall.screwsColumn': 'Tornillos, paredes y techo',
  'site.job.room.drywall.hangColumn': 'Cómo colocar las paredes',
  'site.job.room.drywall.across48': 'Atravesadas sobre los montantes, dos filas de placas de 4 ft',
  'site.job.room.drywall.across54': 'Atravesadas sobre los montantes, dos filas de placas de 54 in',
  'site.job.room.drywall.along': 'A lo largo de los montantes, placas de pie',
  'site.job.guide.concrete-slab.heading': 'Antes de colar la losa',
  'site.job.guide.concrete-slab.tip1':
    'Mide la losa por dentro de las cimbras, no por encima de las tablas, y revisa el espesor en varios puntos cuando la base ya esté nivelada. Una losa pensada de 4 in que queda en 4 1/2 in de promedio lleva un octavo más de concreto que la tabla.',
  'site.job.guide.concrete-slab.tip2':
    'Decide el espesor antes de contar bolsas. Pasar de 4 a 5 in suma un cuarto más de concreto, y de 4 a 6 in suma la mitad, por eso la tabla da los tres.',
  'site.job.guide.concrete-slab.tip3':
    'Compara las bolsas con un camión. Mezclar decenas de bolsas a mano es lento, y un colado que se detiene a la mitad deja una junta fría. El premezclado se vende por yarda cúbica, así que pregunta al proveedor la carga mínima y si cobra extra por carga corta antes de decidir.',
  'site.job.guide.concrete-slab.tip4':
    'Planea el peso además de la cantidad. Cada bolsa de 80 lb son 80 lb que levantar, cargar y mezclar, así que 30 bolsas son 2,400 lb de mezcla seca: revisa la capacidad de carga de la camioneta o el remolque que las lleva.',
  'site.job.guide.concrete-tube.heading': 'Antes de colocar los tubos',
  'site.job.guide.concrete-tube.tip1':
    'Mide la profundidad desde el borde del tubo, no desde el suelo. Un tubo que sobresale unas pulgadas del terreno también se llena en esa altura, así que súmala a la profundidad que escribes en la calculadora.',
  'site.job.guide.concrete-tube.tip2':
    'El diámetro es el interior del tubo y viene impreso en la cimbra. Un tubo más ancho suma concreto rápido: el volumen crece con el cuadrado del diámetro, así que un tubo de 12 in lleva 2.25 veces lo que lleva uno de 8 in a la misma profundidad.',
  'site.job.guide.concrete-tube.tip3':
    'Las bolsas van bien con los tubos: cada uno lleva pocas, así que puedes mezclar y llenar un tubo a la vez. Llena por capas y pica el concreto con una varilla o golpea el costado del tubo para sacar el aire.',
  'site.job.guide.concrete-tube.tip4':
    'Tu código local fija qué tan hondo va un pilar, muchas veces por debajo de la línea de congelamiento, y qué tan ancha es su base. Revísalo antes de comprar los tubos, porque un hoyo más hondo cambia todas las cifras de esta página.',
  'site.job.guide.concrete-footing.heading': 'Antes de excavar la zapata',
  'site.job.guide.concrete-footing.tip1':
    'Excava la zanja con todo su ancho y su profundidad a lo largo de todo el tramo, y mídela en varios puntos. Una zanja un poco más ancha o más honda es la razón habitual de que una zapata lleve más de lo pensado, y para eso es el 10% extra.',
  'site.job.guide.concrete-footing.tip2':
    'Mide el largo por el eje de la zapata. Si sumas los lados por fuera de un rectángulo, cuentas cada esquina dos veces; por el eje, las esquinas salen bien.',
  'site.job.guide.concrete-footing.tip3':
    'Una zapata larga son muchas bolsas. Pasada una o dos yardas cúbicas, cotiza también el premezclado y pregunta al proveedor si el camión llega a la zanja o si necesitas bomba o carretillas.',
  'site.job.guide.concrete-footing.tip4':
    'El tamaño de una zapata es una decisión estructural, no de cálculo de materiales. Toma el ancho y la profundidad de tus planos o de tu departamento de construcción local, y luego usa la calculadora para contar el concreto.',
  'site.job.guide.roof-pitch.heading': 'Antes de cortar los cabios',
  'site.job.guide.roof-pitch.tip1':
    'Mide la pendiente a nivel y a plomo, nunca a lo largo del techo. Apoya un nivel en un cabio o en la cubierta, marca 12 in sobre el nivel y mide en vertical hasta el techo: esa medida es la subida en 12.',
  'site.job.guide.roof-pitch.tip2':
    'Los largos de cabio de esta página llegan hasta la línea a plomo de la cumbrera, sin alero. Suma el alero en la calculadora y resta la mitad del grueso de la tabla de cumbrera antes de marcar el corte.',
  'site.job.guide.roof-pitch.tip3':
    'Revisa la cubierta antes de decidir la pendiente. La tabla de cubiertas de esta página da el mínimo del IRC de cada cubierta con esta pendiente, y tu código local o el fabricante del producto pueden pedir más que el código.',
  'site.job.guide.roof-pitch.tip4':
    'Más pendiente es más techo sobre la misma planta: más tablero, más fieltro y más tejas. Usa la calculadora de tejas con esta pendiente antes de pedir los materiales.',
  'site.job.guide.rectangle-area.heading': 'Antes de comprar para esta área',
  'site.job.guide.rectangle-area.tip1':
    'Mide cada lado en dos o tres puntos y usa la medida más larga. Las paredes casi nunca están perfectamente a escuadra, y la lectura más corta te deja sin piso o sin azulejo.',
  'site.job.guide.rectangle-area.tip2':
    'Convierte pies y pulgadas con cuidado: 6 in son 0.5 ft, no 0.6 ft. Escribe la medida tal como la lees en la cinta y deja que la calculadora haga la conversión.',
  'site.job.guide.rectangle-area.tip3':
    'El área es lo que mediste, sin nada agregado. El piso y el azulejo pierden material en los cortes, y los instaladores suelen sumar cerca de 10% para una colocación simple y más para una en diagonal, así que revisa lo que recomienda el fabricante de tu producto.',
  'site.job.guide.rectangle-area.tip4':
    'Divide el área entre lo que cubre una caja o un rollo y redondea hacia arriba a una unidad entera. Compra todas las cajas del mismo lote cuando puedas, porque el tono del azulejo y del piso puede cambiar de un lote a otro.',
  'site.job.guide.mulch.heading': 'Antes de comprar el mulch',
  'site.job.guide.mulch.tip1':
    'Las bolsas se venden por volumen, no por peso. Lee los pies cúbicos impresos en la bolsa que piensas comprar, porque la cantidad de bolsas de arriba cambia con su tamaño.',
  'site.job.guide.mulch.tip2':
    'Mide la profundidad que agregas, no la que tendrá el cantero. Sobre 2 in de mulch viejo, 1 pulgada más deja el cantero en 3 in; o retira primero la capa vieja con el rastrillo.',
  'site.job.guide.mulch.tip3':
    'El mulch a granel se vende por yarda cúbica, la unidad con la que cuenta esta página. Pasada una o dos yardas, compara el precio a granel y su entrega con el costo de las bolsas.',
  'site.job.guide.mulch.tip4':
    'Deja el mulch a unas pulgadas de los troncos y de los tallos. Un montón pegado a la corteza guarda humedad donde la planta no la quiere, y desperdicia material.',
  'site.job.guide.gravel.heading': 'Antes de pedir la grava',
  'site.job.guide.gravel.tip1':
    'Pide por tonelada cuando el proveedor venda así. Una tonelada siempre es una tonelada, mientras que una yarda cúbica pesa distinto suelta y compactada, así que las toneladas de esta página son el pedido más seguro.',
  'site.job.guide.gravel.tip2':
    'Una entrada para autos se arma por capas, una base gruesa debajo de una capa final más fina. Usa la calculadora una vez por capa con su propia profundidad y suma las toneladas.',
  'site.job.guide.gravel.tip3':
    'Nivela y compacta el terreno antes de medir la profundidad. Un bajo de un par de pulgadas a lo largo de una entrada larga suma toneladas rápido.',
  'site.job.guide.gravel.tip4':
    'Pregunta al proveedor cómo descargará el camión. Algunos choferes pueden esparcir la carga a lo largo de la entrada mientras avanzan, lo que ahorra horas de carretilla, así que diles el largo que necesitas cubrir.',
  'site.job.guide.paint.heading': 'Antes de comprar la pintura',
  'site.job.guide.paint.tip1':
    'Mide las paredes, no el piso: el contorno del cuarto por la altura. Un cuarto de 12 por 12 ft con 8 ft de alto tiene 384 sq ft de pared y solo 144 sq ft de piso.',
  'site.job.guide.paint.tip2':
    'El drywall nuevo, el yeso sin pintar y un cambio fuerte de color absorben más pintura. Aplica primero un sellador, o cuenta con menos rendimiento del que indica la etiqueta.',
  'site.job.guide.paint.tip3':
    'Compra los galones de todo el cuarto de una vez y mézclalos en una sola cubeta antes de empezar, para que la pintura de dos latas o de dos lotes se vea igual en la pared.',
  'site.job.guide.paint.tip4':
    'El techo, los marcos y las puertas llevan su propia pintura, muchas veces otro producto u otro acabado. Calcúlalos aparte, y guarda una lata cerrada del color de las paredes para retoques.',
  'site.job.guide.drywall.heading': 'Antes de pedir el drywall',
  'site.job.guide.drywall.tip1':
    'Cuenta el techo aparte de las paredes. El techo muchas veces lleva otra placa, como una resistente al pandeo, así que conviene tener su propia cantidad de placas.',
  'site.job.guide.drywall.tip2':
    'Elige el largo de la placa según la pared. Las placas de 4 × 12 dejan menos juntas que encintar en una pared larga, pero pesan, así que planea dos personas y un paso libre hasta el cuarto.',
  'site.job.guide.drywall.tip3':
    'Pide el compuesto y la cinta para juntas junto con las placas: la calculadora los cuenta con las cifras de rendimiento de USG. Los tornillos se estiman arriba; las esquineras y los remates los cuentas en la obra.',
  'site.job.guide.drywall.tip4':
    'Deja el extra para los cortes. Alrededor de puertas, ventanas, enchufes y esquinas cortas piezas que no puedes volver a usar, así que un cuarto con muchas esquinas o con escalera necesita más que el valor inicial.',
  'site.job.guide.topsoil.heading': 'Antes de llenar el cantero o el área',
  'site.job.guide.topsoil.tip1':
    'La tierra se asienta después de colocarla. Reparte un relleno hondo por capas, riega cada una un poco y completa el cantero cuando ya se haya asentado.',
  'site.job.guide.topsoil.tip2':
    'Fíjate qué compras. La tierra vegetal cernida, la tierra para jardín, la mezcla para canteros elevados y la tierra de relleno se venden con nombres y precios distintos, así que pregunta al proveedor cuál sirve para un huerto o para el pasto.',
  'site.job.guide.topsoil.tip3':
    'Las bolsas suman rápido: un cantero hondo puede llevar decenas. Pasada una yarda cúbica más o menos, una carga a granel suele salir más barata y más cómoda, aun con el costo de entrega.',
  'site.job.guide.topsoil.tip4':
    'Planea dónde deja el camión el montón: cerca del trabajo, fuera del pasto si puedes, y tapado si viene lluvia.',
  'site.job.guide.roofing.heading': 'Antes de pedir las tejas',
  'site.job.guide.roofing.tip1':
    'Mide la planta con los aleros, porque los aleros también son techo. Un alero de 1 ft en cada lado de una casa de 38 por 28 ft da una planta de 40 por 30 ft.',
  'site.job.guide.roofing.tip2':
    'Las tejas se venden por paquete y se cuentan por cuadrado de 100 sq ft. El paquete que usa la calculadora cubre 33.33 sq ft, tres por cuadrado; revisa la cobertura impresa en el paquete que compras.',
  'site.job.guide.roofing.tip3':
    'De 2 en 12 hasta 4 en 12, el IRC pide dos capas de fieltro debajo de las tejas asfálticas, y por debajo de 2 en 12 no las permite. La calculadora de tejas duplica los rollos en ese rango.',
  'site.job.guide.roofing.tip4':
    'El extra cubre la hilera de arranque, las tejas de cumbrera y limatesa, y los cortes en las limahoyas. Los clavos, el gotero, los tapajuntas y la barrera contra hielo van aparte, así que pídelos al proveedor junto con el pedido.',
  'site.job.guide.feet-inches.heading': 'Antes de marcar y cortar',
  'site.job.guide.feet-inches.tip1':
    'Marca con la columna de la cinta, no con los decimales. Redondea al 1/16 in más cercano, la marca más chica de casi todas las cintas, que es lo más fino que suele salir un corte.',
  'site.job.guide.feet-inches.tip2':
    'Cuenta la hoja de la sierra. Cada corte se come cerca de 1/8 in de madera, así que al cortar una tabla en partes iguales cada pieza queda un poco corta si no restas antes los cortes.',
  'site.job.guide.feet-inches.tip3':
    'Mide todas las marcas desde la misma punta de la tabla. Marcar cada pieza desde la anterior va sumando pequeños errores a lo largo de la tabla.',
  'site.job.guide.feet-inches.tip4':
    'Lee la respuesta en palabras antes de cortar. La calculadora repite las dos medidas, y es la forma más rápida de detectar un error como escribir 39 in en lugar de 3 ft 9 in.',
  'site.job.worked.heading': 'Cómo se calculan las cifras',
  'site.job.worked.concrete.net': 'Volumen de la primera medida, antes del extra',
  'site.job.worked.concrete.total':
    'Con el 10% de extra, en pies cúbicos, yardas cúbicas y metros cúbicos',
  'site.job.worked.concrete.bags':
    'Bolsas de 80 lb, de cerca de 0.60 pies cúbicos cada una, redondeando hacia arriba',
  'site.job.worked.concrete.weight': 'Peso de la mezcla seca que hay que levantar y cargar',
  'site.job.worked.cost.readyMix': 'Concreto premezclado a los dos precios de productor',
  'site.job.worked.cost.installed': 'Instalada al precio publicado más bajo y al más alto',
  'site.job.worked.area.feet': 'Área de la primera medida',
  'site.job.worked.area.yards': 'En yardas cuadradas, de 9 pies cuadrados cada una',
  'site.job.worked.area.metric': 'En sistema métrico, con 1 ft = 0.3048 m',
  'site.job.worked.area.cuts':
    'Con cerca de 10% por los cortes, como suelen sumar los instaladores para piso o azulejo en una colocación simple',
  'site.job.worked.paint.walls': 'Área de las cuatro paredes',
  'site.job.worked.paint.openings': 'Menos una puerta de 20 sq ft y dos ventanas de 15 sq ft',
  'site.job.worked.paint.gallons': 'Dos manos a 350 sq ft por galón, en galones y litros',
  'site.job.worked.paint.cans': 'Latas de un galón que comprar, redondeando hacia arriba',
  'site.job.worked.drywall.walls':
    'Área de las cuatro paredes, menos una puerta de 20 sq ft y dos ventanas de 15 sq ft',
  'site.job.worked.drywall.ceiling': 'Con el techo, en pies cuadrados y metros cuadrados',
  'site.job.worked.drywall.sheets':
    'Placas de 4 × 8 ft (32 sq ft) con el 10% de extra por los cortes, redondeando hacia arriba',
  'site.job.worked.roofing.footprint': 'Planta del techo, con los aleros',
  'site.job.worked.roofing.slope':
    'Factor de pendiente: cuánto más largo es el techo que su planta con esta pendiente',
  'site.job.worked.roofing.area':
    'Área del techo sobre la pendiente, en pies cuadrados y metros cuadrados',
  'site.job.worked.roofing.squares':
    'Cuadrados de 100 sq ft, la unidad con la que cotizan los techadores',
  'site.job.worked.roofing.bundles':
    'Paquetes de 33.33 sq ft con el 10% de extra, redondeando hacia arriba',
  'site.job.worked.roof-pitch.multiplier': 'Multiplicador del cabio con esta pendiente',
  'site.job.worked.roof-pitch.rafter': 'Cabio sobre el primer recorrido de la tabla',
  'site.job.worked.roof-pitch.metric': 'El mismo cabio en sistema métrico, con 1 ft = 0.3048 m',
  'site.job.worked.roof-pitch.angle': 'Ángulo del techo',
  'site.job.worked.topsoil.net': 'Volumen de la primera medida, antes del asentamiento',
  'site.job.worked.topsoil.total':
    'Con el 10% por asentamiento, en pies cúbicos, yardas cúbicas y metros cúbicos',
  'site.job.worked.topsoil.exact': 'Sin extra, en pies cúbicos, yardas cúbicas y metros cúbicos',
  'site.job.worked.topsoil.bags': 'Bolsas de 0.75 pies cúbicos, redondeando hacia arriba',
  'site.job.worked.gravel.placed':
    'Volumen colocado de la primera medida, en pies cúbicos y yardas cúbicas',
  'site.job.worked.gravel.total': 'Con el 5% de extra',
  'site.job.worked.gravel.weight': 'Peso compactado, a 3,660 lb por yarda cúbica (WisDOT)',
  'site.job.worked.gravel.exact': 'Sin extra',
  'site.job.worked.gravel.weightLoose': 'Peso suelto, a 2,580 lb por yarda cúbica (WisDOT)',
  'site.job.worked.gravel.tons': 'En toneladas cortas de 2,000 lb',
  'site.job.worked.gravel.order': 'Yardas cúbicas sueltas que pedir, a 2,580 lb por yarda cúbica',
  'site.job.worked.feet-inches.inches': 'La medida en pulgadas, 12 in por pie',
  'site.job.worked.feet-inches.divide': 'Dividida en partes iguales',
  'site.job.worked.feet-inches.tape':
    'En dieciseisavos, a la marca de 1/16 in más cercana de la cinta',
  'site.job.worked.feet-inches.metric': 'En sistema métrico, con 1 in = 0.0254 m exactos',
  'site.job.land.heading': 'Qué es un acre según la ley',
  'site.job.land.definition':
    'El Handbook 44 del NIST, el manual con el que trabajan los inspectores de pesas y medidas de Estados Unidos, define el acre como 43,560 pies cuadrados, que son 160 varas cuadradas, 10 cadenas cuadradas de 66 pies cada una o 4,840 yardas cuadradas. En el sistema métrico un acre son exactamente 4,046.856 422 4 metros cuadrados, o 0.404 685 642 24 hectáreas.',
  'site.job.land.surveyFoot':
    'Desde el 1 de enero de 2023, el acre se basa en el pie internacional de exactamente 0.3048 m. El NIST y el National Geodetic Survey retiraron el pie de agrimensor de Estados Unidos, unas dos partes por millón más largo, salvo para registros antiguos. Un acre en pies de agrimensor mide 4,046.873 metros cuadrados, unos 0.17 pies cuadrados más: una diferencia que ningún lindero ni anuncio va a mostrar.',
  'site.job.land.source': 'Fuente',
  'site.job.land.shape': 'Formas de un lote de este tamaño',
  'site.job.land.glance': 'Esta área de un vistazo',
  'site.job.land.acres': 'Acres',
  'site.job.land.hectares': 'Hectáreas',
  'site.job.land.side': 'Lado de un cuadrado de esta área',
  'site.job.land.floor12': 'Cuartos de 12 × 12 pies (144 pies cuadrados)',
  'site.job.land.floor20': 'Pisos de 20 × 20 pies (400 pies cuadrados)',
  'site.job.land.floor24': 'Pisos de 24 × 24 pies (576 pies cuadrados)',
  'site.job.land.cover.heading': 'Tierra y mulch para todo el lote',
  'site.job.land.cover.lead':
    'Calculado sobre el primer lote de la tabla con la calculadora de tierra para jardín, con su 10% por asentamiento, y con la calculadora de mulch, con su 5% extra. Cada fila abre la calculadora con el lote ya cargado, para que cambies la profundidad o el área que de verdad vas a cubrir.',
  'site.job.land.cover.material': 'Material',
  'site.job.land.cover.depth': 'Profundidad',
  'site.job.land.cover.yards': 'Yardas cúbicas',
  'site.job.land.cover.topsoil': 'Tierra para jardín',
  'site.job.land.cover.mulch': 'Mulch',
  'site.job.land.note':
    'Cada lote de la tabla es un rectángulo de exactamente esta área. Un acre no tiene una forma fija, así que cualquier contorno con los mismos pies cuadrados tiene la misma superficie. Un pie cuadrado es exactamente 0.09290304 metros cuadrados. Cada medida abre la calculadora con sus valores ya cargados.',
  'site.job.guide.land.heading': 'Antes de medir o comprar para un lote',
  'site.job.guide.land.tip1':
    'Toma la superficie de la escritura, del plano o del registro catastral del condado en vez de medirla a pasos. Un levantamiento da el área al centésimo de acre y muestra dónde están de verdad las esquinas, algo que una cinta tendida sobre el jardín no puede hacer.',
  'site.job.guide.land.tip2':
    'Un lote irregular es un conjunto de formas más simples. Divídelo en rectángulos y triángulos rectángulos, calcula cada área (un triángulo es la mitad de su base por su altura), súmalas y divide los pies cuadrados entre 43,560 para obtener los acres.',
  'site.job.guide.land.tip3':
    'Pide el pasto en rollo, la semilla y la tierra para el área que vas a plantar, no para todo el lote. Resta primero la casa, la entrada, el patio y los canteros, y pregunta al proveedor cuántos pies cuadrados cubre un palé o una bolsa, porque cambia según el producto.',
  'site.job.guide.land.tip4':
    'Cotiza una cerca por el perímetro, no por el área. Dos lotes con la misma superficie pueden necesitar largos de cerca muy distintos, porque un lote largo y angosto tiene mucho más borde que uno cuadrado, así que mide cada lado antes de contar postes y travesaños.',
  'site.job.worked.land.acres': 'En acres, de 43,560 pies cuadrados cada uno',
  'site.job.worked.land.hectares': 'En hectáreas, de 10,000 metros cuadrados cada una',
  'site.job.more': 'Más trabajos',
  'site.job.chart.index': 'Todas las tablas y sus fuentes: datos y tablas',
  'site.charts.checked': 'Revisada el',
  'site.charts.sources': 'Fuentes de',
  'site.charts.press.heading': 'Para periodistas y blogueros',
  'site.charts.press.text':
    'Puedes citar y reproducir las cifras de estas tablas gratis, con un enlace a la tabla de donde salen. Cada tabla termina con la línea para citarla. Si tienes una pregunta sobre una cifra, una fuente o el método, escribe a press@maestrocalc.com.',
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
  'page.editorial-policy.title': 'Política editorial | Maestro Calc',
  'page.editorial-policy.description':
    'Quién hace Maestro Calc, de dónde sale cada número, cómo probamos las cifras, cuándo revisamos las páginas y cómo avisarnos de un error.',
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
  'page.charts.title': 'Datos y tablas para citar | Maestro Calc',
  'page.charts.description':
    'Las tablas de referencia de Maestro Calc: losas de concreto, pendientes de techo y peso por yarda cúbica, con sus fuentes, su fecha y cómo citarlas.',
  'page.guide-concrete-bags-or-truck.title': '¿Concreto en bolsas o en camión? | Maestro Calc',
  'page.guide-concrete-bags-or-truck.description':
    'Cuándo conviene comprar bolsas de mezcla para concreto y cuándo un camión de premezclado: una yarda cúbica en bolsas, cargos por carga chica y cómo comparar.',
  'page.guide-tape-measure-fractions.title':
    'Cómo leer la cinta métrica y sumar fracciones | Maestro Calc',
  'page.guide-tape-measure-fractions.description':
    'Cómo leer la cinta métrica en pulgadas: qué fracción es cada marca, de 1/2 a 1/16 de pulgada, y cómo sumar, restar y dividir pies, pulgadas y fracciones.',
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
  'page.concrete-slab-10x10.intro':
    'Una losa de 10 por 10 ft, 100 sq ft, es una base común para un cobertizo chico, un jacuzzi o un patio junto a la puerta de atrás.',
  'page.concrete-slab-10x12.title': 'Bolsas de concreto para una losa de 10x12 | Maestro Calc',
  'page.concrete-slab-10x12.description':
    'Cuántas bolsas de concreto lleva una losa de 10 x 12 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-10x12.heading': '¿Cuántas bolsas de concreto para una losa de 10x12?',
  'page.concrete-slab-10x12.label': 'Losa de 10x12',
  'page.concrete-slab-10x12.intro':
    'Una losa de 10 por 12 ft, 120 sq ft, es un piso común para un cobertizo de jardín o un patio chico.',
  'page.concrete-slab-12x12.title': 'Bolsas de concreto para una losa de 12x12 | Maestro Calc',
  'page.concrete-slab-12x12.description':
    'Cuántas bolsas de concreto lleva una losa de 12 x 12 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-12x12.heading': '¿Cuántas bolsas de concreto para una losa de 12x12?',
  'page.concrete-slab-12x12.label': 'Losa de 12x12',
  'page.concrete-slab-12x12.intro':
    'Una losa de 12 por 12 ft, 144 sq ft, es un patio cuadrado o el piso de un cobertizo de 12 por 12.',
  'page.concrete-slab-10x20.title': 'Bolsas de concreto para una losa de 10x20 | Maestro Calc',
  'page.concrete-slab-10x20.description':
    'Cuántas bolsas de concreto lleva una losa de 10 x 20 ft (un auto o un patio) de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas.',
  'page.concrete-slab-10x20.heading': '¿Cuántas bolsas de concreto para una losa de 10x20?',
  'page.concrete-slab-10x20.label': 'Losa de 10x20',
  'page.concrete-slab-10x20.intro':
    'Una losa de 10 por 20 ft, 200 sq ft, es un lugar para estacionar un auto o un patio largo junto a la casa.',
  'page.concrete-slab-12x20.title': 'Bolsas de concreto para una losa de 12x20 | Maestro Calc',
  'page.concrete-slab-12x20.description':
    'Cuántas bolsas de concreto lleva una losa de 12 x 20 ft (una cochera o el piso de un cobertizo) de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-slab-12x20.heading': '¿Cuántas bolsas de concreto para una losa de 12x20?',
  'page.concrete-slab-12x20.label': 'Losa de 12x20',
  'page.concrete-slab-12x20.intro':
    'Una losa de 12 por 20 ft, 240 sq ft, es una cochera abierta o el piso de un cobertizo grande o un taller.',
  'page.concrete-slab-12x24.title': 'Bolsas de concreto para una losa de 12x24 | Maestro Calc',
  'page.concrete-slab-12x24.description':
    'Cuántas bolsas de concreto lleva una losa de 12 x 24 ft (un garaje para un auto) de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas.',
  'page.concrete-slab-12x24.heading': '¿Cuántas bolsas de concreto para una losa de 12x24?',
  'page.concrete-slab-12x24.label': 'Losa de 12x24',
  'page.concrete-slab-12x24.intro':
    'Una losa de 12 por 24 ft, 288 sq ft, es el piso de un garaje para un auto o de un patio techado largo.',
  'page.concrete-slab-20x20.title': 'Bolsas de concreto para una losa de 20x20 | Maestro Calc',
  'page.concrete-slab-20x20.description':
    'Cuántas bolsas de concreto lleva una losa de 20 x 20 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-20x20.heading': '¿Cuántas bolsas de concreto para una losa de 20x20?',
  'page.concrete-slab-20x20.label': 'Losa de 20x20',
  'page.concrete-slab-20x20.intro':
    'Una losa de 20 por 20 ft, 400 sq ft, es un lugar para estacionar dos autos o un patio grande.',
  'page.concrete-slab-24x24.title': 'Bolsas de concreto para una losa de 24x24 | Maestro Calc',
  'page.concrete-slab-24x24.description':
    'Cuántas bolsas de concreto lleva una losa de 24 x 24 ft de 4, 5 o 6 in de espesor, en bolsas de 40, 60 u 80 lb, y las yardas cúbicas para pedir un camión.',
  'page.concrete-slab-24x24.heading': '¿Cuántas bolsas de concreto para una losa de 24x24?',
  'page.concrete-slab-24x24.label': 'Losa de 24x24',
  'page.concrete-slab-24x24.intro':
    'Una losa de 24 por 24 ft, 576 sq ft, es un piso común para un garaje de dos autos.',
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
  'page.concrete-pad-4x4.intro':
    'Una base de 4 por 4 ft, 16 sq ft, se cuela debajo de la unidad exterior del aire acondicionado o de un generador, o como descanso al pie de un escalón.',
  'page.concrete-tube-8.title': 'Bolsas de concreto para un Sonotube de 8 in | Maestro Calc',
  'page.concrete-tube-8.description':
    'Cuántas bolsas de concreto llenan un Sonotube (tubo de cartón para columnas) de 8 in y 2, 3 o 4 ft de profundidad, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-tube-8.heading': '¿Cuántas bolsas de concreto para un Sonotube de 8 in?',
  'page.concrete-tube-8.label': 'Sonotube de 8 in',
  'page.concrete-tube-8.intro':
    'Un tubo de 8 in es una medida común para los pilares de una terraza chica o un poste de porche. Lleva cerca de 0.35 pies cúbicos de concreto por cada pie de profundidad, antes del extra.',
  'page.concrete-tube-10.title': 'Bolsas de concreto para un Sonotube de 10 in | Maestro Calc',
  'page.concrete-tube-10.description':
    'Cuántas bolsas de concreto llenan un Sonotube (tubo de cartón para columnas) de 10 in y 2, 3 o 4 ft de profundidad, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-tube-10.heading': '¿Cuántas bolsas de concreto para un Sonotube de 10 in?',
  'page.concrete-tube-10.label': 'Sonotube de 10 in',
  'page.concrete-tube-10.intro':
    'Un tubo de 10 in es el paso siguiente al de 8 in para un pilar que carga más. Lleva cerca de 0.55 pies cúbicos de concreto por cada pie de profundidad, antes del extra.',
  'page.concrete-tube-12.title': 'Bolsas de concreto para un Sonotube de 12 in | Maestro Calc',
  'page.concrete-tube-12.description':
    'Cuántas bolsas de concreto llenan un Sonotube (tubo de cartón para columnas) de 12 in y 2, 3 o 4 ft de profundidad, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-tube-12.heading': '¿Cuántas bolsas de concreto para un Sonotube de 12 in?',
  'page.concrete-tube-12.label': 'Sonotube de 12 in',
  'page.concrete-tube-12.intro':
    'Un tubo de 12 in se usa para los pilares de una terraza más pesada o un poste de techo. Lleva cerca de 0.79 pies cúbicos de concreto por cada pie de profundidad, antes del extra.',
  'page.concrete-footing-16x8.title': 'Bolsas de concreto para zapata de 16x8 in | Maestro Calc',
  'page.concrete-footing-16x8.description':
    'Cuántas bolsas de concreto lleva una zapata corrida de 16 in de ancho y 8 in de profundidad para 20, 50 o 100 ft de muro, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-footing-16x8.heading': '¿Cuántas bolsas de concreto para una zapata de 16x8 in?',
  'page.concrete-footing-16x8.label': 'Zapata de 16x8 in',
  'page.concrete-footing-16x8.intro':
    'Una zapata de 16 in de ancho y 8 in de profundidad es una franja continua de concreto debajo de un muro. Cada pie de zapata son 16 × 8 ÷ 144 = 0.89 pies cúbicos antes del extra.',
  'page.concrete-footing-20x10.title': 'Bolsas de concreto para zapata de 20x10 in | Maestro Calc',
  'page.concrete-footing-20x10.description':
    'Cuántas bolsas de concreto lleva una zapata corrida de 20 in de ancho y 10 in de profundidad para 20, 50 o 100 ft de muro, en bolsas de 40, 60 u 80 lb.',
  'page.concrete-footing-20x10.heading': '¿Cuántas bolsas de concreto para una zapata de 20x10 in?',
  'page.concrete-footing-20x10.label': 'Zapata de 20x10 in',
  'page.concrete-footing-20x10.intro':
    'Una zapata de 20 in de ancho y 10 in de profundidad es una franja continua de concreto debajo de un muro. Cada pie de zapata son 20 × 10 ÷ 144 = 1.39 pies cúbicos antes del extra, cerca de 56% más que una zapata de 16 por 8 in.',
  'page.roof-pitch-2-12.title': 'Pendiente de techo 2/12 en grados: 9.46° | Maestro Calc',
  'page.roof-pitch-2-12.description':
    'Una pendiente de techo 2/12 mide 9.46 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-2-12.heading': 'Una pendiente de techo 2/12 mide 9.46 grados',
  'page.roof-pitch-2-12.label': 'Pendiente 2/12',
  'page.roof-pitch-2-12.intro':
    'Un techo 2/12 sube 2 in por cada 12 in de recorrido, una inclinación de 16.7%. Es la pendiente más baja con la que el IRC permite tejas asfálticas, y solo sobre dos capas de fieltro.',
  'page.roof-pitch-2-12.slope':
    'Un techo 2/12 es casi plano: baja apenas 2 in por pie, 2 ft en un recorrido de 12 ft, así que el agua lo deja despacio. Por eso el IRC pide dos capas de fieltro bajo las tejas asfálticas con esta pendiente y, de las seis cubiertas de la revisión de abajo, solo permite esas y el rollo con superficie mineral. Su cabio apenas es más largo que su recorrido, cerca de 1.4% más.',
  'page.roof-pitch-3-12.title': 'Pendiente de techo 3/12 en grados: 14.04° | Maestro Calc',
  'page.roof-pitch-3-12.description':
    'Una pendiente de techo 3/12 mide 14.04 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-3-12.heading': 'Una pendiente de techo 3/12 mide 14.04 grados',
  'page.roof-pitch-3-12.label': 'Pendiente 3/12',
  'page.roof-pitch-3-12.intro':
    'Un techo 3/12 sube 3 in por cada 12 in de recorrido, una inclinación de 25%. Es una pendiente baja: según el IRC, las tejas asfálticas y la teja necesitan aquí dos capas de fieltro, y la pizarra no se permite.',
  'page.roof-pitch-3-12.slope':
    'Con 3/12 el techo baja 3 in por pie de recorrido, 3 ft en un recorrido de 12 ft. Es la pendiente más baja con la que el IRC permite las tejas de metal y las tejas o tablillas de madera, mientras que las tejas asfálticas y la teja aún necesitan dos capas de fieltro y la pizarra aún pide 4/12. Cada pie de recorrido lleva cerca de 1.031 ft de cabio, así que la superficie del techo es cerca de 3.1% mayor que su planta.',
  'page.roof-pitch-4-12.title': 'Pendiente de techo 4/12 en grados: 18.43° | Maestro Calc',
  'page.roof-pitch-4-12.description':
    'Una pendiente de techo 4/12 mide 18.43 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-4-12.heading': 'Una pendiente de techo 4/12 mide 18.43 grados',
  'page.roof-pitch-4-12.label': 'Pendiente 4/12',
  'page.roof-pitch-4-12.intro':
    'Un techo 4/12 sube 4 in por cada 12 in de recorrido, una inclinación de 33.3%. Es la pendiente más baja con la que el IRC deja poner tejas asfálticas y teja sobre una sola capa de fieltro, y el mínimo para la pizarra.',
  'page.roof-pitch-4-12.slope':
    '4/12 es un umbral por partida doble. Es el techo más empinado que la OSHA todavía considera de poca pendiente, así que aún valen las líneas de advertencia y el monitor de seguridad de 1926.501(b)(10), y es la pendiente con la que el IRC deja de pedir una segunda capa de fieltro bajo las tejas asfálticas y la teja y permite por primera vez la pizarra. En un recorrido de 12 ft el techo sube 4 ft, y el cabio es cerca de 5.4% más largo que su recorrido.',
  'page.roof-pitch-5-12.title': 'Pendiente de techo 5/12 en grados: 22.62° | Maestro Calc',
  'page.roof-pitch-5-12.description':
    'Una pendiente de techo 5/12 mide 22.62 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-5-12.heading': 'Una pendiente de techo 5/12 mide 22.62 grados',
  'page.roof-pitch-5-12.label': 'Pendiente 5/12',
  'page.roof-pitch-5-12.intro':
    'Un techo 5/12 sube 5 in por cada 12 in de recorrido, una inclinación de 41.7%, suficiente para todas las cubiertas de la revisión del IRC de abajo con una sola capa de fieltro.',
  'page.roof-pitch-5-12.slope':
    '5/12 es la primera pendiente entera que la OSHA llama techo empinado, así que las líneas de advertencia y los monitores de seguridad de un techo de poca pendiente ya no cuentan como protección contra caídas. Cumple el mínimo del IRC de todas las cubiertas de la revisión de abajo con una sola capa de fieltro, y forma un triángulo 5-12-13: 13 ft de cabio por cada 12 ft de recorrido, exactamente 1/12 más, sin alero.',
  'page.roof-pitch-6-12.title': 'Pendiente de techo 6/12 en grados: 26.57° | Maestro Calc',
  'page.roof-pitch-6-12.description':
    'Una pendiente de techo 6/12 mide 26.57 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-6-12.heading': 'Una pendiente de techo 6/12 mide 26.57 grados',
  'page.roof-pitch-6-12.label': 'Pendiente 6/12',
  'page.roof-pitch-6-12.intro':
    'Un techo 6/12 sube 6 in por cada 12 in de recorrido, una inclinación de 50%: medio pie de subida por cada pie de recorrido.',
  'page.roof-pitch-6-12.slope':
    'Un techo 6/12 sube 6 ft en un recorrido de 12 ft, así que un hastial de 24 ft de ancho mide 6 ft de alto en la cumbrera sobre la solera de los muros. Todas las cubiertas de la revisión del IRC de abajo cumplen su mínimo con una sola capa de fieltro. Su multiplicador de cabio de 1.118 significa que la superficie del techo es cerca de 11.8% mayor que la planta que cubre, la cifra que debes sumar antes del desperdicio al pedir tejas.',
  'page.roof-pitch-7-12.title': 'Pendiente de techo 7/12 en grados: 30.26° | Maestro Calc',
  'page.roof-pitch-7-12.description':
    'Una pendiente de techo 7/12 mide 30.26 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-7-12.heading': 'Una pendiente de techo 7/12 mide 30.26 grados',
  'page.roof-pitch-7-12.label': 'Pendiente 7/12',
  'page.roof-pitch-7-12.intro':
    'Un techo 7/12 sube 7 in por cada 12 in de recorrido, una inclinación de 58.3%.',
  'page.roof-pitch-7-12.slope':
    'Con 7/12 el techo pasa apenas de 30 grados: un hastial de 24 ft de ancho sube 7 ft en la cumbrera, y cada cabio es cerca de 15.8% más largo que su recorrido. La OSHA lo considera un techo empinado, como toda pendiente de más de 4/12. La superficie del techo sobre una planta de 1,000 sq ft es de unos 1,158 sq ft, casi 16% más tejas de lo que sugiere solo el plano del piso.',
  'page.roof-pitch-7-5-12.title': 'Pendiente de techo 7.5/12 en grados: 32.01° | Maestro Calc',
  'page.roof-pitch-7-5-12.description':
    'Una pendiente de techo 7.5/12 mide 32.01 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-7-5-12.heading': 'Una pendiente de techo 7.5/12 mide 32.01 grados',
  'page.roof-pitch-7-5-12.label': 'Pendiente 7.5/12',
  'page.roof-pitch-7-5-12.intro':
    'Un techo 7.5/12, que también se escribe 7 1/2 en 12, sube 7 1/2 in por cada 12 in de recorrido, una inclinación de 62.5%.',
  'page.roof-pitch-7-5-12.slope':
    'Una pendiente 7.5/12 queda a mitad de camino entre 7/12 y 8/12 en subida, pero no en ángulo: mide 32.01 grados, 1.75 grados más que una 7/12 y 1.68 menos que una 8/12, porque el ángulo crece más despacio que la subida. Su multiplicador de cabio es de cerca de 1.179, así que un recorrido de 12 ft lleva unos 14.15 ft de cabio antes del alero.',
  'page.roof-pitch-8-12.title': 'Pendiente de techo 8/12 en grados: 33.69° | Maestro Calc',
  'page.roof-pitch-8-12.description':
    'Una pendiente de techo 8/12 mide 33.69 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-8-12.heading': 'Una pendiente de techo 8/12 mide 33.69 grados',
  'page.roof-pitch-8-12.label': 'Pendiente 8/12',
  'page.roof-pitch-8-12.intro':
    'Un techo 8/12 sube 8 in por cada 12 in de recorrido, una inclinación de 66.7%: dos tercios de pie de subida por cada pie de recorrido.',
  'page.roof-pitch-8-12.slope':
    'Un techo 8/12 mide cerca de 34 grados. Un hastial de 24 ft de ancho sube 8 ft en la cumbrera, altura suficiente para estar de pie por el centro del ático, y la superficie de su techo es cerca de 20.2% mayor que su planta, un multiplicador de 1.202. En un recorrido de 16 ft el cabio mide unos 19.23 ft antes del alero.',
  'page.roof-pitch-9-12.title': 'Pendiente de techo 9/12 en grados: 36.87° | Maestro Calc',
  'page.roof-pitch-9-12.description':
    'Una pendiente de techo 9/12 mide 36.87 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-9-12.heading': 'Una pendiente de techo 9/12 mide 36.87 grados',
  'page.roof-pitch-9-12.label': 'Pendiente 9/12',
  'page.roof-pitch-9-12.intro':
    'Un techo 9/12 sube 9 in por cada 12 in de recorrido, una inclinación de 75%: tres cuartos de pie de subida por cada pie de recorrido.',
  'page.roof-pitch-9-12.slope':
    'Un techo 9/12 forma un triángulo 3-4-5: 9 in de subida sobre 12 in de recorrido dan 15 in de cabio, así que su multiplicador es exactamente 1.25 y su ángulo es de 36.87 grados. La superficie del techo sobre una planta de 1,000 sq ft es exactamente de 1,250 sq ft, 12.5 cuadrados antes del desperdicio, y un recorrido de 12 ft lleva un cabio de 15 ft.',
  'page.roof-pitch-10-12.title': 'Pendiente de techo 10/12 en grados: 39.81° | Maestro Calc',
  'page.roof-pitch-10-12.description':
    'Una pendiente de techo 10/12 mide 39.81 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-10-12.heading': 'Una pendiente de techo 10/12 mide 39.81 grados',
  'page.roof-pitch-10-12.label': 'Pendiente 10/12',
  'page.roof-pitch-10-12.intro':
    'Un techo 10/12 sube 10 in por cada 12 in de recorrido, una inclinación de 83.3%.',
  'page.roof-pitch-10-12.slope':
    'Un techo 10/12 queda justo por debajo de 40 grados. Cada pie de recorrido lleva cerca de 1.302 ft de cabio, así que la superficie del techo es cerca de 30.2% mayor que su planta, y un hastial de 24 ft de ancho sube 10 ft en la cumbrera. En un recorrido de 16 ft el cabio mide unos 20.83 ft antes del alero, un largo que conviene comparar con la madera que puedes comprar.',
  'page.roof-pitch-11-12.title': 'Pendiente de techo 11/12 en grados: 42.51° | Maestro Calc',
  'page.roof-pitch-11-12.description':
    'Una pendiente de techo 11/12 mide 42.51 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-11-12.heading': 'Una pendiente de techo 11/12 mide 42.51 grados',
  'page.roof-pitch-11-12.label': 'Pendiente 11/12',
  'page.roof-pitch-11-12.intro':
    'Un techo 11/12 sube 11 in por cada 12 in de recorrido, una inclinación de 91.7%, justo por debajo de los 45° de una 12/12.',
  'page.roof-pitch-11-12.slope':
    'Un techo 11/12 mide 42.51 grados, 2.49 grados menos que una 12/12. Su multiplicador es de cerca de 1.357, así que la superficie del techo es cerca de 35.7% mayor que su planta, y un hastial de 24 ft de ancho sube 11 ft en la cumbrera. En un recorrido de 16 ft el cabio mide unos 21.71 ft antes del alero.',
  'page.roof-pitch-12-12.title': 'Pendiente de techo 12/12 en grados: 45.00° | Maestro Calc',
  'page.roof-pitch-12-12.description':
    'Una pendiente de techo 12/12 mide 45.00 grados. Su multiplicador de cabio y el largo del cabio para 8 a 16 ft de recorrido, en pies y metros. Gratis.',
  'page.roof-pitch-12-12.heading': 'Una pendiente de techo 12/12 mide 45.00 grados',
  'page.roof-pitch-12-12.label': 'Pendiente 12/12',
  'page.roof-pitch-12-12.intro':
    'Un techo 12/12 sube lo mismo que recorre, una inclinación de 100% y un ángulo de exactamente 45°.',
  'page.roof-pitch-12-12.slope':
    'Un techo 12/12 sube 1 ft por cada pie de recorrido, así que su ángulo es de exactamente 45 grados y su multiplicador de cabio es la raíz cuadrada de 2, cerca de 1.414: un recorrido de 12 ft lleva un cabio de 16.97 ft, y la superficie del techo es cerca de 41.4% mayor que su planta. Un hastial de 24 ft de ancho sube 12 ft en la cumbrera, tan alto como la mitad de su ancho.',
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
  'page.square-feet-12x12.heading': 'Un cuarto de 12x12 tiene 144 pies cuadrados',
  'page.square-feet-12x12.label': '12x12 pies',
  'page.square-feet-12x12.intro':
    'Un cuarto de 12 por 12 ft es un dormitorio estándar, y una medida común para una terraza o una losa de patio. Sus 144 pies cuadrados son 16 yardas cuadradas, la unidad en la que a menudo se cotiza la alfombra, o 13.38 metros cuadrados, y un rollo de alfombra de 12 pies de ancho cubre el piso en una sola pieza, sin uniones.',
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
  'page.square-feet-in-an-acre.title': 'Un acre tiene 43,560 pies cuadrados | Maestro Calc',
  'page.square-feet-in-an-acre.description':
    '¿Cuántos pies cuadrados tiene un acre? 43,560 según el Handbook 44 del NIST: 4,840 yardas cuadradas o 4,046.86 m², un cuadrado de 208.71 pies y tamaños de lote.',
  'page.square-feet-in-an-acre.heading': 'Un acre tiene 43,560 pies cuadrados',
  'page.square-feet-in-an-acre.label': '1 acre',
  'page.square-feet-in-an-acre.intro':
    'Un acre tiene 43,560 pies cuadrados: una franja de una cadena de ancho y un furlong de largo, 66 por 660 pies, la forma con la que se midió la unidad en su origen. En el sistema métrico son 4,046.86 metros cuadrados, unas cuatro décimas de hectárea.',
  'page.square-feet-in-an-acre.shape1':
    'Un acre no tiene una forma fija. La ley solo fija su área, así que un lote de un acre puede ser largo y angosto, casi cuadrado o de cualquier contorno, y la escritura o el plano dan su superficie, no sus lados. La tabla de arriba lista rectángulos de exactamente 43,560 pies cuadrados cada uno: 66 por 660 pies es el acre clásico del agrimensor, una cadena por un furlong, y 198 por 220 pies es lo más cercano a un cuadrado que permiten los pies enteros. Un acre perfectamente cuadrado mide 208.71 pies por lado, unos 63.61 metros.',
  'page.square-feet-in-an-acre.shape2':
    'Como referencia, una cancha de fútbol americano mide 360 por 160 pies de fondo a fondo de las zonas de anotación, 57,600 pies cuadrados, así que un acre cubre unas tres cuartas partes de ella. Una sección del catastro público de Estados Unidos es una milla cuadrada de 640 acres. El contorno cambia mucho el borde: rodear un acre de 66 por 660 pies son 1,452 pies, más de un cuarto de milla, y rodear el acre cuadrado son 834.84 pies, el mismo terreno con mucha menos cerca.',
  'page.square-feet-in-a-half-acre.title': 'Medio acre tiene 21,780 pies cuadrados | Maestro Calc',
  'page.square-feet-in-a-half-acre.description':
    '¿Cuántos pies cuadrados tiene medio acre? 21,780 (2,420 yardas cuadradas, 2,023.43 m²): un cuadrado de 147.58 pies, medidas de lotes y la tierra para cubrirlo.',
  'page.square-feet-in-a-half-acre.heading': 'Medio acre tiene 21,780 pies cuadrados',
  'page.square-feet-in-a-half-acre.label': '1/2 acre',
  'page.square-feet-in-a-half-acre.intro':
    'Medio acre tiene 21,780 pies cuadrados: 2,420 yardas cuadradas o 2,023.43 metros cuadrados. Es una cadena por medio furlong, 66 por 330 pies, o cualquier otro contorno con la misma área.',
  'page.square-feet-in-a-half-acre.shape1':
    'Los rectángulos de la tabla tienen exactamente 21,780 pies cuadrados cada uno. 132 por 165 pies son dos cadenas por dos y media, y 121 por 180 pies deja un frente de 121 pies hacia la calle con un fondo de 180 pies. Medio acre cuadrado mide 147.58 pies por lado, algo más del 70% del lado de un acre cuadrado y no la mitad: dividir un área entre dos divide cada lado entre la raíz cuadrada de 2, unos 1.414, por eso el lote parece más grande que la mitad cuando lo recorres.',
  'page.square-feet-in-a-half-acre.shape2':
    'Esa regla importa cuando cercas o bordeas el lote. El perímetro de medio acre cuadrado es de 590.32 pies, y una franja de 66 por 330 pies con la misma área necesita 792 pies de cerca. Dos lotes de medio acre forman un acre. Si la casa y la entrada ocupan juntas 3,000 pies cuadrados, quedan unos 18,780 pies cuadrados para sembrar, poner pasto en rollo o plantar, y esa es la cifra que conviene dar al jardinero o al vivero, no los 21,780 completos.',
  'page.square-feet-in-a-quarter-acre.title':
    'Un cuarto de acre: 10,890 pies cuadrados | Maestro Calc',
  'page.square-feet-in-a-quarter-acre.description':
    '¿Cuántos pies cuadrados tiene un cuarto de acre? 10,890 (1,210 yardas cuadradas, 1,011.71 m²): un cuadrado de 104.36 pies, medidas de lotes y la tierra.',
  'page.square-feet-in-a-quarter-acre.heading': 'Un cuarto de acre tiene 10,890 pies cuadrados',
  'page.square-feet-in-a-quarter-acre.label': '1/4 de acre',
  'page.square-feet-in-a-quarter-acre.intro':
    'Un cuarto de acre tiene 10,890 pies cuadrados: 1,210 yardas cuadradas o 1,011.71 metros cuadrados. Una cadena por un cuarto de furlong, 66 por 165 pies, es el contorno clásico, y es una superficie que los anuncios inmobiliarios citan a menudo para un lote de casa en los suburbios.',
  'page.square-feet-in-a-quarter-acre.shape1':
    'Los rectángulos de la tabla tienen exactamente 10,890 pies cuadrados cada uno. Un lote de 75 por 145.2 pies da un frente de 75 pies, mientras que 90 por 121 pies y 99 por 110 pies se acercan más a un cuadrado. Un cuarto de acre perfectamente cuadrado mide 104.36 pies por lado, justo la mitad del lado de un acre cuadrado: un cuarto del área es la mitad de cada lado, porque los dos lados se reducen por el mismo factor de 2.',
  'page.square-feet-in-a-quarter-acre.shape2':
    'Casi nunca todo un cuarto de acre es césped. Una casa de 2,000 pies cuadrados de planta, una entrada de 20 por 24 pies (480 pies cuadrados) y un patio de 12 por 16 pies (192 pies cuadrados) dejan 8,218 pies cuadrados, unas tres cuartas partes del lote, para sembrar o poner pasto en rollo. Mide lo que queda en vez de pedir para todo el lote: las cifras de tierra y mulch de abajo cubren los 10,890 pies cuadrados completos, así que ajústalas a la parte que de verdad vas a plantar.',
  'page.contact.title': 'Contacto | Maestro Calc',
  'page.contact.description':
    'Escribe a Maestro Calc a contacto@maestrocalc.com. ¿Encontraste un error en un cálculo o en una página? Cuéntanos y lo revisaremos.',
  'page.concrete.title': 'Calculadora de concreto en yardas y bolsas | Maestro Calc',
  'page.concrete.description':
    '¿Cuántas bolsas de concreto o yardas cúbicas necesitas? Calcula una losa, zapata, columna o escalones, con bolsas de 40, 60 u 80 lb. Gratis, en pies o metros.',
  'page.rectangle-area.title': 'Calculadora de pies cuadrados para un cuarto | Maestro Calc',
  'page.rectangle-area.description':
    'Calculadora de pies cuadrados gratis: multiplica el largo por el ancho de un cuarto, piso o pared, en pies y pulgadas o metros, con yardas y metros cuadrados.',
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
  'page.divide-29-1-4-in-by-2.intro':
    'Dividir 29 1/4 in entre 2 da el centro de una tabla o de un vano de ese ancho, para una marca, una bisagra o un accesorio.',
  'page.divide-23-5-8-in-by-2.title': 'Mitad de 23 5/8 in en la cinta: 11 13/16 in | Maestro Calc',
  'page.divide-23-5-8-in-by-2.description':
    'La mitad de 23 5/8 in, o 23 5/8 in entre 2, da 11 13/16 in en la cinta métrica (11.81 in), redondeado al 1/16 in. También entre 3 y entre 4.',
  'page.divide-23-5-8-in-by-2.heading': '¿Cuál es la mitad de 23 5/8 in (entre 2) en la cinta?',
  'page.divide-23-5-8-in-by-2.label': '23 5/8 in ÷ 2',
  'page.divide-23-5-8-in-by-2.intro':
    'La mitad de 23 5/8 in es la marca del centro de un estante, una puerta de gabinete o un marco de ese ancho.',
  'page.divide-35-5-in-by-2.title': '35.5 pulgadas entre 2: 17 3/4 in | Maestro Calc',
  'page.divide-35-5-in-by-2.description':
    '35.5 pulgadas entre 2 da 17 3/4 in en la cinta métrica (17.75 in, 1 ft 5 3/4 in). También 35.5 in entre 3 y entre 4, redondeado al 1/16 in.',
  'page.divide-35-5-in-by-2.heading': '¿Cuánto es 35.5 pulgadas entre 2?',
  'page.divide-35-5-in-by-2.label': '35.5 in ÷ 2',
  'page.divide-35-5-in-by-2.intro':
    '35.5 in es una medida en pulgadas con decimales, como la dan un plano o una cinta digital; dividirla entre 2 da el centro de una pieza de ese largo.',
  'page.divide-22-in-by-10.title': '22 pulgadas entre 10: 2 3/16 in | Maestro Calc',
  'page.divide-22-in-by-10.description':
    '22 pulgadas entre 10 da 2.20 in, o 2 3/16 in en la cinta métrica redondeado al 1/16 in. También 22 in entre 2, 3 y 4.',
  'page.divide-22-in-by-10.heading': '¿Cuánto es 22 pulgadas entre 10?',
  'page.divide-22-in-by-10.label': '22 in ÷ 10',
  'page.divide-22-in-by-10.intro':
    'Dividir 22 in en 10 partes iguales es un trabajo de trazo: repartir tablillas, barrotes o perforaciones a la misma distancia a lo largo de un tramo.',
  'page.divide-9-ft-6-in-by-2.title': '9 pies 6 pulgadas entre 2: 4 ft 9 in | Maestro Calc',
  'page.divide-9-ft-6-in-by-2.description':
    'La mitad de 9 pies 6 pulgadas: 9 ft 6 in entre 2 da 4 ft 9 in, o 57 in en la cinta métrica (57.00 in, 1.448 m). También entre 3 y entre 4.',
  'page.divide-9-ft-6-in-by-2.heading': '¿Cuánto es 9 pies 6 pulgadas entre 2?',
  'page.divide-9-ft-6-in-by-2.label': '9 ft 6 in ÷ 2',
  'page.divide-9-ft-6-in-by-2.intro':
    'La mitad de 9 ft 6 in da el centro de una pared, una viga o un cuarto de ese largo, donde va una lámpara, una rejilla o una línea de centro.',
  'page.divide-3-ft-9-in-by-2.title': '3 pies 9 pulgadas entre 2: 1 ft 10 1/2 in | Maestro Calc',
  'page.divide-3-ft-9-in-by-2.description':
    'La mitad de 3 pies 9 pulgadas: 3 ft 9 in entre 2 da 1 ft 10 1/2 in, o 22 1/2 in en la cinta métrica (22.50 in, 0.572 m). También entre 3 y entre 4.',
  'page.divide-3-ft-9-in-by-2.heading': '¿Cuánto es 3 pies 9 pulgadas entre 2?',
  'page.divide-3-ft-9-in-by-2.label': '3 ft 9 in ÷ 2',
  'page.divide-3-ft-9-in-by-2.intro':
    'La mitad de 3 ft 9 in es el centro de una puerta, una ventana o una fila de gabinetes de ese ancho.',
  'page.decimal-feet-chart.title': 'Tabla de pies decimales a pies y pulgadas | Maestro Calc',
  'page.decimal-feet-chart.description':
    'Tabla de pies decimales a pies y pulgadas: cada medida de 0.10 a 0.99 ft y otras comunes como 11.65 ft, al 1/16 de pulgada, y de pulgadas a pies decimales.',
  'page.decimal-feet-chart.heading':
    'Tabla de pies decimales a pies y pulgadas, al 1/16 de pulgada',
  'page.decimal-feet-chart.label': 'Tabla de pies decimales',
  'page.decimal-feet-chart.intro':
    '11.65 ft son 11 ft 7 13/16 in, y 0.50 ft son 6 in. Para pasar pies decimales a pies y pulgadas, deja los pies enteros y multiplica la parte decimal por 12 para las pulgadas: 0.65 × 12 = 7.8 in, que en la cinta son 7 13/16 in. Busca tu decimal en la tabla de abajo, calculada con la calculadora de pies y pulgadas.',
  'page.decimal-feet-chart.note':
    'Las pulgadas son los pies decimales × 12, exactas. Los pies y pulgadas se redondean al 1/16 de pulgada más cercano y las pulgadas a dos decimales. Cada medida de un pie o más abre la calculadora con ella ya escrita.',
  'page.decimal-feet-chart.table': 'Pies decimales a pies y pulgadas',
  'page.decimal-feet-chart.source': 'Factores de conversión exactos',
  'page.decimal-feet-chart.basis': 'Los factores y el redondeo',
  'page.decimal-feet-chart.decimal': 'Pies decimales',
  'page.decimal-feet-chart.inches': 'Pulgadas',
  'page.decimal-feet-chart.foot': 'Un pie',
  'page.decimal-feet-chart.inch': 'Una pulgada',
  'page.decimal-feet-chart.rounding': 'Pies y pulgadas redondeados',
  'page.decimal-feet-chart.sixteenth': 'al 1/16 de pulgada más cercano',
  'page.decimal-feet-chart.reverse': 'Pulgadas a pies decimales',
  'page.decimal-feet-chart.reverseLead':
    'Cada pulgada entera como decimal de un pie: las pulgadas ÷ 12, con cuatro decimales.',
  'page.square-feet-to-square-meters-chart.title':
    'Tabla de pies cuadrados a metros cuadrados | Maestro Calc',
  'page.square-feet-to-square-meters-chart.description':
    'Tabla de pies cuadrados a metros cuadrados: áreas comunes de 10 a 2,000 pies cuadrados en m², como 188 ft² = 17.47 m², y de metros cuadrados a pies cuadrados.',
  'page.square-feet-to-square-meters-chart.heading':
    'Tabla de pies cuadrados a metros cuadrados, de 10 a 2,000 ft²',
  'page.square-feet-to-square-meters-chart.label': 'Tabla de ft² a m²',
  'page.square-feet-to-square-meters-chart.intro':
    'Una alfombra de 188 ft² mide 17.47 m². Para pasar pies cuadrados a metros cuadrados, multiplica por 0.09290304, el número exacto de metros cuadrados que tiene un pie cuadrado (un pie mide exactamente 0.3048 m): 188 × 0.09290304 = 17.4658 m². Busca tu área en la tabla de abajo, calculada con la calculadora de pies cuadrados, y debajo los metros cuadrados pasados a pies cuadrados.',
  'page.square-feet-to-square-meters-chart.note':
    'Los metros cuadrados son los pies cuadrados × 0.09290304, exactos, redondeados a dos decimales. Para volver, divide los metros cuadrados entre 0.09290304. Abre la calculadora para sacar cualquier otro cuarto con su largo y su ancho.',
  'page.square-feet-to-square-meters-chart.table': 'Pies cuadrados a metros cuadrados',
  'page.square-feet-to-square-meters-chart.source': 'Factores de conversión exactos',
  'page.square-feet-to-square-meters-chart.basis': 'Los factores y el redondeo',
  'page.square-feet-to-square-meters-chart.squareFeet': 'Pies cuadrados',
  'page.square-feet-to-square-meters-chart.squareMeters': 'Metros cuadrados',
  'page.square-feet-to-square-meters-chart.foot': 'Un pie',
  'page.square-feet-to-square-meters-chart.squareFoot': 'Un pie cuadrado',
  'page.square-feet-to-square-meters-chart.squareMeter': 'Un metro cuadrado, con cuatro decimales',
  'page.square-feet-to-square-meters-chart.rounding': 'Áreas redondeadas a',
  'page.square-feet-to-square-meters-chart.places': 'dos decimales',
  'page.square-feet-to-square-meters-chart.reverse': 'Metros cuadrados a pies cuadrados',
  'page.square-feet-to-square-meters-chart.reverseLead':
    'Cada área en metros cuadrados pasada a pies cuadrados: los metros cuadrados ÷ 0.09290304, con dos decimales.',
  'page.mulch.title': 'Calculadora de mulch en yardas y bolsas | Maestro Calc',
  'page.mulch.description':
    'Calcula cuánto mulch lleva un área de jardín en yardas cúbicas y bolsas de 1.5, 2 o 3 cu ft, con el costo en bolsas y a granel. Gratis y al instante.',
  'page.topsoil.title': 'Calculadora de tierra para jardín en yardas | Maestro Calc',
  'page.topsoil.description':
    'Calcula cuánta tierra lleva un césped, una jardinera o un relleno en yardas cúbicas y bolsas, con extra por asentamiento y el costo en bolsas y a granel.',
  'page.paint.title': 'Calculadora de pintura: ¿cuántos galones? | Maestro Calc',
  'page.paint.description':
    '¿Cuántos galones de pintura necesitas? Calcula las paredes de un cuarto, sin puertas ni ventanas, y cuánto cubre un galón: unos 350 pies cuadrados por mano.',
  'page.drywall.title': 'Calculadora de drywall: hojas y compuesto | Maestro Calc',
  'page.drywall.description':
    'Calcula cuántas hojas de drywall lleva un cuarto, paredes y techo, sin puertas ni ventanas, con el compuesto, la cinta y el costo. Gratis y al instante.',
  'page.roof-pitch.title': 'Calculadora de pendiente de techo en grados | Maestro Calc',
  'page.roof-pitch.description':
    'Ingresa la subida y el recorrido, como 6 en 12, y obtén el ángulo en grados y el largo del cabio, con el mínimo del IRC para tejas o metal. Gratis.',
  'page.roofing.title': 'Calculadora de techo: cuadrados y tejas | Maestro Calc',
  'page.roofing.description':
    '¿Cuántos paquetes de tejas necesitas? Calcula el área del techo en cuadrados según su planta y pendiente, y los rollos de fieltro, con las reglas del IRC.',
  'page.feet-inches.title': 'Calculadora de pies y pulgadas con decimales | Maestro Calc',
  'page.feet-inches.description':
    'Convierte pies decimales a pies y pulgadas al 1/16, como 11.65 ft = 11 ft 7 13/16 in. También suma, resta, multiplica o divide medidas de la cinta. Gratis.',
  'page.notFound.heading': 'Página no encontrada',
  'page.notFound.body': 'La página que buscas no existe o cambió de lugar.',
  'page.notFound.homeLink': 'Ir a la página de inicio',
  'site.job.question.sources': 'Fuentes',
  'site.job.question.more': 'Consulta también',
  'site.job.question.unitSource': 'Definiciones de las unidades',
  'site.job.question.bagSource': 'Rendimiento de las bolsas',
  'site.job.question.readyMixSource': 'Precio del concreto premezclado por yarda cúbica',
  'site.job.question.installedSource': 'Precio instalado por pie cuadrado',
  'site.job.question.thicknessCost.heading': 'Concreto por pie cuadrado en cada espesor',
  'site.job.question.thicknessCost.lead':
    'Solo el concreto premezclado, con el 10% extra, a $160.18 y $201.90 por yarda cúbica. El precio instalado le suma la base, el acero, las cimbras, la mano de obra y el acabado:',
  'site.job.question.slabCost.heading': 'Concreto premezclado para una losa de 30 × 30 ft',
  'site.job.question.slabCost.lead':
    'Una losa de 30 por 30 ft tiene 900 pies cuadrados, la medida que más se cotiza; cada pulgada de espesor suma unas 3 yardas cúbicas y de $489 a $617 de concreto:',
  'site.job.question.feetToYards.heading': 'De pies cúbicos a yardas cúbicas',
  'site.job.question.feetToYards.lead':
    'Divide los pies cúbicos entre 27. Los metros cúbicos multiplican los pies cúbicos por 0.028316846592, el valor métrico exacto de un pie cúbico.',
  'site.job.question.yardsToFeet.heading': 'De yardas cúbicas a pies cúbicos',
  'site.job.question.yardsToFeet.lead':
    'Multiplica las yardas cúbicas por 27. Una yarda cúbica es exactamente 0.764554857984 metros cúbicos.',
  'site.job.question.boxGallons.heading': 'Galones en cada cama o jardinera',
  'site.job.question.boxGallons.lead':
    'El volumen de cada medida de la tabla de arriba, en galones líquidos de EE. UU. y en litros, sin nada extra por asentamiento:',
  'site.job.question.feetToGallons.heading': 'De pies cúbicos a galones',
  'site.job.question.feetToGallons.lead':
    'Multiplica los pies cúbicos por 7.48052 (1,728 ÷ 231). Un pie cúbico es exactamente 28.316846592 litros.',
  'site.job.question.gallonsToFeet.heading': 'De galones a pies cúbicos',
  'site.job.question.gallonsToFeet.lead':
    'Divide los galones entre 7.48052, o multiplícalos por 231 y divide entre 1,728. Un galón de EE. UU. es exactamente 3.785411784 litros.',
  'site.job.question.materialTons.heading': 'Toneladas en 1 a 10 yardas cúbicas, por material',
  'site.job.question.materialTons.lead':
    'Toneladas = yardas cúbicas × toneladas por yarda cúbica. Un rango significa que las fuentes dan un peso bajo y uno alto; cada cifra es una tonelada corta de 2,000 lb.',
  'site.job.question.yardsPerTon.heading': 'Yardas cúbicas en una tonelada, por material',
  'site.job.question.yardsPerTon.lead':
    'Yardas cúbicas por tonelada = 1 ÷ toneladas por yarda cúbica, y una yarda cúbica tiene 27 pies cúbicos. Cuanto más pesado el material, menos yardas llena una tonelada.',
  'site.job.question.tonsToYards.heading': 'Yardas cúbicas en 1 a 20 toneladas',
  'site.job.question.tonsToYards.lead':
    'Yardas cúbicas = toneladas ÷ toneladas por yarda cúbica. Lee la columna del material que vas a comprar:',
  'site.job.question.soilTons.heading': 'Toneladas de tierra para cada trabajo de la tabla',
  'site.job.question.soilTons.lead':
    'Las yardas cúbicas de cada medida con el 10% extra por asentamiento de la calculadora de tierra, por 0.80 toneladas por yarda cúbica; una tonelada métrica son unas 2,204.62 lb:',
  'site.job.question.slabWeight.heading': 'Peso de cada losa',
  'site.job.question.slabWeight.lead':
    'El concreto ya colado, antes del 10% extra que pide la calculadora, a 145 a 150 lb por pie cúbico:',
  'site.job.question.loadWeight.heading': 'Peso de 1/2 a 10 yardas cúbicas de concreto',
  'site.job.question.loadWeight.lead':
    'Libras = yardas cúbicas × 27 × 145 a 150; las toneladas dividen las libras entre 2,000 y las toneladas métricas entre unas 2,204.62:',
  'site.job.question.garageSlab.heading': 'Concreto para el piso del garaje',
  'site.job.question.garageSlab.lead':
    'La calculadora de concreto para una losa de cada medida, de 4 y 6 in de espesor, con su 10% extra y bolsas de 80 lb de unos 0.6 pies cúbicos cada una:',
  'site.job.question.col.cubicFeet': 'Pies cúbicos',
  'site.job.question.col.cubicYards': 'Yardas cúbicas',
  'site.job.question.col.cubicMeters': 'Metros cúbicos',
  'site.job.question.col.gallons': 'Galones de EE. UU.',
  'site.job.question.col.liters': 'Litros',
  'site.job.question.col.size': 'Medida',
  'site.job.question.col.material': 'Material',
  'site.job.question.col.tons': 'Toneladas',
  'site.job.question.col.tonnes': 'Toneladas métricas',
  'site.job.question.col.pounds': 'Libras',
  'site.job.question.col.tonsPerYard': 'Toneladas por yarda cúbica',
  'site.job.question.col.yardsPerTon': 'Yardas cúbicas por tonelada',
  'site.job.question.col.feetPerTon': 'Pies cúbicos por tonelada',
  'site.job.question.col.netYards': 'Yardas cúbicas coladas',
  'site.job.question.col.slab4': 'Yardas cúbicas a 4 in',
  'site.job.question.col.bags4': 'Bolsas de 80 lb a 4 in',
  'site.job.question.col.slab6': 'Yardas cúbicas a 6 in',
  'site.job.question.col.thickness': 'Espesor',
  'site.job.question.col.yardsWithExtra': 'Yardas cúbicas con 10% extra',
  'site.job.question.col.yardsPer100': 'Yardas cúbicas por 100 pies²',
  'site.job.question.col.readyMix': 'Concreto premezclado',
  'site.job.question.col.readyMixPerFoot': 'Premezclado por pie²',
  'site.job.cost.lead': 'Precio instalado de una losa de concreto simple',
  'site.job.cost.perFoot': 'por pie cuadrado, instalada',
  'site.job.cost.readyMix':
    'Premezclado por yarda cúbica (promedios de productores, 3.er trimestre de 2026)',
  'site.job.cost.concrete': 'Solo el concreto, losa de 4 in, por pie cuadrado',
  'site.job.cost.twenty': 'Losa de 20 × 20 ft, 4 in, instalada',
  'site.job.cost.col.yards': 'Yardas cúbicas con 10% extra',
  'site.job.cost.col.readyMix': 'Concreto premezclado',
  'site.job.cost.col.installedLow': 'Instalada, rango de This Old House',
  'site.job.cost.col.installedHigh': 'Instalada, rango de Concrete Network',
  'page.concrete-cubic-yard-weight.title':
    'Yarda de concreto: pesa 3,915 a 4,050 lb | Maestro Calc',
  'page.concrete-cubic-yard-weight.description':
    '¿Cuánto pesa una yarda cúbica de concreto? De 3,915 a 4,050 lb, unas 2 toneladas, a 145 a 150 lb por pie cúbico. El peso de cada losa y de 1/2 a 10 yardas.',
  'page.concrete-cubic-yard-weight.heading':
    'Una yarda cúbica de concreto pesa de 3,915 a 4,050 libras',
  'page.concrete-cubic-yard-weight.label': 'Peso de yarda de concreto',
  'page.concrete-cubic-yard-weight.intro':
    'Una yarda cúbica de concreto de peso normal pesa de 3,915 a 4,050 libras, unas 2 toneladas: 27 pies cúbicos a 145 a 150 lb cada uno, los pesos unitarios que publican la FHWA y el WSDOT para el concreto endurecido. El acero de refuerzo suma unas 5 lb más por pie cúbico. La tabla de abajo da el concreto que necesita cada losa común, calculado con la calculadora de concreto, y más abajo sigue el peso de cada losa.',
  'page.concrete-cubic-yard-weight.note':
    'Cada cifra suma un 10% extra por desperdicio, el valor predeterminado de la calculadora de concreto, y redondea a bolsas enteras; los pesos de más abajo son de la losa ya colada, sin ese extra. Cada medida abre la calculadora con sus medidas puestas.',
  'page.concrete-cubic-yard-weight.about': 'Qué hace más pesada o más ligera una yarda de concreto',
  'page.concrete-cubic-yard-weight.p1':
    'El concreto es sobre todo piedra y arena unidas por pasta de cemento, así que su peso sigue al de su agregado. El concreto de peso normal, hecho con grava común o piedra triturada, pesa de 145 a 150 lb por pie cúbico ya endurecido, el rango de esta página. El concreto ligero, hecho con esquisto o arcilla expandida, pesa mucho menos, y el concreto pesado para blindaje contra radiación mucho más, así que ninguno de los dos entra en estas cifras. El concreto fresco todavía tiene toda el agua de la mezcla y pesa un poco más que el mismo concreto después de curar y secar.',
  'page.concrete-cubic-yard-weight.p2':
    'El peso importa cuando lo transportas, lo levantas o construyes encima. Una losa de 14 por 14 ft y 4 in de espesor tiene 2.42 yardas cúbicas coladas y pesa de 9,473 a 9,800 lb, casi cinco toneladas. Diez yardas cúbicas, una carga grande de concreto premezclado, pesan de 19.58 a 20.25 toneladas. La mezcla en bolsa es el mismo material vendido en seco: una bolsa de 80 lb rinde unos 0.6 pies cúbicos, así que una yarda cúbica lleva 45 bolsas, 3,600 lb de mezcla que cargar antes de añadir el agua.',
  'page.concrete-slab-cost.title': 'Losa de concreto: $4 a $10.50 por pie² | Maestro Calc',
  'page.concrete-slab-cost.description':
    '¿Cuánto cuesta una losa de concreto? $4.00 a $10.50 por pie² instalada y $160 a $202 por yarda de premezclado en 2026, con fuentes, de 10x10 a 40x60.',
  'page.concrete-slab-cost.heading':
    'Una losa de concreto cuesta de $4 a $10.50 por pie cuadrado instalada',
  'page.concrete-slab-cost.label': 'Costo de losa de concreto',
  'page.concrete-slab-cost.intro':
    'Una losa de concreto simple cuesta de $4.00 a $10.50 por pie cuadrado instalada en 2026, según las dos guías de costos que cita esta página: de $4 a $8 según This Old House y de $6.50 a $10.50 según Concrete Network. El concreto en sí es la parte menor. El concreto premezclado se vendió en promedio a $160.18 por yarda cúbica en Eagle Materials y a $201.90 en Knife River en el tercer trimestre de 2026, los precios que ambos productores reportaron a la SEC, así que el concreto de una losa de 4 in cuesta de $2.18 a $2.74 por pie cuadrado con 10% extra. La tabla da el precio de siete medidas comunes, desde una base de 10 por 10 ft hasta el piso de un taller de 40 por 60 ft.',
  'page.concrete-slab-cost.note':
    'Las yardas cúbicas suman un 10% extra por desperdicio, el valor predeterminado de la calculadora de concreto. La columna del premezclado las multiplica por $160.18 y $201.90 y redondea a dólares enteros; las columnas de la losa instalada multiplican el área por el rango por pie cuadrado de cada guía, que ya incluye el concreto. Cada medida abre la calculadora, donde puedes escribir el precio por yarda cúbica que te dé tu proveedor.',
  'page.concrete-slab-cost.about': 'Qué mueve el precio de una losa',
  'page.concrete-slab-cost.p1':
    'El precio instalado paga mucho más que el concreto. Concrete Network nombra la nivelación, la sub-base, las cimbras y el acabado, el refuerzo y el precio local del concreto como lo que fija el costo de una losa. Una losa de 4 in lleva 1.36 yardas cúbicas por cada 100 pies cuadrados con el extra, así que a los precios de los productores el concreto es de $2.18 a $2.74 de cada pie cuadrado, y el resto paga la base, el acero, la mano de obra y el acabado. El espesor mueve el concreto en proporción: 6 in lleva la mitad más que 4 in, y 8 in el doble. Un acabado decorativo, un terreno en pendiente o húmedo, o una línea de bombeo larga suben la cifra instalada, así que la cotización de un patio estampado puede quedar muy por encima de estos rangos.',
  'page.concrete-slab-cost.p2':
    'Los precios del premezclado son promedios de todo el concreto que cada productor vendió en el trimestre, en las regiones donde opera: Eagle Materials reportó $160.18 por yarda cúbica para el trimestre que terminó el 30 de septiembre de 2026, y Knife River $201.90 para su tercer trimestre, así que tu precio local puede quedar cerca de cualquiera de los dos o fuera de ambos. Concrete Network señala que algunas cotizaciones de proveedores incluyen cargos por entrega o por carga corta, y esos pesan más en un colado pequeño: un patio de 10 por 10 ft necesita solo 1.36 yardas cúbicas, y un cargo mínimo por una carga parcial puede costar más que el concreto. Para un colado tan pequeño, la calculadora también cuenta las bolsas de 80 lb. Pide el precio por yarda puesto en obra a dos o tres proveedores locales, escríbelo en la calculadora y compara.',
  'page.square-feet-1-car-garage.title':
    'Garaje de 1 auto: 240 a 384 pies cuadrados | Maestro Calc',
  'page.square-feet-1-car-garage.description':
    '¿Cuántos pies cuadrados tiene un garaje de 1 auto? 240 a 12 por 20 ft y hasta 384 a 16 por 24, con el concreto del piso de cada medida a 4 y 6 in.',
  'page.square-feet-1-car-garage.heading':
    'Un garaje de 1 auto tiene unos 240 a 384 pies cuadrados',
  'page.square-feet-1-car-garage.label': 'Garaje de 1 auto',
  'page.square-feet-1-car-garage.intro':
    'Un garaje de un auto tiene unos 240 a 384 pies cuadrados: 240 para un garaje justo de 12 por 20 ft, 336 para uno de 14 por 24 ft y 384 para uno de 16 por 24 ft, que deja espacio a un lado para guardar cosas. La tabla de abajo calcula el área de cinco medidas comunes con la calculadora de pies cuadrados, en pies cuadrados, metros cuadrados y yardas cuadradas.',
  'page.square-feet-1-car-garage.note':
    'El área de un rectángulo es su largo por su ancho, medidos aquí por fuera de las paredes. Una yarda cuadrada tiene 9 pies cuadrados, y un pie cuadrado es exactamente 0.09290304 metros cuadrados. Cada medida abre la calculadora con sus medidas puestas.',
  'page.square-feet-1-car-garage.about': 'Cómo elegir la medida de un garaje de un auto',
  'page.square-feet-1-car-garage.p1':
    'Mide un garaje de dos maneras: por fuera de las paredes para la losa, el techo y el precio, y por dentro para lo que cabe. Las paredes con su estructura y el drywall le quitan varias pulgadas a cada lado, así que un plano de 12 por 20 ft deja un poco menos de 240 pies cuadrados de piso libre. Antes de decidir la medida, mide tu propio vehículo con las puertas abiertas, suma el espacio que quieres para caminar alrededor y suma la profundidad del banco de trabajo, los estantes o las bicicletas que pienses tener junto a las paredes.',
  'page.square-feet-1-car-garage.p2':
    'El área decide la mayor parte de los materiales. La losa del piso es el área por su espesor, y la última tabla de esta página da el concreto de cada medida a 4 y 6 in de espesor. Esa misma área, con su precio por pie cuadrado, es la que permite comparar las cotizaciones de los constructores, y un garaje pegado a la casa también tiene que quedar separado de ella como pide el código residencial, así que revisa las reglas de donde vas a construir. Para comparar, un garaje de dos autos de 20 por 20 ft tiene 400 pies cuadrados, dos tercios más que el sencillo más pequeño.',
  'page.square-feet-2-car-garage.title':
    'Garaje de 2 autos: 400 a 576 pies cuadrados | Maestro Calc',
  'page.square-feet-2-car-garage.description':
    '¿Cuántos pies cuadrados tiene un garaje de 2 autos? 400 a 20 por 20 ft y hasta 576 a 24 por 24, con el concreto del piso de cada medida a 4 y 6 in.',
  'page.square-feet-2-car-garage.heading':
    'Un garaje de 2 autos tiene unos 400 a 576 pies cuadrados',
  'page.square-feet-2-car-garage.label': 'Garaje de 2 autos',
  'page.square-feet-2-car-garage.intro':
    'Un garaje de dos autos tiene unos 400 a 576 pies cuadrados: 400 para un garaje de 20 por 20 ft, 484 para uno de 22 por 22 ft y 576 para uno de 24 por 24 ft, la medida que deja espacio para guardar cosas junto a las paredes. La tabla de abajo calcula el área de cinco medidas comunes con la calculadora de pies cuadrados, en pies cuadrados, metros cuadrados y yardas cuadradas.',
  'page.square-feet-2-car-garage.note':
    'El área de un rectángulo es su largo por su ancho, medidos aquí por fuera de las paredes. Una yarda cuadrada tiene 9 pies cuadrados, y un pie cuadrado es exactamente 0.09290304 metros cuadrados. Cada medida abre la calculadora con sus medidas puestas.',
  'page.square-feet-2-car-garage.about': 'Cómo elegir la medida de un garaje de dos autos',
  'page.square-feet-2-car-garage.p1':
    'Cada pie de más en el ancho o en el fondo suma toda una franja de piso: pasar de 20 por 20 a 24 por 24 ft suma 176 pies cuadrados, un 44% más, y cada pie que le agregas a una pared de 24 ft suma 24 pies cuadrados. Antes de elegir, estaciona los dos vehículos donde irá el garaje, abre las puertas de los dos lados y mide el ancho y el largo que necesitan con espacio para caminar entre ellos; después suma la profundidad del banco de trabajo, los estantes o el congelador junto a la pared del fondo.',
  'page.square-feet-2-car-garage.p2':
    'La losa de un garaje de dos autos es un colado grande: un piso de 24 por 24 ft y 4 in de espesor lleva 7.82 yardas cúbicas de concreto con el 10% extra, un pedido de concreto premezclado más que de bolsas, como muestra la última tabla de esta página para cada medida. El techo cubre el piso más sus aleros, y el hueco de la puerta del garaje, a menudo de 16 ft de ancho para dos autos, decide cómo se arma la pared del frente. Un garaje pegado a la casa tiene que quedar separado de ella como pide el código residencial, así que revisa las reglas de donde vas a construir.',
  'page.cubic-yards-to-tons.title': 'Yardas cúbicas a toneladas: grava 1.29 | Maestro Calc',
  'page.cubic-yards-to-tons.description':
    '¿Cuántas toneladas es una yarda cúbica? Grava suelta 1.29, arena 1.45, tierra 0.80 y concreto 1.96 a 2.03. Toneladas de 1 a 10 yardas de 11 materiales.',
  'page.cubic-yards-to-tons.heading':
    'De yardas cúbicas a toneladas: una yarda de grava suelta son unas 1.29 toneladas',
  'page.cubic-yards-to-tons.label': 'Yardas cúbicas a toneladas',
  'page.cubic-yards-to-tons.intro':
    'Para pasar yardas cúbicas a toneladas, multiplícalas por lo que pesa una yarda cúbica del material. La grava suelta, como la mide el patio de materiales, pesa unas 1.29 toneladas por yarda cúbica, así que 5 yardas cúbicas pesan unas 6.45 toneladas y 10 pesan 12.90; la tabla de abajo lo calcula para 1 a 10 yardas con la calculadora de grava, y una segunda tabla hace lo mismo para la arena, la tierra, el concreto y las astillas de madera.',
  'page.cubic-yards-to-tons.note':
    'Las medidas son de grava suelta sin extra, medida como la vende el patio de materiales, y cada una tiene un número entero de yardas cúbicas; las toneladas métricas son de 1,000 kg. Cada medida abre la calculadora de grava con sus medidas puestas.',
  'page.cubic-yards-to-tons.about': 'Por qué la misma yarda cúbica pesa distintas toneladas',
  'page.cubic-yards-to-tons.p1':
    'Una yarda cúbica es un volumen y una tonelada es un peso, así que no hay una sola conversión entre ellas: el factor es la densidad del material. La piedra es pesada y la madera ligera, por eso una yarda de arena pesa unas 1.45 toneladas y una yarda de astillas de madera secas unas 0.12. La compactación también lo cambia: la misma base de grava pesa unas 1.29 toneladas por yarda suelta y de 1.80 a 1.86 compactada, porque al aplanarla se saca el aire entre las piedras. El agua suma peso, así que la arena y la tierra mojadas pesan más que las cifras secas o sin condición que publican las fuentes.',
  'page.cubic-yards-to-tons.p2':
    'Un proveedor puede cotizar por tonelada o por yarda cúbica. Si mides el trabajo en yardas cúbicas y el precio es por tonelada, multiplica las yardas por el factor del material; al revés, divide las toneladas entre él. Un área de 10 por 20 ft y 4 in de profundidad tiene 2.47 yardas cúbicas: 3.19 toneladas de grava suelta, 3.58 toneladas de arena o 1.98 toneladas de tierra. La tonelada de estas tablas es la tonelada corta de 2,000 lb; una tonelada métrica son 1,000 kg, unas 2,204.62 lb.',
  'page.cubic-yards-in-a-ton-of-gravel.title':
    'Tonelada de grava: 0.70 a 0.78 yardas cúbicas | Maestro Calc',
  'page.cubic-yards-in-a-ton-of-gravel.description':
    '¿Cuántas yardas cúbicas hay en una tonelada de grava? Unas 0.70 a 0.78 suelta, 19 a 21 pies cúbicos, y 0.54 a 0.56 compactada. Yardas de 1 a 20 toneladas.',
  'page.cubic-yards-in-a-ton-of-gravel.heading':
    'Una tonelada de grava son unas 0.70 a 0.78 yardas cúbicas',
  'page.cubic-yards-in-a-ton-of-gravel.label': 'Yardas en tonelada de grava',
  'page.cubic-yards-in-a-ton-of-gravel.intro':
    'Una tonelada de grava llena unas 0.70 a 0.78 yardas cúbicas, o 19 a 21 pies cúbicos, cuando está suelta, como baja del camión: 0.70 para grava de 1/4 a 2 in a 1.42 toneladas por yarda, 0.78 para una base triturada a 1.29. Extendida y compactada, esa misma tonelada llena solo 0.54 a 0.56 yardas cúbicas. La tabla de abajo da las toneladas de grava de bases comunes para cobertizos y patios, calculadas con la calculadora de grava.',
  'page.cubic-yards-in-a-ton-of-gravel.note':
    'Cada cifra de los trabajos es grava compactada con un 5% extra, los valores predeterminados de la calculadora de grava. Las yardas cúbicas que pides son sueltas, como mide el patio lo que vende, así que son más que el espacio que llena la grava. Cada medida abre la calculadora con sus medidas puestas.',
  'page.cubic-yards-in-a-ton-of-gravel.about':
    'Yardas sueltas, yardas compactadas y la tonelada que pagas',
  'page.cubic-yards-in-a-ton-of-gravel.p1':
    'La grava se vende por peso o por volumen suelto, y se reduce al compactarla, así que una tonelada tiene más de una respuesta. Suelta en el camión o en la pila, una tonelada de base triturada llena 0.78 yardas cúbicas; ya extendida y compactada, las piedras se traban entre sí y la misma tonelada llena de 0.54 a 0.56 yardas cúbicas. Por eso la calculadora de grava pide más yardas sueltas de las que ocupa la base colocada: una base de 10 por 10 ft y 4 in de profundidad tiene 1.23 yardas cúbicas compactadas, pero lleva 1.84 yardas sueltas con el 5% extra.',
  'page.cubic-yards-in-a-ton-of-gravel.p2':
    'El tamaño y la forma de la piedra también cuentan. La gravilla redonda y la piedra lavada de un solo tamaño dejan más espacio vacío entre las piezas que una base de granulometría densa cuyos finos llenan los huecos, así que una tonelada de ellas llena un poco más de volumen, mientras que la grava de cantera sin cribar, que trae arena y finos, pesa unas 1.62 toneladas por yarda y llena solo 0.62. Pide al proveedor el peso por yarda cúbica del producto exacto y divide entre él las toneladas que te cotiza.',
  'page.cubic-feet-in-a-cubic-yard.title': 'Una yarda cúbica tiene 27 pies cúbicos | Maestro Calc',
  'page.cubic-feet-in-a-cubic-yard.description':
    '¿Cuántos pies cúbicos tiene una yarda cúbica? 27, porque una yarda mide 3 ft y 3 × 3 × 3 = 27. Tablas de ida y vuelta, en m³ y cinco formas de una yarda.',
  'page.cubic-feet-in-a-cubic-yard.heading': 'Una yarda cúbica tiene 27 pies cúbicos',
  'page.cubic-feet-in-a-cubic-yard.label': 'Pies cúbicos en una yarda',
  'page.cubic-feet-in-a-cubic-yard.intro':
    'Una yarda cúbica tiene 27 pies cúbicos: un cubo de 3 ft de largo, 3 ft de ancho y 3 ft de alto, porque una yarda mide 3 ft y 3 × 3 × 3 = 27. En el sistema métrico son 0.7646 metros cúbicos. Cada medida de la tabla de abajo tiene exactamente una yarda cúbica, desde una cama de 9 por 9 ft llena a 4 in de profundidad hasta una caja de 3 por 4.5 ft llena a 2 ft: 36 bolsas de 0.75 pies cúbicos o 18 bolsas de 1.5.',
  'page.cubic-feet-in-a-cubic-yard.note':
    'Cada medida se llena sin extra, así que el volumen es la yarda cúbica misma, y las bolsas se redondean a bolsas enteras; pide un 10% más de una tierra que se asienta. Cada medida abre la calculadora de tierra con sus medidas puestas.',
  'page.cubic-feet-in-a-cubic-yard.about':
    'Por qué una yarda cúbica tiene 27 pies cúbicos, no 3 ni 9',
  'page.cubic-feet-in-a-cubic-yard.p1':
    'Una yarda mide 3 pies en cada dirección, así que una yarda cúbica es 3 ft × 3 ft × 3 ft = 27 pies cúbicos, mientras que una yarda cuadrada, que no tiene profundidad, es 3 × 3 = 9 pies cuadrados. Las dos se confunden todo el tiempo, y dividir los pies cúbicos entre 9 o entre 3 en vez de 27 pide tres o nueve veces de más. Para sacar las yardas cúbicas de una cama o una losa, multiplica el largo y el ancho en pies por la profundidad en pies (pulgadas ÷ 12) y divide entre 27: 10 por 12 ft a 4 in es 10 × 12 × 0.333 = 40 pies cúbicos, o 1.48 yardas cúbicas.',
  'page.cubic-feet-in-a-cubic-yard.p2':
    'La tierra, el mulch, la grava y el concreto premezclado a granel se venden por yarda cúbica, mientras que las bolsas vienen marcadas en pies cúbicos: 0.75, 1, 1.5, 2 o 3. Una yarda cúbica son 36 bolsas de 0.75 pies cúbicos, 27 de 1, 18 de 1.5, 14 de 2 (13.5 redondeado hacia arriba) y 9 de 3. Para un trabajo grande, compara el precio a granel de una yarda cúbica, con la entrega incluida, con el precio de las bolsas que la forman antes de decidir.',
  'page.cubic-feet-to-gallons.title':
    'Pies cúbicos a galones: 1 pie³ = 7.48 galones | Maestro Calc',
  'page.cubic-feet-to-gallons.description':
    'Un pie cúbico son 7.48 galones de EE. UU. (1,728 ÷ 231 pulgadas cúbicas) o 28.32 litros. Tablas en los dos sentidos y los galones de camas y jardineras comunes.',
  'page.cubic-feet-to-gallons.heading': 'Un pie cúbico son 7.48 galones',
  'page.cubic-feet-to-gallons.label': 'Pies cúbicos a galones',
  'page.cubic-feet-to-gallons.intro':
    'Un pie cúbico tiene 7.48 galones líquidos de EE. UU.: un pie cúbico son 1,728 pulgadas cúbicas y un galón de EE. UU. son exactamente 231, así que 1,728 ÷ 231 = 7.48052. En litros son 28.32. Una cama elevada de 4 por 8 ft llena a 12 in de profundidad tiene 32 pies cúbicos, 239.38 galones de tierra o de agua, y las tablas de abajo dan los galones de cada medida común y convierten en los dos sentidos.',
  'page.cubic-feet-to-gallons.note':
    'Cada medida se llena sin extra por asentamiento, así que el volumen es la caja misma, y las bolsas se redondean a bolsas enteras. Cada medida abre la calculadora de tierra con sus medidas puestas.',
  'page.cubic-feet-to-gallons.about': 'Galones, pies cúbicos y las bolsas de la tienda',
  'page.cubic-feet-to-gallons.p1':
    'El galón líquido de EE. UU. está definido como exactamente 231 pulgadas cúbicas (NIST Handbook 44), así que la conversión es exacta: multiplica los pies cúbicos por 7.48052 para sacar galones, y divide los galones entre 7.48052 para sacar pies cúbicos. El galón imperial del Reino Unido es otra unidad, 4.54609 litros, cerca de un 20% más grande, así que una cifra británica de 6.23 galones por pie cúbico no es un error sino otro galón. Un estanque, un bebedero o un barril de lluvia se calcula igual: largo × ancho × profundidad en pies da los pies cúbicos, y × 7.48 da los galones.',
  'page.cubic-feet-to-gallons.p2':
    'Las bolsas de tierra y de mulch vienen marcadas en pies cúbicos: una bolsa de 0.75 pies cúbicos tiene 5.61 galones, una de 1.5 tiene 11.22 y una de 2 tiene 14.96, así que hacen falta 43 bolsas de 0.75 pies cúbicos para llenar la cama de 4 por 8 ft a 12 in de profundidad (32 ÷ 0.75 = 42.7, redondeado hacia arriba). Al revés, un recipiente marcado en galones tiene sus galones ÷ 7.48 en pies cúbicos: un tambo de 55 galones son 7.35 pies cúbicos, y un bebedero de 100 galones 13.37.',
  'page.cubic-yards-in-a-ton-of-dirt.title':
    'Tonelada de tierra: unas 1.25 yardas cúbicas | Maestro Calc',
  'page.cubic-yards-in-a-ton-of-dirt.description':
    '¿Cuántas yardas cúbicas hay en una tonelada de tierra? Unas 1.25 de tierra para jardín o de relleno a 0.80 toneladas por yarda, 33.75 pies cúbicos.',
  'page.cubic-yards-in-a-ton-of-dirt.heading':
    'Una tonelada de tierra son unas 1.25 yardas cúbicas',
  'page.cubic-yards-in-a-ton-of-dirt.label': 'Yardas en tonelada de tierra',
  'page.cubic-yards-in-a-ton-of-dirt.intro':
    'Una tonelada de tierra para jardín o de relleno son unas 1.25 yardas cúbicas, o 33.75 pies cúbicos, a las 0.80 toneladas por yarda cúbica que publica para las dos la división de minería de Nuevo México. La tierra seca que sigue en el suelo es más densa, unas 1.12 toneladas por yarda según la cifra del USDA, así que una tonelada de ella son solo 0.89 yardas cúbicas. La tabla de abajo da las yardas cúbicas de tierra de camas y áreas comunes, con el 10% por asentamiento de la calculadora de tierra.',
  'page.cubic-yards-in-a-ton-of-dirt.note':
    'Las cifras suman un 10% por asentamiento, el valor predeterminado de la calculadora de tierra, y redondean a bolsas enteras de 0.75 o 1.5 pies cúbicos. Cada medida abre la calculadora con sus medidas puestas.',
  'page.cubic-yards-in-a-ton-of-dirt.about':
    'Por qué una tonelada de tierra llena más de una yarda',
  'page.cubic-yards-in-a-ton-of-dirt.p1':
    'La tierra para jardín pesa menos que la grava o la arena: tiene materia orgánica y aire, así que una yarda cúbica pesa unas 0.80 toneladas, 1,600 lb, frente a unas 1.45 toneladas de la arena. Al revés, una tonelada de tierra suelta llena 1.25 yardas cúbicas, lo bastante para cubrir 100 pies cuadrados a poco más de 4 in de profundidad. La tierra en el suelo está más apretada: el USDA pone la densidad aparente seca de un suelo de textura media cerca de 1.33 gramos por centímetro cúbico, unas 1.12 toneladas por yarda cúbica, y se afloja y se esponja al excavarla y cargarla.',
  'page.cubic-yards-in-a-ton-of-dirt.p2':
    'La humedad mueve cada una de estas cifras. Los pesos de aquí son secos o sin condición, y la tierra mojada pesa más, así que una tonelada entregada después de la lluvia llena menos yardas cúbicas que una tonelada de tierra seca. Si el patio vende la tierra por tonelada, divide las toneladas entre 0.80 para las yardas cúbicas; si la vende por yarda cúbica, multiplica las yardas por 0.80 para el peso que debe cargar tu camioneta o tu remolque. Una cama elevada de 4 por 8 ft y 12 in de profundidad lleva 1.30 yardas cúbicas con el 10% extra, unas 1.04 toneladas.',
  'page.notFound.title': 'Página no encontrada | Maestro Calc',
  'page.notFound.description':
    'La página que buscas no existe o cambió de lugar. Vuelve a la página de inicio de Maestro Calc.',
} as const satisfies CatalogOf<typeof enSite>;
