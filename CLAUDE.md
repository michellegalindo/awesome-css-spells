# CLAUDE.md

This file provides instructions for Claude Code when working in the **awesome-css** repository.

## Project Overview

Awesome CSS is a curated list of CSS resources organized by problem solved, not by resource type. It maintains two parallel lists:

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

## Curation Policy

### Language Routing

1. `--lang en` → insert into `README.md`
2. `--lang pt-BR` → insert into `pt-br/README.md`
3. No `--lang` → detect from URL `lang` HTML attribute or `Content-Language` header
4. Language is neither English nor Brazilian Portuguese → **reject insertion**

### Link Format (Mandatory)

```
- [Resource Name](https://url) - Short practical description *(type)*
```

Descriptions must answer "What problem does this resource solve?" and be between 30 and 110 characters.

### Description Rules

- **Minimum:** 30 characters, more than 3 words, must not repeat the title
- **Maximum:** 110 characters — if exceeded, rewrite concisely and re-run
- If too short or generic, the script auto-enriches it from the URL's meta description and prints a warning

### Curation Constraints

- **Never remove existing links**
- Assign each resource to its single most useful category
- All type tags must match the allowed list in `.github/PLAYBOOK.md`

## Auto-Tagger Script

To insert a new resource into the correct README category, run:

```bash
npm run add-resource \
  -- \
  --link "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" \
  --title "A Complete Guide to Flexbox" \
  --tag guide \
  --category "Layout & Positioning" \
  --description "Visual reference covering all flexbox properties with examples" \
  --lang en
```

The `--` separates npm arguments from script arguments. `--description` and `--lang` are optional.

### Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--link` | yes | — | URL of the resource |
| `--title` | yes | — | Curated title (do not copy-paste from page `<title>`) |
| `--tag` | yes | — | Type tag; see allowed values in `.github/PLAYBOOK.md` |
| `--category` | yes | — | English category name from the taxonomy in `.github/PLAYBOOK.md` |
| `--description` | no | fetched from URL | Short practical description |
| `--lang` | no | auto-detected | `en` or `pt-BR` |

## Validation Checklist

Before editing `README.md` or `pt-br/README.md`:

- [ ] Content language matches the target file
- [ ] Description is 30–110 characters, practical, not just a restatement of the title
- [ ] Link follows the mandatory format with description and type tag
- [ ] Type tag is from the allowed list in `.github/PLAYBOOK.md`
- [ ] Resource is genuinely useful, CSS-related, no spam or ads
- [ ] Category matches the taxonomy in `.github/PLAYBOOK.md`
- [ ] No existing link has been removed

## Development Standards

- **Package manager:** use `npm` (package-lock.json exists)
- **Branches:** never work directly on `main`; create a branch before starting (`feat/`, `fix/`, `docs/`, etc.)
- **Commits:** semantic, in English, imperative mood, max 72 chars (`feat:`, `fix:`, `docs:`, `chore:`, etc.)
- **Merge:** Squash & Merge preferred
- **No code comments** — code should be self-explanatory
- **No tool signatures or credits** in code, comments, or UI
- Run `npm run format` after changes to keep formatting consistent
