import { SOURCES_ES } from '../foods/sources.ts';
import type { PlantEs } from './types.ts';

/**
 * The Spanish words of the cut flowers, bulbs and holiday plants (`src/plants/flowers.ts`), in the
 * same order; every verdict is read from the English plant's ASPCA entries.
 */
export const FLOWERS_ES: readonly PlantEs[] = [
  {
    id: 'lilies',
    slug: 'lirios',
    subject: 'los lirios',
    gender: 'm',
    plural: true,
    name: 'Lirios (azucenas)',
    names:
      'azucena o lilium en las floristerías, lirio de Pascua, lirio asiático, lirio oriental, lirio stargazer, lirio atigrado y, para las hemerocallis, lirio de día; su nombre botánico es Lilium',
    answer: 'los lirios verdaderos causan insuficiencia renal, incluso con el polen',
    short: 'el polen puede matar',
    summary:
      'Unos granos de polen o un sorbo del agua del florero de un lirio verdadero pueden causar a un gato una insuficiencia renal mortal. A los perros, no.',
    parts:
      'Toda la planta de un lirio verdadero o de una hemerocallis: la FDA nombra el tallo, las hojas, las flores, el polen y hasta el agua del florero, y Pet Poison Helpline añade el rizoma, la raíz. El Manual de veterinaria de MSD, en su edición en español, dice que lo que más preocupa es el néctar, las flores, las hojas y los tallos, y también el agua en la que han estado las flores.',
    why: [
      'La ASPCA da como desconocido el principio tóxico de las especies de Lilium, y el Manual de MSD también habla de una toxina desconocida. Nadie ha nombrado el compuesto, pero el daño sí se conoce: una lesión renal aguda en los gatos, que el Manual de MSD describe como muy sensibles. ASPCApro dice que hay casos documentados en los que bastó el polen.',
      'Qué lirios: el género Lilium (lirio de Pascua, lirio tigre o atigrado, asiático, oriental, stargazer, japonés y rubrum) y las hemerocallis o lirios de día. Pet Poison Helpline dice que todas las partes de los lirios del género Lilium son tóxicas para los gatos.',
      'Las fichas de la ASPCA de los lirios verdaderos y de las hemerocallis los dan como tóxicos solo para gatos y como no tóxicos para perros; las del lirio de Pascua, el lirio tigre y el stargazer añaden que el gato es la única especie en la que se conoce el efecto.',
    ],
    signs: [
      'La FDA da la secuencia: menos actividad, babeo, vómitos y falta de apetito entre 0 y 12 horas después de comerlo; signos de daño renal, como orinar más y deshidratarse, unas 12 a 24 horas después; e insuficiencia renal en 24 a 72 horas, que lleva a la muerte si el gato no recibe tratamiento.',
      'Pet Poison Helpline anota vómitos, dolor abdominal, deshidratación e insuficiencia renal aguda.',
      'El Manual de MSD sitúa los primeros signos entre 1 y 3 horas después; el aumento de la orina y la deshidratación, en las 12 a 30 horas siguientes; y, sin tratamiento, la insuficiencia renal aguda y la muerte en un plazo de 3 a 7 días.',
    ],
    act: [
      'No esperes a ver signos. La FDA dice que, si el tratamiento se retrasa 18 horas o más, el gato suele quedar con una insuficiencia renal irreversible. Llama ahora a tu veterinario o a una clínica veterinaria de urgencias y lleva al gato.',
      'ASPCApro indica a los veterinarios que todo gato expuesto a cualquier parte de un lirio verdadero reciba fluidos intravenosos durante 48 horas. El Manual de MSD describe un plan parecido: descontaminación, antieméticos, carbón activado y fluidos intravenosos a 2 o 3 veces la dosis de mantenimiento durante 48 a 72 horas. Cuenta con que tu gato se quede ingresado.',
      'Lávale el polen del pelo y de la cara, para que no siga lamiéndolo, y saca las flores de casa.',
    ],
    disagree: [
      'No todo lo que se llama «lirio» es un lirio verdadero. El espatifilo y el alcatraz o cala tienen cristales de oxalato que queman la boca; el lirio de los valles actúa sobre el corazón y también es tóxico para perros; la gloriosa tiene alcaloides parecidos a la colchicina y también es tóxica para perros. La alstroemeria o lirio del Perú figura en la lista de la ASPCA como no tóxica. El Manual de MSD cuenta además la amarilis entre los «falsos lirios», que no dañan el riñón como los verdaderos.',
      'Para perros, los lirios verdaderos figuran en la lista de plantas no tóxicas de la ASPCA. Un perro que se comió uno puede vomitar, como con cualquier planta, pero la insuficiencia renal es cosa de gatos.',
    ],
    questions: [
      {
        question: '¿El polen de lirio en el pelo puede envenenar a un gato?',
        answer:
          'Sí. La FDA dice que lamerse unos granos de polen del pelo al acicalarse puede causar una insuficiencia renal mortal, y ASPCApro cita casos documentados en los que bastó el polen.',
      },
      {
        question: '¿Es peligrosa el agua de un florero con lirios?',
        answer:
          'Sí: la FDA nombra el agua del florero entre las partes tóxicas, y el Manual de MSD también la menciona.',
      },
      {
        question: '¿Qué lirios son seguros para los gatos?',
        answer:
          'Ninguno de los lirios verdaderos ni de las hemerocallis. De las plantas llamadas «lirio», la ASPCA da la alstroemeria o lirio del Perú como no tóxica para gatos, perros y caballos.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'tulips',
    slug: 'tulipanes',
    subject: 'los tulipanes',
    gender: 'm',
    plural: true,
    name: 'Tulipanes',
    names:
      'tulipán de jardín o tulipán holandés, como suelen venderse los bulbos; su nombre botánico es Tulipa',
    answer: 'los bulbos son la parte más tóxica',
    short: 'peor el bulbo',
    summary:
      'La ASPCA da el tulipán como tóxico para gatos, perros y caballos, y su bulbo concentra la toxina: el riesgo mayor es para el perro que escarba.',
    parts:
      'El bulbo, ante todo: la ficha de la ASPCA dice que es donde la toxina está más concentrada. Pet Poison Helpline dice que las hojas, los tallos y las flores causan signos más leves.',
    why: [
      'La ASPCA da la tulipalina A y la B como principios tóxicos de las especies de Tulipa. Pet Poison Helpline dice que las toxinas recorren toda la planta y se acumulan sobre todo en los bulbos.',
    ],
    signs: [
      'La ASPCA anota vómitos, decaimiento, diarrea y salivación excesiva.',
      'Pet Poison Helpline distingue dos casos: las hojas, los tallos o las flores suelen dar náuseas leves con vómitos; el bulbo puede causar un malestar de estómago que no cede (vómitos, falta de apetito, diarrea, babeo) y letargo.',
    ],
    act: [
      'Averigua si comió un bulbo, del jardín o de una bolsa de bulbos que esperaban la plantación: ese es el caso en que hay que llamar enseguida al veterinario.',
      'Si mordisqueó una flor cortada del florero, llama y descríbelo; la mayoría de esos casos son el malestar de estómago leve que describe Pet Poison Helpline.',
      'Antes de plantarlos, guarda los bulbos de tulipán donde un perro no llegue.',
    ],
    questions: [
      {
        question: '¿Los bulbos de tulipán son peores que las flores?',
        answer:
          'Sí. La ficha de la ASPCA dice que el bulbo tiene la mayor concentración de toxina, y Pet Poison Helpline relaciona el bulbo con los signos que más duran.',
      },
      {
        question: '¿Un gato puede enfermar por un florero de tulipanes?',
        answer:
          'Sí: la ASPCA da el tulipán como tóxico para gatos. Según Pet Poison Helpline, morder pétalos u hojas suele causar vómitos leves.',
      },
    ],
    sources: [],
  },
  {
    id: 'daffodils',
    slug: 'narcisos',
    subject: 'los narcisos',
    gender: 'm',
    plural: true,
    name: 'Narcisos',
    names:
      'junquillo, narciso trompón (España) y narciso de papel, el que se fuerza dentro de casa; su nombre botánico es Narcissus',
    answer: 'los bulbos son la parte más venenosa',
    short: 'peor el bulbo',
    summary:
      'Los narcisos son tóxicos para gatos, perros y caballos según la ASPCA; una cantidad grande, sobre todo de bulbo, puede causar convulsiones.',
    parts:
      'El bulbo: la ficha de la ASPCA dice que es la parte más venenosa, y Pet Poison Helpline sitúa allí la mayor concentración de alcaloides. Las flores y las hojas también son tóxicas. El Manual de veterinaria de MSD, en su edición en español, también pone la licorina y los demás alcaloides en los bulbos.',
    why: [
      'La ASPCA da la licorina y otros alcaloides como principios tóxicos de las especies de Narcissus, la misma familia de compuestos que en la amarilis.',
      'Pet Poison Helpline dice que todas las partes tienen alcaloides que causan un malestar de estómago grave y que pueden traer efectos que ponen en riesgo la vida.',
    ],
    signs: [
      'La ASPCA anota vómitos, salivación y diarrea; las ingestiones grandes causan convulsiones, presión arterial baja, temblores y arritmias cardiacas.',
      'Pet Poison Helpline dice que los vómitos pueden ser intensos y llevar a una deshidratación profunda, debilidad y choque.',
      'El Manual de MSD distingue por la cantidad: un bocado pequeño da pocos signos o ninguno; uno grande, vómitos, malestar abdominal, diarrea, deshidratación y desequilibrio de electrolitos.',
    ],
    act: [
      'Un bulbo desenterrado o mordido es motivo para llamar ahora a tu veterinario. También lo es una mascota que se comió un bulbo de narciso de papel puesto a forzar dentro de casa.',
      'Anota la hora, la parte y cuánto comió, y lleva al veterinario un bulbo de la misma bolsa.',
    ],
    questions: [
      {
        question: '¿Los narcisos de papel y los junquillos son narcisos?',
        answer:
          'Sí: la ASPCA da narciso, junquillo y «paper white» (narciso de papel) como otros nombres en su ficha del narciso.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'hyacinths',
    slug: 'jacintos',
    subject: 'los jacintos',
    gender: 'm',
    plural: true,
    name: 'Jacintos',
    names: 'jacinto holandés o jacinto de jardín; su nombre botánico es Hyacinthus orientalis',
    answer: 'causan vómitos intensos, sobre todo el bulbo',
    short: 'vómito intenso',
    summary:
      'Los jacintos son tóxicos para gatos, perros y caballos en la lista de la ASPCA, que anota vómitos intensos y diarrea, a veces con sangre.',
    parts:
      'El bulbo, igual que en el tulipán: Pet Poison Helpline trata las dos plantas juntas y dice que el material del bulbo es el que más riesgo tiene.',
    why: [
      'La ASPCA da como principio tóxico de Hyacinthus orientalis unos alcaloides que podrían ser parecidos a los del narciso, la familia de su licorina.',
    ],
    signs: [
      'La ASPCA anota vómitos intensos, diarrea, a veces con sangre, decaimiento y temblores.',
      'Pet Poison Helpline relaciona con el bulbo los vómitos que no ceden, la falta de apetito, la diarrea, el babeo y el letargo.',
    ],
    act: [
      'Sangre en el vómito o temblores: llévalo ahora a tu veterinario o a una clínica veterinaria de urgencias. Un jacinto forzado en un vaso de agua junto a la ventana queda al alcance de un gato: cámbialo de sitio.',
    ],
    questions: [
      {
        question: '¿El jacinto es peor que el tulipán?',
        answer:
          'La ficha de la ASPCA del jacinto anota vómitos intensos con temblores; la del tulipán, vómitos, decaimiento, diarrea y babeo. Los dos son tóxicos, y en los dos el bulbo es lo peor.',
      },
    ],
    sources: [],
  },
  {
    id: 'chrysanthemums',
    slug: 'crisantemos',
    subject: 'los crisantemos',
    gender: 'm',
    plural: true,
    name: 'Crisantemos',
    names: 'crisantemo de jardín o de maceta; su nombre botánico es Chrysanthemum',
    answer: 'causan vómitos, babeo y una irritación de la piel',
    short: 'dan vómitos',
    summary:
      'Los crisantemos son tóxicos para gatos, perros y caballos según la ASPCA, por las piretrinas y otras sustancias irritantes de la planta.',
    parts:
      'Las flores y las hojas de una maceta de crisantemos o de un ramo. La ficha de la ASPCA no nombra una parte peor que otra.',
    why: [
      'La ASPCA da como principios tóxicos de las especies de Chrysanthemum las lactonas sesquiterpénicas, las piretrinas y otros posibles irritantes, y archiva «daisy» (margarita) y «mum» como otros nombres.',
    ],
    signs: [
      'La ASPCA anota vómitos, diarrea, salivación excesiva, falta de coordinación y dermatitis: la piel puede reaccionar donde la tocó la planta.',
    ],
    act: [
      'Lávale la cara y las patas si se revolcó en las flores o las mordió, y llama a tu veterinario si camina con inestabilidad.',
    ],
    questions: [
      {
        question: '¿Los crisantemos de jardín son la misma planta?',
        answer:
          'Sí. La ASPCA archiva «mum» y «daisy» como otros nombres en su ficha del crisantemo, que cubre muchas variedades.',
      },
    ],
    sources: [],
  },
  {
    id: 'daisies',
    slug: 'margaritas',
    subject: 'las margaritas',
    gender: 'f',
    plural: true,
    name: 'Margaritas',
    names:
      'margarita común o de jardín; la gerbera, otra planta, se vende también como margarita africana; su nombre botánico es Chrysanthemum',
    answer: 'la mayoría, pero la gerbera no',
    short: 'casi todas',
    summary:
      'La ASPCA da la margarita (un crisantemo) como tóxica para gatos y perros, y la gerbera como no tóxica: el mismo nombre esconde dos plantas.',
    parts:
      'En la margarita de la lista de la ASPCA, las flores y las hojas; la ficha de la gerbera no nombra ninguna parte tóxica.',
    why: [
      'La ASPCA archiva la margarita entre las especies de Chrysanthemum, con las mismas lactonas sesquiterpénicas, piretrinas e irritantes que el crisantemo.',
      'La gerbera (Gerbera jamesonii, también llamada margarita africana o del Transvaal) es otra planta, y la ASPCA la da como no tóxica para perros, gatos y caballos.',
    ],
    signs: [
      'En la margarita tóxica, la ASPCA anota vómitos, diarrea, salivación excesiva, falta de coordinación y dermatitis.',
    ],
    act: [
      'Mira la etiqueta de la maceta. Una gerbera (Gerbera jamesonii) está en la lista de plantas seguras; una planta etiquetada como Chrysanthemum, o una maceta de crisantemos, es la que justifica llamar al veterinario.',
    ],
    disagree: [
      'La ficha de la ASPCA de la margarita nombra perros y gatos, no caballos, mientras que la del crisantemo, con casi el mismo nombre, añade los caballos.',
    ],
    questions: [
      {
        question: '¿Las gerberas son seguras para los gatos?',
        answer: 'Sí: la ASPCA da la gerbera como no tóxica para perros, gatos y caballos.',
      },
    ],
    sources: [],
  },
  {
    id: 'carnations',
    slug: 'claveles',
    subject: 'los claveles',
    gender: 'm',
    plural: true,
    name: 'Claveles',
    names:
      'clavel común o de floristería, clavelina o clavellina; su nombre botánico es Dianthus caryophyllus',
    word: 'Poco',
    answer: 'una irritación leve del estómago y de la piel',
    short: 'irritan',
    summary:
      'Los claveles son tóxicos para gatos, perros y caballos en la lista de la ASPCA, con signos leves de estómago y de piel por un irritante desconocido.',
    parts:
      'Las flores, los tallos y las hojas de un ramo. La ASPCA no señala ninguna parte del clavel como la peor.',
    why: [
      'La ASPCA da un irritante desconocido como principio tóxico de Dianthus caryophyllus, y archiva con él la clavelina, el clavel silvestre y el clavel del poeta.',
    ],
    signs: ['La ASPCA anota signos digestivos leves y una dermatitis leve.'],
    act: [
      'Retira los tallos mordidos y observa si vomita o si le sale una zona roja y con picor donde lo tocaron las flores. Llama a tu veterinario si no se le pasa.',
    ],
    questions: [
      {
        question: '¿El clavel del poeta es lo mismo que un clavel?',
        answer:
          'La ASPCA archiva el clavel del poeta («sweet William») y las clavelinas («pinks») en su ficha del clavel, Dianthus caryophyllus.',
      },
    ],
    sources: [],
  },
  {
    id: 'calla-lilies',
    slug: 'alcatraces',
    subject: 'los alcatraces',
    gender: 'm',
    plural: true,
    name: 'Alcatraces (calas)',
    names:
      'alcatraz (México), cala (España, Argentina y Chile), cartucho (Colombia), aro de Etiopía o lirio de agua; su nombre botánico es Zantedeschia aethiopica',
    answer: 'queman la boca, pero no son lirios verdaderos',
    short: 'queman la boca',
    summary:
      'Los alcatraces son tóxicos para gatos y perros según la ASPCA por sus cristales de oxalato; no son los lirios verdaderos que dañan el riñón del gato.',
    parts: 'Las hojas, los tallos y la flor del alcatraz: todos tienen los cristales.',
    why: [
      'La ASPCA da los oxalatos de calcio insolubles como principio tóxico de Zantedeschia aethiopica, que también archiva como «arum lily», «pig lily», «white arum» y «trumpet lily».',
      'La FDA separa el alcatraz y el espatifilo de los lirios verdaderos: sus cristales irritan la boca y la garganta, sin el daño renal.',
    ],
    signs: [
      'La ASPCA anota irritación oral, un ardor intenso y la irritación de la boca, la lengua y los labios, babeo excesivo, vómitos y dificultad para tragar.',
    ],
    act: [
      'Ofrécele agua, límpiale la boca y llama a tu veterinario si el babeo o la dificultad para tragar siguen. Los ramos pueden mezclar alcatraces con lirios verdaderos: si un gato mordió uno, revisa cada flor del ramo.',
    ],
    questions: [
      {
        question: '¿Un alcatraz puede causar insuficiencia renal a un gato?',
        answer:
          'La FDA dice que no: los cristales del alcatraz irritan la boca. La insuficiencia renal la causan los lirios verdaderos y las hemerocallis.',
      },
    ],
    sources: [],
  },
  {
    id: 'amaryllis',
    slug: 'amarilis',
    subject: 'la amarilis',
    gender: 'f',
    plural: false,
    name: 'Amarilis',
    names:
      'hippeastrum, el bulbo que se vende como amarilis para Navidad, y amarilis belladona; su nombre botánico es Amaryllis',
    answer: 'el bulbo es la parte más venenosa',
    short: 'el bulbo, lo peor',
    summary:
      'La amarilis es tóxica para gatos, perros y caballos según la ASPCA; el bulbo de Hippeastrum de los regalos navideños es lo que más licorina tiene.',
    parts:
      'El bulbo: la ficha de la ASPCA de Hippeastrum («lily of the palace») dice que los bulbos son la parte más venenosa.',
    why: [
      'La ASPCA da la licorina y otras sustancias para las especies de Amaryllis, y la licorina y otros alcaloides para las de Hippeastrum, el bulbo que se vende como amarilis en los kits de invierno.',
      'El Manual de veterinaria de MSD, en su edición en español, la cuenta entre los «falsos lirios»: a diferencia de los lirios verdaderos, no daña los riñones del gato.',
    ],
    signs: [
      'La ficha de la amarilis anota vómitos (no en caballos), decaimiento, diarrea, dolor abdominal, salivación excesiva, falta de apetito y temblores.',
      'La ficha de Hippeastrum añade que las ingestiones grandes causan convulsiones, presión arterial baja, temblores y arritmias cardiacas.',
    ],
    act: [
      'Un bulbo mordido de un kit de regalo es motivo para llamar ahora a tu veterinario. Guarda la caja del kit: ahí figura el nombre de la planta.',
    ],
    disagree: [
      'La ASPCA archiva como amarilis la «naked lady» y la amarilis belladona («Belladonna lily»), y la amarilis de caja de invierno como Hippeastrum, «lily of the palace». Las dos fichas son tóxicas.',
    ],
    questions: [
      {
        question: '¿Es tóxica la amarilis de un kit de Navidad?',
        answer:
          'Sí. Esos bulbos son Hippeastrum, que la ASPCA archiva como «lily of the palace», tóxica para perros y gatos.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'peonies',
    slug: 'peonias',
    subject: 'las peonías',
    gender: 'f',
    plural: true,
    name: 'Peonías',
    names:
      'rosa de monte o rosa albardera, en España, para las peonías silvestres; su nombre botánico es Paeonia officinalis',
    answer: 'causan vómitos y diarrea',
    short: 'causan vómitos',
    summary:
      'Las peonías son tóxicas para gatos, perros y caballos en la lista de la ASPCA, que nombra el peonol como causa de vómitos, diarrea y decaimiento.',
    parts:
      'La ficha de la ASPCA no nombra ninguna parte, así que trata igual las flores y las hojas de un ramo o de un arbusto de peonías.',
    why: ['La ASPCA da el peonol como principio tóxico de Paeonia officinalis.'],
    signs: ['Para la peonía, la ASPCA anota vómitos, diarrea y decaimiento.'],
    act: [
      'Anota cuánto del ramo o del arbusto se comió y llama a tu veterinario si los vómitos siguen.',
    ],
    questions: [
      {
        question: '¿Las peonías son seguras en un ramo de novia cerca de un gato?',
        answer:
          'La ASPCA da la peonía como tóxica para gatos. Las rosas y la alstroemeria están en su lista de plantas no tóxicas.',
      },
    ],
    sources: [],
  },
  {
    id: 'poinsettias',
    slug: 'nochebuena',
    subject: 'la flor de Nochebuena',
    gender: 'f',
    plural: false,
    name: 'Flor de Nochebuena',
    names:
      'flor de Pascua (España y buena parte de Sudamérica), estrella federal (Argentina), poinsettia o estrella de Navidad; su nombre botánico es Euphorbia pulcherrima',
    word: 'Poco',
    answer: 'irrita la boca y el estómago',
    short: 'irrita la boca',
    summary:
      'La Nochebuena figura como tóxica para perros y gatos, pero la ASPCA y Pet Poison Helpline dicen que su fama es exagerada: su savia lechosa irrita, no mata.',
    parts:
      'La savia blanca y lechosa de las hojas y de las brácteas rojas, las «flores» de la planta. Pet Poison Helpline añade que también puede irritar la piel y los ojos.',
    grade: 'Pet Poison Helpline la califica de leve.',
    why: [
      'La ASPCA da como principio tóxico una savia irritante y dice que la toxicidad de la Nochebuena suele estar sobrevalorada. Pet Poison Helpline nombra en la savia los ésteres diterpénicos del euforbol y unas sustancias parecidas a las saponinas, que actúan como un detergente.',
      'El Manual de veterinaria de MSD, en su edición en español, la cuenta entre las plantas que irritan el aparato digestivo: escribe que irrita las membranas mucosas y causa babeo y vómitos excesivos, pero no la muerte, y le da un pronóstico excelente.',
    ],
    signs: [
      'La ASPCA dice que irrita la boca y el estómago y a veces provoca vómitos. Pet Poison Helpline añade babeo, lamerse los labios, diarrea y enrojecimiento, hinchazón y picor de la piel o de los ojos.',
    ],
    act: [
      'Pet Poison Helpline dice que los signos suelen pasar solos y que rara vez hace falta tratarlos, salvo si son intensos y no ceden. Lava la savia de la piel o del pelo, ofrécele agua y llama a tu veterinario si los vómitos siguen.',
      'Pon la planta donde no llegue: en diciembre suele estar en el suelo o en una mesa baja, a la altura de un perro o de un gato curioso.',
    ],
    disagree: [
      'La Nochebuena está en la lista de plantas tóxicas, y a la vez es la planta cuya fama las dos fuentes llaman exagerada. La clasificación es real; el miedo a una Nochebuena mortal, no.',
    ],
    questions: [
      {
        question: '¿Una flor de Nochebuena puede matar a un gato?',
        answer:
          'Ninguna de las fuentes lo sugiere. Pet Poison Helpline la califica de leve, la ASPCA dice que su toxicidad suele estar sobrevalorada y el Manual de veterinaria de MSD escribe que causa babeo y vómitos, pero no la muerte.',
      },
      {
        question: '¿Qué planta de Navidad es segura para perros y gatos?',
        answer:
          'El cactus de Navidad figura en la lista de la ASPCA como no tóxico para perros, gatos y caballos. El acebo, el muérdago y la amarilis son tóxicos.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'holly',
    slug: 'acebo',
    subject: 'el acebo',
    gender: 'm',
    plural: false,
    name: 'Acebo',
    names:
      'acebo americano, que es el de la ficha de la ASPCA, y acebo europeo o común; la ASPCA archiva con él el acebo inglés, el de Oregón, el inkberry y el winterberry; su nombre botánico es Ilex opaca',
    answer: 'la ASPCA da a sus hojas y a sus bayas una toxicidad baja',
    short: 'toxicidad baja',
    summary:
      'El acebo es tóxico para gatos, perros y caballos en la lista de la ASPCA, aunque su ficha da a las hojas y a las bayas rojas una toxicidad baja.',
    parts:
      'Las hojas espinosas y las bayas rojas, que la ficha de la ASPCA califica de baja toxicidad. El Manual de veterinaria de MSD, en su edición en español, describe el acebo europeo y añade las semillas de las bayas.',
    why: [
      'La ASPCA da las saponinas como principio tóxico de Ilex opaca, el acebo americano, y archiva con él el acebo inglés, el europeo, el de Oregón, el inkberry y el winterberry.',
      'El Manual de MSD, que describe el acebo europeo (Ilex aquifolium), coincide en las saponinas y añade que las hojas, los frutos y las semillas tienen un alcaloide, la teobromina, y compuestos con una acción sobre el corazón parecida a la de la digital.',
    ],
    signs: [
      'La ficha de la ASPCA del acebo anota vómitos, diarrea y decaimiento.',
      'Según el Manual de MSD, el dolor abdominal, los vómitos y la diarrea aparecen cuando el animal come 2 bayas o más, y la muerte es rara.',
    ],
    act: [
      'Recoge las bayas caídas de la corona de la puerta, del centro de mesa o del seto del jardín, y cuenta cuántas pudo comer tu mascota: el Manual de MSD sitúa los signos a partir de 2.',
      'Si vomita una y otra vez o tiene diarrea, llama a tu veterinario y dile que fue acebo.',
    ],
    questions: [
      {
        question: '¿Las bayas del acebo son venenosas para los perros?',
        answer:
          'La ASPCA incluye el acebo entre las plantas tóxicas para perros y dice que sus hojas y sus bayas son de baja toxicidad, con vómitos, diarrea y decaimiento. El Manual de MSD sitúa los signos a partir de 2 bayas y dice que la muerte es rara.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
  {
    id: 'mistletoe',
    slug: 'muerdago',
    subject: 'el muérdago',
    gender: 'm',
    plural: false,
    name: 'Muérdago',
    names:
      'muérdago americano, la especie de la ficha de la ASPCA; el muérdago europeo es otra especie; su nombre botánico es Phoradendron flavescens',
    answer: 'puede hacer más lento el corazón y bajar la presión',
    short: 'frena el corazón',
    summary:
      'El muérdago americano es tóxico para gatos, perros y caballos según la ASPCA: sus toxalbúminas y foratoxinas pueden hacer más lento el corazón.',
    parts:
      'Las bayas y las hojas de la rama que se cuelga en las fiestas, que acaban cayendo al suelo. El Manual de veterinaria de MSD, en su edición en español, dice que todas las partes de la planta tienen sustancias tóxicas.',
    why: [
      'La ASPCA da como principios tóxicos de Phoradendron flavescens una toxalbúmina y sus lectinas y foratoxinas.',
      'El Manual de MSD describe la misma especie y nombra esas sustancias: unas aminas y unas proteínas tóxicas, las viscotoxinas.',
    ],
    signs: [
      'La ASPCA anota vómitos, diarrea, presión arterial baja (rara vez), dificultad para respirar y frecuencia cardiaca baja.',
      'El Manual de MSD describe un cuadro más grave con dosis tóxicas: vómitos, diarrea abundante, pupilas dilatadas, respiración rápida y difícil, choque y, a las pocas horas, la muerte por colapso cardiovascular.',
    ],
    act: [
      'Si tu mascota respira con dificultad o está débil después de comer muérdago, llévala ya a tu veterinario o a una clínica veterinaria de urgencias: el Manual de MSD habla de horas, no de días.',
      'Cuelga la rama de muérdago bien alto y barre cada día las bayas y las hojas que caigan.',
    ],
    questions: [
      {
        question: '¿El muérdago europeo está en la lista?',
        answer:
          'La ficha de la ASPCA que usa esta página es la del muérdago americano, Phoradendron flavescens, la misma especie que describe el Manual de MSD. Si tu mascota comió otra clase de muérdago, pregúntale a tu veterinario.',
      },
    ],
    sources: [SOURCES_ES.msdPlants],
  },
];
