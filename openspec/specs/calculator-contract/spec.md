# calculator-contract

Package: `@maestro-calc/core`. The typed contract every calculator implements. Depends on `exact-rational`, `units-quantities`, `fraction-format`, `money`. The contract is language-free: results carry identifiers and exact values, never display text. Implements PLAN.md §6.1.

Scenarios in this spec use a test-only fixture calculator `fixture-box` with inputs (declaration order):

| key | kind | urlKey | default | constraints |
|---|---|---|---|---|
| `len` | length | `a` | `12 in` | defaultUnit `in`, metricDefaultUnit `cm`, min `0 in`, max `1200 in` (inclusive) |
| `cnt` | count | `b` | `3` | min 0, max 100 |
| `pct` | percent | `c` | `10` | min 0, max 100 |
| `sel` | select | `d` | `x` | options `x`, `y` |
| `flg` | boolean | `e` | `false` | none |
| `prc` | money | `f` | `$4.98` (`usd(249/50)`) | min `$0`, max `$10000` (inclusive) |

and outputs (declaration order): `area` (measure `area`, role `primary`, display `{ unit: 'ft2', format: 'decimal', places: 2 }`) and `cost` (measure `money`, role `secondary`); declared warning codes: `bigCount`.

## Requirements

### Requirement: Field kinds and descriptors

A calculator MUST declare its inputs as an ordered list `inputs` of descriptors. Supported kinds in this change: `length`, `count`, `percent`, `select`, `boolean`, `money`. Every descriptor MUST have a `key`, a `urlKey`, a `default` that is itself valid for the descriptor, and kind-specific constraints:

- `length`: `defaultUnit` (an imperial length unit: `in`, `ft`, or `yd`) and `metricDefaultUnit` (a metric length unit: `mm`, `cm`, or `m`); the one matching the active unit system is applied to unit-less numbers. Optional inclusive `min` and `max` (`Quantity<'length'>`). Value type: `Quantity<'length'>`. The field MUST accept any length unit (imperial and metric) via `parseLength`, regardless of the active unit system.
- `count`: optional inclusive `min` (default 0) and `max` (default `Number.MAX_SAFE_INTEGER`). Value type: `number` (a non-negative safe integer).
- `percent`: optional inclusive `min` (default 0) and `max` (default 100), as Rationals in percent points (12.5 percent is `25/2`, not `1/8`). Value type: `Rational`.
- `select`: `options`, a non-empty list of unique option ids. Value type: the union of the option ids.
- `boolean`: no constraints. Value type: `boolean`.
- `money`: optional inclusive `min` (default `usd(0)`, never negative) and optional `max` (`Money`). Value type: `Money` (see `money`).

Identifier rules (checked at definition): calculator `id` matches `^[a-z][a-z0-9]*(-[a-z0-9]+)*$`; field keys, output keys, and warning codes match `^[a-z][A-Za-z0-9]*$`; `urlKey` matches `^[a-z][a-z0-9]{0,2}$` (one to three characters, so it can never collide with analytics parameters such as `utm_source` or `gclid`) and is not a reserved key (`v` for the URL version, `u` for the unit-system preference) nor a key listed in the calculator's `retiredUrlKeys`; option ids match `^[a-z0-9]+(-[a-z0-9]+)*$`.

A calculator MUST also declare an ordered, non-empty `outputs` list of descriptors `{ key, measure, role, display? }`:

- `measure`: a named dimension of `units-quantities` (`length`, `area`, `volume`, `mass`, `density`) or `money`.
- `role`: `primary` | `secondary` | `intermediate`; exactly one output MUST be `primary`.
- `display` (optional, advisory for the web layer; core never applies it in `compute`): `{ unit, format, denominator?, places? }` where `unit` is a unit of the output's dimension, `format` is `fraction` (only for `length`; requires `denominator` in 2..64) or `decimal` (requires `places` in 0..12). Money outputs MUST NOT declare `display`; they are always shown in cents (`toCents`).

A calculator MAY declare `warnings` (a list of warning codes) and `retiredUrlKeys` (URL keys of removed fields, which stay reserved forever).

#### Scenario: Descriptor metadata is queryable
- GIVEN the `fixture-box` calculator
- WHEN its `inputs` and `outputs` metadata are read
- THEN they list the six input descriptors and two output descriptors in the declared order with key, kind or measure, urlKey, default, role, display, and constraints, sufficient to render a form and to drive the URL codec without any other source

#### Scenario: Input type inference
- GIVEN the `fixture-box` definition
- WHEN a compute function receives its inputs
- THEN the inferred type is `{ len: Quantity<'length'>; cnt: number; pct: Rational; sel: 'x' | 'y'; flg: boolean; prc: Money }`
- AND reading a non-existent key, or comparing `sel` to `'z'`, is rejected by the typecheck gate
- AND the compute return type requires exactly the outputs `{ area: Quantity<'area'>; cost: Money }`

### Requirement: Definition-time validation

`defineCalculator({ id, inputs, outputs, warnings?, retiredUrlKeys?, compute })` MUST validate the definition eagerly and throw an error with code `INVALID_DEFINITION` and a machine-readable `reason` for each of: `INVALID_ID`, `INVALID_KEY` (field key, output key, or warning code), `INVALID_URL_KEY`, `RESERVED_URL_KEY` (`v`, `u`, or a retired key), `DUPLICATE_KEY`, `DUPLICATE_URL_KEY`, `NO_INPUTS`, `NO_OPTIONS`, `DUPLICATE_OPTION`, `INVALID_OPTION_ID`, `INVALID_UNIT` (a `defaultUnit` that is not `in`/`ft`/`yd`, or a `metricDefaultUnit` that is not `mm`/`cm`/`m`), `INVALID_BOUNDS` (min greater than max, or a negative money `min`), `DEFAULT_INVALID` (a default fails its own descriptor, including a select default not among the options), `NO_OUTPUTS`, `DUPLICATE_OUTPUT_KEY`, `PRIMARY_COUNT` (not exactly one `primary` output), `INVALID_DISPLAY`.

#### Scenario: Duplicate URL key
- GIVEN two descriptors both with `urlKey: 'a'`
- WHEN the calculator is defined
- THEN it throws `INVALID_DEFINITION` with reason `DUPLICATE_URL_KEY`

#### Scenario: Reserved URL keys
- GIVEN a descriptor with `urlKey: 'v'`, another definition with `urlKey: 'u'`, and a third whose `urlKey: 'q'` is listed in its `retiredUrlKeys`
- WHEN each is defined
- THEN each throws with reason `RESERVED_URL_KEY`

#### Scenario: Invalid default
- GIVEN a `count` descriptor with `min: 5`, `max: 10`, `default: 3`
- WHEN defined
- THEN it throws with reason `DEFAULT_INVALID`
- AND a `select` whose default is not in `options` throws the same reason

#### Scenario: Bad identifiers, units, and bounds
- GIVEN `id: 'Rect Area'`, a key `1abc`, a urlKey `abcd` (four characters), a length descriptor with `metricDefaultUnit: 'ft'`, a percent descriptor with `min: 50`, `max: 10`
- WHEN each is defined separately
- THEN the reasons are `INVALID_ID`, `INVALID_KEY`, `INVALID_URL_KEY`, `INVALID_UNIT`, `INVALID_BOUNDS`
- AND a urlKey `abc` (three characters) is accepted

#### Scenario: Output declarations
- GIVEN `outputs: []`; two outputs with key `area`; two `primary` outputs; an `area` output with `display: { unit: 'ft', format: 'decimal', places: 2 }`; a `length` output with `display: { unit: 'in', format: 'fraction', denominator: 65 }`
- WHEN each is defined separately
- THEN the reasons are `NO_OUTPUTS`, `DUPLICATE_OUTPUT_KEY`, `PRIMARY_COUNT`, `INVALID_DISPLAY`, `INVALID_DISPLAY`

#### Scenario: No inputs
- GIVEN `inputs: []`
- WHEN defined
- THEN it throws with reason `NO_INPUTS`

### Requirement: Total validation without silent coercion

`calculator.validate(raw, options?)` takes an untyped record (strings from forms, or already-typed values) and `options = { unitSystem?: 'imperial' | 'metric' }` (default `imperial`), and MUST return either `{ ok: true, value: Inputs }` or `{ ok: false, errors: FieldError[] }` (the core `Result` shape). A `FieldError` is `{ field: key, code, params? }`. Rules:

- A field whose key is absent from `raw`, or present with value `undefined`, takes its default. Keys in `raw` that are not declared MUST be ignored.
- Every declared field MUST be validated (no short-circuit); errors MUST be returned in declaration order, at most one per field. Any error means no value is returned.
- String raw values longer than 128 characters (before trimming) are `TOO_LONG`. String raw values for `length`, `count`, `percent`, `money` are then trimmed of `ws` (U+0020, U+0009, U+00A0); an empty result is `EMPTY`.
- `length`: raw string via `parseLength` with `defaultUnit` when the unit system is `imperial` and `metricDefaultUnit` when it is `metric`, or a `Quantity<'length'>`. Parser codes (`EMPTY`, `MALFORMED`, `DECIMAL_COMMA`, `ZERO_DENOMINATOR`, `UNKNOWN_UNIT`, `TOO_LONG`, `TOO_LARGE`) are reported as-is; then bounds: below `min` is `BELOW_MIN`, above `max` is `ABOVE_MAX`, with `params: { min }` / `{ max }` as the canonical Rational string of the bound in inches.
- `count`: raw string matching `^[0-9]+$` (leading zeros allowed) or a non-negative safe-integer `number`; a string containing a comma is `DECIMAL_COMMA`; any other string (sign, decimal point, trailing text) or number is `MALFORMED`; a value above `max` (including values above `Number.MAX_SAFE_INTEGER`) is `ABOVE_MAX` with no precision loss; below `min` is `BELOW_MIN`.
- `percent`: raw string `decimal` (per `exact-rational` `parseDecimal`) with one optional trailing `%` and no whitespace between; a comma is `DECIMAL_COMMA`, other failures are `MALFORMED`; bounds as above with `params` in percent points.
- `select`: exact, case-sensitive match to an option id; anything else (including non-strings) is `UNKNOWN_OPTION`.
- `boolean`: only the JavaScript booleans `true`/`false`; anything else (`"true"`, `1`, `null`) is `MALFORMED`.
- `money`: raw string via `parseMoney` (codes `EMPTY`, `MALFORMED`, `DECIMAL_COMMA`, `TOO_LARGE` as-is), or a `Money`; bounds as above with `params` in dollars.
- `null` for any non-select field is `MALFORMED`.
- `raw` itself MUST be an object. A non-object container, or a property getter that throws, is a programmer error and throws a `CoreError` with code `NOT_AN_OBJECT` for a non-object container (it is not a field error).
- Defaults are not re-validated against constraints at call time (they are validated at definition).

The full set of `FieldError` codes is: `EMPTY`, `MALFORMED`, `DECIMAL_COMMA`, `ZERO_DENOMINATOR`, `UNKNOWN_UNIT`, `TOO_LONG`, `TOO_LARGE`, `BELOW_MIN`, `ABOVE_MAX`, `UNKNOWN_OPTION`.

#### Scenario: Empty record yields defaults
- GIVEN `fixture-box` and `{}`
- WHEN validated
- THEN the value is `len = 12 in`, `cnt = 3`, `pct = 10`, `sel = 'x'`, `flg = false`, `prc = usd(249/50)`

#### Scenario: Full valid record
- GIVEN `{ len: "5' 3\"", cnt: "7", pct: "12.5%", sel: "y", flg: true, prc: "$5" }`
- WHEN validated
- THEN the value is `len = 63 in`, `cnt = 7`, `pct = 25/2`, `sel = 'y'`, `flg = true`, `prc = usd(5)`

#### Scenario: Count edge cases
- GIVEN `cnt` values `"abc"`, `"-1"`, `"1.5"`, `"12abc"`, `""`, `"007"`, `7`, `7.5`, `"101"`, `"9007199254740992"`, `null`, `"1,000"`, and a string of 129 `1` characters
- WHEN each is validated alone
- THEN the outcomes are `MALFORMED`, `MALFORMED`, `MALFORMED`, `MALFORMED`, `EMPTY`, value 7, value 7, `MALFORMED`, `ABOVE_MAX` with `max: "100"`, `ABOVE_MAX`, `MALFORMED`, `DECIMAL_COMMA`, `TOO_LONG`
- AND no input is ever silently turned into 0

#### Scenario: Length bounds are inclusive
- GIVEN `len` values `"-1"`, `"0"`, `"100'"`, `"1200"`, `"101'"`, `"1200 1/64"`
- WHEN validated
- THEN outcomes are `BELOW_MIN` with `min: "0"`, value 0 in, value 1200 in, value 1200 in, `ABOVE_MAX` with `max: "1200"` (1212 in), `ABOVE_MAX` (1200 + 1/64 in)

#### Scenario: Length parser errors surface
- GIVEN `len` values `"abc"`, `"1/0"`, `"5 furlongs"`, `""`, `"1,5"`
- WHEN validated
- THEN codes are `MALFORMED`, `ZERO_DENOMINATOR`, `UNKNOWN_UNIT`, `EMPTY`, `DECIMAL_COMMA`

#### Scenario: Metric input to a length field
- GIVEN `len = "1 m"` (5000/127 in, approx 39.37 in)
- WHEN validated against the fixture (max 1200 in)
- THEN the value is `5000/127 in` exactly

#### Scenario: Unit system selects the default unit for bare numbers
- GIVEN `len = "5"`
- WHEN validated with `unitSystem: 'imperial'` (or no options) and with `unitSystem: 'metric'`
- THEN the values are `5 in` and `250/127 in` (5 cm x 50/127 = 250/127, approx 1.9685 in)
- AND `len = "5'"` validated with `unitSystem: 'metric'` is `60 in` (an explicit unit always wins)

#### Scenario: Percent edge cases
- GIVEN `pct` values `"12.5%"`, `"12.5"`, `"-0"`, `"100"`, `"100.0001"`, `"12.5 %"`, `"abc"`, `"-1"`, `"12,5"`
- WHEN validated
- THEN outcomes are `25/2`, `25/2`, `0`, `100`, `ABOVE_MAX`, `MALFORMED`, `MALFORMED`, `BELOW_MIN`, `DECIMAL_COMMA`

#### Scenario: Money edge cases
- GIVEN `prc` values `"$4.98"`, `"4.987"`, `"1,000"`, `"-1"`, `"10000"`, `"10000.01"`, `""`, and the value `usd(-1)`
- WHEN validated
- THEN outcomes are `usd(249/50)`, `usd(4987/1000)`, `DECIMAL_COMMA`, `MALFORMED`, `usd(10000)`, `ABOVE_MAX` with `max: "10000"`, `EMPTY`, `BELOW_MIN` with `min: "0"`

#### Scenario: Select and boolean
- GIVEN `sel` values `"y"`, `"Y"`, `"z"`, `1`, and `flg` values `false`, `"true"`, `1`, `null`
- WHEN each is validated alone
- THEN `sel` outcomes are `'y'`, `UNKNOWN_OPTION`, `UNKNOWN_OPTION`, `UNKNOWN_OPTION`; `flg` outcomes are `false`, `MALFORMED`, `MALFORMED`, `MALFORMED`

#### Scenario: Multiple errors in declaration order
- GIVEN `{ cnt: "x", len: "abc", pct: "5" }`
- WHEN validated
- THEN the errors are `[ { field: 'len', code: 'MALFORMED' }, { field: 'cnt', code: 'MALFORMED' } ]` and no value is returned

#### Scenario: Unknown keys and undefined
- GIVEN `{ zzz: 1, len: undefined }`
- WHEN validated
- THEN the value equals all defaults and no error is reported

### Requirement: Pure, language-free compute

`compute(inputs)` MUST be a pure function of validated inputs: no clock, randomness, I/O, mutation of its input, or hidden state; two calls with equal inputs MUST return deeply equal results. `compute` returns:

- `outputs`: a record with exactly one entry per declared output key, whose value is a `Quantity` of the declared dimension or a `Money` when the measure is `money`.
- `shopping`: list of `{ materialId, purchaseUnit, qty }` where `qty` is a non-negative integer `bigint` obtained through `ceilToPurchaseUnits` (zero lines are allowed).
- `warnings`: list of `{ code, params }` where `code` is one of the declared warning codes and `params` values are numbers, booleans, or identifier/canonical-Rational strings.

`calculator.run(raw, options?)` MUST be `validate(raw, options)` followed by `compute`; when validation fails it MUST return `{ ok: false, errors }` and MUST NOT invoke `compute`. On success it returns `{ ok: true, value: { outputs, shopping, warnings } }` where `outputs` is the ordered list `{ key, role, value }` in output declaration order. A `compute` result violating the shape rules (a missing or undeclared output key, an output value of the wrong dimension or a quantity where money is declared, an undeclared warning code, a `qty` that is negative or not a `bigint`) MUST cause `run` to throw `INVALID_RESULT` (programming error, not a user error); the error carries a `reason` (`NOT_AN_OBJECT`, `OUTPUT_KEYS`, `OUTPUT_MEASURE`, `SHOPPING` or `WARNING`) and, as its `cause`, the calculator `id` and the output key or list index at fault.

Results MUST NOT contain display text, localized strings, units-as-labels, currency formatting, HTML, SVG, or any markup. This change defines no diagram field; any future diagram MUST be geometry data, not markup.

#### Scenario: Determinism and non-mutation
- GIVEN frozen validated inputs
- WHEN `compute` is called twice
- THEN both results are deeply equal and no exception about frozen objects is thrown

#### Scenario: Validation failure short-circuits compute
- GIVEN a spy installed as `compute`
- WHEN `run({ cnt: "x" })` is called
- THEN the result is `{ ok: false, errors: [ { field: 'cnt', code: 'MALFORMED' } ] }` and the spy was never called

#### Scenario: Ordered outputs
- GIVEN `fixture-box` whose compute returns `area = len x len` and `cost = multiplyCount(prc, cnt)`
- WHEN `run({})` is called
- THEN `outputs` is `[ { key: 'area', role: 'primary', value: 144 in2 }, { key: 'cost', role: 'secondary', value: usd(747/50) } ]` (12 x 12 = 144; 3 x 249/50 = 747/50)

#### Scenario: Result shape enforcement
- GIVEN a compute (reached through an untyped cast) that omits `cost`, or returns `area` as a length, or returns `cost` as a quantity, or emits warning `nope`, or returns a shopping line with `qty = -1n`
- WHEN `run({})` is called
- THEN each throws `INVALID_RESULT`

#### Scenario: Language-free results
- GIVEN any result produced by a calculator in the repository
- WHEN every string value in it is collected
- THEN each matches the identifier pattern `^[a-z][A-Za-z0-9._-]*$`, is a canonical Rational string, or is the currency code `USD`, and none contains whitespace, `<`, or `>`

### Requirement: Contract exposes no non-core dependencies

The contract MUST NOT depend on a schema library (zod or similar), the DOM, or i18n. A seam for adapting descriptors to external schemas MAY be added later and is out of scope.

#### Scenario: Core manifest
- GIVEN `packages/core/package.json` after this change
- WHEN dependencies are listed
- THEN no schema, validation, or fraction library is present
