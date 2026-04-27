# Technology Stack

**Analysis Date:** 2026-04-26

## Languages

**Primary:**
- TypeScript ^6.0.3 — Curator and pt-BR sync scripts in `app/add_readme_resource.ts`, `app/sync_ptbr.ts` and their `*.test.ts` files
- JavaScript (ES modules) — Browser runtime in `app/assets/js/app.js`, `app/assets/js/parse.js`, `app/assets/js/parse.test.js`
- HTML5 — Static landing pages `index.html` (English) and `pt-br/index.html` (Brazilian Portuguese)
- CSS3 — Stylesheet `app/assets/css/style.css`

**Secondary:**
- Markdown — Curated content lives in `README.md`, `pt-br/README.md`, `docs/conventions.md`, `CONTRIBUTING.md`, `CODE-OF-CONDUCT.md`
- YAML — `.github/dependabot.yml`
- JSON — `package.json`, `package-lock.json`, `.prettierrc`, `.claude/settings.json`

## Runtime

**Environment:**
- Node.js — Required by `tsx`, `prettier`, and the built-in `node:test` runner. Sub-dependency `@esbuild/*` engines declare `node: >=18` in `package-lock.json`, so Node 18+ is the effective floor.
- Browser — `index.html` and `pt-br/index.html` are loaded directly by GitHub Pages and execute `app/assets/js/app.js` as an ES module.

**Package Manager:**
- npm (declared in `CLAUDE.md` as the canonical manager)
- Lockfile: `package-lock.json` present (lockfileVersion 3)
- No `.nvmrc` or `engines` field in `package.json`

## Frameworks

**Core (build/dev):**
- None on the application side — `index.html` and `pt-br/index.html` are hand-written static pages with no bundler, transpiler, or framework.
- TypeScript ^6.0.3 — Type checking for the curator scripts; types are stripped at runtime by `tsx`.

**Testing:**
- `node:test` (built-in) — Used by all test files: `app/add_readme_resource.test.ts`, `app/sync_ptbr.test.ts`, `app/assets/js/parse.test.js`. Run via `tsx --test` (see `npm test` script in `package.json:10`).
- `node:assert/strict` — Assertion API used inside the tests.

**Build/Dev:**
- `tsx` ^4.21.0 — Runs TypeScript files (and the test suite) without a compile step. Invoked by `npm run add-resource` and `npm test` in `package.json:6,10`.
- `prettier` ^3.8.3 — Formatting for `**/*.{js,ts,html,css}`. Config in `.prettierrc`, ignore list in `.prettierignore`.
- `npx serve .` — Local static-file server invoked by `npm start` (`package.json:7`); `serve` is not declared as a dependency and is fetched on demand.

## Key Dependencies

**Critical (declared in `package.json`):**
- `tsx` ^4.21.0 (devDependency) — Required to execute the curator script and run tests; everything in `npm run add-resource` and `npm test` flows through it.
- `typescript` ^6.0.3 (devDependency) — Provides the TS compiler/types consumed by `tsx` and editor tooling.
- `@types/node` ^25.6.0 (devDependency) — Type definitions for the Node.js APIs used in `app/*.ts` (`node:util`, `node:fs`, `node:path`, `node:url`, `node:test`, `node:assert/strict`, `child_process`).
- `prettier` ^3.8.3 (devDependency) — Code formatter; also invoked via `npx prettier --write` from `app/sync_ptbr.ts:138` to format generated HTML.

**Browser (loaded from CDN, NOT in `package.json`):**
- `marked` 9.1.6 — Markdown rendering, loaded from `https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.6/marked.min.js` in `index.html:23` and `pt-br/index.html:23`.
- `Fuse.js` 6.6.2 — Fuzzy search over README entries, loaded from `https://cdnjs.cloudflare.com/ajax/libs/fuse.js/6.6.2/fuse.min.js` in `index.html:24` and `pt-br/index.html:24`. Consumed in `app/assets/js/app.js:151` (`new Fuse(...)`).

**Infrastructure:**
- No runtime dependencies — `package.json` has zero entries under `dependencies`. The Node-side codebase only uses the standard library plus the dev tooling above.

## Configuration

**Environment:**
- No `.env*` files exist in the repo.
- No environment variables are read by `app/add_readme_resource.ts`, `app/sync_ptbr.ts`, or `app/assets/js/app.js`.
- Theme preference is persisted client-side via `localStorage` (`app/assets/js/app.js:17`, `:424`, `:430`).

**Build:**
- `package.json` scripts (`package.json:5-11`):
  - `add-resource` → `tsx scripts/add-resource/add_readme_resource.ts`
  - `start` → `npx serve .`
  - `format` → `prettier --write "**/*.{js,ts,html,css}"`
  - `format:check` → `prettier --check "**/*.{js,ts,html,css}"`
  - `test` → `tsx --test app/**/*.test.ts app/**/*.test.js`
- `.prettierrc`: `semi: true`, `singleQuote: false`, `tabWidth: 2`, `trailingComma: "es5"`, `printWidth: 100`.
- `.prettierignore`: ignores `node_modules`, `yarn.lock`, `package-lock.json`, `*.md`.
- No `tsconfig.json`, no `eslint` config, no bundler config (`vite`, `webpack`, `esbuild` config, etc.).

## Platform Requirements

**Development:**
- Node.js (>=18 implied by transitive deps) and npm.
- Internet access to `npx serve` and to fetch resource metadata via the curator (`app/add_readme_resource.ts:183`) and contributors via `app/assets/js/app.js:223`.
- macOS/Linux/Windows — no platform-specific code; only standard `node:*` APIs and a single `execSync("npx prettier ...")` shell-out in `app/sync_ptbr.ts:138`.

**Production:**
- GitHub Pages, served from the repository root with the custom domain `awesome-css.com` (declared in `CNAME`).
- Runtime in production is the visitor's browser — there is no server-side execution. README content is fetched at runtime from the same origin (`app/assets/js/app.js:8`).

---

*Stack analysis: 2026-04-26*
