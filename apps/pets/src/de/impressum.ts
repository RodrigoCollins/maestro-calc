/**
 * TODO(owner): the Impressum of the German pages, NOT PUBLISHED.
 *
 * § 5 Digitale-Dienste-Gesetz (DDG, formerly § 5 TMG) asks every provider of a commercial digital
 * service, "geschäftsmäßige, in der Regel gegen Entgelt angebotene digitale Dienste", to keep
 * easily found and always available: the name and the postal address of the establishment (a legal
 * entity adds its legal form and representative), a fast electronic contact including an email
 * address, and, where they exist, the register and its number and the VAT or business id
 * (https://www.gesetze-im-internet.de/ddg/__5.html, read 2026-11-10). An ad-supported site counts
 * as commercial. The privacy page (Datenschutzerklärung, Art. 13 GDPR) also needs the controller's
 * name and contact.
 *
 * None of it may be invented (the site credits its editorial team and never makes up a person),
 * so the page does not exist and German stays closed to search engines (`SITE.deIndexable`). To
 * publish: fill `IMPRESSUM_OWNER`, add `src/pages/de/impressum.astro` rendering `IMPRESSUM_DE`,
 * add the route and the footer link, and flip `SITE.deIndexable`, all in one merge. The tests of
 * `trust.test.ts` hold the switch closed until then.
 */
export const IMPRESSUM_OWNER = {
  /** The operator: a person's full name, or a company's name with its legal form. */
  name: '',
  /** A postal address where the operator can be served (a P.O. box is not enough). */
  address: '',
  /** An email address that is read. */
  email: '',
};

/** Whether the owner has given every detail § 5 DDG requires. */
export const impressumReady = (): boolean =>
  Object.values(IMPRESSUM_OWNER).every((value) => value.trim() !== '');

/** The text of the Impressum once the owner details are in (the page renders it as written). */
export const IMPRESSUM_DE = {
  title: 'Impressum | Bowl Figures',
  description:
    'Impressum von Bowl Figures: Anbieter, Anschrift und Kontakt nach § 5 DDG, und wer für die Inhalte verantwortlich ist.',
  h1: 'Impressum',
  sections: [
    { heading: 'Angaben gemäß § 5 DDG', lines: [IMPRESSUM_OWNER.name, IMPRESSUM_OWNER.address] },
    { heading: 'Kontakt', lines: [`E-Mail: ${IMPRESSUM_OWNER.email}`] },
    {
      heading: 'Redaktion',
      lines: [
        'Die Inhalte schreibt und prüft die Redaktion Bowl Figures nach ihren redaktionellen Grundsätzen.',
      ],
    },
  ],
} as const;
