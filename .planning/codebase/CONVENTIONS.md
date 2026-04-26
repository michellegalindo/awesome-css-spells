---
last_mapped: 2026-04-26
---

# Conventions

## Code Style

**Formatter:** Prettier `^3.8.3` (`.prettierrc`)
```json
{ "semi": true, "singleQuote": false, "tabWidth": 2, "trailingComma": "es5", "printWidth": 100 }
```

Run: `npm run format` (writes) or `npm run format:check` (CI-style).

**Excluded from Prettier** (`.prettierignore`): `node_modules`, lockfiles, `*.md`. Markdown is not auto-formatted.

**No code comments.** Code should be self-explanatory. One short line max only when the WHY is non-obvious.

**No tool signatures or credits** in code, comments, or UI.

## TypeScript / Node Conventions

- Runtime: Node 20+ (uses global `fetch`, `node:util parseArgs`, `node:fs`, `node:test`)
- CLI files: top-level `async function main()` guarded by `if (process.argv[1] === fileURLToPath(import.meta.url))`
- Errors: `console.error("Error: ...")` + `process.exit(1)` for fatal; `console.warn(...)` for recoverable
- No third-party runtime deps — only dev deps (`tsx`, `typescript`, `prettier`, `@types/node`)
- Exports: pure functions exported at module level; impure main() not exported
- Strict `node:assert/strict` in tests

## Browser JS Conventions

- ES modules with explicit `.js` extensions on imports
- Pure helpers → `app/assets/js/parse.js` (testable with `node:test`)
- Side-effectful DOM/network code → `app/assets/js/app.js` (intentionally not tested)
- No bundler, no transpile — targets evergreen browsers

## Curation Conventions (source of truth: `docs/conventions.md`)

**Mandatory link format:**
```
- [Resource Name](https://url) - Short practical description *(type)*
```

**Description rules:**
- Minimum 30 characters, more than 3 words, must not repeat the title
- Maximum 110 characters — rewrite concisely rather than truncate
- Must answer "What problem does this resource solve?"
- Poor descriptions auto-enriched from URL meta description (with warning)

**Type-tag allowlist (English):** `generator`, `framework`, `course`, `video`, `podcast`, `preprocessor`, `playground`, `tool`, `methodology`, `library`, `guide`, `reference`, `article`

**Type-tag allowlist (Portuguese):** `gerador`, `framework`, `curso`, `vídeo`, `podcast`, `pré-processador`, `playground`, `ferramenta`, `metodologia`, `biblioteca`, `guia`, `referência`, `artigo`

**Language routing:**
- `--lang en` → `README.md`
- `--lang pt-BR` → `README.pt-BR.md` (note: actual content lives at `pt-br/README.md` — path mismatch, see CONCERNS.md)
- No `--lang` → auto-detect from `Content-Language` header or `<html lang>` attribute
- Language is neither English nor Brazilian Portuguese → reject

**Curation constraints:**
- Never remove existing links
- Assign each resource to its single most useful category
- All type tags must match the allowlist
- Category names from the taxonomy in `docs/conventions.md` only

## Commit Message Style

- Semantic, English, imperative mood, max 72 characters
- Prefix: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`
- Examples from git log: `feat: back to top button (#6)`, `chore: create dependabot.yml`, `test: add unit tests with node:test (#5)`

## Branch Naming

- `feat/<description>` — new features
- `fix/<description>` — bug fixes
- `docs/<description>` — documentation changes

**Never work directly on `main`.** Create a branch before starting.

## Merge Strategy

Squash & Merge preferred.

## Two-Language Content Policy

This is the project's most distinctive convention:

- `README.md` — English only
- `pt-br/README.md` — Brazilian Portuguese only
- `index.html` — English only
- `pt-br/index.html` — Portuguese only (structurally derived from `index.html` via `app/sync_ptbr.ts`)
- `docs/` files — English
- Commit messages — English
- Code identifiers — English

Any structural change to `index.html` must be propagated to `pt-br/index.html` via the sync CLI, not by hand.
