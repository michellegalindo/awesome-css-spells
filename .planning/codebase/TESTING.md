---
last_mapped: 2026-04-26
---

# Testing

## Framework

**`node:test`** (built-in Node.js test runner) + **`node:assert/strict`**. No third-party test runner. Added in commit `3855cdd` ("test: add unit tests with node:test").

## How to Run

```bash
npm test
# runs: tsx --test app/**/*.test.ts app/**/*.test.js
```

No watch mode configured. No coverage reporter configured.

## Test Files

| File | Module under test | Scope |
|---|---|---|
| `app/add_readme_resource.test.ts` | `app/add_readme_resource.ts` | Pure exports only |
| `app/sync_ptbr.test.ts` | `app/sync_ptbr.ts` | Pure exports only |
| `app/assets/js/parse.test.js` | `app/assets/js/parse.js` | Pure helpers |

All test files are co-located with the module they test.

## What Is Covered

**`app/add_readme_resource.test.ts`** (16 tests):
- `inferEnCategory` — keyword → category mapping, fallback to `Learning & References`
- `isDescriptionPoor` — short text, ≤3 words, description equals title
- `extractMetaDescription` — `name="description"`, reversed attr order, `og:description`, missing meta, newline stripping
- `detectLangFromResponse` — `content-language` header priority, HTML lang fallback, unknown language returns null

**`app/sync_ptbr.test.ts`** (8 tests):
- `extractSlots` — reads `htmlLang`, `title`, `tagline`, `searchPlaceholder`
- `applySlots` — slot replacement, no-op on empty slots, round-trip stability
- `adjustPaths` — prefixes relative paths with `../`, leaves absolute/anchor/parent paths untouched
- `lineDiff` — identical strings, differing lines with 1-based numbering, missing/extra lines

**`app/assets/js/parse.test.js`** (covered via `parse.js` exports):
- `sliceContent`, `escapeHtml`, `highlight`, `extractItems`

## What Is NOT Covered

- `app/assets/js/app.js` — intentionally untested (DOM-heavy, side-effectful; pure logic was extracted to `parse.js`)
- `main()` in `app/add_readme_resource.ts` — CLI integration path (argv parsing, file I/O, fetch) has no tests
- `run()` in `app/sync_ptbr.ts` — orchestration logic (file read/write, prettier shelling out) has no tests
- End-to-end: no test actually runs the curator CLI against a real README file
- No GitHub Actions CI yet (`.github/` has only `dependabot.yml` and PR template)

## Mocking

None. Tests use only in-memory string inputs; no filesystem mocks, no `fetch` mocks, no `Headers` polyfill — `Headers` is available globally in Node 18+ so `detectLangFromResponse` tests construct real `Headers` objects.

## Coverage

No coverage instrumentation configured. `tsx --test` does not produce a coverage report by default.
