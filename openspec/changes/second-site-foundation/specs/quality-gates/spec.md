# Delta for quality-gates

## ADDED Requirements

### Requirement: Byte-identical Maestro Calc build on refactor branches

A pull request whose head branch starts with `refactor/` MUST leave the built `apps/web/dist` byte-identical to the build of its base commit. A CI job MUST build both commits, fingerprint each `dist` (every file's repository-relative path and SHA-256, sorted by path) and fail on any difference, printing it. Pull requests on other branches MUST NOT run the job.

#### Scenario: Shared code moves without changing the site
- GIVEN a pull request from `refactor/<name>` that moves code into a shared package
- WHEN CI runs
- THEN the `dist-identical` job builds the base and the head and passes when the fingerprints are equal

#### Scenario: An unintended change is caught
- GIVEN a pull request from `refactor/<name>` whose head changes one byte of one built page
- WHEN CI runs
- THEN the job fails and its log names that file

#### Scenario: Fingerprint is deterministic
- GIVEN the same directory fingerprinted twice
- WHEN `node scripts/dist-fingerprint.mjs <dir>` runs
- THEN both outputs are equal, one line per file, sorted by path, and a missing directory exits non-zero
