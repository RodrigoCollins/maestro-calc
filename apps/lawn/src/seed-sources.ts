import { FROST_SOURCE } from '@maestro-calc/lawn-data/frost/source';

/** The day the extension publications below were read. */
export const READ = '2026-11-08';
const read = (name: string): string => `${name}, accessed ${READ}`;

export const VIRGINIA = {
  name: read('Virginia Cooperative Extension 426-718, “Establishing Lawns”'),
  url: 'https://vtechworks.lib.vt.edu/bitstreams/b0fdf313-cafa-4f60-a85b-68637d6bbd3c/download',
};
export const PURDUE_SEED = {
  name: read('Purdue Extension AY-3-W, “Establishing Turfgrass Areas From Seed”'),
  url: 'https://www.extension.purdue.edu/extmedia/ay/ay-3-w.pdf',
};
export const PURDUE_FINE_FESCUE = {
  name: read('Purdue Extension TURF-64-W, “Fine Fescues: Establishment of Fine Fescues”'),
  url: 'https://www.extension.purdue.edu/extmedia/TURF-64-W.pdf',
};
export const TENNESSEE = {
  name: read('University of Tennessee W160-B, “Turfgrass Establishment: Seeding” (2007)'),
  url: 'https://uthort.tennessee.edu/wp-content/uploads/sites/228/2023/11/W160-B.pdf',
};
export const AGRILIFE = {
  name: read('Texas A&M AgriLife Extension B-6239, “Turfgrass Establishment for Texas”'),
  url: 'https://agrilifeextension.tamu.edu/wp-content/uploads/2026/03/Turfgrass-Establishment-for-Texas.pdf',
};
export const ST_AUGUSTINE = {
  name: read('Texas A&M AgriLife Extension EHT-144, “St. Augustinegrass Lawn Management”'),
  url: 'https://agrilifeextension.tamu.edu/wp-content/uploads/2025/07/St.-Augustinegrass-Lawn-Management.pdf',
};
export const NC_STATE = {
  name: read('NC State Extension Gardener Handbook, chapter 9, “Lawns”'),
  url: 'https://content.ces.ncsu.edu/extension-gardener-handbook/9-lawns',
};
export const NC_STATE_CENTIPEDE = {
  name: read('NC State Extension, “Centipedegrass Lawn Maintenance Calendar”'),
  url: 'https://content.ces.ncsu.edu/centipedegrass-lawn-maintenance-calendar',
};
export const TURFFILES = {
  name: read('NC State TurfFiles, “Time for Fall Seeding of Tall Fescue” (2025)'),
  url: 'https://www.turffiles.ncsu.edu/news/time-for-fall-seeding-of-tall-fescue/',
};
export const ARKANSAS = {
  name: read(
    'University of Arkansas MP476, “Establishing Seeded Zoysiagrass on Lawns and Golf Courses”',
  ),
  url: 'https://www.uaex.uada.edu/publications/PDF/MP476.pdf',
};
export const ALABAMA_CENTIPEDE = {
  name: read('Alabama Cooperative Extension System, “Home Lawns: Centipedegrass” (2020)'),
  url: 'https://www.aces.edu/blog/topics/lawn-garden/home-lawns-centipedegrass/',
};
export const NEBRASKA_BUFFALO = {
  name: read(
    'University of Nebraska–Lincoln Extension G1946, “Establishing Buffalograss Turf in Nebraska” (2009)',
  ),
  url: 'https://extensionpubs.unl.edu/publication/g1946/2009/html/view',
};
export const COLORADO_BUFFALO = {
  name: read('Colorado State University Extension, “Buffalograss Lawns” (reviewed 2025)'),
  url: 'https://extension.colostate.edu/resource/buffalograss/',
};
export const NOAA = {
  name: `NOAA NCEI U.S. Climate Normals 1991-2020, annual/seasonal product, accessed ${FROST_SOURCE.pulled}`,
  url: 'https://www.ncei.noaa.gov/data/normals-annualseasonal/1991-2020/access/',
};

/** Links the grass pages share. */
export const SEED_CALCULATOR = { href: '/grass-seed-calculator', label: 'Grass seed calculator' };
export const BEST_SEED_LINK = { href: '/best-grass-seed', label: 'Best grass seed by region' };
/** The UK sowing guide and the germination guide (`uk-guides.ts`). */
export const UK_LINK = {
  href: '/when-to-sow-grass-seed-uk',
  label: 'When to sow grass seed in the UK',
};
export const GROWING_LINK = {
  href: '/how-long-does-grass-seed-take-to-grow',
  label: 'How long grass seed takes to grow',
};
/** The aeration and pre-emergent guides (`aeration-guides.ts`). */
export const AERATION_LINK = { href: '/when-to-aerate-lawn', label: 'When to aerate your lawn' };
export const PRE_EMERGENT_LINK = {
  href: '/when-to-apply-pre-emergent',
  label: 'When to apply pre-emergent',
};
export const PLANTING_LINK = {
  href: '/when-to-plant-grass-seed',
  label: 'When to plant grass seed',
};
