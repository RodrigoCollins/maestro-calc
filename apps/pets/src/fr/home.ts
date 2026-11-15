import { humanAt } from '../dog-years.ts';
import { hrefOf } from '../routes.ts';
import { FOOD_PAGES_FR } from './can-dogs-eat.ts';
import { amountFr } from './format.ts';

const medium = (age: number): string => amountFr(humanAt(age, 'medium'), 0);

/** The French home: the three questions the French pages answer, then every food page. */
export const HOME_FR = {
  title: 'Bowl Figures : ce qu’un chien peut manger, et son âge humain',
  description:
    'Que peut manger un chien, quel âge a votre chien en âge humain, et que faire face au chocolat ? Des réponses chiffrées tirées de sources vétérinaires, en kg.',
  h1: 'Ce qu’un chien peut manger, son âge humain, et que faire face au chocolat',
  lead: 'Bowl Figures répond aux questions des propriétaires de chiens avec des chiffres qui ont une source : le Merck Veterinary Manual, les recommandations de l’AAHA, les centres antipoison vétérinaires et d’autres ouvrages vétérinaires. Chaque page les cite, avec la date à laquelle la rédaction les a lus.',
  cards: [
    {
      href: hrefOf('foods', 'fr'),
      title: 'Que peut manger un chien ?',
      summary: `${String(FOOD_PAGES_FR.length)} aliments, du raisin au concombre, chacun avec un verdict, des quantités pour des chiens de 5 à 35 kg et ce qui ne doit jamais aller dans la gamelle.`,
    },
    {
      href: hrefOf('dog-age', 'fr'),
      title: 'Âge du chien en âge humain',
      summary: `Pas fois sept : un chien moyen a ${medium(3)} ans en âge humain à 3 ans et ${medium(10)} ans à 10 ans. Calculateur et tableau selon la taille.`,
    },
    {
      href: hrefOf('chocolate-guide', 'fr'),
      title: 'Mon chien a mangé du chocolat',
      summary:
        'Ce que vous faites dans les prochaines minutes, à partir de quelle dose c’est dangereux et quels signes arrivent quand.',
    },
  ],
  approach: [
    'Les pages calculent au lieu d’estimer. Un aliment est calculé pour des chiens de 5, 10, 20 et 35 kg, avec un budget friandises de 10 % des calories de la journée ; pour le chocolat, la dose découle du type, de la quantité et du poids. Quand les sources divergent, par exemple sur la quantité toxique de raisin, les deux valeurs sont données.',
    'Pour tout ce qui est toxique, l’appel passe en premier : à votre vétérinaire ou à un vétérinaire de garde, en France aussi au CNITV (04 78 87 10 40), en Suisse à Tox Info Suisse (145).',
  ],
  foodsHeading: 'Tous les aliments en français',
  trust: {
    text: 'Qui écrit et vérifie ces pages, et ce que le site collecte :',
    links: [
      { href: hrefOf('about', 'fr'), label: 'À propos' },
      { href: hrefOf('editorial', 'fr'), label: 'Principes éditoriaux' },
      { href: hrefOf('privacy', 'fr'), label: 'Confidentialité' },
    ],
  },
  english: {
    text: 'D’autres calculateurs, par exemple pour la ration des chiens et des chats, existent en anglais :',
    href: hrefOf('home'),
    label: 'Bowl Figures en anglais',
  },
  foods: FOOD_PAGES_FR.map(({ path, h1 }) => ({ href: path, label: h1 })),
} as const;
