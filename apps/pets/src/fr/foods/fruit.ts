import { SOURCES_DE } from '../../de/foods/sources.ts';
import type { FoodFr } from './types.ts';

/** The fruit of the French pages, in the order of the route table. */
export const FRUIT_FR: readonly FoodFr[] = [
  {
    id: 'strawberries',
    name: 'Fraises',
    some: 'des fraises',
    answer: 'les fraises fraîches sont une friandise sans danger',
    short: 'Oui, avec modération',
    summary:
      'La plupart des chiens supportent bien les fraises fraîches et nature en petite quantité ; l’ASPCA classe la plante comme non toxique.',
    why: [
      'Sur la liste des plantes de l’ASPCA, le fraisier (Fragaria) est non toxique pour les chiens. L’American Kennel Club (AKC) répond « oui, avec modération », et PetMD écrit que la plupart des chiens peuvent en manger sans danger si elles sont bien préparées.',
      'Les fraises apportent des fibres et de la vitamine C, et selon PetMD des vitamines B, de la vitamine K, du magnésium et du potassium. Elles contiennent aussi du sucre : pour un chien diabétique, en surpoids ou sensible au sucre, ce n’est pas une bonne friandise selon PetMD.',
    ],
    serve: [
      'Lavez soigneusement les fraises et retirez la queue et les feuilles (AKC, PetMD).',
      'Coupez-les en tranches d’environ 6 mm, comme le conseille PetMD pour éviter l’étouffement ; l’AKC recommande de petits morceaux et, en été, des fraises congelées.',
      'Pas de fraises en conserve ni au sirop : selon l’AKC, elles contiennent trop de sucre, et certaines du xylitol (E967).',
    ],
    never: [
      'Les feuilles vertes : pas toxiques, mais mauvaises pour l’estomac selon l’AKC et un risque d’étouffement selon PetMD.',
      'Les desserts à la fraise, la confiture et les produits à la fraise sans sucre, qui peuvent contenir du xylitol.',
    ],
    usdaName: 'de fraises crues',
    piece: {
      a: 'une fraise moyenne',
      one: 'fraise moyenne',
      many: 'fraises moyennes',
      basis: 'USDA : 1 fraise moyenne (3 cm de diamètre) = 12 g',
    },
    sizeGuide: {
      note: 'Le tableau des portions de PetMD en tranches, les catégories de poids converties de livres en kilogrammes. L’AKC considère une à trois fraises par jour comme un début raisonnable pour la plupart des chiens.',
      rows: [
        ['Très petit (1 à 9 kg)', '1 à 2 tranches'],
        ['Petit (10 à 14 kg)', '2 à 3 tranches'],
        ['Moyen (14 à 23 kg)', '5 à 6 tranches'],
        ['Grand (23 à 41 kg)', 'Une poignée de tranches'],
        ['Très grand (plus de 41 kg)', 'Une grosse poignée de tranches'],
      ],
    },
    questions: [
      {
        question: 'Mon chiot peut-il manger des fraises ?',
        answer:
          'Les sources ne donnent pas de règle propre aux chiots. L’AKC conseille d’en parler à votre vétérinaire avant les premières fraises, surtout en cas de diabète, de problème de poids ou d’estomac sensible. Pour un chiot, la même prudence s’impose : une petite tranche, puis on observe.',
      },
      {
        question: 'Combien de fraises mon chien peut-il manger par jour ?',
        answer:
          'Le budget friandises du tableau ci-dessus est le plafond de toutes les friandises réunies. Les quantités de PetMD et de l’AKC sont bien en dessous : une à trois fraises ou quelques tranches, selon la taille.',
      },
    ],
    sources: [],
  },
  {
    id: 'bananas',
    name: 'Banane',
    some: 'de la banane',
    answer: 'épluchée, et seulement de temps en temps',
    short: 'Oui, mais peu',
    summary:
      'La banane épluchée en petits morceaux est sans danger, mais selon PetMD elle contient plus de sucre que bien des friandises pour chiens.',
    why: [
      'L’ASPCA classe le bananier comme non toxique pour les chiens. PetMD écrit que les chiens peuvent manger de la banane sans danger avec modération ; l’AKC la conseille en complément occasionnel, pas en en-cas quotidien.',
      'Le problème, c’est le sucre. Selon PetMD, la banane contient plus de sucre que bien des friandises pour chiens, et en trop grande quantité elle apporte selon l’AKC des calories en plus et peut dérégler l’estomac. Un chien en surpoids ou diabétique ne devrait en recevoir qu’avec l’accord de votre vétérinaire (PetMD).',
      'Elle apporte en revanche du potassium, de la vitamine B6, de la vitamine C, des fibres et du magnésium (AKC), ainsi que de la biotine (PetMD).',
    ],
    serve: [
      'Épluchez entièrement la banane et coupez des rondelles d’environ 6 mm (PetMD) ou des bouchées (AKC).',
      'Fraîche, écrasée dans la gamelle ou congelée dans un jouet distributeur (AKC, PetMD).',
    ],
    never: [
      'La peau. Selon l’AKC, elle n’est pas toxique, mais elle se digère mal et peut boucher l’intestin ; PetMD est du même avis.',
    ],
    usdaName: 'de bananes crues',
    piece: {
      a: 'une banane moyenne',
      one: 'banane moyenne',
      many: 'bananes moyennes',
      basis: 'USDA : 1 banane moyenne (18 à 20 cm de long) = 118 g',
    },
    sizeGuide: {
      note: 'Les quantités quotidiennes de PetMD selon la taille, les catégories de poids converties en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '1 à 2 rondelles'],
        ['Petit (5 à 9 kg)', '2 à 3 rondelles'],
        ['Moyen (10 à 23 kg)', '3 à 6 rondelles'],
        ['Grand (23 à 41 kg)', 'Une poignée de rondelles'],
        ['Très grand (plus de 41 kg)', 'Jusqu’à une demi-banane'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger de la banane tous les jours ?',
        answer:
          'Le tableau de PetMD donne des quantités par jour, d’une ou deux rondelles pour les plus petits chiens jusqu’à une demi-banane pour les plus grands. À cause du sucre, l’AKC voit plutôt la banane comme un complément occasionnel que comme un en-cas quotidien.',
      },
      {
        question: 'La banane aide-t-elle contre la diarrhée ?',
        answer:
          'Aucune des sources de cette page ne recommande la banane contre la diarrhée. L’AKC prévient au contraire que trop de banane peut dérégler l’estomac. Un chien qui a la diarrhée a besoin de son vétérinaire, pas de la corbeille de fruits.',
      },
    ],
    sources: [],
  },
  {
    id: 'grapes',
    name: 'Raisin',
    some: 'du raisin',
    answer: 'le raisin est toxique pour les chiens',
    short: 'Non, toxique',
    summary:
      'Le raisin, quelle que soit sa couleur, peut provoquer une insuffisance rénale chez le chien, et aucune source ne donne de quantité sûre.',
    why: [
      'Le Merck Veterinary Manual associe le raisin, les raisins secs et les raisins de Corinthe à une insuffisance rénale chez le chien. CliniTox, la base de données toxicologique de la faculté Vetsuisse de Zurich, décrit la même insuffisance rénale aiguë, mortelle sans traitement ; la clinique des petits animaux de l’université de Berne écrit qu’environ 55 % des chiens touchés survivent à l’intoxication.',
      'La substance en cause n’est pas établie avec certitude. L’ASPCA et Merck soupçonnent l’acide tartrique, abondant dans le fruit et que les chiens éliminent moins bien que d’autres animaux. En 2022, Wegenast et ses collègues ont décrit six chiens atteints de lésions rénales après de la crème de tartre ou du tamarin, tous deux riches en acide tartrique. L’AKC cite au contraire la vétérinaire urgentiste Jessica Dowling : la substance exacte resterait inconnue.',
      'Selon VCA, le risque vaut pour le raisin avec ou sans pépins, rouge ou blanc, bio ou non. Le jus de raisin, le vin et l’extrait de pépins de raisin ne semblent pas, selon VCA, provoquer la même intoxication.',
    ],
    serve: [
      'Appelez tout de suite votre vétérinaire ou un vétérinaire de garde, même après un seul grain et même si votre chien semble aller bien (PetMD, VCA).',
      'Ne le faites pas vomir vous-même, par exemple avec de l’eau oxygénée (AKC). Pour un chien qui semble encore en bonne santé, Merck décrit une décontamination rapide par le vétérinaire, suivie d’au moins 48 heures de perfusion.',
      'Comptez ce qui manque et notez l’heure : au téléphone, on vous demandera d’abord combien de grains, le poids du chien et depuis combien de temps.',
    ],
    never: [
      'Le raisin frais de toute variété et ses formes séchées : raisins secs, raisins de Smyrne et raisins de Corinthe.',
      'Les gâteaux, cakes, mueslis et mélanges de fruits secs qui en contiennent. L’université de médecine vétérinaire de Vienne cite expressément le raisin et les raisins secs parmi les dangers des fêtes pour les chiens.',
    ],
    signs: [
      'Merck et l’AKC : vomissements ou diarrhée dans les 6 à 12 heures, puis, dans les 24 à 72 heures, une insuffisance rénale où le chien n’urine presque plus ou plus du tout. CliniTox cite vomissements, diarrhée, abattement et perte d’appétit dans les 24 heures, et l’insuffisance rénale dans les 24 à 72 heures.',
      'Surveillez aussi la faiblesse, les douleurs abdominales, une soif intense et les tremblements (Merck, AKC, PetMD).',
    ],
    disagree: [
      'Sur la quantité, les sources sont très éloignées. Merck fixe la limite à plus d’un grain de raisin ou d’un raisin sec pour 10 livres (4,5 kg) de poids. CliniTox donne une dose toxique de 10 à 30 g de raisin par kg, l’université de Berne décrit une insuffisance rénale à partir de 20 g de raisin frais par kg, et toutes deux soulignent de grandes différences d’un chien à l’autre. VCA dit qu’il n’existe pas de dose toxique établie, et PetMD qu’il n’existe pas de nombre sûr.',
      'Sur le délai, les premiers signes apparaissent en quelques heures selon PetMD, après 6 à 12 heures selon Merck et l’AKC, après 12 à 24 heures selon VCA et dans les 24 heures selon CliniTox.',
    ],
    usdaName: 'de raisin cru',
    piece: {
      a: 'un grain de raisin',
      one: 'grain de raisin',
      many: 'grains de raisin',
      basis: 'USDA : 10 grains de raisin = 49 g',
    },
    thresholds: [
      {
        label: 'Merck : au-delà, les reins peuvent être atteints',
        lead: 'la limite que Merck fixe à un grain de raisin pour 10 livres (4,5 kg)',
      },
    ],
    thresholdNote:
      'Le nombre ci-dessous est la limite de Merck, un grain pour 10 livres (4,5 kg) de poids, calculée pour quatre poids. C’est la valeur la plus basse des sources, pas une quantité sûre : selon VCA, certains chiens réagissent à moins, et la teneur en acide tartrique du raisin varie (Merck). Appelez quelle que soit la quantité.',
    questions: [
      {
        question: 'Mon chien a mangé un grain de raisin. Que faire ?',
        answer:
          'Appelez votre vétérinaire. PetMD le conseille même pour un seul grain, faute de nombre sûr connu, et un petit chien est déjà proche de la limite de Merck avec un seul grain.',
      },
      {
        question: 'Le raisin blanc est-il moins dangereux que le raisin noir ?',
        answer:
          'Non. Selon VCA, le risque est le même pour le raisin blanc ou rouge, avec ou sans pépins, acheté ou cueilli au jardin.',
      },
    ],
    sources: [SOURCES_DE.clinitoxVitis, SOURCES_DE.bernGrapes, SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'raisins',
    name: 'Raisins secs',
    some: 'des raisins secs',
    answer: 'les raisins secs sont toxiques pour les chiens',
    short: 'Non, même peu',
    summary:
      'Les raisins secs, de Smyrne ou de Corinthe peuvent provoquer une insuffisance rénale chez le chien, même en petite quantité.',
    why: [
      'Les raisins secs sont du raisin séché. Merck cite ensemble raisins secs, raisin frais et raisins de Corinthe comme les fruits associés à une insuffisance rénale chez le chien ; l’ASPCA soupçonne l’acide tartrique. CliniTox, la base de données toxicologique de la faculté Vetsuisse de Zurich, décrit une insuffisance rénale aiguë, mortelle sans traitement.',
      'Le séchage concentre le fruit. PetMD écrit que les raisins secs sont, à strictement parler, plus dangereux que le raisin frais, parce que la substance toxique y est plus concentrée ; l’AKC les juge tout aussi dangereux. Un raisin sec pèse environ un dixième d’un grain de raisin : une petite poignée, c’est donc beaucoup de raisins secs.',
      'L’association vétérinaire caritative britannique PDSA écrit que la quantité toxique varie d’un chien à l’autre et peut, dans certains cas, être très faible.',
    ],
    serve: [
      'Appelez tout de suite votre vétérinaire ou un vétérinaire de garde. PDSA : contactez immédiatement le vétérinaire, sans attendre de voir apparaître des signes.',
      'Gardez l’emballage sous la main : la quantité mangée, en grammes ou en nombre, et le poids de votre chien sont ce que le vétérinaire doit savoir.',
      'Ne le faites pas vomir, sauf si le vétérinaire vous le demande.',
    ],
    never: [
      'Les raisins secs, de Smyrne et de Corinthe, nature, dans les mélanges de fruits secs ou dans le muesli.',
      'Le cake aux fruits, les brioches et petits pains aux raisins, les biscuits et le chocolat aux raisins (PDSA). L’université de médecine vétérinaire de Vienne cite expressément les raisins secs parmi les dangers des fêtes pour les chiens.',
    ],
    signs: [
      'PDSA : les signes peuvent commencer quelques heures après l’ingestion, avec vomissements, diarrhée, douleurs abdominales, abattement et perte d’appétit ; une insuffisance rénale peut suivre en un à trois jours.',
      'Merck indique 6 à 12 heures pour les vomissements ou la diarrhée et 24 à 72 heures pour l’insuffisance rénale, avec parmi les signes la soif, la déshydratation et les tremblements. CliniTox décrit vomissements, diarrhée, abattement et perte d’appétit dans les 24 heures, et l’insuffisance rénale dans les 24 à 72 heures.',
    ],
    disagree: [
      'Merck fixe la limite à plus d’un raisin sec pour 10 livres (4,5 kg) de poids. CliniTox donne une dose toxique d’environ 3 g de raisins secs par kg de poids, et la clinique des petits animaux de l’université de Berne décrit une insuffisance rénale à partir de 3 g de raisins secs par kg ; toutes deux soulignent de grandes différences d’un chien à l’autre. VCA dit qu’il n’existe pas de dose toxique établie, et PDSA qu’elle peut être très faible.',
      'Pour les raisins de Corinthe, Merck et VCA excluent les vraies groseilles et le cassis (genre Ribes) et mettent en garde contre les raisins de Corinthe séchés ; PDSA cite les « currants » sans faire cette distinction.',
    ],
    usdaName: 'de raisins secs noirs sans pépins',
    piece: {
      a: 'un raisin sec',
      one: 'raisin sec',
      many: 'raisins secs',
      basis: 'USDA : 50 raisins secs = 26 g',
    },
    thresholds: [
      {
        label: 'Merck : au-delà, les reins peuvent être atteints',
        lead: 'la limite que Merck fixe à un raisin sec pour 10 livres (4,5 kg)',
      },
    ],
    thresholdNote:
      'La limite de Merck, un raisin sec pour 10 livres (4,5 kg) de poids, calculée pour quatre poids. Une mini-boîte de raisins secs de l’USDA contient 14 g, soit environ 27 raisins secs : plus que la limite pour tous les chiens du tableau. Cette limite n’est pas une quantité sûre : appelez quelle que soit la quantité de raisins secs.',
    questions: [
      {
        question: 'Mon chien a mangé un biscuit aux raisins secs. Est-ce une urgence ?',
        answer:
          'Traitez-le comme une urgence et appelez votre vétérinaire ou un vétérinaire de garde : PDSA cite les biscuits, les gâteaux et les petits pains parmi les aliments qui contiennent des raisins secs, et pour un petit chien quelques raisins secs dépassent déjà la limite de Merck.',
      },
      {
        question: 'Mon chien peut-il manger des raisins de Smyrne ?',
        answer:
          'Non. Les raisins de Smyrne sont du raisin séché, et PDSA classe raisin, raisins secs, raisins de Corinthe et raisins de Smyrne comme potentiellement toxiques pour les chiens.',
      },
      {
        question: 'Mon chien peut-il manger des raisins de Corinthe ?',
        answer:
          'Non. Les raisins de Corinthe sont de petits raisins séchés, et Merck et VCA les jugent aussi dangereux que les raisins secs. Les vraies groseilles et le cassis (genre Ribes) n’ont pas été associés à des lésions rénales selon Merck et VCA. PDSA ne fait pas la distinction : traitez chaque raisin de Corinthe séché comme un raisin sec.',
      },
    ],
    sources: [SOURCES_DE.clinitoxVitis, SOURCES_DE.bernGrapes, SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'blueberries',
    name: 'Myrtilles',
    some: 'des myrtilles',
    answer: 'les myrtilles sont une petite friandise sans danger',
    short: 'Oui, quelques-unes',
    summary:
      'La plupart des chiens supportent les myrtilles fraîches ou congelées, nature, quelques-unes à la fois ; pas les muffins ni les baies sucrées.',
    why: [
      'L’AKC écrit que les chiens peuvent manger des myrtilles avec modération, et PetMD que la plupart des chiens les supportent nature.',
      'Elles regorgent d’antioxydants et de composés végétaux, avec des fibres et de la vitamine C (PetMD, AKC). Et ce sont parmi les plus petits fruits qu’un chien puisse recevoir : environ 1,4 g par baie d’après les poids de l’USDA.',
    ],
    serve: [
      'Lavez les baies à l’eau froide et retirez les tiges (PetMD).',
      'Fraîches ou congelées (AKC). Pour un très petit chien, coupez-les en deux ou écrasez-les pour éviter qu’il ne s’étouffe (AKC, PetMD).',
      'Nature uniquement : PetMD déconseille les baies en conserve, sucrées, au sirop ou aromatisées.',
    ],
    never: ['Les muffins, gâteaux et confitures aux myrtilles (PetMD).'],
    usdaName: 'de myrtilles crues',
    piece: {
      a: 'une myrtille',
      one: 'myrtille',
      many: 'myrtilles',
      basis: 'USDA : 50 baies = 68 g',
    },
    sizeGuide: {
      note: 'Les quantités quotidiennes de PetMD en baies, les catégories de poids converties en kilogrammes. L’AKC indique deux à trois baies pour un petit chien et quelques-unes de plus pour un plus grand.',
      rows: [
        ['Très petit (1 à 5 kg)', '1 à 2 myrtilles'],
        ['Petit (5 à 9 kg)', '2 à 3 myrtilles'],
        ['Moyen (10 à 23 kg)', '3 à 5 myrtilles'],
        ['Grand (23 à 41 kg)', '5 à 6 myrtilles'],
        ['Très grand (plus de 41 kg)', '6 à 10 myrtilles'],
      ],
    },
    questions: [
      {
        question:
          'Pourquoi les tableaux donnent-ils si peu de baies, alors que le budget de calories en permet plus ?',
        answer:
          'Le budget friandises est un plafond pour toutes les friandises réunies, pas un objectif pour un seul fruit. Les quantités de PetMD laissent de la place aux autres friandises de la journée et à un estomac qui n’a pas l’habitude des fruits.',
      },
      {
        question: 'Myrtilles et bleuets, est-ce la même chose ?',
        answer:
          'Dans le commerce, oui : la plupart des myrtilles vendues en supermarché sont des myrtilles cultivées, appelées bleuets au Québec. Les sources de cette page parlent des « blueberries », fraîches ou congelées et nature.',
      },
    ],
    sources: [],
  },
  {
    id: 'apples',
    name: 'Pommes',
    some: 'des pommes',
    answer: 'des morceaux de pomme oui, mais sans le trognon',
    short: 'Oui, sans pépins',
    summary:
      'Des morceaux de pomme épépinés sont une friandise sans danger ; les pépins, le trognon et la queue n’ont rien à faire dans la gamelle.',
    why: [
      'L’AKC qualifie la pomme de friandise sûre et saine avec modération, et PetMD écrit que les chiens peuvent en manger sans danger une fois les pépins, le trognon et la queue retirés.',
      'Sur la liste des plantes de l’ASPCA, le pommier figure comme toxique pour les chiens, avec la raison : les tiges, les feuilles et les pépins contiennent des glycosides cyanogènes, qui libèrent du cyanure. La chair est la partie que mangent les humains et les chiens.',
      'Elle apporte de la vitamine C, de la vitamine A, du potassium et des fibres (AKC) et elle est pauvre en graisses (PetMD).',
    ],
    serve: [
      'Lavez la pomme et retirez le trognon, les pépins et la queue (AKC, PetMD).',
      'Coupez des quartiers ou des dés ; PetMD propose des morceaux d’environ 2,5 cm de large et 6 mm d’épaisseur. Épluchée, elle passe mieux pour un estomac sensible (AKC, PetMD).',
      'Selon l’AKC, un ou deux quartiers de pomme suffisent à contenter un chien.',
    ],
    never: [
      'Les pépins, qui contiennent un peu de cyanure (AKC, PetMD), le trognon, qui peut étouffer un chien ou boucher l’intestin, et la queue.',
      'La tarte aux pommes, la compote sucrée et les produits à la pomme contenant du xylitol (E967).',
    ],
    signs: [
      'Trop de pomme peut dérégler l’estomac (AKC, PetMD). Pour le cyanure des pépins, des tiges et des feuilles, l’ASPCA cite des gencives rouge brique, des pupilles dilatées, des difficultés à respirer, un halètement et un état de choc : appelez tout de suite votre vétérinaire si vous voyez cela.',
    ],
    usdaName: 'de pommes crues avec la peau',
    piece: {
      a: 'une tasse de tranches de pomme',
      one: 'tasse de tranches de pomme',
      many: 'tasses de tranches de pomme',
      basis: 'USDA : 1 tasse (cup) de tranches = 109 g',
    },
    sizeGuide: {
      note: 'Les quantités quotidiennes de PetMD en morceaux d’environ 2,5 cm sur 6 mm, les catégories de poids converties en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '1 à 2 morceaux'],
        ['Petit (5 à 9 kg)', '2 à 3 morceaux'],
        ['Moyen (10 à 23 kg)', '3 à 4 morceaux'],
        ['Grand (23 à 41 kg)', '4 à 5 morceaux'],
        ['Très grand (plus de 41 kg)', '5 à 6 morceaux'],
      ],
    },
    questions: [
      {
        question: 'Mon chien a mangé un trognon de pomme. Est-ce dangereux ?',
        answer:
          'Un trognon présente surtout un risque d’étouffement et d’occlusion intestinale (AKC, PetMD) ; ses quelques pépins ne contiennent qu’un peu de cyanure, qui selon l’AKC ne nuit qu’en grande quantité. Surveillez les vomissements, un ventre dur ou un chien qui ne mange plus, et appelez alors votre vétérinaire.',
      },
      {
        question: 'Mon chien peut-il manger de la compote de pommes ?',
        answer:
          'Les sources parlent de chair fraîche. La compote sucrée apporte du sucre en plus, et les produits contenant du xylitol sont toxiques pour les chiens : lisez la liste des ingrédients.',
      },
    ],
    sources: [],
  },
  {
    id: 'watermelon',
    name: 'Pastèque',
    some: 'de la pastèque',
    answer: 'la chair sans pépins est sans danger',
    short: 'Oui, sans l’écorce',
    summary:
      'La pastèque sans écorce ni pépins est sans danger et faite presque uniquement d’eau ; l’écorce peut boucher l’intestin.',
    why: [
      'PetMD écrit que la plupart des chiens peuvent manger de la pastèque nature et bien préparée sans danger ; l’AKC en fait une friandise rafraîchissante qui hydrate, si elle est donnée en sécurité et avec modération.',
      'Elle est composée d’environ 92 % d’eau (AKC), avec des vitamines A, B6 et C et du potassium, et c’est selon les chiffres de l’USDA l’un des fruits les plus légers de cette liste : 30 kcal pour 100 g.',
    ],
    serve: [
      'Lavez la pastèque, détachez entièrement la chair de l’écorce et retirez les pépins (AKC, PetMD).',
      'PetMD propose des morceaux d’environ 2,5 × 2,5 cm et 6 mm d’épaisseur ; l’AKC quelques bouchées en friandise occasionnelle.',
      'Des cubes congelés ou une purée avec un yaourt nature sans xylitol font une friandise d’été (AKC).',
    ],
    never: [
      'L’écorce : selon PetMD, un chien peut s’étouffer avec, ou elle peut boucher l’intestin ; l’AKC cite en plus vomissements, diarrhée et maux d’estomac.',
      'Les pépins : un risque d’étouffement et d’occlusion intestinale (AKC) ; PetMD mentionne des traces de cyanure, mais juge une intoxication très improbable.',
    ],
    usdaName: 'de pastèque crue',
    piece: {
      a: 'une tasse de dés de pastèque',
      one: 'tasse de dés de pastèque',
      many: 'tasses de dés de pastèque',
      basis: 'USDA : 1 tasse (cup) de dés = 152 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, deux à trois fois par semaine, en morceaux d’environ 2,5 × 2,5 cm et 6 mm d’épaisseur ; les catégories de poids converties en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '2 à 3 morceaux'],
        ['Petit (5 à 9 kg)', '3 à 4 morceaux'],
        ['Moyen (10 à 23 kg)', '3 à 4 morceaux'],
        ['Grand (23 à 41 kg)', '4 à 5 morceaux'],
        ['Très grand (plus de 41 kg)', '5 à 6 morceaux'],
      ],
    },
    disagree: [
      'L’AKC compte environ 50 calories par tasse de pastèque ; selon les chiffres de l’USDA, une tasse de dés en apporte environ 46 kcal (152 g à 30 kcal pour 100 g). Cette page calcule avec l’USDA.',
    ],
    questions: [
      {
        question: 'La pastèque convient-elle à un chien diabétique ?',
        answer:
          'PetMD conseille de ne pas en donner aux chiens diabétiques ou en surpoids. Demandez d’abord à votre vétérinaire.',
      },
      {
        question: 'Mon chien a mangé un morceau d’écorce de pastèque. Que faire ?',
        answer:
          'L’écorce n’est pas toxique, mais elle se digère mal et peut boucher l’intestin (PetMD, AKC). Surveillez votre chien : en cas de vomissements, de douleurs abdominales ou s’il ne mange plus, appelez votre vétérinaire.',
      },
    ],
    sources: [],
  },
  {
    id: 'cherries',
    name: 'Cerises',
    some: 'des cerises',
    answer: 'les noyaux libèrent du cyanure',
    short: 'Mieux vaut éviter',
    summary:
      'Les noyaux, les queues et les feuilles de la cerise libèrent du cyanure, et les noyaux peuvent boucher l’intestin.',
    why: [
      'L’AKC déconseille les cerises : un peu de chair ne pose pas de problème, mais les noyaux, les queues et les feuilles contiennent du cyanure, et les noyaux peuvent obstruer le tube digestif.',
      'Sur la liste des plantes de l’ASPCA, le cerisier (Prunus) figure comme toxique pour les chiens pour la même raison : les tiges, les feuilles et les noyaux contiennent des glycosides cyanogènes. PetMD nomme la substance : l’amygdaline, que l’organisme transforme en cyanure.',
      'Les cerises à cocktail (marasquin) ne valent pas mieux : l’AKC et PetMD signalent leur sucre ajouté et leurs conservateurs.',
    ],
    serve: [
      'Si votre chien a mangé une ou deux cerises avec leur noyau, surveillez-le et appelez votre vétérinaire s’il en a mangé plusieurs ou s’il montre le moindre signe (AKC). Le vétérinaire peut décider de le faire vomir.',
      'Appelez tout de suite s’il a croqué des noyaux, des queues ou des feuilles ou s’il montre des signes d’intoxication (PetMD) ; en dehors des heures d’ouverture, un vétérinaire de garde.',
    ],
    never: [
      'Les noyaux, les queues et les feuilles de toute cerise, et les cerises entières qu’un chien peut avaler avec leur noyau.',
      'Les cerises à cocktail et les desserts aux cerises.',
    ],
    signs: [
      'Le cyanure : difficultés à respirer, gencives rouge vif et pupilles dilatées (AKC), halètement, salivation, vomissements, tremblements, convulsions et effondrement (PetMD). Le nombre de noyaux en cause dépend selon PetMD de la taille du chien et du fait qu’il les ait croqués ou non.',
      'Un intestin bouché : vomissements, un chien qui ne mange plus, constipation ou peu de selles (AKC).',
    ],
    disagree: [
      'PetMD écrit que les chiens peuvent manger des cerises fraîches sans noyau, sans queue et sans feuilles, et donne un tableau allant d’une cerise pour un chien de 1 à 5 kg à cinq pour un chien de plus de 41 kg, deux à trois fois par semaine. L’AKC déconseille les cerises et recommande des fruits plus sûrs. Cette page suit l’AKC et l’ASPCA ; toutes les sources s’accordent sur le fait que le noyau, les queues et les feuilles sont le danger.',
    ],
    usdaName: 'de cerises douces crues',
    piece: {
      a: 'une cerise',
      one: 'cerise',
      many: 'cerises',
      basis: 'USDA : 1 cerise = 8,2 g',
    },
    questions: [
      {
        question: 'Mon chien a avalé un noyau de cerise. Que faire ?',
        answer:
          'Un seul noyau avalé est surtout un risque d’occlusion intestinale, plus pour un petit chien que pour un grand. Surveillez les vomissements, la constipation ou un chien qui ne mange plus, et appelez votre vétérinaire s’il a mangé plusieurs cerises ou croqué les noyaux (AKC, PetMD).',
      },
      {
        question: 'Mon chien peut-il manger des cerises dénoyautées ?',
        answer:
          'Un peu de chair sans noyau, sans queue et sans feuilles ne pose pas de problème selon l’AKC, et PetMD l’autorise deux à trois fois par semaine. L’AKC conseille malgré tout des fruits plus sûrs.',
      },
    ],
    sources: [],
  },
  {
    id: 'mango',
    name: 'Mangue',
    some: 'de la mangue',
    answer: 'épluchée et sans le noyau',
    short: 'Oui, sans noyau',
    summary:
      'La mangue mûre, épluchée et sans noyau est sans danger en petits morceaux, mais elle est sucrée, et le noyau est dangereux.',
    why: [
      'L’AKC écrit que les chiens peuvent manger de la mangue si elle est bien préparée ; PetMD autorise de petites quantités de chair mûre en friandise occasionnelle.',
      'La mangue apporte des fibres et des vitamines A, B6, C et E (AKC). Deux choses invitent à la prudence : son sucre et ses fibres, qui peuvent dérégler l’estomac ; selon PetMD, un chien diabétique devrait s’en passer.',
    ],
    serve: [
      'Lavez et épluchez la mangue, puis détachez la chair du noyau (AKC, PetMD).',
      'De petites bouchées, et peu au début (PetMD).',
    ],
    never: [
      'Le noyau : pour l’AKC, un sérieux risque d’étouffement, avec de petites quantités de cyanure ; PetMD cite en plus le risque d’occlusion intestinale.',
      'La peau, difficile à digérer selon les deux sources.',
    ],
    signs: [
      'Trop de fruits peut donner des maux de ventre et de la diarrhée (AKC). Si votre chien a avalé un noyau, surveillez comment il mange et appelez votre vétérinaire au premier changement (AKC).',
    ],
    usdaName: 'de mangue crue',
    piece: {
      a: 'une tasse de morceaux de mangue',
      one: 'tasse de morceaux de mangue',
      many: 'tasses de morceaux de mangue',
      basis: 'USDA : 1 tasse (cup) de morceaux = 165 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, en dés, les catégories de poids converties en kilogrammes ; une tasse (cup) fait 165 g. Comparez-les au budget friandises ci-dessus : pour les plus grands chiens, une tasse de mangue représente l’essentiel des friandises d’une journée.',
      rows: [
        ['Très petit (1 à 5 kg)', '⅛ de tasse, en dés'],
        ['Petit (5 à 9 kg)', '⅓ de tasse, en dés'],
        ['Moyen (10 à 23 kg)', '½ tasse, en dés'],
        ['Grand (23 à 41 kg)', '¾ de tasse, en dés'],
        ['Très grand (plus de 41 kg)', '1 tasse, en dés'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger de la mangue séchée ?',
        answer:
          'Les sources ne parlent que de mangue fraîche et mûre. Un fruit séché concentre dans chaque morceau le sucre de beaucoup plus de fruit, et consomme donc le budget friandises bien plus vite.',
      },
      {
        question: 'Mon chien a avalé un noyau de mangue. Est-ce une urgence ?',
        answer:
          'Le noyau est gros et dur ; l’AKC y voit un sérieux risque d’étouffement, PetMD un risque d’occlusion intestinale. Appelez votre vétérinaire et décrivez la taille du noyau et celle de votre chien.',
      },
    ],
    sources: [],
  },
  {
    id: 'oranges',
    name: 'Oranges',
    some: 'des oranges',
    answer: 'un ou deux quartiers épluchés',
    short: 'Oui, quelques quartiers',
    summary:
      'Des quartiers d’orange épluchés sont sans danger en petite quantité ; la peau, les pépins et l’acidité posent problème.',
    why: [
      'L’AKC écrit que les chiens ne peuvent manger des oranges qu’en quantité limitée, parce que leur sucre naturel et leur acidité peuvent dérégler l’estomac. PetMD dit oui, avec modération et seulement la chair ; un chien diabétique ou en surpoids devrait s’en passer.',
      'Sur la liste des plantes de l’ASPCA, l’oranger figure comme toxique pour les chiens à cause de ses huiles essentielles et de ses psoralènes, avec la précision que le fruit est comestible et que ce sont la peau et les parties de la plante qui posent problème. Selon sa note sur les agrumes, la peau, les pépins et les feuilles contiennent de l’acide citrique et des huiles qui peuvent irriter en plus grande quantité.',
    ],
    serve: [
      'Épluchez entièrement l’orange et retirez les pépins (AKC, PetMD).',
      'Donnez un quartier, coupé en petits morceaux (AKC).',
    ],
    never: [
      'La peau : selon PetMD, elle se digère mal, peut boucher l’intestin, et ses huiles peuvent irriter l’estomac.',
      'Les pépins, avec lesquels un chien peut s’étouffer (AKC), et les feuilles et tiges de l’arbre (ASPCA).',
    ],
    signs: [
      'Diarrhée et maux d’estomac après trop de fruits (AKC, PetMD). Pour les parties de la plante, l’ASPCA cite vomissements, diarrhée, abattement et irritations de la peau.',
    ],
    usdaName: 'd’oranges crues',
    piece: {
      a: 'une orange entière',
      one: 'orange entière',
      many: 'oranges entières',
      basis: 'USDA : 1 fruit (6,7 cm de diamètre) = 131 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, une à deux fois par semaine, les catégories de poids converties de livres en kilogrammes. L’AKC juge en général suffisants un à deux petits quartiers par jour selon la taille.',
      rows: [
        ['Très petit (1 à 5 kg)', '½ quartier'],
        ['Petit (5 à 9 kg)', '1 quartier'],
        ['Moyen (10 à 23 kg)', '1 quartier et demi'],
        ['Grand (23 à 41 kg)', '2 quartiers'],
        ['Très grand (plus de 41 kg)', '2 quartiers et demi'],
      ],
    },
    disagree: [
      'Sur la fréquence : l’AKC autorise un à deux quartiers par jour, PetMD les limite à une à deux fois par semaine.',
    ],
    questions: [
      {
        question: 'Mon chien peut-il manger des clémentines ou des mandarines ?',
        answer:
          'Les sources de cette page parlent des oranges. La note de l’ASPCA sur les agrumes vaut pourtant pour tous les agrumes : la peau, les pépins et les feuilles sont les parties à problème. Par prudence, la même règle s’applique donc : épluchées, sans pépins, en petite quantité.',
      },
      {
        question: 'Mon chien peut-il manger de l’orange tous les jours ?',
        answer:
          'Les sources ne sont pas d’accord : l’AKC juge suffisants un à deux petits quartiers par jour, PetMD ne donne de l’orange qu’une à deux fois par semaine. Selon PetMD, un chien diabétique ou en surpoids devrait s’en passer complètement.',
      },
    ],
    sources: [],
  },
  {
    id: 'pineapple',
    name: 'Ananas',
    some: 'de l’ananas',
    answer: 'l’ananas frais est sans danger',
    short: 'Oui, frais',
    summary:
      'L’ananas cru, épluché et sans le cœur dur est une friandise sans danger ; l’ananas en conserve au sirop, non.',
    why: [
      'PetMD écrit que les chiens peuvent manger de l’ananas sans danger avec modération s’il est bien préparé, et l’AKC que quelques morceaux d’ananas cru suffisent pour la plupart des chiens.',
      'Il apporte de la vitamine C, des vitamines B, du manganèse, du cuivre et du potassium (AKC), et beaucoup d’eau. Son sucre, ses fibres et son acidité peuvent dérégler un estomac sensible (PetMD).',
    ],
    serve: [
      'Épluchez-le, retirez le cœur et coupez la chair en bouchées (AKC).',
      'Des morceaux d’ananas frais congelés font une friandise d’été (AKC).',
      'Frais uniquement : le sirop des fruits en conserve est trop sucré selon l’AKC, et l’ananas séché peut contenir du sucre et des conservateurs selon PetMD.',
    ],
    never: [
      'Le cœur, la peau, la tige et les feuilles : selon PetMD, ils se digèrent mal, un chien peut s’étouffer avec, ou ils peuvent boucher l’intestin.',
    ],
    signs: [
      'Diarrhée ou maux d’estomac après en avoir mangé ; l’AKC conseille alors d’appeler votre vétérinaire.',
    ],
    usdaName: 'd’ananas cru',
    piece: {
      a: 'une tasse de morceaux d’ananas',
      one: 'tasse de morceaux d’ananas',
      many: 'tasses de morceaux d’ananas',
      basis: 'USDA : 1 tasse (cup) de morceaux = 165 g',
    },
    sizeGuide: {
      note: 'Le tableau des portions de PetMD en bouchées, les catégories de poids converties en kilogrammes.',
      rows: [
        ['Très petit (1 à 9 kg)', '1 à 2 morceaux'],
        ['Petit (10 à 14 kg)', '2 à 3 morceaux'],
        ['Moyen (14 à 23 kg)', '5 à 6 morceaux'],
        ['Grand (23 à 41 kg)', 'Une poignée de morceaux'],
        ['Très grand (plus de 41 kg)', 'Une grosse poignée de morceaux'],
      ],
    },
    questions: [
      {
        question: 'L’ananas empêche-t-il les chiens de manger leurs excréments ?',
        answer:
          'Aucune des sources vétérinaires de cette page ne l’affirme. Elles traitent l’ananas uniquement comme une friandise occasionnelle.',
      },
      {
        question: 'Mon chien peut-il manger de l’ananas en conserve ?',
        answer:
          'Mieux vaut pas : l’AKC juge le sirop des fruits en conserve trop sucré. Si vous en donnez, choisissez de l’ananas frais.',
      },
    ],
    sources: [],
  },
];
