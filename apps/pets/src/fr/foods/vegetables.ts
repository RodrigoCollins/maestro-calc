import { SOURCES_DE } from '../../de/foods/sources.ts';
import type { FoodFr } from './types.ts';

/** The vegetables of the French pages, in the order of the route table. */
export const VEGETABLES_FR: readonly FoodFr[] = [
  {
    id: 'tomatoes',
    name: 'Tomates',
    some: 'des tomates',
    answer: 'seulement la chair rouge et bien mûre',
    short: 'Seulement mûres',
    summary:
      'La chair d’une tomate mûre n’est pas toxique, contrairement aux parties vertes de la plante et aux tomates pas encore mûres.',
    why: [
      'L’ASPCA classe le plant de tomate comme toxique pour les chiens, les chats et les chevaux à cause de sa solanine, et précise que le fruit mûr ne l’est pas. L’AKC écrit qu’un chien peut manger des tomates mûres, mais seulement en petite quantité.',
      'Comme substances toxiques, l’AKC cite la solanine et la tomatine, qui lui est apparentée, surtout présentes dans les parties vertes de la plante ; PetMD signale la tomatine des tiges, des feuilles et des tomates vertes pas mûres.',
      'Les tomates mûres apportent des fibres, de la vitamine C, du potassium et des antioxydants comme le lycopène (AKC, PetMD).',
    ],
    serve: [
      'Uniquement des tomates bien rouges et mûres. L’AKC conseille de retirer toutes les parties vertes et de couper la chair en dés.',
      'Lavez-la, retirez le pédoncule et les feuilles, puis donnez-la nature ou mélangée à la gamelle (PetMD).',
    ],
    never: [
      'Les feuilles, les tiges et les vrilles de la plante, ainsi que les tomates vertes pas mûres (ASPCA, AKC, PetMD). Tenez votre chien à l’écart du potager.',
      'La sauce tomate, la soupe de tomate, le ketchup et la salsa, qui contiennent souvent de l’ail et de l’oignon (AKC, PetMD).',
    ],
    signs: [
      'Pour la plante, l’ASPCA cite l’hypersalivation, la perte d’appétit, de forts troubles digestifs, l’abattement, la faiblesse, des pupilles dilatées et un rythme cardiaque ralenti. L’AKC ajoute des troubles de la coordination, des tremblements et un rythme cardiaque irrégulier.',
      'L’AKC : si votre chien a mangé beaucoup de tomates ou des parties de la plante, appelez votre vétérinaire.',
    ],
    usdaName: 'de tomates rouges mûres',
    piece: {
      a: 'une tomate cerise',
      one: 'tomate cerise',
      many: 'tomates cerises',
      basis: 'USDA : 1 tomate cerise = 17 g',
    },
    questions: [
      {
        question: 'Mon chien a mangé des feuilles de tomate au jardin. Est-ce grave ?',
        answer:
          'Les feuilles et les tiges sont les parties toxiques (ASPCA). Appelez votre vétérinaire en précisant la quantité mangée et la taille de votre chien ; l’AKC conseille d’appeler s’il a mangé beaucoup de tomates ou des parties de la plante.',
      },
      {
        question: 'Mon chien peut-il manger des tomates cuites ou de la sauce tomate ?',
        answer:
          'La chair mûre cuite, sans rien d’autre, reste le même aliment. Mais les sauces, les soupes et le ketchup contiennent souvent de l’oignon et de l’ail (AKC, PetMD), tous deux toxiques pour les chiens.',
      },
    ],
    sources: [],
  },
  {
    id: 'avocado',
    name: 'Avocat',
    some: 'de l’avocat',
    answer: 'le noyau et le gras sont le vrai risque',
    short: 'Mieux vaut éviter',
    summary:
      'Le chien supporte mieux la persine de l’avocat que les oiseaux ou les chevaux, mais le noyau, le gras et le guacamole en font une mauvaise friandise.',
    why: [
      'Pour d’autres animaux, l’avocat est bien plus dangereux. La liste des plantes de l’ASPCA le classe toxique pour les chevaux, et sa page sur les aliments en fait surtout un problème pour les oiseaux, les lapins, les ânes, les chevaux et les ruminants. Le Merck écrit que les chiens semblent relativement peu sensibles, avec un seul rapport sur deux chiens dont le cœur a été atteint après de l’avocat. CliniTox, la base de données des toxiques de la faculté Vetsuisse de Zurich, écrit que de fortes doses de persine peuvent abîmer le muscle cardiaque chez les mammifères autres que le chien et le chat, ainsi que chez les oiseaux.',
      'Pour un chien, les risques sont ailleurs. Selon le Merck, un noyau avalé peut boucher l’intestin. PetMD, sous la plume d’un vétérinaire, écrit que son gras peut déclencher une inflammation du pancréas (pancréatite) et conclut que les risques l’emportent sur les bénéfices ; CliniTox cite les deux mêmes dangers, la pancréatite due au gras et l’occlusion intestinale due au noyau. Les feuilles, la peau et le noyau contiennent le plus de persine (AKC, avec le Dr Michael Hyder).',
    ],
    serve: [
      'Si votre chien a mangé un peu de chair, surveillez vomissements, diarrhée ou abattement, et appelez votre vétérinaire si vous les voyez (AKC).',
      'S’il a avalé le noyau ou semble s’étouffer, rendez-vous au plus vite chez un vétérinaire de garde, conseille PetMD.',
      'L’AKC et PetMD fixent tous deux un plafond pour une simple dégustation de chair nature : au plus une cuillère à café par 10 livres (4,5 kg) de poids corporel, calculé ci-dessous. Pour un chien sujet à la pancréatite ou en surpoids, renoncez-y aussi (AKC).',
    ],
    never: [
      'Le noyau, la peau et les feuilles (PetMD, AKC).',
      'Le guacamole : il contient de l’oignon, de l’ail et du sel (PetMD).',
    ],
    signs: [
      'Vomissements, diarrhée et douleurs abdominales (PetMD), abattement (AKC), et les signes d’une pancréatite causée par le gras.',
    ],
    disagree: [
      'Beaucoup de listes disent l’avocat toxique pour les chiens. Les sources primaires de cette page ne le font pas : la fiche de l’ASPCA ne cite que les chevaux, le Merck juge les chiens relativement peu sensibles, et CliniTox exclut expressément le chien et le chat de l’atteinte cardiaque. L’AKC et PetMD autorisent une petite quantité de chair, et PetMD la déconseille malgré tout.',
    ],
    thresholds: [
      {
        label: 'AKC et PetMD : au plus, en cuillères à café de chair nature',
        lead: 'le plafond que l’AKC et PetMD fixent à une cuillère à café par 10 livres (4,5 kg)',
        unit: { one: 'cuillère à café', many: 'cuillères à café' },
      },
    ],
    thresholdNote:
      'Le plafond que l’AKC et PetMD donnent pour une dégustation de chair d’avocat nature, une cuillère à café par 10 livres (4,5 kg) de poids corporel, calculé pour quatre poids. C’est un maximum, pas une portion que les sources recommandent.',
    questions: [
      {
        question: 'Mon chien a mangé du guacamole. Que dois-je faire ?',
        answer:
          'Appelez votre vétérinaire. L’avocat est le moindre souci : le guacamole contient le plus souvent de l’oignon et de l’ail, tous deux toxiques pour les chiens (PetMD).',
      },
      {
        question: 'L’avocat est-il toxique pour les chiens ?',
        answer:
          'Pas au sens strict, selon les sources de cette page : le Merck juge les chiens relativement peu sensibles à la persine, et CliniTox exclut le chien et le chat de l’atteinte cardiaque. Ce qui est dangereux pour un chien, c’est le noyau, qui peut boucher l’intestin, et le gras, qui peut déclencher une pancréatite.',
      },
    ],
    sources: [SOURCES_DE.clinitoxAvocado],
  },
  {
    id: 'onions',
    name: 'Oignons',
    some: 'des oignons',
    answer: 'l’oignon est toxique pour les chiens',
    short: 'Non, sous aucune forme',
    summary:
      'Sous toutes ses formes, l’oignon abîme les globules rouges du chien, et les signes n’apparaissent souvent que plusieurs jours plus tard.',
    why: [
      'L’ASPCA classe l’oignon toxique pour les chiens, les chats et les chevaux ; sa substance toxique est le disulfure de n-propyle. Le Merck écrit que les oxydants soufrés des alliums détruisent les globules rouges (hémolyse), ce qui peut conduire à une anémie.',
      'La cuisson n’y change rien. L’AKC : cru ou cuit, frit ou en poudre, l’oignon et les autres alliums nuisent aux chiens. PetMD cite aussi les oignons nouveaux, la ciboulette et le poireau.',
      'PetMD cite les chiens les plus à risque : les races japonaises comme l’akita et le shiba inu, que CliniTox, la base de données des toxiques de la faculté Vetsuisse de Zurich, juge elle aussi particulièrement sensibles, ainsi que les chiens diabétiques, atteints d’une maladie du foie ou d’anémie, ou sous certains médicaments.',
    ],
    serve: [
      'Appelez tout de suite votre vétérinaire ou un vétérinaire de garde, même si votre chien semble aller bien : le mal est fait avant de se voir.',
      'Précisez la quantité d’oignon mangée et sous quelle forme ; l’oignon en poudre, les soupes toutes prêtes et les sauces sont concentrés.',
      'N’attendez pas les signes et ne le soignez pas vous-même.',
    ],
    never: [
      'L’oignon cru, cuit, frit ou en poudre, ainsi que les oignons nouveaux, la ciboulette et le poireau (AKC, PetMD).',
      'Les restes préparés avec : farces, sauces, soupes, pizzas, burgers et petits pots pour bébé à l’oignon en poudre.',
    ],
    signs: [
      'Le Merck : les signes ne se voient en général qu’une fois beaucoup de globules rouges détruits, le plus souvent quelques jours après l’ingestion. PetMD écrit qu’ils peuvent apparaître en un jour ou plus tard, et CliniTox cite un à plusieurs jours selon la quantité.',
      'Surveillez faiblesse, gencives pâles, urine rouge ou brune, cœur et respiration rapides, abattement, perte d’appétit et effondrement (ASPCA, Merck, AKC) ; CliniTox cite aussi une jaunisse. VCA écrit que toute quantité peut déranger l’estomac, que de plus grandes quantités abîment les globules rouges et qu’une atteinte des reins peut suivre.',
    ],
    disagree: [
      'Les sources ne placent pas la limite au même endroit. PetMD écrit que l’intoxication s’observe régulièrement chez les chiens qui mangent plus de 0,5 % de leur poids en oignon, et les 100 g pour un chien de 20 kg de l’AKC sont le même chiffre ; CliniTox cite aussi plus de 0,5 % du poids en une fois. Le Merck rapporte des signes après 15 à 30 g d’oignon cru par kg, trois à six fois plus, et CliniTox donne ces mêmes 15 à 30 g par kg comme dose toxique chez le chien. Le tableau montre les deux limites.',
    ],
    usdaName: 'd’oignons crus',
    piece: {
      a: 'un oignon moyen',
      one: 'oignon moyen',
      many: 'oignons moyens',
      basis: 'USDA : 1 oignon moyen (6,4 cm de diamètre) = 110 g',
    },
    thresholds: [
      {
        label: 'PetMD et AKC : 0,5 % du poids corporel',
        lead: 'la limite de 0,5 % du poids corporel, à partir de laquelle PetMD voit régulièrement des intoxications,',
      },
      {
        label: 'Merck : signes dès 15 g/kg',
        lead: 'la plus faible dose à laquelle le Merck décrit des signes, 15 g/kg,',
      },
    ],
    thresholdNote:
      'Les grammes d’oignon avec lesquels un chien atteint la limite de chaque source, pour quatre poids, et la même chose en oignons moyens de 110 g selon l’USDA. Les sources y voient des dégâts ; en dessous, il n’y a pas de quantité sûre : les dégâts de l’oignon s’additionnent, et certains chiens réagissent à moins.',
    questions: [
      {
        question: 'Mon chien a mangé un plat avec de l’oignon. Un peu d’oignon, est-ce grave ?',
        answer:
          'Aucune quantité n’est conseillée. Appelez votre vétérinaire ou un vétérinaire de garde et dites quel plat c’était et combien votre chien en a mangé ; l’oignon en poudre et l’oignon séché en contiennent bien plus par cuillère que l’oignon frais.',
      },
      {
        question: 'Combien de temps après l’ingestion les signes apparaissent-ils ?',
        answer:
          'Souvent après plusieurs jours : le Merck écrit que les signes ne se voient en général que quelques jours après l’ingestion, une fois assez de globules rouges détruits. C’est pourquoi vous appelez avant qu’ils n’apparaissent.',
      },
    ],
    sources: [SOURCES_DE.clinitoxAllium],
  },
  {
    id: 'garlic',
    name: 'Ail',
    some: 'de l’ail',
    answer: 'l’ail est toxique pour les chiens',
    short: 'Non, toxique',
    summary:
      'Sous toutes ses formes, l’ail est plusieurs fois plus toxique que l’oignon pour le chien, et l’ail en poudre est le plus concentré.',
    why: [
      'L’ASPCA classe l’ail toxique pour les chiens, les chats et les chevaux, à cause du même disulfure de n-propyle que l’oignon. Le Merck écrit que l’ail est 3 à 5 fois plus toxique que l’oignon ; l’AKC et PetMD disent cinq fois.',
      'PetMD : l’ail est toxique pour le chien sous toutes ses formes, frais, séché ou en poudre. VCA écrit qu’une cuillère à café d’ail en poudre équivaut à huit gousses fraîches.',
      'L’AKC écrit avec le Dr Michael Hyder qu’un chien ne devrait pas manger d’ail même comme ingrédient, par exemple dans une pâte à pizza, et déconseille les produits antipuces et antitiques à base d’ail. L’akita et le shiba inu sont plus sensibles (AKC), et CliniTox, la base de données des toxiques de la faculté Vetsuisse de Zurich, cite elle aussi ces races comme particulièrement sensibles.',
    ],
    serve: [
      'Appelez votre vétérinaire ou un vétérinaire de garde. L’AKC conseille d’appeler même pour une petite quantité, car un traitement précoce fait la différence.',
      'Précisez sous quelle forme : une gousse, du pain à l’ail ou de la poudre, la plus concentrée.',
    ],
    never: [
      'L’ail frais, l’ail en poudre, le sel à l’ail, le pain à l’ail et les plats cuisinés à l’ail.',
      'Les compléments à l’ail et les antipuces à l’ail (AKC).',
    ],
    signs: [
      'PetMD : les signes apparaissent le plus souvent dans les 24 heures, mais peuvent mettre jusqu’à une semaine. L’AKC : vomissements et diarrhée en quelques heures ; gencives pâles, faiblesse, urine foncée et anémie après deux à cinq jours.',
      'Aussi abattement, hypersalivation, respiration rapide et démarche chancelante (PetMD, AKC).',
    ],
    disagree: [
      'PetMD écrit que 2 g d’ail par livre de poids corporel (environ 4,4 g par kg) peuvent déjà provoquer troubles digestifs et vomissements, et qu’un chien de 25 livres (11 kg) a besoin d’un traitement à partir de 50 g, soit environ 10 gousses selon son calcul de 5 g par gousse. L’USDA pèse une gousse à 3 g : ces mêmes 50 g font donc environ 17 gousses USDA. Le Merck ne donne pas de dose pour l’ail, seulement qu’il est 3 à 5 fois plus toxique que l’oignon.',
      'CliniTox donne comme dose toxique pour le chien 5 g d’ail entier par kg de poids corporel, donnés sur 7 jours (en extrait, 1,25 ml par kg) : une quantité répartie sur une semaine, pas un seul repas.',
    ],
    usdaName: 'd’ail cru',
    piece: {
      a: 'une gousse d’ail',
      one: 'gousse d’ail',
      many: 'gousses d’ail',
      basis: 'USDA : 1 gousse = 3 g',
    },
    thresholds: [
      {
        label: 'PetMD : troubles digestifs dès 2 g par livre',
        lead: 'la quantité de 2 g par livre à partir de laquelle, selon PetMD, troubles digestifs et vomissements peuvent commencer,',
      },
    ],
    thresholdNote:
      'Le chiffre de PetMD, 2 g d’ail par livre de poids corporel (environ 4,4 g par kg), calculé pour quatre poids, en grammes et en gousses USDA de 3 g. C’est là que commencent les troubles digestifs selon PetMD ; l’atteinte des globules rouges vient avec davantage. Appelez pour toute quantité d’ail.',
    questions: [
      {
        question: 'Un peu d’ail, est-ce bon pour les chiens ?',
        answer:
          'Non. Chaque source vétérinaire de cette page dit l’ail toxique pour le chien sous toutes ses formes, et le vétérinaire de l’AKC déconseille les produits antipuces à l’ail.',
      },
      {
        question: 'Mon chien a mangé un morceau de pain à l’ail. Et maintenant ?',
        answer:
          'Appelez votre vétérinaire. L’AKC conseille d’appeler même pour une petite quantité, car un traitement précoce fait la différence ; dites combien de pain il a mangé et s’il contenait de l’ail en poudre, le plus concentré.',
      },
    ],
    sources: [SOURCES_DE.clinitoxAllium],
  },
  {
    id: 'carrots',
    name: 'Carottes',
    some: 'des carottes',
    answer: 'la carotte est une friandise sans danger et peu calorique',
    short: 'Oui, en petits morceaux',
    summary:
      'Crues ou cuites, nature, les carottes conviennent aux chiens ; coupez-les en petits morceaux pour que votre chien ne s’étouffe pas.',
    why: [
      'L’AKC écrit qu’un chien peut manger des carottes comme en-cas sain et peu calorique, et PetMD les juge sans danger pour la plupart des chiens.',
      'Elles apportent du bêta-carotène, que le corps transforme en vitamine A, ainsi que des fibres et du potassium, et les mâcher fait du bien aux dents (AKC, PetMD). Avec 35 kcal pour 100 g de mini-carottes (USDA), elles comptent parmi les friandises les plus légères de ce site.',
    ],
    serve: [
      'Lavez-les ou épluchez-les pour retirer la terre et les pesticides (AKC).',
      'Crues ou cuites, toujours nature (AKC, PetMD). Coupez les carottes entières, et même les bâtonnets, en bouchées pour que votre chien ne s’étouffe pas (AKC) ; PetMD propose des rondelles d’environ 6 mm d’épaisseur.',
    ],
    never: [
      'Des carottes entières à un chien qui avale tout rond : les gros morceaux peuvent l’étouffer ou boucher l’intestin (AKC, PetMD).',
      'Les carottes au beurre, au sel, à l’oignon ou à l’ail, et le gâteau aux carottes.',
    ],
    usdaName: 'de mini-carottes crues',
    piece: {
      a: 'une mini-carotte',
      one: 'mini-carotte',
      many: 'mini-carottes',
      basis: 'USDA : 1 mini-carotte moyenne = 10 g',
    },
    disagree: [
      'L’AKC propose des carottes froides ou congelées aux chiots qui font leurs dents ; PetMD voit dans les carottes congelées un risque pour les dents. PetMD signale aussi leur sucre naturel pour les chiens diabétiques ou en surpoids.',
    ],
    questions: [
      {
        question: 'Mon chien peut-il manger des carottes tous les jours ?',
        answer:
          'Les sources traitent la carotte comme une friandise, donc la règle des 10 % s’applique. Tout le budget friandises du tableau ci-dessus représente déjà beaucoup de mini-carottes : la carotte ne devrait pas être la seule friandise de la journée.',
      },
      {
        question: 'Un chiot qui fait ses dents peut-il mâcher des carottes congelées ?',
        answer:
          'Les sources se contredisent ici : l’AKC propose des carottes froides ou congelées aux chiots qui font leurs dents, PetMD y voit un risque pour les dents. Dans le doute, demandez à votre vétérinaire.',
      },
    ],
    sources: [],
  },
  {
    id: 'broccoli',
    name: 'Brocoli',
    some: 'du brocoli',
    answer: 'nature et en petits morceaux',
    short: 'Oui, mais peu',
    summary:
      'Le brocoli nature est sans danger en petite quantité, mais l’AKC le dit toxique au-delà d’un quart de la ration du jour.',
    why: [
      'L’AKC écrit, avec la relecture de son vétérinaire en chef, le Dr Jerry Klein, qu’un chien peut manger du brocoli cuit ou cru, sans assaisonnement ni huile. Il est riche en fibres et en vitamine C, et pauvre en graisses (AKC).',
      'La limite vient des isothiocyanates des fleurettes, qui peuvent irriter l’estomac (AKC, PetMD). L’AKC : le brocoli est considéré sans danger tant qu’il représente moins de 10 % de l’alimentation du jour, et toxique au-delà de 25 %. PetMD cite la vétérinaire comportementaliste Dr Leslie Sinn, qui place la limite toxique au-delà de 20 à 25 % de l’alimentation du jour.',
    ],
    serve: [
      'Cuit à la vapeur, à l’eau ou au micro-ondes, coupé en petits morceaux, refroidi et nature (PetMD) ; l’AKC l’autorise aussi cru.',
      'Coupez-le en bouchées et commencez par un petit peu (AKC).',
    ],
    never: [
      'De gros morceaux de tige : selon l’AKC, ils peuvent bloquer l’œsophage, surtout chez les petits chiens, et PetMD dit les tiges crues dangereuses pour l’étouffement et l’occlusion intestinale.',
      'Le brocoli au beurre, à l’huile, en sauce au fromage ou à l’ail.',
    ],
    signs: [
      'Un estomac irrité : vomissements, gaz ou diarrhée. PetMD conseille un vétérinaire de garde en cas d’étouffement, de vomissements ou de diarrhée qui durent plus de 24 heures, d’un ventre dur ou gonflé, et d’abattement.',
    ],
    usdaName: 'de brocoli cru',
    piece: {
      a: 'une fleurette de brocoli avec sa tige',
      one: 'fleurette avec sa tige',
      many: 'fleurettes avec leur tige',
      basis: 'USDA : 1 fleurette avec sa tige (environ 13 cm de long) = 31 g',
    },
    ceiling: 'AKC : toxique dès 25 % du jour',
    sizeGuide: {
      note: 'Les quantités de PetMD, une à trois fois par semaine, les catégories de poids converties de livres en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '½ à 1 cuillère à café'],
        ['Petit (5 à 9 kg)', '1 à 2 cuillères à café'],
        ['Moyen (10 à 23 kg)', '1 à 2 cuillères à soupe'],
        ['Grand (23 à 41 kg)', '2 à 3 cuillères à soupe'],
        ['Très grand (dès 41 kg)', '3 à 4 cuillères à soupe'],
      ],
    },
    disagree: [
      'L’AKC place la limite toxique au-delà de 25 % de l’alimentation du jour, la source de PetMD au-delà de 20 à 25 %. Aucune ne dit si la part se compte en calories ou en poids ; le tableau la lit en calories, avec le même besoin d’entretien que pour le budget friandises.',
    ],
    questions: [
      {
        question: 'Mon chien peut-il manger les tiges de brocoli ?',
        answer:
          'Oui, coupées petit et cuites ; non, entières ou en gros morceaux. L’AKC avertit que les tiges peuvent bloquer l’œsophage, surtout chez les petits chiens.',
      },
      {
        question: 'Combien de brocoli, c’est trop ?',
        answer:
          'Selon l’AKC, le brocoli est sans danger tant qu’il reste sous 10 % de l’alimentation du jour, et toxique au-delà de 25 %. La colonne de droite du tableau ci-dessus convertit ces 25 % en grammes pour quatre poids.',
      },
    ],
    sources: [],
  },
  {
    id: 'cucumber',
    name: 'Concombre',
    some: 'du concombre',
    answer: 'le concombre est une friandise légère et sans danger',
    short: 'Oui, en rondelles',
    summary:
      'Les rondelles de concombre nature conviennent aux chiens et ne sont presque que de l’eau ; les cornichons sont un autre aliment.',
    why: [
      'PetMD juge le concombre sûr et sain pour les chiens, et l’AKC sûr et peu calorique s’il est bien donné.',
      'Il est fait d’environ 96 % d’eau (AKC, PetMD), sans graisses et très pauvre en sodium (AKC), et apporte de la vitamine K, du potassium et du magnésium (PetMD). Avec 15 kcal pour 100 g selon l’USDA, c’est l’aliment le plus léger de toute la liste de ce site.',
    ],
    serve: [
      'Lavez le concombre et coupez des rondelles adaptées à la taille de votre chien, jamais un concombre entier (AKC). PetMD propose des rondelles de 2,5 cm de diamètre au plus et d’environ 6 mm d’épaisseur.',
      'Cru en friandise ou sur la gamelle, ou congelé dans un jouet avec des fruits qui conviennent aux chiens (PetMD).',
    ],
    never: [
      'Un concombre entier ou de gros morceaux, qui peuvent étouffer surtout les petits chiens ou boucher l’intestin (PetMD, AKC).',
      'Les cornichons et les concombres au vinaigre : selon PetMD, ils contiennent beaucoup de sel et des épices comme l’ail et l’oignon.',
    ],
    usdaName: 'de concombre cru avec la peau',
    piece: {
      a: 'une demi-tasse de rondelles de concombre',
      one: 'demi-tasse de rondelles',
      many: 'demi-tasses de rondelles',
      basis: 'USDA : ½ tasse (cup) de rondelles = 52 g',
    },
    sizeGuide: {
      note: 'Le tableau des portions de PetMD en rondelles, les catégories de poids converties en kilogrammes.',
      rows: [
        ['Très petit (1 à 9 kg)', '1 à 2 rondelles'],
        ['Petit (10 à 14 kg)', '2 à 3 rondelles'],
        ['Moyen (14 à 23 kg)', '5 à 6 rondelles'],
        ['Grand (23 à 41 kg)', 'Une poignée de rondelles'],
        ['Très grand (dès 41 kg)', 'Une grosse poignée'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger la peau du concombre ?',
        answer:
          'Oui : les sources donnent le concombre lavé, avec la peau, en rondelles. L’AKC compte environ 8 calories par demi-tasse de rondelles.',
      },
      {
        question: 'Le concombre est-il une bonne friandise pour un chien qui doit maigrir ?',
        answer:
          'Parmi les aliments de ce site, c’est celui qui a le moins de calories, et l’AKC le dit peu calorique. Le programme d’amaigrissement se décide quand même avec votre vétérinaire : le concombre compte aussi dans le budget friandises.',
      },
    ],
    sources: [],
  },
  {
    id: 'bell-peppers',
    name: 'Poivron',
    some: 'du poivron',
    answer: 'le poivron nature est sans danger',
    short: 'Oui, sans graines',
    summary:
      'Le poivron de toutes les couleurs convient aux chiens, épépiné et nature ; les piments forts, non.',
    why: [
      'La Dr Carly Fox, vétérinaire citée par l’AKC : le poivron n’est pas toxique et c’est un en-cas sain à partager avec votre chien. PetMD juge le poivron nature sans danger avec modération.',
      'Toutes les couleurs conviennent, et le poivron rouge a le plus de vitamines et d’antioxydants (AKC). Il apporte les vitamines A, C, E et B6, du bêta-carotène et de la lutéine (AKC), ainsi que des fibres (PetMD).',
    ],
    serve: [
      'Retirez les graines et le pédoncule, ce qui évite les troubles digestifs selon l’AKC.',
      'Cru et coupé petit, cuit à l’étouffée ou en purée, toujours nature : ni ail, ni oignon, ni sel, ni huile, ni beurre (PetMD, AKC). Cru, sa peau est difficile à mâcher (AKC).',
    ],
    never: [
      'Les piments forts : PetMD conseille de ne jamais donner à un chien de piment ni de plat relevé à la capsaïcine comme le piment en poudre ; l’AKC cite les jalapeños.',
      'Les poivrons farcis et les plats de poivrons à l’oignon ou à l’ail.',
    ],
    signs: ['Trop de poivron peut provoquer vomissements ou diarrhée (AKC) et des gaz (PetMD).'],
    usdaName: 'de poivron rouge cru',
    piece: {
      a: 'un anneau de poivron',
      one: 'anneau de poivron',
      many: 'anneaux de poivron',
      basis: 'USDA : 1 anneau (7,5 cm de diamètre, 6 mm d’épaisseur) = 10 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD par semaine, les catégories de poids converties en kilogrammes. L’AKC donne plutôt une limite par portion : moins d’un quart de poivron à la fois pour un petit chien, moins d’un demi pour un grand.',
      rows: [
        ['Très petit (1 à 5 kg)', '1 à 2 petits morceaux'],
        ['Petit (5 à 9 kg)', 'Moins de ¼ de poivron, coupé petit'],
        ['Moyen (10 à 23 kg)', '¼ de poivron, coupé petit'],
        ['Grand (23 à 41 kg)', '½ poivron, coupé petit'],
        ['Très grand (dès 41 kg)', '¾ de poivron, coupé petit'],
      ],
    },
    disagree: [
      'Les limites de l’AKC valent par portion, celles de PetMD par semaine. Pour un grand chien, l’AKC autorise donc presque un demi-poivron d’un coup, PetMD un demi-poivron dans la semaine.',
    ],
    questions: [
      {
        question: 'Mon chien peut-il manger du poivron vert ?',
        answer:
          'Oui. Selon l’AKC, toutes les couleurs sont sans danger ; le poivron rouge est seulement le plus mûr, avec le plus de vitamines et d’antioxydants.',
      },
      {
        question: 'Et le paprika en poudre ?',
        answer:
          'Les sources parlent du poivron frais et doux. Selon PetMD, un chien ne doit jamais recevoir d’épices à la capsaïcine comme le piment en poudre, et les plats épicés contiennent souvent de l’oignon ou de l’ail.',
      },
    ],
    sources: [],
  },
  {
    id: 'zucchini',
    name: 'Courgette',
    some: 'de la courgette',
    answer: 'la courgette nature est sans danger',
    short: 'Oui, nature',
    summary:
      'Crue ou cuite, la courgette nature convient aux chiens ; le gâteau à la courgette et la courgette frite, non.',
    why: [
      'L’AKC : la courgette est tout à fait sans danger pour les chiens. PetMD : crue ou cuite, la courgette nature est sûre et saine pour les chiens avec modération.',
      'Elle est pauvre en graisses et apporte des fibres, les vitamines A, C et B6, du potassium et de la lutéine (PetMD). L’AKC compte environ 20 calories par tasse (cup), crue.',
    ],
    serve: [
      'Lavez-la, retirez le pédoncule et coupez-la en dés (PetMD) ; en petits morceaux ou cuite à la vapeur, pour que votre chien ne s’étouffe pas (AKC).',
      'Mettez de côté une portion nature avant d’assaisonner le plat de la famille (AKC).',
    ],
    never: [
      'Le gâteau à la courgette et les autres pâtisseries, qui peuvent contenir du xylitol (E967) (AKC), et la courgette frite (PetMD).',
      'La courgette à l’huile, au sel, à l’ail ou à l’oignon (AKC).',
    ],
    usdaName: 'de courgette crue avec la peau',
    piece: {
      a: 'une rondelle de courgette',
      one: 'rondelle de courgette',
      many: 'rondelles de courgette',
      basis: 'USDA : 1 rondelle = 9,9 g',
    },
    sizeGuide: {
      note: 'Les quantités par jour de PetMD, les catégories de poids converties de livres en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '1 cuillère à café'],
        ['Petit (5 à 9 kg)', '2 cuillères à café'],
        ['Moyen (10 à 23 kg)', '3 cuillères à café'],
        ['Grand (23 à 41 kg)', '2 cuillères à soupe'],
        ['Très grand (dès 41 kg)', '3 cuillères à soupe'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger de la courgette crue ?',
        answer:
          'Oui, en petits morceaux : l’AKC dit la courgette nature sans danger crue, à la vapeur ou cuite, et coupée petit, votre chien ne s’étouffe pas avec.',
      },
      {
        question: 'Et le gâteau à la courgette ?',
        answer:
          'Non : comme les autres pâtisseries, il peut contenir du xylitol (E967), et l’AKC le met parmi ce qu’il ne faut pas donner. La courgette convient seulement nature.',
      },
    ],
    sources: [],
  },
  {
    id: 'potatoes',
    name: 'Pommes de terre',
    some: 'des pommes de terre',
    answer: 'cuites et nature, jamais vertes',
    short: 'Oui, mais cuites',
    summary:
      'Cuites et nature, les pommes de terre sont sans danger avec modération ; crues, vertes ou germées, elles contiennent de la solanine.',
    why: [
      'L’AKC et PetMD jugent tous deux les pommes de terre cuites et nature sans danger avec modération. L’AKC cite la Dr Patricia Kennedy : les pommes de terre cuites conviennent, mais pas avec beaucoup de beurre, qui peut déclencher une inflammation du pancréas (pancréatite).',
      'Le danger, c’est la solanine, une substance toxique des solanacées. L’AKC écrit que les pommes de terre vertes sont toxiques pour cette raison, et PetMD que les parties vertes et les germes contiennent de la solanine, qui peut causer vomissements, diarrhée, faiblesse et même des troubles nerveux.',
    ],
    serve: [
      'Cuites à l’eau, au four ou écrasées, sans beurre, sel ni épices (PetMD, AKC).',
      'Faites-les cuire jusqu’à ce qu’elles soient tendres ; la peau cuite convient tant qu’elle n’est pas verte (AKC).',
    ],
    never: [
      'Les pommes de terre crues, les pommes de terre vertes, la peau verte et les germes (AKC, PetMD).',
      'Les frites, les chips et la purée au beurre, à la crème, à l’ail ou à l’oignon.',
    ],
    signs: [
      'Dus à la solanine : vomissements, diarrhée, faiblesse et troubles nerveux (PetMD). Appelez votre vétérinaire si votre chien a mangé des pommes de terre crues ou vertes et montre l’un de ces signes.',
    ],
    usdaName: 'de pommes de terre cuites au four avec la peau, sans sel,',
    piece: {
      a: 'une pomme de terre moyenne cuite au four',
      one: 'pomme de terre moyenne',
      many: 'pommes de terre moyennes',
      basis: 'USDA : 1 pomme de terre moyenne = 173 g',
    },
    questions: [
      {
        question: 'Mon chien peut-il manger de la purée ?',
        answer:
          'De la purée nature, oui, en petite quantité (AKC). La purée au beurre, à la crème, à l’ail ou à l’oignon n’est pas pour les chiens : le gras peut déclencher une pancréatite, et l’ail et l’oignon sont toxiques.',
      },
      {
        question: 'Mon chien peut-il manger des pommes de terre crues ?',
        answer:
          'Non. L’AKC et PetMD ne donnent la pomme de terre que cuite ; les parties vertes et les germes contiennent de la solanine, qui peut causer vomissements, diarrhée et faiblesse (PetMD).',
      },
    ],
    sources: [],
  },
  {
    id: 'sweet-potatoes',
    name: 'Patate douce',
    some: 'de la patate douce',
    answer: 'la patate douce cuite est sans danger',
    short: 'Oui, cuite',
    summary:
      'Bien cuite et nature, la patate douce convient aux chiens avec modération, mais jamais crue.',
    why: [
      'PetMD écrit que la patate douce est sans danger si elle est bien cuite, nature et donnée avec modération ; l’AKC dit oui, avec prudence.',
      'Elle apporte des fibres, du bêta-carotène, les vitamines A, B6 et C, du potassium et du calcium (AKC, PetMD). L’AKC cite la Dr Rachel Barrack : trop de patate douce peut, par excès de vitamine A, fragiliser les os et les muscles.',
    ],
    serve: [
      'Lavez-la et épluchez-la, puis faites-la cuire à la vapeur, à l’eau, au four ou au micro-ondes jusqu’à ce qu’elle soit tendre, et écrasez-la ou coupez-la en petits morceaux (PetMD).',
      'Donnez-la nature, sans beurre, sucre ni guimauves.',
    ],
    never: [
      'La patate douce crue : difficile à mâcher et à digérer, et un risque d’étouffement (PetMD, AKC).',
      'La peau, qui n’est pas toxique selon PetMD, mais difficile à digérer et qui peut boucher l’intestin.',
    ],
    usdaName: 'de patate douce cuite au four dans sa peau, sans sel',
    piece: {
      a: 'une cuillère à soupe de patate douce',
      one: 'cuillère à soupe',
      many: 'cuillères à soupe',
      basis: 'un seizième de la tasse (cup) USDA de 200 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, deux à trois fois par semaine, les catégories de poids converties de livres en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '1 cuillère à soupe'],
        ['Petit (5 à 9 kg)', '1 à 2 cuillères à soupe'],
        ['Moyen (10 à 23 kg)', '2 à 3 cuillères à soupe'],
        ['Grand (23 à 41 kg)', '3 cuillères à soupe'],
        ['Très grand (dès 41 kg)', '4 cuillères à soupe'],
      ],
    },
    disagree: [
      'Le vétérinaire de l’AKC écrit que la patate douce a un index glycémique élevé et appelle à la prudence chez les chiens diabétiques ; PetMD juge son index glycémique relativement bas. Pour un chien diabétique, demandez à votre vétérinaire.',
    ],
    questions: [
      {
        question: 'La patate douce est-elle meilleure pour le chien que la pomme de terre ?',
        answer:
          'Les deux sont sans danger cuites et nature. La vraie différence tient à ce qui ne va jamais dans la gamelle : les pommes de terre vertes ou crues contiennent de la solanine (AKC, PetMD), et la patate douce crue présente un risque d’étouffement.',
      },
      {
        question: 'Mon chien peut-il manger la patate douce avec la peau ?',
        answer:
          'Mieux vaut l’éplucher : PetMD dit la peau non toxique, mais difficile à digérer, et elle peut boucher l’intestin.',
      },
    ],
    sources: [],
  },
  {
    id: 'pumpkin',
    name: 'Citrouille',
    some: 'de la citrouille',
    answer: 'la citrouille nature est sans danger',
    short: 'Oui, nature',
    summary:
      'La citrouille cuite nature ou la purée de citrouille en conserve sans rien d’autre conviennent aux chiens ; la garniture de tarte à la citrouille, non.',
    why: [
      'PetMD écrit qu’un chien peut manger sans danger de la citrouille cuite nature et de la citrouille en conserve (100 % citrouille, sans ajouts), et l’AKC juge la citrouille en conserve nature le choix le plus sain.',
      'Elle est riche en fibres, et ses fibres solubles agissent comme un prébiotique selon l’AKC. En cas de diarrhée légère, l’AKC propose 1 à 4 cuillères à soupe de citrouille au repas, en commençant par peu.',
    ],
    serve: [
      'De la citrouille en conserve sans sel, épices ni sucre (AKC), ou de la citrouille cuite nature (PetMD).',
      'Mélangez une cuillerée au repas plutôt que d’en donner un bol entier.',
    ],
    never: [
      'La garniture de tarte à la citrouille ou les préparations toutes prêtes : selon PetMD, elles peuvent contenir du sucre, de la muscade et des clous de girofle, dangereux pour les chiens, et parfois du xylitol (E967).',
      'La citrouille crue, l’écorce et la tige, difficiles à digérer (PetMD).',
    ],
    signs: [
      'La citrouille est prévue pour une diarrhée légère et sans gravité (AKC). L’AKC conseille d’appeler tout de suite votre vétérinaire en cas d’abattement, de fièvre, de vomissements ou de faiblesse, ou de diarrhée sanglante ou qui dure, surtout chez un chiot.',
    ],
    usdaName: 'de citrouille en conserve sans sel',
    piece: {
      a: 'une cuillère à soupe de purée de citrouille',
      one: 'cuillère à soupe',
      many: 'cuillères à soupe',
      basis: 'un seizième de la tasse (cup) USDA de 245 g',
    },
    questions: [
      {
        question:
          'La garniture de tarte à la citrouille, est-ce la même chose que la citrouille en conserve ?',
        answer:
          'Non. La boîte doit indiquer 100 % citrouille. La garniture de tarte est sucrée et épicée, et selon PetMD elle peut contenir de la muscade, des clous de girofle et du xylitol (E967).',
      },
      {
        question: 'La citrouille aide-t-elle en cas de diarrhée ?',
        answer:
          'En cas de diarrhée légère, l’AKC propose 1 à 4 cuillères à soupe de citrouille au repas, en commençant par peu. En cas d’abattement, de fièvre, de vomissements, de faiblesse ou de diarrhée sanglante ou qui dure, appelez tout de suite votre vétérinaire (AKC).',
      },
    ],
    sources: [],
  },
];
