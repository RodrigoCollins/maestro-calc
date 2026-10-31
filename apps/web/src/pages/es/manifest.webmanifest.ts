import { manifestResponse } from '../../seo/manifest.ts';

/** `/es/manifest.webmanifest`: the Spanish web app manifest, built at build time. */
export const GET = (): Response => manifestResponse('es');
