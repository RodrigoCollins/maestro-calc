

### Requirement: Fallback faces without Arial

Each web-font variant MUST have a metric-adjusted fallback face whose `src` tries, by full and PostScript name, Arial, Liberation Sans, Arimo and Roboto (their Bold faces at weight 700), with Capsize's `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override` computed for that variant against Arial (Arial Bold at 700). On a system without Arial, the web fonts arriving after the first paint MUST shift a calculator page by 0.01 or less.

#### Scenario: [SS33] Late fonts on Linux move nothing
- GIVEN Chromium on Linux with Liberation Sans and no Arial, a phone 320 px wide and every woff2 delayed 600 ms
- WHEN `/es/calculadora-de-pendiente-de-techo?v=1&r=9` loads
- THEN the cumulative layout shift is 0.01 or less
