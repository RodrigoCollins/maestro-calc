# analytics-events

## ADDED Requirements

### Requirement: Calculator usage events

A calculator page MUST push to `dataLayer`, when it exists as an array, one `{ event: 'calc_action', calc_action, calc_id }` object per action: `calculate` on the first edit of the page load only, `copy` when the copy button is pressed, `print` when the print button is pressed and `share` when the share link is followed. The object MUST NOT hold any other field, any typed value, URL or query. Where `dataLayer` is absent or not an array, nothing is pushed and nothing fails.

#### Scenario: [AE1] One event per action, never a value
- GIVEN a calculator page on the production host
- WHEN the person types a length twice, copies the link and prints
- THEN `dataLayer` gains exactly `calculate`, `copy` and `print` events with the calculator's id and no other field

### Requirement: Campaign tags reach analytics, values never

The analytics loader MUST offer the GA4 tag the page address with only its `utm_*` parameters, in their order, and the referrer with no query at all. Every other query parameter, which holds calculator values, MUST be left out. A link with campaign tags MUST NOT show the calculator's invalid-link notice: the codec ignores unknown keys.

#### Scenario: [AE2] A TikTok link keeps its campaign and drops the values
- GIVEN `/concrete-calculator?utm_source=tiktok&v=1&l=240&utm_campaign=v01-losa-bolsas`
- THEN `page_location_clean` is `https://maestrocalc.com/concrete-calculator?utm_source=tiktok&utm_campaign=v01-losa-bolsas`
