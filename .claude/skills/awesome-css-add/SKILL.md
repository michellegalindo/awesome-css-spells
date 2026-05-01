---
name: awesome-css-add
description: Add a CSS resource to the awesome-css curated list. Evaluates the link via css-expert, classifies it, and inserts it into the correct README. Only requires a URL.
---

# Auto-Tagger

## Purpose

Evaluate, classify, and insert a new CSS resource into the correct README. The evaluation step uses the `css-expert` agent to score the resource before insertion.

## Execution Steps

### Step 1 — Classify with css-expert

Fetch the URL content (use WebFetch), then spawn the `css-expert` agent with the following prompt:

```
Classify this CSS resource for inclusion in the awesome-css curated list.

URL: <url>
Page content: <fetched content>

Read `.github/PLAYBOOK.md` to get the full category list.

From the page content, infer:
- A curated title (not the raw <title> tag — make it clear and concise)
- The resource language (en or pt-BR)
- The exact category from PLAYBOOK.md
- The correct type tag (priority order from your instructions)
- A practical description (30–110 chars) answering "What problem does this resource solve?"

Apply rejection criteria from your instructions. Return the full output format.
```

### Step 2 — Act on the classification

If `Reject: yes` — stop. Show the reason. Do NOT insert.

If the user provided `--category`, `--tag`, or `--description` explicitly, use those values instead of the agent's suggestions.

### Step 3 — Insert via script

Run the script with the resolved parameters:

```bash
npx tsx scripts/add-resource/add_readme_resource.ts \
  --link "https://..." \
  --title "Resource Name" \
  --tag <tag> \
  --category "<Category>" \
  --description "<description>" \
  [--lang en]
```

Or via npm:

```bash
npm run add-resource -- \
  --link "https://..." \
  --title "Resource Name" \
  --tag <tag> \
  --category "<Category>" \
  --description "<description>" \
  [--lang en]
```

## Inputs

- Required: `--link` (only required input — everything else is resolved by css-expert)
- Optional: `--title` (overrides css-expert suggestion)
- Optional: `--tag` (overrides css-expert suggestion)
- Optional: `--category` (English name; overrides css-expert suggestion)
- Optional: `--description` (overrides css-expert suggestion)
- Optional: `--lang` (`en` or `pt-BR`; if omitted, detected from the target URL)

## Script behavior

If `--description` is too short (< 30 chars), ≤ 3 words, or repeats the title, the script enriches it from the URL's meta description and prints a warning.
If description exceeds 110 characters, the script exits with an error — rewrite it and re-run with `--description "rewritten version"`.
If the detected language is neither `en` nor `pt-BR`, insertion is rejected.

## Policy references

- Curation policy and taxonomy: `.github/PLAYBOOK.md`
- Full project instructions: `CLAUDE.md`
