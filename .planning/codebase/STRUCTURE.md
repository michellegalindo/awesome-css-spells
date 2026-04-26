---
last_mapped: 2026-04-26
---

# Structure

## Directory Layout

```
awesome-css/
├── README.md                         # English curated list (GitHub home + SPA data source)
├── CLAUDE.md                         # Claude Code project instructions
├── CONTRIBUTING.md                   # Contributor guide (English)
├── CODE-OF-CONDUCT.md
├── LICENSE                           # MIT
├── CNAME                             # GitHub Pages custom domain (awesome-css.com)
├── favicon.png
├── index.html                        # English SPA shell
├── package.json                      # npm scripts: curate, start, format, test
├── package-lock.json
├── .prettierrc                       # semi, double-quote, 2-space, trailingComma es5, width 100
├── .prettierignore                   # ignores node_modules, lockfiles, *.md
├── .gitignore                        # node_modules, .DS_Store
├── app/
│   ├── add_readme_resource.ts        # Curator CLI entry point
│   ├── add_readme_resource.test.ts   # node:test for curator
│   ├── sync_ptbr.ts                  # PT-BR structural sync CLI
│   ├── sync_ptbr.test.ts             # node:test for sync
│   └── assets/
│       ├── css/
│       │   └── style.css             # Single global stylesheet (~857 lines)
│       ├── images/
│       │   ├── awesome-css-logo-md.png
│       │   └── awesome-glasses.png
│       └── js/
│           ├── app.js                # SPA runtime (DOM, search, theme, back-to-top)
│           ├── parse.js              # Pure helpers (markdown → items, escape, highlight)
│           └── parse.test.js         # node:test for parse.js
├── pt-br/
│   ├── index.html                    # PT-BR SPA shell (paths prefixed with ../)
│   └── README.md                     # PT-BR curated list
├── docs/
│   └── conventions.md               # Canonical taxonomy, type-tag allowlist, link format
├── .github/
│   ├── dependabot.yml               # Weekly npm updates
│   └── pull_request_template.md     # Summary + Test plan checklist
├── .cursor/
│   ├── rules/
│   │   ├── curation.mdc
│   │   ├── curation-validation.mdc
│   │   └── language-standards.mdc
│   └── skills/
│       └── curator/
│           └── SKILL.md
├── .claude/
│   ├── settings.json
│   └── skills/
│       ├── curator/SKILL.md
│       └── sync-ptbr/SKILL.md
└── .planning/
    └── codebase/                     # GSD codebase mapping documents
```

## Key File Locations

| Purpose | Path |
|---|---|
| English SPA shell | `index.html` |
| PT-BR SPA shell | `pt-br/index.html` |
| English curated list | `README.md` |
| PT-BR curated list | `pt-br/README.md` |
| Curator CLI | `app/add_readme_resource.ts` |
| PT-BR sync CLI | `app/sync_ptbr.ts` |
| SPA runtime (impure) | `app/assets/js/app.js` |
| SPA helpers (pure, tested) | `app/assets/js/parse.js` |
| Global stylesheet | `app/assets/css/style.css` |
| Canonical taxonomy | `docs/conventions.md` |
| Project instructions (Claude) | `CLAUDE.md` |

## Naming Conventions

**Filenames:**
- TypeScript CLIs: `snake_case.ts` (`add_readme_resource.ts`, `sync_ptbr.ts`)
- TypeScript tests: `snake_case.test.ts` co-located with the module under test
- Browser modules: `lowercase.js` (`app.js`, `parse.js`); tests `*.test.js` co-located
- Markdown docs: `UPPERCASE.md` at root (`README.md`, `CONTRIBUTING.md`); `lowercase.md` inside `docs/`
- Cursor rules: `kebab-case.mdc`
- Skill manifests: `SKILL.md` inside `.claude/skills/<kebab-name>/` and `.cursor/skills/<kebab-name>/`

**README section headings:**
- H1 for top-level taxonomy: `Layout & Positioning`, `Animation & Visual Effects`, `UI & Components`, `Forms & UX Patterns`, `Responsive Design`, `Architecture`, `Modern CSS`, `Frameworks`, `Tooling`, `Performance & Optimization`, `Accessibility (a11y)`, `Learning & References`, `Inspiration`
- H2 for subsections under Architecture, Modern CSS, Frameworks, Tooling
- Title Case throughout; ampersands kept literally

**CSS/DOM classes (BEM-ish):**
- `__` for elements: `sidebar__header`, `entry__title`, `entry__desc`, `result__item`, `hero__left`, `hero__tagline`, `toc__item`
- `--` for modifiers: `icon-button--menu`, `icon-button--theme`, `toc__item--sub`
- IDs are `kebab-case` and used as JS handles: `#sidebar`, `#search`, `#content`, `#rendered`, `#back-to-top`, `#theme-toggle`, `#toc`

## Where to Add New Code

| Change needed | Where |
|---|---|
| New curated link | `npm run curate -- --link "..." --title "..."` — do **not** edit README by hand |
| New taxonomy category | `docs/conventions.md` → `inferEnCategory` (`app/add_readme_resource.ts:55-95`) → `EN_TO_PT_CATEGORY` (`:30-53`) → both READMEs |
| New type tag | `docs/conventions.md` → `EN_TO_PT_TYPE` (`app/add_readme_resource.ts:14-28`) |
| New CLI helper | New `app/snake_case.ts`, export pure functions, co-locate `app/<name>.test.ts` |
| New pure browser helper | `app/assets/js/parse.js` (or sibling module), co-locate `*.test.js` |
| New translatable region | Add to `index.html`, register slot in `app/sync_ptbr.ts:19-95`, add PT-BR value to `pt-br/index.html`, run `--check` |
| New shared style | Append to `app/assets/css/style.css` (no preprocessor split) |
| New project doc | `docs/` in English |
| New Claude skill | `.claude/skills/<kebab-name>/SKILL.md` |
| New Cursor rule | `.cursor/rules/<kebab-name>.mdc` with frontmatter |
