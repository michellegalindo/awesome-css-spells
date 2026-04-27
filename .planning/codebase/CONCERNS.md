---
last_mapped: 2026-04-26
---

# Concerns

## CRITICAL

### `npm run add-resource` script path (resolved)
**File:** `package.json:6`
**Severity:** Resolved — `add-resource` now points to `tsx scripts/add-resource/add_readme_resource.ts`.

### PT-BR curator path mismatch
**File:** `app/add_readme_resource.ts:9-12`
**Severity:** High — running the curator with `--lang pt-BR` writes to a file the SPA never reads.

`README_BY_LANG["pt-BR"]` resolves to `README.pt-BR.md` at the repo root. The actual PT-BR content the SPA fetches lives at `pt-br/README.md`. Running `npx tsx app/add_readme_resource.ts --lang pt-BR ...` would create/edit a `README.pt-BR.md` that `pt-br/index.html` never loads.

**Fix:** Change `"pt-BR": "README.pt-BR.md"` to `"pt-BR": "pt-br/README.md"` in `README_BY_LANG`.

## HIGH

### `back-to-top` aria-label not in sync slot
**Files:** `index.html:176-191`, `pt-br/index.html:180-195`, `app/sync_ptbr.ts:19-95`
**Severity:** High — sync overwrites the PT-BR translation of the button's `aria-label`.

The back-to-top button (added in commit `da399a3`) has `aria-label="Voltar ao topo"` in `pt-br/index.html`. No slot in `SLOTS` captures it. Any `sync_ptbr.ts` run that touches that element region will overwrite the translation with the English value.

**Fix:** Register a `backToTopLabel` slot in `app/sync_ptbr.ts:19-95`.

### No GitHub Actions CI
**File:** `.github/` (no `workflows/` directory)
**Severity:** High — tests, format checks, and lint never run automatically on PRs.

`dependabot.yml` and `pull_request_template.md` exist but there is no CI workflow. PRs can merge with failing tests or format violations.

**Fix:** Add `.github/workflows/ci.yml` that runs `npm test` and `npm run format:check` on push/PR.

### Unpinned CDN dependencies
**Files:** `index.html`, `pt-br/index.html`
**Severity:** High — the site breaks entirely if cdnjs serves a different version or goes down.

`marked@9.1.6` and `fuse.js@6.6.2` are loaded from cdnjs at runtime without SRI hashes. A supply chain compromise or CDN outage silently breaks rendering and search.

**Fix:** Add `integrity` + `crossorigin` attributes (SRI) to both `<script>` tags, or self-host the libraries under `app/assets/js/`.

## MEDIUM

### SSRF / malicious content via URL fetch
**File:** `app/add_readme_resource.ts:183-211`
**Severity:** Medium — the curator fetches arbitrary user-supplied URLs.

`fetch(link)` is called on the raw `--link` argument with no protocol restriction, no domain allowlist, and no redirect limit. An attacker running the CLI locally could supply a `file://` or internal network URL. Response HTML is not sanitized before regex-extracting the description — oversized or pathological HTML could cause excessive memory use.

**Mitigations already in place:** None. This is a local dev tool so blast radius is the developer's machine.

### Markdown injection via title/description
**File:** `app/add_readme_resource.ts:279`
**Severity:** Medium — user-supplied `--title` and `--description` are interpolated into README without escaping.

`const newEntry = \`\n- [${title}](${link}) - ${description} *(${type})*\``. A `--title` containing `](...` would corrupt the markdown link format; a `--description` with backticks could escape the bullet context. No validation strips brackets, parentheses, or backtick characters.

### index.html / pt-br/index.html drift
**Severity:** Medium — structural changes accumulate silently between sync runs.

Contributors who edit `pt-br/index.html` by hand for non-slot content (inline styles, new DOM nodes, script tags) will have their changes overwritten on the next sync. The `sync-ptbr` Claude skill exists precisely because drift has occurred; the slot system is the intended mitigation but requires discipline to maintain.

### Hard-coded repo owner in SPA
**File:** `app/assets/js/app.js:223-225`
**Severity:** Medium — forks show the original repo's contributors.

`https://api.github.com/repos/michellegalindo/awesome-css/contributors` is hard-coded. Any fork or rename breaks the contributors section without a visible error (request silently returns 404 or wrong data).

## LOW

### Unauthenticated GitHub API call
**File:** `app/assets/js/app.js:221-243`
**Severity:** Low — rate-limited to ~60 req/h per IP.

The contributors API call has no auth token. Under high traffic or shared IP environments (corporate NAT, school networks), GitHub returns 403/429 and the contributors list disappears silently.

### No coverage instrumentation
**File:** `package.json:11`
**Severity:** Low — coverage gaps are invisible.

`tsx --test` does not produce a coverage report. The intentional gap (`app.js` untested) is documented, but accidental gaps in the tested modules aren't measurable.

### `inferEnCategory` keyword matching is order-sensitive
**File:** `app/add_readme_resource.ts:55-95`
**Severity:** Low — category inference can produce wrong results for ambiguous titles.

The keyword chain is an if-else ladder with no scoring. A title like "Framework for generating layouts" matches `Layout & Positioning` because `grid/flexbox/layout` is checked before `generator`. The `Learning & References` fallback silently accepts anything that doesn't match.

### TODOs / FIXMEs

None found in source files as of 2026-04-26.

### Accidental files

`.DS_Store` is listed in `.gitignore` and not tracked. No accidental files observed.
