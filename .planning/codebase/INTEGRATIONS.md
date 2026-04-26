# External Integrations

**Analysis Date:** 2026-04-26

## APIs & External Services

**GitHub REST API (unauthenticated):**
- `https://api.github.com/repos/michellegalindo/awesome-css/contributors?per_page=30&page=1` — Called from `app/assets/js/app.js:223-224` on page load to render the "Last Contributors" avatar list in the hero. No auth header is sent; subject to GitHub's anonymous rate limit (60 req/hour per IP).
- SDK/Client: native browser `fetch`
- Auth: none

**Arbitrary URL fetches (curator):**
- `app/add_readme_resource.ts:183` performs `fetch(link)` against whatever URL the curator was invoked with, to read the page HTML and extract:
  - `<meta name="description">` / `<meta property="og:description">` content via `extractMetaDescription` (`app/add_readme_resource.ts:119`)
  - The `<html lang="...">` attribute and the `Content-Language` response header via `detectLangFromResponse` (`app/add_readme_resource.ts:127`)
- SDK/Client: native Node.js `fetch`
- Auth: none — only public URLs are expected.

**CDN-hosted JS libraries (loaded by static pages):**
- `https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js` — Markdown renderer, referenced in `index.html:23` and `pt-br/index.html:23`.
- `https://cdnjs.cloudflare.com/ajax/libs/fuse.js/6.6.2/fuse.min.js` — Fuzzy search engine, referenced in `index.html:24` and `pt-br/index.html:24`.

**CDN-hosted fonts:**
- `https://fonts.googleapis.com/css2?family=JetBrains+Mono:...&family=Oswald:wght@500&display=swap` — Google Fonts stylesheet, referenced in `index.html:10-13` and `pt-br/index.html:10-13` with `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`.

**CDN-hosted images / badges:**
- `https://cdn.rawgit.com/sindresorhus/awesome/.../media/badge.svg` — Awesome badge, in `index.html:134` and `pt-br/index.html:137`.
- `https://img.shields.io/github/last-commit/michellegalindo/awesome-css` — Shields.io dynamic last-commit badge, in `index.html:140` and `pt-br/index.html:143`.
- `https://img.shields.io/badge/github-contribute-blue?logo=github` (English) and `https://img.shields.io/badge/github-contribua-blue?logo=github` (Portuguese) — Static contribute badges. The pt-BR variant is the only badge `app/sync_ptbr.ts` treats as a translatable slot (`contributeBadgeSrc`, `app/sync_ptbr.ts:66-74`).
- GitHub avatar URLs returned by the contributors API (`avatar_url` rendered with `&s=96` suffix at `app/assets/js/app.js:233`).

## Data Storage

**Databases:**
- None. The curated content is the markdown source itself (`README.md`, `pt-br/README.md`).

**File Storage:**
- Local filesystem only. The curator reads/writes `README.md` or `README.pt-BR.md` at the repo root using `node:fs` (`app/add_readme_resource.ts:2`, `:242`, `:284`). The pt-BR sync script reads/writes `index.html` and `pt-br/index.html` (`app/sync_ptbr.ts:8-9`).

**Caching:**
- Browser-side only — `localStorage` key `theme` for dark/light preference (`app/assets/js/app.js:17`, `:424`, `:430`).

## Authentication & Identity

**Auth Provider:**
- None. The site is fully public, anonymous browsing only. No login, no sessions, no cookies issued by app code.

## Monitoring & Observability

**Error Tracking:**
- None. Errors are logged with `console.error` / `console.warn` (e.g. `app/add_readme_resource.ts:109`, `:191`, `:210`; `app/assets/js/app.js:239`). No Sentry, Datadog, or similar SDK present.

**Logs:**
- Curator scripts use `console.log` / `console.warn` / `console.error` for human-readable terminal output. Browser code uses `console.error` only for the contributors-fetch failure path.
- No structured-logging library, no log shipping.

**Analytics:**
- None detected — no Google Analytics, Plausible, Fathom, or equivalent script loaded in `index.html` or `pt-br/index.html`.

## CI/CD & Deployment

**Hosting:**
- GitHub Pages, custom domain configured by `CNAME` (`awesome-css.com`).
- Deploy is implicit: pushing to `main` updates the published site. There is no build step.

**CI Pipeline:**
- No GitHub Actions workflows — the `.github/` directory contains only `dependabot.yml` and `pull_request_template.md`. No `.github/workflows/` directory exists.
- Tests (`npm test`), formatting (`npm run format:check`), and the pt-BR sync check (`tsx app/sync_ptbr.ts --check`) are run manually by contributors before opening a PR; nothing enforces them in CI.

**Dependency updates:**
- Dependabot configured at `.github/dependabot.yml`: weekly npm updates for the repo root (`package.json` and `package-lock.json`).

## Environment Configuration

**Required env vars:**
- None. No code in `app/`, `app/assets/`, `index.html`, or `pt-br/index.html` reads `process.env` or expects external secrets.

**Secrets location:**
- Not applicable — the project has no secrets. No `.env` files, no `secrets/`, no `*.key`/`*.pem` files.

## Webhooks & Callbacks

**Incoming:**
- None. There is no server, so no incoming HTTP endpoints exist.

**Outgoing:**
- None. The curator initiates outbound `fetch` calls (see "APIs & External Services") but does not POST to any webhook or callback URL.

## External Schemas / Conventions

- `sindresorhus/awesome` taxonomy — The repository follows the broader `awesome` listing convention; the badge in `index.html:132-137` links to `https://github.com/sindresorhus/awesome`.
- Curation taxonomy — Internal, defined in `docs/conventions.md` and enforced by `app/add_readme_resource.ts` (category list mirrored in `EN_TO_PT_CATEGORY`, `app/add_readme_resource.ts:30-53`; type list mirrored in `EN_TO_PT_TYPE`, `app/add_readme_resource.ts:14-28`).

## Domain & DNS

- Custom domain: `awesome-css.com` declared in `CNAME` (15 bytes, single line).
- DNS configuration is external to this repo (managed wherever the domain is registered); GitHub Pages reads `CNAME` to bind the deployment.

---

*Integration audit: 2026-04-26*
