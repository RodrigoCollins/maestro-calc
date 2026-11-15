/**
 * TODO(owner): the mentions légales of the French pages, NOT PUBLISHED.
 *
 * A site published for readers in France must let them identify its publisher (éditeur): the loi
 * n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN) asks a professional
 * publisher for the name (a company adds its legal form and registration), the address, a phone
 * number and an email, the director of publication, and the host's name, address and phone number.
 * The owner checks the exact list for his own status before publishing; an ad-supported site counts
 * as professional. The privacy page (Art. 13 GDPR) also needs the controller's name and contact.
 *
 * None of it may be invented (the site credits its editorial team and never makes up a person),
 * so the page does not exist and French stays closed to search engines (`SITE.frIndexable`). To
 * publish: fill `MENTIONS_OWNER`, add `src/pages/fr/mentions-legales.astro` rendering
 * `MENTIONS_LEGALES_FR`, add the route and the footer link, and flip `SITE.frIndexable`, all in one
 * merge. The tests of `trust.test.ts` hold the switch closed until then.
 */
export const MENTIONS_OWNER = {
  /** The publisher: a person's full name, or a company's name with its legal form. */
  name: '',
  /** A postal address where the publisher can be reached. */
  address: '',
  /** A phone number. */
  phone: '',
  /** An email address that is read. */
  email: '',
  /** The director of publication: a person's full name. */
  director: '',
  /** The host as its own terms name it: Cloudflare's legal name, address and phone, read there. */
  host: '',
};

/** Whether the owner has given every detail the mentions légales require. */
export const mentionsReady = (): boolean =>
  Object.values(MENTIONS_OWNER).every((value) => value.trim() !== '');

/** The text of the mentions légales once the owner details are in (the page renders it as written). */
export const MENTIONS_LEGALES_FR = {
  title: 'Mentions légales | Bowl Figures',
  description:
    'Mentions légales de Bowl Figures : éditeur, adresse et contact, directeur de la publication et hébergeur, et qui est responsable des contenus.',
  h1: 'Mentions légales',
  sections: [
    { heading: 'Éditeur', lines: [MENTIONS_OWNER.name, MENTIONS_OWNER.address] },
    {
      heading: 'Contact',
      lines: [`Téléphone : ${MENTIONS_OWNER.phone}`, `E-mail : ${MENTIONS_OWNER.email}`],
    },
    { heading: 'Directeur de la publication', lines: [MENTIONS_OWNER.director] },
    {
      heading: 'Hébergeur',
      lines: [MENTIONS_OWNER.host],
    },
    {
      heading: 'Rédaction',
      lines: [
        'Les contenus sont écrits et vérifiés par la rédaction de Bowl Figures selon ses principes éditoriaux.',
      ],
    },
  ],
} as const;
