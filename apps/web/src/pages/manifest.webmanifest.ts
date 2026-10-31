import { manifestResponse } from '../seo/manifest.ts';

/** `/manifest.webmanifest`: the English web app manifest, built at build time. */
export const GET = (): Response => manifestResponse('en');
