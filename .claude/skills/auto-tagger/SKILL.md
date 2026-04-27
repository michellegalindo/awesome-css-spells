---
name: auto-tagger
description: Automatically classify a link into the correct Awesome CSS category and apply the right type tag, then insert it into the README. Use when the user provides a URL and wants it categorized and tagged automatically.
---

# Auto-Tagger

## Purpose

Classify a new resource into the correct category, apply the appropriate type tag, and insert the formatted link into the correct README (`README.md` for English, `pt-br/README.md` for Portuguese).

## Inputs

- Required: `--link`
- Required: `--title` (use a curated title, not copy-paste from the page `<title>`)
- Required: `--tag` (see allowed values in `.github/PLAYBOOK.md`)
- Required: `--category` (English category name from the taxonomy — mapped automatically for pt-BR)
- Optional: `--description`
- Optional: `--lang` (`en` or `pt-BR`; if omitted, the script detects the language from the target URL)
- Optional: `--description-from-internet` (default `true`)

If `--description` is not provided, the tool fetches one from the target URL's meta tags.
If `--description` is provided but is too short (< 30 chars), has 3 words or fewer, or just repeats the title, the tool automatically enriches it using the URL's meta description and prints a warning showing both the original and the enriched version.
If the description exceeds **110 characters** (whether provided or fetched from the URL), the script exits with an error showing the full text. When this happens, **rewrite the description yourself** — keep it practical, answer "What problem does this resource solve?", and re-run with `--description "your rewritten version"`.
If `--lang` is not provided, the script reads the HTML `lang` attribute and `Content-Language` header to determine the language.
If the detected language is neither English (`en`) nor Brazilian Portuguese (`pt-BR`), the insertion is rejected.

Resources in English are inserted into `README.md`; resources in Portuguese are inserted into `pt-br/README.md`.

## How to run

```bash
npx tsx scripts/add-resource/add_readme_resource.ts \
  --link "https://..." \
  --title "Resource Name" \
  --tag guide \
  --category "Layout & Positioning" \
  [--description "Short practical description"] \
  [--lang en]
```

Or via npm:

```bash
npm run add-resource -- --link "https://..." --title "Resource Name" --tag guide --category "Layout & Positioning" [--lang en]
```

## Policy references

- Curation policy and taxonomy: `.github/PLAYBOOK.md`
- Full project instructions: `CLAUDE.md`
