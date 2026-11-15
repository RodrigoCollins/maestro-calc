import { checkedText, POLICY_CHECKED, PRIMARY_SOURCES, type TextPage } from '../editorial.ts';
import { hrefOf } from '../routes.ts';
import { SOURCES_ES } from './foods/sources.ts';

/** The day the Spanish policy pages were written and checked against the English ones. */
const POLICY_ES_CHECKED = '2026-11-15';

const reviewed = `Última revisión el ${checkedText(POLICY_ES_CHECKED, 'es')} (la versión en inglés, el ${checkedText(POLICY_CHECKED, 'es')}).`;

export const ABOUT_ES: TextPage = {
  title: 'Acerca de: calculadoras y guías para perros | Bowl Figures',
  description:
    'Bowl Figures responde las preguntas de quienes tienen perro con cifras con fuente: qué pueden comer, su edad en años humanos y el chocolate.',
  h1: 'Acerca de Bowl Figures',
  lead: 'Bowl Figures responde las preguntas que quienes tienen perro escriben en un buscador: ¿mi perro puede comer esto? ¿Cuántos años humanos tiene? ¿Qué pasa si comió chocolate?',
  sections: [
    {
      id: 'que-es',
      heading: 'Qué es',
      paragraphs: [
        'Un sitio gratuito de calculadoras y guías para quienes tienen perros y gatos, sin registro y con, como mucho, un pequeño script por calculadora. Las páginas en español calculan en kilos y gramos; las páginas en inglés, más antiguas, calculan en unidades de Estados Unidos.',
        'En español están por ahora la calculadora de edad del perro, la guía para cuando tu perro comió chocolate y las páginas sobre los alimentos que un perro puede comer. Las demás calculadoras, como la de la ración, están en inglés.',
      ],
    },
    {
      id: 'como-funciona',
      heading: 'Cómo funciona',
      paragraphs: [
        'Cada cifra cita su fuente. Las fórmulas y los límites vienen de obras veterinarias como el Merck Veterinary Manual y las pautas de la AAHA; cuando la edición en español del manual, el Manual de veterinaria de MSD, trata el mismo tema, se cita al lado, y cuando las fuentes se contradicen, la página muestra los dos valores.',
        'Nada de esto sustituye a tu veterinario.',
      ],
      link: {
        href: hrefOf('methodology'),
        label: 'La metodología y todas sus fórmulas (en inglés)',
      },
    },
    {
      id: 'quien',
      heading: 'Quién está detrás',
      paragraphs: [
        'El equipo editorial de Bowl Figures, según una política pública de fuentes y correcciones. Se apoya en herramientas de IA para escribir y calcular; cada cifra se comprueba con su fuente y cada fórmula se prueba con casos calculados a mano.',
      ],
      link: { href: hrefOf('editorial', 'es'), label: 'Política editorial' },
    },
  ],
  reviewed,
};

export const EDITORIAL_ES: TextPage = {
  title: 'Política editorial: de dónde salen las cifras | Bowl Figures',
  description:
    'Quién escribe Bowl Figures, de qué fuentes puede salir una cifra, cómo se revisan y fechan las páginas y cómo avisar de un error.',
  h1: 'Política editorial',
  lead: 'Las cifras sobre alimentación y venenos tratan de un animal vivo. Por eso aquí cada cifra viene de una fuente veterinaria con nombre, y la página dice cuál.',
  sections: [
    {
      id: 'autores',
      heading: 'Quién escribe',
      paragraphs: [
        'Cada página la escribe y la publica el equipo editorial de Bowl Figures, una organización y no una persona. El equipo trabaja con fuentes publicadas y no da consejo veterinario.',
      ],
    },
    {
      id: 'fuentes',
      heading: 'De dónde salen las cifras',
      paragraphs: [
        'Una fórmula, un factor, un límite o un dato solo se usa si aparece en una fuente primaria veterinaria u oficial que el equipo leyó: el Merck Veterinary Manual, las pautas de la AAHA o de la AAFCO. Las páginas en español añaden la edición en español del manual, el Manual de veterinaria de MSD.',
        'Si una cifra no se puede respaldar con una fuente, no aparece, y la página dice por qué. El equipo no inventa cifras ni llena huecos con una regla aproximada sacada de un blog.',
      ],
      sources: [...PRIMARY_SOURCES, SOURCES_ES.msdChocolate],
      link: {
        href: hrefOf('methodology'),
        label: 'La metodología y sus ejemplos de cálculo (en inglés)',
      },
    },
    {
      id: 'idioma',
      heading: 'Las páginas en español',
      paragraphs: [
        'Las páginas en español no son traducciones palabra por palabra. Responden la misma pregunta con los mismos datos que la página en inglés, pero calculan en kilos y gramos, usan las palabras de México, España y Sudamérica (papa o patata, plátano o banana) y mandan a llamar al veterinario o a una clínica veterinaria de urgencias. Cuando una fuente en español se aparta de una en inglés, la página cita las dos.',
      ],
    },
    {
      id: 'salud',
      heading: 'No es consejo veterinario',
      paragraphs: [
        'Cada resultado es un punto de partida para hablar con tu veterinario. Cuando las fuentes no coinciden, la página muestra el rango. Cada página sobre el chocolate y sobre los alimentos tóxicos te pide que llames a tu veterinario, por baja que sea la cifra.',
      ],
    },
    {
      id: 'revision',
      heading: 'Fechas de revisión',
      paragraphs: [
        'Una guía muestra la fecha en que sus cifras se compararon por última vez con las fuentes. Cuando una fuente cambia, el equipo la vuelve a leer, corrige la página y le pone fecha nueva.',
      ],
    },
    {
      id: 'correcciones',
      heading: 'Correcciones',
      paragraphs: [
        'Si encuentras una cifra que contradice una fuente, dinos la página y la fuente. Un error confirmado se corrige en la página, y su fecha de revisión cambia.',
      ],
    },
  ],
  reviewed,
};

export const PRIVACY_ES: TextPage = {
  title: 'Privacidad: qué datos recoge Bowl Figures | Bowl Figures',
  description:
    'Qué hace Bowl Figures con los datos: registros del servidor en Cloudflare, Google Analytics sin lo que escribes, y cálculos hechos en tu navegador.',
  h1: 'Privacidad',
  lead: 'En resumen: sin cuentas, sin publicidad, y las cifras que escribes se quedan en tu navegador y en el enlace que compartes.',
  sections: [
    {
      id: 'lo-que-escribes',
      heading: 'Lo que escribes',
      paragraphs: [
        'Nada de lo que escribes, como la edad o el peso de tu perro, se nos envía ni a nosotros ni a Google Analytics. El cálculo se hace en tu navegador. Los valores solo aparecen en la dirección de la página, para que puedas guardar o compartir el resultado. Abrir o compartir esa dirección la envía como cualquier visita, así que puede aparecer en los registros de Cloudflare; también queda en el historial de tu navegador.',
      ],
    },
    {
      id: 'alojamiento',
      heading: 'Alojamiento',
      paragraphs: [
        'Bowl Figures está alojado en Cloudflare. Cuando se carga una página, Cloudflare procesa los registros habituales del servidor, que pueden incluir tu dirección IP, la página pedida y el tipo de navegador.',
      ],
    },
    {
      id: 'medicion',
      heading: 'Medición de audiencia y cookies',
      paragraphs: [
        'Bowl Figures cuenta las visitas con Google Analytics, y un evento por cada uso de una calculadora (cuál, y si calculaste o compartiste). El script solo arranca cuando la página ya cargó. El sitio no tiene publicidad ni cuentas.',
        'Google Analytics recibe la página visitada sin lo que escribiste, el tipo de navegador y de dispositivo, el tamaño de la pantalla y una ubicación aproximada que Google deduce de tu dirección IP.',
        'En el Espacio Económico Europeo, el Reino Unido y Suiza, Google Analytics no guarda cookies: solo recibe la señal de que se vio una página. Lo mismo pasa en cualquier lugar si tu navegador envía la señal Global Privacy Control. El almacenamiento publicitario y la publicidad personalizada están desactivados en todas partes.',
      ],
    },
    {
      id: 'compartir',
      heading: 'Compartir',
      paragraphs: [
        'El enlace de WhatsApp es un simple texto con una dirección que abre el selector del propio WhatsApp. No cargamos ningún script de WhatsApp.',
      ],
    },
    {
      id: 'derechos',
      heading: 'Tus derechos',
      paragraphs: [
        'Según la ley de protección de datos de tu país (en la Unión Europea, el Reglamento General de Protección de Datos), puedes pedir acceso a tus datos, su corrección, su borrado o su limitación, oponerte a su tratamiento y reclamar ante la autoridad de protección de datos. Como Bowl Figures no guarda por sí mismo ningún dato sobre ti, eso afecta sobre todo a los registros de Cloudflare y a los datos de Google Analytics.',
      ],
    },
    {
      id: 'cambios',
      heading: 'Cambios',
      paragraphs: ['Actualizaremos esta página antes de añadir publicidad.'],
    },
  ],
  reviewed,
};
