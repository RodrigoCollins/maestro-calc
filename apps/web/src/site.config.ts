// Global site settings. The tagline lives in the `site` catalog, not here.
export const SITE = {
  name: 'Maestro Calc',
  url: 'https://maestrocalc.com',
  author: {
    name: 'Maestro Calc Editorial Team',
    role: 'Editorial team',
    url: '/about',
  },
  // AdSense publisher id: the verification meta tag of every page and /ads.txt name it. No ad script
  // loads until a consent banner (CMP) is in place; '' renders no meta tag.
  adsenseClient: 'ca-pub-3954387285316164' as string,
  // Google Tag Manager container (public: it ships in every page). '' renders no analytics tag.
  gtmId: 'GTM-MD8H6L5S' as string,
  contactEmail: 'contacto@maestrocalc.com',
} as const;
