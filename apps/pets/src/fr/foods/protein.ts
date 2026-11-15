import type { FoodFr } from './types.ts';

/** The dairy and meat of the French pages, in the order of the route table. */
export const PROTEIN_FR: readonly FoodFr[] = [
  {
    id: 'cheese',
    name: 'Fromage',
    some: 'du fromage',
    answer: 'un petit cube de fromage doux',
    short: 'Oui, un petit cube',
    summary:
      'Un petit cube de fromage doux et peu gras convient à la plupart des chiens, mais beaucoup digèrent mal le lactose, et le fromage est gras.',
    why: [
      'PetMD écrit que les chiens peuvent manger du fromage avec modération, même si la plupart sont intolérants au lactose ; l’AKC l’accepte comme friandise occasionnelle. L’ASPCA explique la limite : les animaux de compagnie manquent de lactase, l’enzyme qui décompose le sucre du lait, si bien que les produits laitiers peuvent provoquer une diarrhée et d’autres troubles digestifs.',
      'Le fromage est aussi gras et salé (PetMD). Selon l’USDA, le cheddar apporte 403 kcal pour 100 g : un peu de fromage épuise donc vite le budget friandises. Après une inflammation du pancréas (pancréatite), un chien ne doit pas recevoir de fromage, selon PetMD.',
    ],
    serve: [
      'Un petit cube ou un peu de fromage râpé suffit en général pour l’éducation ou comme récompense (AKC).',
      'Choisissez des fromages moins gras et pauvres en lactose, comme la mozzarella, le cottage cheese ou un fromage de chèvre frais et doux (AKC, PetMD).',
    ],
    never: [
      'Les fromages à pâte persillée (bleus), que PetMD dit toxiques pour les chiens (ils contiennent de la roquefortine).',
      'Les fromages à l’ail, à l’oignon ou à la ciboulette (AKC).',
    ],
    signs: ['Vomissements, diarrhée, ventre gonflé ou flatulences (PetMD).'],
    usdaName: 'de cheddar',
    piece: {
      a: 'un cube de 2,5 cm de côté',
      one: 'cube de 2,5 cm',
      many: 'cubes de 2,5 cm',
      basis: 'USDA : 1 pouce cube (cube de 2,5 cm) de cheddar = 17 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, quelques fois par semaine, les catégories de poids converties en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '1 à 2 morceaux de la taille d’un petit pois'],
        ['Petit (5 à 9 kg)', '1 à 2 cubes de 6 mm'],
        ['Moyen (10 à 23 kg)', '3 à 4 cubes'],
        ['Grand (23 à 41 kg)', '5 à 6 cubes'],
        ['Très grand (à partir de 41 kg)', '7 à 8 cubes'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger du cottage cheese ?',
        answer:
          'Oui, en petite quantité : l’AKC le range parmi les meilleurs choix, parce qu’il contient moins de matières grasses et de sodium.',
      },
      {
        question: 'Le fromage convient-il comme récompense pendant l’éducation ?',
        answer:
          'En petits morceaux, oui : l’AKC écrit qu’un petit cube ou un peu de fromage râpé suffit en général. Avec de nombreuses répétitions dans la journée, chaque morceau compte dans le budget friandises, et le cheddar est calorique : selon l’USDA, un cube de 2,5 cm apporte déjà 69 kcal.',
      },
    ],
    sources: [],
  },
  {
    id: 'eggs',
    name: 'Œufs',
    some: 'des œufs',
    answer: 'les œufs cuits ne posent pas de problème',
    short: 'Oui, cuits',
    summary:
      'Des œufs bien cuits, sans rien d’autre, conviennent aux chiens quelques fois par semaine ; les œufs crus peuvent transmettre des salmonelles.',
    why: [
      'PetMD (article rédigé par le Dr Hector Joy, vétérinaire) écrit que les chiens peuvent manger des œufs cuits sans danger, avec modération ; l’AKC les dit sûrs et nutritifs, à condition qu’ils soient bien cuits et donnés de temps en temps seulement.',
      'Les œufs apportent des protéines de grande qualité, faciles à digérer, avec les vitamines A, D et E, des vitamines B, du fer, du zinc et du sélénium (PetMD). Ils sont aussi riches en graisses, ce qui compte chez un chien sujet à l’inflammation du pancréas (pancréatite) (PetMD).',
    ],
    serve: [
      'Faites-les bouillir, brouiller ou pocher, sans sel, beurre ni huile (PetMD).',
      'Pour un œuf dur, cuisez-le jusqu’à ce que le blanc et le jaune soient fermes, laissez-le refroidir et coupez-le en bouchées (PetMD).',
    ],
    never: [
      'Les œufs crus : l’ASPCA met en garde contre les salmonelles et E. coli, et PetMD comme l’AKC citent aussi l’avidine, qui fixe la biotine, une vitamine B.',
      'Les œufs préparés avec du beurre, du sel, de l’oignon ou une sauce au fromage.',
    ],
    signs: [
      'Une allergie aux œufs peut se manifester par des démangeaisons, des otites, des vomissements ou une diarrhée (PetMD) ; l’AKC cite aussi de l’urticaire et des gonflements, et conseille d’introduire les œufs progressivement.',
    ],
    disagree: [
      'Sur la coquille : l’AKC prévient que ses bords coupants peuvent faire s’étouffer un chien ; PetMD accepte les coquilles, cuites au four ou bouillies puis réduites en poudre fine, comme complément de calcium sur les conseils du vétérinaire.',
    ],
    usdaName: 'd’œufs durs',
    piece: {
      a: 'un gros œuf',
      one: 'gros œuf',
      many: 'gros œufs',
      basis: 'USDA : 1 gros œuf = 50 g',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, une à deux fois par semaine, les catégories de poids converties en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '¼ d’œuf'],
        ['Petit (5 à 9 kg)', '½ œuf'],
        ['Moyen (10 à 23 kg)', '1 œuf'],
        ['Grand (23 à 41 kg)', '1 œuf et demi'],
        ['Très grand (à partir de 41 kg)', '2 œufs'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger des œufs crus ?',
        answer:
          'Les sources disent non : les œufs crus peuvent transmettre des salmonelles et E. coli (ASPCA), et le blanc cru contient de l’avidine, qui bloque la biotine (AKC, PetMD). Faites-les cuire complètement.',
      },
      {
        question: 'Mon chien peut-il manger des coquilles d’œuf ?',
        answer:
          'Les sources ne sont pas d’accord. L’AKC met en garde contre les bords coupants ; PetMD n’accepte la coquille que cuite au four ou bouillie et finement moulue, comme complément de calcium sur les conseils de votre vétérinaire.',
      },
    ],
    sources: [],
  },
  {
    id: 'yogurt',
    name: 'Yaourt',
    some: 'du yaourt',
    answer: 'le yaourt nature est permis s’il ne contient pas de xylitol',
    short: 'Oui, nature',
    summary:
      'Un yaourt nature non sucré convient en petite quantité ; vérifiez d’abord qu’il ne contient pas de xylitol.',
    why: [
      'PetMD (article rédigé par la Dre Brittany Kleszynski, vétérinaire) écrit que le yaourt grec nature non sucré est en général le meilleur choix pour un chien, avec plus de protéines et moins de sucre et de lactose qu’un yaourt ordinaire. L’AKC écrit que la plupart des chiens peuvent manger du yaourt, mais qu’il n’est pas toujours conseillé à cause du lactose.',
      'L’ASPCA : les produits laitiers peuvent provoquer une diarrhée et d’autres troubles digestifs, parce que les animaux de compagnie manquent de lactase. L’AKC ajoute que ses graisses peuvent favoriser une pancréatite et qu’il existe de meilleures sources de probiotiques.',
    ],
    serve: [
      'Un yaourt nature non sucré, avec des ferments vivants ; le yaourt grec contient moins de lactose (AKC, PetMD).',
      'Commencez par une cuillerée et observez comment votre chien le supporte (AKC).',
    ],
    never: [
      'Les yaourts sucrés ou aromatisés, et tout yaourt au xylitol (E967) : selon PetMD, le xylitol peut causer de graves lésions du foie, une baisse dangereuse du taux de sucre dans le sang et la mort.',
    ],
    signs: ['Flatulences, diarrhée ou vomissements dus au lactose (AKC).'],
    usdaName: 'de yaourt nature au lait écrémé',
    piece: {
      a: 'une cuillère à soupe de yaourt',
      one: 'cuillère à soupe',
      many: 'cuillères à soupe',
      basis: 'un seizième de la tasse (cup) de 245 g de l’USDA',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, une fois par jour au plus, les catégories de poids converties en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '½ cuillère à café'],
        ['Petit (5 à 9 kg)', '1 cuillère à café'],
        ['Moyen (10 à 23 kg)', '1 cuillère à soupe'],
        ['Grand (23 à 41 kg)', '2 cuillères à soupe'],
        ['Très grand (à partir de 41 kg)', '3 cuillères à soupe'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger du yaourt grec ?',
        answer:
          'Le yaourt grec nature non sucré est celui que PetMD préfère : plus de protéines, moins de sucre et moins de lactose qu’un yaourt ordinaire.',
      },
      {
        question: 'Mon chien peut-il manger du yogourt ?',
        answer:
          'Oui, yogourt n’est qu’une autre façon d’écrire yaourt : nature et non sucré, en petite quantité, et jamais sucré au xylitol (PetMD, AKC).',
      },
    ],
    sources: [],
  },
  {
    id: 'shrimp',
    name: 'Crevettes',
    some: 'des crevettes',
    answer: 'les crevettes cuites et décortiquées ne posent pas de problème',
    short: 'Oui, décortiquées',
    summary:
      'Des crevettes bien cuites et décortiquées, sans rien d’autre, conviennent en petite quantité ; les crevettes crues et les carapaces, non.',
    why: [
      'PetMD écrit que les chiens peuvent manger sans danger des crevettes bien préparées, et l’AKC les accepte avec modération comme friandise occasionnelle.',
      'Les crevettes apportent de la vitamine B12, de la niacine, du phosphore et des antioxydants, et sont peu grasses (AKC, PetMD). Elles contiennent beaucoup de cholestérol : c’est pourquoi l’AKC les réserve aux occasions.',
    ],
    serve: [
      'Faites-les cuire complètement : bouillies, à la vapeur, grillées ou au four (PetMD) ; l’AKC juge la cuisson à la vapeur la meilleure.',
      'Retirez la carapace, la queue et l’intestin, et coupez la crevette en petits morceaux (PetMD).',
      'Sans beurre, huile, épices, ail ni oignon, et rien de pané ni de frit (PetMD, AKC).',
    ],
    never: [
      'Les crevettes crues, qui portent selon l’AKC des agents pathogènes dangereux.',
      'Les carapaces et les queues, qui peuvent étouffer un chien, surtout un petit (AKC).',
    ],
    signs: [
      'Vomissements ou diarrhée en cas d’intolérance (PetMD), nausées et douleurs abdominales après des crevettes crues (PetMD).',
    ],
    usdaName: 'de crevettes cuites',
    piece: {
      a: 'une portion',
      one: 'portion de 100 g',
      many: 'portions de 100 g',
      grams: 100,
      basis: 'la quantité de référence des tables nutritionnelles',
    },
    sizeGuide: {
      note: 'Le tableau des portions de PetMD, les catégories de poids converties en kilogrammes. L’AKC parle d’une ou deux crevettes pour la plupart des chiens, et d’un morceau d’une seule pour un petit chien.',
      rows: [
        ['Très petit (1 à 9 kg)', '½ crevette moyenne'],
        ['Petit (10 à 14 kg)', '1 crevette moyenne'],
        ['Moyen (14 à 23 kg)', '2 crevettes moyennes'],
        ['Grand (23 à 41 kg)', '3 crevettes moyennes'],
        ['Très grand (à partir de 41 kg)', 'Jusqu’à 4 crevettes moyennes'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger des queues de crevettes ?',
        answer:
          'Non. PetMD conseille de retirer la carapace, la queue et l’intestin ; l’AKC écrit qu’un chien peut s’étouffer avec les carapaces.',
      },
      {
        question: 'Mon chien peut-il manger des crevettes panées ou frites ?',
        answer:
          'Non : les crevettes se donnent bien cuites, décortiquées et nature, sans rien de pané ni de frit, et sans beurre, huile, ail ni oignon (PetMD, AKC).',
      },
    ],
    sources: [],
  },
  {
    id: 'salmon',
    name: 'Saumon',
    some: 'du saumon',
    answer: 'le saumon cuit et sans arêtes ne pose pas de problème',
    short: 'Oui, sans arêtes',
    summary:
      'Le saumon cuit et sans arêtes convient aux chiens ; le saumon cru peut transmettre une maladie souvent mortelle sans traitement.',
    why: [
      'PetMD écrit que le saumon cuit convient aux chiens, et l’AKC (relu par la Dre Ashly Smith) écrit que les chiens peuvent en manger sans danger, avec modération. Il apporte des acides gras oméga-3, des protéines et de la vitamine B12 (PetMD).',
      'Le danger vient du poisson cru ou mal cuit. Merck explique que les chiens contractent la maladie de l’empoisonnement par le saumon (salmon poisoning disease) en mangeant des truites, des saumons ou des salamandres géantes du Pacifique crus ou mal cuits porteurs d’un ver plat (douve), lui-même infecté par la bactérie Neorickettsia helminthoeca. La maladie existe sur les côtes du nord-ouest pacifique de l’Amérique du Nord, du nord de la Californie à l’Alaska (Merck).',
    ],
    serve: [
      'Frais, cuit et sans arêtes (PetMD). L’AKC : cuire jusqu’à 60 °C à cœur.',
      'Nature, sans épices, huile ni sauce (AKC). Rincez le saumon en conserve pour enlever le sel et l’huile (PetMD), ou choisissez une version pauvre en sodium (AKC).',
    ],
    never: [
      'Le saumon ou la truite crus ou mal cuits (Merck, PetMD, AKC) et le saumon fumé (AKC).',
      'Les arêtes : selon l’AKC, les petites arêtes cassantes peuvent perforer l’intestin.',
    ],
    signs: [
      'Merck : les signes de la maladie apparaissent environ 5 à 7 jours après que le chien a mangé le poisson infecté, parfois seulement après 33 jours. Forte fièvre, faiblesse, perte d’appétit, vomissements, diarrhée sanglante, déshydratation et ganglions gonflés.',
      'Sans traitement, jusqu’à 90 % des chiens atteints meurent dans les 7 à 10 jours (Merck). Le traitement repose tôt sur des antibiotiques par voie intraveineuse et des soins de soutien : dites donc à votre vétérinaire si votre chien a mangé du poisson cru dans les semaines précédentes.',
    ],
    disagree: [
      'Sur la peau du saumon : PetMD juge la peau cuite sans danger et écrit qu’elle contient même plus d’oméga-3 que la chair ; l’AKC déconseille le poisson fumé ou cru, mais ne dit rien de la peau cuite.',
    ],
    usdaName: 'de saumon atlantique d’élevage cuit',
    piece: {
      a: 'une portion',
      one: 'portion de 100 g',
      many: 'portions de 100 g',
      grams: 100,
      basis: 'la quantité de référence des tables nutritionnelles',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD par semaine, cuit, converties des onces en grammes et des livres en kilogrammes.',
      rows: [
        ['Très petit (1 à 9 kg)', 'Environ 30 à 55 g'],
        ['Petit (10 à 14 kg)', 'Environ 55 à 85 g'],
        ['Moyen (14 à 23 kg)', 'Environ 85 à 115 g'],
        ['Grand (23 à 41 kg)', 'Environ 115 à 170 g'],
        ['Très grand (à partir de 41 kg)', 'Environ 170 à 225 g'],
      ],
    },
    questions: [
      {
        question: 'Mon chien a mangé du saumon cru. Que faire ?',
        answer:
          'Appelez votre vétérinaire, surtout dans le nord-ouest pacifique de l’Amérique du Nord, où vit le ver infecté selon Merck. Les signes apparaissent en général 5 à 7 jours plus tard, et des antibiotiques donnés tôt sont efficaces ; sans traitement, jusqu’à 90 % des chiens atteints meurent.',
      },
      {
        question: 'Mon chien peut-il manger du saumon fumé ?',
        answer:
          'Non : l’AKC déconseille le saumon fumé, comme le poisson cru. Ne donnez le saumon que cuit, nature et sans arêtes.',
      },
    ],
    sources: [],
  },
  {
    id: 'pork',
    name: 'Porc',
    some: 'du porc',
    answer: 'le porc seulement maigre, nature et bien cuit',
    short: 'Oui, bien cuit',
    summary:
      'Le porc maigre, bien cuit, nature et sans os convient en petite quantité ; le bacon, le jambon et la viande crue, non.',
    why: [
      'PetMD écrit que les chiens peuvent manger du porc avec modération s’il est bien cuit, nature, maigre et sans os ; l’AKC juge le porc nature cuit sans danger avec modération, mais beaucoup de produits à base de porc dangereux.',
      'Le problème, c’est la graisse. Selon PetMD, les morceaux gras peuvent déclencher une pancréatite, et l’AKC écrit que la graisse de porc est difficile à digérer. Le porc cru peut transmettre le parasite Trichinella spiralis (trichine) et des salmonelles (PetMD, AKC).',
    ],
    serve: [
      'Faites-le cuire complètement : 71 °C à cœur pour la viande hachée, 63 °C pour les côtelettes, les tranches et les rôtis (PetMD).',
      'Des morceaux maigres comme le filet, le gras retiré, en bouchées et sans assaisonnement (PetMD). L’AKC : pas d’oignon ni d’ail en poudre, pas de noix de muscade, pas de sauce barbecue.',
    ],
    never: [
      'Le porc cru (PetMD, AKC).',
      'Les os : cuits, ils deviennent cassants et éclatent (AKC), et selon l’ASPCA un os peut boucher l’intestin et rendre une opération nécessaire.',
      'Le bacon, le jambon et la saucisse (AKC, PetMD).',
    ],
    signs: [
      'Trichinellose après du porc cru : troubles digestifs, vomissements, diarrhée, fièvre, abattement et douleurs musculaires (AKC).',
    ],
    usdaName: 'de longe de porc maigre rôtie',
    piece: {
      a: 'une portion',
      one: 'portion de 100 g',
      many: 'portions de 100 g',
      grams: 100,
      basis: 'la quantité de référence des tables nutritionnelles',
    },
    sizeGuide: {
      note: 'Les quantités de PetMD, en morceaux d’environ 1,3 cm de long et 1,3 cm d’épaisseur, les catégories de poids converties en kilogrammes.',
      rows: [
        ['Très petit (1 à 5 kg)', '1 morceau'],
        ['Petit (5 à 9 kg)', '1 à 2 morceaux'],
        ['Moyen (10 à 23 kg)', '2 à 3 morceaux'],
        ['Grand (23 à 41 kg)', '3 à 4 morceaux'],
        ['Très grand (à partir de 41 kg)', '4 à 5 morceaux'],
      ],
    },
    questions: [
      {
        question: 'Mon chien peut-il manger des os de porc ?',
        answer:
          'Non. L’AKC écrit que les os cuits deviennent fragiles et cassants et peuvent éclater, et selon l’ASPCA un os avalé peut blesser ou boucher l’intestin, parfois jusqu’à l’opération.',
      },
      {
        question: 'Mon chien peut-il manger du porc cru ?',
        answer:
          'Non. Le porc cru peut transmettre la trichine (Trichinella spiralis) et des salmonelles (PetMD, AKC). Faites-le cuire complètement.',
      },
    ],
    sources: [],
  },
  {
    id: 'ham',
    name: 'Jambon',
    some: 'du jambon',
    answer: 'le jambon est trop salé et trop gras',
    short: 'Mieux vaut éviter',
    summary:
      'Le jambon n’est pas toxique, mais il est salé et gras : PetMD et l’AKC déconseillent tous deux d’en faire une friandise.',
    why: [
      'PetMD écrit que le jambon n’est pas toxique pour les chiens, mais que ce n’est pas une friandise adaptée ; l’AKC le déconseille et préfère des friandises plus saines.',
      'Les raisons sont le sel et la graisse. Selon l’AKC, trop de sel peut être toxique pour les chiens, et les nitrates et nitrites du jambon salé ajoutent encore du sodium. Le jambon en tranches de l’USDA contient 814 mg de sodium pour 100 g. Sa graisse augmente en outre le risque de pancréatite (AKC, PetMD).',
    ],
    serve: [
      'Un petit morceau tombé par terre : selon PetMD, votre chien devrait alors aller tout à fait bien.',
      'Appelez votre vétérinaire s’il en a mangé beaucoup ou s’il montre l’un des signes ci-dessous (PetMD).',
    ],
    never: [
      'Les os de jambon : cuits, ils éclatent facilement selon PetMD et peuvent étouffer un chien ou boucher son intestin.',
      'Le jambon glacé ou au miel, à cause du sucre (PetMD).',
    ],
    signs: [
      'Abattement, perte d’appétit, bave, douleurs abdominales, vomissements et diarrhée (PetMD). Trop de sel : soif, urines abondantes, vomissements et diarrhée, et dans les cas graves des lésions des reins, des convulsions et un coma (AKC).',
    ],
    usdaName: 'de jambon en tranches (environ 11 % de matières grasses)',
    piece: {
      a: 'une tranche de jambon',
      one: 'tranche',
      many: 'tranches',
      basis: 'USDA : 1 tranche = 28 g',
    },
    questions: [
      {
        question: 'Mon chien peut-il avoir un peu du jambon de Noël ?',
        answer:
          'Pas comme friandise : le jambon glacé ajoute du sucre au sel et à la graisse (PetMD), et l’os éclate. Un petit reste n’est pas une urgence ; pour un os ou beaucoup de jambon, appelez votre vétérinaire.',
      },
    ],
    sources: [],
  },
  {
    id: 'bacon',
    name: 'Bacon',
    some: 'du bacon',
    answer: 'le bacon est trop gras et trop salé',
    short: 'Mieux vaut éviter',
    summary:
      'Le bacon est gras et très salé, un risque de pancréatite et d’intoxication au sel ; les sources vétérinaires le déconseillent.',
    why: [
      'Le guide de Chewy, relu par des vétérinaires, dit que les chiens ne devraient pas manger de bacon, et l’AKC range le bacon et le jambon parmi les produits à base de porc que les chiens ne devraient pas recevoir.',
      'Les raisons sont la graisse et le sel. Merck compte l’ingestion de grandes quantités de restes de table ou d’autres aliments inadaptés parmi les facteurs de risque fréquents de la pancréatite, et FirstVet qualifie la pancréatite d’urgence potentiellement mortelle. Le bacon cuit au four de l’USDA contient 2\u202f193 mg de sodium pour 100 g. Chewy ajoute que les nitrites qui servent à le conserver peuvent nuire aux chiens.',
    ],
    serve: [
      'Une seule tranche chapardée n’est en général pas une urgence, mais surveillez les signes ci-dessous.',
      'Chewy conseille d’appeler aussitôt votre vétérinaire si votre chien vomit, a la diarrhée, est abattu ou ne mange plus ; selon FirstVet, des douleurs abdominales demandent un traitement d’urgence.',
    ],
    never: [
      'Le bacon, la graisse de cuisson du bacon et les restes de gras.',
      'Le bacon cru, qui a les risques du porc cru (PetMD, ASPCA).',
    ],
    signs: [
      'Diarrhée, vomissements et malaise peu après (Chewy). Pancréatite : perte d’appétit, vomissements, faiblesse, douleurs abdominales, déshydratation et diarrhée (Merck). Trop de sel : tremblements, forte fièvre et convulsions (Chewy).',
    ],
    disagree: [
      'FirstVet écrit que la plupart des chiens supportent des quantités contrôlées de friandises au bacon ; Chewy et l’AKC disent : pas de bacon du tout. PetMD et l’AKC n’ont pas de page consacrée au seul bacon.',
    ],
    usdaName: 'de bacon cuit au four',
    piece: {
      a: 'une tranche de bacon',
      one: 'tranche',
      many: 'tranches',
      basis: 'USDA : 1 tranche cuite = 8,1 g',
    },
    questions: [
      {
        question: 'Mon chien a mangé de la graisse de bacon. Que faire ?',
        answer:
          'La graisse de cuisson du bacon est presque de la graisse pure, justement ce qui augmente le risque de pancréatite. Appelez votre vétérinaire, à plus forte raison pour un petit chien ou une grande quantité, et surveillez les vomissements, les douleurs abdominales et un chien qui ne mange plus (Merck, FirstVet).',
      },
    ],
    sources: [],
  },
];
