/**
 * The path copied and shared links start with (embed): the canonical's path when the page has one,
 * else the page's own. A routed page's canonical is its own path, so nothing changes there; an
 * embed's canonical is the full page, so a link shared from an embed opens the real page.
 */
export const linkPathOf = (canonical: string | null, path: string): string => {
  if (canonical === null || canonical === '') return path;
  try {
    return new URL(canonical).pathname;
  } catch {
    return path;
  }
};
