# embed

## Requirements

### Requirement: Embed pages

Each calculator page MUST have an embed in each language at `/embed` + its path, derived from `CALCULATOR_PAGES`. An embed MUST show the calculator body with no breadcrumb, under a header holding the wordmark (to the full page) and the language switch (to the other language's embed, `target="_self"`); it MUST open every other link in a new tab (`<base target="_blank">`), load the full page's module script and no analytics, be `noindex` with the full page as canonical, and carry no `hreflang` alternate and no JSON-LD. It is not in the route table or the sitemap.

#### Scenario: [EM1] Embed works in a frame of another site
- GIVEN an https page of another origin framing `/embed/concrete-calculator`
- WHEN a length of 20 is typed in the frame
- THEN the calculator answers and the WhatsApp link carries `/concrete-calculator?v=1&l=240`, not `/embed/`

#### Scenario: [EM2] Language switch stays in the frame
- GIVEN the English embed in a frame
- WHEN the language switch is pressed
- THEN the frame shows the Spanish embed

### Requirement: Links lead to the real page

The copy and WhatsApp links MUST be built from the canonical's path when the page has a canonical, else from the page's path.

### Requirement: Framing only there

`/embed/*` MUST be served the site's policy with `frame-ancestors *` instead of `'none'` and without the analytics hosts; every other path MUST keep `frame-ancestors 'none'`.

#### Scenario: [EM3] A site page refuses to be framed
- GIVEN an https page of another origin framing `/concrete-calculator`
- THEN the browser blocks it for `frame-ancestors`

### Requirement: Embed checks

`check:site` MUST expect every embed file, flag a missing one, and check each against the embed rules (canonical, `noindex`, no alternate or JSON-LD, `<base target="_blank">`, one `h1`, the full page's module scripts, no analytics, the switch, the HTML budget).

### Requirement: The snippet page

`/embed-calculators` and `/es/calculadoras-para-tu-sitio` MUST list, under an intro, one snippet per calculator in the page language, built from the embeds: an `<iframe>` of the embed (title the calculator's name, `width="100%"`, `height="900"`, `loading="lazy"`, `allow="clipboard-write"`) followed by a paragraph with a link to the full page reading "<name> by Maestro Calc" ("<name> de Maestro Calc"). The page loads no script and is linked from the footer.

#### Scenario: [EM4] Concrete snippet in Spanish
- GIVEN `/es/calculadoras-para-tu-sitio`
- THEN the Concrete section holds an iframe of `https://maestrocalc.com/embed/es/calculadora-de-concreto` and a link to `https://maestrocalc.com/es/calculadora-de-concreto` reading "Calculadora de Concreto de Maestro Calc"
