---
name: curator
description: Automatically append a README link resource into the correct Awesome CSS category. Use when the user provides a URL and description and wants the link inserted in the right section.
---

# Curate README Link

## Purpose

Insert a new resource into `README.md` in the most likely category from the provided link and description, following the project curation format.

## Inputs

- Required: `--link`
- Optional: `--description`
- Optional: `--title`
- Optional: `--type` (default `guide`)
- Optional: `--category` (override classification)
- Optional: `--description-from-internet` (default `true`)

If `--description` is not provided, the tool attempts to infer one from the target URL.
If inference is not confident, it can still insert with a best-effort description and request a manual description.

## How to run

```bash
npx tsx .cursor/skills/curator/scripts/add_readme_resource.ts --link "https://..." [--description "Short practical description"] [--title "Resource Name"] [--type guide] [--category "Modern CSS / Nesting"]
```

## Policy references

- Curation policy: `.cursor/rules/curation.mdc`
- Validation checklist: `.cursor/rules/curation-validation.mdc`

## Validation behavior

- Keep input requirements and allowed `--type` values aligned with `.cursor/rules/curation.mdc`.
- Category inference and fallback behavior are implemented in `.cursor/skills/curator/scripts/add_readme_resource.ts`.
- Keep this file focused on execution; do not duplicate taxonomy or tag rules here.
