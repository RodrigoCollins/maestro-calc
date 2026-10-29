// Global site settings. The tagline lives in the `site` catalog, not here.
export const SITE = {
  name: 'Maestro Calc',
  url: 'https://maestrocalc.com',
  author: {
    name: 'Maestro Calc Editorial Team',
    role: 'Editorial team',
    url: '/about',
  },
  // Filled in once AdSense is approved; ad slots render nothing while empty.
  adsenseClient: '',
  // Google Tag Manager container (public: it ships in every page). '' renders no analytics tag.
  gtmId: 'GTM-MD8H6L5S' as string,
  contactEmail: 'contacto@maestrocalc.com',
} as const;
