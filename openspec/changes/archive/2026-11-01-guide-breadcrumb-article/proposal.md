# Proposal: guide-breadcrumb-article

## Intent

The last follow-ups of the guides change (decision 6) and PLAN §7.3 "breadcrumbs en todo el sitio" for guides: each guide opens with the same two-item breadcrumb as a calculator page, and declares an `Article` with its `BreadcrumbList`. Also marks the pending copy approved.

## Decisions

1. **Same breadcrumb as a calculator page.** `TrustPageView` renders `components/calculator/Breadcrumb.astro` before the article on a guide (Inicio / Home, then the guide's `#` heading). Its three CSS rules move from `calculator.css` to `base.css`, the stylesheet every page loads; calculator pages render the same.
2. **`guideJsonLd`**: `Article` (headline = h1, url = canonical, inLanguage, dateModified = `updated`, author and publisher = the organization; no image, rating or person) and the same `BreadcrumbList` builder as calculator pages, now shared (`breadcrumbOf`).
3. **check:site holds it.** `content.ts`: a guide page has exactly an `Article` and a `BreadcrumbList` and no other type; the Article's headline, url, language and date are checked against the page. The per-type check is now one `typedNodeProblems`, used by calculator and guide pages. `structure.ts`: a guide page needs a labelled `ol` before its `h1`. Other trust pages keep `BreadcrumbList` forbidden.
4. **Copy approved by delegation.** On 2026-11-01 the owner pre-approved everything waiting on his approval; the 14 entries with `ownerReview: pending` (the embed page and guides 1 to 6, EN/ES) are set to `approved`. He may still read them; a correction is an ordinary edit.
5. **Also archives** `guide-concrete-quote`, verified in production after #167.
