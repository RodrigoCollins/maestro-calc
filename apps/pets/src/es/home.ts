import { humanAt } from '../dog-years.ts';
import { hrefOf } from '../routes.ts';
import { FOOD_PAGES_ES } from './can-dogs-eat.ts';
import { PLANT_PAGES_ES } from './toxic-plants.ts';
import { amountEs } from './format.ts';

const medium = (age: number): string => amountEs(humanAt(age, 'medium'), 0);

/** The Spanish home: the questions the Spanish pages answer, then every food page. */
export const HOME_ES = {
  title: 'Bowl Figures: qué pueden comer los perros y su edad humana',
  description:
    'Qué pueden comer los perros, cuántos años humanos tiene tu perro y qué pasa si come chocolate. Respuestas con cifras de fuentes veterinarias, en kilos.',
  h1: 'Qué pueden comer los perros, su edad en años humanos y qué hacer con el chocolate',
  lead: 'Bowl Figures responde las preguntas de quienes tienen perro con cifras que tienen fuente: el Merck Veterinary Manual y su edición en español, el Manual de veterinaria de MSD, las pautas de la AAHA y otras obras veterinarias. Cada página las cita, con la fecha en que el equipo editorial las leyó.',
  cards: [
    {
      href: hrefOf('foods', 'es'),
      title: '¿Qué frutas pueden comer los perros?',
      summary: `${String(FOOD_PAGES_ES.length)} alimentos, de las uvas al pepino, cada uno con un veredicto, cantidades para perros de 5 a 35 kg y lo que nunca debe ir en su plato.`,
    },
    {
      href: hrefOf('dog-age', 'es'),
      title: 'Edad de perro en años humanos',
      summary: `No es por siete: un perro mediano tiene ${medium(3)} años humanos a los 3 años y ${medium(10)} a los 10. Calculadora y tabla por tamaño.`,
    },
    {
      href: hrefOf('chocolate-guide', 'es'),
      title: '¿Qué pasa si un perro come chocolate?',
      summary:
        'Lo que haces en los próximos minutos, a partir de qué dosis es peligroso y qué signos llegan y cuándo.',
    },
    {
      href: hrefOf('plants-dogs', 'es'),
      title: 'Plantas tóxicas para perros y gatos',
      summary: `${String(PLANT_PAGES_ES.length)} plantas comparadas con la lista de la ASPCA, de la palma sago y los lirios a la flor de Nochebuena, con las partes, los signos y qué hacer.`,
    },
  ],
  approach: [
    'Las páginas calculan en lugar de estimar. Cada alimento se calcula para perros de 5, 10, 20 y 35 kg, con un presupuesto de premios del 10 % de las calorías del día; en el chocolate, la dosis sale del tipo, la cantidad y el peso. Cuando las fuentes no coinciden, por ejemplo en la cantidad tóxica de uvas, se dan los dos valores.',
    'En todo lo tóxico, la llamada va primero: a tu veterinario o a una clínica veterinaria de urgencias.',
  ],
  foodsHeading: 'Todos los alimentos en español',
  trust: {
    text: 'Quién escribe y revisa estas páginas, y qué datos recoge el sitio:',
    links: [
      { href: hrefOf('about', 'es'), label: 'Acerca de' },
      { href: hrefOf('editorial', 'es'), label: 'Política editorial' },
      { href: hrefOf('privacy', 'es'), label: 'Privacidad' },
    ],
  },
  english: {
    text: 'Otras calculadoras, por ejemplo la de la ración de perros y gatos, están en inglés:',
    href: hrefOf('home'),
    label: 'Bowl Figures en inglés',
  },
  foods: FOOD_PAGES_ES.map(({ path, h1 }) => ({ href: path, label: h1 })),
} as const;
