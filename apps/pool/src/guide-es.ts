import {
  CLOSING_GUIDE,
  OPENING,
  OPENING_GUIDE,
  PUMP_RUN_GUIDE,
  SALT_VS_CHLORINE_GUIDE,
  type GuideStep,
  type StepGuide,
} from './guide.ts';
import { hrefOf, routeOf } from './routes.ts';

/*
 * The Spanish step guides (plans/pool/SPANISH.md, slice 7): the same steps, sources and doses as
 * the English guides of `guide.ts`, in neutral Spanish (tú: Ingresa, Usa, Elige), US units and the
 * product names of the US labels. Each source keeps its name and its address; each dose is the
 * English guide's own figure. `guide-es.test.ts` holds each one to its English twin: the same
 * steps, sources and links, and every figure of its lead, note and steps.
 */

/**
 * A link to the page of route `id` in Spanish: its Spanish twin once it is built, the English page
 * until then, which the label then says.
 */
const linkTo = (id: string, label: string): NonNullable<GuideStep['link']> => {
  const href = hrefOf(id, 'es');
  return { href, label: href === routeOf(href)?.en ? `${label} (en inglés)` : label };
};

const gallons = linkTo('volume', 'Calcula tus galones');

const OPENING_STEPS: readonly GuideStep[] = [
  {
    title: 'Revisa lo que tienes',
    text: 'Antes de quitar la cubierta, revisa el cloro, el producto de choque, el alguicida y los balanceadores que guardaste de la temporada pasada, y tira cualquier producto vencido.',
    sources: ['hayward'],
  },
  {
    title: 'Quita la cubierta',
    text: 'Saca con una bomba el agua acumulada y limpia las hojas primero, para que no caigan dentro. Dobla la cubierta despacio, y luego límpiala y sécala antes de guardarla.',
    sources: ['hayward'],
  },
  {
    title: 'Vuelve a instalar el equipo',
    text: 'Quita los tapones de invierno, vuelve a poner las canastas del skimmer y las boquillas de retorno, y reconecta la bomba y el filtro. Sube el agua al nivel que necesita el skimmer.',
    link: linkTo('fill-time', 'Calcula el tiempo para completar el nivel'),
    sources: ['hayward'],
  },
  {
    title: 'Conoce tus galones',
    text: 'Cada dosis de abajo depende de cuánta agua tiene la piscina. Calcúlala una vez con el largo, el ancho y la profundidad de cada extremo, y guarda el número.',
    link: gallons,
  },
  {
    title: 'Prende la bomba y busca fugas',
    text: 'Prende la circulación, revisa si gotean la bomba, el filtro y las conexiones, y limpia o retrolava el filtro si su presión está alta.',
    sources: ['hayward'],
  },
  {
    title: 'Mide el agua',
    text: 'Mide el cloro libre y el pH con un kit de prueba DPD, y también la alcalinidad total. Para una piscina en casa, los CDC recomiendan cloro libre de al menos 1 ppm, al menos 2 ppm si usas ácido cianúrico o un cloro estabilizado como el dicloro o el tricloro, y un pH de 7.0 a 7.8. La guía de apertura de Hayward busca de 1 a 3 ppm y un pH de 7.2 a 7.8.',
    sources: ['cdc', 'hayward'],
  },
  {
    title: 'Primero pon la alcalinidad en su rango',
    text: `Las instrucciones de Taylor dicen que pongas la alcalinidad total en su rango, de 80 a 120 ppm, antes de ajustar el pH: es el amortiguador que evita que el pH suba y baje. Cada 10 ppm requieren ${OPENING.soda} lb de bicarbonato de sodio por cada 10,000 galones.`,
    link: linkTo('alkalinity', 'Calcula el bicarbonato de sodio'),
    sources: ['taylor'],
  },
  {
    title: 'Luego corrige el pH',
    text: `Para bajarlo, haz la prueba de demanda de ácido de tu kit: cada gota que necesita equivale a ${OPENING.acid} fl oz de ácido muriático al 31.45% por cada 10,000 galones, según la tabla de Taylor. La etiqueta de HASA agrega como máximo un cuarto de galón por cada 20,000 galones en 24 horas, vertido en la parte honda con la bomba funcionando, así que una dosis más grande se agrega en varios días.`,
    link: linkTo('ph', 'Calcula la dosis para el pH'),
    sources: ['taylor', 'hasa'],
  },
  {
    title: 'Sube la sal, si tienes una celda de sal',
    text: `La sal no se evapora, pero la lluvia y el agua nueva que agregas para completar el nivel la diluyen. Mídela y agrega las libras para llegar al nivel que pide tu celda: tres cuartas partes primero y el resto después de un día de circulación. De 3,000 a los 3,200 ppm que el manual de AquaRite de Hayward considera el mejor nivel, 10,000 galones requieren ${OPENING.salt} lb.`,
    link: linkTo('salt', 'Calcula la sal'),
    sources: ['manual'],
  },
  {
    title: 'Haz el tratamiento de choque y luego sube el cloro',
    text: `Haz el tratamiento de choque cuando el agua esté balanceada, al caer el sol, para que la luz del sol no queme el cloro. Desde 0 ppm, 10,000 galones requieren ${OPENING.shock} oz de hipoclorito de calcio (cal-hypo) al 65% para llegar a 10 ppm, el máximo de los 5 a 10 ppm de su etiqueta; vuelve a nadar cuando el cloro libre baje a 4 ppm o menos, el nivel de reingreso de esa etiqueta. Después mantén el cloro libre en tu nivel deseado con el producto que tengas.`,
    link: linkTo('chlorine', 'Calcula el cloro'),
    sources: ['hayward', 'calHypo'],
  },
  {
    title: 'Aspira al día siguiente',
    text: 'Deja la bomba funcionando toda la noche, luego aspira lo que se asentó en el fondo y mide otra vez. Completa el nivel del agua si la limpieza lo bajó.',
    sources: ['hayward'],
  },
  {
    title: 'Sigue midiendo',
    text: 'Los CDC aconsejan medir el cloro y el pH al menos dos veces al día mientras se usa la piscina, y más seguido cuando nada mucha gente.',
    sources: ['cdc'],
  },
];

export const OPENING_GUIDE_ES = {
  path: '/es/como-abrir-tu-piscina',
  kicker: 'Guía · primavera',
  card: {
    title: 'Cómo abrir tu piscina',
    summary: 'Los pasos de primavera en orden, de la cubierta al cloro.',
  },
  title: 'Cómo abrir tu piscina en primavera, paso a paso | Pool Figures',
  description:
    'Abre tu piscina en el orden que te ahorra otra vuelta a la tienda: cubierta, equipo, nivel del agua, sal, pH y cloro, cada dosis a la medida de tu piscina.',
  h1: 'Cómo abrir tu piscina esta primavera',
  lead: `Abre una piscina en este orden: la cubierta y el equipo, el nivel del agua, una prueba, luego la alcalinidad antes del pH, la sal y al final el tratamiento de choque. Para 10,000 galones, cada 10 ppm de alcalinidad requieren ${OPENING.soda} lb de bicarbonato de sodio, cada gota de la prueba de demanda de ácido ${OPENING.acid} fl oz de ácido muriático al 31.45%, y un choque de 0 a 10 ppm ${OPENING.shock} oz de hipoclorito de calcio (cal-hypo) al 65%. Cada dosis de abajo se calcula para tu piscina con su calculadora.`,
  sources: OPENING_GUIDE.sources,
  steps: OPENING_STEPS,
} as const satisfies StepGuide;

const CLOSING_STEPS: readonly GuideStep[] = [
  {
    title: 'Conoce tus galones',
    text: 'El tratamiento de choque y cada balanceador que agregas antes de cerrar dependen de cuánta agua tiene la piscina. Calcúlala una vez con el largo, el ancho y la profundidad de cada extremo.',
    link: gallons,
  },
  {
    title: 'Balancea el agua',
    text: 'Pon el pH entre 7.2 y 7.8, para que el agua no manche, no deje sarro ni críe algas mientras la piscina está cerrada. La tabla da el rango de cada uno de los otros niveles.',
    link: linkTo('chemistry-chart', 'Mira la tabla de química del agua'),
    sources: ['hayward'],
  },
  {
    title: 'Haz el tratamiento de choque',
    text: 'Haz el tratamiento de choque a la piscina y luego deja funcionar el filtro de 24 a 48 horas para limpiar la suciedad.',
    link: linkTo('chlorine', 'Calcula el cloro'),
    sources: ['hayward'],
  },
  {
    title: 'Limpia y aspira',
    text: 'Cepilla, limpia la superficie y aspira bien la piscina. Así la apertura en primavera es más fácil.',
    sources: ['hayward'],
  },
  {
    title: 'Baja el agua',
    text: 'Donde el agua se congela, vacíala hasta debajo del skimmer, porque el agua se expande al congelarse.',
    sources: ['hayward'],
  },
  {
    title: 'Vacía el equipo',
    text: 'Saca el agua del filtro, de la bomba y del calentador. Sopla las tuberías y luego cierra las válvulas para que no les vuelva a entrar agua.',
    sources: ['hayward'],
  },
  {
    title: 'Corta la corriente',
    text: 'Apaga la corriente de cada equipo de la piscina.',
    sources: ['hayward'],
  },
  {
    title: 'Guarda los accesorios',
    text: 'Quita las escaleras, los toboganes y los trampolines, y guárdalos en un lugar seguro.',
    sources: ['hayward'],
  },
  {
    title: 'En un invierno templado, déjala funcionando',
    text: 'Donde el agua no se congela, no la vacíes. Reduce a la mitad el tiempo del filtro, mantén el pH entre 7.2 y 7.8 y el cloro libre entre 1.0 y 3.0 ppm, limpia el skimmer cada semana y haz el tratamiento de choque antes de cubrirla.',
    sources: ['hayward'],
  },
];

export const CLOSING_GUIDE_ES = {
  path: '/es/como-cerrar-tu-piscina',
  kicker: 'Guía · invierno',
  card: {
    title: 'Cómo cerrar tu piscina',
    summary: 'Balancea, haz el choque, baja el agua y vacía las tuberías antes de la helada.',
  },
  title: 'Cómo cerrar tu piscina en invierno, paso a paso | Pool Figures',
  description:
    'Cierra tu piscina para el invierno en orden: balancea el pH, haz el choque, limpia, baja el agua del skimmer, vacía el equipo y corta la corriente.',
  h1: 'Cómo cerrar tu piscina para el invierno',
  lead: 'Donde el agua se congela, cierra la piscina en este orden: primero el agua, luego el nivel, el equipo y la corriente. Donde no se congela, déjala funcionando con la mitad del tiempo de filtro.',
  sources: CLOSING_GUIDE.sources,
  steps: CLOSING_STEPS,
} as const satisfies StepGuide;

const PUMP_RUN_STEPS: readonly GuideStep[] = [
  {
    title: 'Conoce tus galones',
    text: 'El tiempo de bomba es lo que tarda la bomba en pasar toda el agua por el filtro, así que parte de cuánta agua tiene la piscina. Calcúlala una vez con el largo, el ancho y la profundidad de cada extremo.',
    link: gallons,
  },
  {
    title: 'Busca el caudal que fija la norma',
    text: 'ANSI/APSP/ICC-15, a la que remite el ISPSC de 2021, fija la filtración de una piscina en casa en el caudal que filtra toda el agua en 6 horas o en 36 gpm, el que sea mayor: galones ÷ 360 minutos. Son 55.6 gpm para 20,000 galones, y 36.0 gpm para 10,000, donde se aplica el mínimo. La tubería también se dimensiona para ese caudal: menos de 8 pies por segundo en el retorno y 6 en la succión.',
    link: linkTo('pump', 'Calcula el caudal de la bomba'),
    sources: ['icc'],
  },
  {
    title: 'Filtra toda el agua una vez al día',
    text: 'El manual de la bomba de velocidad variable de Hayward recomienda filtrar toda el agua de la piscina al menos una vez cada 24 horas, y revisar las reglas locales para el mínimo. Una bomba que mueve el caudal de 6 horas lo hace en 6 horas.',
    sources: ['hayward'],
  },
  {
    title: 'Calcula tus propias horas',
    text: 'Con el caudal que mueve tu bomba, filtrar toda el agua una vez toma galones ÷ galones por minuto: a 40 gpm, 20,000 galones toman 20,000 ÷ 40 = 500 minutos, 8 h 20 min. Una velocidad más baja necesita más tiempo, como dice el manual. Muchas veces oirás 8 horas al día: es una cifra informal del oficio, no una regla de la norma ni de estas fuentes. Filtrar 20,000 galones en 8 horas requiere 41.7 gpm.',
    sources: ['hayward'],
  },
  {
    title: 'Empieza con 6 horas y luego ajusta',
    text: 'El Departamento de Energía de EE. UU. dice que las bombas de piscina muchas veces funcionan mucho más de lo necesario. Su consejo: reduce la filtración a 6 horas al día y, si el agua no se ve limpia, agrega tiempo de media hora en media hora hasta que se vea. En el estudio de Florida que cita, la mayoría de los dueños que filtraban menos de 3 horas al día seguían contentos con el agua, y ahorraron en promedio el 60% de lo que pagaban por la bomba.',
    sources: ['doe'],
  },
  {
    title: 'Divide las horas con un temporizador',
    text: 'Si la suciedad es un problema, programa un temporizador para que la bomba funcione en varios ratos cortos al día: un solo ciclo largo deja el resto del día para que la piscina junte suciedad. Filtrar 6 horas al día en vez de 24 reduce su consumo de energía en un 75%.',
    sources: ['doe', 'energyStar'],
  },
  {
    title: 'Usa una bomba de velocidad variable más lenta, por más tiempo',
    text: 'Bajar a la mitad la velocidad de una bomba hace que use solo una octava parte de la energía, así que una bomba de velocidad variable ahorra funcionando despacio por más horas. El agua más lenta también deja que el filtro atrape partículas más pequeñas.',
    sources: ['energyStar', 'hayward'],
  },
  {
    title: 'Sube la velocidad para el calentador',
    text: 'Los calentadores, los skimmers y los cloradores necesitan cada uno un caudal mínimo, que dan sus propios manuales. Pon la bomba más rápida en los ratos más cortos que necesita un calentador o una fuente de agua, y a la velocidad lenta de cada día revisa que el agua siga pasando por el skimmer.',
    link: linkTo('heater', 'Calcula el tamaño del calentador'),
    sources: ['hayward'],
  },
  {
    title: 'En un invierno templado, redúcelo a la mitad',
    text: 'Donde el agua no se congela y la piscina sigue abierta, la guía de cierre de Hayward reduce a la mitad el tiempo del filtro.',
    sources: ['haywardClosing'],
  },
];

export const PUMP_RUN_GUIDE_ES = {
  path: '/es/cuantas-horas-prender-la-bomba-de-la-piscina',
  kicker: 'Guía · bomba',
  card: {
    title: 'Cuántas horas prender la bomba',
    summary: 'Las horas al día según tus galones y el caudal de tu bomba, y luego ajustadas.',
  },
  title: '¿Cuántas horas prender la bomba de la piscina? | Pool Figures',
  description:
    'Cuántas horas al día prender la bomba de tu piscina: filtrar toda el agua una vez, el caudal de la norma, las 6 horas del DOE para empezar y la bomba variable.',
  h1: 'Cuántas horas prender la bomba de la piscina',
  lead: 'Deja la bomba funcionando el tiempo suficiente para pasar toda el agua por el filtro una vez al día: 6 horas al caudal que fija la norma de piscinas, que es 55.6 gpm para 20,000 galones. Calcula las horas con tus galones y el caudal de tu propia bomba, empieza con 6 y quita o agrega media hora a la vez.',
  note: 'Sigue el manual de tu bomba y de cada equipo donde sea distinto de esta guía, y cualquier regla local sobre la filtración.',
  sources: PUMP_RUN_GUIDE.sources,
  steps: PUMP_RUN_STEPS,
} as const satisfies StepGuide;

const SALT_VS_CHLORINE_STEPS: readonly GuideStep[] = [
  {
    title: 'Una piscina de sal es una piscina de cloro',
    text: 'La sal no es el desinfectante: un generador la convierte en cloro cuando el agua pasa por su celda. El manual de AquaRite de Hayward dice que la celda convierte la sal en cloro libre, que mata las bacterias y las algas y vuelve a ser sal. El IntelliChlor de Pentair produce hipoclorito y ácido hipocloroso por electrólisis; el AquaPure de Jandy llama a lo que produce hipoclorito de sodio, cloro líquido.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'Los niveles del agua son los mismos',
    text: 'Los CDC dan un mismo mínimo para toda piscina en casa, de sal o no: cloro libre de al menos 1 ppm, al menos 2 ppm si usas ácido cianúrico, y un pH de 7.0 a 7.8, medidos al menos dos veces al día, y más seguido cuando nada mucha gente. El manual de Hayward dice que lo único especial que pide su generador es el nivel de sal y el estabilizador.',
    link: linkTo('chemistry-chart', 'Mira cada rango'),
    sources: ['cdc', 'hayward'],
  },
  {
    title: 'Cada dosis parte de tus galones',
    text: 'La sal, el cloro y cada una de las otras dosis dependen de cuánta agua tiene la piscina. Calcúlala una vez con el largo, el ancho y la profundidad de cada extremo.',
    link: gallons,
  },
  {
    title: 'En una piscina de cloro, tú agregas el cloro',
    text: 'Sin generador, el cloro se agrega a mano, con la dosis según la lectura: cloro líquido, hipoclorito de calcio (cal-hypo) o dicloro. En 20,000 galones, subir el cloro libre de 1 a 3 ppm requiere 41.0 fl oz de cloro líquido al 12.5%.',
    link: linkTo('chlorine', 'Calcula el cloro'),
  },
  {
    title: 'En una piscina de sal, la celda lo produce',
    text: 'Hayward dice que el ciclo de la sal al cloro y de vuelta a la sal casi elimina tener que agregar químicos desinfectantes. En cambio, tú ajustas el generador: su cloro depende de las horas de filtro de cada día, de la potencia que fijes y de la sal. Empieza con la potencia en más o menos 50% y mide cada pocos días; la mayoría de los dueños la suben en pleno verano y la bajan cuando hace más frío, y por debajo de 50°F el AquaRite deja de producir cloro. La celda no mide el cloro que produce, advierte Pentair, así que igual tienes que medir el agua.',
    sources: ['hayward', 'pentair'],
  },
  {
    title: 'El choque sigue saliendo de un producto',
    text: 'El AquaRite de Hayward tiene una función de supercloración para un día de mucho uso o mucha lluvia. Cuando una piscina arranca por primera vez, Pentair aconseja hacerle el tratamiento de choque con un producto de la tienda de piscinas y no con la celda.',
    sources: ['hayward', 'pentair'],
  },
  {
    title: 'Mantén la sal en el nivel que pide tu celda',
    text: 'Cada fabricante da su propio rango. El AquaRite de Hayward: de 2,700 a 3,400 ppm, 3,200 el mejor, y el agua empieza a saber salada a unos 3,500 a 4,000. El IntelliChlor de Pentair: 3,600 ppm, se apaga por debajo de 2,600, y por encima de 4,500 hay riesgo de corrosión. El AquaPure de Jandy: de 3,000 a 3,500 ppm, y por debajo de 2,000 la celda falla antes de tiempo. Mide antes de agregar: la mayoría de las piscinas ya tienen algo de sal. Una piscina de 20,000 galones con 0 ppm requiere 533.8 lb para llegar a 3,200.',
    link: linkTo('salt', 'Calcula la sal'),
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'Compra sal pura y espera con el yeso nuevo',
    text: 'Hayward pide cloruro de sodio de más de 99% de pureza; Pentair y Jandy, de al menos 99.8%. Ninguno quiere sal de roca ni sal con antiaglomerantes como el ferrocianuro de sodio (prusiato amarillo de sodio), y Hayward descarta la sal yodada. Con un acabado nuevo de yeso (plaster), la espera también cambia: de 10 a 14 días para Hayward, al menos 4 semanas para Jandy, al menos un mes para Pentair.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'La sal se queda en el agua',
    text: 'La sal no se evapora: agregas más solo después de que el agua nueva reemplaza lo que se llevaron las salpicaduras, el retrolavado o el vaciado después de la lluvia. Y la única forma de bajarla es vaciar parte del agua y volver a llenar con agua nueva.',
    sources: ['hayward'],
  },
  {
    title: 'Mantén el estabilizador que pide tu fabricante',
    text: 'Al aire libre, el estabilizador (ácido cianúrico) protege del sol el cloro que produce la celda; el sol destruye el 90% del cloro sin estabilizar en dos horas, dice Pentair. Los fabricantes no coinciden: la tabla de Hayward lo sube a 40 ppm, Pentair lo mantiene entre 30 y 50 ppm y en nada en interiores, Jandy entre 50 y 75. Mídelo cada vez que midas la sal, dice Hayward: lo más probable es que los dos bajen juntos.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'Cuida la celda',
    text: 'La celda es la parte que una piscina de cloro no tiene. Se limpia sola invirtiendo la polaridad, pero el agua dura o el agua desbalanceada igual dejan sarro: Hayward dice que la abras y la revises cada 3 meses o después de limpiar el filtro, Pentair y Jandy cada dos meses donde tiende a formar sarro. Enjuágala con una manguera de jardín, y remójala en 1 cuarto de galón de ácido muriático por 1 galón de agua solo cuando eso no baste. Pentair diseña su celda para unas 10,000 horas, más o menos cinco años de uso promedio, antes de que haya que cambiarla.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
  {
    title: 'Cuida la piedra, el metal y el ácido seco',
    text: 'La sal es corrosiva. Pentair advierte que cualquier cantidad aumenta la probabilidad de corrosión del equipo y de las superficies dentro y alrededor de la piscina, sobre todo de las piezas de metal y las piscinas de acero, y Hayward aconseja consultar a un especialista en piedra antes de poner bordes o pisos de piedra natural. Los tres fabricantes advierten contra el ácido seco (bisulfato de sodio) para el pH donde el agua se evapora mucho y casi no se diluye: sus subproductos pueden dañar la celda.',
    sources: ['hayward', 'pentair', 'jandy'],
  },
];

export const SALT_VS_CHLORINE_GUIDE_ES = {
  path: '/es/piscina-de-agua-salada-o-de-cloro',
  kicker: 'Guía · sal',
  card: {
    title: 'Agua salada o cloro',
    summary: 'Lo que cambia una celda de sal, y lo que queda igual que en una piscina de cloro.',
  },
  title: 'Piscina de agua salada o de cloro: qué cambia | Pool Figures',
  description:
    'Una piscina de agua salada es una piscina de cloro cuya celda produce el cloro. Cambian el nivel de sal, la sal, el estabilizador y el cuidado de la celda.',
  h1: 'Piscina de agua salada o de cloro: qué cambia de verdad',
  lead: 'Una piscina de agua salada es una piscina de cloro: su celda produce el cloro con sal mantenida en 3,200 ppm para el AquaRite de Hayward, dentro de sus 2,700 a 3,400 ppm, así que los niveles del agua son los mismos. Lo que cambia es el equipo, el nivel de sal que pide tu celda y el cuidado que necesita la celda.',
  note: 'Sigue el manual de tu propio generador donde sea distinto de esta guía: el nivel de sal, el estabilizador y la espera con el yeso nuevo cambian según el fabricante.',
  sources: SALT_VS_CHLORINE_GUIDE.sources,
  steps: SALT_VS_CHLORINE_STEPS,
} as const satisfies StepGuide;
