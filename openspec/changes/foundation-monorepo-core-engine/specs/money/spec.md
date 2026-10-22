# Delta for money

Package: `@maestro-calc/core`. Exact money amounts for editable material prices (PLAN.md §4.2). Depends on `exact-rational`, `units-quantities`, and `fraction-format` (decimal display rounding). Money is a value type, not a physical dimension.

Scope of this change: a single currency, US dollars (`USD`). Multi-currency, taxes, and currency formatting (symbol placement, separators) are out of scope; localized rendering is a web concern using the parts defined here.

## ADDED Requirements

### Requirement: Exact money value

`Money` MUST be an immutable value `{ currency: 'USD', amount: Rational }` where `amount` is an exact Rational number of dollars. Amounts MUST NOT be rounded to cents when stored or computed: sub-cent unit prices (for example `$0.37/ft2`, `$0.333` per unit) and every intermediate result stay exact. `usd(amount)` constructs a value from a Rational (or safe integer). The operations `addMoney`, `subMoney`, `compareMoney`, `equalsMoney`, `scaleMoney(m, k)` (exact Rational factor), and `multiplyCount(m, n)` (non-negative safe-integer `number` or `bigint` count, for example the result of `ceilToPurchaseUnits`) MUST be provided. Money values MUST NOT be mixed with quantities in `add`/`sub` (compile-time error; `DIMENSION_MISMATCH` at runtime for untyped callers). Results MAY be negative (for example a difference); non-negativity is enforced by the `money` field kind, not by the value type.

Source: exact rational arithmetic (`exact-rational`); no external source.

#### Scenario: Price times count
- GIVEN `usd(498/100)` ($4.98 per bag) and the count `3`
- WHEN `multiplyCount` is applied
- THEN the amount is exactly `747/50` (3 x 249/50 = 747/50 = 14.94)

#### Scenario: Sub-cent amounts stay exact
- GIVEN `usd(333/1000)` ($0.333) and the count `3`
- WHEN multiplied
- THEN the amount is exactly `999/1000` (not `1`), and it displays as `1.00` (see display rounding)

#### Scenario: Count from the purchase ceiling
- GIVEN `usd(249/50)` and `ceilToPurchaseUnits(7/2) = 4n`
- WHEN `multiplyCount` is applied
- THEN the amount is exactly `498/25` (4 x 249/50 = 996/50 = 19.92)

### Requirement: Unit prices

`unitPrice(m, unit)` MUST create a typed price "`m` per one `unit`" for any unit of `units-quantities`, stored per canonical unit (`m / factor(unit)`) as an exact Rational. `costOf(price, q)` MUST return `Money` equal to the price times the quantity, exactly, for a quantity `q` of the same dimension in any unit. A dimension mismatch MUST be a compile-time error and MUST throw `DIMENSION_MISMATCH` at runtime.

Formula: cost = price per unit x quantity expressed in that unit.

#### Scenario: Price per square foot times area
- GIVEN `unitPrice(usd(37/100), ft2)` ($0.37/ft2) and the area `125 ft2` (for example 10 ft x 12 ft 6 in)
- WHEN `costOf` is applied
- THEN the amount is exactly `185/4` (37/100 x 125 = 4625/100 = 185/4 = 46.25)

#### Scenario: Price applies across units of the same dimension
- GIVEN `unitPrice(usd(37/100), ft2)` and the area `1 yd2`
- WHEN `costOf` is applied
- THEN the amount is exactly `333/100` (1 yd2 = 9 ft2; 37/100 x 9 = 3.33)

#### Scenario: Mismatched dimension
- GIVEN a price per `ft2` and a length quantity
- WHEN `costOf` is type-checked
- THEN the typecheck gate rejects it, and an untyped runtime call throws `DIMENSION_MISMATCH`

### Requirement: Display rounding to cents

`toCents(m)` MUST return `toDecimalParts(m.amount, 2, 'nearest')` (`fraction-format`): rounding to the nearest cent with ties away from zero, applied only at display time. The stored amount is never changed.

Hand-verified examples:

| amount | x 100 | display |
|---|---|---|
| 747/50 | 1494 | 14.94 |
| 185/4 | 4625 | 46.25 |
| 37/8 (4.625; $0.37/ft2 x 12.5 ft2 = 37/100 x 25/2 = 925/200) | 462.5 (tie) | 4.63 |
| 999/1000 | 99.9 | 1.00 |
| -1/200 | -0.5 (tie) | -0.01 |

#### Scenario: Cents table
- GIVEN the table above
- WHEN `toCents` is applied
- THEN each display matches exactly (for example `37/8` gives `{ negative: false, integer: 4, fraction: "63" }`)

### Requirement: Money text grammar

`parseMoney(text)` MUST convert user text to `Money` exactly, never via `number`, or return a failure with exactly one `{ code }`. The calculator contract trims `ws` before calling it.

```
money   := "$"? udecimal                  (no whitespace anywhere)
udecimal:= digits ( "." digits )? | "." digits
digits  := [0-9]+
```

- Any comma anywhere fails `DECIMAL_COMMA` (so `1,000` is never read as 1).
- Any digit run longer than 18 digits fails `TOO_LARGE`.
- Empty text fails `EMPTY`.
- Anything else (a sign, `$` alone, `$` after the number, whitespace after `$`, currency words, exponent forms, more than one `.`) fails `MALFORMED`.
- Fractional digits are kept exactly, up to the 18-digit run limit above (which applies to every digit run, integer or fractional, consistent with `parseLength`).
- The function never throws. Precedence: `EMPTY`, then `DECIMAL_COMMA`, then `TOO_LARGE`, then `MALFORMED`.

#### Scenario: Accepted spellings
- GIVEN `4.98`, `$4.98`, `$0.37`, `.5`, `$12`, `4.987`, `007`
- WHEN parsed
- THEN amounts are `249/50`, `249/50`, `37/100`, `1/2`, `12`, `4987/1000`, `7`

#### Scenario: Rejections
- GIVEN `1,000`, `4,98`, `-5`, `$-5`, `$ 5`, `5$`, `USD 5`, `$`, `1e3`, `""`, and `1234567890123456789` (19 digits)
- WHEN parsed
- THEN codes are `DECIMAL_COMMA`, `DECIMAL_COMMA`, `MALFORMED`, `MALFORMED`, `MALFORMED`, `MALFORMED`, `MALFORMED`, `MALFORMED`, `MALFORMED`, `EMPTY`, `TOO_LARGE`

### Requirement: Money field kind

The calculator contract MUST support a `money` field kind (see `calculator-contract`): raw strings parsed by `parseMoney`, or a `Money` value; optional inclusive `min` (default `usd(0)`, which MUST NOT be negative; a negative `Money` passed directly is therefore `BELOW_MIN`, while signed text is already `MALFORMED`) and optional `max`; bound `params` are the canonical Rational string of the bound in dollars. In URLs the value is the canonical Rational text of the amount in dollars (`exact-rational` `toString`, for example `249/50` for $4.98), never a rounded decimal, so a shared link reproduces the exact unit price.

#### Scenario: URL value is exact
- GIVEN a money field whose value is `$0.37` and whose default differs
- WHEN encoded
- THEN its value text is `37/100`, and decoding it yields exactly `usd(37/100)`
