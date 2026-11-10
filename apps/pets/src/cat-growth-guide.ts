import {
  CAT_FEEDING_CHECKED,
  CAT_FEEDING_SOURCES,
  KITTEN_WEIGHTS,
  kittenRow,
} from './cat-feeding.ts';
import type { Guide, PageSource } from './guides.ts';
import { hrefOf } from './routes.ts';

/** The sources of the growth guide, each read on `CAT_FEEDING_CHECKED`. */
const SOURCES = {
  aafp: {
    name: '2021 AAHA/AAFP Feline Life Stage Guidelines (Quimby et al., JAAHA 2021;57:51–72), life stages and kitten nutrition',
    url: 'https://www.aaha.org/wp-content/uploads/globalassets/02-guidelines/feline-life-stage-2021/2021-aaha-aafp-feline-life-stage-guidelines.pdf',
  },
  petmd: {
    name: 'PetMD, When Do Cats Stop Growing? (Hannah Hart, DVM, November 11, 2024)',
    url: 'https://www.petmd.com/cat/general-health/when-do-cats-stop-growing',
  },
  root: {
    name: 'Root MV, Johnston SD, Olson PN. The effect of prepuberal and postpuberal gonadectomy on radial physeal closure in male and female domestic cats. Vet Radiol Ultrasound 1997;38(1):42–47',
    url: 'https://pubmed.ncbi.nlm.nih.gov/9238769/',
  },
  perry: {
    name: 'Perry KL, Fordham A, Arthurs GI. Effect of neutering and breed on femoral and tibial physeal closure times in male and female domestic cats. J Feline Med Surg 2014;16:149–156',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24027051/',
  },
  salt: {
    name: 'Salt C, German AJ, Henzel KS, Butterwick RF. Growth standard charts for monitoring bodyweight in intact domestic shorthair kittens from the USA. PLoS One 2022;17(11):e0277531',
    url: 'https://doi.org/10.1371/journal.pone.0277531',
  },
} as const satisfies Record<string, PageSource>;

const [, kittenFour = '', adultFour = ''] = kittenRow(4);

/** The guide `/when-do-cats-stop-growing`: the age, the growth plates, and the food while it lasts. */
export const CAT_GROWTH_GUIDE: Guide = {
  path: '/when-do-cats-stop-growing',
  title: 'When Do Cats Stop Growing? | Bowl Figures',
  description:
    'Most cats reach adult size at 12 to 18 months; large breeds can grow to 2 or later. The life stages, the growth plate studies and a kitten’s calories.',
  h1: 'When do cats stop growing?',
  lead: 'Most cats reach their adult size between 12 and 18 months of age, and the veterinary life stage guidelines count a cat as a kitten until its first birthday. Large breeds such as the Maine Coon can keep filling out until 2 or later.',
  checked: CAT_FEEDING_CHECKED,
  sections: [
    {
      id: 'age',
      heading: 'The age most cats stop growing',
      paragraphs: [
        'The 2021 AAHA/AAFP Feline Life Stage Guidelines set the kitten stage from birth up to 1 year, and the young adult stage from 1 year through 6 years. They are stages of care, not a measure of size, but they mark the year in which nearly all of the growth happens.',
        'PetMD’s veterinarian-written guide puts full adult size at 12 to 18 months, with variation by sex and breed: females often finish around 10 to 12 months, males can go on to 18 months, and small breeds may be done by 9 months.',
      ],
    },
    {
      id: 'breeds',
      heading: 'Large breeds grow for longer',
      paragraphs: [
        'Big, slow-maturing breeds such as the Maine Coon and the Norwegian Forest Cat can keep growing until they are 2 years old, or later in some cats (PetMD). A large kitten of such a breed is not overweight just because it is still gaining after its first birthday; your veterinarian can tell growth from fat with a body condition score.',
      ],
    },
    {
      id: 'plates',
      heading: 'What the growth plates show',
      paragraphs: [
        'A bone grows in length at its growth plates (physes), which close when growth ends. A veterinarian can check whether they are still open on an X-ray.',
        'Root, Johnston and Olson followed kittens neutered at 7 weeks, neutered at 7 months, or left intact, with X-rays of the foreleg from 4 months until the radius stopped growing or 24 months. Neutering at either age delayed the closure of the plates and left a slightly longer radius; no growth spurt at puberty was seen in any cat.',
        'A 2014 study of the hip and knee X-rays of 808 cats found that the plates closed later in neutered than in intact males, with no such difference in females and no effect of pedigree breed. Neither study says when to neuter: that is a decision to make with your veterinarian.',
      ],
    },
    {
      id: 'food',
      heading: 'Feeding while a kitten grows',
      paragraphs: [
        'The 2021 guidelines give a growing kitten about 200 kcal per kg of body weight a day at 10 weeks, against about 80 kcal per kg at 10 months: the need per pound falls fast as growth slows. The Merck Veterinary Manual feeds a healthy kitten 2.5 times its resting energy and a neutered adult 1.2 times.',
        `At the same 4 lb, that is ${kittenFour} kcal a day for a kitten against ${adultFour} for a neutered adult, about twice as much. Moving a cat to adult food and adult amounts when it stops growing helps keep the weight it gains as an adult in check; ask your veterinarian when to switch.`,
      ],
    },
  ],
  table: {
    after: 'food',
    id: 'kitten-calories',
    heading: 'A kitten’s calories against an adult’s, by weight',
    paragraphs: [
      'Calories a day from 70 × (weight in kg)^0.75, times 2.5 for a kitten and 1.2 for a neutered adult (Merck), worked by the engine of the kitten and cat food calculators.',
    ],
    columns: ['Weight (lb)', 'Kitten: calories a day', 'Neutered adult: calories a day'],
    rows: KITTEN_WEIGHTS.map(kittenRow),
    linksHeading: 'Turn the calories into cups or cans with your own food’s label:',
    links: [
      { href: hrefOf('kitten'), label: 'Kitten feeding calculator' },
      { href: hrefOf('cat-chart'), label: 'Cat feeding chart for adult cats, 4 to 20 lb' },
    ],
  },
  questions: [
    {
      question: 'Is my cat full grown at 1 year?',
      answer:
        'Usually close to it. The guidelines end the kitten stage at 1 year, and most cats reach their adult size between 12 and 18 months; large breeds can take 2 years or more.',
    },
    {
      question: 'When do Maine Coons stop growing?',
      answer:
        'Later than most cats: PetMD notes that large breeds such as the Maine Coon can keep growing until 2 years old or later. Weigh your cat and ask your veterinarian whether it is still growing or gaining fat.',
    },
    {
      question: 'Does neutering change how big a cat gets?',
      answer:
        'In the studies cited here, neutering delayed the closing of the growth plates, and in one the cats ended with a slightly longer radius. It also raises the risk of weight gain, which the 2021 guidelines flag as the moment to review how much a kitten eats.',
    },
    {
      question: 'How can I tell whether my kitten is growing well?',
      answer:
        'Weigh it regularly and have your veterinarian score its body condition. Growth standard charts built from more than 7,000 healthy shorthair kittens found that kittens which climbed across centile lines faster than the charts tended to become overweight by early adulthood.',
    },
  ],
  calculators: [hrefOf('kitten'), hrefOf('cat'), hrefOf('cat-age')],
  sources: [
    SOURCES.aafp,
    SOURCES.petmd,
    SOURCES.root,
    SOURCES.perry,
    SOURCES.salt,
    CAT_FEEDING_SOURCES.merck,
  ],
  card: {
    title: 'When do cats stop growing?',
    summary: 'At 12 to 18 months for most cats, later for large breeds.',
  },
};
