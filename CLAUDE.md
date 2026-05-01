# CLAUDE.md

## Project Overview

Awesome CSS is a curated list of CSS resources organized by problem solved. It maintains two parallel lists:

- `README.md` — English content only
- `pt-br/README.md` — Brazilian Portuguese content only

## Core Documentation

**Read `.github/PLAYBOOK.md` before making any curation changes.** It is the single source of truth for taxonomy, formatting rules, allowed type tags, and curation constraints.

## Language Standards

| File | Language |
|------|----------|
| `README.md` | English only |
| `pt-br/README.md` | Brazilian Portuguese only |
| `.github/*.md` | English |
| `CONTRIBUTING.md` | English |
| Commit messages | English |
| Code | English |

## Development Standards

- **Package manager:** use `npm` (package-lock.json exists)
- **Commits:** semantic, in English, imperative mood, max 72 chars (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- Run `npm run format` after changes to keep formatting consistent
