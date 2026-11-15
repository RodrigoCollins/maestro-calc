import { checkedText, POLICY_CHECKED, PRIMARY_SOURCES, type TextPage } from '../editorial.ts';
import { hrefOf } from '../routes.ts';
import { SOURCES_FR } from './foods/sources.ts';

/** The day the French policy pages were written and checked against the English ones. */
const POLICY_FR_CHECKED = '2026-11-15';

const reviewed = `Dernière vérification le ${checkedText(POLICY_FR_CHECKED, 'fr')} (la version anglaise le ${checkedText(POLICY_CHECKED, 'fr')}).`;

export const ABOUT_FR: TextPage = {
  title: 'À propos : calculateurs et guides pour chiens | Bowl Figures',
  description:
    'Bowl Figures répond aux questions des propriétaires de chiens avec des chiffres sourcés : ce qu’un chien peut manger, son âge humain, le chocolat.',
  h1: 'À propos de Bowl Figures',
  lead: 'Bowl Figures répond aux questions que les propriétaires de chiens tapent dans un moteur de recherche : mon chien peut-il manger ça ? Quel âge a-t-il en âge humain ? Que faire s’il a mangé du chocolat ?',
  sections: [
    {
      id: 'quoi',
      heading: 'Ce que c’est',
      paragraphs: [
        'Un site gratuit de calculateurs et de guides pour les propriétaires de chiens et de chats, sans inscription et avec au plus un petit script par calculateur. Les pages en français calculent en kilogrammes et en grammes ; les pages en anglais, plus anciennes, calculent en unités américaines.',
        'En français, il existe pour l’instant le calculateur d’âge du chien, le guide pour le cas où votre chien a mangé du chocolat et les pages sur les aliments qu’un chien peut manger. Les autres calculateurs, comme celui de la ration, sont en anglais.',
      ],
    },
    {
      id: 'comment',
      heading: 'Comment ça marche',
      paragraphs: [
        'Chaque chiffre cite sa source. Les formules et les seuils viennent d’ouvrages vétérinaires comme le Merck Veterinary Manual et les recommandations de l’AAHA ; quand un centre antipoison francophone, comme le CNITV à VetAgro Sup ou le Centre Antipoisons belge, traite le même sujet, il est cité à côté, et quand les sources se contredisent, la page montre les deux valeurs.',
        'Rien ici ne remplace votre vétérinaire.',
      ],
      link: {
        href: hrefOf('methodology'),
        label: 'La méthodologie et toutes ses formules (en anglais)',
      },
    },
    {
      id: 'qui',
      heading: 'Qui est derrière',
      paragraphs: [
        'La rédaction de Bowl Figures, selon des principes publics pour les sources et les corrections. Elle s’aide d’outils d’IA pour écrire et calculer ; chaque chiffre est vérifié contre sa source et chaque formule testée sur des cas calculés à la main.',
      ],
      link: { href: hrefOf('editorial', 'fr'), label: 'Principes éditoriaux' },
    },
  ],
  reviewed,
};

export const EDITORIAL_FR: TextPage = {
  title: 'Principes éditoriaux : d’où viennent les chiffres | Bowl Figures',
  description:
    'Qui écrit Bowl Figures, de quelles sources un chiffre peut venir, comment les pages sont vérifiées et datées, et comment signaler une erreur.',
  h1: 'Principes éditoriaux',
  lead: 'Les chiffres sur l’alimentation et les poisons concernent un animal vivant. C’est pourquoi chaque chiffre vient ici d’une source vétérinaire nommée, et la page dit laquelle.',
  sections: [
    {
      id: 'auteurs',
      heading: 'Qui écrit',
      paragraphs: [
        'Chaque page est écrite et publiée par la rédaction de Bowl Figures, une organisation et non une personne. La rédaction travaille à partir de sources publiées et ne donne pas d’avis vétérinaire.',
      ],
    },
    {
      id: 'sources',
      heading: 'D’où viennent les chiffres',
      paragraphs: [
        'Une formule, un facteur, un seuil ou une donnée n’est utilisé que s’il figure dans une source primaire vétérinaire ou officielle que la rédaction a lue : le Merck Veterinary Manual, les recommandations de l’AAHA ou de l’AAFCO. Les pages en français y ajoutent des centres antipoison francophones : le Centre national d’informations toxicologiques vétérinaires (CNITV) en France, le Centre Antipoisons en Belgique et Tox Info Suisse.',
        'Si un chiffre ne peut pas être sourcé, il n’apparaît pas, et la page dit pourquoi. La rédaction n’invente aucun chiffre et ne comble aucun vide avec une règle approximative tirée d’un blog.',
      ],
      sources: [...PRIMARY_SOURCES, SOURCES_FR.cnitv, SOURCES_FR.antipoisonsAnimals],
      link: {
        href: hrefOf('methodology'),
        label: 'La méthodologie et ses exemples de calcul (en anglais)',
      },
    },
    {
      id: 'langue',
      heading: 'Les pages en français',
      paragraphs: [
        'Les pages en français ne sont pas des traductions mot à mot. Elles répondent à la même question avec les mêmes faits que la page anglaise, mais calculent en kilogrammes et en grammes et donnent les numéros à appeler en France, en Belgique et en Suisse. Quand une source francophone s’écarte d’une source anglaise, la page cite les deux.',
      ],
    },
    {
      id: 'sante',
      heading: 'Pas d’avis vétérinaire',
      paragraphs: [
        'Chaque résultat est un point de départ, à discuter avec votre vétérinaire. Quand les sources divergent, la page montre la fourchette. Chaque page sur le chocolat et sur les aliments toxiques vous demande d’appeler votre vétérinaire, aussi bas que soit le chiffre.',
      ],
    },
    {
      id: 'verification',
      heading: 'Dates de vérification',
      paragraphs: [
        'Un guide affiche la date à laquelle ses chiffres ont été vérifiés pour la dernière fois contre les sources. Quand une source change, la rédaction la relit, corrige la page et la redate.',
      ],
    },
    {
      id: 'corrections',
      heading: 'Corrections',
      paragraphs: [
        'Si vous trouvez un chiffre qui contredit une source, indiquez-nous la page et la source. Une erreur confirmée est corrigée sur la page, et sa date de vérification change.',
      ],
    },
  ],
  reviewed,
};

export const PRIVACY_FR: TextPage = {
  title: 'Confidentialité : ce que Bowl Figures collecte | Bowl Figures',
  description:
    'Ce que Bowl Figures fait des données : journaux de serveur chez Cloudflare, Google Analytics sans vos saisies, et des calculs faits dans votre navigateur.',
  h1: 'Confidentialité',
  lead: 'En bref : pas de compte, pas de publicité, et les chiffres que vous saisissez restent dans votre navigateur et dans le lien que vous partagez.',
  sections: [
    {
      id: 'saisies',
      heading: 'Ce que vous saisissez',
      paragraphs: [
        'Rien de ce que vous saisissez, comme l’âge ou le poids de votre chien, n’est envoyé à nous ni à Google Analytics. Le calcul se fait dans votre navigateur. Les valeurs figurent seulement dans l’adresse de la page, pour que vous puissiez enregistrer ou partager le résultat. Ouvrir ou partager cette adresse l’envoie comme toute visite de page, si bien qu’elle peut apparaître dans les journaux de Cloudflare ; elle reste aussi dans l’historique de votre navigateur.',
      ],
    },
    {
      id: 'hebergement',
      heading: 'Hébergement',
      paragraphs: [
        'Bowl Figures est hébergé chez Cloudflare. Quand une page se charge, Cloudflare traite des journaux de serveur habituels qui peuvent contenir votre adresse IP, la page demandée et le type de votre navigateur.',
      ],
    },
    {
      id: 'mesure',
      heading: 'Mesure d’audience et cookies',
      paragraphs: [
        'Bowl Figures compte les visites avec Google Analytics, et un événement par utilisation d’un calculateur (lequel, et si vous avez calculé ou partagé). Le script ne démarre qu’une fois la page chargée. Le site n’a ni publicité ni compte.',
        'Google Analytics reçoit la page visitée sans vos saisies, le type de navigateur et d’appareil, la taille de l’écran et une localisation approximative que Google déduit de votre adresse IP.',
        'Dans l’Espace économique européen, au Royaume-Uni et en Suisse, Google Analytics ne dépose aucun cookie : il reçoit seulement le signal qu’une page a été vue. Il en va de même partout si votre navigateur envoie un signal Global Privacy Control. Le stockage publicitaire et la publicité personnalisée sont désactivés partout.',
      ],
    },
    {
      id: 'partage',
      heading: 'Partage',
      paragraphs: [
        'Le lien WhatsApp est un simple texte avec une adresse qui ouvre le choix de WhatsApp lui-même. Nous ne chargeons aucun script de WhatsApp.',
      ],
    },
    {
      id: 'droits',
      heading: 'Vos droits',
      paragraphs: [
        'Selon le Règlement général sur la protection des données (RGPD), vous avez le droit d’accéder à vos données, de les faire rectifier, effacer ou limiter, de vous opposer à leur traitement et de déposer une réclamation auprès d’une autorité de protection des données, en France la CNIL. Comme Bowl Figures ne conserve lui-même aucune donnée sur vous, cela concerne surtout les journaux de Cloudflare et les données de Google Analytics.',
      ],
    },
    {
      id: 'changements',
      heading: 'Changements',
      paragraphs: ['Nous mettrons cette page à jour avant d’ajouter de la publicité.'],
    },
  ],
  reviewed,
};
