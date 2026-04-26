---
last_mapped: 2026-04-26
---

# Architecture

## Pattern

Static awesome-list content repo + small TypeScript curation/sync toolchain + thin client-side SPA renderer.

No build step, no bundler. Browser code is plain ES modules; CLI code runs via `tsx` without a `tsc` compile step.

## Layers

| Layer | Files | Responsibility |
|---|---|---|
| Curator/Sync (Node) | `app/add_readme_resource.ts`, `app/sync_ptbr.ts` | Mutate content files deterministically from CLI args |
| Content | `README.md`, `pt-br/README.md` | Authoritative curated data consumed by curator (write) and SPA (read) |
| Static shell | `index.html`, `pt-br/index.html` | DOM skeleton, CDN deps, font preconnects, inline theme bootstrap |
| Runtime SPA | `app/assets/js/app.js`, `app/assets/js/parse.js` | Fetch README, render markdown, power search/TOC/theme/back-to-top |
| Skills/Rules | `.claude/skills/`, `.cursor/rules/`, `docs/conventions.md` | Agent and contributor guidance; canonical taxonomy |

## Entry Points

- `index.html` — English SPA (served via `npm start` / GitHub Pages at `awesome-css.com`)
- `pt-br/index.html` — Brazilian Portuguese SPA
- `app/add_readme_resource.ts` — curator CLI (`npx tsx app/add_readme_resource.ts ...`)
- `app/sync_ptbr.ts` — PT-BR structural sync CLI (`npx tsx app/sync_ptbr.ts [--check|--dry-run]`)
- `npm test` — runs `tsx --test app/**/*.test.ts app/**/*.test.js`

## Data Flow — Adding a New Resource

`app/add_readme_resource.ts:144` (`main`)

1. `parseArgs` reads `--link`, `--title`, `--description`, `--type`, `--category`, `--lang`, `--description-from-internet`.
2. Validate `--link` required; `--lang` ∈ `{en, pt-BR}` or absent.
3. If fetch enabled and lang/description missing/poor: `fetch(link)` → `extractMetaDescription` (`:119-125`) → `detectLangFromResponse` (`:127-142`).
4. `validateDescriptionLength` enforces 110-char ceiling (`:107-117`).
5. Category resolved via `--category` or `inferEnCategory(title + desc)` keyword matcher with `Learning & References` fallback (`:55-95`).
6. For `pt-BR`: translate type via `EN_TO_PT_TYPE` and category via `EN_TO_PT_CATEGORY` (`:14-53`).
7. Target file via `README_BY_LANG` — `en → README.md`, `pt-BR → README.pt-BR.md` (`:9-12`). **Note: actual PT-BR content lives at `pt-br/README.md`; this is a path mismatch — see CONCERNS.md.**
8. Locate category heading by regex, find next heading as section end, find last `^- [` bullet, insert after it (`:241-282`).
9. `writeFileSync` and log.

## Data Flow — Syncing PT-BR Shell

`app/sync_ptbr.ts` (`run`)

1. Read `index.html` and `pt-br/index.html`.
2. `extractSlots` pulls 16 named regex-defined slots (htmlLang, title, h1SrOnly, statsInner, topbarLinksInner, tagline, loadingText, errorInner, langsMobileFull, logoLinkHref, searchPlaceholder, contributeBadgeSrc, glassesSrc, heroH2Inner, blockquoteInner, contributorsLabel).
3. Warn on slots missing in pt-BR or whose PT-BR text equals English.
4. `applySlots(enHtml, ptBrSlots)` rewrites slot regions; `adjustPaths` prefixes relative `href`/`src` with `../`.
5. Normalize both files through `npx prettier --write` via a temp file before diffing.
6. `lineDiff` produces 1-based diffs; `--check` exits 1, `--dry-run` prints only, default writes `pt-br/index.html`.

## Data Flow — SPA Render

Entry: `<script type="module" src="app/assets/js/app.js">` (`index.html:25`)

1. `init()` builds base URL from `location.href` and `fetch`es sibling `README.md`.
2. `processMarkdown` calls `sliceContent` (skips "Awesome CSS" / "Summary" / "Sumário" preamble), then `marked.parse`.
3. Post-process rewrites external links (`target="_blank"`), converts `</a> - ` to `<br>`, converts italic tags to `.reference-tag`, reorganizes each `<li>` into `entry__title` / `entry__desc` / `reference-tag`.
4. H1/H2 demoted to H2/H3; slug ids assigned; `buildTOC()` renders `#toc`; `IntersectionObserver` highlights active section.
5. `extractItems(md)` parses raw markdown into `{title, url, desc, tag, section}`; `buildFuse()` indexes with weights `title 0.5 / desc 0.35 / section 0.15`.
6. Search drives Fuse and renders `#results` using `escapeHtml` + `highlight`.
7. Side-effects: `loadContributors()` hits `https://api.github.com/repos/michellegalindo/awesome-css/contributors`; `initConfetti()`; mobile menu toggle; back-to-top (400px threshold, scroll-direction-aware); theme toggle persists to `localStorage["theme"]`.

## Key Abstractions

- **Translation slot** (`Slot = { extract: RegExp, apply: (html, val) => html }`) — `app/sync_ptbr.ts:14-95`. Adding a new translatable region = one entry in `SLOTS` + re-run `--check`.
- **Curated entry record** `{ title, url, desc, tag, section }` — `app/assets/js/parse.js:31-58`. Contract: bullet regex `^[-*]\s+\[([^\]]+)\]\(([^)]+)\)(.*)` + optional `*(tag)*`.
- **Category mapping tables** `EN_TO_PT_TYPE`, `EN_TO_PT_CATEGORY` — `app/add_readme_resource.ts:14-53`. `Record<string, string>`; missing keys fall back to English value.

## Architectural Constraints

- No bundler/transpile for browser code — ES modules, evergreen browsers only.
- Two parallel content streams: `index.html` structural changes must be mirrored to `pt-br/index.html` via `sync_ptbr.ts`; taxonomy changes in `docs/conventions.md` must be mirrored in `EN_TO_PT_CATEGORY`.
- CDN deps (`marked@9.1.6`, `fuse.js@6.6.2`) are unpinned at runtime — site breaks if cdnjs URLs go down.
- Unauthenticated GitHub API for contributors (~60 req/h per IP).
- README schema enforced by regex — non-conforming bullets are silently dropped from search.
- Global state in `app.js`: module-level `allItems`, `fuse`, `lastScrollY`, and ~15 DOM handles. Initialization is top-level, not gated by an init function.

## Error Handling

- CLI: `console.error` + `process.exit(1)` for fatal errors; fetch failures demoted to `console.warn`.
- SPA README fetch failure: `if (!res.ok) return;` — leaves `#loading`/`#error` in initial state.
- SPA contributors fetch failure: caught, logged via `console.error("[contributors]", e)`.

## Anti-Patterns to Avoid

- Editing `pt-br/index.html` by hand for structural changes — next `sync_ptbr.ts` run overwrites them. Add a slot instead.
- Inserting README entries by hand — easy to miss format/length/tag rules; bad bullets vanish from search.
- Adding pure logic to `app.js` — belongs in `parse.js` to get `node:test` coverage.
