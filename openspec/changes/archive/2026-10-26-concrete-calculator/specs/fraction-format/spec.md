# Delta for fraction-format

Package: `@maestro-calc/core`. Two forgiving spellings of lengths that people type on a phone, found in the G3 review (REL-5). Scenario prefix FPX (next free id: FPX1).

## MODIFIED Requirements

### Requirement: Length text grammar

Everything in the existing requirement holds, with these two additions to the lexical rules. The canonical result, the error codes and the URL contract do not change.

- A word feet mark (`ft`, `foot`, `feet`) that directly follows a number (no whitespace) and is glued to digits (`ft6`) that are followed, with optional whitespace in between, by an inch mark (`in`, `inch`, `inches`, `"`, `″`, `”`) that is not itself followed by a letter or digit, is read as the feet mark and the inches digits: `12ft6in` is `12 ft 6 in`. Any other `ft`, `m` or `yd` word with trailing digits (`ft2`, `5ft2`, `m2`, `yd3`) stays an unknown unit.
- A period glued to a unit word (`ft.`, `in.`, `m.`) is an abbreviation mark and is ignored, whatever follows it: `12 ft. 6 in.` is `12 ft 6 in`, `12 ft.6 in.` is the same, and `5 m.` is `5 m`. A decimal point never follows a unit word, so no valid text changes its meaning; a second period (`5 ft..`) is still a decimal point with no digits.

#### Scenario: [FPX1] Glued feet and inches
- GIVEN `12ft6in`, `12ft6 in`, `12ft 6in`, `12FT6IN` and `12ft6"`
- WHEN each is parsed
- THEN each is exactly 150 inches, the same quantity as `12 ft 6 in`

#### Scenario: [FPX2] Abbreviation periods
- GIVEN `12 ft. 6 in.`, `12 ft.6 in.`, `5 in.` and `5 m.`
- WHEN each is parsed
- THEN they are 150 in, 150 in, 5 in and 5 m

#### Scenario: [FPX3] Unchanged failures
- GIVEN `5ft2`, `5 ft2 in`, `12ft6inx`, `5 in.5` and `5 ft..`
- WHEN each is parsed
- THEN `5ft2` and `5 ft2 in` fail `UNKNOWN_UNIT`, and `12ft6inx` fails `UNKNOWN_UNIT`, and `5 in.5` and `5 ft..` fail `MALFORMED`
