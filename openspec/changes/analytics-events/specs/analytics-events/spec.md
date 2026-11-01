# analytics-events

## ADDED Requirements

### Requirement: Calculator usage events

A calculator page MUST push to `dataLayer`, when it exists as an array, one `{ event: 'calc_action', calc_action, calc_id }` object per action: `calculate` on the first edit of the page load only, `copy` when the copy button is pressed, `print` when the print button is pressed and `share` when the share link is followed. The object MUST NOT hold any other field, any typed value, URL or query. Where `dataLayer` is absent or not an array, nothing is pushed and nothing fails.

#### Scenario: [AE1] One event per action, never a value
- GIVEN a calculator page on the production host
- WHEN the person types a length twice, copies the link and prints
- THEN `dataLayer` gains exactly `calculate`, `copy` and `print` events with the calculator's id and no other field
