import { SOURCES_DE } from '../../de/foods/sources.ts';
import { SOURCES_FR } from './sources.ts';
import type { FoodFr } from './types.ts';

/** The pantry foods of the French pages, in the order of the route table. */
export const PANTRY_FR: readonly FoodFr[] = [
  {
    id: 'peanut-butter',
    name: 'Beurre de cacahuète',
    some: 'du beurre de cacahuète',
    answer: 'le beurre de cacahuète est permis s’il ne contient pas de xylitol',
    short: 'Sans xylitol',
    summary:
      'Un beurre de cacahuète nature convient en petite quantité si l’étiquette ne mentionne pas de xylitol (E967), un édulcorant toxique pour les chiens.',
    why: [
      'PetMD et l’AKC écrivent tous deux que les chiens peuvent manger du beurre de cacahuète avec modération. L’AKC lui prête des protéines, de bonnes graisses, les vitamines B et E et de la niacine ; PetMD rappelle qu’il est très gras et très calorique.',
      'Le vrai danger est un édulcorant. La FDA avertit que certains beurres de cacahuète et de noix contiennent du xylitol, vendu aussi sous les noms de sucre de bouleau ou sucre de bois, qui peut faire libérer de l’insuline au pancréas d’un chien et faire chuter sa glycémie en 10 à 60 minutes. L’ASPCA cite en plus de possibles lésions du foie, et l’Université de médecine vétérinaire de Vienne qualifie le xylitol de toxique pour les chiens et le sucre de bouleau de très dangereux.',
    ],
    serve: [
      'Lisez d’abord l’étiquette et assurez-vous qu’il n’y a pas de xylitol (FDA). Le mieux est un beurre de cacahuète sans sel ni sucre ajouté (AKC).',
      'Un peu à lécher, dans un jouet ou sur une cuillère, comme friandise occasionnelle dans la limite des 10 % (PetMD, AKC).',
    ],
    never: [
      'Tout beurre de cacahuète, beurre de noix ou pâte à tartiner contenant du xylitol ou du sucre de bouleau (FDA, PetMD).',
      'Les chocolats au beurre de cacahuète, les biscuits et les autres confiseries avec du chocolat ou sans sucre.',
    ],
    signs: [
      'Si le pot contenait du xylitol : vomissements, puis faiblesse, démarche titubante, effondrement et convulsions à mesure que la glycémie chute (FDA). Selon la FDA, les signes peuvent apparaître après 10 à 60 minutes, mais aussi seulement après 12 à 24 heures ; appelez tout de suite votre vétérinaire ou un vétérinaire de garde.',
    ],
    usdaName: 'de beurre de cacahuète crémeux non salé',
    piece: {
      a: 'une cuillère à soupe de beurre de cacahuète',
      one: 'cuillère à soupe',
      many: 'cuillères à soupe',
      basis: 'la moitié des 2 cuillères à soupe de l’USDA = 32 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, les catégories de poids converties de livres en kilogrammes. L’AKC ne donne pas de tableau et conseille de garder toutes les friandises dans la limite de 10 % de la journée.',
      rows: [
        ['Très petit (1 à 5 kg)', '½ cuillère à café, une fois par jour'],
        ['Petit (5 à 9 kg)', '½ cuillère à café, deux fois par jour'],
        ['Moyen (10 à 23 kg)', '1 cuillère à café, une fois par jour'],
        ['Grand (23 à 41 kg)', '1 cuillère à café, deux fois par jour'],
        ['Très grand (dès 41 kg)', '1 cuillère à soupe, une fois par jour'],
      ],
    },
    questions: [
      {
        question: 'Comment savoir si mon beurre de cacahuète contient du xylitol ?',
        answer:
          'Lisez la liste des ingrédients. Selon la FDA, le xylitol peut aussi figurer sous le nom de sucre de bouleau ou de sucre de bois ; si l’un de ces trois noms y figure, ce pot n’est pas pour votre chien.',
      },
      {
        question: 'Le sucre de bouleau, est-ce la même chose que le xylitol ?',
        answer:
          'Oui. La FDA cite le sucre de bouleau et le sucre de bois comme d’autres noms du xylitol, et l’Université de médecine vétérinaire de Vienne qualifie le sucre de bouleau de très dangereux pour les chiens.',
      },
    ],
    sources: [SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'honey',
    name: 'Miel',
    some: 'du miel',
    answer: 'un peu de miel est permis, mais pas pour les chiots',
    short: 'Oui, très peu',
    summary:
      'Un peu de miel convient à la plupart des chiens adultes, mais c’est presque du sucre pur, et le miel cru n’est pas pour les chiots.',
    why: [
      'L’AKC : le miel est sans danger pour les chiens en petite quantité. PetMD écrit qu’ils peuvent en recevoir avec modération, comme friandise occasionnelle.',
      'Il est surtout fait de sucre, et trop de sucre peut, selon PetMD, dérégler l’estomac d’un chien et contribuer au surpoids et au diabète ; l’AKC cite aussi les caries. D’après les valeurs de l’USDA, une cuillère à soupe apporte environ 64 kcal, une grande part du budget friandises d’un petit chien.',
      'Le miel cru peut contenir des spores de Clostridium botulinum (PetMD) ; c’est pourquoi les sources le tiennent à l’écart des chiots et des chiens au système immunitaire affaibli.',
    ],
    serve: [
      'Une petite quantité, une à deux fois par semaine au plus (PetMD) ; moins, c’est mieux, surtout pour les petites races (AKC).',
      'L’AKC conseille de brosser les dents de votre chien ensuite.',
    ],
    never: [
      'Le miel cru pour un chiot de moins d’un an ou un chien au système immunitaire affaibli, par exemple pendant une chimiothérapie (PetMD, AKC).',
      'Le miel pour un chien diabétique (AKC, PetMD).',
    ],
    disagree: [
      'PetMD compte les chiens en surpoids parmi ceux qui ne devraient pas recevoir de miel cru ; l’AKC cite les chiots, les chiens au système immunitaire affaibli et les chiens diabétiques, mais pas les chiens en surpoids. L’AKC évoque de possibles bienfaits contre les maux de gorge et les allergies, et écrit que les promesses sur les allergies manquent de preuves solides.',
    ],
    usdaName: 'de miel',
    piece: {
      a: 'une cuillère à café de miel',
      one: 'cuillère à café',
      many: 'cuillères à café',
      basis: 'un tiers de la cuillère à soupe de l’USDA de 21 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, une à deux fois par semaine au plus, les catégories de poids converties de livres en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '⅛ de cuillère à café'],
        ['Petit (5 à 9 kg)', '¼ de cuillère à café'],
        ['Moyen (10 à 23 kg)', '½ à 1 cuillère à café'],
        ['Grand (23 à 41 kg)', '2 cuillères à café'],
        ['Très grand (dès 41 kg)', '1 cuillère à soupe'],
      ],
    },
    questions: [
      {
        question: 'Le miel aide-t-il contre les allergies de mon chien ?',
        answer:
          'L’AKC écrit que l’idée selon laquelle le miel local soulagerait les allergies manque de preuves solides. Demandez plutôt à votre vétérinaire comment traiter l’allergie.',
      },
      {
        question: 'Un chiot peut-il manger du miel ?',
        answer:
          'Pas de miel cru : il peut contenir des spores de Clostridium botulinum (PetMD), et PetMD comme l’AKC le tiennent à l’écart des chiots de moins d’un an.',
      },
    ],
    sources: [],
  },
  {
    id: 'chocolate',
    name: 'Chocolat',
    some: 'du chocolat',
    answer: 'le chocolat est toxique pour les chiens',
    short: 'Non, toxique',
    summary:
      'Le chocolat contient de la théobromine et de la caféine, que le chien élimine lentement ; plus il est noir, moins il en faut.',
    why: [
      'Merck nomme les substances toxiques : la théobromine et la caféine, les méthylxanthines du cacao. L’ASPCA écrit qu’elles peuvent provoquer vomissements et diarrhée, halètement, soif, accélération du cœur, tremblements, convulsions et même la mort.',
      'La quantité dangereuse dépend du type de chocolat, de la quantité et du chien. Merck compte environ 2,3 mg de méthylxanthines par gramme de chocolat au lait, 5,6 mg pour le chocolat mi-amer et noir et 15,5 mg pour le chocolat à cuire non sucré, et cite des signes légers dès 20 mg par kg de poids corporel, des effets sur le cœur dès 40 à 50 mg/kg et des convulsions dès 60 mg/kg. CliniTox, la base de données toxicologique de l’Université de Zurich, cite les mêmes trois paliers : 20, 40 et 60 mg de théobromine par kg. Le Centre Antipoisons belge cite lui aussi des symptômes légers à 20 mg/kg, graves à 40 mg/kg et des convulsions à 60 mg/kg.',
    ],
    serve: [
      'Appelez maintenant votre vétérinaire ou un vétérinaire de garde, même si votre chien semble aller bien. CliniTox juge une décontamination par le vétérinaire nécessaire dès 20 mg/kg.',
      'Gardez l’emballage sous la main, la quantité qui manque et le poids de votre chien : ce sont les trois chiffres dont on tire la dose. La page « Mon chien a mangé du chocolat » calcule pour vous des cas courants.',
    ],
    never: [
      'Tous les chocolats, le cacao en poudre et les éclats de fèves de cacao, et les brownies, gâteaux et biscuits qui en contiennent.',
      'Le chocolat aux raisins secs, aux noix de macadamia ou au xylitol apporte un second poison.',
    ],
    signs: [
      'Merck : les signes apparaissent le plus souvent 6 à 12 heures après l’ingestion, d’abord soif, vomissements, diarrhée, ventre gonflé et agitation, puis surexcitation, tremblements et convulsions. Dans les cas graves, ils durent jusqu’à 72 heures.',
    ],
    disagree: [
      'Sur le délai : Merck cite 6 à 12 heures avant les premiers signes ; CliniTox écrit qu’ils peuvent apparaître dès 45 à 60 minutes, avec un retard possible jusqu’à 4 heures, et le Centre Antipoisons belge les situe après 2 à 4 heures. Appelez donc tout de suite, sans attendre les signes.',
      'Sur la teneur : CliniTox donne des fourchettes plutôt que des valeurs uniques, environ 0,5 à 2,3 mg de théobromine par gramme de chocolat au lait et 5 à 8,8 mg pour un chocolat noir à 55 % ; le Centre Antipoisons belge cite 1 à 2,1 mg par gramme pour le chocolat au lait et 4,5 à 8,8 mg pour le chocolat noir. Cette page calcule avec les valeurs de Merck.',
    ],
    piece: {
      a: 'une tablette (100 g)',
      one: 'tablette',
      many: 'tablettes',
      grams: 100,
      basis: '1 tablette = 100 g',
    },
    thresholds: [
      {
        label: 'Chocolat au lait jusqu’à 20 mg/kg',
        lead: 'le premier palier de Merck (20 mg/kg) en chocolat au lait',
      },
      {
        label: 'Noir ou mi-amer jusqu’à 20 mg/kg',
        lead: 'le premier palier de Merck (20 mg/kg) en chocolat noir',
      },
      {
        label: 'Chocolat à cuire jusqu’à 20 mg/kg',
        lead: 'le premier palier de Merck (20 mg/kg) en chocolat à cuire',
      },
    ],
    thresholdNote:
      'La quantité de chaque type qui atteint 20 mg/kg, là où Merck cite les premiers signes légers, calculée pour quatre poids d’après la teneur par gramme de Merck. Moins n’est pas une raison d’être rassuré : l’appel passe en premier.',
    questions: [
      {
        question: 'Le chocolat blanc est-il toxique pour les chiens ?',
        answer:
          'Il contient très peu de théobromine : l’ASPCA qualifie le chocolat blanc de type le moins dangereux, CliniTox cite 0,01 mg par gramme et le Centre Antipoisons belge 0,009 mg. Appelez tout de même votre vétérinaire avec la quantité et l’emballage, pour en être sûr.',
      },
      {
        question: 'À partir de combien de grammes de chocolat est-ce dangereux pour mon chien ?',
        answer:
          'Cela dépend du type de chocolat et du poids : le tableau ci-dessus donne la quantité qui atteint 20 mg/kg pour des chiens de 5 à 35 kg. Pour le chocolat à cuire, c’est une fraction de la quantité de chocolat au lait.',
      },
    ],
    sources: [
      SOURCES_FR.antipoisonsChocolate,
      SOURCES_DE.clinitoxMethylxanthine,
      SOURCES_DE.vetmeduniHolidays,
      SOURCES_DE.btkPoisonings,
    ],
  },
  {
    id: 'rice',
    name: 'Riz',
    some: 'du riz',
    answer: 'le riz cuit nature est sans danger',
    short: 'Oui, cuit nature',
    summary:
      'Le riz blanc ou complet, cuit seulement à l’eau, est sans danger pour les chiens et un repas léger courant en cas d’estomac dérangé.',
    why: [
      'L’AKC écrit que les chiens peuvent manger du riz sans danger s’il est cuit seulement à l’eau, et PetMD juge le riz blanc ou complet cuit nature sans danger avec modération.',
      'Il est doux et facile à digérer. L’AKC cite le Dr Steve Weinberg : le riz aide à raffermir les selles en cas de diarrhée. Pour un estomac dérangé, c’est le riz blanc qui convient, car il contient moins de fibres (AKC).',
    ],
    serve: [
      'Faites-le cuire à l’eau, sans sel, beurre ni épices (AKC), et laissez-le refroidir.',
      'En cas d’estomac dérangé, PetMD le mélange à deux pour un avec du poulet ou de la dinde cuits, sans os ni peau.',
    ],
    never: ['Le riz frit et le riz à l’ail ou aux oignons (PetMD).'],
    usdaName: 'de riz blanc cuit',
    piece: {
      a: 'une cuillère à soupe de riz cuit',
      one: 'cuillère à soupe',
      many: 'cuillères à soupe',
      basis: 'un seizième de la tasse (cup) de l’USDA de 158 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD comme friandise, deux à trois fois par semaine, cuit, les catégories de poids converties de livres en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '1 à 2 cuillères à soupe'],
        ['Petit (5 à 9 kg)', '2 à 3 cuillères à soupe'],
        ['Moyen (10 à 23 kg)', '¼ de tasse (cup)'],
        ['Grand (23 à 41 kg)', '½ tasse (cup)'],
        ['Très grand (dès 41 kg)', '⅔ de tasse (cup)'],
      ],
    },
    questions: [
      {
        question: 'Le riz convient-il à un chien diabétique ?',
        answer:
          'L’AKC écrit que les chiens diabétiques devraient éviter le riz blanc ordinaire à cause de son index glycémique plus élevé, et PetMD conseille de demander d’abord à votre vétérinaire.',
      },
      {
        question: 'Le riz aide-t-il en cas de diarrhée ?',
        answer:
          'L’AKC cite le Dr Steve Weinberg : le riz aide à raffermir les selles en cas de diarrhée, et le riz blanc s’y prête mieux que le complet, car il contient moins de fibres. Si la diarrhée persiste, votre chien doit voir un vétérinaire.',
      },
    ],
    sources: [],
  },
  {
    id: 'popcorn',
    name: 'Pop-corn',
    some: 'du pop-corn',
    answer: 'seulement du pop-corn nature, éclaté à l’air chaud',
    short: 'Oui, nature',
    summary:
      'Quelques morceaux de pop-corn nature éclaté à l’air chaud conviennent ; le beurre, le sel et les grains non éclatés posent problème.',
    why: [
      'L’AKC : le pop-corn nature éclaté à l’air chaud est en général sans danger pour les chiens en petite quantité. PetMD précise : tout à fait nature, éclaté à l’air chaud, sans huile, beurre, sel ni sucre.',
      'Le pop-corn de cinéma et celui pour micro-ondes sont un autre aliment : le beurre peut, selon PetMD, dérégler l’estomac et mener à une pancréatite, et le sel à une intoxication au sel.',
    ],
    serve: [
      'Éclaté à l’air chaud et nature, comme friandise occasionnelle (AKC).',
      'Seulement des morceaux bien éclatés (AKC, PetMD).',
    ],
    never: [
      'Les grains non éclatés ou à moitié éclatés : ils se coincent entre les dents et peuvent étouffer un chien ou boucher son intestin (AKC, PetMD).',
      'Le pop-corn au beurre, salé, caramélisé ou aromatisé (AKC, PetMD).',
    ],
    signs: [
      'Quelques morceaux tombés par terre ne font sans doute pas de mal, mais en cas de vomissements, de diarrhée ou d’abattement, l’AKC conseille d’appeler votre vétérinaire.',
    ],
    usdaName: 'de pop-corn éclaté à l’air chaud',
    piece: {
      a: 'une tasse de pop-corn',
      one: 'tasse de pop-corn',
      many: 'tasses de pop-corn',
      basis: 'USDA : 1 tasse (cup) = 8 g',
    },
    sizeGuide: {
      note: 'Le tableau des portions de PetMD en morceaux, les catégories de poids converties de livres en kilogrammes.',
      rows: [
        ['Très petit (1 à 9 kg)', '1 à 2 morceaux'],
        ['Petit (10 à 14 kg)', '2 à 3 morceaux'],
        ['Moyen (14 à 23 kg)', '5 à 6 morceaux'],
        ['Grand (23 à 41 kg)', 'Une petite poignée'],
        ['Très grand (dès 41 kg)', 'Une poignée'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger du pop-corn pour micro-ondes ?',
        answer:
          'Pas tel qu’il est vendu : il est préparé avec de l’huile, un arôme de beurre et du sel. L’AKC et PetMD n’autorisent que le pop-corn nature éclaté à l’air chaud.',
      },
      {
        question: 'Un chien peut-il manger le pop-corn sucré du cinéma ?',
        answer:
          'Non. L’AKC et PetMD excluent le pop-corn au beurre, salé, caramélisé ou aromatisé, et le pop-corn de cinéma est, selon PetMD, un autre aliment que le pop-corn nature.',
      },
    ],
    sources: [],
  },
  {
    id: 'bread',
    name: 'Pain',
    some: 'du pain',
    answer: 'le pain nature est permis, la pâte crue à la levure jamais',
    short: 'Oui, mais pas la pâte',
    summary:
      'Le pain blanc ou complet nature est sans danger en petits morceaux ; la pâte crue à la levure, elle, est une urgence.',
    why: [
      'L’AKC écrit que le pain blanc et le pain de blé nature sont en général sans danger pour les chiens avec modération, et le qualifie au fond de bourrage. PetMD écrit qu’il apporte peu de nutriments.',
      'Le danger, c’est la pâte crue à la levure. L’ASPCA écrit qu’elle peut lever et gonfler l’estomac, et Merck explique que la levure produit en plus de l’éthanol, qui passe dans le sang et cause ivresse et acidose. PetMD la qualifie d’urgence médicale, avec un risque de dilatation et de torsion de l’estomac. L’Université de médecine vétérinaire de Vienne avertit elle aussi que la pâte à pain levée peut gonfler rapidement dans la chaleur de l’estomac.',
    ],
    serve: [
      'Du pain nature, un petit morceau à la fois (AKC).',
      'Si votre chien a mangé de la pâte crue, appelez tout de suite votre vétérinaire ou un vétérinaire de garde (PetMD).',
    ],
    never: [
      'La pâte à pain ou à pizza crue (ASPCA, Merck).',
      'Le pain aux raisins secs, au chocolat, au xylitol, à l’ail, aux oignons, à la noix de muscade ou aux noix, comme le pain à l’ail, le pain aux bananes ou le pain aux raisins (PetMD, AKC).',
    ],
    signs: [
      'Pâte crue : d’abord des haut-le-cœur sans rien rejeter, un ventre gonflé et de l’abattement (Merck), puis une démarche titubante, de la désorientation, de la faiblesse, une glycémie basse et, dans les cas graves, des convulsions ou un coma.',
    ],
    usdaName: 'de pain blanc du commerce',
    piece: {
      a: 'une tranche de pain blanc',
      one: 'tranche',
      many: 'tranches',
      basis: 'USDA : 1 tranche = 29 g',
    },
    questions: [
      {
        question: 'Mon chien a mangé de la pâte à pizza crue. Que faire ?',
        answer:
          'Appelez maintenant votre vétérinaire ou un vétérinaire de garde. La pâte continue de lever dans la chaleur de l’estomac et produit de l’alcool en fermentant (ASPCA, Merck) ; PetMD la traite comme une urgence.',
      },
      {
        question: 'Un chien peut-il manger du pain aux raisins ?',
        answer:
          'Non. PetMD et l’AKC excluent le pain aux raisins secs, et les raisins secs sont toxiques pour les chiens. Si votre chien en a mangé, appelez votre vétérinaire.',
      },
    ],
    sources: [SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'almonds',
    name: 'Amandes',
    some: 'des amandes',
    answer: 'les amandes sont trop grasses et peuvent rester coincées',
    short: 'Mieux vaut éviter',
    summary:
      'Les amandes ne sont pas toxiques comme les noix de macadamia, mais elles sont grasses, souvent salées, et un chien peut s’étouffer avec.',
    why: [
      'L’AKC répond non. Comme la plupart des fruits à coque, les amandes sont très grasses, ce qui peut déclencher une pancréatite (AKC, PetMD), et les amandes en sachet sont souvent très salées (PetMD). L’ASPCA écrit que les huiles et les graisses des noix peuvent causer vomissements et diarrhée ; l’Université de médecine vétérinaire de Vienne cite les noix parmi les aliments qui peuvent provoquer vomissements, diarrhée ou une pancréatite mettant la vie en danger.',
      'L’autre problème, c’est la taille et la forme : selon l’AKC, une amande peut boucher l’œsophage, l’intestin ou la trachée d’un chien, surtout chez les petites races.',
    ],
    serve: [
      'Une ou deux amandes : surveillez votre chien de près. Plus que quelques-unes : appelez votre vétérinaire ou un vétérinaire de garde (AKC).',
      'Pour une petite race ou une plus grande quantité, PetMD conseille d’appeler tout de suite ; dans les 30 minutes environ, le vétérinaire peut décider de faire vomir le chien.',
    ],
    never: [
      'Les amandes entières, avec ou sans coque, et les amandes salées ou aromatisées (AKC, PetMD).',
      'La purée d’amande avec du sel, du sucre ou du xylitol (PetMD).',
    ],
    signs: [
      'Vomissements, diarrhée, gaz, perte d’appétit et abattement ; haut-le-cœur, ventre gonflé ou étouffement si une amande est restée coincée (AKC, PetMD).',
    ],
    usdaName: 'd’amandes',
    piece: {
      a: 'une amande',
      one: 'amande',
      many: 'amandes',
      basis: 'USDA : 1 amande = 1,2 g',
    },
    questions: [
      {
        question: 'Les amandes sont-elles toxiques pour les chiens ?',
        answer:
          'Pas comme les noix de macadamia. Les sources les déconseillent à cause de la graisse, du sel et du risque d’occlusion intestinale (AKC, PetMD).',
      },
    ],
    sources: [SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'cashews',
    name: 'Noix de cajou',
    some: 'des noix de cajou',
    answer: 'pas plus d’une ou deux noix de cajou nature',
    short: 'Oui, une ou deux',
    summary:
      'Une ou deux noix de cajou nature et non salées ne sont pas toxiques, mais elles sont grasses, et un mélange de noix peut cacher des noix de macadamia.',
    why: [
      'PetMD écrit que les noix de cajou ne sont pas toxiques pour les chiens, et l’AKC les juge en général sans danger. Tous deux s’en tiennent à quelques-unes : les noix de cajou sont grasses, ce qui peut mener, selon l’AKC, à une pancréatite, une maladie qui peut mettre la vie en danger.',
      'L’AKC ne voit aucune raison de donner des noix à un chien ; PetMD remarque que les noix de cajou sont plus tendres que la plupart des noix, si bien qu’un chien risque moins de s’étouffer avec.',
    ],
    serve: [
      'Seulement des noix de cajou nature et non salées, comme friandise rare (AKC). Hachez-les ou moulez-les et saupoudrez-les sur la nourriture, pour qu’il ne s’étouffe pas (PetMD).',
    ],
    never: [
      'Les noix de cajou salées : selon l’AKC, le sel peut provoquer vomissements, faiblesse, diarrhée, tremblements et convulsions.',
      'Les mélanges de noix et les assortiments, qui peuvent contenir des noix de macadamia (AKC, PetMD).',
    ],
    signs: [
      'Vomissements ou diarrhée ; rarement une allergie avec gonflements, démangeaisons et urticaire (PetMD).',
    ],
    usdaName: 'de noix de cajou grillées à l’huile, sans sel',
    piece: {
      a: 'une noix de cajou',
      one: 'noix de cajou',
      many: 'noix de cajou',
      basis: 'USDA : 1 once (18 noix) = 28,35 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD en noix de cajou entières, les catégories de poids converties de livres en kilogrammes. L’AKC ne donne pas de quantité et déconseille les noix.',
      rows: [
        ['Très petit (1 à 9 kg)', '1 ou 2 noix de cajou'],
        ['Petit (10 à 14 kg)', '2 à 3 noix de cajou'],
        ['Moyen (14 à 23 kg)', '5 à 6 noix de cajou'],
        ['Grand (23 à 41 kg)', '10 à 12 noix de cajou'],
        ['Très grand (dès 41 kg)', '12 à 18 noix de cajou'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger un mélange de noix ?',
        answer:
          'Non : un mélange peut contenir des noix de macadamia, qui sont toxiques pour les chiens, et il est le plus souvent salé (AKC, PetMD).',
      },
      {
        question: 'Les noix de cajou sont-elles toxiques pour les chiens ?',
        answer:
          'Non, PetMD les dit non toxiques. Elles sont toutefois grasses, et l’AKC met en garde contre la pancréatite ; pas plus de quelques noix nature et non salées.',
      },
    ],
    sources: [],
  },
  {
    id: 'macadamia-nuts',
    name: 'Noix de macadamia',
    some: 'des noix de macadamia',
    answer: 'les noix de macadamia sont toxiques pour les chiens',
    short: 'Non, toxique',
    summary:
      'Les noix de macadamia provoquent chez le chien faiblesse, tremblements et fièvre en moins de 12 heures ; on ignore pourquoi.',
    why: [
      'L’ASPCA : les noix de macadamia peuvent provoquer chez le chien faiblesse, troubles de la coordination, abattement, vomissements, tremblements et une élévation de la température (hyperthermie). Merck décrit l’intoxication chez le chien ; on ne sait pas comment la noix la déclenche (Merck, VCA).',
      'Merck rapporte des signes chez des chiens qui en avaient mangé 2,4 g par kg de poids corporel, à peine quelques noix pour un petit chien. VCA écrit que quelques noix suffisent à rendre un chien malade.',
    ],
    serve: [
      'Appelez votre vétérinaire ou un vétérinaire de garde. Si votre chien en a mangé il y a peu, les vétérinaires le font vomir, selon Merck, à partir de 1 à 2 g par kg.',
      'Allez tout de suite chez un vétérinaire de garde si votre chien ne peut plus se tenir debout ni marcher, ou s’il tremble fortement (ASPCA).',
    ],
    never: [
      'Les noix de macadamia, les mélanges de noix et les biscuits, brownies et chocolats qui en contiennent. L’Université de médecine vétérinaire de Vienne conseille de ranger les noix hors de portée des animaux.',
    ],
    signs: [
      'Merck : en moins de 12 heures, faiblesse (surtout des pattes arrière), abattement, vomissements, démarche titubante, tremblements ou fièvre. Les signes disparaissent le plus souvent en 12 à 48 heures ; VCA s’attend, avec un traitement, à une guérison complète en 24 à 48 heures.',
      'CliniTox, la base de données toxicologique de la faculté Vetsuisse de Zurich, décrit le même tableau : faiblesse surtout de l’arrière-train et fièvre jusqu’à 40,5 °C, le plus souvent moins de 12 heures après l’ingestion, et une guérison complète spontanée en 24 à 48 heures.',
      'Les noix de macadamia enrobées de chocolat ajoutent à la noix une intoxication au chocolat.',
    ],
    disagree: [
      'Sur l’inquiétude : Merck décrit des signes le plus souvent légers qui disparaissent d’eux-mêmes, et l’ASPCA écrit que la plupart des cas se soignent à la maison sous la conduite d’un vétérinaire. VCA et l’AKC conseillent d’appeler tout de suite le vétérinaire. De toute façon, cette conduite à tenir, vous ne l’obtenez qu’en appelant.',
      'Sur la quantité : Merck rapporte des signes dès 2,4 g par kg, CliniTox cite pour les chiens des quantités de 0,7 à 62,4 g par kg de poids corporel, parfois bien moins. Cette page calcule avec la valeur de Merck.',
    ],
    usdaName: 'de noix de macadamia crues',
    piece: {
      a: 'une noix de macadamia',
      one: 'noix de macadamia',
      many: 'noix de macadamia',
      basis: 'USDA : 1 once (10 à 12 noix) = 28,35 g, calculé avec 11 noix',
    },
    thresholds: [
      {
        label: 'Merck : signes à 2,4 g/kg',
        lead: 'la quantité de 2,4 g/kg à laquelle Merck décrit des signes',
      },
    ],
    thresholdNote:
      'Les grammes de noix de macadamia qui atteignent les 2,4 g/kg auxquels Merck décrit des signes chez le chien, calculés pour quatre poids, et la même quantité en noix d’environ 2,6 g (l’once de l’USDA de 10 à 12 noix). C’est un cas décrit, pas une limite sûre.',
    questions: [
      {
        question: 'Combien de noix de macadamia peuvent faire du mal à un chien ?',
        answer:
          'Merck rapporte des signes dès 2,4 g par kg de poids corporel. Pour un petit chien, c’est une poignée de noix, pour un grand davantage, comme le montre le tableau ; VCA écrit que quelques noix suffisent à rendre un chien malade.',
      },
      {
        question: 'Combien de temps dure une intoxication aux noix de macadamia ?',
        answer:
          'Les signes apparaissent le plus souvent en moins de 12 heures et disparaissent, selon Merck, en général en 12 à 48 heures ; VCA et CliniTox citent une guérison complète en 24 à 48 heures. Appelez tout de même sans attendre.',
      },
    ],
    sources: [SOURCES_DE.clinitoxMacadamia, SOURCES_DE.vetmeduniHolidays],
  },
  {
    id: 'xylitol-gum',
    name: 'Chewing-gum au xylitol',
    some: 'du chewing-gum',
    answer: 'le xylitol du chewing-gum est toxique pour les chiens',
    short: 'Non, toxique',
    summary:
      'Le xylitol (E967) des chewing-gums sans sucre, des bonbons et de certains beurres de noix fait vite chuter la glycémie du chien et peut détruire son foie.',
    why: [
      'La FDA avertit que le xylitol peut provoquer chez le chien une forte libération d’insuline par le pancréas et une chute rapide et profonde de la glycémie. Merck, VCA et l’ASPCA décrivent la même intoxication, et des doses plus élevées causent une insuffisance hépatique. Tox Info Suisse rappelle que le xylitol est toxique pour les chiens même en petite quantité : un seul chewing-gum au xylitol peut provoquer des symptômes graves. L’Université de médecine vétérinaire de Vienne qualifie le sucre de bouleau, autre nom du xylitol, de très dangereux pour les chiens.',
      'Merck donne les doses : hypoglycémie dès environ 100 mg par kg de poids corporel, insuffisance hépatique dès 500 mg par kg. CliniTox, la base de données toxicologique de la faculté Vetsuisse de Zurich, cite les deux mêmes seuils. Un chewing-gum ou une pastille de menthe contient 0,22 à 1,0 g de xylitol, écrit la toxicologue vétérinaire Dr Ahna Brutlag dans dvm360.',
    ],
    serve: [
      'Appelez tout de suite votre vétérinaire ou un vétérinaire de garde, ou allez-y directement (FDA). Emportez le paquet : la marque et le nombre de chewing-gums sont ce dont le vétérinaire a besoin.',
      'Ne faites pas vomir votre chien vous-même, sauf si le vétérinaire vous le demande (VCA).',
    ],
    never: [
      'Les chewing-gums, pastilles de menthe et confiseries sans sucre, et tout ce qui est sucré au xylitol, au sucre de bouleau ou au sucre de bois.',
      'La FDA cite aussi certains beurres de cacahuète et de noix, des produits de boulangerie, le dentifrice et le bain de bouche, les vitamines à croquer, les sirops contre la toux et les compléments alimentaires.',
    ],
    signs: [
      'Une hypoglycémie en 10 à 60 minutes (FDA) ou en 30 minutes environ (Merck), mais parfois seulement après 12 à 18 heures (Merck), et le chewing-gum peut la retarder (guide de Merck pour les propriétaires) : vomissements, faiblesse, démarche titubante, effondrement et convulsions.',
      'Une insuffisance hépatique peut ne se montrer qu’après 24 à 48 heures ou plus (Merck). Selon Merck, 62,5 % des chiens atteints de lésions graves du foie sont morts ou ont été euthanasiés malgré un traitement intensif.',
    ],
    disagree: [
      'Sur le délai : 10 à 15 minutes selon dvm360, 10 à 60 minutes selon la FDA et CliniTox (le plus souvent d’abord des vomissements), environ 30 minutes selon Merck et 30 minutes à deux heures selon VCA. La FDA et VCA conseillent toutes deux d’appeler tout de suite, sans attendre les signes.',
      'Pour l’insuffisance hépatique, CliniTox cite un délai de 8 à 12 heures, dans certains cas jusqu’à 72 heures ; Merck écrit 24 à 48 heures ou plus.',
      'Sur la dose : CliniTox recommande une décontamination et un contrôle de la glycémie dès 50 mg de xylitol par kg, la moitié du seuil que Merck fixe pour l’hypoglycémie. Le tableau calcule avec les seuils de Merck.',
    ],
    usdaName: 'de chewing-gum sans sucre',
    piece: {
      a: 'un chewing-gum',
      one: 'chewing-gum',
      many: 'chewing-gums',
      basis: 'USDA : 1 pièce = 2 g',
    },
    compound: 'xylitol',
    thresholds: [
      {
        label: 'Merck : hypoglycémie au-delà de 0,1 g/kg',
        lead: 'la quantité de 0,1 g de xylitol par kg à partir de laquelle, selon Merck, la glycémie chute,',
      },
      {
        label: 'Merck : insuffisance hépatique au-delà de 0,5 g/kg',
        lead: 'la quantité de 0,5 g par kg que Merck associe à l’insuffisance hépatique',
      },
    ],
    thresholdNote:
      'Le xylitol qui atteint chaque seuil de Merck, pour quatre poids, et le nombre de chewing-gums qui le contiennent : d’un chewing-gum fort à 1 g par pièce à un faible à 0,22 g (dvm360). Lisez le paquet : le chiffre exact dépend de la marque, et l’appel passe en premier.',
    questions: [
      {
        question: 'Mon chien a mangé un chewing-gum sans sucre. Est-ce déjà dangereux ?',
        answer:
          'Cela peut l’être. Un chewing-gum fort à 1 g de xylitol par pièce dépasse, chez tout chien de moins de 10 kg environ, le seuil de Merck pour l’hypoglycémie, comme le montre le tableau. Appelez tout de suite et gardez le paquet sous la main.',
      },
      {
        question: 'Un chien peut-il manger du sucre de bouleau ?',
        answer:
          'Non. Le sucre de bouleau est un autre nom du xylitol (FDA), et VCA cite aussi le sucre de bois et l’extrait d’écorce de bouleau : même édulcorant, même danger. L’Université de médecine vétérinaire de Vienne qualifie le sucre de bouleau de très dangereux pour les chiens.',
      },
      {
        question: 'Le dentifrice pour humains est-il dangereux pour les chiens ?',
        answer:
          'Il peut l’être : la FDA cite le dentifrice et le bain de bouche parmi les produits qui peuvent contenir du xylitol. Lisez la liste des ingrédients et appelez votre vétérinaire si votre chien a mangé du dentifrice au xylitol.',
      },
    ],
    sources: [SOURCES_FR.toxinfoAnimals, SOURCES_DE.clinitoxXylitol, SOURCES_DE.vetmeduniHolidays],
  },
];
