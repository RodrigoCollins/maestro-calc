import type { GuideStep, StepGuide } from './guide.ts';
import { hrefOf, routeOf } from './routes.ts';
import { CLOUDY_GUIDE, FIGURES, GREEN_GUIDE, SHOCK_OFTEN_GUIDE } from './trouble.ts';

/*
 * The Spanish water trouble guides: the same steps, tables, sources and figures as `trouble.ts`,
 * in neutral Spanish (tú) and US units. `guide-es.test.ts` and `trouble-es.test.ts` hold each one
 * to its English twin.
 */

/** A link to the page of route `id` in Spanish, marked while that page is still English. */
const linkTo = (id: string, label: string): NonNullable<GuideStep['link']> => {
  const href = hrefOf(id, 'es');
  return { href, label: href === routeOf(href)?.en ? `${label} (en inglés)` : label };
};

const { algae, algae20, shock10, weekly, cloudy, acid, perPpm, breakpoint } = FIGURES;
const [cloudy10, cloudy20] = cloudy;

const algaeList = algae
  .map(
    ({ gallons, liquid, liquidGallons, calHypo, calHypoPounds }) =>
      `${gallons} galones, ${liquid} fl oz (${liquidGallons} galones) de líquido o ${calHypo} oz (${calHypoPounds} lb) de cal-hypo`,
  )
  .join('; ');

const gallonsLink = linkTo('volume', 'Calcula tus galones');

const GREEN_STEPS: readonly GuideStep[] = [
  {
    title: 'Conoce tus galones',
    text: 'Cada dosis de choque depende de cuánta agua tiene la piscina. Calcúlala una vez con el largo, el ancho y la profundidad de cada extremo, y guarda el número.',
    link: gallonsLink,
  },
  {
    title: 'Mide el cloro libre y el pH',
    text: 'El kit de Taylor mantiene el cloro en 2.0 a 4.0 ppm y el pH en 7.2 a 7.8, medidos a diario. Con muy poco cloro, dice, la desinfección es insuficiente y crecen bacterias y algas.',
    link: linkTo('chemistry-chart', 'Ve el rango de cada nivel'),
    sources: ['taylor'],
  },
  {
    title: 'Descarta primero los metales',
    text: 'No todo verde es alga. La tabla de problemas de Taylor lee el agua azul verdosa como cobre, la rojiza como hierro y la morada o negra como manganeso, y para cada una dice que busques el consejo de un experto sobre el origen del metal y su tratamiento. Las algas vienen con paredes verdes y resbalosas y agua turbia o verde.',
    sources: ['taylor'],
  },
  {
    title: 'Equilibra el pH antes del choque',
    text: 'La tabla de Taylor trata las algas ajustando primero el pH a 7.2 a 7.8, y pone la alcalinidad total en su rango antes que el pH. La etiqueta del cal-hypo dice que siempre ajustes el pH a 7.2 a 7.6 antes de agregar el producto.',
    link: linkTo('ph', 'Calcula la dosis para el pH'),
    sources: ['taylor', 'calHypo'],
  },
  {
    title: 'Calcula el choque a 30 ppm',
    text: `Para las algas, la tabla de Taylor dice que sobreclores a 30 ppm, tres veces los 10 ppm que da un choque de etiqueta. Desde 0 ppm la calculadora de cloro da, en cloro líquido al 12.5% o cal-hypo al 65%: ${algaeList}. Una lectura mayor que 0 lleva menos: ingresa la tuya.`,
    link: linkTo('chlorine', 'Calcula la dosis de choque'),
    sources: ['taylor'],
  },
  {
    title: 'Agrégalo como dice la etiqueta, por partes',
    text: 'La etiqueta del cal-hypo hace el choque con 10 a 20 oz por cada 10,000 galones para 5 a 10 ppm, y la del cloro líquido con 52 a 104 fl oz por cada 10,000 galones, cada una cada 7 días o según haga falta. Para las algas, la etiqueta del cal-hypo sigue sus instrucciones de choque y agrega el producto lo más cerca posible de las algas de las paredes o el fondo, y repite el tratamiento si hace falta. Agrégalo al atardecer, con la bomba funcionando, y mide entre una parte y otra.',
    sources: ['calHypo', 'liquid'],
  },
  {
    title: 'Cepilla, aspira y deja correr el filtro',
    text: 'Para evitar manchas o decoloración, la etiqueta del cal-hypo dice que justo después del tratamiento limpies bien la piscina cepillando las algas, aspires y hagas pasar el agua por el filtro. Taylor cepilla el concreto con un cepillo de acero inoxidable y el liner de vinilo con uno suave de nailon. Hayward dice que probablemente tendrás que hacer un retrolavado o limpiar el filtro para quitar el sedimento acumulado.',
    sources: ['calHypo', 'taylor', 'hayward'],
  },
  {
    title: 'Nunca mezcles químicos',
    text: 'Agrega el ácido y el cloro por separado, nunca mezclados. La etiqueta del cal-hypo dice que no lo premezcles, y advierte que la contaminación puede causar una explosión o liberar gases tóxicos. Mezclar el cloro líquido con amoníaco, ácidos o detergentes libera gas cloro, dice su etiqueta, y la hoja de datos de seguridad de HASA mantiene el ácido muriático lejos de los blanqueadores de cloro.',
    sources: ['calHypo', 'liquid', 'hasaSds'],
  },
  {
    title: 'Nada solo cuando esté clara y haya bajado',
    text: 'Las dos etiquetas prohíben nadar con más de 4 ppm de cloro. El código de los CDC para piscinas públicas agrega una regla que vale la pena seguir en casa: el agua debe estar tan clara que se vea el fondo (5.7.6.1). La sobrecloración, dice el código, es la dosis grande de cloro que mata las algas.',
    link: linkTo('swim-guide', 'Cuándo nadar después de un choque'),
    sources: ['calHypo', 'liquid', 'mahc'],
  },
  {
    title: 'Evita que vuelva',
    text: 'Mide a diario, mantén el cloro en 2.0 a 4.0 ppm y haz un choque cada 7 días o según haga falta. Para prevenir las algas, la etiqueta del cal-hypo usa un alguicida con regularidad, siguiendo su etiqueta; el código de los CDC lo permite en una piscina pública solo si está registrado ante la EPA y se usa siguiendo estrictamente su etiqueta.',
    link: linkTo('shock-often-guide', 'Cada cuánto hacer un tratamiento de choque'),
    sources: ['taylor', 'calHypo', 'mahc'],
  },
];

export const GREEN_GUIDE_ES = {
  path: '/es/como-arreglar-una-piscina-verde',
  checked: GREEN_GUIDE.checked,
  kicker: 'Guía · piscina verde',
  card: {
    title: 'Arreglar una piscina verde',
    summary: 'Descarta los metales, equilibra el pH, haz un choque a 30 ppm y cepilla.',
  },
  title: 'Cómo arreglar una piscina verde: dosis de choque | Pool Figures',
  description:
    'Por qué la piscina se pone verde y cómo arreglarla: descarta cobre y hierro, equilibra el pH, choque a 30 ppm y cepilla, con la dosis en galones o litros.',
  h1: 'Cómo arreglar una piscina verde',
  lead: `Una piscina verde tiene algas, dice la tabla de problemas de Taylor: ajusta el pH a 7.2 a 7.8, sobreclora a 30 ppm, cepilla las paredes y el fondo, y repite si hace falta. Desde 0 ppm, 20,000 galones llevan ${algae20.liquid} fl oz (${algae20.liquidGallons} galones) de cloro líquido al 12.5% o ${algae20.calHypo} oz de cal-hypo al 65% para llegar a 30 ppm. El agua azul verdosa sin paredes resbalosas puede ser cobre, y para eso la tabla dice que busques el consejo de un experto.`,
  note: 'Sigue la etiqueta de tu propio producto donde sea distinta de esta guía: su concentración, su dosis de choque y su nivel de reingreso cambian según el producto. Nunca mezcles dos químicos.',
  table: {
    caption: 'Lo que te dice una piscina verde (ppm son partes por millón)',
    region: 'Causas y soluciones de una piscina verde',
    head: ['Lo que ves', 'Causa', 'Prueba', 'Solución'],
    rows: [
      [
        'Paredes verdes y resbalosas; agua turbia o verde',
        'Algas',
        'Cloro libre por debajo de 2.0 ppm',
        'pH a 7.2 a 7.8, sobreclorar a 30 ppm, cepillar; repetir si hace falta',
      ],
      [
        'Manchas negras o polvo amarillo del lado de la sombra',
        'Algas',
        'Cloro libre por debajo de 2.0 ppm',
        'Cepillar, sobreclorar y luego un alguicida',
      ],
      [
        'Agua opaca, sin brillo',
        'Algas que empiezan',
        'Cloro libre',
        'Sobreclorar o hacer un choque',
      ],
      ['Agua azul verdosa', 'Cobre', 'Una prueba de metales', 'Buscar el consejo de un experto'],
      ['Agua rojiza', 'Hierro', 'Una prueba de metales', 'Buscar el consejo de un experto'],
    ],
    sources: GREEN_GUIDE.table.sources,
  },
  moreTables: [
    {
      caption:
        'El choque a 30 ppm en litros, desde 0 ppm: el cloro líquido en litros, el cal-hypo en gramos',
      region: 'Choque de una piscina verde por litros',
      head: ['Piscina', 'Cloro líquido al 12.5%', 'Cal-hypo al 65%'],
      rows: FIGURES.algaeMetric,
      sources: GREEN_GUIDE.moreTables[0].sources,
    },
  ],
  sources: GREEN_GUIDE.sources,
  steps: GREEN_STEPS,
} as const satisfies StepGuide;

const CLOUDY_STEPS: readonly GuideStep[] = [
  {
    title: 'Conoce tus galones',
    text: 'Cada dosis que aclara el agua depende de cuánta agua tiene la piscina. Calcúlala una vez con el largo, el ancho y la profundidad de cada extremo, y guarda el número.',
    link: gallonsLink,
  },
  {
    title: 'Mide el cloro, el pH y la alcalinidad',
    text: 'El kit de Taylor mantiene el cloro en 2.0 a 4.0 ppm, el pH en 7.2 a 7.8 y la alcalinidad total en 80 a 120 ppm; mide el cloro y el pH a diario y la alcalinidad cada semana. Los CDC miden el cloro y el pH al menos dos veces al día. La lectura te dice cuál de las causas de la tabla es la tuya.',
    link: linkTo('chemistry-chart', 'Ve el rango de cada nivel'),
    sources: ['taylor', 'cdc'],
  },
  {
    title: 'Poco cloro: haz un choque',
    text: `El agua opaca y turbia, sin brillo, son algas que empiezan en la tabla de Taylor, y la solución es sobreclorar o hacer un choque. La etiqueta del cal-hypo hace el choque a 5 a 10 ppm. De una lectura de 1 ppm a 10, ${cloudy10?.gallons ?? ''} galones llevan ${cloudy10?.liquid ?? ''} fl oz de cloro líquido al 12.5% o ${cloudy10?.calHypo ?? ''} oz de cal-hypo al 65%, y ${cloudy20?.gallons ?? ''} galones llevan ${cloudy20?.liquid ?? ''} fl oz o ${cloudy20?.calHypo ?? ''} oz.`,
    link: linkTo('chlorine', 'Calcula la dosis de choque'),
    sources: ['taylor', 'calHypo'],
  },
  {
    title: 'pH alto: bájalo',
    text: `Un pH muy alto trae depósitos de sarro, agua turbia y un desinfectante que rinde poco, dice Taylor, y por encima de 7.8 la capacidad del cloro para desinfectar baja mucho. Bájalo a 7.2 a 7.8: cada gota de la prueba de demanda de ácido son ${acid} fl oz de ácido muriático al 31.45% por cada 10,000 galones.`,
    link: linkTo('ph', 'Calcula el ácido muriático'),
    sources: ['taylor'],
  },
  {
    title: 'Alcalinidad alta: bájala primero',
    text: 'Por encima de 120 ppm, la tabla de Taylor baja la alcalinidad total a 80 a 120 ppm, y siempre la pone en su rango antes de ajustar el pH. Para bajar la alcalinidad total, Taylor agrega ácido seco o ácido muriático; un ajuste de la alcalinidad total puede cambiar el pH, dice, así que mide los dos otra vez después de cada adición.',
    link: linkTo('ph-guide', 'Cómo bajar el pH'),
    sources: ['taylor'],
  },
  {
    title: 'Agua en rango: revisa el filtro',
    text: 'Con la química en rango, la causa de la tabla es una mala filtración, y su solución es revisar que el filtro funcione bien. Hayward dice que probablemente tendrás que hacer un retrolavado o limpiar los elementos del filtro para quitar el sedimento acumulado, y el manual de su bomba filtra toda el agua de la piscina al menos una vez cada 24 horas.',
    link: linkTo('pump-guide', 'Cuántas horas prender la bomba'),
    sources: ['taylor', 'hayward', 'haywardPump'],
  },
  {
    title: 'Una bomba chica para la piscina',
    text: 'Si la bomba no alcanza a pasar toda el agua por el filtro en un día, el filtro no puede aclararla. Calcula el caudal que necesitan tus galones según la recirculación, y compáralo con tu bomba.',
    link: linkTo('pump', 'Calcula el caudal de la bomba'),
  },
  {
    title: 'Turbia justo después del calcio',
    text: 'El cloruro de calcio agregado de una sola vez puede enturbiar el agua. La etiqueta de ClearView separa las dosis de más de 3 libras por cada 10,000 galones y las aplica con al menos 12 horas de diferencia, para que el agua se ajuste y no se enturbie.',
    link: linkTo('calcium', 'Calcula el cloruro de calcio'),
    sources: ['clearView'],
  },
  {
    title: 'Nunca mezcles químicos',
    text: 'Resuelve una causa a la vez, agrega cada producto por separado y nunca mezcles dos productos. La etiqueta del cal-hypo dice que no lo premezcles, y advierte que la contaminación puede causar una explosión o liberar gases tóxicos; la hoja de datos de seguridad de HASA mantiene el ácido muriático lejos de los blanqueadores de cloro.',
    sources: ['calHypo', 'hasaSds'],
  },
  {
    title: 'Nada cuando puedas ver el fondo',
    text: 'El código de los CDC cierra una piscina pública si el agua no está tan clara que se vea el fondo (5.7.6.1), desde cualquier punto del borde hasta a 30 pies (5.7.6.2): una buena prueba en casa, para que se vea a quien tenga problemas en el agua. Después de un choque, la etiqueta prohíbe nadar con más de 4 ppm de cloro.',
    link: linkTo('swim-guide', 'Cuándo nadar después de los químicos'),
    sources: ['mahc', 'calHypo'],
  },
  {
    title: 'Turbia y verde: algas',
    text: 'Las paredes verdes y resbalosas con agua turbia o verde son algas en la tabla de Taylor, y necesitan el choque más grande de una piscina verde, a 30 ppm.',
    link: linkTo('green-guide', 'Cómo arreglar una piscina verde'),
    sources: ['taylor'],
  },
];

export const CLOUDY_GUIDE_ES = {
  path: '/es/por-que-esta-turbia-mi-piscina',
  checked: CLOUDY_GUIDE.checked,
  kicker: 'Guía · piscina turbia',
  card: {
    title: 'Por qué está turbia mi piscina',
    summary: 'Las cuatro causas que una prueba distingue, y cómo aclarar cada una.',
  },
  title: '¿Por qué está turbia mi piscina? Cómo aclararla | Pool Figures',
  description:
    'Por qué el agua de la piscina se pone turbia y cómo aclararla: poco cloro, pH alto, alcalinidad alta o mala filtración, la lectura de cada una y su solución.',
  h1: '¿Por qué está turbia mi piscina, y cómo la aclaro?',
  lead: `El agua turbia tiene cuatro causas en la tabla de problemas de Taylor: algas que empiezan, mala filtración, un pH alto o una alcalinidad total alta. Mide primero: con menos de 2.0 ppm de cloro, haz un choque (de 1 a 10 ppm, ${cloudy20?.gallons ?? ''} galones llevan ${cloudy20?.liquid ?? ''} fl oz de cloro líquido al 12.5%); con un pH de más de 7.8 o una alcalinidad de más de 120 ppm, bájalos; con el agua en rango, revisa el filtro. No nades hasta que puedas ver el fondo.`,
  note: 'Sigue la etiqueta de tu propio producto donde sea distinta de esta guía, y agrega un químico a la vez, nunca dos mezclados.',
  table: {
    caption: 'Lo que enturbia una piscina (ppm son partes por millón)',
    region: 'Causas y soluciones de una piscina turbia',
    head: ['Causa', 'Lectura', 'Solución'],
    rows: [
      ['Algas que empiezan', 'Cloro libre por debajo de 2.0 ppm', 'Sobreclorar o hacer un choque'],
      ['pH alto', 'pH de más de 7.8', 'Bajar el pH a 7.2 a 7.8'],
      [
        'Alcalinidad total alta',
        'Alcalinidad total de más de 120 ppm',
        'Bajarla a 80 a 120 ppm, antes que el pH',
      ],
      [
        'Mala filtración',
        'Cloro, pH y alcalinidad en rango',
        'Revisar el filtro; hacer un retrolavado o limpiarlo',
      ],
      [
        'Calcio agregado de una vez',
        'Más de 3 lb por cada 10,000 galones de una vez',
        'Dividirlo, con 12 horas de diferencia',
      ],
    ],
    sources: CLOUDY_GUIDE.table.sources,
  },
  sources: CLOUDY_GUIDE.sources,
  steps: CLOUDY_STEPS,
} as const satisfies StepGuide;

const SHOCK_OFTEN_STEPS: readonly GuideStep[] = [
  {
    title: 'Conoce tus galones',
    text: 'Cada dosis de choque depende de cuánta agua tiene la piscina. Calcúlala una vez con el largo, el ancho y la profundidad de cada extremo, y guarda el número.',
    link: gallonsLink,
  },
  {
    title: 'Una vez por semana',
    text: 'La etiqueta del cal-hypo hace el choque cada 7 días o según haga falta, con 10 a 20 oz por cada 10,000 galones para 5 a 10 ppm, y la del cloro líquido sobreclora cada 7 días o según haga falta con 52 a 104 fl oz por cada 10,000 galones. La etiqueta del dicloro hace el choque cada semana cuando hace calor o después de lluvias fuertes, y con menos frecuencia cuando hace frío.',
    sources: ['calHypo', 'liquid', 'dichlor'],
  },
  {
    title: 'Y otra vez cuando la piscina lo pide',
    text: 'La etiqueta del cal-hypo agrega un choque después de lluvia y vientos fuertes, de muchos bañistas, de agua más cálida o de un uso más frecuente, y para corregir algas visibles, olores desagradables e irritación de los ojos.',
    sources: ['calHypo'],
  },
  {
    title: 'Mide a diario para saber cuándo',
    text: 'El kit de Taylor mide el cloro a diario, o según lo pida la cantidad de bañistas, y lo mantiene en 2.0 a 4.0 ppm; los CDC miden el cloro y el pH al menos dos veces al día. Haz el choque cuando la lectura lo pida, no solo el día de la semana que toca.',
    link: linkTo('chemistry-chart', 'Ve el rango de cada nivel'),
    sources: ['taylor', 'cdc'],
  },
  {
    title: 'Haz un choque cuando se acumula el cloro combinado',
    text: `El cloro que ya hizo su trabajo se vuelve cloro combinado, las cloraminas que irritan los ojos y dan olor. El kit de Taylor dice que sobreclores de vez en cuando para eliminarlo: la dosis de cloración al punto de quiebre es 10 veces la cantidad de cloro combinado. Una piscina de 20,000 galones con 2 ppm de cloro libre y 0.5 ppm de combinado sube 5 ppm, a 7: ${breakpoint.liquid} fl oz de cloro líquido al 12.5% o ${breakpoint.calHypo} oz de cal-hypo al 65%. El código de los CDC actúa en una piscina pública cuando el cloro combinado pasa de 0.4 ppm.`,
    link: linkTo('chlorine', 'Calcula la dosis al punto de quiebre'),
    sources: ['taylor', 'mahc'],
  },
  {
    title: 'Calcula un choque para tu piscina',
    text: `La tabla de arriba es un choque de 0 a 10 ppm, el tope de los 5 a 10 ppm de la etiqueta: ${shock10.calHypo} oz de cal-hypo al 65% para 10,000 galones, ${shock10.calHypoPounds} lb. La etiqueta del cal-hypo agrega que 2 oz por cada 10,000 galones suben una lectura en 1 ppm más o menos, y la calculadora da ${perPpm} oz. Desde tu propia lectura, la dosis es menor.`,
    link: linkTo('chlorine', 'Calcula la dosis de choque'),
    sources: ['calHypo'],
  },
  {
    title: 'Haz el choque al atardecer, con la bomba funcionando',
    text: 'La etiqueta del cal-hypo lo agrega al atardecer con la bomba del filtro funcionando, esparcido sobre la parte honda. Hayward espera a que el sol empiece a bajar para hacer el choque.',
    link: linkTo('shock-guide', 'Cómo hacer un tratamiento de choque, paso a paso'),
    sources: ['calHypo', 'hayward'],
  },
  {
    title: 'Nunca mezcles químicos',
    text: 'La etiqueta del dicloro dice que no lo mezcles con ningún otro químico, y la del cal-hypo que no lo premezcles: la contaminación puede causar una explosión o liberar gases tóxicos, advierten las dos. Agrega un producto, deja correr la bomba y luego el siguiente: nunca los mezcles.',
    sources: ['dichlor', 'calHypo'],
  },
  {
    title: 'Nada cuando la lectura haya bajado',
    text: 'Las etiquetas del cal-hypo y del cloro líquido prohíben nadar con más de 4 ppm, la del dicloro con más de 3 ppm. Las etiquetas dan una lectura, no un número de horas: decide la prueba, no el reloj.',
    link: linkTo('swim-guide', 'Cuándo nadar después de un choque'),
    sources: ['calHypo', 'liquid', 'dichlor'],
  },
  {
    title: 'Una piscina verde necesita más',
    text: 'Un choque semanal evita que empiecen las algas; no aclara una piscina verde. Para las algas, la tabla de Taylor sobreclora a 30 ppm, tres de estos choques.',
    link: linkTo('green-guide', 'Cómo arreglar una piscina verde'),
    sources: ['taylor'],
  },
];

export const SHOCK_OFTEN_GUIDE_ES = {
  path: '/es/cada-cuanto-hacer-un-tratamiento-de-choque',
  checked: SHOCK_OFTEN_GUIDE.checked,
  kicker: 'Guía · tratamiento de choque',
  card: {
    title: 'Cada cuánto hacer un choque',
    summary: 'Una vez por semana, y cuando la lluvia, los bañistas o las algas lo piden.',
  },
  title: 'Cada cuánto hacer un choque a la piscina | Pool Figures',
  description:
    'Cada cuánto hacer un choque a la piscina: una vez por semana según las etiquetas, y tras lluvia, mucho uso o algas, con la dosis de 10,000 a 30,000 galones.',
  h1: '¿Cada cuánto hay que hacer un choque a la piscina?',
  lead: `Haz un choque a la piscina una vez por semana, cada 7 días, como dicen las etiquetas del cal-hypo y del cloro líquido, y otra vez después de lluvia y vientos fuertes, de muchos bañistas o de agua más cálida, y cada vez que veas algas o sientas olor a cloro. Un choque de 0 a 10 ppm son ${shock10.calHypo} oz de cal-hypo al 65% o ${shock10.liquid} fl oz de cloro líquido al 12.5% por cada 10,000 galones. Mide a diario: cuando se acumula el cloro combinado, haz un choque de 10 veces esa cantidad.`,
  note: 'Sigue la etiqueta de tu propio producto donde sea distinta de esta guía: su concentración, su frecuencia y su nivel de reingreso cambian según el producto.',
  table: {
    caption: 'Un choque, de 0 a 10 ppm de cloro libre (ppm son partes por millón)',
    region: 'Un choque según el tamaño de la piscina',
    head: ['Piscina', 'Cloro líquido al 12.5%', 'Cal-hypo al 65%', 'Dicloro al 56%'],
    rows: weekly.map(({ gallons, liquid, liquidGallons, calHypo, calHypoPounds, dichlor }) => [
      `${gallons} galones`,
      `${liquid} fl oz (${liquidGallons} galones)`,
      `${calHypo} oz (${calHypoPounds} lb)`,
      `${dichlor} oz`,
    ]),
    sources: SHOCK_OFTEN_GUIDE.table.sources,
  },
  sources: SHOCK_OFTEN_GUIDE.sources,
  steps: SHOCK_OFTEN_STEPS,
} as const satisfies StepGuide;
