import type { Guide, PageSource } from './guides.ts';
import { hrefOf } from './routes.ts';

/** The day the heat cycle figures and their sources were last read. */
const CHECKED = '2026-11-10';

/** The sources of the heat guide, each read on `CHECKED`. */
const SOURCES = {
  merck: {
    name: 'Merck Veterinary Manual, Management of Reproduction in Dogs (Davidson, last updated June 2026)',
    url: 'https://www.merckvetmanual.com/dog-owners/reproductive-disorders-of-dogs/management-of-reproduction-in-dogs',
  },
  merckBreeding: {
    name: 'Merck Veterinary Manual, Breeding Management of Bitches (Davidson, last updated July 2026)',
    url: 'https://www.merckvetmanual.com/management-and-nutrition/management-of-reproduction-dogs-and-cats/breeding-management-of-dogs-and-cats',
  },
  cornell: {
    name: 'Cornell University College of Veterinary Medicine, Riney Canine Health Center, Dog estrous cycles (July 2023)',
    url: 'https://www.vet.cornell.edu/dog-estrous-cycles',
  },
  akc: {
    name: 'American Kennel Club, How Often Do Dogs Go Into Heat? (Gemma Johnstone, updated August 12, 2026)',
    url: 'https://www.akc.org/expert-advice/dog-breeding/dogs-in-heat/',
  },
  akcLength: {
    name: 'American Kennel Club, How Long Are Dogs in Heat? (Gemma Johnstone, updated March 3, 2025)',
    url: 'https://www.akc.org/expert-advice/health/how-long-dogs-in-heat/',
  },
} as const satisfies Record<string, PageSource>;

/** The average days of proestrus and of estrus in Merck, whose sum the lead gives. */
const PROESTRUS_DAYS = 9;
const ESTRUS_DAYS = 9;

/** The guide `/dog-in-heat`: how long a heat lasts, the stages, the signs and when to call. */
export const DOG_HEAT_GUIDE: Guide = {
  path: '/dog-in-heat',
  title: 'Dog in Heat: How Long Does It Last? | Bowl Figures',
  description:
    'A heat lasts about 18 days on average, 9 of proestrus and 9 of estrus, about every 7 months. The four stages, the signs, the first heat and when to call a vet.',
  h1: 'Dog in heat: how long does it last?',
  lead: `A dog’s heat lasts about ${String(PROESTRUS_DAYS + ESTRUS_DAYS)} days on average: about ${String(PROESTRUS_DAYS)} days of proestrus, when she bleeds and attracts males, then about ${String(ESTRUS_DAYS)} of estrus, when she accepts them (Merck Veterinary Manual). Most dogs come into heat about every 7 months, so roughly twice a year.`,
  checked: CHECKED,
  sections: [
    {
      id: 'length',
      heading: 'How long a heat lasts',
      paragraphs: [
        'What owners call being in heat, or in season, is two stages of the cycle: proestrus and estrus (Cornell). Merck gives each about 9 days on average, but proestrus can run from 2 days to 3 weeks and estrus from 3 days to 3 weeks, so the whole heat varies a lot from one dog to another.',
        'The bloody discharge most owners notice usually lasts 14 to 21 days (Cornell), and the AKC puts a typical heat at about three weeks, from two to four. The AKC adds that a first heat can be irregular.',
      ],
    },
    {
      id: 'stages',
      heading: 'The four stages of the cycle',
      paragraphs: [
        'In proestrus she is attractive to males but will not let them mate. In estrus she accepts a male, and she ovulates about 2 to 3 days after her luteinizing hormone (LH) peaks. In diestrus she refuses males again; if she is not pregnant it usually lasts about 2 months. Anestrus is the rest between cycles, with inactive ovaries, and lasts 1 to 6 months (Merck).',
      ],
    },
  ],
  table: {
    after: 'stages',
    id: 'stage-table',
    heading: 'The stages at a glance',
    paragraphs: [
      'The lengths are those of the Merck Veterinary Manual; your own dog may sit anywhere in the range.',
    ],
    columns: ['Stage', 'What you see', 'Average length', 'Range'],
    rows: [
      [
        'Proestrus',
        'Swollen vulva and bloody discharge; males are drawn to her, but she refuses them',
        'About 9 days',
        '2 days to 3 weeks',
      ],
      [
        'Estrus',
        'She accepts a male and ovulates, 2 to 3 days after the LH peak',
        'About 9 days',
        '3 days to 3 weeks',
      ],
      [
        'Diestrus',
        'She refuses males again; the cycle ends or a pregnancy goes on',
        'About 2 months if not pregnant',
        'Not given',
      ],
      ['Anestrus', 'No signs: the rest between two heats', 'Not given', '1 to 6 months'],
    ],
    linksHeading: 'If she was mated, the due date window starts from the breeding day:',
    links: [{ href: hrefOf('due-date'), label: 'Dog pregnancy due date calculator' }],
  },
  questions: [
    {
      question: 'At what age does a dog have her first heat?',
      answer:
        'Anywhere from 6 to 24 months, smaller breeds earlier (Cornell). The AKC gives about 6 to 7 months for small dogs, 7 to 9 for medium dogs and 12 to 16 months for large breeds, with some as early as 4 months and some giant breeds not until 2 years.',
    },
    {
      question: 'How often does a dog go into heat?',
      answer:
        'The interval between cycles is normally 4 to 13 months, with 7 months the average (Merck), so most dogs have two heats a year. The AKC notes that some breeds, such as Basenjis and Tibetan Mastiffs, cycle only once a year.',
    },
    {
      question: 'What are the signs that a dog is in heat?',
      answer:
        'A swollen vulva, a blood-tinged discharge and males taking an interest are the most common signs. She may lick herself and urinate more often, hold her tail to one side (flagging) during estrus, and seem anxious, restless or off her food (AKC).',
    },
    {
      question: 'How do I keep her from getting pregnant during a heat?',
      answer:
        'Keep her on a leash outside and away from intact males for the whole heat; the AKC calls the leash the most effective way to prevent an unwanted pregnancy, and doggy diapers protect the floors. Spaying ends the cycles and prevents pyometra, a uterine infection; Cornell suggests waiting about two months after a heat to spay a dog that is in one, so ask your veterinarian about timing.',
    },
    {
      question: 'When should I call the vet?',
      answer:
        'Pyometra, an infection of the uterus that can be life-threatening, typically shows 4 weeks to 4 months after a heat (AKC). If an unspayed dog drinks and urinates more, eats more or has less energy in the weeks after a heat, call your veterinarian. Ask too if a heat seems to last far longer than the ranges here, or if she has not had one by 2 years, the late end of Cornell’s range.',
    },
  ],
  calculators: [hrefOf('due-date')],
  sources: [SOURCES.merck, SOURCES.merckBreeding, SOURCES.cornell, SOURCES.akc, SOURCES.akcLength],
  card: {
    title: 'Dog in heat',
    summary: 'About 18 days, every 7 months: the stages, the signs and when to call.',
  },
};
