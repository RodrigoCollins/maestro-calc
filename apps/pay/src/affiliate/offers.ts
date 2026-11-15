import type { AffiliateOffer } from '@maestro-calc/site-kit/affiliate';

/**
 * The affiliate offers of the site, in the order a page lists them. A link reaches a page only as
 * data here, never written into a page: a page shows `enabledOffers(OFFERS)` through
 * `AffiliateBlock.astro`, and only the employer pages (`../guide/employers.ts`) show any. Each entry
 * stays `enabled: false` with an empty `url` until its program approves the site and its tracked
 * https link is checked by hand; `network` is set again then, from the program's own terms. An
 * offer has no price field on purpose: the dated plan facts live in the comparison table.
 */
const offer = (id: string, name: string, en: string, es: string): AffiliateOffer<'en' | 'es'> => ({
  id,
  network: 'impact',
  name,
  why: { en, es },
  url: '',
  enabled: false,
});

export const OFFERS: readonly AffiliateOffer<'en' | 'es'>[] = [
  offer(
    'clockify',
    'Clockify',
    'A time tracker with a free plan for a small team; its paid plans add more.',
    'Un registro de horas con plan gratis para un equipo pequeño; sus planes pagos suman más funciones.',
  ),
  offer(
    'jibble',
    'Jibble',
    'A time clock app whose free plan has no user limit.',
    'Una app de reloj checador cuyo plan gratis no tiene límite de usuarios.',
  ),
  offer(
    'connecteam',
    'Connecteam',
    'A crew app with a time clock, free for up to 10 users.',
    'Una app para cuadrillas con reloj checador, gratis hasta 10 usuarios.',
  ),
  offer(
    'deputy',
    'Deputy',
    'Scheduling and time clock for shift teams, priced per user.',
    'Horarios y reloj checador para equipos por turnos, con precio por usuario.',
  ),
  offer(
    'gusto',
    'Gusto',
    'Payroll that can take the hours from a time clock.',
    'Nómina que puede tomar las horas de un reloj checador.',
  ),
  offer(
    '7shifts',
    '7shifts',
    'Scheduling and time clock built for restaurants.',
    'Horarios y reloj checador pensados para restaurantes.',
  ),
];

const TAX_WHY = {
  en: 'Online tax software to prepare and e-file your federal return.',
  es: 'Un programa en línea para preparar y presentar por internet tu declaración federal.',
};

/**
 * The tax software the two tax guides (no tax on tips and overtime, W-2 box 12) may show in the
 * filing season, both CJ programs of docs/affiliate-rules.md (FreeTaxUSA declined the site, so it
 * has no slot). They stay disabled with an empty url until the program approves the site and the
 * owner enables them; the `why` claims nothing about what a product supports or costs.
 */
export const TAX_OFFERS: readonly AffiliateOffer<'en' | 'es'>[] = [
  { ...offer('turbotax', 'TurboTax', TAX_WHY.en, TAX_WHY.es), network: 'cj' },
  { ...offer('taxact', 'TaxAct', TAX_WHY.en, TAX_WHY.es), network: 'cj' },
];
