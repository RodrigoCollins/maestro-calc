/**
 * The link preview of a page (plans/growth/PLAN.md › G7), as the layout of each niche site writes
 * it: the page title and description, the one `og.png` of 1200 by 630 on the origin, a large card.
 */
export const linkPreviewOf = (
  origin: string,
  { title, description }: { readonly title: string; readonly description: string },
) =>
  ({
    'og:title': title,
    'og:description': description,
    'og:image': new URL('/og.png', origin).href,
    'og:image:width': '1200',
    'og:image:height': '630',
    'twitter:card': 'summary_large_image',
  }) as const;
