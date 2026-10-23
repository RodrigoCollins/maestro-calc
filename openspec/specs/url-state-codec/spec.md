# url-state-codec

Package: `@maestro-calc/core`. Versioned encode/decode of calculator input state to and from URL query strings. Depends on `calculator-contract` and `money`. Implements PLAN.md §6.1 (shareable state in the URL).

Decision (resolved in the proposal question round): the URL contract is public and permanent from the first calculator. `v=1` allows evolution; keys are never reused or repurposed; a future `v=2` decoder MUST still read `v=1` links.

The codec operates on the query string only. The calculator id lives in the path (a web concern). Canonicalizing or redirecting parameterized URLs for SEO (PLAN.md §7.4) is out of scope.

URL values are state, not user input: length values are always canonical exact inches, whereas a bare number typed into a form uses the field's default unit for the active unit system. The decoder never applies a field's `defaultUnit` or `metricDefaultUnit`.

Scenarios use the `fixture-box` calculator defined in `calculator-contract` (urlKeys `a` len, `b` cnt, `c` pct, `d` sel, `e` flg, `f` prc; defaults `12 in`, `3`, `10`, `x`, `false`, `$4.98`; len in 0..1200 in; cnt 0..100; pct 0..100; prc in $0..$10000).

## Requirements

### Requirement: Encoding

`encode(calculator, state, options?)` with `options = { unitSystem?: 'imperial' | 'metric' }` (default `imperial`) MUST return a query string (no leading `?`) formed as follows:

1. First pair is always `v=1`.
2. If the unit system is `metric`, the next pair is `u=m`; the imperial preference is expressed by omitting `u`.
3. Then, in descriptor declaration order, one pair `urlKey=value` for each field whose value is NOT equal to its default. Equality is exact value equality (Rational equality for lengths, percents, and money), never string equality.
4. Fields equal to their default are omitted.
5. Values are serialized per kind:
   - `length`: the canonical exact Rational string of the length in inches (`toString` from `exact-rational`), without unit (for example `150`, `127/2`).
   - `count`: base-10 integer without sign or leading zeros.
   - `percent`: canonical Rational string in percent points (12.5 percent is `25/2`).
   - `select`: the option id.
   - `boolean`: `1` for true, `0` for false.
   - `money`: canonical Rational string of the amount in dollars (`$4.98` is `249/50`).
6. Pairs are joined with `&` by a custom serializer. Every canonical value uses only the characters `[0-9a-z/-]`, all of which are allowed unescaped in a query component (RFC 3986 §3.4 permits `/` in the query), so no percent-encoding is applied and `/` is emitted literally (shorter, readable links that survive messaging apps). `URLSearchParams` MUST NOT be used for encoding because it escapes `/` as `%2F`.

The encoder MUST be deterministic and MUST NOT emit unknown keys or the calculator id.

`encode` expects a validated state and checks only its shape: a state that is not an object MUST throw `CoreError('NOT_AN_OBJECT')`, and a field whose value is not of the kind of its descriptor (for example a number for a `length`, or an option id the descriptor does not declare) MUST throw `CoreError('INVALID_STATE')` with the reason `FIELD_VALUE` and the cause `{ id, field }` (the calculator id and the field key, identifiers only). A value of the right kind outside its bounds is not checked by `encode`: its text decodes back to the default of that field with `INVALID_VALUE`.

#### Scenario: All defaults
- GIVEN the default `fixture-box` state
- WHEN encoded
- THEN the result is `v=1`
- AND with `unitSystem: 'metric'` the result is `v=1&u=m`

#### Scenario: Single and combined fields
- GIVEN states differing from the default only in: `cnt = 7`; `pct = 25/2`; `flg = true`; `sel = 'y'`; `len = 63.5 in`; `prc = usd(37/100)`
- WHEN each is encoded
- THEN results are `v=1&b=7`, `v=1&c=25/2`, `v=1&e=1`, `v=1&d=y`, `v=1&a=127/2`, `v=1&f=37/100`
- AND the state with `len = 63.5 in`, `cnt = 7`, `pct = 25/2`, `sel = 'y'`, `flg = true`, `prc = usd(5)` encodes in declaration order as `v=1&a=127/2&b=7&c=25/2&d=y&e=1&f=5`

#### Scenario: Equal value, different spelling is omitted
- GIVEN `len = 1 ft` (12 in, equal to the default `12 in`)
- WHEN encoded
- THEN the result is `v=1`

#### Scenario: Metric input canonicalizes to inches
- GIVEN `len = 1 m` (5000/127 in) with `unitSystem: 'metric'`
- WHEN encoded
- THEN the result is `v=1&u=m&a=5000/127` (the unit-system preference does not change the inch representation)

#### Scenario: Zero and non-default boolean false
- GIVEN `len = 0 in` and, in a second state, a calculator whose boolean default is true with value false
- WHEN encoded
- THEN the first yields `v=1&a=0`, the second includes `e=0`

### Requirement: Decoding

`decode(calculator, query)` MUST accept a query string with or without a leading `?` and MUST NEVER throw. It returns `{ state, unitSystem, issues }` where `state` is a complete valid state, `unitSystem` is `imperial` or `metric`, and `issues` is a (possibly empty) list of diagnostics `{ code, key }` with `code` in `INVALID_VALUE` | `UNSUPPORTED_VERSION`. Rules:

- Splitting: pairs are separated by `&`; each pair splits at its first `=`; keys and values are percent-decoded; a malformed percent escape makes that value invalid. `+` has no special meaning. A literal `/` and `%2F` (or `%2f`) are equivalent.
- Version: a missing `v` is treated as version 1. `v=1` is version 1. Any other `v` value (for example `2`, `0`, `01`, `abc`, empty) MUST yield the all-defaults state, `unitSystem: 'imperial'`, and a single issue `{ code: 'UNSUPPORTED_VERSION', key: 'v' }`; no other key is interpreted.
- Unit system: `u=m` yields `metric`; an absent `u` yields `imperial`; any other `u` value yields `imperial` and an issue `{ code: 'INVALID_VALUE', key: 'u' }`. `u` never changes how field values are read.
- Unknown keys (including differently cased keys such as `A` and the noise common in analytics links) MUST be ignored silently and MUST NOT affect other fields.
- Duplicate keys (including `v` and `u`): the first occurrence wins; later duplicates are ignored without an issue.
- Absent fields take their defaults.
- Each present field value is read by a strict per-kind URL parser, then checked against the descriptor's bounds or options only (the same checks `validate` applies after parsing). The URL parsers are: `length`, `percent`, and `money` accept only the canonical Rational text grammar `-? digits ( "/" digits )?` (`Rational.fromString`; non-reduced forms such as `4/2` are normalized to `2`), with lengths in inches, percents in percent points, money in dollars; `count` accepts `^[0-9]+$`; `select` accepts an exact option id; `boolean` accepts only `1` or `0`. User-input forms such as `5'`, `63.5in`, `1 m`, `4.98`, or `$5` are NOT valid in URLs, and no default unit is ever applied.
- A present field whose value is invalid takes its default and yields `{ code: 'INVALID_VALUE', key: <urlKey> }`; other fields are unaffected. Invalid includes: empty value, wrong grammar, a raw (still percent-encoded) value longer than 256 characters, a malformed percent escape, zero denominator, out-of-range (below `min` or above `max`), unknown option id, boolean other than `1`/`0`.
- Issues are listed in query order.

#### Scenario: Round trip of a full state
- GIVEN the encoded query `v=1&a=127/2&b=7&c=25/2&d=y&e=1&f=5`
- WHEN decoded
- THEN the state is `len = 63.5 in`, `cnt = 7`, `pct = 12.5`, `sel = 'y'`, `flg = true`, `prc = usd(5)`, `unitSystem` is `imperial`, and `issues` is empty

#### Scenario: Missing version and empty query
- GIVEN `a=24` (no `v`), `?a=24`, `` (empty), and `v=1`
- WHEN decoded
- THEN states are `len = 24 in` with other defaults, the same, all defaults, and all defaults; `issues` empty in all four

#### Scenario: Encoded slash accepted
- GIVEN `v=1&a=127%2F2` and `v=1&a=127%2f2`
- WHEN decoded
- THEN both give `len = 63.5 in` with no issues

#### Scenario: Unit-system preference
- GIVEN `v=1&u=m&a=5`, `v=1&u=x`, and `v=1&u=m&u=i`
- WHEN decoded
- THEN the first gives `unitSystem: 'metric'` and `len = 5 in` (URL lengths are always inches, never centimetres); the second gives `imperial` with one `INVALID_VALUE` issue for `u`; the third gives `metric` (first wins) with no issues

#### Scenario: Unknown keys ignored
- GIVEN `utm_source=x&A=5&zz=1&v=1&b=7`
- WHEN decoded
- THEN `cnt = 7`, all else default, `issues` empty

#### Scenario: Invalid values default individually
- GIVEN `v=1&a=abc&b=101&c=-1&d=z&e=true&f=4.98`
- WHEN decoded
- THEN the state is all defaults and issues are `INVALID_VALUE` for keys `a`, `b`, `c`, `d`, `e`, `f` (in that order; `4.98` is a decimal, not canonical Rational text)
- AND `v=1&a=abc&b=7` decodes to `len = 12 in`, `cnt = 7` with one issue for `a`

#### Scenario: User-input spellings rejected
- GIVEN `v=1&a=5'`, `v=1&a=63.5in`, `v=1&f=$5`
- WHEN decoded
- THEN each field takes its default with one `INVALID_VALUE` issue

#### Scenario: Out-of-range and zero denominator
- GIVEN `v=1&a=-1`, `v=1&a=1201`, `v=1&a=1200`, `v=1&a=1/0`, `v=1&a=2401/2`, `v=1&f=-1`, `v=1&f=10001`
- WHEN decoded
- THEN `a=-1` (below min), `a=1201` (above 1200), `a=1/0`, `a=2401/2` (1200.5 > 1200), `f=-1` (below $0), and `f=10001` (above $10000) default with `INVALID_VALUE`; `a=1200` decodes to `1200 in` with no issue

#### Scenario: Non-canonical but valid values
- GIVEN `v=1&a=24/2&b=007&c=25/2&f=498/100`
- WHEN decoded
- THEN `len = 12 in`, `cnt = 7`, `pct = 12.5`, `prc = usd(249/50)`, no issues (`24/2` normalizes to `12`; `007` is valid; `498/100` normalizes to `249/50`)

#### Scenario: Empty, overlong, and malformed-escape values
- GIVEN `v=1&a=`, `v=1&a=` followed by 257 digits, and `v=1&a=1%zz`
- WHEN decoded
- THEN each defaults `len` with one `INVALID_VALUE` issue for `a`

#### Scenario: Duplicate keys
- GIVEN `v=1&b=5&b=7`
- WHEN decoded
- THEN `cnt = 5` and `issues` is empty

#### Scenario: Unsupported versions
- GIVEN `v=2&b=7`, `v=0&b=7`, `v=01&b=7`, `v=&b=7`, `v=abc&b=7`, `v=2&u=m`
- WHEN decoded
- THEN each yields all defaults (`cnt = 3`), `unitSystem: 'imperial'`, and exactly one issue `UNSUPPORTED_VERSION`

#### Scenario: Huge value within the length cap
- GIVEN a calculator whose length descriptor has no `max`, and `a=` followed by 200 `1` digits and `/3` (204 characters; the digit sum 200 is not a multiple of 3, so the fraction is already reduced)
- WHEN decoded and re-encoded
- THEN no error occurs, the value is preserved exactly, and re-encoding returns `v=1&a=` followed by the same 204 characters
- AND the same query written with `%2F3` decodes to the same value and re-encodes with a literal `/`

### Requirement: Round-trip properties

For every calculator, every valid state `x`, and every unit system `s`: `decode(encode(x, { unitSystem: s }))` MUST yield `state` equal to `x`, `unitSystem` equal to `s`, and empty `issues`. For every query string `q` (including arbitrary garbage): `encode(decode(q).state, { unitSystem: decode(q).unitSystem })` MUST be a fixed point of decode-then-encode (idempotent canonicalization) and `decode(q)` MUST NOT throw.

#### Scenario: Property-based round trip
- GIVEN at least 1,000 random valid `fixture-box` states per run, including negatives where permitted, zero, thirds, sub-cent money, values beyond 64-bit, and both unit systems
- WHEN encoded then decoded
- THEN the decoded state and unit system equal the originals with no issues

#### Scenario: Fuzzed queries never throw
- GIVEN random strings including `%`, `%zz`, `&&`, `=`, `+`, unicode, and long inputs
- WHEN decoded
- THEN no exception is thrown and the state is always valid for the descriptors

### Requirement: Key stability rules (public contract)

Once a calculator's URL keys are released (merged to `main`), the following MUST hold:

1. A `urlKey` MUST NOT be renamed, and MUST NOT change meaning or value grammar within a version.
2. A retired `urlKey` MUST NOT be reused for a different field; retired keys MUST be recorded in the calculator's `retiredUrlKeys` (definition-time `RESERVED_URL_KEY`). The decoder ignores them.
3. A field's default value MUST NOT change, because defaults are omitted from URLs and a changed default would silently alter the meaning of existing links. A new default requires a new field with a new key.
4. Select option ids MUST NOT be renamed. Adding options is allowed. Removing an option makes old links decode that field to its default with `INVALID_VALUE`.
5. Length values are always inches and money values are always dollars, in exact canonical Rational form; the unit of the URL representation MUST NOT change within a version.
6. New fields MAY be added in version 1 with new keys and defaults: links without them decode with the default.
7. Any incompatible change requires `v=2`; a `v=2` decoder MUST read all `v=1` links with identical meaning. `v` and `u` are reserved for every calculator.
8. A committed contract test MUST hold a literal snapshot, per released calculator, of the ordered tuples `{ calculatorId, key, urlKey, kind, default, options }` (with `default` written as its canonical URL value text and `options` present for `select` only), and MUST fail when any existing tuple is modified or removed, or a released calculator disappears; appending new fields or calculators is permitted. "Modified" follows rules 3 and 4: a changed key, `urlKey`, kind or default fails, adding an option to a `select` is allowed and removing one fails. A tuple marked `retired` (rules 2 and 3) is never removed from the snapshot: it MUST have its `urlKey` in the calculator's `retiredUrlKeys`, no input may carry that `urlKey` again, and the remaining (non-retired) tuples are matched to the inputs in order, so only appending is possible. The literal snapshot (`RELEASED`) lives in `packages/core/src/__testing__/released-snapshot.ts`, test support that the contract tests import: `packages/core/src/calculators/released.contract.test.ts` compares it with the calculators of core, `packages/core/src/url/released-harness.test.ts` tests the comparison itself (`url/released-harness.ts`) with hand-built calculators, and `apps/web/src/lib/released.contract.test.ts` proves that every calculator the site lists has its tuples in it.

Rationale for rule 3 (accepted tradeoff): omitting defaults keeps links short and stable, but it makes every released default part of the public contract. Retuning a default after release therefore requires a new field with a new `urlKey` (the old key is retired), which is accepted knowingly in exchange for short links.

#### Scenario: Registry guards existing keys
- GIVEN the committed snapshot entry for `rectangle-area` with `length -> l` and `width -> w`
- WHEN a change renames `l` to `len`
- THEN the contract test fails

#### Scenario: Default change rejected
- GIVEN a snapshot entry with `length` default `120` (inches)
- WHEN a change alters the default to `144`
- THEN the contract test fails

#### Scenario: Additive change allowed
- GIVEN a new optional field `h` with a default is appended to a released calculator and to its snapshot
- WHEN the contract test runs
- THEN it passes, and an old link without `h` decodes with the default
